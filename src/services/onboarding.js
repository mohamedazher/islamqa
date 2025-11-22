/**
 * Onboarding Service
 * Manages user onboarding and tutorial completion status
 */

const STORAGE_KEY = 'app_onboarding'
const ONBOARDING_VERSION = '1.0' // Increment to re-show onboarding

/**
 * Onboarding status structure
 * @typedef {Object} OnboardingStatus
 * @property {boolean} completed - Whether onboarding is completed
 * @property {string} version - Onboarding version
 * @property {number} timestamp - When onboarding was completed
 */

/**
 * Get onboarding status from localStorage
 * @returns {OnboardingStatus}
 */
export function getOnboardingStatus() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return {
        completed: false,
        version: null,
        timestamp: null
      }
    }

    const status = JSON.parse(stored)

    // Check if onboarding version is outdated
    if (status.version !== ONBOARDING_VERSION) {
      console.log('[Onboarding] Version outdated, resetting...')
      return {
        completed: false,
        version: null,
        timestamp: null
      }
    }

    return status
  } catch (error) {
    console.error('[Onboarding] Error reading status:', error)
    return {
      completed: false,
      version: null,
      timestamp: null
    }
  }
}

/**
 * Mark onboarding as completed
 */
export function completeOnboarding() {
  try {
    const status = {
      completed: true,
      version: ONBOARDING_VERSION,
      timestamp: Date.now()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(status))
    console.log('[Onboarding] Marked as completed')
    return status
  } catch (error) {
    console.error('[Onboarding] Error saving completion:', error)
    return null
  }
}

/**
 * Check if onboarding should be shown
 * @returns {boolean}
 */
export function shouldShowOnboarding() {
  const status = getOnboardingStatus()
  return !status.completed
}

/**
 * Reset onboarding (for testing or re-showing tutorial)
 */
export function resetOnboarding() {
  localStorage.removeItem(STORAGE_KEY)
  console.log('[Onboarding] Reset')
}

/**
 * Skip onboarding without marking as completed
 */
export function skipOnboarding() {
  completeOnboarding()
  console.log('[Onboarding] Skipped')
}

/**
 * Onboarding slides data
 */
export function getOnboardingSlides() {
  return [
    {
      id: 'welcome',
      icon: 'book',
      title: 'Welcome to BetterIslam Q&A',
      description: 'Access 11,000+ authentic Islamic Q&A completely offline. Browse categories, search questions, and learn at your own pace.',
      image: null,
      color: 'primary',
      type: 'info'
    },
    {
      id: 'browse',
      icon: 'collection',
      title: 'Browse Categories',
      description: 'Explore 269 categories covering all aspects of Islam. From prayer to business, find answers to your questions organized by topic.',
      image: null,
      color: 'accent',
      type: 'info'
    },
    {
      id: 'search',
      icon: 'search',
      title: 'Powerful Search',
      description: 'Search across thousands of questions instantly. Find exactly what you\'re looking for with our fast offline search.',
      image: null,
      color: 'primary',
      type: 'info'
    },
    {
      id: 'bookmarks',
      icon: 'bookmark',
      title: 'Save Your Favorites',
      description: 'Bookmark important questions for quick access. Create custom folders to organize your saved content.',
      image: null,
      color: 'accent',
      type: 'info'
    },
    {
      id: 'quiz',
      icon: 'lightning',
      title: 'Test Your Knowledge',
      description: 'Take quizzes to test your Islamic knowledge. Track your progress and compete on the leaderboard.',
      image: null,
      color: 'primary',
      type: 'info'
    },
    {
      id: 'privacy',
      icon: 'shield',
      title: 'Your Privacy Matters',
      description: 'We respect your privacy. Choose whether to share anonymous usage data to help us improve the app.',
      image: null,
      color: 'accent',
      type: 'privacy'
    },
    {
      id: 'offline',
      icon: 'download',
      title: '100% Offline Access',
      description: 'Everything works offline - no internet needed! All content is stored locally on your device for instant access anytime, anywhere.',
      image: null,
      color: 'primary',
      type: 'info'
    },
    {
      id: 'import',
      icon: 'download',
      title: 'Setup Your Database',
      description: 'Let\'s import 15000+ Islamic Q&A items to your device. This takes a few minutes and enables full offline access.',
      image: null,
      color: 'accent',
      type: 'import'
    }
  ]
}

export default {
  getOnboardingStatus,
  completeOnboarding,
  shouldShowOnboarding,
  resetOnboarding,
  skipOnboarding,
  getOnboardingSlides
}
