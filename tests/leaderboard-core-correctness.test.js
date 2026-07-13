import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  docs: new Map(),
  transactionCalls: 0,
  failNextTransaction: false,
  authCalls: 0,
  db: { name: 'test-db' }
}))

vi.mock('../src/services/firebase.js', () => ({
  ensureAuthenticated: vi.fn(async () => {
    state.authCalls++
    return { uid: 'stable-user' }
  }),
  getFirebaseState: () => ({ db: state.db, firebaseInitialized: true })
}))

function snapshot(path) {
  const data = state.docs.get(path)
  return { id: path.split('/').at(-1), exists: () => data !== undefined, data: () => structuredClone(data) }
}

const firestore = vi.hoisted(() => ({
  doc: vi.fn((_db, ...parts) => ({ path: parts.join('/') })),
  collection: vi.fn((_db, ...parts) => ({ path: parts.join('/') })),
  serverTimestamp: vi.fn(() => 'SERVER_TIME'),
  runTransaction: vi.fn(async (_db, callback) => {
    state.transactionCalls++
    const staged = []
    const transaction = {
      get: async ref => snapshot(ref.path),
      set: (ref, data, options) => staged.push({ operation: 'set', path: ref.path, data, options }),
      update: (ref, data) => staged.push({ operation: 'update', path: ref.path, data })
    }
    const result = await callback(transaction)
    if (state.failNextTransaction) {
      state.failNextTransaction = false
      throw Object.assign(new Error('offline'), { code: 'unavailable' })
    }
    for (const write of staged) {
      const existing = state.docs.get(write.path) || {}
      if (write.operation === 'update' && !state.docs.has(write.path)) throw new Error('missing document')
      state.docs.set(write.path, write.options?.merge || write.operation === 'update' ? { ...existing, ...write.data } : { ...write.data })
    }
    return result
  }),
  query: vi.fn((...args) => args),
  orderBy: vi.fn((...args) => args),
  limit: vi.fn(value => value),
  getDocs: vi.fn()
}))

vi.mock('firebase/firestore', () => firestore)

class MemoryStorage {
  constructor() { this.values = new Map() }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
  clear() { this.values.clear() }
}

const storage = new MemoryStorage()

async function enableLeaderboard() {
  const privacy = await import('../src/services/privacyConsent.js')
  privacy.updateConsent('leaderboard', true)
}

async function freshService() {
  vi.resetModules()
  await enableLeaderboard()
  return (await import('../src/services/leaderboardService.js')).default
}

beforeEach(() => {
  state.docs.clear()
  state.transactionCalls = 0
  state.failNextTransaction = false
  state.authCalls = 0
  storage.clear()
  globalThis.localStorage = storage
  globalThis.window = { dispatchEvent: vi.fn() }
  globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init?.detail } }
  vi.clearAllMocks()
})

describe('local leaderboard periods', () => {
  it.each([
    [new Date(2023, 0, 1, 12), '2022-W52'],
    [new Date(2023, 0, 2, 12), '2023-W01'],
    [new Date(2020, 11, 31, 12), '2020-W53'],
    [new Date(2021, 0, 1, 12), '2020-W53'],
    [new Date(2021, 0, 4, 12), '2021-W01']
  ])('uses the correct ISO week-year for %s', async (date, expected) => {
    const { getLocalIsoWeekBucket } = await import('../src/services/leaderboardService.js')
    expect(getLocalIsoWeekBucket(date)).toBe(expected)
  })

  it('uses the local calendar day instead of the UTC day', async () => {
    const { getLocalDateBucket } = await import('../src/services/leaderboardService.js')
    const local = new Date(2026, 6, 13, 0, 5)
    expect(getLocalDateBucket(local)).toBe('2026-07-13')
  })
})

