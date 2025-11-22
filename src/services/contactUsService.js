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
      source: 'biqa_app'
    }

    console.log('📧 Sending feedback via webhook...', { email, requestType, timestamp: payload.timestamp })

    // Send to webhook
    const response = await fetch(
      'https://integrations_v2.halerp.com/webhook/send_biqa_email',
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
