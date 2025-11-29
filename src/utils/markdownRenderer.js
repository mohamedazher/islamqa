import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

export function renderMarkdown(text) {
  if (!text) return ''

  // Unescape escaped characters that might be in the data
  let processed = text
    .replace(/\\\*/g, '*')      // Handle escaped asterisks
    .replace(/\\\[/g, '[')      // Handle escaped brackets
    .replace(/\\\]/g, ']')      // Handle escaped brackets
    .replace(/\\\(/g, '(')      // Handle escaped parentheses
    .replace(/\\\)/g, ')')      // Handle escaped parentheses
    .replace(/\\\!/g, '!')      // Handle escaped exclamation
    .replace(/\\\#/g, '#')      // Handle escaped hash
    .replace(/\\\|/g, '|')      // Handle escaped pipes
    .replace(/\\\\n/g, '\n')    // Handle double-escaped newlines
    .replace(/\\n/g, '\n')      // Handle escaped newlines
    .replace(/\n\n\n+/g, '\n\n') // Normalize multiple consecutive newlines to double newline

  return md.render(processed)
}
