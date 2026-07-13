import MarkdownIt from 'markdown-it'
import { sanitizeHtml } from '@/utils/sanitizeHtml'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

export function renderMarkdown(text) {
  if (!text) return ''

  // Remove NBSP characters (non-breaking spaces)
  let processed = text.replace(/\u00A0/g, ' ')

  // Unescape escaped characters
  processed = processed
    .replace(/\\\\n/g, '\n')    // Handle double-escaped newlines FIRST
    .replace(/\\n/g, '\n')      // Handle escaped newlines
    .replace(/\\\*/g, '*')      // Handle escaped asterisks
    .replace(/\\\[/g, '[')      // Handle escaped brackets
    .replace(/\\\]/g, ']')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\!/g, '!')
    .replace(/\\\#/g, '#')
    .replace(/\\\|/g, '|')

  // Use markdown-it to render properly
  return sanitizeHtml(md.render(processed))
}
