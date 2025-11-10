#!/usr/bin/env node

/**
 * Quiz Generation Script - V2.0 (Native)
 *
 * Complete pipeline for generating and processing quiz enhancements
 * using the semantic reference ID database
 *
 * Modes:
 *   --mode=select    Select unprocessed questions for enhancement
 *   --mode=validate  Validate Claude's generated output
 *   --mode=merge     Track processed questions in metadata
 *   --mode=stats     Show enhancement progress statistics
 *   --mode=import    Import enhancements into Dexie database
 *
 * Usage:
 *   node generate-quiz.js --mode=select --count=50
 *   node generate-quiz.js --mode=validate --input=batch-output.json
 *   node generate-quiz.js --mode=merge --input=batch-output.json
 *   node generate-quiz.js --mode=import --input=batch-output.json
 *   node generate-quiz.js --mode=stats
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configuration paths
const PATHS = {
  questionsData: path.join(__dirname, '../../public/data/questions.json'),
  categoriesData: path.join(__dirname, '../../public/data/categories.json'),
  enhancementMetadata: path.join(__dirname, '../enhancement-metadata.json'),
  batchesDir: path.join(__dirname, '../batches')
}

// Ensure directories exist
if (!fs.existsSync(PATHS.batchesDir)) {
  fs.mkdirSync(PATHS.batchesDir, { recursive: true })
}

/**
 * Load questions from database
 */
function loadQuestions() {
  try {
    const content = fs.readFileSync(PATHS.questionsData, 'utf8')
    const questions = JSON.parse(content)
    return questions
  } catch (error) {
    console.error('❌ Error loading questions:', error.message)
    return []
  }
}

/**
 * Load or initialize metadata
 */
function loadMetadata() {
  if (fs.existsSync(PATHS.enhancementMetadata)) {
    try {
      return JSON.parse(fs.readFileSync(PATHS.enhancementMetadata, 'utf8'))
    } catch (error) {
      return initializeMetadata()
    }
  }
  return initializeMetadata()
}

/**
 * Initialize fresh metadata
 */
function initializeMetadata() {
  return {
    version: '2.0.0',
    createdDate: new Date().toISOString(),
    lastProcessed: new Date().toISOString(),
    processedReferences: [],
    processedBatches: [],
    stats: {
      totalEnhanced: 0,
      successful: 0,
      failed: 0
    }
  }
}

/**
 * Save metadata
 */
function saveMetadata(metadata) {
  metadata.lastProcessed = new Date().toISOString()
  fs.writeFileSync(PATHS.enhancementMetadata, JSON.stringify(metadata, null, 2))
  console.log('✅ Metadata saved')
}

/**
 * MODE: Select random unprocessed questions
 */
function selectQuestions(count = 50) {
  console.log(`\n📋 Selecting ${count} random unprocessed questions...\n`)

  const questions = loadQuestions()
  const metadata = loadMetadata()

  if (questions.length === 0) {
    console.error('❌ No questions found in database')
    return
  }

  const processed = new Set(metadata.processedReferences)
  console.log(`📚 Total questions: ${questions.length}`)
  console.log(`✅ Already enhanced: ${processed.size}`)

  // Filter unprocessed
  const unprocessed = questions.filter(q => !processed.has(q.reference))
  console.log(`⏳ Unprocessed: ${unprocessed.length}`)

  if (unprocessed.length === 0) {
    console.log('\n✨ All questions enhanced!')
    return
  }

  // Shuffle and select
  const shuffled = unprocessed.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, unprocessed.length))

  // Create batch
  const batch = {
    batchId: `batch-${Date.now()}`,
    createdDate: new Date().toISOString(),
    format: 'V2.0 - Semantic Reference IDs',
    sourceQuestions: selected.map(q => ({
      reference: q.reference,
      title: q.title,
      question: q.question,
      answer: q.answer,
      primary_category: q.primary_category,
      tags: q.tags || []
    }))
  }

  // Save batch
  const batchPath = path.join(PATHS.batchesDir, `${batch.batchId}.json`)
  fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2))

  console.log(`\n✅ Batch created: ${batch.batchId}`)
  console.log(`📊 Selected: ${batch.sourceQuestions.length} questions`)
  console.log(`📁 Location: ${batchPath}`)
  console.log(`\n📝 Next steps:`)
  console.log(`   1. Open generate-quiz-prompt.md`)
  console.log(`   2. Paste batch JSON into prompt`)
  console.log(`   3. Send to Claude for generation`)
  console.log(`   4. Save output as: ${batch.batchId}-output.json`)
  console.log(`   5. Run: node generate-quiz.js --mode=validate --input=${batch.batchId}-output.json\n`)
}

/**
 * MODE: Validate generated enhancements
 */
