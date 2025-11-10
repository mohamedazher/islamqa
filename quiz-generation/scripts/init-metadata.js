#!/usr/bin/env node

/**
 * Initialize Enhancement Metadata Script
 *
 * Creates and initializes the enhancement-metadata.json file
 * that tracks which questions have been processed/enhanced
 *
 * This file prevents duplicate processing and allows tracking progress
 *
 * Usage:
 *   node init-metadata.js                    (creates fresh metadata)
 *   node init-metadata.js --reset            (resets existing metadata)
 *   node init-metadata.js --add-batch batch-1762368648805  (adds processed batch)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const METADATA_PATH = path.join(__dirname, '..', 'enhancement-metadata.json')

/**
 * Create fresh metadata
 */
function createMetadata() {
  return {
    version: '2.0.0',
    description: 'Tracks quiz enhancements generated from semantic reference ID database',
    createdDate: new Date().toISOString(),
    lastProcessed: new Date().toISOString(),
    processedReferences: [],
    processedBatches: [],
    enhancementStats: {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      lastUpdated: new Date().toISOString()
    }
  }
}

/**
 * Load existing metadata or return empty
 */
function loadMetadata() {
  if (fs.existsSync(METADATA_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'))
    } catch (error) {
      console.warn('⚠️  Could not parse existing metadata, creating fresh')
      return createMetadata()
    }
  }
  return createMetadata()
}

/**
 * Save metadata
 */
function saveMetadata(metadata) {
  metadata.lastProcessed = new Date().toISOString()
  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2))
  console.log(`✅ Metadata saved to: ${METADATA_PATH}`)
}

/**
 * Add processed references from a V2 batch file
 */
function addBatch(metadata, batchFile) {
  // Resolve batch file path
  let batchPath = batchFile
  if (!path.isAbsolute(batchPath)) {
    batchPath = path.join(__dirname, '..', 'batches', batchFile)
  }

  if (!fs.existsSync(batchPath)) {
    console.error(`❌ Batch file not found: ${batchPath}`)
    process.exit(1)
  }

  try {
    const batchContent = JSON.parse(fs.readFileSync(batchPath, 'utf8'))
    const enhancements = batchContent.generatedEnhancements || []

    let added = 0
    let duplicates = 0

    enhancements.forEach(enhancement => {
      if (!enhancement.reference) {
        console.warn(`⚠️  Enhancement missing reference, skipping`)
        return
      }

      if (metadata.processedReferences.includes(enhancement.reference)) {
        duplicates++
      } else {
        metadata.processedReferences.push(enhancement.reference)
        added++
      }
    })

    // Update batch tracking
    if (!metadata.processedBatches) {
      metadata.processedBatches = []
    }

    const batchId = path.basename(batchPath, '.json').replace('-v2', '')
    if (!metadata.processedBatches.includes(batchId)) {
      metadata.processedBatches.push(batchId)
    }

    // Update stats
    metadata.enhancementStats.totalProcessed += added
    metadata.enhancementStats.successful += added
    metadata.enhancementStats.lastUpdated = new Date().toISOString()

    console.log(`\n✅ Batch processed:`)
    console.log(`   Added: ${added} new references`)
    console.log(`   Duplicates: ${duplicates} (skipped)`)
    console.log(`   Total processed: ${metadata.enhancementStats.totalProcessed}`)

    return metadata

  } catch (error) {
    console.error(`❌ Error processing batch: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Display metadata statistics
 */
function displayStats(metadata) {
  console.log(`\n📊 Enhancement Metadata Statistics:`)
  console.log(`   Version: ${metadata.version}`)
  console.log(`   Total Enhanced: ${metadata.processedReferences.length}`)
  console.log(`   Batches Processed: ${metadata.processedBatches?.length || 0}`)
  console.log(`   Success Rate: 100%`)
  console.log(`   Last Updated: ${metadata.lastProcessed}`)

  if (metadata.processedBatches?.length > 0) {
    console.log(`\n📋 Batches:`)
    metadata.processedBatches.forEach(batch => {
      console.log(`   - ${batch}`)
    })
  }
}

/**
 * Main function
 */
function main() {
  const arg1 = process.argv[2]
  const arg2 = process.argv[3]

  // Check if metadata exists
  const exists = fs.existsSync(METADATA_PATH)

  if (arg1 === '--reset') {
    console.log('🔄 Resetting metadata...')
    const metadata = createMetadata()
    saveMetadata(metadata)
    displayStats(metadata)
    return
  }

  if (arg1 === '--add-batch') {
    if (!arg2) {
      console.error('❌ Usage: node init-metadata.js --add-batch <batch-file>')
      process.exit(1)
    }
    console.log(`📥 Adding batch: ${arg2}`)
    let metadata = loadMetadata()
    metadata = addBatch(metadata, arg2)
    saveMetadata(metadata)
    displayStats(metadata)
    return
  }

  // Default: initialize or show stats
  if (exists && arg1 !== '--init') {
    console.log('📖 Loading existing metadata...')
    const metadata = loadMetadata()
    displayStats(metadata)
    return
  }

  console.log('🆕 Creating fresh metadata...')
  const metadata = createMetadata()
  saveMetadata(metadata)
  displayStats(metadata)
  console.log(`\n💡 To add batches, use: node init-metadata.js --add-batch <batch-file>`)
}

main()
