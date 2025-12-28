#!/usr/bin/env node
/**
 * Fix chapter JSON files to use consistent flat array format
 * Converts old nested {duas: [...]} format to flat array with standard fields
 */

const fs = require('fs')
const path = require('path')

const DUA_DIR = path.join(__dirname, '../public/data/dua')

// Standard field mapping from various formats
function normalizeDua(dua, chapterNum, categoryName, index) {
  return {
    id: dua.id || index + 1,
    hisn_number: dua.hisn_number || dua.hisn_al_muslim_number || dua.number || dua.hisn_reference?.match(/\d+/)?.[0] || null,
    category_id: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    category_name: categoryName,
    title: dua.title || `${categoryName} - Hisn al-Muslim ${dua.hisn_number || dua.hisn_al_muslim_number || chapterNum}`,
    arabic: dua.arabic || dua.dua_text_arabic || dua.dua_arabic || '',
    transliteration: dua.transliteration || dua.dua_text_transliteration || dua.dua_transliteration || '',
    translation: dua.translation || dua.dua_text_english || dua.dua_translation || '',
    reference: normalizeReference(dua.reference || dua.references),
    repetitions: dua.repetitions || null,
    order: index + 1,
    tags: dua.tags || [categoryName]
  }
}

// Normalize reference field (handle array of refs)
function normalizeReference(ref) {
  if (!ref) return ''
  if (typeof ref === 'string') return ref
  if (Array.isArray(ref)) {
    return ref.map(r => {
      if (typeof r === 'string') return r
      return [r.source, r.reference].filter(Boolean).join(' ')
    }).join(', ')
  }
  return ''
}

function fixChapterFile(filePath) {
  const fileName = path.basename(filePath)

  // Extract chapter number from filename
  const chapterMatch = fileName.match(/chapter_(\d+)_(.+)\.json/)
  if (!chapterMatch) {
    console.log(`  ⚠️ Skipping ${fileName} - unexpected filename format`)
    return false
  }

  const chapterNum = parseInt(chapterMatch[1])
  const slugName = chapterMatch[2].replace(/_/g, ' ')

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    // Already a flat array - skip
    if (Array.isArray(content)) {
      return false
    }

    // Extract duas from nested format
    let duas = content.duas || content.dua || []
    if (!Array.isArray(duas)) {
      console.log(`  ❌ ${fileName} - no duas array found`)
      return false
    }

    // Get category name from content or filename
    const categoryName = content.chapter_title || content.section_title || content.title ||
                         slugName.charAt(0).toUpperCase() + slugName.slice(1)

    // Normalize each dua
    const normalizedDuas = duas.map((dua, idx) => normalizeDua(dua, chapterNum, categoryName, idx))

    // Write back as flat array
    fs.writeFileSync(filePath, JSON.stringify(normalizedDuas, null, 2))
    console.log(`  ✓ Fixed ${fileName} (${normalizedDuas.length} duas)`)
    return true

  } catch (error) {
    console.error(`  ❌ Error fixing ${fileName}:`, error.message)
    return false
  }
}

function main() {
  console.log('🔧 Fixing chapter JSON files to flat array format...\n')

  const files = fs.readdirSync(DUA_DIR)
    .filter(f => f.startsWith('chapter_') && f.endsWith('.json'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/chapter_(\d+)/)?.[1] || '0')
      const numB = parseInt(b.match(/chapter_(\d+)/)?.[1] || '0')
      return numA - numB
    })

  let fixed = 0
  let skipped = 0

  for (const file of files) {
    const filePath = path.join(DUA_DIR, file)
    if (fixChapterFile(filePath)) {
      fixed++
    } else {
      skipped++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`  - ${fixed} files fixed`)
  console.log(`  - ${skipped} files already correct (or skipped)`)
  console.log('\n✅ Done! Now run: node scripts/build-dua-data.js')
}

main()
