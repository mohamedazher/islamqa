#!/usr/bin/env node
/**
 * verify-format.cjs
 * Verify that transformation output matches app's expected format
 */

const fs = require('fs')
const path = require('path')

// Expected structure for each data type
const EXPECTED_SCHEMAS = {
  category: {
    required: ['id', 'element', 'category_links', 'category_url', 'parent', 'status'],
    types: {
      id: 'string',
      element: 'string',
      category_links: 'string',
      category_url: 'string',
      parent: 'string',
      status: 'string'
    }
  },
  question: {
    required: ['id', 'category_id', 'question', 'question_full', 'question_url', 'question_no', 'status'],
    types: {
      id: 'string',
      category_id: 'string',
      question: 'string',
      question_full: 'string',
      question_url: 'string',
      question_no: 'string',
      status: 'string'
    }
  },
  answer: {
    required: ['id', 'question_id', 'answers'],
    types: {
      id: 'string',
      question_id: 'string',
      answers: 'string'
    }
  }
}

function validateItem(item, schema, itemType, index) {
  const errors = []

  // Check required fields
  for (const field of schema.required) {
    if (!(field in item)) {
      errors.push(`${itemType}[${index}] missing required field: ${field}`)
    }
  }

  // Check field types
  for (const [field, expectedType] of Object.entries(schema.types)) {
    if (field in item && typeof item[field] !== expectedType) {
      errors.push(`${itemType}[${index}].${field} has wrong type: expected ${expectedType}, got ${typeof item[field]}`)
    }
  }

  return errors
}

function verifyFile(filePath, dataType) {
  console.log(`\n📋 Verifying ${path.basename(filePath)}...`)

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    return { valid: false, errors: [`File not found: ${filePath}`] }
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    if (!Array.isArray(data)) {
      console.error(`❌ Data is not an array`)
      return { valid: false, errors: ['Data is not an array'] }
    }

    console.log(`   Found ${data.length} items`)

    const schema = EXPECTED_SCHEMAS[dataType]
    const allErrors = []

    // Validate first 10 items (representative sample)
    const samplesToCheck = Math.min(10, data.length)
    for (let i = 0; i < samplesToCheck; i++) {
      const errors = validateItem(data[i], schema, dataType, i)
      allErrors.push(...errors)
    }

    if (allErrors.length === 0) {
      console.log(`   ✅ Format is correct`)
      console.log(`   ✅ All required fields present`)
      console.log(`   ✅ All field types correct`)

      // Show sample
      if (data.length > 0) {
        console.log(`\n   📄 Sample ${dataType}:`)
        console.log(`   ${JSON.stringify(data[0], null, 2).split('\n').join('\n   ')}`)
      }

      return { valid: true, errors: [], count: data.length }
    } else {
      console.error(`   ❌ Found ${allErrors.length} errors:`)
      allErrors.slice(0, 5).forEach(err => console.error(`      - ${err}`))
      if (allErrors.length > 5) {
        console.error(`      ... and ${allErrors.length - 5} more errors`)
      }
      return { valid: false, errors: allErrors }
    }

  } catch (error) {
    console.error(`   ❌ Error reading/parsing file: ${error.message}`)
    return { valid: false, errors: [error.message] }
  }
}

function main() {
  const args = process.argv.slice(2)
  const dataDir = args[0] || '../../public/data'

  console.log('🔍 Format Verification Tool')
  console.log('===========================')
  console.log(`Data directory: ${dataDir}`)

  const results = {
    categories: verifyFile(path.join(dataDir, 'categories.js'), 'category'),
    questions: verifyFile(path.join(dataDir, 'questions1.js'), 'question'),
    answers: verifyFile(path.join(dataDir, 'answers1.js'), 'answer')
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Verification Summary')
  console.log('='.repeat(50))

  let allValid = true
  for (const [name, result] of Object.entries(results)) {
    const status = result.valid ? '✅' : '❌'
    const count = result.count !== undefined ? ` (${result.count} items)` : ''
    console.log(`${status} ${name}${count}`)
    if (!result.valid) allValid = false
  }

  console.log('\n' + '='.repeat(50))
  if (allValid) {
    console.log('✅ All formats are correct!')
    console.log('\nYour transformation script will produce the exact format your app expects.')
    return 0
  } else {
    console.log('❌ Some formats have issues')
    console.log('\nPlease fix the transformation script to match the expected format.')
    return 1
  }
}

if (require.main === module) {
  process.exit(main())
}

module.exports = { verifyFile, validateItem }
