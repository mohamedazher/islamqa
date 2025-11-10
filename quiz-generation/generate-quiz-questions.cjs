#!/usr/bin/env node

/**
 * Quiz Question Generation Script - Simplified
 *
 * Commands:
 *   select --count=N   Select N unprocessed questions for a new batch
 *   status             Show current progress and stats
 *   build              Build consolidated quiz-questions.json for app
 *   reset              Clear all metadata (for testing)
 *
 * Workflow:
 *   1. node generate-quiz-questions.js select --count=100
 *   2. (Agent generates quiz questions for the batch)
 *   3. node generate-quiz-questions.js build
 *   4. git add & commit
 */

const fs = require('fs')
const path = require('path')

const QUESTIONS_PATH = path.join(__dirname, '../public/data/questions.json')
const METADATA_PATH = path.join(__dirname, 'quiz-metadata.json')
const BATCHES_DIR = path.join(__dirname, 'batches')
const OUTPUT_PATH = path.join(__dirname, '../public/data/quiz-questions.json')

// Ensure directories exist
if (!fs.existsSync(BATCHES_DIR)) {
  fs.mkdirSync(BATCHES_DIR, { recursive: true })
}

/**
 * Load metadata (which questions have been processed)
 */
function loadMetadata() {
  if (!fs.existsSync(METADATA_PATH)) {
    return {
      version: '3.0',
      processedQuestions: [],
      batches: [],
      stats: {
        totalQuestions: 0,
        generated: 0,
        coverage: 0
      }
    }
  }
  return JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'))
}

/**
 * Save metadata
 */
function saveMetadata(metadata) {
  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2))
}

/**
 * Get next batch ID
 */
function getNextBatchId(metadata) {
  if (metadata.batches.length === 0) {
    return '001'
  }
  const lastId = metadata.batches[metadata.batches.length - 1].id
  const nextNum = parseInt(lastId) + 1
  return String(nextNum).padStart(3, '0')
}

/**
 * SELECT command: Pick unprocessed questions for a new batch
 */
function selectCommand(count) {
  console.log(`\n🎯 Selecting ${count} unprocessed questions...\n`)

  // Load all questions
  if (!fs.existsSync(QUESTIONS_PATH)) {
    console.error('❌ questions.json not found at:', QUESTIONS_PATH)
    process.exit(1)
  }

  const allQuestions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))
  console.log(`📚 Total questions in database: ${allQuestions.length}`)

  // Load metadata
  const metadata = loadMetadata()
  const processed = new Set(metadata.processedQuestions)

  // Filter unprocessed
  const unprocessed = allQuestions.filter(q => !processed.has(q.reference))
  console.log(`⏳ Unprocessed questions: ${unprocessed.length}`)

  if (unprocessed.length === 0) {
    console.log('✅ All questions already processed!')
    return
  }

  if (unprocessed.length < count) {
    console.log(`⚠️  Only ${unprocessed.length} questions available (requested ${count})`)
    count = unprocessed.length
  }

  // Randomly select
  const selected = []
  const indices = new Set()
  while (selected.length < count && indices.size < unprocessed.length) {
    const idx = Math.floor(Math.random() * unprocessed.length)
    if (!indices.has(idx)) {
      indices.add(idx)
      selected.push(unprocessed[idx])
    }
  }

  // Get batch ID
  const batchId = getNextBatchId(metadata)

  // Create batch file
  const batch = {
    batch: batchId,
    created: new Date().toISOString(),
    count: selected.length,
    questions: selected.map(q => ({
      reference: q.reference,
      title: q.title,
      question: q.question,
      answer: q.answer,
      primary_category: q.primary_category,
      categories: q.categories,
      tags: q.tags
    }))
  }

  const batchPath = path.join(BATCHES_DIR, `batch-${batchId}-input.json`)
  fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2))

  // Update metadata (mark as pending)
  metadata.batches.push({
    id: batchId,
    date: new Date().toISOString().split('T')[0],
    count: selected.length,
    status: 'pending',
    references: selected.map(q => q.reference)
  })
  saveMetadata(metadata)

  console.log(`\n✅ Created batch ${batchId}`)
  console.log(`📁 File: batches/batch-${batchId}-input.json`)
  console.log(`📊 Questions: ${selected.length}`)
  console.log(`🔍 References: [${selected.map(q => q.reference).slice(0, 5).join(', ')}, ...]`)
  console.log(`\n📝 Next step: Ask Claude Code agent to generate quiz questions for batch ${batchId}`)
  console.log(`   Command: "Generate quiz questions for batch ${batchId}"`)
}

/**
 * STATUS command: Show progress
 */
