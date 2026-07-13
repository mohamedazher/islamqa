/**
 * Privacy & Consent Management Service
 * Manages user consent for analytics and data collection
 * GDPR and privacy-compliant implementation
 */

const STORAGE_KEY = 'privacy_consent'
const CONSENT_VERSION = '2.0' // Increment when privacy policy changes

/**
 * Consent preferences structure
 * @typedef {Object} ConsentPreferences
 * @property {boolean} analytics - Firebase Analytics enabled
 * @property {boolean} crashReporting - Crash reporting enabled (future)
 * @property {boolean} clarity - Microsoft Clarity session analytics enabled on Android
 * @property {boolean} leaderboard - Firebase leaderboard participation enabled
 * @property {boolean} onlineSearch - Sending Ask Islam queries to the HAL search service enabled
 * @property {boolean} locationServices - Sending coordinates to Nominatim for place names enabled
 * @property {string} version - Consent version
 * @property {number} timestamp - When consent was given
 * @property {boolean} askedUser - Whether user has been asked
 */

/**
 * Default consent state (opt-out by default for privacy)
 */
const DEFAULT_CONSENT = {
  analytics: false,
  crashReporting: false,
  clarity: false,
  leaderboard: false,
  onlineSearch: false,
  locationServices: false,
  version: CONSENT_VERSION,
  timestamp: null,
  askedUser: false
}

/**
 * Get current consent preferences from localStorage
 * @returns {ConsentPreferences}
 */
export function getConsentPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { ...DEFAULT_CONSENT }
    }

    const consent = JSON.parse(stored)

    // Check if consent version is outdated
    if (consent.version !== CONSENT_VERSION) {
      console.log('[Privacy] Consent version outdated, resetting...')
      return { ...DEFAULT_CONSENT }
    }

    return { ...DEFAULT_CONSENT, ...consent }
  } catch (error) {
    console.error('[Privacy] Error reading consent preferences:', error)
    return { ...DEFAULT_CONSENT }
  }
}

/**
 * Save consent preferences to localStorage
 * @param {ConsentPreferences} preferences
 */