describe('atomic and idempotent score synchronization', () => {
  it('commits user, daily, weekly and event guard as one transaction', async () => {
    const service = await freshService()
    const result = await service.submitScore({
      eventId: 'quiz-1', score: 80, correct: 8, total: 10, accuracy: 80,
      timeTaken: 12000, quizId: 'daily-1', mode: 'daily'
    })

    expect(result).toMatchObject({ ok: true, eventId: 'quiz-1' })
    expect(state.docs.get('users/stable-user')).toMatchObject({ totalScore: 80, quizzesTaken: 1, lastEventId: 'quiz-1' })
    const daily = [...state.docs.entries()].find(([key]) => key.startsWith('leaderboards/daily/'))[1]
    const weekly = [...state.docs.entries()].find(([key]) => key.startsWith('leaderboards/weekly/'))[1]
    expect(daily).toMatchObject({ score: 80, correct: 8, total: 10, quizzesTaken: 1, lastEventId: 'quiz-1' })
    expect(weekly).toMatchObject({ totalScore: 80, quizzesTaken: 1, lastEventId: 'quiz-1' })
    expect(state.docs.get('users/stable-user/events/quiz-1')).toMatchObject({ kind: 'quiz', points: 80 })
  })

  it('keeps a failed event durably queued and retries it exactly once', async () => {
    const service = await freshService()
    await service.initUser()
    state.failNextTransaction = true

    const first = await service.submitActivity({ eventId: 'activity-1', points: 5, type: 'dua_read', description: 'Dua read' })
    expect(first).toMatchObject({ ok: false, queued: true, eventId: 'activity-1' })
    expect(JSON.parse(storage.getItem('leaderboard_outbox_v1'))).toHaveLength(1)
    expect(state.docs.get('users/stable-user').totalScore).toBe(0)

    await service.flushOutbox()
    await service.flushOutbox()
    expect(JSON.parse(storage.getItem('leaderboard_outbox_v1'))).toHaveLength(0)
    expect(state.docs.get('users/stable-user').totalScore).toBe(5)
    expect(state.docs.get('users/stable-user/events/activity-1')).toBeTruthy()
  })

  it('does not double count a repeated event ID', async () => {
    const service = await freshService()
    const activity = { eventId: 'same-event', points: 10, type: 'bookmark_created', description: 'Bookmark' }
    await Promise.all([service.submitActivity(activity), service.submitActivity(activity)])
    await service.submitActivity(activity)
    expect(state.docs.get('users/stable-user').totalScore).toBe(10)
    expect(state.docs.get('users/stable-user').quizzesTaken).toBe(0)
  })

  it('discards a tampered outbox record without writing aggregates or blocking later events', async () => {
    const service = await freshService()
    await service.initUser()
    storage.setItem('leaderboard_outbox_v1', JSON.stringify([{
      eventId: 'tampered', kind: 'activity', points: 999999999,
      activityType: '../admin', dailyBucket: 'not-a-date', weeklyBucket: 'bad'
    }]))
    await expect(service.flushOutbox()).resolves.toMatchObject({ ok: true })
    expect(JSON.parse(storage.getItem('leaderboard_outbox_v1'))).toEqual([])
    expect(state.docs.get('users/stable-user').totalScore).toBe(0)

    await service.submitActivity({ eventId: 'valid-after-tamper', points: 5, type: 'dua_read' })
    expect(state.docs.get('users/stable-user').totalScore).toBe(5)
  })

  it('serializes concurrent first writes without overwriting either event', async () => {
    const service = await freshService()
    await Promise.all([
      service.submitActivity({ eventId: 'first', points: 5, type: 'dua_read' }),
      service.submitActivity({ eventId: 'second', points: 10, type: 'bookmark_created' })
    ])
    expect(state.docs.get('users/stable-user').totalScore).toBe(15)
    expect(state.docs.has('users/stable-user/events/first')).toBe(true)
    expect(state.docs.has('users/stable-user/events/second')).toBe(true)
    expect(state.authCalls).toBe(1)
  })
})

describe('validation and profile consistency', () => {
  it('rejects malformed or unbounded client score payloads before writing', async () => {
    const service = await freshService()
    await expect(service.submitScore({ score: Infinity, correct: 1, total: 1, accuracy: 100 }))
      .resolves.toMatchObject({ ok: false, code: 'invalid-payload' })
    await expect(service.submitScore({ score: 10, correct: 2, total: 1, accuracy: 100 }))
      .resolves.toMatchObject({ ok: false, code: 'invalid-payload' })
    expect(state.transactionCalls).toBe(0)
  })

  it('updates current aggregate usernames atomically and rolls local state back on failure', async () => {
    const service = await freshService()
    await service.submitActivity({ eventId: 'seed', points: 5, type: 'dua_read' })
    const previous = storage.getItem('username')
    state.failNextTransaction = true
    await expect(service.updateUsername('NewName')).resolves.toMatchObject({ ok: false })
    expect(storage.getItem('username')).toBe(previous)

    await expect(service.updateUsername('NewName')).resolves.toMatchObject({ ok: true })
    expect(state.docs.get('users/stable-user').username).toBe('NewName')
    const aggregateNames = [...state.docs.entries()]
      .filter(([key]) => key.startsWith('leaderboards/'))
      .map(([, value]) => value.username)
    expect(aggregateNames).toEqual(['NewName', 'NewName'])
  })

  it('syncs the locally derived level with score events', async () => {
    storage.setItem('gamification', JSON.stringify({ points: 1250 }))
    const service = await freshService()
    await service.submitActivity({ eventId: 'level-event', points: 5, type: 'dua_read' })
    expect(state.docs.get('users/stable-user').level).toBe(3)
  })

  it('surfaces backend read failures instead of presenting them as an empty leaderboard', async () => {
    const service = await freshService()
    await service.initUser()
    firestore.getDocs.mockRejectedValueOnce(Object.assign(new Error('rules denied'), { code: 'permission-denied' }))
    await expect(service.getAllTimeLeaderboard()).rejects.toMatchObject({
      name: 'LeaderboardError',
      code: 'permission-denied'
    })
  })
})
