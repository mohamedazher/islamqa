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
   * Initialize user (call on app start)
   */
  async initUser() {
    if (!this.isAvailable) {
      console.warn('⚠️ Leaderboard service not available (Firebase not initialized)')
      return { userId: null, username: null }
    }

    const user = await ensureAuthenticated()
    if (!user) {
      console.warn('⚠️ Could not authenticate user for leaderboard')
      return { userId: null, username: null }
    }
    this.userId = user.uid

    // Get or create username
    this.username = localStorage.getItem('username')
    if (!this.username) {
      this.username = this.generateUsername()
      localStorage.setItem('username', this.username)
    }

    // Create user profile if doesn't exist
    await this.createUserProfile()

    return { userId: this.userId, username: this.username }
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
   * Create user profile
   */
  async createUserProfile() {
    const userRef = doc(this.db, 'users', this.userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        username: this.username,
        totalScore: 0,
        quizzesTaken: 0,
        level: 1,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      })
    } else {
      // Update last active
      await updateDoc(userRef, {
        lastActive: serverTimestamp()
      })
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
   * Submit quiz score to leaderboard
   */
  async submitScore(quizResult) {
    if (!this.isAvailable) {
      console.warn('⚠️ Leaderboard service not available, skipping score submission')
      return false
    }

    if (!this.userId) await this.initUser()
    if (!this.userId) return false

    const { score, correct, total, quizId, mode, accuracy, timeTaken } = quizResult

    // Get today's date for daily leaderboard
    const today = new Date().toISOString().split('T')[0]

    try {
      // 1. Update daily leaderboard
      const dailyRef = doc(this.db, 'leaderboards', 'daily', today, this.userId)
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
        timestamp: serverTimestamp()
      })

      // 2. Update all-time stats
      const userRef = doc(this.db, 'users', this.userId)
      await updateDoc(userRef, {
        totalScore: increment(score),
        quizzesTaken: increment(1),
        lastActive: serverTimestamp()
      })

      // 3. Get current week for weekly leaderboard
      const weekId = this.getWeekId(new Date())
      const weeklyRef = doc(this.db, 'leaderboards', 'weekly', weekId, this.userId)
      const weeklyDoc = await getDoc(weeklyRef)

      if (weeklyDoc.exists()) {
        await updateDoc(weeklyRef, {
          totalScore: increment(score),
          quizzesTaken: increment(1),
          bestScore: score > weeklyDoc.data().bestScore ? score : weeklyDoc.data().bestScore,
          timestamp: serverTimestamp()
        })
      } else {
        await setDoc(weeklyRef, {
          userId: this.userId,
          username: this.username,
          totalScore: score,
          quizzesTaken: 1,
          bestScore: score,
          timestamp: serverTimestamp()
        })
      }

      console.log('✅ Score submitted to leaderboard')
      return true
    } catch (error) {
      console.error('❌ Failed to submit score:', error)
      throw error
    }
  }

  /**
   * Get daily leaderboard
   */
  async getDailyLeaderboard(date = new Date(), limitCount = 100) {
    const dateString = date.toISOString().split('T')[0]

    try {
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

      return leaderboard
    } catch (error) {
      console.error('❌ Failed to get daily leaderboard:', error)
      return []
    }
  }

  /**
   * Get weekly leaderboard
   */
  async getWeeklyLeaderboard(limitCount = 100) {
    const weekId = this.getWeekId(new Date())

    try {
      const leaderboardRef = collection(this.db, 'leaderboards', 'weekly', weekId)
      const q = query(leaderboardRef, orderBy('totalScore', 'desc'), limit(limitCount))
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

      return leaderboard
    } catch (error) {
      console.error('❌ Failed to get weekly leaderboard:', error)
      return []
    }
  }

  /**
   * Get all-time leaderboard
   */
  async getAllTimeLeaderboard(limitCount = 100) {
    try {
      const usersRef = collection(this.db, 'users')
      const q = query(usersRef, orderBy('totalScore', 'desc'), limit(limitCount))
      const snapshot = await getDocs(q)

      const leaderboard = []
      let rank = 1
      snapshot.forEach((doc) => {
        const data = doc.data()
        leaderboard.push({
          userId: doc.id,
          username: data.username,
          totalScore: data.totalScore || 0,
          quizzesTaken: data.quizzesTaken || 0,
          level: data.level || 1,
          rank: rank,
          isCurrentUser: doc.id === this.userId
        })
        rank++
      })

      return leaderboard
    } catch (error) {
      console.error('❌ Failed to get all-time leaderboard:', error)
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
   * Get week ID (format: 2025-W45)
   */
  getWeekId(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000))
    const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7)
    return `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`
  }
}

export default new LeaderboardService()
