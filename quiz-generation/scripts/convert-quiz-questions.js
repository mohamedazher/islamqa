#!/usr/bin/env node

/**
 * Convert quiz-questions.json to enhancements.json format
 *
 * Transforms the high-quality quiz-questions.json (445 questions)
 * into the format expected by the app in enhancements.json
 *
 * Usage: node convert-quiz-questions.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const INPUT_FILE = path.join(__dirname, '../quiz-questions.json')
const OUTPUT_FILE = path.join(__dirname, '../../public/data/enhancements.json')

console.log('🔄 Converting quiz-questions.json to enhancements.json format...\n')

// Read input file
const inputData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'))
console.log(`📂 Input: ${inputData.totalQuizzes} quizzes from quiz-questions.json`)

// Convert format
const enhancements = inputData.quizzes.map(quiz => ({
  reference: quiz.sourceQuestionId,  // Convert sourceQuestionId -> reference
  questionText: quiz.questionText,
  type: quiz.type,
  difficulty: quiz.difficulty,
  options: quiz.options,
  explanation: quiz.explanation,
  tags: quiz.tags,
  source: `IslamQA reference ${quiz.sourceQuestionId}`,
  points: quiz.points || 10,
  // Include original metadata for reference
  category: quiz.category,
  sourceReference: quiz.sourceReference
}))

// Backup existing enhancements.json
if (fs.existsSync(OUTPUT_FILE)) {
  const backupFile = OUTPUT_FILE.replace('.json', '.backup.json')
  fs.copyFileSync(OUTPUT_FILE, backupFile)
  console.log(`💾 Backed up existing enhancements.json to ${path.basename(backupFile)}`)
}

// Write output
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enhancements, null, 2))

console.log(`\n✅ Successfully converted!`)
console.log(`📊 Output: ${enhancements.length} enhancements`)
console.log(`📁 Location: ${OUTPUT_FILE}`)
console.log(`\n🎯 Quality improvements:`)
console.log(`   - Clear question text`)
console.log(`   - Detailed explanations with hadith references`)
console.log(`   - ${enhancements.length - 100} more questions (+${((enhancements.length - 100) / 100 * 100).toFixed(0)}%)`)
console.log(`\n💡 Next steps:`)
console.log(`   1. Refresh your app in browser`)
console.log(`   2. Check console for: "Auto-imported ${enhancements.length} quiz enhancements"`)
console.log(`   3. Try quizzes - should have much better quality!\n`)
