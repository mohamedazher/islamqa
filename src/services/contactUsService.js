/**
 * Contact Us Service
 * Handles sending feedback and contact messages via webhook
 */

// Simple authentication token (the webhook URL itself is the main security)
const APP_TOKEN = 'biqa_app_v2_2024'

/**
 * Generate simple base64 token for basic authentication
 * Lightweight approach - webhook URL is the main security mechanism
 */
function generateAppToken() {
  const timestamp = Math.floor(Date.now() / 60000) // Current minute
  const token = `${APP_TOKEN}:${timestamp}`
  return btoa(token) // Base64 encode
}

/**
 * Collect comprehensive device and platform information
 * Helps understand user demographics and device types
 */
function collectDeviceInfo() {
  const info = {
    // Platform detection
    platform: getPlatform(),

    // Screen & Display
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: window.screen.colorDepth
    },

    // Browser/Device capabilities
    capabilities: {
      touchSupported: navigator.maxTouchPoints > 0 || 'ontouchstart' in window,
      language: navigator.language,
      languages: navigator.languages ? navigator.languages.join(',') : navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    },

    // System info
    system: {
      cores: navigator.hardwareConcurrency || 'unknown',
      memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'unknown'
    },

    // App version (from package.json or config.xml)
    appVersion: getAppVersion()
  }

  // Add Cordova/mobile info if available
  if (isCordovaApp()) {
    info.cordova = getCordovaDeviceInfo()
  }

  return info
}

/**
 * Detect platform from user agent and context
 */
function getPlatform() {
  if (isCordovaApp()) {
    // Cordova app - check device platform
    if (window.device?.platform) {
      return `Cordova/${window.device.platform}`
    }
  }

  // Web browser detection
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS Safari'
  if (/Android/.test(ua)) return 'Android Chrome'
  if (/Windows/.test(ua)) return 'Windows'
  if (/Mac/.test(ua)) return 'macOS'
  if (/Linux/.test(ua)) return 'Linux'
  if (/X11/.test(ua)) return 'Unix'

  return 'Unknown'
}

/**
 * Check if running as Cordova app
 */
function isCordovaApp() {
  return typeof window.cordova !== 'undefined'
}

/**
 * Get Cordova device information
 */
function getCordovaDeviceInfo() {
  if (!window.device) return null

  return {
    platform: window.device.platform,
    osVersion: window.device.version,
    model: window.device.model,
    manufacturer: window.device.manufacturer,
    uuid: 'hidden', // Don't expose UUID for privacy
    cordovaVersion: window.device.cordova
  }
}

/**
 * Get app version
 */
function getAppVersion() {
  // Try to get from package.json (build-time injection)
  try {
    const meta = document.querySelector('meta[name="app-version"]')
    if (meta) return meta.getAttribute('content')
  } catch (e) {
    // Fallback
  }

  return 'unknown'
}

/**
 * Send feedback to webhook
 */
export async function sendFeedback(email, message, requestType = 'general') {
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email is required')
    }
    if (!message || !message.trim()) {
      throw new Error('Message is required')
    }
    if (!requestType) {
      throw new Error('Request type is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address')
    }

    // Generate simple auth token
    const appToken = generateAppToken()

    // Collect device information
    const deviceInfo = collectDeviceInfo()

    // Map request type for better readability
    const requestTypeLabels = {
      feature_request: 'Feature Request',
      improvement: 'Improvement Suggestion',
      bug_report: 'Bug Report',
      suggestion: 'Suggestion',
      question: 'Question',
      general: 'General Feedback'
    }

    // Prepare payload
    const payload = {
      from_email: email.trim(),
      message: message.trim(),
      request_type: requestType,
      request_type_label: requestTypeLabels[requestType] || requestType,
      app_token: appToken,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      device: deviceInfo,
      source: 'biqa_app'
    }

    console.log('📧 Sending feedback via webhook...', { email, requestType, timestamp: payload.timestamp })

    // Send to webhook
    const response = await fetch(
      'https://integrationsv2.halerp.com/webhook/send_biqa_email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )

    if (!response.ok) {
      console.error('Webhook response:', response.status, response.statusText)
      throw new Error(`Webhook failed with status ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Feedback sent successfully:', result)

    return {
      success: true,
      message: 'Thank you! Your feedback has been sent.',
      timestamp: payload.timestamp
    }
  } catch (error) {
    console.error('Failed to send feedback:', error)
    throw error
  }
}

export default {
  sendFeedback
}
