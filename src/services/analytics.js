/**
 * Firebase Analytics Service
 * Works seamlessly across Web, iOS, and Android platforms
 * Privacy-compliant: Respects user consent preferences
 *
 * Usage in Vue components:
 *   import { useAnalytics } from '@/services/analytics'
 *   const { logScreen, logEvent } = useAnalytics()
 *   logScreen('category_list')
 *   logEvent('question_viewed', { question_id: 123 })
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, logEvent as firebaseLogEvent, setUserId as firebaseSetUserId, setUserProperties as firebaseSetUserProperties, setAnalyticsCollectionEnabled } from 'firebase/analytics'
import { isAnalyticsEnabled } from './privacyConsent'

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
let analyticsEnabled = false
const isCordova = !!window.cordova
const isWeb = !isCordova

/**
 * Initialize Firebase Analytics
 * Only collects data if user has consented
 */
export function initializeAnalytics() {
  if (isInitialized) {
    console.log('[Analytics] Already initialized')
    return
  }

  // Check user consent
  analyticsEnabled = isAnalyticsEnabled()
  console.log('[Analytics] User consent status:', analyticsEnabled ? 'Granted' : 'Denied')

  if (isWeb) {
    // Initialize Firebase Web SDK
    try {
      // Check if Firebase app already exists, otherwise initialize
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
      analyticsInstance = getAnalytics(app)

      // Set collection enabled based on consent
      setAnalyticsCollectionEnabled(analyticsInstance, analyticsEnabled)

      isInitialized = true
      console.log('[Analytics] ✅ Firebase Web SDK initialized (collection:', analyticsEnabled ? 'enabled' : 'disabled', ')')
    } catch (error) {
      console.error('[Analytics] ❌ Web initialization error:', error)
    }
  } else {
    // Cordova plugin initializes automatically
    if (window.FirebasePlugin) {
      // Set collection enabled for Cordova
      window.FirebasePlugin.setAnalyticsCollectionEnabled(analyticsEnabled)
      isInitialized = true
      console.log('[Analytics] ✅ Firebase Cordova plugin ready (collection:', analyticsEnabled ? 'enabled' : 'disabled', ')')
    } else {
      console.warn('[Analytics] ⚠️ Firebase Cordova plugin not found')
    }
  }

  // Listen for consent changes
  window.addEventListener('consent-changed', handleConsentChange)
}

/**
 * Handle consent preference changes
 * @param {CustomEvent} event
 */
function handleConsentChange(event) {
  const newConsent = event.detail
  const newAnalyticsEnabled = newConsent.analytics

  if (newAnalyticsEnabled === analyticsEnabled) {
    return // No change
  }

  analyticsEnabled = newAnalyticsEnabled
  console.log('[Analytics] Consent changed, analytics now:', analyticsEnabled ? 'enabled' : 'disabled')

  if (isInitialized) {
    if (isWeb && analyticsInstance) {
      setAnalyticsCollectionEnabled(analyticsInstance, analyticsEnabled)
    } else if (window.FirebasePlugin) {
      window.FirebasePlugin.setAnalyticsCollectionEnabled(analyticsEnabled)
    }
  }
}

/**
 * Enable or disable analytics collection
 * @param {boolean} enabled
 */
export function setEnabled(enabled) {
  analyticsEnabled = enabled

  if (isInitialized) {
    if (isWeb && analyticsInstance) {
      setAnalyticsCollectionEnabled(analyticsInstance, enabled)
      console.log('[Analytics] Collection', enabled ? 'enabled' : 'disabled')
    } else if (window.FirebasePlugin) {
      window.FirebasePlugin.setAnalyticsCollectionEnabled(enabled)
      console.log('[Analytics] Collection', enabled ? 'enabled' : 'disabled')
    }
  }
}

/**
 * Check if analytics is currently enabled
 * @returns {boolean}
 */
export function isEnabled() {
  return analyticsEnabled
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
    if (!isInitialized || !analyticsEnabled) {
      // Silently skip if not consented
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
    if (!isInitialized || !analyticsEnabled) {
      // Silently skip if not consented
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
    if (!isInitialized || !analyticsEnabled) {
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
    if (!isInitialized || !analyticsEnabled) {
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
    setEnabled,
    isEnabled,
    isCordova,
    isWeb
  }
}

// Export for direct use outside Vue components
export default {
  initialize: initializeAnalytics,
  useAnalytics
}
