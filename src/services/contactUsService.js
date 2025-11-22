/**
 * Contact Us Service
 * Handles sending feedback and contact messages via webhook
 */

// Secret key for generating app signature (verify authenticity)
// This should match what the backend expects
const APP_SECRET = 'biqa_app_feedback_secret_key_2024'

/**
 * Generate HMAC-SHA256 hash of a message
 * Uses a shared secret to verify the request came from the app
 */
async function generateAppSignature(email, message) {
  try {
    // Combine email and message for hashing
    const payload = `${email}:${message}:${APP_SECRET}`

    // Use Web Crypto API to generate SHA-256 hash
    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return hashHex
  } catch (error) {
    console.error('Failed to generate app signature:', error)
    throw new Error('Could not generate security signature')
  }
}

/**
 * Send feedback to webhook
 */
export async function sendFeedback(email, message) {
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email is required')
    }
    if (!message || !message.trim()) {
      throw new Error('Message is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address')
    }

    // Generate app signature for security
    const appSignature = await generateAppSignature(email, message)

    // Prepare payload
    const payload = {
      from_email: email.trim(),
      message: message.trim(),
      app_signature: appSignature,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      source: 'biqa_app'
    }

    console.log('📧 Sending feedback via webhook...', { email, timestamp: payload.timestamp })

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
  sendFeedback,
  generateAppSignature
}
