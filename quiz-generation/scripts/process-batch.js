#!/usr/bin/env node

/**
 * Complete Batch Processing Workflow
 *
 * Handles the entire pipeline:
 * 1. Transform old format to V2
 * 2. Initialize/update metadata
 * 3. Validate enhancements
 * 4. Prepare for database import
 * 5. Generate import script
 *
 * Usage:
 *   node process-batch.js batch-1762368648805-output.json
 *   node process-batch.js --batch batch-1762368648805-output.json --import
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BATCHES_DIR = path.join(__dirname, '..', 'batches')
const METADATA_PATH = path.join(__dirname, '..', 'enhancement-metadata.json')

/**
 * Step 1: Transform output to V2 format
 */
function transformToV2(inputPath) {
  console.log('\n📝 Step 1: Transform to V2 format')
  console.log('═'.repeat(50))

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`)
    return null
  }

  try {
    const content = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

    if (!content.generatedQuizzes && !content.generatedEnhancements) {
      console.error('❌ Invalid format: need generatedQuizzes or generatedEnhancements')
      return null
    }

    // If already V2 format, use as-is
    if (content.generatedEnhancements) {
      console.log('✅ Already V2 format')
      return content
    }

    // Transform V1 format
    const transformed = {
      generatedEnhancements: content.generatedQuizzes.map(quiz => {
        if (!quiz.sourceQuestionId) return null

        return {
          reference: quiz.sourceQuestionId,
          questionText: quiz.questionText,
          type: quiz.type || 'multiple-choice',
          difficulty: quiz.difficulty || 'medium',
          options: (quiz.options || []).map((opt, idx) => ({
            id: String.fromCharCode(97 + idx),
            text: opt.text || opt,
            isCorrect: opt.isCorrect === true
          })),
          explanation: quiz.explanation || '',
          tags: Array.isArray(quiz.tags) ? quiz.tags : [],
          source: `IslamQA reference ${quiz.sourceQuestionId}`
        }
      }).filter(e => e !== null),

      metadata: {
        batchId: content.batchId || 'unknown',
        processedCount: content.generatedQuizzes.length,
        generatedDate: new Date().toISOString(),
        notes: 'Converted from V1 format to V2'
      }
    }

    console.log(`✅ Transformed: ${transformed.generatedEnhancements.length} enhancements`)
    return transformed

  } catch (error) {
    console.error(`❌ Transform failed: ${error.message}`)
    return null
  }
}

/**
 * Step 2: Validate enhancements
 */
function validateEnhancements(enhancements) {
  console.log('\n🔍 Step 2: Validate enhancements')
  console.log('═'.repeat(50))

  const errors = []
  let validCount = 0

  enhancements.forEach((enh, idx) => {
    // Check reference
    if (!enh.reference) {
      errors.push(`Enhancement ${idx}: missing reference`)
      return
    }

    // Check options
    if (!enh.options || enh.options.length < 2) {
      errors.push(`Enhancement ${idx} (ref ${enh.reference}): need 2+ options, got ${enh.options?.length || 0}`)
      return
    }

    // Check exactly one correct
    const correctCount = enh.options.filter(o => o.isCorrect).length
    if (correctCount !== 1) {
      errors.push(`Enhancement ${idx} (ref ${enh.reference}): need exactly 1 correct option, got ${correctCount}`)
      return
    }

    // Check difficulty
    if (enh.difficulty && !['easy', 'medium', 'hard'].includes(enh.difficulty)) {
      errors.push(`Enhancement ${idx} (ref ${enh.reference}): invalid difficulty`)
      return
    }

    validCount++
  })

  if (errors.length > 0) {
    console.log(`⚠️  Validation errors found:`)
    errors.forEach(e => console.log(`   - ${e}`))
    console.log(`❌ Valid: ${validCount}/${enhancements.length}`)
    return false
  }

  console.log(`✅ All ${enhancements.length} enhancements valid`)
  return true
}

/**
 * Step 3: Update metadata
 */
function updateMetadata(enhancements) {
  console.log('\n💾 Step 3: Update metadata')
  console.log('═'.repeat(50))

  let metadata = {
    version: '2.0.0',
    description: 'Tracks quiz enhancements',
    lastProcessed: new Date().toISOString(),
    processedReferences: [],
    processedBatches: [],
    enhancementStats: {
      totalProcessed: 0,
      successful: 0,
      failed: 0
    }
  }

  // Load existing metadata if present
  if (fs.existsSync(METADATA_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'))
      metadata.processedReferences = existing.processedReferences || []
      metadata.processedBatches = existing.processedBatches || []
      metadata.enhancementStats = existing.enhancementStats || metadata.enhancementStats
    } catch (error) {
      console.warn('⚠️  Could not load existing metadata, creating fresh')
    }
  }

  // Add new references
  let added = 0
  let duplicates = 0

  enhancements.forEach(enh => {
    if (metadata.processedReferences.includes(enh.reference)) {
      duplicates++
    } else {
      metadata.processedReferences.push(enh.reference)
      metadata.enhancementStats.successful++
      added++
    }
  })

  metadata.enhancementStats.totalProcessed += added
  metadata.lastProcessed = new Date().toISOString()

  // Save metadata
  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2))

  console.log(`✅ Metadata updated:`)
  console.log(`   Added: ${added} new references`)
  console.log(`   Duplicates: ${duplicates}`)
  console.log(`   Total processed: ${metadata.enhancementStats.totalProcessed}`)

  return metadata
}

/**
 * Step 4: Generate import-ready file
 */
function generateImportFile(enhancements, outputDir) {
  console.log('\n📦 Step 4: Generate import file')
  console.log('═'.repeat(50))

  // Create import-ready JSON
  const importData = {
    type: 'quiz_enhancements',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    enhancements: enhancements,
    instructions: {
      method1: 'Browser Console: await dexieDb.bulkImportEnhancements(importData.enhancements)',
      method2: 'Use ImportView.vue to import via UI',
      method3: 'API endpoint /api/quiz/import (if available)'
    }
  }

  // Save import file
  const importPath = path.join(outputDir, 'enhancements-import.json')
  fs.writeFileSync(importPath, JSON.stringify(importData, null, 2))

  console.log(`✅ Import file created: ${path.basename(importPath)}`)

  // Also save individual enhancements file
  const enhancementsPath = path.join(outputDir, 'enhancements-only.json')
  fs.writeFileSync(enhancementsPath, JSON.stringify(enhancements, null, 2))
  console.log(`✅ Enhancements file created: ${path.basename(enhancementsPath)}`)

  return importPath
}

/**
 * Generate import instructions
 */
function generateInstructions(importPath, metadata) {
  console.log('\n📋 Step 5: Import Instructions')
  console.log('═'.repeat(50))

  const importFile = path.basename(importPath)

  console.log(`\n✨ Your quiz enhancements are ready to import!`)
  console.log(`\n📍 File location: ${importPath}`)
  console.log(`\n🔧 Import Method 1 (Browser Console - Recommended):`)
  console.log(`   1. Open the app in browser`)
  console.log(`   2. Press F12 to open DevTools`)
  console.log(`   3. Go to Console tab`)
  console.log(`   4. Copy and paste this code:`)
  console.log(`\n      fetch('${importFile}')`)
  console.log(`        .then(r => r.json())`)
  console.log(`        .then(data => dexieDb.bulkImportEnhancements(data.enhancements))`)
  console.log(`        .then(count => console.log(\`✅ Imported \${count} enhancements\`))`)
  console.log(`        .catch(e => console.error('❌ Import failed:', e))`)

  console.log(`\n🔧 Import Method 2 (Automatic):`)
  console.log(`   The app should automatically detect new enhancements`)
  console.log(`   and import them on next run`)

  console.log(`\n📊 Statistics:`)
  console.log(`   Enhanced Questions: ${metadata.enhancementStats.totalProcessed}`)
  console.log(`   Total in Database: ${metadata.processedReferences.length}`)
  console.log(`   Ready for Import: ✅`)

  console.log(`\n✅ Next Steps:`)
  console.log(`   1. Import using one of the methods above`)
  console.log(`   2. Refresh the app`)
  console.log(`   3. Try starting a quiz`)
  console.log(`   4. Generate next batch when ready\n`)
}

/**
 * Main function
 */
async function main() {
  const inputFile = process.argv[2]
  const autoImport = process.argv.includes('--import')

  if (!inputFile) {
    console.error('\n❌ Usage: node process-batch.js <output-file>')
    console.error('   Example: node process-batch.js batch-1762368648805-output.json')
    console.error('   With auto-import: node process-batch.js batch-1762368648805-output.json --import\n')
    process.exit(1)
  }

  // Resolve input path
  let inputPath = inputFile
  if (!path.isAbsolute(inputPath)) {
    inputPath = path.join(BATCHES_DIR, inputFile)
  }

  console.log('\n🚀 Quiz Batch Processing Pipeline V2.0')
  console.log('═'.repeat(50))

  try {
    // Step 1: Transform
    const transformed = transformToV2(inputPath)
    if (!transformed || !transformed.generatedEnhancements) {
      throw new Error('Transform failed')
    }

    // Step 2: Validate
    if (!validateEnhancements(transformed.generatedEnhancements)) {
      throw new Error('Validation failed')
    }

    // Step 3: Update metadata
    const metadata = updateMetadata(transformed.generatedEnhancements)

    // Step 4: Generate import file
    const importPath = generateImportFile(transformed.generatedEnhancements, BATCHES_DIR)

    // Step 5: Show instructions
    generateInstructions(importPath, metadata)

    if (autoImport) {
      console.log('🔄 Auto-import would happen in browser (not available in Node.js)\n')
    }

    console.log('═'.repeat(50))
    console.log('✅ Batch processing complete!\n')

  } catch (error) {
    console.error(`\n❌ Processing failed: ${error.message}\n`)
    process.exit(1)
  }
}

main()
