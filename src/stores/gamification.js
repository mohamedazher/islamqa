import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Gamification Store - Tracks points, achievements, and user engagement
 */
export const useGamificationStore = defineStore('gamification', () => {
  // State
  const points = ref(0)
  const level = ref(1)
  const streak = ref(0)
  const lastQuizDate = ref(null)
  const achievements = ref([])
  const quizzesTaken = ref(0)
  const questionsRead = ref(0)

  const stats = ref({
    totalPoints: 0,
    quizzesCompleted: 0,
    questionsRead: 0,
    bookmarksCreated: 0,
    avgAccuracy: 0,
    longestStreak: 0
  })

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

  // Actions
  function initializeFromStorage() {
    const stored = localStorage.getItem('gamification')
    if (stored) {
      const data = JSON.parse(stored)
      points.value = data.points || 0
      streak.value = data.streak || 0
      lastQuizDate.value = data.lastQuizDate || null
      achievements.value = data.achievements || allAchievements.map(a => ({ ...a }))
      stats.value = data.stats || stats.value
    } else {
      // Initialize with all achievements locked
      achievements.value = allAchievements.map(a => ({ ...a, unlocked: false }))
    }
  }

  function saveToStorage() {
    localStorage.setItem('gamification', JSON.stringify({
      points: points.value,
      streak: points.value,
      lastQuizDate: lastQuizDate.value,
      achievements: achievements.value,
      stats: stats.value
    }))
  }

  function awardPoints(amount, reason = '') {
    points.value += amount
    console.log(`🏆 +${amount} points (${reason})`)
    checkAchievements()
    saveToStorage()
  }

  function completeQuiz(score, accuracy) {
    stats.value.quizzesCompleted++
    stats.value.totalPoints += score

    // Update average accuracy
    const newAvg = (stats.value.avgAccuracy * (stats.value.quizzesCompleted - 1) + accuracy) / stats.value.quizzesCompleted
    stats.value.avgAccuracy = Math.round(newAvg)

    // Award points based on score
    awardPoints(score, 'Quiz completion')

    // Check daily quiz streak
    updateDailyStreak()
    checkAchievements()
    saveToStorage()
  }

  function readQuestion() {
    stats.value.questionsRead++
    awardPoints(5, 'Question read')
    checkAchievements()
  }

  function createBookmark() {
    stats.value.bookmarksCreated++
    awardPoints(10, 'Bookmark created')
    checkAchievements()
  }

  function updateDailyStreak() {
    const today = new Date().toISOString().split('T')[0]
    const lastDate = lastQuizDate.value ? new Date(lastQuizDate.value) : null
    const lastDateString = lastDate ? lastDate.toISOString().split('T')[0] : null

    if (lastDateString === today) {
      // Already took quiz today
      return
    }

    lastQuizDate.value = new Date().toISOString()

    if (lastDate) {
      const dayDiff = Math.floor((new Date(today) - new Date(lastDateString)) / (1000 * 60 * 60 * 24))
      if (dayDiff === 1) {
        // Consecutive day
        streak.value++
        stats.value.longestStreak = Math.max(stats.value.longestStreak, streak.value)
        awardPoints(100, `${streak.value}-day streak!`)
        console.log(`🔥 Streak: ${streak.value} days!`)
      } else if (dayDiff > 1) {
        // Streak broken
        streak.value = 1
        awardPoints(50, 'Streak reset - welcome back!')
      }
    } else {
      // First daily quiz
      streak.value = 1
    }
  }

  function checkAchievements() {
    achievements.value.forEach(achievement => {
      if (achievement.unlocked) return // Already unlocked

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
          shouldUnlock = streak.value >= req.count && streak.value % 5 === 0
          break
      }

      if (shouldUnlock) {
        achievement.unlocked = true
        awardPoints(achievement.points, `Achievement: ${achievement.name}`)
        console.log(`🎉 Achievement unlocked: ${achievement.name}`)
      }
    })
  }

  function getAchievement(id) {
    return achievements.value.find(a => a.id === id)
  }

  function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      points.value = 0
      streak.value = 0
      lastQuizDate.value = null
      achievements.value = allAchievements.map(a => ({ ...a, unlocked: false }))
      stats.value = {
        totalPoints: 0,
        quizzesCompleted: 0,
        questionsRead: 0,
        bookmarksCreated: 0,
        avgAccuracy: 0,
        longestStreak: 0
      }
      localStorage.removeItem('gamification')
    }
  }

  return {
    // State
    points,
    level,
    streak,
    lastQuizDate,
    achievements,
    stats,

    // Computed
    currentLevel,
    pointsToNextLevel,
    unlockedAchievements,
    lockedAchievements,

    // Methods
    initializeFromStorage,
    saveToStorage,
    awardPoints,
    completeQuiz,
    readQuestion,
    createBookmark,
    checkAchievements,
    getAchievement,
    resetProgress
  }
})
