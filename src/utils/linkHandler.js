/**
 * Link Handler Utility
 *
 * Intercepts clicks on links within answer HTML content and handles them appropriately:
 * - Table of Contents (TOC) hash links: Scroll to anchor within the page
 * - Internal question links: Navigate using Vue Router
 * - External links: Open normally
 */

/**
 * Extract question reference from various URL formats
 * Handles:
 * - /en/answers/49023
 * - /ar/answers/12345
 * - https://islamqa.info/en/answers/49023
 * - https://mohamedazher.github.io/islamqa/#/question/329
 *
 * @param {string} href - The link href attribute
 * @returns {number|null} - The question reference number, or null if not found
 */
function extractQuestionReference(href) {
  // Pattern 1: /en/answers/NUMBER or /ar/answers/NUMBER
  const answerPattern = /\/(en|ar)\/answers\/(\d+)/
  const answerMatch = href.match(answerPattern)
  if (answerMatch) {
    return parseInt(answerMatch[2], 10)
  }

  // Pattern 2: /question/NUMBER (already in app format)
  const questionPattern = /\/question\/(\d+)/
  const questionMatch = href.match(questionPattern)
  if (questionMatch) {
    return parseInt(questionMatch[1], 10)
  }

  return null
}

/**
 * Check if a link is a hash/anchor link for TOC navigation
 * @param {string} href - The link href attribute
 * @returns {boolean}
 */
function isHashLink(href) {
  return href.startsWith('#')
}

/**
 * Check if a link is an internal question link
 * @param {string} href - The link href attribute
 * @returns {boolean}
 */
function isInternalQuestionLink(href) {
  return extractQuestionReference(href) !== null
}

/**
 * Smooth scroll to an anchor element
 * @param {string} hash - The hash/anchor ID (e.g., '#section_name')
 */
function scrollToAnchor(hash) {
  const targetId = hash.substring(1) // Remove the '#'
  const targetElement = document.getElementById(targetId)

  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

/**
 * Setup link click handlers for answer content
 * Should be called after answer HTML is rendered
 *
 * @param {HTMLElement} container - The container element with answer HTML
 * @param {Object} router - Vue Router instance
 */
export function setupLinkHandlers(container, router) {
  if (!container) return

  // Find all links in the answer content
  const links = container.querySelectorAll('a')

  links.forEach(link => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href')
      if (!href) return

      // Handle hash/anchor links (TOC navigation)
      if (isHashLink(href)) {
        event.preventDefault()
        scrollToAnchor(href)
        return
      }

      // Handle internal question links
      const questionRef = extractQuestionReference(href)
      if (questionRef !== null) {
        event.preventDefault()
        router.push(`/question/${questionRef}`)
        return
      }

      // For all other links (external), let them open normally
      // The target="_blank" attribute will handle opening in new tab if specified
    })
  })
}

/**
 * Alternative approach: Process answer HTML to convert links before rendering
 * This can be used if you prefer to modify the HTML before v-html rendering
 *
 * @param {string} answerHtml - The raw answer HTML
 * @returns {string} - Processed HTML with converted links
 */
export function processAnswerLinks(answerHtml) {
  if (!answerHtml) return ''

  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(answerHtml, 'text/html')

  // Find all links
  const links = doc.querySelectorAll('a')

  links.forEach(link => {
    const href = link.getAttribute('href')
    if (!href) return

    // Keep hash links as-is (TOC navigation)
    if (isHashLink(href)) {
      // Add a class to identify TOC links
      link.classList.add('toc-link')
      return
    }

    // Convert internal question links to app format
    const questionRef = extractQuestionReference(href)
    if (questionRef !== null) {
      link.setAttribute('href', `/question/${questionRef}`)
      link.classList.add('internal-link')
      // Remove target="_blank" for internal navigation
      link.removeAttribute('target')
      return
    }

    // Mark external links
    link.classList.add('external-link')
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
  })

  return doc.body.innerHTML
}

export default {
  setupLinkHandlers,
  processAnswerLinks,
  extractQuestionReference,
  isHashLink,
  isInternalQuestionLink,
  scrollToAnchor
}
