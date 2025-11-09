#!/usr/bin/env node

/**
 * Quiz Generation Helper Script - V2 (Modernized)
 *
 * Loads questions from new semantic reference ID database
 * Generates quiz enhancements (high-quality options) using LLM
 *
 * Modes:
 * - select: Select random unprocessed source questions from database
 * - validate: Validate generated enhancement JSON
 * - merge: Merge generated enhancements into database
 * - stats: Show processing statistics
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Paths - Updated for new data structure
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
 * Load questions from new database format (semantic reference IDs)
 */
function loadQuestionsDatabase() {
  try {
    const content = fs.readFileSync(PATHS.questionsData, 'utf8')
    const questions = JSON.parse(content)
    console.log(`📚 Loaded ${questions.length} questions from database`)
    return questions
  } catch (error) {
    console.error('❌ Error loading questions:', error.message)
    return []
  }
}

/**
 * Load categories from new database format
 */
function loadCategoriesDatabase() {
  try {
    const content = fs.readFileSync(PATHS.categoriesData, 'utf8')
    const categories = JSON.parse(content)
    console.log(`📂 Loaded ${categories.length} categories from database`)
    return categories
  } catch (error) {
    console.error('❌ Error loading categories:', error.message)
    return []
  }
}

/**
 * Load or initialize enhancement metadata
 */
function loadMetadata() {
  if (fs.existsSync(PATHS.enhancementMetadata)) {
    return JSON.parse(fs.readFileSync(PATHS.enhancementMetadata, 'utf8'))
  }

  // Initialize empty metadata
  return {
    version: '2.0.0',
    description: 'Tracks quiz enhancements generated from new database structure',
    lastProcessed: new Date().toISOString(),
    processedReferences: [], // Array of question references that have been enhanced
    enhancementStats: {
      totalProcessed: 0,
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

  const questions = loadQuestionsDatabase()
  const categories = loadCategoriesDatabase()
  const metadata = loadMetadata()

  // Create category map for easier lookup
  const categoryMap = {}
  categories.forEach(cat => {
    categoryMap[cat.reference] = cat
  })

  const processedReferences = new Set(metadata.processedReferences)
  console.log(`Already processed: ${processedReferences.size} questions`)

  // Filter unprocessed questions
  const unprocessed = questions.filter(q => !processedReferences.has(q.reference))
  console.log(`${unprocessed.length} unprocessed questions available`)

  if (unprocessed.length === 0) {
    console.log('✨ All questions have been processed! Great job!')
    return
  }

  // Shuffle and select
  const shuffled = unprocessed.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, unprocessed.length))

  // Prepare batch with enhanced information for Claude
  const batch = {
    batchId: `batch-${Date.now()}`,
    createdDate: new Date().toISOString(),
    format: '2.0 (semantic reference IDs)',
    instructions: 'Generate high-quality multiple-choice options for these questions. Use semantic reference IDs.',
    sourceQuestions: selected.map(q => ({
      reference: q.reference,              // Semantic reference ID (primary key)
      title: q.title,                      // Short title
      question: q.question,                // Full question text (markdown/HTML)
      answer: q.answer,                    // Full answer text (markdown/HTML)
      primary_category: q.primary_category, // Main category reference
      tags: q.tags || []                   // Existing tags
    }))
  }

  // Save batch file
  const batchPath = path.join(PATHS.batchesDir, `${batch.batchId}.json`)
  fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2))

  console.log(`\n✅ Batch created: ${batchPath}`)
  console.log(`\n📊 Batch Summary:`)
  console.log(`   - Questions: ${batch.sourceQuestions.length}`)
  console.log(`   - Batch ID: ${batch.batchId}`)
  console.log(`\n📝 Next steps:`)
  console.log(`1. Open the batch file above`)
  console.log(`2. Use generate-quiz-prompt-v2.md with Claude`)
  console.log(`3. Copy the batch questions into the prompt`)
  console.log(`4. Save Claude's output as ${batch.batchId}-output.json`)
  console.log(`5. Run: node generate-quiz-v2.js --mode=merge --input=${batch.batchId}-output.json\n`)

  return batch.batchId
}

/**
 * MODE: Validate generated enhancement JSON
 */
function validateEnhancements(inputPath) {
  console.log(`\n🔍 Validating ${inputPath}...\n`)

  const content = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

  if (!content.generatedEnhancements || !Array.isArray(content.generatedEnhancements)) {
    console.error('❌ Invalid format: missing generatedEnhancements array')
    return false
  }

  const errors = []
  content.generatedEnhancements.forEach((enhancement, idx) => {
    // Check required fields
    if (!enhancement.reference) errors.push(`Enhancement ${idx}: missing reference (semantic ID)`)
    if (!enhancement.options || enhancement.options.length < 2) {
      errors.push(`Enhancement ${idx} (ref ${enhancement.reference}): need at least 2 options`)
    }

    // Check options
    if (enhancement.options) {
      const correctCount = enhancement.options.filter(o => o.isCorrect).length
      if (correctCount !== 1) {
        errors.push(`Enhancement ${idx}: must have exactly 1 correct option (found ${correctCount})`)
      }

      // Check option structure
      enhancement.options.forEach((opt, optIdx) => {
        if (!opt.id) errors.push(`Enhancement ${idx}, option ${optIdx}: missing id`)
        if (!opt.text) errors.push(`Enhancement ${idx}, option ${optIdx}: missing text`)
        if (opt.isCorrect === undefined) errors.push(`Enhancement ${idx}, option ${optIdx}: missing isCorrect`)
      })
    }

    // Check other fields
    if (enhancement.difficulty && !['easy', 'medium', 'hard'].includes(enhancement.difficulty)) {
      errors.push(`Enhancement ${idx}: invalid difficulty level`)
    }
  })

  if (errors.length > 0) {
    console.error('❌ Validation failed:\n')
    errors.forEach(e => console.error(`  - ${e}`))
    return false
  }

  console.log(`✅ Validation passed: ${content.generatedEnhancements.length} enhancements`)
  return true
}