export function saveConsentPreferences(preferences) {
  try {
    const consent = {
      ...preferences,
      version: CONSENT_VERSION,
      timestamp: Date.now(),
      askedUser: true
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    console.log('[Privacy] Consent preferences saved:', consent)

    // Dispatch custom event for reactive updates
    window.dispatchEvent(new CustomEvent('consent-changed', { detail: consent }))

    return consent
  } catch (error) {
    console.error('[Privacy] Error saving consent preferences:', error)
    return null
  }
}

/**
 * Check if user has been asked for consent
 * @returns {boolean}
 */
export function hasUserBeenAsked() {
  const consent = getConsentPreferences()
  return consent.askedUser
}

/**
 * Check if analytics is enabled
 * @returns {boolean}
 */
export function isAnalyticsEnabled() {
  const consent = getConsentPreferences()
  return consent.analytics
}

/**
 * Check if crash reporting is enabled
 * @returns {boolean}
 */
export function isCrashReportingEnabled() {
  const consent = getConsentPreferences()
  return consent.crashReporting
}

export function isClarityEnabled() {
  return getConsentPreferences().clarity === true
}

export function isLeaderboardEnabled() {
  return getConsentPreferences().leaderboard === true
}

export function isOnlineSearchEnabled() {
  return getConsentPreferences().onlineSearch === true
}

export function isLocationServicesEnabled() {
  return getConsentPreferences().locationServices === true
}

/**
 * Grant all permissions
 * @returns {ConsentPreferences}
 */
export function acceptAll() {
  return saveConsentPreferences({
    analytics: true,
    crashReporting: false,
    clarity: true,
    leaderboard: false,
    onlineSearch: false,
    locationServices: false
  })
}

/**
 * Reject all permissions (except essential)
 * @returns {ConsentPreferences}
 */
export function rejectAll() {
  return saveConsentPreferences({
    analytics: false,
    crashReporting: false,
    clarity: false,
    leaderboard: false,
    onlineSearch: false,
    locationServices: false
  })
}

/**
 * Update specific consent preference
 * @param {string} key - Preference key (analytics, crashReporting)
 * @param {boolean} value - New value
 * @returns {ConsentPreferences}
 */
export function updateConsent(key, value) {
  const current = getConsentPreferences()
  return saveConsentPreferences({
    ...current,
    [key]: value
  })
}

/**
 * Reset all consent preferences (for testing/debugging)
 */
export function resetConsent() {
  localStorage.removeItem(STORAGE_KEY)
  console.log('[Privacy] Consent reset')
  window.dispatchEvent(new CustomEvent('consent-changed', { detail: DEFAULT_CONSENT }))
}

/**
 * Get privacy information for display
 * @returns {Object}
 */
export function getPrivacyInfo() {
  return {
    dataCollected: [
      {
        category: 'Analytics',
        items: [
          'Screen views and navigation patterns',
          'Question views and bookmark actions',
          'App performance metrics',
          'Device type and platform (Android/iOS/Web)'
        ],
        purpose: 'To understand how users interact with the app and improve user experience',
        retention: '14 months (automatically deleted after)',
        required: false
      },
      {
        category: 'Online features (separate opt-ins)',
        items: [
          'Ask Islam can send the exact query to the HAL search service for semantic matching',
          'Prayer location can send exact coordinates to OpenStreetMap Nominatim to obtain a city name',
          'Leaderboard participation creates an anonymous Firebase account and uploads your chosen display name, scores and activity',
          'Feedback sends the email address, message and feedback type you enter; optional diagnostics are sent only if selected'
        ],
        purpose: 'To provide features that require a network service. Each feature is disclosed and controlled separately.',
        retention: 'Controlled by the receiving service; see its privacy policy',
        required: false
      },
      {
        category: 'Essential Data',
        items: [
          'App preferences (theme, settings)',
          'Bookmarks and custom folders',
          'Offline database cache'
        ],
        purpose: 'Required for core app functionality',
        retention: 'Until you clear app data',
        required: true
      }
    ],
    dataNotCollected: [
      'Personal information unless you deliberately submit it through Feedback',
      'Location data unless you deliberately enable online place-name lookup',
      'Contact information',
      'Photos or media files',
      'Payment information',
      'Browsing history outside this app'
    ],
    thirdPartyServices: [
      {
        name: 'Google Firebase Analytics',
        purpose: 'Anonymous usage analytics',
        link: 'https://firebase.google.com/support/privacy'
      },
      {
        name: 'Google Firebase Authentication and Firestore',
        purpose: 'Optional leaderboard account, display name, score and activity synchronization',
        link: 'https://firebase.google.com/support/privacy'
      },
      {
        name: 'Microsoft Clarity',
        purpose: 'Optional Android session and interaction analytics',
        link: 'https://privacy.microsoft.com/privacystatement'
      },
      {
        name: 'HAL integrations service',
        purpose: 'Optional semantic search queries and feedback delivery',
        link: 'https://www.halsimplify.com/privacy-policy'
      },
      {
        name: 'OpenStreetMap Nominatim',
        purpose: 'Optional reverse geocoding of exact coordinates to a place name',
        link: 'https://osmfoundation.org/wiki/Privacy_Policy'
      }
    ],
    userRights: [
      'You can opt out of analytics at any time',
      'You can request data deletion',
      'Your data is never sold to third parties',
      'No personal identification is collected'
    ]
  }
}

/**
 * Vue composable for consent management
 */
export function usePrivacyConsent() {
  const consent = getConsentPreferences()

  return {
    consent,
    hasBeenAsked: hasUserBeenAsked(),
    isAnalyticsEnabled: isAnalyticsEnabled(),
    isCrashReportingEnabled: isCrashReportingEnabled(),
    isClarityEnabled: isClarityEnabled(),
    isLeaderboardEnabled: isLeaderboardEnabled(),
    isOnlineSearchEnabled: isOnlineSearchEnabled(),
    isLocationServicesEnabled: isLocationServicesEnabled(),
    acceptAll,
    rejectAll,
    updateConsent,
    saveConsentPreferences,
    getPrivacyInfo,
    resetConsent
  }
}

export default {
  getConsentPreferences,
  saveConsentPreferences,
  hasUserBeenAsked,
  isAnalyticsEnabled,
  isCrashReportingEnabled,
  isClarityEnabled,
  isLeaderboardEnabled,
  isOnlineSearchEnabled,
  isLocationServicesEnabled,
  acceptAll,
  rejectAll,
  updateConsent,
  resetConsent,
  getPrivacyInfo,
  usePrivacyConsent
}
