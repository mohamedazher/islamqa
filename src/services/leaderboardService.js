import { ensureAuthenticated, getFirebaseState } from './firebase'
import { isLeaderboardEnabled } from './privacyConsent'

const OUTBOX_KEY = 'leaderboard_outbox_v1'
const MAX_OUTBOX_EVENTS = 500
const MAX_POINTS = 1000000
const MAX_QUIZ_QUESTIONS = 100
const MAX_STRING_LENGTH = 160
const ACTIVITY_POINT_RULES = {
  question_read: [5],
  bookmark_created: [10],
  quiz_streak: [100],
  welcome_back: [50],
  achievement: [25, 50, 100, 150, 200, 250, 300, 1000],
  dua_read: [5],
  morning_adhkar: [20],
  evening_adhkar: [20],
  adhkar_streak: [30],
  both_adhkar: [25]
}

let firestoreApiPromise = null

async function ensureFirestoreApi() {
  if (!firestoreApiPromise) firestoreApiPromise = import('firebase/firestore')
  return firestoreApiPromise
}

export class LeaderboardError extends Error {
  constructor(code, message, cause = null) {
    super(message)
    this.name = 'LeaderboardError'
    this.code = code
    this.cause = cause
  }
}

export function getLocalDateBucket(date = new Date()) {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) throw new LeaderboardError('invalid-date', 'Invalid leaderboard date')
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

// ISO-8601 week based on the user's local calendar date. Converting the local
// Y/M/D to a UTC-only working date avoids DST changing the week calculation.
export function getLocalIsoWeekBucket(date = new Date()) {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) throw new LeaderboardError('invalid-date', 'Invalid leaderboard date')
  const working = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()))
  const day = working.getUTCDay() || 7
  working.setUTCDate(working.getUTCDate() + 4 - day)
  const isoYear = working.getUTCFullYear()
  const yearStart = new Date(Date.UTC(isoYear, 0, 1))
  const week = Math.ceil((((working - yearStart) / 86400000) + 1) / 7)
  return `${isoYear}-W${String(week).padStart(2, '0')}`
}

function finiteInteger(value, field, { min = 0, max = MAX_POINTS } = {}) {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < min || value > max) {
    throw new LeaderboardError('invalid-payload', `${field} must be an integer between ${min} and ${max}`)
  }
  return value
}

function finiteNumber(value, field, { min = 0, max = MAX_POINTS } = {}) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new LeaderboardError('invalid-payload', `${field} must be between ${min} and ${max}`)
  }
  return value
}

function safeString(value, field, { required = false, max = MAX_STRING_LENGTH } = {}) {
  const result = typeof value === 'string' ? value.trim() : ''
  if ((required && !result) || result.length > max || /[\u0000-\u001f\u007f]/.test(result)) {
    throw new LeaderboardError('invalid-payload', `${field} is invalid`)
  }
  return result
}

