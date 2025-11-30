import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Compose embedding text for a dua (exact copy from generate-dua-embeddings-gemini.js)
 */
function composeEmbeddingText(dua) {
  const parts = [
    // Category (context signal - when/where used)
    dua.category_name ? `Category: ${dua.category_name}` : '',
    // Title (strongest signal of intent/purpose)
    dua.title || '',
    // Translation (meaning/content of the dua)
    dua.translation ? `Meaning: ${dua.translation}` : '',
    // Tags (purpose/situation signal)
    dua.tags && dua.tags.length > 0 ? `Tags: ${dua.tags.join(', ')}` : '',
    // Virtue/benefits excerpt (detailed purpose)
    dua.virtue ? `Benefits: ${dua.virtue.substring(0, 500)}` : ''
  ]

  return parts.filter(p => p.trim()).join('. ').trim()
}

// Load sample dua file
const duaFile = path.join(__dirname, '../public/data/dua/before-sleep.json')
const content = JSON.parse(fs.readFileSync(duaFile, 'utf-8'))

// Get the second dua (Ayat al-Kursi)
const sampleDua = {
  ...content.duas[1],
  // This is what the actual embedding generator does:
  category_name: content.category_name,
  category_id: content.category_id
}

console.log('=== SAMPLE DUA ===')
console.log(`ID: ${sampleDua.id}`)
console.log(`Category: ${sampleDua.category_name}`)
console.log(`Title: ${sampleDua.title}`)
console.log(`Tags: ${sampleDua.tags.join(', ')}`)
console.log('')

console.log('=== EMBEDDING TEXT (what gets sent to Gemini API) ===')
const embeddingText = composeEmbeddingText(sampleDua)
console.log('')
console.log(embeddingText)
console.log('')
console.log(`[Total length: ${embeddingText.length} characters]`)
