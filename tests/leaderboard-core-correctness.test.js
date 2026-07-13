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
  getDoc: vi.fn(async ref => snapshot(ref.path)),
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

  it('reconciles a legacy daily score into weekly and all-time exactly once', async () => {
    const { getLocalDateBucket, getLocalIsoWeekBucket } = await import('../src/services/leaderboardService.js')
    const now = new Date()
    const day = getLocalDateBucket(now)
    const week = getLocalIsoWeekBucket(now)
    state.docs.set(`leaderboards/daily/${day}/stable-user`, {
      userId: 'stable-user', username: 'WiseSeeker123', score: 75,
      activityPoints: 75, correct: 0, total: 0, quizzesTaken: 0
    })

    let service = await freshService()
    await service.initUser()
    expect(state.docs.get('users/stable-user').totalScore).toBe(75)
    expect(state.docs.get(`leaderboards/weekly/${week}/stable-user`).totalScore).toBe(75)
    expect(state.docs.get(`leaderboards/weekly/${week}/stable-user`).activityPoints).toBe(0)
    expect(state.docs.get(`leaderboards/daily/${day}/stable-user`).score).toBe(75)
    expect(state.docs.get(`leaderboards/daily/${day}/stable-user`).lastEventId).toBe(`legacy_daily_${day}`)
    expect(state.docs.has(`users/stable-user/events/legacy_daily_${day}`)).toBe(true)

    service = await freshService()
    await service.initUser()
    expect(state.docs.get('users/stable-user').totalScore).toBe(75)
    expect(state.docs.get(`leaderboards/weekly/${week}/stable-user`).totalScore).toBe(75)
    expect(state.docs.get(`users/stable-user/events/legacy_daily_${day}`)).toEqual({
      eventId: `legacy_daily_${day}`, userId: 'stable-user', kind: 'legacy_daily',
      points: 75, dailyBucket: day, weeklyBucket: week, createdAt: 'SERVER_TIME'
    })
  })

  it('finalizes a daily marker created by the earlier migration release without recounting', async () => {
    const { getLocalDateBucket, getLocalIsoWeekBucket } = await import('../src/services/leaderboardService.js')
    const now = new Date()
    const day = getLocalDateBucket(now)
    const week = getLocalIsoWeekBucket(now)
    const eventId = `legacy_daily_${day}`
    storage.setItem('username', 'Existing Name')
    state.docs.set('users/stable-user', {
      username: 'Existing Name', totalScore: 75, quizzesTaken: 0,
      level: 1, createdAt: 'OLD_TIME', lastActive: 'OLD_TIME', lastEventId: eventId
    })
    state.docs.set(`leaderboards/daily/${day}/stable-user`, {
      userId: 'stable-user', username: 'Existing Name', score: 75
    })
    state.docs.set(`leaderboards/weekly/${week}/stable-user`, {
      userId: 'stable-user', username: 'Existing Name', totalScore: 75,
      activityPoints: 0, quizzesTaken: 0, bestScore: 0,
      timestamp: 'OLD_TIME', lastEventId: eventId
    })
    state.docs.set(`users/stable-user/events/${eventId}`, {
      eventId, userId: 'stable-user', kind: 'legacy_daily', points: 75,
      dailyBucket: day, weeklyBucket: week, createdAt: 'OLD_TIME'
    })

    const service = await freshService()
    await service.initUser()
    expect(state.docs.get('users/stable-user').totalScore).toBe(75)
    expect(state.docs.get(`leaderboards/weekly/${week}/stable-user`).totalScore).toBe(75)
    expect(state.docs.get(`leaderboards/daily/${day}/stable-user`)).toMatchObject({
      score: 75, lastEventId: eventId
    })
  })

  it('reconciles every legacy day in the current ISO week', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 15, 12)) // Wednesday
    try {
      state.docs.set('leaderboards/daily/2026-07-13/stable-user', {
        userId: 'stable-user', username: 'WiseSeeker123', score: 20
      })
      state.docs.set('leaderboards/daily/2026-07-14/stable-user', {
        userId: 'stable-user', username: 'WiseSeeker123', score: 30
      })
      const service = await freshService()
      await service.initUser()
      expect(state.docs.get('users/stable-user').totalScore).toBe(50)
      expect(state.docs.get('leaderboards/weekly/2026-W29/stable-user').totalScore).toBe(50)
    } finally {
      vi.useRealTimers()
    }
  })

  it('starts all seven bounded legacy reads concurrently', async () => {
    let releaseReads
    const readGate = new Promise(resolve => { releaseReads = resolve })
    let startedReads = 0
    firestore.getDoc.mockImplementation(async ref => {
      startedReads++
      await readGate
      return snapshot(ref.path)
    })

    const service = await freshService()
    const initialization = service.initUser()
    await vi.waitFor(() => expect(startedReads).toBe(7))
    releaseReads()
    await initialization
    expect(firestore.getDoc).toHaveBeenCalledTimes(7)
  })

  it('reconciles legacy totals before draining a queued current-day event', async () => {
    const { getLocalDateBucket, getLocalIsoWeekBucket } = await import('../src/services/leaderboardService.js')
    const now = new Date()
    const day = getLocalDateBucket(now)
    const week = getLocalIsoWeekBucket(now)
    state.docs.set(`leaderboards/daily/${day}/stable-user`, {
      userId: 'stable-user', username: 'WiseSeeker123', score: 75,
      correct: 0, total: 0, quizzesTaken: 0
    })
    storage.setItem('leaderboard_outbox_v1', JSON.stringify([{
      eventId: 'queued-after-upgrade', kind: 'activity', points: 5,
      activityType: 'dua_read', description: '', dailyBucket: day,
      weeklyBucket: week, queuedAt: now.toISOString()
    }]))

    const service = await freshService()
    await service.initUser()
    expect(state.docs.get('users/stable-user').totalScore).toBe(80)
    expect(state.docs.get(`leaderboards/weekly/${week}/stable-user`).totalScore).toBe(80)
    expect(state.docs.get(`leaderboards/daily/${day}/stable-user`).score).toBe(80)
  })

  it('canonicalizes a legacy quiz row when a new event arrives', async () => {
    const { getLocalDateBucket, getLocalIsoWeekBucket } = await import('../src/services/leaderboardService.js')
    const now = new Date()
    const day = getLocalDateBucket(now)
    const week = getLocalIsoWeekBucket(now)
    state.docs.set(`leaderboards/daily/${day}/stable-user`, {
      userId: 'stable-user', username: 'WiseSeeker123', score: 40,
      correct: 4, total: 5, quizzesTaken: 1, accuracy: 80,
      timeTaken: 1000, quizId: 'old', mode: 'daily'
    })
    storage.setItem('username', 'WiseSeeker123')
    const service = await freshService()
    await service.initUser()
    await service.submitActivity({ eventId: 'new-activity', type: 'dua_read', points: 5 })
    expect(state.docs.get(`leaderboards/daily/${day}/stable-user`)).toEqual({
      userId: 'stable-user', username: 'WiseSeeker123', score: 45,
      activityPoints: 5, correct: 4, total: 5, quizzesTaken: 1,
      bestScore: 0, bestAccuracy: 0, timestamp: 'SERVER_TIME', lastEventId: 'new-activity'
    })
    expect(state.docs.get(`leaderboards/weekly/${week}/stable-user`).totalScore).toBe(45)
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
  it('validates and stores a human-selected Unicode display name', async () => {
    const { normalizeDisplayName, saveChosenDisplayName, isGeneratedUsername } = await import('../src/services/leaderboardService.js')
    expect(normalizeDisplayName('  عبد   الله  ')).toBe('عبد الله')
    expect(saveChosenDisplayName('Amina  Noor')).toBe('Amina Noor')
    expect(storage.getItem('leaderboard_name_chosen_v1')).toBe('true')
    expect(isGeneratedUsername('WiseSeeker470')).toBe(true)
    expect(isGeneratedUsername('Amina Noor')).toBe(false)
    expect(() => normalizeDisplayName('<script>')).toThrow(/may contain/)
  })

  it('uses an existing server profile name instead of replacing it with a new local random name', async () => {
    state.docs.set('users/stable-user', {
      username: 'Existing Name', totalScore: 10, quizzesTaken: 0,
      level: 1, createdAt: 'OLD_TIME', lastActive: 'OLD_TIME'
    })
    const service = await freshService()
    const user = await service.initUser()
    expect(user.username).toBe('Existing Name')
    expect(storage.getItem('username')).toBe('Existing Name')
    expect(state.docs.get('users/stable-user').username).toBe('Existing Name')
  })

  it('syncs an explicitly chosen onboarding name over an existing generated profile', async () => {
    storage.setItem('username', 'Amina Noor')
    storage.setItem('leaderboard_name_chosen_v1', 'true')
    state.docs.set('users/stable-user', {
      username: 'WiseSeeker470', totalScore: 10, quizzesTaken: 0,
      level: 1, createdAt: 'OLD_TIME', lastActive: 'OLD_TIME'
    })
    const service = await freshService()
    const user = await service.initUser()
    expect(user).toMatchObject({ username: 'Amina Noor', needsUsername: false })
    expect(state.docs.get('users/stable-user').username).toBe('Amina Noor')
  })

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

  it('hides unreconciled legacy daily rows while preserving reconciled scores and ranks', async () => {
    const service = await freshService()
    await service.initUser()
    firestore.getDocs.mockResolvedValueOnce({
      forEach(callback) {
        callback({
          id: 'legacy-user',
          data: () => ({ userId: 'legacy-user', username: 'Old App', score: 100 })
        })
        callback({
          id: 'stable-user',
          data: () => ({ userId: 'stable-user', username: 'Current User', score: 80, lastEventId: 'evt-current' })
        })
        callback({
          id: 'other-current',
          data: () => ({ userId: 'other-current', username: 'Other User', score: 60, lastEventId: 'legacy_daily_2026-07-13' })
        })
      }
    })

    await expect(service.getDailyLeaderboard()).resolves.toEqual([
      expect.objectContaining({ userId: 'stable-user', score: 80, rank: 1, isCurrentUser: true }),
      expect.objectContaining({ userId: 'other-current', score: 60, rank: 2 })
    ])
  })

  it('omits zero-score legacy profiles from all-time rankings', async () => {
    const service = await freshService()
    await service.initUser()
    firestore.getDocs.mockResolvedValueOnce({
      forEach(callback) {
        callback({ id: 'zero-user', data: () => ({ username: 'Random123', totalScore: 0 }) })
        callback({ id: 'scored-user', data: () => ({ username: 'Ahmed', totalScore: 20, quizzesTaken: 0, level: 1 }) })
      }
    })
    await expect(service.getAllTimeLeaderboard()).resolves.toEqual([
      expect.objectContaining({ userId: 'scored-user', username: 'Ahmed', totalScore: 20, rank: 1 })
    ])
  })
})