/**
 * MODE: Merge generated enhancements
 */
function mergeEnhancements(inputPath) {
  console.log(`\n🔀 Merging enhancements from ${inputPath}...\n`)

  // Validate first
  if (!validateEnhancements(inputPath)) {
    console.error('❌ Merge aborted due to validation errors')
    return
  }

  const generated = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  const metadata = loadMetadata()

  let added = 0
  let skipped = 0

  // Process each enhancement
  generated.generatedEnhancements.forEach(enhancement => {
    const ref = enhancement.reference

    if (metadata.processedReferences.includes(ref)) {
      console.log(`⚠️  Skipping duplicate: reference ${ref}`)
      skipped++
      return
    }

    // Mark as processed
    metadata.processedReferences.push(ref)
    metadata.enhancementStats.totalProcessed++

    // Save enhancement to batches directory (can be imported into Dexie later)
    added++
  })

  // Save updated metadata
  saveMetadata(metadata)

  console.log(`\n✅ Merge complete:`)
  console.log(`   Added: ${added}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total processed: ${metadata.enhancementStats.totalProcessed}`)

  // Save merged enhancements for import
  const mergedPath = path.join(PATHS.batchesDir, `${path.basename(inputPath, '.json')}-merged.json`)
  fs.writeFileSync(mergedPath, JSON.stringify(generated, null, 2))
  console.log(`\n📦 Merged enhancements saved: ${mergedPath}`)
  console.log(`\n💾 To import into Dexie:`)
  console.log(`   - Read this file`)
  console.log(`   - Use db.bulkImportEnhancements() in QuizService`)
  console.log(`   - Or manually import in browser DevTools\n`)
}

/**
 * MODE: Show statistics
 */
function showStats() {
  console.log(`\n📊 Quiz Enhancement Generation Statistics\n`)

  const questions = loadQuestionsDatabase()
  const metadata = loadMetadata()

  console.log(`Source Questions:  ${questions.length}`)
  console.log(`Enhanced:          ${metadata.processedReferences.length}`)
  console.log(`Remaining:         ${questions.length - metadata.processedReferences.length}`)
  console.log(`Success Rate:      ${metadata.enhancementStats.totalProcessed > 0 ? ((metadata.enhancementStats.successful / metadata.enhancementStats.totalProcessed) * 100).toFixed(1) : 0}%`)
  console.log(`\nLast Updated:      ${metadata.lastProcessed}\n`)
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {}

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2)
      const nextArg = args[i + 1]

      if (!nextArg || nextArg.startsWith('--')) {
        // Flag with no value
        parsed[key] = true
      } else {
        // Value provided
        const value = nextArg
        parsed[key] = value === 'true' ? true : value === 'false' ? false : value
        i++
      }
    }
  }

  return parsed
}

/**
 * Main
 */
const args = parseArgs()
const mode = args.mode || 'stats'

console.log('\n🚀 Quiz Enhancement Generator V2.0 (New Database Format)\n')

try {
  switch (mode) {
    case 'select':
      const count = parseInt(args.count) || 50
      selectQuestions(count)
      break

    case 'validate':
      const validateInput = args.input || args.file
      if (!validateInput) {
        console.error('❌ Please provide input file: --input=batch-file.json')
        process.exit(1)
      }
      const validPath = path.join(PATHS.batchesDir, validateInput.endsWith('.json') ? validateInput : `${validateInput}.json`)
      validateEnhancements(validPath)
      break

    case 'merge':
      const mergeInput = args.input || args.file
      if (!mergeInput) {
        console.error('❌ Please provide input file: --input=batch-file-output.json')
        process.exit(1)
      }
      const mergePath = path.join(PATHS.batchesDir, mergeInput.endsWith('.json') ? mergeInput : `${mergeInput}.json`)
      mergeEnhancements(mergePath)
      break

    case 'stats':
      showStats()
      break

    default:
      console.error(`❌ Unknown mode: ${mode}`)
      console.log('\nAvailable modes:')
      console.log('  --mode=select      Select random unprocessed questions')
      console.log('  --mode=validate    Validate generated enhancement JSON')
      console.log('  --mode=merge       Merge enhancements into database')
      console.log('  --mode=stats       Show processing statistics')
      process.exit(1)
  }
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
