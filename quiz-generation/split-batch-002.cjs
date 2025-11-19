#!/usr/bin/env node

/**
 * Split batch-002-input.json into 20 sub-batches of 10 questions each
 * For parallel processing by Task agents
 */

const fs = require('fs')
const path = require('path')

const BATCH_FILE = path.join(__dirname, 'batches/batch-002-input.json')
const BATCHES_DIR = path.join(__dirname, 'batches')

// Read the main batch
const batch = JSON.parse(fs.readFileSync(BATCH_FILE, 'utf8'))
const allQuestions = batch.questions

console.log(`📚 Total questions: ${allQuestions.length}`)

// Split into 20 groups of 10
const subBatchSize = 10
const numSubBatches = Math.ceil(allQuestions.length / subBatchSize)

console.log(`🔪 Splitting into ${numSubBatches} sub-batches of ${subBatchSize} questions each\n`)

for (let i = 0; i < numSubBatches; i++) {
  const start = i * subBatchSize
  const end = Math.min(start + subBatchSize, allQuestions.length)
  const subQuestions = allQuestions.slice(start, end)

  const subBatchId = String(i + 1).padStart(2, '0')
  const subBatch = {
    subBatch: subBatchId,
    parentBatch: '002',
    created: new Date().toISOString(),
    count: subQuestions.length,
    questions: subQuestions
  }

  const subBatchPath = path.join(BATCHES_DIR, `batch-002-sub-${subBatchId}-input.json`)
  fs.writeFileSync(subBatchPath, JSON.stringify(subBatch, null, 2))

  console.log(`✅ Created batch-002-sub-${subBatchId}-input.json (${subQuestions.length} questions)`)
}

console.log(`\n✅ Split complete!`)
console.log(`📁 Files: quiz-generation/batches/batch-002-sub-01 through batch-002-sub-20`)