function statusCommand() {
  const metadata = loadMetadata()

  // Load total questions
  let totalQuestions = 0
  if (fs.existsSync(QUESTIONS_PATH)) {
    const allQuestions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))
    totalQuestions = allQuestions.length
  }

  const generated = metadata.processedQuestions.length
  const remaining = totalQuestions - generated
  const coverage = totalQuestions > 0 ? ((generated / totalQuestions) * 100).toFixed(1) : 0

  console.log(`\n📊 Quiz Question Generation Status`)
  console.log(`${'='.repeat(50)}`)
  console.log(`Total Questions:    ${totalQuestions.toLocaleString()}`)
  console.log(`Generated:          ${generated.toLocaleString()} (${coverage}%)`)
  console.log(`Remaining:          ${remaining.toLocaleString()}`)
  console.log(`${'='.repeat(50)}`)

  if (metadata.batches.length > 0) {
    console.log(`\n📦 Recent Batches:`)
    metadata.batches.slice(-10).reverse().forEach(batch => {
      const status = batch.status === 'completed' ? '✅' : '⏳'
      console.log(`  ${status} Batch ${batch.id} (${batch.date}): ${batch.count} questions`)
    })
  } else {
    console.log(`\n⚠️  No batches yet. Run: node generate-quiz-questions.js select --count=100`)
  }

  console.log(``)
}

/**
 * BUILD command: Consolidate all batches into quiz-questions.json
 */
function buildCommand() {
  console.log(`\n🔨 Building consolidated quiz-questions.json...\n`)

  const metadata = loadMetadata()
  const allQuizQuestions = []
  const processedRefs = new Set()

  // Find all completed batch output files
  const batchFiles = fs.readdirSync(BATCHES_DIR)
    .filter(f => f.endsWith('-output.json'))
    .sort()

  if (batchFiles.length === 0) {
    console.log('⚠️  No batch output files found. Generate quiz questions first.')
    console.log('   Run: Ask agent to "Generate quiz questions for batch XXX"')
    return
  }

  console.log(`📦 Found ${batchFiles.length} batch output files`)

  // Read all batch outputs
  for (const file of batchFiles) {
    const filePath = path.join(BATCHES_DIR, file)
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      const quizQuestions = content.quizQuestions || []

      for (const qq of quizQuestions) {
        // Avoid duplicates
        if (!processedRefs.has(qq.reference)) {
          processedRefs.add(qq.reference)
          allQuizQuestions.push(qq)
        }
      }

      console.log(`  ✅ ${file}: ${quizQuestions.length} questions`)
    } catch (error) {
      console.log(`  ❌ ${file}: Error reading - ${error.message}`)
    }
  }

  // Write consolidated file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allQuizQuestions, null, 2))

  console.log(`\n✅ Built quiz-questions.json`)
  console.log(`📊 Total quiz questions: ${allQuizQuestions.length}`)
  console.log(`📁 File: public/data/quiz-questions.json`)
  console.log(`🎯 Ready for app import`)
  console.log(`\n📝 Next step: Commit and push`)
  console.log(`   git add quiz-generation/ public/data/quiz-questions.json`)
  console.log(`   git commit -m "Add ${allQuizQuestions.length} quiz questions"`)
  console.log(`   git push`)
}

/**
 * RESET command: Clear metadata (for testing)
 */
function resetCommand() {
  console.log(`\n⚠️  Resetting metadata...\n`)

  if (fs.existsSync(METADATA_PATH)) {
    fs.unlinkSync(METADATA_PATH)
    console.log('✅ Deleted quiz-metadata.json')
  }

  if (fs.existsSync(BATCHES_DIR)) {
    const files = fs.readdirSync(BATCHES_DIR)
    for (const file of files) {
      fs.unlinkSync(path.join(BATCHES_DIR, file))
    }
    console.log(`✅ Deleted ${files.length} batch files`)
  }

  console.log('\n🔄 Reset complete. Start fresh with:')
  console.log('   node generate-quiz-questions.js select --count=100')
}

/**
 * Main CLI
 */
function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command) {
    console.log(`
Quiz Question Generation Script

Commands:
  select --count=N   Select N unprocessed questions for a new batch
  status             Show current progress and stats
  build              Build consolidated quiz-questions.json for app
  reset              Clear all metadata (for testing)

Workflow:
  1. node generate-quiz-questions.js select --count=100
  2. Ask agent: "Generate quiz questions for batch 001"
  3. node generate-quiz-questions.js build
  4. git add & commit
    `)
    process.exit(0)
  }

  switch (command) {
    case 'select': {
      const countArg = args.find(a => a.startsWith('--count='))
      const count = countArg ? parseInt(countArg.split('=')[1]) : 50
      if (isNaN(count) || count < 1 || count > 1000) {
        console.error('❌ Count must be between 1 and 1000')
        process.exit(1)
      }
      selectCommand(count)
      break
    }
    case 'status':
      statusCommand()
      break
    case 'build':
      buildCommand()
      break
    case 'reset':
      resetCommand()
      break
    default:
      console.error(`❌ Unknown command: ${command}`)
      console.log('   Run without arguments to see available commands')
      process.exit(1)
  }
}

main()
