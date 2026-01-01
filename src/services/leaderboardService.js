import { db, ensureAuthenticated, firebaseInitialized } from './firebase'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore'

class LeaderboardService {
  constructor() {
    this.db = db
    this.userId = null
    this.username = null
    this.isAvailable = firebaseInitialized
  }

  /**
   * Initialize user (call on app start) with logging
   */
  async initUser() {
    if (!this.isAvailable) {
      console.warn('⚠️ Leaderboard service not available (Firebase not initialized)')
      return { userId: null, username: null }
    }

    try {
      console.log('🔐 Initializing leaderboard user...')
      const user = await ensureAuthenticated()
      if (!user) {
        console.warn('⚠️ Could not authenticate user for leaderboard')
        return { userId: null, username: null }
      }
      this.userId = user.uid
      console.log(`  ✅ User authenticated: ${this.userId}`)

      // Get or create username
      this.username = localStorage.getItem('username')
      if (!this.username) {
        this.username = this.generateUsername()
        localStorage.setItem('username', this.username)
        console.log(`  ✨ Generated new username: ${this.username}`)
      } else {
        console.log(`  📝 Using existing username: ${this.username}`)
      }

      // Create user profile if doesn't exist
      await this.createUserProfile()

      return { userId: this.userId, username: this.username }
    } catch (error) {
      console.error('❌ Failed to initialize user:', error.message)
      return { userId: null, username: null }
    }
  }

  /**
   * Generate random username
   */
  generateUsername() {
    const adjectives = ['Faithful', 'Seeking', 'Learning', 'Devoted', 'Wise', 'Humble']
    const nouns = ['Scholar', 'Student', 'Seeker', 'Believer', 'Learner']
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num = Math.floor(Math.random() * 1000)
    return `${adj}${noun}${num}`
  }

