#!/usr/bin/env node

/**
 * Validate quiz questions for quality and content-specificity
 * Check for forbidden generic templates
 */

const fs = require('fs')
const path = require('path')

const BATCH_FILE = path.join(__dirname, '../public/data/quiz-questions.json')

// Forbidden phrases that indicate generic templates
const FORBIDDEN_PHRASES = [
  'It is permissible (halal) in Islam',
  'It is forbidden (haram) in Islam',
  'It depends on circumstances',
  'This ruling has exceptions',
  'This applies only to specific scholarly schools',
  'It is allowed only in cases of extreme necessity',
  'The opposite ruling applies',
  'There is no clear ruling',
  'It is obligatory (fard)',
  'It is makruh (disliked)',
  'left to individual discretion'
]

console.log('🔍 Validating quiz questions for quality...\n')

// Read batch
const batch = JSON.parse(fs.readFileSync(BATCH_FILE, 'utf8'))
const questions = batch.quizQuestions

console.log(`📊 Total questions: ${questions.length}\n`)

let issuesFound = 0
let totalOptions = 0
let genericOptions = 0

// Check each question
questions.forEach((q, idx) => {
  const questionNum = idx + 1
  let hasIssue = false

  // Check if has 4 options
  if (!q.options || q.options.length !== 4) {
    console.log(`❌ Question ${questionNum} (Ref: ${q.reference}): Does not have 4 options`)
    issuesFound++
    hasIssue = true
  }

  // Check if exactly 1 correct option
  const correctCount = q.options ? q.options.filter(o => o.isCorrect).length : 0
  if (correctCount !== 1) {
    console.log(`❌ Question ${questionNum} (Ref: ${q.reference}): Has ${correctCount} correct answers (should be 1)`)
    issuesFound++
    hasIssue = true
  }

  // Check for forbidden phrases in options
  if (q.options) {
    q.options.forEach((option, optIdx) => {
      totalOptions++
      const optionLetter = option.id || String.fromCharCode(97 + optIdx)

      for (const phrase of FORBIDDEN_PHRASES) {
        if (option.text.includes(phrase)) {
          console.log(`⚠️  Question ${questionNum} (Ref: ${q.reference}) Option ${optionLetter}: Contains forbidden phrase "${phrase}"`)
          console.log(`   Text: "${option.text}"`)
          genericOptions++
          hasIssue = true
        }
      }

      // Check for very short generic options
      if (option.text.length < 20 && (
        option.text.toLowerCase().includes('halal') ||
        option.text.toLowerCase().includes('haram') ||
        option.text.toLowerCase().includes('permissible') ||
        option.text.toLowerCase().includes('forbidden')
      )) {
        console.log(`⚠️  Question ${questionNum} (Ref: ${q.reference}) Option ${optionLetter}: Suspiciously short/generic (${option.text.length} chars)`)
        console.log(`   Text: "${option.text}"`)
        hasIssue = true
      }
    })
  }

  // Check for missing fields
  if (!q.questionText) {
    console.log(`❌ Question ${questionNum} (Ref: ${q.reference}): Missing questionText`)
    issuesFound++
    hasIssue = true
  }

  if (!q.explanation) {
    console.log(`❌ Question ${questionNum} (Ref: ${q.reference}): Missing explanation`)
    issuesFound++
    hasIssue = true
  }

  if (!q.tags || q.tags.length === 0) {
    console.log(`❌ Question ${questionNum} (Ref: ${q.reference}): Missing tags`)
    issuesFound++
    hasIssue = true
  }

  if (!hasIssue && questionNum <= 5) {
    console.log(`✅ Question ${questionNum} (Ref: ${q.reference}): Valid`)
  }
})

console.log(`\n${'='.repeat(60)}`)
console.log(`📊 VALIDATION SUMMARY`)
console.log(`${'='.repeat(60)}`)
console.log(`Total Questions:      ${questions.length}`)
console.log(`Total Options:        ${totalOptions}`)
console.log(`Generic Options:      ${genericOptions} (${((genericOptions/totalOptions)*100).toFixed(1)}%)`)
console.log(`Issues Found:         ${issuesFound}`)
console.log(`${'='.repeat(60)}`)

if (issuesFound === 0 && genericOptions === 0) {
  console.log(`\n✅ ALL QUESTIONS PASSED VALIDATION!`)
  console.log(`   No generic templates found.`)
  console.log(`   All questions have content-specific options.`)
} else if (genericOptions === 0) {
  console.log(`\n⚠️  Some issues found, but NO GENERIC TEMPLATES detected.`)
} else {
  console.log(`\n❌ VALIDATION FAILED!`)
  console.log(`   Found ${genericOptions} generic template options.`)
  console.log(`   These need to be regenerated with content-specific details.`)
}

console.log(``)

process.exit(issuesFound > 0 || genericOptions > 0 ? 1 : 0)
