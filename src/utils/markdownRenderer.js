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

  return md.render(processed)
}
