#!/usr/bin/env node

/**
 * Validate the generated Hisn al-Muslim dataset without changing content.
 * Missing citations/identifiers and low harakat are review warnings because
 * inventing religious-source data would be worse than preserving a known gap.
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const DUA_DIR = path.join(__dirname, '../public/data/dua')
const EXPECTED_CATEGORY_COUNT = 133
const EXPECTED_DUA_COUNT = 258

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(DUA_DIR, name), 'utf8'))
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function validate() {
  const categories = readJson('categories.json')
  const byCategory = readJson('duas.json')
  const manifest = readJson('manifest.json')
  const migration = readJson('id-migrations.json')
  const duas = Object.values(byCategory).flat()
  const errors = []
  const warnings = []
  const ids = new Set()

  if (categories.length !== EXPECTED_CATEGORY_COUNT) errors.push(`category count ${categories.length}`)
  if (duas.length !== EXPECTED_DUA_COUNT) errors.push(`dua count ${duas.length}`)
  if (Object.keys(byCategory).length !== categories.length) errors.push('category parity')
  if (manifest.category_count !== categories.length || manifest.dua_count !== duas.length) {
    errors.push('manifest count parity')
  }
  if (manifest.dataset_version !== migration.dataset_version) errors.push('manifest/migration version parity')
  const referencePath = path.join(__dirname, '..', manifest.checked_reference || '')
  if (!fs.existsSync(referencePath) || sha256(fs.readFileSync(referencePath)) !== manifest.checked_reference_sha256) {
    errors.push('checked reference checksum')
  }
  if (sha256(JSON.stringify(byCategory)) !== manifest.generated_duas_sha256) errors.push('generated dataset checksum')

  for (const category of categories) {
    const categoryDuas = byCategory[category.id]
    if (!categoryDuas) errors.push(`${category.id}: missing generated array`)
    else if (categoryDuas.length !== category.dua_count) errors.push(`${category.id}: dua_count mismatch`)
  }

  for (const dua of duas) {
    if (!dua.id) errors.push('dua without runtime ID')
    else if (ids.has(dua.id)) errors.push(`${dua.id}: duplicate runtime ID`)
    ids.add(dua.id)
    if (!dua.source_collection || !dua.source_chapter || !dua.source_file) errors.push(`${dua.id}: provenance`)
    if (dua.arabic.includes('\uFFFD')) errors.push(`${dua.id}: replacement character`)
    if (dua.arabic !== dua.arabic.normalize('NFC')) errors.push(`${dua.id}: non-NFC Arabic`)
    if (!dua.source_identifier) warnings.push(`${dua.id}: missing source identifier`)
    if (!dua.reference) warnings.push(`${dua.id}: missing bibliographic reference`)
    if (dua.arabic_quality?.low_harakat) warnings.push(`${dua.id}: low harakat`)
  }

  const chapterFiles = fs.readdirSync(DUA_DIR).filter(name => /^chapter_.*\.json$/.test(name))
  for (const file of chapterFiles) {
    const content = fs.readFileSync(path.join(DUA_DIR, file), 'utf8')
    if (content.includes('\uFFFD')) errors.push(`${file}: replacement character in chapter source`)
  }

  if (errors.length) {
    console.error(`Dua validation failed:\n- ${errors.join('\n- ')}`)
    process.exitCode = 1
    return { errors, warnings }
  }

  console.log(`Dua validation passed: ${categories.length} categories, ${duas.length} duas, ${warnings.length} review warnings`)
  return { errors, warnings }
}

if (require.main === module) validate()

module.exports = { validate }
