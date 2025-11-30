import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Fuse from 'fuse.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load dua embeddings
const embeddings = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/data/dua-embeddings.json'), 'utf8')
)

// Load morning duas
const morning = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/data/dua/morning.json'), 'utf8')
)

// Map to find anxiety dua
const anxietyDua = morning.duas.find(d => d.title.includes('Protect Yourself'))

console.log('=== ANXIETY DUA SEARCH TEST ===')
console.log('')
console.log('Target Dua:')
console.log(`  ID: ${anxietyDua.id}`)
console.log(`  Title: ${anxietyDua.title}`)
console.log(`  Category: ${morning.category_name}`)
console.log('')

// Check if embedding exists
console.log('Embedding Check:')
if (embeddings[anxietyDua.id]) {
  console.log(`  ✓ Embedding EXISTS (ID: ${anxietyDua.id})`)
  console.log(`  Vector sample: [${embeddings[anxietyDua.id].slice(0, 3).join(', ')}, ...]`)
} else {
  console.log(`  ✗ Embedding NOT FOUND (ID: ${anxietyDua.id})`)
}
console.log('')

// Test keyword search
console.log('Keyword Search Test:')
const enhancedData = morning.duas.map(dua => ({
  ...dua,
  tag_string: (dua.tags || []).join(' ')
}))

const fuse = new Fuse(enhancedData, {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'category_name', weight: 0.25 },
    { name: 'tag_string', weight: 0.2 },
    { name: 'translation', weight: 0.15 }
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
  isCaseSensitive: false
})

const searchTerms = [
  'Protect Yourself',
  'anxiety',
  'Anxiety',
  'morning',
  'laziness'
]

for (const term of searchTerms) {
  const results = fuse.search(term)
  console.log(`  Query: "${term}"`)
  if (results.length > 0) {
    const found = results.find(r => r.item.id === anxietyDua.id)
    if (found) {
      console.log(`    ✓ FOUND (rank: ${results.indexOf(found) + 1}/${results.length}, score: ${found.score.toFixed(4)})`)
    } else {
      console.log(`    ✗ Not in results (found ${results.length} other matches)`)
    }
  } else {
    console.log(`    ✗ No matches`)
  }
}
console.log('')

console.log('Summary:')
console.log(`  Total dua embeddings: ${Object.keys(embeddings).length}`)
console.log(`  Morning duas loaded: ${morning.duas.length}`)
console.log(`  Anxiety dua embedding: ${embeddings[anxietyDua.id] ? '✓ Yes' : '✗ Missing'}`)
