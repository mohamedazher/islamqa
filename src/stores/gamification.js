import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import leaderboardService from '@/services/leaderboardService'

/**
 * Gamification Store - Tracks points, achievements, and user engagement
 * Points are synced to Firebase leaderboard for competitive features
 */

// Timezone-safe date helpers
function getLocalDateString(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function localDayDiff(dateStrA, dateStrB) {
  // Returns number of calendar days between two YYYY-MM-DD strings (a - b)
  const a = new Date(dateStrA + 'T00:00:00')
  const b = new Date(dateStrB + 'T00:00:00')
  return Math.round((a - b) / (1000 * 60 * 60 * 24))
}

export const useGamificationStore = defineStore('gamification', () => {
  // State
  const points = ref(0)
  const level = ref(1)
  const streak = ref(0)
  const lastQuizDate = ref(null)
  const lastDailyQuizDate = ref(null) // Track daily quiz specifically
  const achievements = ref([])
  const quizzesTaken = ref(0)
  const questionsRead = ref(0)
  const readQuestionIds = ref(new Set()) // Track unique questions read

  // Dua-specific state
  const readDuaIds = ref(new Set()) // Track unique duas read
  const lastMorningAdhkarDate = ref(null)
  const lastEveningAdhkarDate = ref(null)
  const lastBothAdhkarDate = ref(null) // Moved into gamification state
  const morningStreak = ref(0) // Consecutive days completing ALL morning duas
  const eveningStreak = ref(0) // Consecutive days completing ALL evening duas
  const bothStreak = ref(0) // Consecutive days completing BOTH morning & evening
  const todayMorningDuas = ref(new Set()) // Duas read today for morning adhkar
  const todayEveningDuas = ref(new Set()) // Duas read today for evening adhkar
  const morningAdhkarTotal = ref(25) // Total duas in morning adhkar (chapter 27)
  const eveningAdhkarTotal = ref(25) // Total duas in evening adhkar (chapter 27)

  const stats = ref({
    totalPoints: 0,
    quizzesCompleted: 0,
    questionsRead: 0,
    bookmarksCreated: 0,
    avgAccuracy: 0,
    totalAccuracySum: 0, // Track sum for accurate average
    longestStreak: 0,
    // Dua stats
    duasRead: 0,
    morningAdhkarDays: 0,
    eveningAdhkarDays: 0,
    bothAdhkarDays: 0,
    longestAdhkarStreak: 0
  })

  // Define tier system
  const tiers = [
    { name: 'Bronze', minPoints: 0, color: '#cd7f32', icon: '🥉', benefits: 'Getting started' },
    { name: 'Silver', minPoints: 500, color: '#c0c0c0', icon: '🥈', benefits: 'Making progress' },
    { name: 'Gold', minPoints: 1500, color: '#ffd700', icon: '🥇', benefits: 'Dedicated learner' },
    { name: 'Platinum', minPoints: 3000, color: '#e5e4e2', icon: '💎', benefits: 'Knowledge expert' },
    { name: 'Diamond', minPoints: 5000, color: '#b9f2ff', icon: '💠', benefits: 'Master scholar' },
    { name: 'Legend', minPoints: 10000, color: '#ff6b6b', icon: '👑', benefits: 'Islamic knowledge champion' }
  ]

  // Define all achievements
  const allAchievements = [
    {
      id: 'first-quiz',
      name: 'Quiz Starter',
      description: 'Complete your first quiz',
      icon: '🎯',
      requirement: { type: 'quiz', count: 1 },
      points: 50,
      unlocked: false
    },
    {
      id: 'quiz-master',
      name: 'Quiz Master',
      description: 'Complete 10 quizzes',
      icon: '🏆',
      requirement: { type: 'quiz', count: 10 },
      points: 200,
      unlocked: false
    },
    {
      id: 'perfect-score',
      name: 'Perfect Score',
      description: 'Get 100% on a quiz',
      icon: '⭐',
      requirement: { type: 'accuracy', count: 100 },
      points: 150,
      unlocked: false
    },
    {
      id: 'scholar',
      name: 'Scholar',
      description: 'Read 50 questions',
      icon: '📚',
      requirement: { type: 'read', count: 50 },
      points: 100,
      unlocked: false
    },
    {
      id: 'knowledge-seeker',
      name: 'Knowledge Seeker',
      description: 'Read 100 questions',
      icon: '🔍',
      requirement: { type: 'read', count: 100 },
      points: 250,
      unlocked: false
    },
    {
      id: 'dedicated-learner',
      name: 'Dedicated Learner',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      requirement: { type: 'streak', count: 7 },
      points: 300,
      unlocked: false
    },
    {
      id: 'collector',
      name: 'Collector',
      description: 'Bookmark 20 questions',
      icon: '💾',
      requirement: { type: 'bookmarks', count: 20 },
      points: 100,
      unlocked: false
    },
    {
      id: 'early-riser',
      name: 'Early Riser',
      description: 'Complete daily quiz 5 days in a row',
      icon: '🌅',
      requirement: { type: 'daily-streak', count: 5 },
      points: 200,
      unlocked: false
    },
    // Dua achievements
    {
      id: 'first-dua',
      name: 'First Dua',
      description: 'Read your first dua',
      icon: '🤲',
      requirement: { type: 'dua-read', count: 1 },
      points: 25,
      unlocked: false
    },
    {
      id: 'dua-learner',
      name: 'Dua Learner',
      description: 'Read 25 duas',
      icon: '📿',
      requirement: { type: 'dua-read', count: 25 },
      points: 100,
      unlocked: false
    },
    {
      id: 'dua-memorizer',
      name: 'Dua Memorizer',
      description: 'Read 100 duas',
      icon: '🧠',
      requirement: { type: 'dua-read', count: 100 },
      points: 300,
      unlocked: false
    },
    {
      id: 'morning-starter',
      name: 'Morning Starter',
      description: 'Complete morning adhkar',
      icon: '🌅',
      requirement: { type: 'morning-adhkar', count: 1 },
      points: 50,
      unlocked: false
    },
    {
      id: 'evening-closer',
      name: 'Evening Closer',
      description: 'Complete evening adhkar',
      icon: '🌆',
      requirement: { type: 'evening-adhkar', count: 1 },
      points: 50,
      unlocked: false
    },
    {
      id: 'full-day-adhkar',
      name: 'Full Day',
      description: 'Complete both morning & evening adhkar in one day',
      icon: '✨',
      requirement: { type: 'both-adhkar', count: 1 },
      points: 100,
      unlocked: false
    },
    {
      id: 'adhkar-week',
      name: 'Weekly Warrior',
      description: 'Maintain a 7-day adhkar streak',
      icon: '🔥',
      requirement: { type: 'adhkar-streak', count: 7 },
      points: 250,
      unlocked: false
    },
    {
      id: 'adhkar-month',
      name: 'Monthly Master',
      description: 'Maintain a 30-day adhkar streak',
      icon: '👑',
      requirement: { type: 'adhkar-streak', count: 30 },
      points: 1000,
      unlocked: false
    },
    {
      id: 'morning-routine',
      name: 'Morning Routine',
      description: 'Complete morning adhkar 10 times',
      icon: '☀️',
      requirement: { type: 'morning-adhkar', count: 10 },
      points: 200,
      unlocked: false
    },
    {
      id: 'evening-routine',
      name: 'Evening Routine',
      description: 'Complete evening adhkar 10 times',
      icon: '🌙',
      requirement: { type: 'evening-adhkar', count: 10 },
      points: 200,
      unlocked: false
    }
  ]

  // Computed properties
  const currentLevel = computed(() => {
    return Math.floor(points.value / 500) + 1
  })

  const pointsToNextLevel = computed(() => {
    const nextLevelPoints = currentLevel.value * 500
    const pointsInCurrentLevel = points.value % 500
    return 500 - pointsInCurrentLevel
  })

  const unlockedAchievements = computed(() => {
    return achievements.value.filter(a => a.unlocked)
  })

  const lockedAchievements = computed(() => {
    return achievements.value.filter(a => !a.unlocked)
  })

  const currentTier = computed(() => {
    // Find the highest tier the user qualifies for
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (points.value >= tiers[i].minPoints) {
        return tiers[i]
      }
    }
    return tiers[0] // Default to Bronze
  })

  const nextTier = computed(() => {
    const currentIndex = tiers.findIndex(t => t.name === currentTier.value.name)
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null
  })

  const tierProgress = computed(() => {
    if (!nextTier.value) return 100 // Max tier reached

    const currentMin = currentTier.value.minPoints
    const nextMin = nextTier.value.minPoints
    const progress = ((points.value - currentMin) / (nextMin - currentMin)) * 100
    return Math.min(Math.round(progress), 100)
  })

  const levelProgress = computed(() => {
    return Math.round((points.value % 500) / 5)
  })

  // Actions
  function initializeFromStorage() {
    const stored = localStorage.getItem('gamification')
    if (stored) {
      const data = JSON.parse(stored)
      points.value = data.points || 0
      level.value = Math.max(1, Math.floor(points.value / 500) + 1)
      streak.value = data.streak || 0
      lastQuizDate.value = data.lastQuizDate || null
      lastDailyQuizDate.value = data.lastDailyQuizDate || null
      achievements.value = data.achievements || allAchievements.map(a => ({ ...a }))
      stats.value = { ...stats.value, ...data.stats }

      // Migrate: compute totalAccuracySum if missing
      if (!stats.value.totalAccuracySum && stats.value.avgAccuracy && stats.value.quizzesCompleted) {
        stats.value.totalAccuracySum = stats.value.avgAccuracy * stats.value.quizzesCompleted
      }

      // Restore read question IDs from array
      readQuestionIds.value = new Set(data.readQuestionIds || [])

      // Restore dua-specific state
      readDuaIds.value = new Set(data.readDuaIds || [])
      lastMorningAdhkarDate.value = data.lastMorningAdhkarDate || null
      lastEveningAdhkarDate.value = data.lastEveningAdhkarDate || null
      lastBothAdhkarDate.value = data.lastBothAdhkarDate || null
      morningStreak.value = data.morningStreak || 0
      eveningStreak.value = data.eveningStreak || 0
      bothStreak.value = data.bothStreak || 0

      // Migrate lastBothAdhkarDate from separate localStorage key
      if (!lastBothAdhkarDate.value) {
        const legacyBoth = localStorage.getItem('lastBothAdhkarDate')
        if (legacyBoth) {
          lastBothAdhkarDate.value = legacyBoth
          localStorage.removeItem('lastBothAdhkarDate')
        }
      }

      // Reset today's progress if it's a new day
      const today = getLocalDateString()
      if (data.todayDate !== today) {
        todayMorningDuas.value = new Set()
        todayEveningDuas.value = new Set()
      } else {
        todayMorningDuas.value = new Set(data.todayMorningDuas || [])
        todayEveningDuas.value = new Set(data.todayEveningDuas || [])
      }
    } else {
      // Initialize with all achievements locked
      achievements.value = allAchievements.map(a => ({ ...a, unlocked: false }))
    }
  }

  function saveToStorage() {
    const today = getLocalDateString()
    localStorage.setItem('gamification', JSON.stringify({
      points: points.value,
      level: level.value,
      streak: streak.value,
      lastQuizDate: lastQuizDate.value,
      lastDailyQuizDate: lastDailyQuizDate.value,
      achievements: achievements.value,
      stats: stats.value,
      readQuestionIds: Array.from(readQuestionIds.value),
      // Dua-specific storage
      readDuaIds: Array.from(readDuaIds.value),
      lastMorningAdhkarDate: lastMorningAdhkarDate.value,
      lastEveningAdhkarDate: lastEveningAdhkarDate.value,
      lastBothAdhkarDate: lastBothAdhkarDate.value,
      morningStreak: morningStreak.value,
      eveningStreak: eveningStreak.value,
      bothStreak: bothStreak.value,
      todayDate: today,
      todayMorningDuas: Array.from(todayMorningDuas.value),
      todayEveningDuas: Array.from(todayEveningDuas.value)
    }))
  }

  function awardPoints(amount, reason = '') {
    points.value += amount
    level.value = Math.max(1, Math.floor(points.value / 500) + 1)
    console.log(`🏆 +${amount} points (${reason})`)
    checkAchievements()
    saveToStorage()
  }

  function completeQuiz(score, accuracy, quizMode = null) {
    stats.value.quizzesCompleted++
    stats.value.totalPoints += score

    // Update average accuracy using cumulative sum
    stats.value.totalAccuracySum = (stats.value.totalAccuracySum || 0) + accuracy
    stats.value.avgAccuracy = Math.round(stats.value.totalAccuracySum / stats.value.quizzesCompleted)

    // Award points based on score
    awardPoints(score, 'Quiz completion')

    // Check daily quiz streak only for daily quiz mode
    if (quizMode === 'daily') {
      updateDailyStreak()
      lastDailyQuizDate.value = new Date().toISOString()
    }

    // awardPoints already calls checkAchievements + saveToStorage
  }

  function readQuestion(questionId) {
    // Only count unique questions
    if (!questionId || readQuestionIds.value.has(questionId)) {
      return // Already read this question
    }

    // Track this question as read
    readQuestionIds.value.add(questionId)
    stats.value.questionsRead++
    awardPoints(5, 'Question read')

    // Sync to Firebase leaderboard
    leaderboardService.submitActivity({
      points: 5,
      type: 'question_read',
      description: 'Question read'
    }).catch(err => console.warn('Failed to sync question read to leaderboard:', err))

    // awardPoints already calls checkAchievements
  }

  function createBookmark() {
    stats.value.bookmarksCreated++
    awardPoints(10, 'Bookmark created')

    // Sync to Firebase leaderboard
    leaderboardService.submitActivity({
      points: 10,
      type: 'bookmark_created',
      description: 'Bookmark created'
    }).catch(err => console.warn('Failed to sync bookmark to leaderboard:', err))

    // awardPoints already calls checkAchievements
  }

  function updateDailyStreak() {
    const today = getLocalDateString()
    const lastDate = lastQuizDate.value ? lastQuizDate.value : null
    const lastDateString = lastDate ? getLocalDateString(new Date(lastDate)) : null

    if (lastDateString === today) {
      // Already took quiz today
      return
    }

    lastQuizDate.value = new Date().toISOString()

    if (lastDateString) {
      const dayDiff = localDayDiff(today, lastDateString)
      if (dayDiff === 1) {
        // Consecutive day
        streak.value++
        stats.value.longestStreak = Math.max(stats.value.longestStreak, streak.value)
        awardPoints(100, `${streak.value}-day streak!`)
        console.log(`🔥 Streak: ${streak.value} days!`)

        // Sync streak bonus to Firebase
        leaderboardService.submitActivity({
          points: 100,
          type: 'quiz_streak',
          description: `${streak.value}-day quiz streak`
        }).catch(err => console.warn('Failed to sync quiz streak to leaderboard:', err))
      } else if (dayDiff > 1) {
        // Streak broken
        streak.value = 1
        awardPoints(50, 'Streak reset - welcome back!')

        // Sync welcome back bonus to Firebase
        leaderboardService.submitActivity({
          points: 50,
          type: 'welcome_back',
          description: 'Streak reset - welcome back'
        }).catch(err => console.warn('Failed to sync welcome back bonus to leaderboard:', err))
      }
    } else {
      // First daily quiz
      streak.value = 1
    }
  }

  // Reentrant guard for checkAchievements
  let _checkingAchievements = false

  function checkAchievements() {
    if (_checkingAchievements) return
    _checkingAchievements = true

    try {
      // Collect all newly qualifying achievements first
      const newlyUnlocked = []

      achievements.value.forEach(achievement => {
        if (achievement.unlocked) return

        const req = achievement.requirement
        let shouldUnlock = false

        switch (req.type) {
          case 'quiz':
            shouldUnlock = stats.value.quizzesCompleted >= req.count
            break
          case 'accuracy':
            shouldUnlock = stats.value.avgAccuracy >= req.count
            break
          case 'read':
            shouldUnlock = stats.value.questionsRead >= req.count
            break
          case 'streak':
            shouldUnlock = streak.value >= req.count
            break
          case 'bookmarks':
            shouldUnlock = stats.value.bookmarksCreated >= req.count
            break
          case 'daily-streak':
            shouldUnlock = streak.value >= req.count
            break
          // Dua achievement types
          case 'dua-read':
            shouldUnlock = stats.value.duasRead >= req.count
            break
          case 'morning-adhkar':
            shouldUnlock = stats.value.morningAdhkarDays >= req.count
            break
          case 'evening-adhkar':
            shouldUnlock = stats.value.eveningAdhkarDays >= req.count
            break
          case 'both-adhkar':
            shouldUnlock = stats.value.bothAdhkarDays >= req.count
            break
          case 'adhkar-streak':
            shouldUnlock = bothStreak.value >= req.count
            break
        }

        if (shouldUnlock) {
          newlyUnlocked.push(achievement)
        }
      })

      // Batch unlock: award points for all new achievements without re-entering
      for (const achievement of newlyUnlocked) {
        achievement.unlocked = true
        points.value += achievement.points
        console.log(`🎉 Achievement unlocked: ${achievement.name} (+${achievement.points} points)`)

        // Sync achievement bonus to Firebase
        leaderboardService.submitActivity({
          points: achievement.points,
          type: 'achievement',
          description: `Achievement: ${achievement.name}`
        }).catch(err => console.warn('Failed to sync achievement to leaderboard:', err))
      }

      if (newlyUnlocked.length > 0) {
        saveToStorage()
      }
    } finally {
      _checkingAchievements = false
    }
  }

  function getAchievement(id) {
    return achievements.value.find(a => a.id === id)
  }

  function hasTakenDailyQuizToday() {
    if (!lastDailyQuizDate.value) return false

    const today = getLocalDateString()
    const lastDaily = getLocalDateString(new Date(lastDailyQuizDate.value))

    return lastDaily === today
  }

  // ============ DUA METHODS ============

  /**
   * Track a dua being read
   * @param {string} duaId - The dua ID
   * @param {string} categoryId - The category ID (e.g., 'chapter_27_morning')
   */
  function readDua(duaId, categoryId = null) {
    if (!duaId) return

    // Track unique duas read
    const isNewDua = !readDuaIds.value.has(duaId)
    if (isNewDua) {
      readDuaIds.value.add(duaId)
      stats.value.duasRead++
      awardPoints(5, 'Dua read')

      // Sync to Firebase leaderboard
      leaderboardService.submitActivity({
        points: 5,
        type: 'dua_read',
        description: 'Dua read'
      }).catch(err => console.warn('Failed to sync dua read to leaderboard:', err))
    }

    // Track morning/evening adhkar progress
    if (categoryId) {
      if (categoryId.includes('morning') || categoryId === 'chapter_27_morning') {
        todayMorningDuas.value.add(duaId)
        checkMorningAdhkarCompletion()
      } else if (categoryId.includes('evening') || categoryId === 'chapter_27_evening') {
        todayEveningDuas.value.add(duaId)
        checkEveningAdhkarCompletion()
      }
    }

    // awardPoints already calls checkAchievements
    saveToStorage()
  }

  /**
   * Set the total number of duas in morning adhkar
   */
  function setMorningAdhkarTotal(total) {
    morningAdhkarTotal.value = total
  }

  /**
   * Set the total number of duas in evening adhkar
   */
  function setEveningAdhkarTotal(total) {
    eveningAdhkarTotal.value = total
  }

  /**
   * Check if morning adhkar is complete for today
   */
  function checkMorningAdhkarCompletion() {
    const today = getLocalDateString()

    // Already completed today
    if (lastMorningAdhkarDate.value === today) return

    // Check if all morning duas are read
    if (todayMorningDuas.value.size >= morningAdhkarTotal.value) {
      completeMorningAdhkar()
    }
  }

  /**
   * Check if evening adhkar is complete for today
   */
  function checkEveningAdhkarCompletion() {
    const today = getLocalDateString()

    // Already completed today
    if (lastEveningAdhkarDate.value === today) return

    // Check if all evening duas are read
    if (todayEveningDuas.value.size >= eveningAdhkarTotal.value) {
      completeEveningAdhkar()
    }
  }

  /**
   * Mark morning adhkar as complete
   */
  function completeMorningAdhkar() {
    const today = getLocalDateString()

    // Don't double-count
    if (lastMorningAdhkarDate.value === today) return

    // Update streak
    const lastDate = lastMorningAdhkarDate.value
    if (lastDate) {
      const dayDiff = localDayDiff(today, lastDate)
      if (dayDiff === 1) {
        morningStreak.value++
      } else if (dayDiff > 1) {
        morningStreak.value = 1
      }
    } else {
      morningStreak.value = 1
    }

    lastMorningAdhkarDate.value = today
    stats.value.morningAdhkarDays++

    // Award bonus points for completing ALL morning duas
    awardPoints(20, 'Morning adhkar complete!')
    console.log(`🌅 Morning adhkar complete! Streak: ${morningStreak.value} days`)

    // Sync to Firebase leaderboard
    leaderboardService.submitActivity({
      points: 20,
      type: 'morning_adhkar',
      description: 'Morning adhkar complete'
    }).catch(err => console.warn('Failed to sync morning adhkar to leaderboard:', err))

    // Check if both are done today
    checkBothAdhkarCompletion()
    // awardPoints already calls checkAchievements
    saveToStorage()
  }

  /**
   * Mark evening adhkar as complete
   */
  function completeEveningAdhkar() {
    const today = getLocalDateString()

    // Don't double-count
    if (lastEveningAdhkarDate.value === today) return

    // Update streak
    const lastDate = lastEveningAdhkarDate.value
    if (lastDate) {
      const dayDiff = localDayDiff(today, lastDate)
      if (dayDiff === 1) {
        eveningStreak.value++
      } else if (dayDiff > 1) {
        eveningStreak.value = 1
      }
    } else {
      eveningStreak.value = 1
    }

    lastEveningAdhkarDate.value = today
    stats.value.eveningAdhkarDays++

    // Award bonus points for completing ALL evening duas
    awardPoints(20, 'Evening adhkar complete!')
    console.log(`🌆 Evening adhkar complete! Streak: ${eveningStreak.value} days`)

    // Sync to Firebase leaderboard
    leaderboardService.submitActivity({
      points: 20,
      type: 'evening_adhkar',
      description: 'Evening adhkar complete'
    }).catch(err => console.warn('Failed to sync evening adhkar to leaderboard:', err))

    // Check if both are done today
    checkBothAdhkarCompletion()
    // awardPoints already calls checkAchievements
    saveToStorage()
  }

  /**
   * Check if both morning and evening adhkar are complete today
   */
  function checkBothAdhkarCompletion() {
    const today = getLocalDateString()

    const morningDone = lastMorningAdhkarDate.value === today
    const eveningDone = lastEveningAdhkarDate.value === today

    if (morningDone && eveningDone) {
      // Check if this is a new "both" completion (not already counted today)
      if (lastBothAdhkarDate.value !== today) {
        const previousBothDate = lastBothAdhkarDate.value
        lastBothAdhkarDate.value = today
        stats.value.bothAdhkarDays++

        // Update both streak
        if (previousBothDate) {
          const dayDiff = localDayDiff(today, previousBothDate)
          if (dayDiff === 1) {
            bothStreak.value++
            stats.value.longestAdhkarStreak = Math.max(stats.value.longestAdhkarStreak, bothStreak.value)
            awardPoints(30, `${bothStreak.value}-day adhkar streak!`)

            // Sync streak bonus to Firebase
            leaderboardService.submitActivity({
              points: 30,
              type: 'adhkar_streak',
              description: `${bothStreak.value}-day adhkar streak`
            }).catch(err => console.warn('Failed to sync streak bonus to leaderboard:', err))
          } else {
            bothStreak.value = 1
          }
        } else {
          bothStreak.value = 1
        }

        // Bonus for completing both in one day
        awardPoints(25, 'Both morning & evening adhkar complete!')
        console.log(`✨ Both adhkar complete! Streak: ${bothStreak.value} days`)

        // Sync both adhkar bonus to Firebase
        leaderboardService.submitActivity({
          points: 25,
          type: 'both_adhkar',
          description: 'Both morning & evening adhkar complete'
        }).catch(err => console.warn('Failed to sync both adhkar bonus to leaderboard:', err))
      }
    }
  }

  /**
   * Check if morning adhkar is complete today
   */
  function hasDoneMorningAdhkarToday() {
    const today = getLocalDateString()
    return lastMorningAdhkarDate.value === today
  }

  /**
   * Check if evening adhkar is complete today
   */
  function hasDoneEveningAdhkarToday() {
    const today = getLocalDateString()
    return lastEveningAdhkarDate.value === today
  }

  /**
   * Get morning adhkar progress for today
   */
  function getMorningProgress() {
    return {
      completed: todayMorningDuas.value.size,
      total: morningAdhkarTotal.value,
      percent: Math.round((todayMorningDuas.value.size / morningAdhkarTotal.value) * 100),
      isComplete: hasDoneMorningAdhkarToday()
    }
  }

  /**
   * Get evening adhkar progress for today
   */
  function getEveningProgress() {
    return {
      completed: todayEveningDuas.value.size,
      total: eveningAdhkarTotal.value,
      percent: Math.round((todayEveningDuas.value.size / eveningAdhkarTotal.value) * 100),
      isComplete: hasDoneEveningAdhkarToday()
    }
  }

  function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      points.value = 0
      streak.value = 0
      lastQuizDate.value = null
      lastDailyQuizDate.value = null
      achievements.value = allAchievements.map(a => ({ ...a, unlocked: false }))
      stats.value = {
        totalPoints: 0,
        quizzesCompleted: 0,
        questionsRead: 0,
        bookmarksCreated: 0,
        avgAccuracy: 0,
        totalAccuracySum: 0,
        longestStreak: 0,
        duasRead: 0,
        morningAdhkarDays: 0,
        eveningAdhkarDays: 0,
        bothAdhkarDays: 0,
        longestAdhkarStreak: 0
      }
      // Reset dua state
      readDuaIds.value = new Set()
      lastMorningAdhkarDate.value = null
      lastEveningAdhkarDate.value = null
      lastBothAdhkarDate.value = null
      morningStreak.value = 0
      eveningStreak.value = 0
      bothStreak.value = 0
      todayMorningDuas.value = new Set()
      todayEveningDuas.value = new Set()
      localStorage.removeItem('gamification')
      localStorage.removeItem('lastBothAdhkarDate')
    }
  }

  return {
    // State
    points,
    level,
    streak,
    lastQuizDate,
    lastDailyQuizDate,
    achievements,
    stats,
    tiers,
    // Dua state
    morningStreak,
    eveningStreak,
    bothStreak,
    todayMorningDuas,
    todayEveningDuas,

    // Computed
    currentLevel,
    pointsToNextLevel,
    levelProgress,
    unlockedAchievements,
    lockedAchievements,
    currentTier,
    nextTier,
    tierProgress,

    // Methods
    initializeFromStorage,
    saveToStorage,
    awardPoints,
    completeQuiz,
    readQuestion,
    createBookmark,
    checkAchievements,
    getAchievement,
    hasTakenDailyQuizToday,
    resetProgress,
    // Dua methods
    readDua,
    setMorningAdhkarTotal,
    setEveningAdhkarTotal,
    completeMorningAdhkar,
    completeEveningAdhkar,
    hasDoneMorningAdhkarToday,
    hasDoneEveningAdhkarToday,
    getMorningProgress,
    getEveningProgress
  }
})