  /**
   * Create user profile with explicit field initialization
   */
  async createUserProfile() {
    const userRef = doc(this.db, 'users', this.userId)

    try {
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        console.log(`👤 Creating new user profile for ${this.userId}`)
        await setDoc(userRef, {
          username: this.username,
          totalScore: 0,           // Explicit: Start at 0, not undefined
          quizzesTaken: 0,         // Explicit: Start at 0, not undefined
          level: 1,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        })
        console.log(`✅ User profile created successfully`)
      } else {
        // Update last active and ensure required fields exist
        const existingData = userDoc.data()
        const updates = {
          lastActive: serverTimestamp()
        }

        // Ensure critical fields exist (migrate if missing)
        if (existingData.totalScore === undefined) {
          console.warn(`⚠️ Missing totalScore for user ${this.userId}, initializing to 0`)
          updates.totalScore = 0
        }
        if (existingData.quizzesTaken === undefined) {
          console.warn(`⚠️ Missing quizzesTaken for user ${this.userId}, initializing to 0`)
          updates.quizzesTaken = 0
        }

        await updateDoc(userRef, updates)
        console.log(`✅ User profile updated`)
      }
    } catch (error) {
      console.error(`❌ Failed to create/update user profile: ${error.message}`)
      throw error
    }
  }

  /**
   * Update username
   */
  async updateUsername(newUsername) {
    if (!this.userId) await this.initUser()

    this.username = newUsername
    localStorage.setItem('username', newUsername)

    const userRef = doc(this.db, 'users', this.userId)
    await updateDoc(userRef, { username: newUsername })
  }

  /**
   * Submit quiz score to leaderboard (with comprehensive logging)
   */
  async submitScore(quizResult) {
    if (!this.isAvailable) {
      console.warn('⚠️ Leaderboard service not available, skipping score submission')
      return false
    }

    if (!this.userId) await this.initUser()
    if (!this.userId) {
      console.error('❌ Cannot submit score: User not authenticated')
      return false
    }

    const { score, correct, total, quizId, mode, accuracy, timeTaken } = quizResult

    console.log(`📊 Submitting quiz score:`, {
      userId: this.userId,
      username: this.username,
      score,
      correct,
      total,
      accuracy,
      mode,
      quizId
    })

    // Validate score
    if (score < 0) {
      console.error('❌ Invalid score: score must be >= 0')
      return false
    }

    // Get today's date for daily leaderboard
    const today = new Date().toISOString().split('T')[0]

    try {
      // 0. Ensure user profile exists with required fields
      await this.createUserProfile()

      // 1. Update daily leaderboard (accumulate scores, don't overwrite)
      console.log(`  📅 Writing daily score for ${today}...`)
      const dailyRef = doc(this.db, 'leaderboards', 'daily', today, this.userId)
      const dailyDoc = await getDoc(dailyRef)

      if (dailyDoc.exists()) {
        const existing = dailyDoc.data()
        await updateDoc(dailyRef, {
          score: increment(score),  // Accumulate scores
          correct: increment(correct),
          total: increment(total),
          quizzesTaken: increment(1),
          bestScore: Math.max(score, existing.bestScore || 0),
          bestAccuracy: Math.max(accuracy, existing.bestAccuracy || 0),
          timestamp: serverTimestamp()
        })
        console.log(`  ✅ Daily score accumulated (added +${score})`)
      } else {
        await setDoc(dailyRef, {
          userId: this.userId,
          username: this.username,
          score,
          correct,
          total,
          accuracy,
          timeTaken,
          quizId,
          mode,
          quizzesTaken: 1,
          bestScore: score,
          bestAccuracy: accuracy,
          timestamp: serverTimestamp()
        })
        console.log(`  ✅ Daily score created`)
      }

      // 2. Update all-time stats in users collection
      console.log(`  👤 Updating all-time stats...`)
      const userRef = doc(this.db, 'users', this.userId)
      await updateDoc(userRef, {
        totalScore: increment(score),
        quizzesTaken: increment(1),
        lastActive: serverTimestamp()
      })
      console.log(`  ✅ All-time stats updated (score: +${score})`)

      // 3. Get current week for weekly leaderboard
      const weekId = this.getWeekId(new Date())
      console.log(`  📆 Writing weekly score for ${weekId}...`)
      const weeklyRef = doc(this.db, 'leaderboards', 'weekly', weekId, this.userId)
      const weeklyDoc = await getDoc(weeklyRef)

      if (weeklyDoc.exists()) {
        const existing = weeklyDoc.data()
        await updateDoc(weeklyRef, {
          totalScore: increment(score),
          quizzesTaken: increment(1),
          bestScore: Math.max(score, existing.bestScore || 0),
          timestamp: serverTimestamp()
        })
        console.log(`  ✅ Weekly score updated (cumulative: +${score})`)
      } else {
        await setDoc(weeklyRef, {
          userId: this.userId,
          username: this.username,
          totalScore: score,
          quizzesTaken: 1,
          bestScore: score,
          timestamp: serverTimestamp()
        })
        console.log(`  ✅ Weekly score created`)
      }

      console.log('✅ Score submitted to leaderboard successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to submit score:', error.message)
      console.error('   Error code:', error.code)
      console.error('   Full error:', error)
      throw error
    }
  }

  /**
   * Submit dua/adhkar activity to leaderboard
   * @param {Object} activity - The activity data
   * @param {number} activity.points - Points earned from activity
   * @param {string} activity.type - Activity type: 'dua_read', 'morning_adhkar', 'evening_adhkar', 'both_adhkar'
   * @param {string} activity.description - Description of the activity
   */
  async submitActivity(activity) {
    if (!this.isAvailable) {
      console.warn('⚠️ Leaderboard service not available, skipping activity submission')
      return false
    }

    if (!this.userId) await this.initUser()
    if (!this.userId) {
      console.error('❌ Cannot submit activity: User not authenticated')
      return false
    }

    const { points, type, description } = activity

    console.log(`📊 Submitting activity:`, {
      userId: this.userId,
      username: this.username,
      points,
      type,
      description
    })

    // Validate points
    if (!points || points <= 0) {
      console.error('❌ Invalid activity: points must be > 0')
      return false
    }

    const today = new Date().toISOString().split('T')[0]

    try {
      // 0. Ensure user profile exists
      await this.createUserProfile()

      // 1. Update daily leaderboard with activity points
      console.log(`  📅 Adding activity to daily score for ${today}...`)
      const dailyRef = doc(this.db, 'leaderboards', 'daily', today, this.userId)
      const dailyDoc = await getDoc(dailyRef)

      if (dailyDoc.exists()) {
        await updateDoc(dailyRef, {
          score: increment(points),
          activityPoints: increment(points),
          timestamp: serverTimestamp()
        })
        console.log(`  ✅ Daily activity points added (+${points})`)
      } else {
        await setDoc(dailyRef, {
          userId: this.userId,
          username: this.username,
          score: points,
          activityPoints: points,
          correct: 0,
          total: 0,
          quizzesTaken: 0,
          timestamp: serverTimestamp()
        })
        console.log(`  ✅ Daily entry created with activity points`)
      }

      // 2. Update all-time stats
      console.log(`  👤 Updating all-time stats...`)
      const userRef = doc(this.db, 'users', this.userId)
      await updateDoc(userRef, {
        totalScore: increment(points),
        lastActive: serverTimestamp()
      })
      console.log(`  ✅ All-time stats updated (+${points})`)

      // 3. Update weekly leaderboard
      const weekId = this.getWeekId(new Date())
      console.log(`  📆 Adding activity to weekly score for ${weekId}...`)
      const weeklyRef = doc(this.db, 'leaderboards', 'weekly', weekId, this.userId)
      const weeklyDoc = await getDoc(weeklyRef)

      if (weeklyDoc.exists()) {
        await updateDoc(weeklyRef, {
          totalScore: increment(points),
          activityPoints: increment(points),
          timestamp: serverTimestamp()
        })
        console.log(`  ✅ Weekly activity points added (+${points})`)
      } else {
        await setDoc(weeklyRef, {
          userId: this.userId,
          username: this.username,
          totalScore: points,
          activityPoints: points,
          quizzesTaken: 0,
          timestamp: serverTimestamp()
        })
        console.log(`  ✅ Weekly entry created with activity points`)
      }

      console.log(`✅ Activity submitted: ${description} (+${points} points)`)
      return true
    } catch (error) {
      console.error('❌ Failed to submit activity:', error.message)
      return false
    }
  }

  /**
   * Get daily leaderboard with validation
   */
  async getDailyLeaderboard(date = new Date(), limitCount = 100) {
    const dateString = date.toISOString().split('T')[0]

    try {
      console.log(`📊 Loading daily leaderboard for ${dateString}...`)
      const leaderboardRef = collection(this.db, 'leaderboards', 'daily', dateString)
      const q = query(leaderboardRef, orderBy('score', 'desc'), limit(limitCount))
      const snapshot = await getDocs(q)

      const leaderboard = []
      let rank = 1
      snapshot.forEach((doc) => {
        const data = doc.data()
        leaderboard.push({
          ...data,
          rank: rank,
          isCurrentUser: doc.id === this.userId
        })
        rank++
      })

      console.log(`  ✅ Loaded ${leaderboard.length} daily leaderboard entries`)
      return leaderboard
    } catch (error) {
      console.error('❌ Failed to get daily leaderboard:', error.message)
      return []
    }
  }

  /**
   * Get weekly leaderboard with validation
   */
  async getWeeklyLeaderboard(limitCount = 100) {
    const weekId = this.getWeekId(new Date())

    try {
      console.log(`📊 Loading weekly leaderboard for ${weekId}...`)
      const leaderboardRef = collection(this.db, 'leaderboards', 'weekly', weekId)
      const q = query(leaderboardRef, orderBy('totalScore', 'desc'), limit(limitCount))
      const snapshot = await getDocs(q)

      const leaderboard = []
      let rank = 1
      snapshot.forEach((doc) => {
        const data = doc.data()

        // Validate required fields
        if (!data.totalScore && data.totalScore !== 0) {
          console.warn(`  ⚠️  Entry missing totalScore for user ${doc.id}, skipping`)
          return
        }

        leaderboard.push({
          ...data,
          rank: rank,
          isCurrentUser: doc.id === this.userId
        })
        rank++
      })

      console.log(`  ✅ Loaded ${leaderboard.length} weekly leaderboard entries`)
      return leaderboard
    } catch (error) {
      console.error('❌ Failed to get weekly leaderboard:', error.message)
      return []
    }
  }

  /**
   * Get all-time leaderboard with validation
   */
  async getAllTimeLeaderboard(limitCount = 100) {
    try {
      console.log(`📊 Loading all-time leaderboard...`)
      const usersRef = collection(this.db, 'users')
      const q = query(usersRef, orderBy('totalScore', 'desc'), limit(limitCount))
      const snapshot = await getDocs(q)

      const leaderboard = []
      let rank = 1
      snapshot.forEach((doc) => {
        const data = doc.data()

        // Validate required fields
        if (!data.username) {
          console.warn(`  ⚠️  User ${doc.id} missing username, skipping`)
          return
        }

        const totalScore = data.totalScore || 0
        const quizzesTaken = data.quizzesTaken || 0

        // Only show users with at least one quiz or some score
        if (totalScore === 0 && quizzesTaken === 0) {
          console.log(`  ℹ️  User ${data.username} has no activity, including in leaderboard`)
        }

        leaderboard.push({
          userId: doc.id,
          username: data.username,
          totalScore: totalScore,
          quizzesTaken: quizzesTaken,
          level: data.level || 1,
          rank: rank,
          isCurrentUser: doc.id === this.userId
        })
        rank++
      })

      console.log(`  ✅ Loaded ${leaderboard.length} all-time leaderboard entries`)
      return leaderboard
    } catch (error) {
      console.error('❌ Failed to get all-time leaderboard:', error.message)
      return []
    }
  }

  /**
   * Get user rank
   */
  async getUserRank(type = 'allTime') {
    if (!this.userId) return null

    try {
      let leaderboard
      if (type === 'daily') {
        leaderboard = await this.getDailyLeaderboard(new Date(), 10000)
      } else if (type === 'weekly') {
        leaderboard = await this.getWeeklyLeaderboard(10000)
      } else {
        leaderboard = await this.getAllTimeLeaderboard(10000)
      }

      const userEntry = leaderboard.find(entry => entry.userId === this.userId || entry.isCurrentUser)
      return userEntry ? userEntry.rank : null
    } catch (error) {
      console.error('❌ Failed to get user rank:', error)
      return null
    }
  }

  /**
   * Get week ID (format: 2025-W45) - Using ISO 8601 standard
   * ISO 8601: Week starts on Monday, first week contains Jan 4
   */
  getWeekId(date) {
    // Create a copy to avoid mutation
    const d = new Date(date)

    // Set to UTC to avoid timezone issues
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth()
    const day = d.getUTCDate()
    const dayOfWeek = d.getUTCDay()

    // ISO 8601: Thursday is day 4, use it to determine week
    const thursday = new Date(d)
    thursday.setUTCDate(day - dayOfWeek + 4)

    // Get the year of the Thursday
    const yearOfThursday = thursday.getUTCFullYear()

    // Get the first day of the year
    const jan4 = new Date(yearOfThursday, 0, 4)
    const firstThursday = new Date(jan4)
    firstThursday.setUTCDate(4 - firstThursday.getUTCDay() + 1)

    // Calculate week number
    const weekNum = Math.floor((thursday - firstThursday) / (7 * 24 * 60 * 60 * 1000)) + 1

    const weekId = `${yearOfThursday}-W${weekNum.toString().padStart(2, '0')}`
    console.log(`📅 Week ID for ${date.toISOString().split('T')[0]}: ${weekId}`)
    return weekId
  }
}

export default new LeaderboardService()
