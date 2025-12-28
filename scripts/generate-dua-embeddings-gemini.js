/**
 * Generate embeddings for duas using Gemini API
 *
 * This script:
 * 1. Loads all duas from chapter_*.json files (Hisn al-Muslim 132 chapters)
 * 2. Composes embedding text: category + title + translation + tags
 * 3. Generates embeddings using Gemini text-embedding-004
 * 4. Stores in public/data/dua-embeddings.json
 *
 * Usage: node scripts/generate-dua-embeddings-gemini.js
 *
 * Note: Requires GEMINI_API_KEY environment variable
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY environment variable not set');
  console.error('Set it with: export GEMINI_API_KEY="your-api-key"');
  process.exit(1);
}

const BATCH_SIZE = 50 // Process 50 at a time to avoid rate limits
const DELAY_MS = 500 // Delay between batches

// Paths
const duaDataDir = path.join(__dirname, '../public/data/dua')
const outputPath = path.join(__dirname, '../public/data/dua-embeddings.json')
const checkpointPath = path.join(__dirname, '.dua-embeddings-checkpoint.json')

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })

/**
 * Load all duas from chapter_*.json files
 * New format: Each chapter file is a flat array of duas
 */
function loadAllDuas() {
  const allDuas = []
  const files = fs.readdirSync(duaDataDir)
    .filter(f => f.startsWith('chapter_') && f.endsWith('.json'))
    .sort((a, b) => {
      // Sort by chapter number
      const numA = parseInt(a.match(/chapter_(\d+)/)?.[1] || '0')
      const numB = parseInt(b.match(/chapter_(\d+)/)?.[1] || '0')
      return numA - numB
    })

  console.log(`Found ${files.length} chapter files`)

  for (const file of files) {
    try {
      const filePath = path.join(duaDataDir, file)
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

      // Extract chapter number from filename
      const chapterMatch = file.match(/chapter_(\d+)/)
      if (!chapterMatch) {
        console.warn(`  ⚠️ Skipping ${file} - unexpected filename format`)
        continue
      }

      const chapterNum = parseInt(chapterMatch[1])

      // New format: flat array of duas
      if (Array.isArray(content)) {
        const duasWithMeta = content.map(dua => ({
          ...dua,
          source_file: file,
          chapter_num: chapterNum,
          // Ensure category_name exists
          category_name: dua.category_name || file.replace(/chapter_\d+_/, '').replace('.json', '').replace(/_/g, ' ')
        }))
        allDuas.push(...duasWithMeta)
      } else {
        console.warn(`  ⚠️ Skipping ${file} - not an array`)
      }
    } catch (error) {
      console.error(`  ❌ Error loading ${file}:`, error.message)
    }
  }

  return allDuas
}

/**
 * Compose embedding text for a dua
 * Combines: category + title + translation + tags
 *
 * This captures the full contextual meaning:
 * - Category provides situational context (when/where the dua is used)
 * - Title describes what the dua is for
 * - Translation provides the meaning/content
 * - Tags enhance searchability by purpose
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
    dua.tags && dua.tags.length > 0 ? `Tags: ${dua.tags.join(', ')}` : ''
  ]

  return parts.filter(p => p.trim()).join('. ').trim()
}

/**
 * Load checkpoint to resume interrupted generation
 */
function loadCheckpoint() {
  if (fs.existsSync(checkpointPath)) {
    return JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'))
  }
  return { completed: [], embeddings: {} }
}

/**
 * Save checkpoint
 */
function saveCheckpoint(checkpoint) {
  fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2))
}

/**
 * Generate embedding for a single text
 */
async function generateEmbedding(text) {
  try {
    const result = await model.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error('Embedding error:', error.message)
    throw error
  }
}

/**
 * Delay execution (for rate limiting)
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate embeddings for all duas
 */
async function generateAllEmbeddings(duas) {
  console.log(`\nProcessing ${duas.length} duas for embedding generation...`)

  // Load checkpoint to resume if interrupted
  const checkpoint = loadCheckpoint()
  const completedIds = new Set(checkpoint.completed)
  const embeddings = checkpoint.embeddings

  // Filter out already completed duas
  // Use new key format: chapter_N:id
  const pendingDuas = duas.filter(dua => {
    const key = `chapter_${dua.chapter_num}:${dua.id}`
    return !completedIds.has(key)
  })

  if (pendingDuas.length === 0) {
    console.log('All duas already embedded. Loading from checkpoint...')
    return embeddings
  }

  console.log(`Generating embeddings for ${pendingDuas.length} duas (${completedIds.size} already completed)...`)
  console.log('')

  // Process in batches
  for (let i = 0; i < pendingDuas.length; i += BATCH_SIZE) {
    const batch = pendingDuas.slice(i, Math.min(i + BATCH_SIZE, pendingDuas.length))
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(pendingDuas.length / BATCH_SIZE)

    console.log(`Batch ${batchNum}/${totalBatches}:`)

    for (const dua of batch) {
      try {
        const text = composeEmbeddingText(dua)
        const embedding = await generateEmbedding(text)

        // Use new key format: chapter_N:id
        const compositeKey = `chapter_${dua.chapter_num}:${dua.id}`
        embeddings[compositeKey] = embedding
        completedIds.add(compositeKey)

        const titlePreview = (dua.title || dua.category_name || 'Untitled').substring(0, 50)
        console.log(`  ✓ ${compositeKey}: ${titlePreview}...`)
      } catch (error) {
        console.error(`  ✗ chapter_${dua.chapter_num}:${dua.id}: ${error.message}`)
        // Continue on error instead of failing
      }
    }

    // Save checkpoint after each batch
    checkpoint.completed = Array.from(completedIds)
    checkpoint.embeddings = embeddings
    saveCheckpoint(checkpoint)

    // Delay between batches to avoid rate limits
    if (i + BATCH_SIZE < pendingDuas.length) {
      console.log(`  Waiting ${DELAY_MS}ms before next batch...`)
      await sleep(DELAY_MS)
    }
  }

  console.log('')
  console.log(`✓ Embedding generation complete: ${Object.keys(embeddings).length} embeddings`)

  return embeddings
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('=== Dua Embeddings Generation (Hisn al-Muslim) ===')
    console.log(`API Key configured: ${GEMINI_API_KEY.substring(0, 10)}...`)
    console.log('')

    // Load all duas from chapter files
    const duas = loadAllDuas()
    const uniqueChapters = new Set(duas.map(d => d.chapter_num))
    console.log(`Loaded ${duas.length} duas from ${uniqueChapters.size} chapters`)

    // Generate embeddings
    const embeddings = await generateAllEmbeddings(duas)

    // Save to output file
    fs.writeFileSync(outputPath, JSON.stringify(embeddings, null, 2))
    console.log(`\nSaved embeddings to ${outputPath}`)
    console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`)

    // Clean up checkpoint on successful completion
    if (fs.existsSync(checkpointPath)) {
      fs.unlinkSync(checkpointPath)
      console.log('Cleaned up checkpoint file')
    }

    console.log('')
    console.log('✓ Complete! Embeddings ready for production.')
  } catch (error) {
    console.error('Fatal error:', error.message)
    process.exit(1)
  }
}

// Run
main()
