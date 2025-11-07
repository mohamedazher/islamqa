/**
 * Firebase Analytics Service
 * Works seamlessly across Web, iOS, and Android platforms
 *
 * Usage in Vue components:
 *   import { useAnalytics } from '@/services/analytics'
 *   const { logScreen, logEvent } = useAnalytics()
 *   logScreen('category_list')
 *   logEvent('question_viewed', { question_id: 123 })
 */

import { initializeApp } from 'firebase/app'
import { getAnalytics, logEvent as firebaseLogEvent, setUserId as firebaseSetUserId, setUserProperties as firebaseSetUserProperties } from 'firebase/analytics'

// Firebase web config
const firebaseConfig = {
  apiKey: "AIzaSyAOc2d3NPbuWzF5rWE3Fx8Ij7EGm4dFNT8",
  authDomain: "betterislamqa.firebaseapp.com",
  projectId: "betterislamqa",
  storageBucket: "betterislamqa.firebasestorage.app",
  messagingSenderId: "1062208000513",
  appId: "1:1062208000513:web:d7c0b7697df2ab88d12600",
  measurementId: "G-99MZ5VYR07"
}

let analyticsInstance = null
let isInitialized = false
const isCordova = !!window.cordova
const isWeb = !isCordova

/**
 * Initialize Firebase Analytics
 */
export function initializeAnalytics() {
  if (isInitialized) {
    console.log('[Analytics] Already initialized')
    return
  }

  if (isWeb) {
    // Initialize Firebase Web SDK
    try {
      const app = initializeApp(firebaseConfig)
      analyticsInstance = getAnalytics(app)
      isInitialized = true
      console.log('[Analytics] ✅ Firebase Web SDK initialized')
    } catch (error) {
      console.error('[Analytics] ❌ Web initialization error:', error)
    }
  } else {
    // Cordova plugin initializes automatically
    if (window.FirebasePlugin) {
      isInitialized = true
      console.log('[Analytics] ✅ Firebase Cordova plugin ready')
    } else {
      console.warn('[Analytics] ⚠️ Firebase Cordova plugin not found')
    }
  }
}

/**
 * Vue composable for Firebase Analytics
 */
export function useAnalytics() {
  /**
   * Log a screen view
   * @param {string} screenName - Name of the screen/view
   * @param {object} additionalParams - Additional parameters
   */
  const logScreen = (screenName, additionalParams = {}) => {
    if (!isInitialized) {
      console.warn('[Analytics] Not initialized, skipping screen log')
      return
    }

    const params = {
      screen_name: screenName,
      screen_class: screenName,
      ...additionalParams
    }

    if (isWeb && analyticsInstance) {
      firebaseLogEvent(analyticsInstance, 'screen_view', params)
      console.log('[Analytics] 📊 Screen view:', screenName)
    } else if (window.FirebasePlugin) {
      window.FirebasePlugin.logEvent('screen_view', params)
      console.log('[Analytics] 📊 Screen view:', screenName)
    }
  }

  /**
   * Log a custom event
   * @param {string} eventName - Name of the event
   * @param {object} params - Event parameters
   */
  const logEvent = (eventName, params = {}) => {
    if (!isInitialized) {
      console.warn('[Analytics] Not initialized, skipping event log')
      return
    }

    if (isWeb && analyticsInstance) {
      firebaseLogEvent(analyticsInstance, eventName, params)
      console.log('[Analytics] 📊 Event:', eventName, params)
    } else if (window.FirebasePlugin) {
      window.FirebasePlugin.logEvent(eventName, params)
      console.log('[Analytics] 📊 Event:', eventName, params)
    }
  }

  /**
   * Set user properties
   * @param {object} properties - User properties object
   */
  const setUserProperties = (properties) => {
    if (!isInitialized) {
      console.warn('[Analytics] Not initialized, skipping user properties')
      return
    }

    if (isWeb && analyticsInstance) {
      firebaseSetUserProperties(analyticsInstance, properties)
      console.log('[Analytics] 👤 User properties:', properties)
    } else if (window.FirebasePlugin) {
      Object.keys(properties).forEach(key => {
        window.FirebasePlugin.setUserProperty(key, String(properties[key]))
      })
      console.log('[Analytics] 👤 User properties:', properties)
    }
  }

  /**
   * Set user ID
   * @param {string} userId - Unique user identifier
   */
  const setUserId = (userId) => {
    if (!isInitialized) {
      console.warn('[Analytics] Not initialized, skipping user ID')
      return
    }

    if (isWeb && analyticsInstance) {
      firebaseSetUserId(analyticsInstance, userId)
      console.log('[Analytics] 👤 User ID set:', userId)
    } else if (window.FirebasePlugin) {
      window.FirebasePlugin.setUserId(userId)
      console.log('[Analytics] 👤 User ID set:', userId)
    }
  }

  /**
   * Track search queries
   * @param {string} searchTerm - The search query
   * @param {number} resultCount - Number of results
   */
  const logSearch = (searchTerm, resultCount = 0) => {
    logEvent('search', {
      search_term: searchTerm,
      result_count: resultCount
    })
  }

  /**
   * Track question viewed
   * @param {number} questionId - Question ID
   * @param {string} category - Category name
   */
  const logQuestionView = (questionId, category = '') => {
    logEvent('question_viewed', {
      question_id: questionId,
      category: category
    })
  }

  /**
   * Track category browsed
   * @param {string} categoryName - Category name
   * @param {number} categoryId - Category ID
   */
  const logCategoryView = (categoryName, categoryId) => {
    logEvent('category_viewed', {
      category_name: categoryName,
      category_id: categoryId
    })
  }

  /**
   * Track folder operations
   * @param {string} action - 'create', 'add_question', 'remove_question', 'delete'
   * @param {string} folderName - Folder name
   */
  const logFolderAction = (action, folderName) => {
    logEvent('folder_action', {
      action: action,
      folder_name: folderName
    })
  }

  /**
   * Track share action
   * @param {string} contentType - 'question', 'answer'
   * @param {number} contentId - Content ID
   */
  const logShare = (contentType, contentId) => {
    logEvent('share', {
      content_type: contentType,
      content_id: contentId
    })
  }

  /**
   * Track quiz events
   * @param {string} action - 'start', 'complete', 'answer'
   * @param {object} params - Additional params
   */
  const logQuizEvent = (action, params = {}) => {
    logEvent(`quiz_${action}`, params)
  }

  return {
    logScreen,
    logEvent,
    logSearch,
    logQuestionView,
    logCategoryView,
    logFolderAction,
    logShare,
    logQuizEvent,
    setUserProperties,
    setUserId,
    isCordova,
    isWeb
  }
}

// Export for direct use outside Vue components
export default {
  initialize: initializeAnalytics,
  useAnalytics
}
