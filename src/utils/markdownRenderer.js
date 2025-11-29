import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

export function renderMarkdown(text) {
  if (!text) return ''

  // Remove NBSP characters (non-breaking spaces) that may have been inserted
  let processed = text.replace(/\u00A0/g, ' ')

  // Unescape escaped characters that might be in the data
  processed = processed
    .replace(/\\\\n/g, '\n')    // Handle double-escaped newlines FIRST
    .replace(/\\n/g, '\n')      // Handle escaped newlines
    .replace(/\\\*/g, '*')      // Handle escaped asterisks (converts \* to *)
    .replace(/\\\[/g, '[')      // Handle escaped brackets
    .replace(/\\\]/g, ']')      // Handle escaped brackets
    .replace(/\\\(/g, '(')      // Handle escaped parentheses
    .replace(/\\\)/g, ')')      // Handle escaped parentheses
    .replace(/\\\!/g, '!')      // Handle escaped exclamation
    .replace(/\\\#/g, '#')      // Handle escaped hash
    .replace(/\\\|/g, '|')      // Handle escaped pipes
    .replace(/\n\n\n+/g, '\n\n') // Normalize multiple consecutive newlines to double newline

  // Format bullet points with proper line spacing
  // Add blank line before first bullet and after last bullet
  processed = processed
    .replace(/([^\n•])\n(•)/g, '$1\n\n$2')  // Blank line before first bullet
    .replace(/(\n•[^\n]*)\n([^\n•])/g, '$1\n\n$2')  // Blank line after bullets
    .replace(/\s*•\s+/g, '\n• ')  // Each bullet on new line

  return md.render(processed)
}
