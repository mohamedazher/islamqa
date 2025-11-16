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
 * - https://islamqa.com/en/answers/49023
 * - https://mohamedazher.github.io/en/answers/49023
 * - https://mohamedazher.github.io/islamqa/#/question/329
 *
 * @param {string} href - The link href attribute
 * @returns {number|null} - The question reference number, or null if not found
 */
function extractQuestionReference(href) {
  if (!href) return null

  // Pattern 1: /en/answers/NUMBER or /ar/answers/NUMBER (most common in answer HTML)
  // Matches: https://islamqa.info/en/answers/49023, https://mohamedazher.github.io/en/answers/49023, /en/answers/49023
  const answerPattern = /\/(en|ar)\/answers\/(\d+)/
  const answerMatch = href.match(answerPattern)
  if (answerMatch) {
    const ref = parseInt(answerMatch[2], 10)
    console.log(`📝 Extracted question reference ${ref} from answer URL: ${href}`)
    return ref
  }

  // Pattern 2: /question/NUMBER (already in app format)
  // Matches: /question/49023, #/question/49023
  const questionPattern = /\/question\/(\d+)/
  const questionMatch = href.match(questionPattern)
  if (questionMatch) {
    const ref = parseInt(questionMatch[1], 10)
    console.log(`📝 Extracted question reference ${ref} from question URL: ${href}`)
    return ref
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
    console.log('✅ Found target element with ID:', targetId)

    // Calculate offset for sticky header (80px as defined in CSS)
    const headerOffset = 100
    const elementPosition = targetElement.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  } else {
    console.warn('❌ Target element not found:', targetId)
    console.log('Available IDs in document:',
      Array.from(document.querySelectorAll('[id]')).map(el => el.id)
    )
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
  if (!container) {
    console.warn('⚠️  setupLinkHandlers: container is null')
    return
  }

  // Find all links in the answer content
  const links = container.querySelectorAll('a')
  console.log(`🔗 Found ${links.length} links to process`)

  links.forEach(link => {
    // Remove any existing click handlers to prevent duplicates
    const newLink = link.cloneNode(true)
    link.parentNode.replaceChild(newLink, link)

    newLink.addEventListener('click', (event) => {
      const href = newLink.getAttribute('href')
      if (!href) return

      console.log('🖱️  Link clicked:', href)

      // Handle hash/anchor links (TOC navigation)
      // These are links like #section_name that should scroll within the page
      if (isHashLink(href)) {
        event.preventDefault()
        event.stopPropagation()
        console.log('📍 Scrolling to anchor:', href)
        scrollToAnchor(href)
        return
      }

      // Handle internal question links
      // These are links like /en/answers/49023 or https://islamqa.info/en/answers/49023
      const questionRef = extractQuestionReference(href)
      if (questionRef !== null) {
        event.preventDefault()
        event.stopPropagation()
        console.log('➡️  Navigating to question:', questionRef)
        router.push(`/question/${questionRef}`)
        return
      }

      // For all other links (external), let them open normally
      // The target="_blank" attribute will handle opening in new tab if specified
      console.log('🌐 External link, opening normally:', href)
    })
  })
}

/**
 * Alternative approach: Process answer HTML to convert links before rendering
 * This can be used if you prefer to modify the HTML before v-html rendering
 *
 * Handles Vue Router hash mode by:
 * - Converting cross-answer links to /#/question/ID format
 * - Keeping TOC hash-only links as anchors for smooth scrolling
 * - Adding classes for styling purposes
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

    // Handle hash/anchor links (TOC navigation)
    // For hash-only links like #section_name, keep them as-is for smooth scrolling
    // They won't conflict with routing since they're within the same page
    if (isHashLink(href)) {
      // Add a class to identify TOC links for potential styling
      link.classList.add('toc-link')
      // Ensure click handler will scroll to anchor
      link.setAttribute('data-toc-link', 'true')
      return
    }

    // Convert internal question links to app router format
    // Pattern matching handles: /en/answers/123, https://islamqa.info/en/answers/123, etc.
    const questionRef = extractQuestionReference(href)
    if (questionRef !== null) {
      // Convert to Vue Router hash mode format: /#/question/49023
      link.setAttribute('href', `/#/question/${questionRef}`)
      link.classList.add('internal-link')
      // Remove target="_blank" for internal navigation to work smoothly
      link.removeAttribute('target')
      console.log(`🔗 Converted link: ${href} → /#/question/${questionRef}`)
      return
    }

    // Mark and configure external links
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
