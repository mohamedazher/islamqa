#!/usr/bin/env node
/**
 * transform.cjs (CommonJS version)
 * Transforms API format JSON to App format JSON
 *
 * Usage:
 *   node transform.cjs --input raw/ --output transformed/
 */

const fs = require('fs')
const path = require('path')

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    input: 'raw',
    output: 'transformed'
  }

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '')
    const value = args[i + 1]
    options[key] = value
  }

  return options
}

// Transform categories from API format to app format
function transformCategories(apiCategories) {
  console.log(`\n📚 Transforming ${apiCategories.length} categories...`)

  const transformed = apiCategories.map((cat, index) => {
    return {
      id: String(index + 1),
      element: String(cat.reference),
      category_links: cat.title,
      category_url: cat.url || `cat/${cat.reference}`,
      parent: cat.parent_reference !== null ? String(cat.parent_reference) : "0",
      status: "done"
    }
  })

  console.log(`✅ Transformed ${transformed.length} categories`)
  return transformed
}

// Strip HTML tags and get plain text
function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

// Transform questions and extract answers
function transformQuestionsAndAnswers(apiQuestions) {
  console.log(`\n❓ Transforming ${apiQuestions.length} questions...`)

  const questions = []
  const answers = []

  apiQuestions.forEach((q, index) => {
    const sequentialId = String(index + 1)

    // Create question
    const question = {
      id: sequentialId,
      category_id: String(q.category_reference || 0),
      question: stripHtml(q.title) || 'Untitled',
      question_full: q.question || '',
      question_url: `/en/${q.reference}`,
      question_no: String(q.reference),
      status: "done"
    }
    questions.push(question)

    // Create answer
    const answer = {
      id: sequentialId,
      question_id: sequentialId,
      answers: q.answer || ''
    }
    answers.push(answer)
  })

  console.log(`✅ Transformed ${questions.length} questions`)
  console.log(`✅ Extracted ${answers.length} answers`)

  return { questions, answers }
}

// Main transformation function
async function transform(inputDir, outputDir) {
  console.log('🔄 IslamQA Data Transformation')
  console.log('==============================')
  console.log(`Input:  ${inputDir}`)
  console.log(`Output: ${outputDir}`)

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  try {
    // Load input files
    console.log('\n📥 Loading input files...')

    const categoriesPath = path.join(inputDir, 'categories.json')
    const questionsPath = path.join(inputDir, 'questions.json')

    if (!fs.existsSync(categoriesPath)) {
      throw new Error(`Categories file not found: ${categoriesPath}`)
    }
    if (!fs.existsSync(questionsPath)) {
      throw new Error(`Questions file not found: ${questionsPath}`)
    }

    const apiCategories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))
    const apiQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'))

    console.log(`✅ Loaded ${apiCategories.length} categories`)
    console.log(`✅ Loaded ${apiQuestions.length} questions`)

    // Transform categories
    const transformedCategories = transformCategories(apiCategories)

    // Transform questions and extract answers
    const { questions, answers } = transformQuestionsAndAnswers(apiQuestions)

    // Save transformed data
    console.log('\n💾 Saving transformed data...')

    const categoriesOut = path.join(outputDir, 'categories.json')
    const questionsOut = path.join(outputDir, 'questions.json')
    const answersOut = path.join(outputDir, 'answers.json')

    fs.writeFileSync(
      categoriesOut,
      JSON.stringify(transformedCategories, null, 2),
      'utf-8'
    )
    console.log(`✅ Saved ${categoriesOut}`)

    fs.writeFileSync(
      questionsOut,
      JSON.stringify(questions, null, 2),
      'utf-8'
    )
    console.log(`✅ Saved ${questionsOut}`)

    fs.writeFileSync(
      answersOut,
      JSON.stringify(answers, null, 2),
      'utf-8'
    )
    console.log(`✅ Saved ${answersOut}`)

    // Generate stats
    console.log('\n📊 Transformation Stats:')
    console.log('========================')
    console.log(`Categories: ${transformedCategories.length}`)
    console.log(`Questions:  ${questions.length}`)
    console.log(`Answers:    ${answers.length}`)

    // Calculate file sizes
    const catSize = (fs.statSync(categoriesOut).size / 1024 / 1024).toFixed(2)
    const qSize = (fs.statSync(questionsOut).size / 1024 / 1024).toFixed(2)
    const aSize = (fs.statSync(answersOut).size / 1024 / 1024).toFixed(2)
    const total = (parseFloat(catSize) + parseFloat(qSize) + parseFloat(aSize)).toFixed(2)

    console.log('\n📦 File Sizes:')
    console.log(`categories.json: ${catSize} MB`)
    console.log(`questions.json:  ${qSize} MB`)
    console.log(`answers.json:    ${aSize} MB`)
    console.log(`Total:           ${total} MB`)

    console.log('\n✨ Transformation complete!')
    return true

  } catch (error) {
    console.error('\n❌ Error during transformation:', error.message)
    return false
  }
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs()
  transform(options.input, options.output)
    .then(success => process.exit(success ? 0 : 1))
}

module.exports = { transform }
