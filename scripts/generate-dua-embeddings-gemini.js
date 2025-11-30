/**
 * Generate embeddings for duas using Gemini API
 *
 * This script:
 * 1. Loads all duas from category files
 * 2. Composes embedding text: title + category + tags + virtue excerpt
 * 3. Generates embeddings using Gemini text-embedding-004
 * 4. Stores in public/data/dua-embeddings.json
 *
 * Usage: node scripts/generate-dua-embeddings-gemini.js
 *
 * Note: Requires GEMINI_API_KEY environment variable or hardcoded key
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAEma46H6zePFRvQnp8ccfkOPI9eb7mbR8'
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
 * Load all duas from category files
 */
function loadAllDuas() {
  const allDuas = []
  const files = fs.readdirSync(duaDataDir).filter(f => f.endsWith('.json'))

  // Exclude utility files
  const excludeFiles = new Set(['index.json', 'home.json', 'categories.json', 'istikhara.json', 'lavatory-wudu.json', 'nightmares.json', 'names-allah.json', 'protection-iman.json', 'social-interactions.json'])

  for (const file of files) {
    if (excludeFiles.has(file)) continue

    try {
      const filePath = path.join(duaDataDir, file)
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

      if (content.duas && Array.isArray(content.duas)) {
        allDuas.push(...content.duas.map(dua => ({
          ...dua,
          source_file: file,
          category_id: content.category_id,
          category_name: content.category_name
        })))
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error.message)
    }
  }

  return allDuas
}

/**
 * Compose embedding text for a dua
 * Combines: title + category + tags + virtue excerpt
 */
function composeEmbeddingText(dua) {
  const parts = [
    // Title (strongest signal of intent)
    dua.title || '',
    // Category (context signal)
    `Category: ${dua.category_name || ''}`,
    // Tags (purpose/situation signal)
    dua.tags && dua.tags.length > 0 ? `Tags: ${dua.tags.join(', ')}` : '',
    // Virtue/benefits excerpt (detailed purpose)
    dua.virtue ? `Benefits: ${dua.virtue.substring(0, 500)}` : ''
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
  console.log(`Loading ${duas.length} duas for embedding generation...`)

  // Load checkpoint to resume if interrupted
  const checkpoint = loadCheckpoint()
  const completedIds = new Set(checkpoint.completed)
  const embeddings = checkpoint.embeddings

  // Filter out already completed duas
  const pendingDuas = duas.filter(dua => !completedIds.has(dua.id))

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

        embeddings[dua.id] = embedding
        completedIds.add(dua.id)

        console.log(`  ✓ ${dua.id}: ${dua.title.substring(0, 50)}...`)
      } catch (error) {
        console.error(`  ✗ ${dua.id}: ${error.message}`)
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
    console.log('=== Dua Embeddings Generation ===')
    console.log(`API Key configured: ${GEMINI_API_KEY.substring(0, 10)}...`)
    console.log('')

    // Load all duas
    const duas = loadAllDuas()
    console.log(`Loaded ${duas.length} duas from ${new Set(duas.map(d => d.source_file)).size} files`)
    console.log('')

    // Generate embeddings
    const embeddings = await generateAllEmbeddings(duas)

    // Save to output file
    fs.writeFileSync(outputPath, JSON.stringify(embeddings, null, 2))
    console.log(`Saved embeddings to ${outputPath}`)
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