function validateOutput(inputFile) {
  console.log(`\n🔍 Validating ${inputFile}...\n`)

  // Resolve path
  let inputPath = inputFile
  if (!path.isAbsolute(inputPath)) {
    inputPath = path.join(PATHS.batchesDir, inputFile)
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`)
    return false
  }

  try {
    const content = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

    if (!content.generatedEnhancements || !Array.isArray(content.generatedEnhancements)) {
      console.error('❌ Invalid format: missing generatedEnhancements array')
      return false
    }

    const errors = []
    const warnings = []

    content.generatedEnhancements.forEach((enh, idx) => {
      // Check reference
      if (!enh.reference) {
        errors.push(`Enhancement ${idx}: missing reference`)
        return
      }

      // Check question text
      if (!enh.questionText) {
        errors.push(`Enhancement ${idx} (ref ${enh.reference}): missing questionText`)
      }

      // Check options
      if (!enh.options || enh.options.length !== 4) {
        errors.push(`Enhancement ${idx} (ref ${enh.reference}): need exactly 4 options, got ${enh.options?.length || 0}`)
        return
      }

      // Check correct answer
      const correctCount = enh.options.filter(o => o.isCorrect).length
      if (correctCount !== 1) {
        errors.push(`Enhancement ${idx} (ref ${enh.reference}): need exactly 1 correct option, got ${correctCount}`)
      }

      // Check option structure
      enh.options.forEach((opt, optIdx) => {
        if (!opt.id || !['a', 'b', 'c', 'd'].includes(opt.id)) {
          errors.push(`Enhancement ${idx}, option ${optIdx}: invalid id`)
        }
        if (!opt.text) {
          errors.push(`Enhancement ${idx}, option ${optIdx}: missing text`)
        }
      })

      // Check difficulty
      if (!['easy', 'medium', 'hard'].includes(enh.difficulty)) {
        warnings.push(`Enhancement ${idx} (ref ${enh.reference}): difficulty "${enh.difficulty}" should be easy/medium/hard`)
      }

      // Check tags
      if (!Array.isArray(enh.tags) || enh.tags.length === 0) {
        warnings.push(`Enhancement ${idx} (ref ${enh.reference}): missing or empty tags`)
      }

      // Check explanation
      if (!enh.explanation || enh.explanation.length < 10) {
        warnings.push(`Enhancement ${idx} (ref ${enh.reference}): explanation too short or missing`)
      }
    })

    // Display results
    console.log(`📊 Validation Results:\n`)
    console.log(`   Total: ${content.generatedEnhancements.length}`)

    if (errors.length === 0) {
      console.log(`   ✅ Errors: 0`)
    } else {
      console.log(`   ❌ Errors: ${errors.length}`)
      errors.forEach(e => console.log(`      - ${e}`))
    }

    if (warnings.length === 0) {
      console.log(`   ⚠️  Warnings: 0`)
    } else {
      console.log(`   ⚠️  Warnings: ${warnings.length}`)
      warnings.slice(0, 5).forEach(w => console.log(`      - ${w}`))
      if (warnings.length > 5) {
        console.log(`      ... and ${warnings.length - 5} more`)
      }
    }

    if (errors.length > 0) {
      console.log(`\n❌ Validation FAILED\n`)
      return false
    }

    console.log(`\n✅ Validation PASSED\n`)
    console.log(`📝 Next: node generate-quiz.js --mode=merge --input=${path.basename(inputPath)}\n`)
    return true

  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    return false
  }
}

/**
 * MODE: Merge enhancements into metadata
 */
function mergeEnhancements(inputFile) {
  console.log(`\n🔀 Merging enhancements...\n`)

  // Resolve path
  let inputPath = inputFile
  if (!path.isAbsolute(inputPath)) {
    inputPath = path.join(PATHS.batchesDir, inputFile)
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`)
    return
  }

  // Validate first
  if (!validateOutput(inputPath)) {
    console.error('❌ Merge aborted: validation failed')
    return
  }

  try {
    const content = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
    const metadata = loadMetadata()

    let added = 0
    let duplicates = 0

    // Process each enhancement
    content.generatedEnhancements.forEach(enh => {
      if (metadata.processedReferences.includes(enh.reference)) {
        duplicates++
      } else {
        metadata.processedReferences.push(enh.reference)
        metadata.stats.totalEnhanced++
        metadata.stats.successful++
        added++
      }
    })

    // Save metadata
    saveMetadata(metadata)

    // Save enhancement data for import
    const enhancementsPath = path.join(PATHS.batchesDir, `${path.basename(inputPath, '.json')}-merged.json`)
    fs.writeFileSync(enhancementsPath, JSON.stringify(content, null, 2))

    console.log(`✅ Merge Complete:\n`)
    console.log(`   Added: ${added}`)
    console.log(`   Duplicates: ${duplicates}`)
    console.log(`   Total enhanced: ${metadata.stats.totalEnhanced}`)
    console.log(`\n📦 Merged file: ${path.basename(enhancementsPath)}`)
    console.log(`\n📝 Next: node generate-quiz.js --mode=import --input=${path.basename(enhancementsPath)}\n`)

  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
  }
}

