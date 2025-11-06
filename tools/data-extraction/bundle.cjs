#!/usr/bin/env node
/**
 * bundle.cjs (CommonJS version)
 * Bundle and optimize transformed data for app deployment
 *
 * Usage:
 *   node bundle.cjs --input transformed/ --output ../../public/data/
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    input: 'transformed',
    output: '../../public/data',
    minify: true
  }

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '')
    const value = args[i + 1]
    if (key === 'minify') {
      options[key] = value === 'true'
    } else {
      options[key] = value
    }
  }

  return options
}

// Calculate SHA256 checksum
function calculateChecksum(data) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

// Validate data integrity
function validateData(categories, questions, answers) {
  const errors = []

  // Check categories
  if (!Array.isArray(categories) || categories.length === 0) {
    errors.push('Categories array is empty or invalid')
  }

  // Check questions
  if (!Array.isArray(questions) || questions.length === 0) {
    errors.push('Questions array is empty or invalid')
  }

  // Check answers
  if (!Array.isArray(answers) || answers.length === 0) {
    errors.push('Answers array is empty or invalid')
  }

  // Check question-answer alignment
  if (questions.length !== answers.length) {
    errors.push(`Question count (${questions.length}) doesn't match answer count (${answers.length})`)
  }

  // Validate category structure
  const categoryFields = ['id', 'element', 'category_links', 'category_url', 'parent', 'status']
  const sampleCat = categories[0]
  categoryFields.forEach(field => {
    if (!(field in sampleCat)) {
      errors.push(`Category missing required field: ${field}`)
    }
  })

  // Validate question structure
  const questionFields = ['id', 'category_id', 'question', 'question_full', 'question_url', 'question_no', 'status']
  const sampleQ = questions[0]
  questionFields.forEach(field => {
    if (!(field in sampleQ)) {
      errors.push(`Question missing required field: ${field}`)
    }
  })

  // Validate answer structure
  const answerFields = ['id', 'question_id', 'answers']
  const sampleA = answers[0]
  answerFields.forEach(field => {
    if (!(field in sampleA)) {
      errors.push(`Answer missing required field: ${field}`)
    }
  })

  return errors
}

// Main bundling function
async function bundle(inputDir, outputDir, options = {}) {
  console.log('📦 IslamQA Data Bundling')
  console.log('========================')
  console.log(`Input:  ${inputDir}`)
  console.log(`Output: ${outputDir}`)
  console.log(`Minify: ${options.minify !== false}`)

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
    console.log(`✅ Created output directory: ${outputDir}`)
  }

  try {
    // Load transformed files
    console.log('\n📥 Loading transformed files...')

    const categoriesPath = path.join(inputDir, 'categories.json')
    const questionsPath = path.join(inputDir, 'questions.json')
    const answersPath = path.join(inputDir, 'answers.json')

    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'))
    const answers = JSON.parse(fs.readFileSync(answersPath, 'utf-8'))

    console.log(`✅ Loaded ${categories.length} categories`)
    console.log(`✅ Loaded ${questions.length} questions`)
    console.log(`✅ Loaded ${answers.length} answers`)

    // Validate data
    console.log('\n🔍 Validating data integrity...')
    const validationErrors = validateData(categories, questions, answers)
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:')
      validationErrors.forEach(err => console.error(`  - ${err}`))
      return false
    }
    console.log('✅ Data validation passed')

    // Prepare for bundling
    console.log('\n📦 Bundling files...')

    const indent = options.minify === false ? 2 : 0
    const space = options.minify === false ? '\n' : ''

    // Bundle categories
    const categoriesJson = JSON.stringify(categories, null, indent)
    const categoriesOut = path.join(outputDir, 'categories.json')
    fs.writeFileSync(categoriesOut, categoriesJson, 'utf-8')
    const catChecksum = calculateChecksum(categoriesJson)
    console.log(`✅ Bundled categories.json`)

    // Bundle questions
    const questionsJson = JSON.stringify(questions, null, indent)
    const questionsOut = path.join(outputDir, 'questions.json')
    fs.writeFileSync(questionsOut, questionsJson, 'utf-8')
    const qChecksum = calculateChecksum(questionsJson)
    console.log(`✅ Bundled questions.json`)

    // Bundle answers
    const answersJson = JSON.stringify(answers, null, indent)
    const answersOut = path.join(outputDir, 'answers.json')
    fs.writeFileSync(answersOut, answersJson, 'utf-8')
    const aChecksum = calculateChecksum(answersJson)
    console.log(`✅ Bundled answers.json`)

    // Generate manifest
    const manifest = {
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      counts: {
        categories: categories.length,
        questions: questions.length,
        answers: answers.length
      },
      checksums: {
        categories: catChecksum,
        questions: qChecksum,
        answers: aChecksum
      },
      files: [
        'categories.json',
        'questions.json',
        'answers.json'
      ]
    }

    const manifestOut = path.join(outputDir, 'manifest.json')
    fs.writeFileSync(manifestOut, JSON.stringify(manifest, null, 2), 'utf-8')
    console.log(`✅ Generated manifest.json`)

    // Calculate final sizes
    console.log('\n📊 Bundle Stats:')
    console.log('================')
    console.log(`Categories: ${categories.length}`)
    console.log(`Questions:  ${questions.length}`)
    console.log(`Answers:    ${answers.length}`)

    const catSize = (fs.statSync(categoriesOut).size / 1024 / 1024).toFixed(2)
    const qSize = (fs.statSync(questionsOut).size / 1024 / 1024).toFixed(2)
    const aSize = (fs.statSync(answersOut).size / 1024 / 1024).toFixed(2)
    const mSize = (fs.statSync(manifestOut).size / 1024).toFixed(2)
    const total = (parseFloat(catSize) + parseFloat(qSize) + parseFloat(aSize)).toFixed(2)

    console.log('\n📦 Bundle Sizes:')
    console.log(`categories.json: ${catSize} MB`)
    console.log(`questions.json:  ${qSize} MB`)
    console.log(`answers.json:    ${aSize} MB`)
    console.log(`manifest.json:   ${mSize} KB`)
    console.log(`Total:           ${total} MB`)

    console.log('\n📂 Output Location:')
    console.log(path.resolve(outputDir))

    console.log('\n✨ Bundling complete!')
    console.log('\n🚀 Next Steps:')
    console.log('  1. Verify data in public/data/')
    console.log('  2. Test import in app (ImportView)')
    console.log('  3. Commit to git or deploy')

    return true

  } catch (error) {
    console.error('\n❌ Error during bundling:', error.message)
    console.error(error.stack)
    return false
  }
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs()
  bundle(options.input, options.output, options)
    .then(success => process.exit(success ? 0 : 1))
}

module.exports = { bundle }