function eventId(value) {
  if (value !== undefined && value !== null) {
    const supplied = safeString(value, 'eventId', { required: true, max: 100 })
    if (!/^[A-Za-z0-9_-]+$/.test(supplied)) throw new LeaderboardError('invalid-payload', 'eventId contains unsupported characters')
    return supplied
  }
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`
}

function readOutbox() {
  try {
    const parsed = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeOutbox(events) {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(events))
}

function getLocalLevel() {
  try {
    const stored = JSON.parse(localStorage.getItem('gamification') || '{}')
    const points = Number(stored.points) || 0
    return Math.max(1, Math.min(999, Math.floor(points / 500) + 1))
  } catch {
    return 1
  }
}

function normalizeQuiz(input, now = new Date()) {
  const points = finiteInteger(input?.score, 'score')
  const total = finiteInteger(input?.total, 'total', { max: MAX_QUIZ_QUESTIONS })
  const correct = finiteInteger(input?.correct, 'correct', { max: total })
  const accuracy = finiteNumber(input?.accuracy, 'accuracy', { max: 100 })
  if (points !== correct * 10) {
    throw new LeaderboardError('invalid-payload', 'score must equal 10 points per correct answer')
  }
  return {
    eventId: eventId(input?.eventId),
    kind: 'quiz',
    points,
    correct,
    total,
    accuracy,
    timeTaken: finiteNumber(input?.timeTaken || 0, 'timeTaken', { max: 86400000 }),
    quizId: safeString(String(input?.quizId ?? ''), 'quizId', { max: 100 }),
    mode: safeString(input?.mode || 'quiz', 'mode', { required: true, max: 50 }),
    dailyBucket: getLocalDateBucket(now),
    weeklyBucket: getLocalIsoWeekBucket(now),
    queuedAt: now.toISOString()
  }
}

function normalizeActivity(input, now = new Date()) {
  const activityType = safeString(input?.type, 'type', { required: true, max: 50 })
  if (!/^[a-z0-9_-]+$/i.test(activityType)) throw new LeaderboardError('invalid-payload', 'type contains unsupported characters')
  const points = finiteInteger(input?.points, 'points', { min: 1 })
  if (!ACTIVITY_POINT_RULES[activityType]?.includes(points)) {
    throw new LeaderboardError('invalid-payload', 'points do not match the activity type')
  }
  return {
    eventId: eventId(input?.eventId),
    kind: 'activity',
    points,
    activityType,
    description: safeString(input?.description || '', 'description'),
    dailyBucket: getLocalDateBucket(now),
    weeklyBucket: getLocalIsoWeekBucket(now),
    queuedAt: now.toISOString()
  }
}

function validateQueuedEvent(input) {
  if (!input || (input.kind !== 'quiz' && input.kind !== 'activity')) {
    throw new LeaderboardError('invalid-outbox-event', 'Queued leaderboard event is invalid')
  }
  const common = {
    ...input,
    eventId: eventId(input.eventId),
    points: finiteInteger(input.points, 'points', { min: input.kind === 'quiz' ? 0 : 1 })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dailyBucket || '') || !/^\d{4}-W\d{2}$/.test(input.weeklyBucket || '')) {
    throw new LeaderboardError('invalid-outbox-event', 'Queued leaderboard period is invalid')
  }
  if (input.kind === 'quiz') {
    common.total = finiteInteger(input.total, 'total', { max: MAX_QUIZ_QUESTIONS })
    common.correct = finiteInteger(input.correct, 'correct', { max: common.total })
    common.accuracy = finiteNumber(input.accuracy, 'accuracy', { max: 100 })
    if (common.points !== common.correct * 10) {
      throw new LeaderboardError('invalid-outbox-event', 'Queued quiz score is inconsistent')
    }
    common.timeTaken = finiteNumber(input.timeTaken, 'timeTaken', { max: 86400000 })
    common.quizId = safeString(input.quizId || '', 'quizId', { max: 100 })
    common.mode = safeString(input.mode, 'mode', { required: true, max: 50 })
  } else {
    common.activityType = safeString(input.activityType, 'activityType', { required: true, max: 50 })
    if (!/^[a-z0-9_-]+$/i.test(common.activityType)) throw new LeaderboardError('invalid-outbox-event', 'Queued activity type is invalid')
    if (!ACTIVITY_POINT_RULES[common.activityType]?.includes(common.points)) {
      throw new LeaderboardError('invalid-outbox-event', 'Queued points do not match the activity type')
    }
    common.description = safeString(input.description || '', 'description')
  }
  return common
}

function dataOf(snapshot) {
  return snapshot.exists() ? snapshot.data() : {}
}

class LeaderboardService {
  constructor() {
    this.db = null
    this.userId = null
    this.username = null
    this.isAvailable = false
    this.initializationPromise = null
    this.drainPromise = null
    if (typeof window !== 'undefined') {
      window.addEventListener?.('online', () => {
        if (!isLeaderboardEnabled()) return
        this.initUser().then(() => this.flushOutbox()).catch(() => {})
      })
    }
  }

  async initUser() {
    if (!isLeaderboardEnabled()) {
      this.isAvailable = false
      return { userId: null, username: null, disabled: true }
    }
    if (this.userId && this.db) return { userId: this.userId, username: this.username }
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = (async () => {
      try {
        await ensureFirestoreApi()
        const user = await ensureAuthenticated()
        const state = getFirebaseState()
        if (!user || !state.db) throw new LeaderboardError('unavailable', 'Leaderboard authentication is unavailable')
        this.db = state.db
        this.userId = user.uid
        this.isAvailable = true
        try {
          this.username = safeString(localStorage.getItem('username'), 'username', { required: true, max: 40 })
        } catch {
          this.username = this.generateUsername()
        }
        localStorage.setItem('username', this.username)
        await this.createUserProfile()
        await this.flushOutbox()
        return { userId: this.userId, username: this.username }
      } catch (error) {
        this.isAvailable = false
        console.error('Failed to initialize leaderboard:', error)
        return { userId: null, username: null, error: this.toError(error) }
      } finally {
        this.initializationPromise = null
      }
    })()
    return this.initializationPromise
  }

  generateUsername() {
    const adjectives = ['Faithful', 'Seeking', 'Learning', 'Devoted', 'Wise', 'Humble']
    const nouns = ['Scholar', 'Student', 'Seeker', 'Believer', 'Learner']
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 1000)}`
  }

  toError(error, fallback = 'operation-failed') {
    if (error instanceof LeaderboardError) return { code: error.code, message: error.message }
    return { code: error?.code || fallback, message: error?.message || 'Leaderboard operation failed' }
  }

  async createUserProfile() {
    if (!this.db || !this.userId) throw new LeaderboardError('not-initialized', 'Leaderboard user is not initialized')
    const { doc, runTransaction, serverTimestamp } = await ensureFirestoreApi()
    const userRef = doc(this.db, 'users', this.userId)
    await runTransaction(this.db, async transaction => {
      const snapshot = await transaction.get(userRef)
      const existing = dataOf(snapshot)
      transaction.set(userRef, {
        username: existing.username || this.username,
        totalScore: Number.isFinite(existing.totalScore) ? existing.totalScore : 0,
        quizzesTaken: Number.isFinite(existing.quizzesTaken) ? existing.quizzesTaken : 0,
        level: getLocalLevel(),
        createdAt: existing.createdAt || serverTimestamp(),
        lastActive: serverTimestamp()
      }, { merge: true })
    })
  }

  async updateUsername(newUsername) {
    if (!isLeaderboardEnabled()) return { ok: false, code: 'disabled' }
    const nextUsername = safeString(newUsername, 'username', { required: true, max: 40 })
    if (!this.userId || !this.db) await this.initUser()
    if (!this.userId || !this.db) return { ok: false, code: 'unavailable' }

    const previousUsername = this.username
    const { doc, runTransaction, serverTimestamp } = await ensureFirestoreApi()
    const now = new Date()
    const userRef = doc(this.db, 'users', this.userId)
    const dailyRef = doc(this.db, 'leaderboards', 'daily', getLocalDateBucket(now), this.userId)
    const weeklyRef = doc(this.db, 'leaderboards', 'weekly', getLocalIsoWeekBucket(now), this.userId)

    try {
      await runTransaction(this.db, async transaction => {
        const [userSnapshot, dailySnapshot, weeklySnapshot] = await Promise.all([
          transaction.get(userRef), transaction.get(dailyRef), transaction.get(weeklyRef)
        ])
        if (!userSnapshot.exists()) throw new LeaderboardError('profile-missing', 'Leaderboard profile does not exist')
        transaction.update(userRef, { username: nextUsername, lastActive: serverTimestamp() })
        if (dailySnapshot.exists()) transaction.update(dailyRef, { username: nextUsername })
        if (weeklySnapshot.exists()) transaction.update(weeklyRef, { username: nextUsername })
      })
      this.username = nextUsername
      localStorage.setItem('username', nextUsername)
      return { ok: true, username: nextUsername }
    } catch (error) {
      this.username = previousUsername
      return { ok: false, ...this.toError(error, 'username-update-failed') }
    }
  }

  async submitScore(quizResult) {
    let event
    try {
      event = normalizeQuiz(quizResult)
    } catch (error) {
      return { ok: false, ...this.toError(error) }
    }
    return this.enqueueAndFlush(event)
  }

  async submitActivity(activity) {
    let event
    try {
      event = normalizeActivity(activity)
    } catch (error) {
      return { ok: false, ...this.toError(error) }
    }
    return this.enqueueAndFlush(event)
  }

  async enqueueAndFlush(event) {
    if (!isLeaderboardEnabled()) return { ok: false, code: 'disabled', queued: false }
    const outbox = readOutbox()
    if (!outbox.some(item => item.eventId === event.eventId)) {
      if (outbox.length >= MAX_OUTBOX_EVENTS) {
        return { ok: false, code: 'outbox-full', queued: false, eventId: event.eventId }
      }
      outbox.push(event)
      writeOutbox(outbox)
    }
    if (!this.userId || !this.db) await this.initUser()
    if (!this.userId || !this.db) return { ok: false, code: 'queued-offline', queued: true, eventId: event.eventId }

    const result = await this.flushOutbox()
    const pending = readOutbox().some(item => item.eventId === event.eventId)
    return pending
      ? { ok: false, code: result.error?.code || 'queued-offline', queued: true, eventId: event.eventId }
      : { ok: true, queued: false, eventId: event.eventId }
  }

  async flushOutbox() {
    if (!isLeaderboardEnabled() || !this.userId || !this.db) return { ok: false, code: 'unavailable' }
    if (this.drainPromise) return this.drainPromise

    this.drainPromise = (async () => {
      let events = readOutbox()
      for (const event of events) {
        if (!isLeaderboardEnabled()) break
        try {
          await this.applyEvent(event)
          events = readOutbox().filter(item => item.eventId !== event.eventId)
          writeOutbox(events)
        } catch (error) {
          if (error instanceof LeaderboardError && ['invalid-outbox-event', 'invalid-payload'].includes(error.code)) {
            console.warn(`Discarding invalid leaderboard outbox event ${event?.eventId || 'unknown'}:`, error.message)
            events = readOutbox().filter(item => item.eventId !== event?.eventId)
            writeOutbox(events)
            continue
          }
          console.warn(`Leaderboard event ${event.eventId} remains queued:`, error.message)
          return { ok: false, error: this.toError(error, 'sync-failed') }
        }
      }
      return { ok: true }
    })().finally(() => {
      this.drainPromise = null
    })
    return this.drainPromise
  }

  async applyEvent(event) {
    event = validateQueuedEvent(event)
    const { doc, runTransaction, serverTimestamp } = await ensureFirestoreApi()
    const userRef = doc(this.db, 'users', this.userId)
    const dailyRef = doc(this.db, 'leaderboards', 'daily', event.dailyBucket, this.userId)
    const weeklyRef = doc(this.db, 'leaderboards', 'weekly', event.weeklyBucket, this.userId)
    const eventRef = doc(this.db, 'users', this.userId, 'events', event.eventId)

    return runTransaction(this.db, async transaction => {
      // Firestore transactions require all reads before any writes.
      const [eventSnapshot, userSnapshot, dailySnapshot, weeklySnapshot] = await Promise.all([
        transaction.get(eventRef), transaction.get(userRef), transaction.get(dailyRef), transaction.get(weeklyRef)
      ])
      if (eventSnapshot.exists()) return { duplicate: true }

      const user = dataOf(userSnapshot)
      const daily = dataOf(dailySnapshot)
      const weekly = dataOf(weeklySnapshot)
      const isQuiz = event.kind === 'quiz'
      const timestamp = serverTimestamp()
      const username = this.username
      const level = getLocalLevel()

      transaction.set(userRef, {
        username,
        totalScore: (Number(user.totalScore) || 0) + event.points,
        quizzesTaken: (Number(user.quizzesTaken) || 0) + (isQuiz ? 1 : 0),
        level,
        createdAt: user.createdAt || timestamp,
        lastActive: timestamp,
        lastEventId: event.eventId
      }, { merge: true })

      transaction.set(dailyRef, {
        userId: this.userId,
        username,
        score: (Number(daily.score) || 0) + event.points,
        activityPoints: (Number(daily.activityPoints) || 0) + (isQuiz ? 0 : event.points),
        correct: (Number(daily.correct) || 0) + (isQuiz ? event.correct : 0),
        total: (Number(daily.total) || 0) + (isQuiz ? event.total : 0),
        quizzesTaken: (Number(daily.quizzesTaken) || 0) + (isQuiz ? 1 : 0),
        bestScore: Math.max(Number(daily.bestScore) || 0, isQuiz ? event.points : 0),
        bestAccuracy: Math.max(Number(daily.bestAccuracy) || 0, isQuiz ? event.accuracy : 0),
        timestamp,
        lastEventId: event.eventId
      }, { merge: true })

      transaction.set(weeklyRef, {
        userId: this.userId,
        username,
        totalScore: (Number(weekly.totalScore) || 0) + event.points,
        activityPoints: (Number(weekly.activityPoints) || 0) + (isQuiz ? 0 : event.points),
        quizzesTaken: (Number(weekly.quizzesTaken) || 0) + (isQuiz ? 1 : 0),
        bestScore: Math.max(Number(weekly.bestScore) || 0, isQuiz ? event.points : 0),
        timestamp,
        lastEventId: event.eventId
      }, { merge: true })

      const eventDocument = {
        eventId: event.eventId,
        userId: this.userId,
        kind: event.kind,
        points: event.points,
        dailyBucket: event.dailyBucket,
        weeklyBucket: event.weeklyBucket,
        createdAt: timestamp
      }
      if (isQuiz) {
        Object.assign(eventDocument, {
          correct: event.correct,
          total: event.total,
          accuracy: event.accuracy,
          timeTaken: event.timeTaken,
          quizId: event.quizId,
          mode: event.mode
        })
      } else {
        Object.assign(eventDocument, {
          activityType: event.activityType,
          description: event.description
        })
      }
      transaction.set(eventRef, eventDocument)
      return { duplicate: false }
    })
  }

  async loadLeaderboard(path, scoreField, limitCount) {
    if (!isLeaderboardEnabled()) return []
    if (!this.userId || !this.db) await this.initUser()
    if (!this.db) throw new LeaderboardError('unavailable', 'Leaderboard is unavailable')
    if (!Number.isInteger(limitCount) || limitCount < 1 || limitCount > 10000) {
      throw new LeaderboardError('invalid-limit', 'Leaderboard limit must be between 1 and 10000')
    }
    const { collection, getDocs, limit, orderBy, query } = await ensureFirestoreApi()
    try {
      const snapshot = await getDocs(query(collection(this.db, ...path), orderBy(scoreField, 'desc'), limit(limitCount)))
      const rows = []
      snapshot.forEach(snapshotDoc => {
        const data = snapshotDoc.data()
        if (!Number.isFinite(data[scoreField])) return
        rows.push({ ...data, userId: data.userId || snapshotDoc.id, rank: rows.length + 1, isCurrentUser: snapshotDoc.id === this.userId })
      })
      return rows
    } catch (error) {
      throw new LeaderboardError(error?.code || 'read-failed', error?.message || 'Could not load leaderboard', error)
    }
  }

  getDailyLeaderboard(date = new Date(), limitCount = 100) {
    return this.loadLeaderboard(['leaderboards', 'daily', getLocalDateBucket(date)], 'score', limitCount)
  }

  getWeeklyLeaderboard(limitCount = 100, date = new Date()) {
    return this.loadLeaderboard(['leaderboards', 'weekly', getLocalIsoWeekBucket(date)], 'totalScore', limitCount)
  }

  async getAllTimeLeaderboard(limitCount = 100) {
    const rows = await this.loadLeaderboard(['users'], 'totalScore', limitCount)
    return rows.filter(row => row.username).map(row => ({ ...row, totalScore: row.totalScore || 0, quizzesTaken: row.quizzesTaken || 0, level: row.level || 1 }))
  }

  async getUserRank(type = 'allTime') {
    if (!this.userId || !this.db) await this.initUser()
    if (!this.userId || !this.db) return null
    const now = new Date()
    const path = type === 'daily'
      ? ['leaderboards', 'daily', getLocalDateBucket(now)]
      : type === 'weekly'
        ? ['leaderboards', 'weekly', getLocalIsoWeekBucket(now)]
        : ['users']
    const scoreField = type === 'daily' ? 'score' : 'totalScore'
    const { collection, doc, getCountFromServer, getDoc, query, where } = await ensureFirestoreApi()
    try {
      const userSnapshot = await getDoc(doc(this.db, ...path, this.userId))
      if (!userSnapshot.exists()) return null
      const score = Number(userSnapshot.data()[scoreField])
      if (!Number.isFinite(score)) return null
      const higherScores = await getCountFromServer(query(
        collection(this.db, ...path),
        where(scoreField, '>', score)
      ))
      return { rank: higherScores.data().count + 1, score }
    } catch (error) {
      throw new LeaderboardError(error?.code || 'rank-read-failed', error?.message || 'Could not load your rank', error)
    }
  }

  getWeekId(date) {
    return getLocalIsoWeekBucket(date)
  }
}

export { normalizeActivity, normalizeQuiz, OUTBOX_KEY }
export default new LeaderboardService()