/**
 * MODE: Show statistics
 */
function showStats() {
  console.log(`\n📊 Enhancement Statistics\n`)
  console.log('═'.repeat(50))

  const questions = loadQuestions()
  const metadata = loadMetadata()

  const enhanced = metadata.processedReferences.length
  const total = questions.length
  const remaining = total - enhanced
  const percentage = total > 0 ? ((enhanced / total) * 100).toFixed(1) : 0

  console.log(`Total Questions:  ${total}`)
  console.log(`Enhanced:         ${enhanced} (${percentage}%)`)
  console.log(`Remaining:        ${remaining}`)
  console.log(`Success Rate:     ${metadata.stats.successful > 0 ? '100%' : 'N/A'}`)
  console.log(`Last Updated:     ${new Date(metadata.lastProcessed).toLocaleString()}`)
  console.log('═'.repeat(50))
  console.log()
}

/**
 * MODE: Import enhancements into Dexie
 * (Generates import script for browser)
 */
function generateImportScript(inputFile) {
  console.log(`\n📥 Generating import script...\n`)

  // Resolve path
  let inputPath = inputFile
  if (!path.isAbsolute(inputPath)) {
    inputPath = path.join(PATHS.batchesDir, inputFile)
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`)
    return
  }

  try {
    const content = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
    const enhancements = content.generatedEnhancements || []

    console.log(`✅ Ready to import: ${enhancements.length} enhancements\n`)
    console.log('═'.repeat(60))
    console.log('BROWSER CONSOLE IMPORT INSTRUCTIONS')
    console.log('═'.repeat(60))
    console.log()
    console.log('1. Open the app in browser')
    console.log('2. Press F12 to open DevTools')
    console.log('3. Go to Console tab')
    console.log('4. Copy and paste this code:\n')

    console.log(`const enhancements = ${JSON.stringify(enhancements, null, 2)};`)
    console.log(`await dexieDb.bulkImportEnhancements(enhancements);`)
    console.log(`const stats = await dexieDb.getEnhancementStats();`)
    console.log(`console.log('✅ Imported:', stats);`)

    console.log()
    console.log('═'.repeat(60))
    console.log()
    console.log('After import:')
    console.log('  • Refresh the app')
    console.log('  • Try starting a quiz')
    console.log('  • Enhanced questions will appear automatically\n')

  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      // Handle --key=value format
      if (arg.includes('=')) {
        const [key, value] = arg.substring(2).split('=', 2)
        parsed[key] = value
      } else {
        // Handle --key value format
        const key = arg.substring(2)
        const nextArg = args[i + 1]
        if (!nextArg || nextArg.startsWith('--')) {
          parsed[key] = true
        } else {
          parsed[key] = nextArg
          i++
        }
      }
    }
  }

  return parsed
}

/**
 * Main
 */
function main() {
  const args = parseArgs()
  const mode = args.mode || 'stats'

  console.log('\n🚀 Quiz Enhancement Generator V2.0\n')

  try {
    switch (mode) {
      case 'select':
        const count = parseInt(args.count) || 50
        selectQuestions(count)
        break

      case 'validate':
        const validateInput = args.input || args.file
        if (!validateInput) {
          console.error('❌ Usage: --mode=validate --input=<batch-file>')
          process.exit(1)
        }
        validateOutput(validateInput)
        break

      case 'merge':
        const mergeInput = args.input || args.file
        if (!mergeInput) {
          console.error('❌ Usage: --mode=merge --input=<batch-file>')
          process.exit(1)
        }
        mergeEnhancements(mergeInput)
        break

      case 'import':
        const importInput = args.input || args.file
        if (!importInput) {
          console.error('❌ Usage: --mode=import --input=<batch-file>')
          process.exit(1)
        }
        generateImportScript(importInput)
        break

      case 'stats':
        showStats()
        break

      default:
        console.error(`❌ Unknown mode: ${mode}`)
        console.log('\nAvailable modes:')
        console.log('  select    Select unprocessed questions')
        console.log('  validate  Validate generated output')
        console.log('  merge     Track processed questions')
        console.log('  import    Generate browser import script')
        console.log('  stats     Show statistics')
        console.log()
        process.exit(1)
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`)
    process.exit(1)
  }
}

main()
