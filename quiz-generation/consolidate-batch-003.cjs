#!/usr/bin/env node

/**
 * Consolidate all batch-003 sub-batch outputs
 */

const fs = require('fs')
const path = require('path')

const BATCHES_DIR = path.join(__dirname, 'batches')
const OUTPUT_FILE = path.join(BATCHES_DIR, 'batch-003-output.json')

console.log('🔨 Consolidating batch-003 sub-batch outputs...\n')

const allQuizQuestions = []
const processedRefs = new Set()

// Read all 20 sub-batch outputs
for (let i = 1; i <= 20; i++) {
  const subBatchId = String(i).padStart(2, '0')
  const filePath = path.join(BATCHES_DIR, `batch-003-sub-${subBatchId}-output.json`)

  if (!fs.existsSync(filePath)) {
    console.log(`❌ Missing: batch-003-sub-${subBatchId}-output.json`)
    continue
  }

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

    console.log(`✅ Sub-batch ${subBatchId}: ${quizQuestions.length} questions`)
  } catch (error) {
    console.log(`❌ Sub-batch ${subBatchId}: Error - ${error.message}`)
  }
}

// Create consolidated output
const output = {
  quizQuestions: allQuizQuestions
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2))

console.log(`\n✅ Consolidated ${allQuizQuestions.length} quiz questions`)
console.log(`📁 Output: quiz-generation/batches/batch-003-output.json`)
