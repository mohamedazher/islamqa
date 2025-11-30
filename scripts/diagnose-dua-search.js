import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load dua embeddings
let embeddings = {}
try {
  embeddings = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../public/data/dua-embeddings.json'), 'utf8')
  )
} catch (e) {
  console.log('No dua-embeddings.json file')
}

// Load morning duas to check structure
const morning = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/data/dua/morning.json'), 'utf8')
)

console.log('=== DUA SEARCH DIAGNOSTIC ===')
console.log('')

// Check embedding keys format
console.log('1. EMBEDDING KEYS FORMAT:')
const embeddingKeys = Object.keys(embeddings)
console.log(`   Total embeddings: ${embeddingKeys.length}`)
if (embeddingKeys.length > 0) {
  console.log('   Sample keys:')
  embeddingKeys.slice(0, 5).forEach(key => {
    console.log(`     - "${key}"`)
  })

  const hasCompositeKeys = embeddingKeys.some(k => k.includes(':'))
  const hasNumericKeys = embeddingKeys.some(k => !k.includes(':') && !isNaN(parseInt(k)))

  console.log('')
  console.log(`   Has composite keys (e.g., "morning.json:1"): ${hasCompositeKeys ? '✓ YES' : '✗ NO'}`)
  console.log(`   Has numeric keys (e.g., "1", "2"): ${hasNumericKeys ? '✓ YES' : '✗ NO'}`)
}
console.log('')

// Check dua structure
console.log('2. DUA STRUCTURE (sample from morning.json):')
const sampleDua = morning.duas[0]
console.log(`   Has source_file: ${sampleDua.source_file ? '✓ YES' : '✗ NO'}`)
if (sampleDua.source_file) {
  console.log(`     Value: "${sampleDua.source_file}"`)
}
console.log(`   Has id: ✓ YES`)
console.log(`     Value: ${sampleDua.id}`)
console.log(`   Has category_name: ✓ YES`)
console.log(`     Value: "${sampleDua.category_name}"`)
console.log('')

// Simulate duaMap building
console.log('3. DUAMAP KEY MATCHING:')
const testDua = morning.duas.find(d => d.title.includes('Protect Yourself'))
if (testDua) {
  const expectedMapKey = testDua.source_file
    ? `${testDua.source_file}:${testDua.id}`
    : `${testDua.id}`

  console.log(`   Test dua: "${testDua.title.substring(0, 40)}..."`)
  console.log(`   Dua ID: ${testDua.id}`)
  console.log(`   Expected duaMap key: "${expectedMapKey}"`)
  console.log('')

  const embeddingKey = Object.keys(embeddings).find(k =>
    k === expectedMapKey || k === String(testDua.id)
  )

  if (embeddingKey) {
    console.log(`   ✓ FOUND in embeddings with key: "${embeddingKey}"`)
  } else {
    console.log(`   ✗ NOT FOUND in embeddings`)
    console.log(`     Searched for: "${expectedMapKey}" or "${testDua.id}"`)
  }
}
console.log('')

// Summary
console.log('4. DIAGNOSIS:')
if (Object.keys(embeddings).length === 0) {
  console.log('   ✗ NO EMBEDDINGS FOUND')
  console.log('     Action: Run embedding generation script')
} else {
  const hasCompositeKeys = embeddingKeys.some(k => k.includes(':'))
  if (hasCompositeKeys) {
    console.log('   ✓ Embeddings have composite keys')
    if (morning.duas[0].source_file) {
      console.log('   ✓ Duas have source_file')
      console.log('   → Search SHOULD work!')
    } else {
      console.log('   ✗ Duas missing source_file')
      console.log('   → Search will FAIL (key mismatch)')
    }
  } else {
    console.log('   ✗ Embeddings have simple numeric keys')
    console.log('   → Regenerate embeddings with updated script')
  }
}
