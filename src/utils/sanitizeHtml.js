import DOMPurify from 'dompurify'

/**
 * Sanitize rich text before it reaches Vue's v-html directive.
 *
 * The bundled question corpus contains legitimate formatting, anchors, tables,
 * and Arabic text, so stripping all markup would damage the reading experience.
 * DOMPurify preserves that safe markup while removing executable elements,
 * event handlers, and unsafe URL schemes.
 */
export function sanitizeHtml(html) {
  if (!html) return ''

  return DOMPurify.sanitize(String(html), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['base', 'form', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['srcdoc']
  })
}

export default sanitizeHtml
