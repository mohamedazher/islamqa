#!/usr/bin/env node

/**
 * Convert batch-002 questions to the correct format
 * From: {question, options: [], correctAnswer: index}
 * To: {questionText, type, difficulty, options: [{id, text, isCorrect}], tags, source}
 */

const fs = require('fs')
const path = require('path')

const BATCH_FILE = path.join(__dirname, 'batches/batch-002-output.json')

console.log('🔧 Fixing batch-002 format...\n')

// Read batch-002
const batch = JSON.parse(fs.readFileSync(BATCH_FILE, 'utf8'))
const questions = batch.quizQuestions

console.log(`📊 Total questions to fix: ${questions.length}\n`)

let fixed = 0
let errors = 0

// Convert each question
const fixedQuestions = questions.map((q, idx) => {
  try {
    // Check if already in correct format
    if (q.questionText && q.options && q.options[0] && q.options[0].id) {
      console.log(`✅ Question ${idx + 1} (Ref: ${q.reference}): Already in correct format`)
      return q
    }

    // Convert to correct format
    const optionLetters = ['a', 'b', 'c', 'd']
    const newOptions = q.options.map((text, i) => ({
      id: optionLetters[i],
      text: text,
      isCorrect: i === q.correctAnswer
    }))

    const fixedQ = {
      reference: q.reference,
      questionText: q.question || q.questionText,
      type: q.type || 'multiple-choice',
      difficulty: q.difficulty || 'medium',
      options: newOptions,
      explanation: q.explanation,
      tags: q.tags || [],
      source: q.source || `IslamQA reference ${q.reference}`
    }

    console.log(`🔧 Fixed question ${idx + 1} (Ref: ${q.reference})`)
    fixed++
    return fixedQ

  } catch (error) {
    console.log(`❌ Error fixing question ${idx + 1} (Ref: ${q.reference}): ${error.message}`)
    errors++
    return q
  }
})

// Save fixed output
const output = {
  quizQuestions: fixedQuestions
}

fs.writeFileSync(BATCH_FILE, JSON.stringify(output, null, 2))

console.log(`\n${'='.repeat(60)}`)
console.log(`📊 CONVERSION SUMMARY`)
console.log(`${'='.repeat(60)}`)
console.log(`Total questions:      ${questions.length}`)
console.log(`Fixed:                ${fixed}`)
console.log(`Already correct:      ${questions.length - fixed - errors}`)
console.log(`Errors:               ${errors}`)
console.log(`${'='.repeat(60)}`)
console.log(`\n✅ Saved to: ${BATCH_FILE}`)
