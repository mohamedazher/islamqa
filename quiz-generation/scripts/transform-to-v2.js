#!/usr/bin/env node

/**
 * Transform Output Format Script - V2
 *
 * Converts generated quiz output from old format to V2 format
 * compatible with the semantic reference ID database
 *
 * Old format: generatedQuizzes with sourceQuestionId
 * New format: generatedEnhancements with reference
 *
 * Usage:
 *   node transform-to-v2.js batch-1762368648805-output.json
 *   node transform-to-v2.js batches/batch-1762368648805-output.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Transform old format to V2 format
 */
function transformFormat(oldFormat) {
  console.log('\n🔄 Transforming output format to V2...\n')

  const transformed = {
    generatedEnhancements: oldFormat.generatedQuizzes.map(quiz => {
      // Validate source question ID exists
      if (!quiz.sourceQuestionId) {
        console.warn(`⚠️  Missing sourceQuestionId in quiz, skipping`)
        return null
      }

      return {
        // CRITICAL: Use reference (semantic ID) as primary key
        reference: quiz.sourceQuestionId,

        // Question text for the quiz
        questionText: quiz.questionText,

        // Type must be multiple-choice
        type: quiz.type || 'multiple-choice',

        // Difficulty: easy/medium/hard
        difficulty: quiz.difficulty || 'medium',

        // Options: must have exactly 4 with a-d ids
        options: transformOptions(quiz.options),

        // Explanation: 2-3 sentences
        explanation: quiz.explanation || '',

        // Tags: 4-6 relevant tags
        tags: Array.isArray(quiz.tags) ? quiz.tags : [],

        // Source reference
        source: `IslamQA reference ${quiz.sourceQuestionId}`
      }
    }).filter(e => e !== null),

    // Metadata about the transformation
    metadata: {
      batchId: oldFormat.batchId || 'unknown',
      originalFormat: 'generatedQuizzes',
      transformedFormat: 'generatedEnhancements',
      processedCount: oldFormat.generatedQuizzes.length,
      transformedCount: oldFormat.generatedQuizzes.filter(q => q.sourceQuestionId).length,
      transformedDate: new Date().toISOString(),
      notes: 'Converted from old format to V2 semantic reference ID format'
    }
  }

  return transformed
}

/**
 * Ensure options have correct V2 format
 */
function transformOptions(options) {
  if (!Array.isArray(options)) {
    console.warn(`⚠️  Options is not an array, returning empty`)
    return []
  }

  // Map options to ensure they have the right format
  return options.map((opt, idx) => {
    const id = String.fromCharCode(97 + idx) // a, b, c, d
    return {
      id,
      text: opt.text || opt,
      isCorrect: opt.isCorrect === true
    }
  })
}

/**
 * Main function
 */
function main() {
  // Get input file from command line args
  const inputFile = process.argv[2]

  if (!inputFile) {
    console.error('❌ Usage: node transform-to-v2.js <input-file>')
    console.error('   Example: node transform-to-v2.js batch-1762368648805-output.json')
    process.exit(1)
  }

  // Resolve file path
  let inputPath = inputFile
  if (!path.isAbsolute(inputPath)) {
    inputPath = path.join(__dirname, '..', 'batches', inputFile)
  }

  // Check if file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`)
    process.exit(1)
  }

  try {
    // Read input file
    console.log(`📖 Reading input file: ${inputPath}`)
    const content = fs.readFileSync(inputPath, 'utf8')
    const oldFormat = JSON.parse(content)

    // Validate format
    if (!oldFormat.generatedQuizzes || !Array.isArray(oldFormat.generatedQuizzes)) {
      console.error('❌ Invalid input format: missing generatedQuizzes array')
      process.exit(1)
    }

    console.log(`📊 Input: ${oldFormat.generatedQuizzes.length} quizzes`)

    // Transform to V2 format
    const transformed = transformFormat(oldFormat)

    console.log(`✅ Transformed: ${transformed.generatedEnhancements.length} enhancements`)

    // Generate output file path
    const outputPath = inputPath.replace('-output.json', '-v2.json')
    console.log(`💾 Writing output file: ${outputPath}`)

    // Write transformed output
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2))

    // Print summary
    console.log(`\n✨ Transformation complete!`)
    console.log(`   Input:  ${inputPath}`)
    console.log(`   Output: ${outputPath}`)
    console.log(`   Status: ${transformed.generatedEnhancements.length}/${oldFormat.generatedQuizzes.length} enhanced`)
    console.log(`\n📝 Next steps:`)
    console.log(`   1. Validate: node generate-quiz-v2.js --mode=validate --input=${path.basename(outputPath)}`)
    console.log(`   2. Merge: node generate-quiz-v2.js --mode=merge --input=${path.basename(outputPath)}`)
    console.log(`\n`)

  } catch (error) {
    console.error('❌ Error during transformation:', error.message)
    process.exit(1)
  }
}

main()
