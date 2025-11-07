/**
 * Sharing utilities for both Cordova and Web platforms
 */

/**
 * Check if running in Cordova environment
 */
export function isCordova() {
  return typeof window.cordova !== 'undefined'
}

/**
 * Share a question using Cordova plugin or Web Share API
 */
export async function shareQuestion(question, answer = null) {
  const title = `Islamic Q&A: ${question.question || question.questionText}`
  const text = answer
    ? `Q: ${question.question || question.questionText}\n\nA: ${stripHtml(answer.answers || answer.explanation || '').substring(0, 200)}...`
    : `Q: ${question.question || question.questionText}`
  const url = `https://islamqa.info/${question.question_no || question.id}` // Fallback URL

  return share({
    title,
    text,
    url
  })
}

/**
 * Share the app
 */
export async function shareApp() {
  const title = 'BetterIslam Q&A'
  const text = 'Discover authentic Islamic knowledge with BetterIslam Q&A - Thousands of questions answered by scholars, offline access, quizzes & more!'
  const url = 'https://play.google.com/store/apps/details?id=com.dkurve.betterislamqa' // Update with actual app URL

  return share({
    title,
    text,
    url
  })
}

/**
 * Generic share function that handles both Cordova and Web Share API
 */
async function share({ title, text, url }) {
  try {
    // Try Cordova Social Sharing plugin first (if available)
    if (isCordova() && window.plugins && window.plugins.socialsharing) {
      return new Promise((resolve, reject) => {
        window.plugins.socialsharing.shareWithOptions(
          {
            message: text,
            subject: title,
            url: url
          },
          (result) => {
            console.log('Share completed:', result)
            resolve({ success: true, platform: 'cordova' })
          },
          (error) => {
            console.error('Share failed:', error)
            reject(new Error('Share failed'))
          }
        )
      })
    }

    // Fallback to Web Share API (modern browsers)
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url
      })
      return { success: true, platform: 'web' }
    }

    // Fallback: Copy to clipboard
    const fullText = `${title}\n\n${text}\n\n${url}`
    await copyToClipboard(fullText)
    return { success: true, platform: 'clipboard', message: 'Copied to clipboard!' }
  } catch (error) {
    // User cancelled or error occurred
    if (error.name === 'AbortError') {
      return { success: false, cancelled: true }
    }
    throw error
  }
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}
