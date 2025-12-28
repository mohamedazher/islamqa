#!/usr/bin/env node
/**
 * Build Dua Data
 * Generates categories.json and duas.json from individual chapter files
 * Run: node scripts/build-dua-data.js
 */

const fs = require('fs')
const path = require('path')

const DUA_DIR = path.join(__dirname, '../public/data/dua')

// Icon and color mappings based on category keywords
const CATEGORY_THEMES = [
  // Sleep & Night
  { keywords: ['sleep', 'night', 'bed', 'lying', 'dream', 'nightmare', 'tossing', 'turning', 'apprehensive'], icon: 'moon', color: 'from-indigo-500 via-purple-500 to-indigo-600' },
  // Morning & Waking
  { keywords: ['waking', 'morning', 'rising', 'dawn'], icon: 'sun', color: 'from-amber-400 via-orange-400 to-yellow-500' },
  // Evening
  { keywords: ['evening'], icon: 'sunset', color: 'from-orange-500 via-rose-500 to-purple-500' },
  // Prayer & Salah
  { keywords: ['prayer', 'salah', 'prostrat', 'bowing', 'ruku', 'sujud', 'tashahhud', 'salam', 'witr', 'qunoot', 'takbir'], icon: 'mosque', color: 'from-teal-500 via-emerald-500 to-green-500' },
  // Mosque
  { keywords: ['mosque', 'masjid'], icon: 'mosque', color: 'from-emerald-500 via-teal-500 to-cyan-500' },
  // Ablution & Wudu
  { keywords: ['ablution', 'wudu', 'bathroom', 'lavatory'], icon: 'droplet', color: 'from-cyan-400 via-blue-400 to-sky-500' },
  // Food & Eating
  { keywords: ['eating', 'food', 'meal', 'drink', 'fast', 'iftar', 'breaking fast'], icon: 'utensils', color: 'from-lime-500 via-green-500 to-emerald-500' },
  // Travel
  { keywords: ['travel', 'journey', 'transport', 'mount', 'animal', 'vehicle', 'town', 'village', 'market'], icon: 'plane', color: 'from-sky-500 via-blue-500 to-indigo-500' },
  // Death & Funeral
  { keywords: ['death', 'deceased', 'funeral', 'grave', 'bury', 'condolence', 'calamity'], icon: 'heart', color: 'from-slate-500 via-gray-500 to-zinc-500' },
  // Protection & Safety
  { keywords: ['protect', 'refuge', 'shield', 'safe', 'evil', 'devil', 'shirk', 'fear', 'afraid', 'enemy', 'ruler'], icon: 'shield', color: 'from-violet-500 via-purple-500 to-fuchsia-500' },
  // Clothes & Garments
  { keywords: ['garment', 'cloth', 'wear', 'dress', 'undress', 'new garment'], icon: 'shirt', color: 'from-pink-400 via-rose-400 to-red-400' },
  // Weather & Nature
  { keywords: ['rain', 'thunder', 'wind', 'storm', 'weather', 'sky', 'clear'], icon: 'cloud', color: 'from-blue-400 via-cyan-400 to-teal-400' },
  // Health & Sickness
  { keywords: ['sick', 'ill', 'health', 'pain', 'afflict', 'visit'], icon: 'heartPulse', color: 'from-red-400 via-rose-400 to-pink-400' },
  // Children & Family
  { keywords: ['child', 'birth', 'baby', 'newborn', 'family'], icon: 'users', color: 'from-rose-400 via-pink-400 to-fuchsia-400' },
  // Marriage & Wedding
  { keywords: ['marriage', 'wedding', 'newlywed', 'spouse'], icon: 'heart', color: 'from-pink-500 via-rose-500 to-red-500' },
  // Remembrance & Dhikr
  { keywords: ['dhikr', 'remembrance', 'praise', 'glorif', 'tasbih', 'istighfar', 'forgive'], icon: 'sparkles', color: 'from-amber-500 via-yellow-500 to-orange-400' },
  // Guidance & Istikhara
  { keywords: ['guidance', 'istikhara', 'decision', 'seeking'], icon: 'compass', color: 'from-blue-500 via-indigo-500 to-violet-500' },
  // Distress & Anxiety
  { keywords: ['distress', 'anxiety', 'sorrow', 'difficult', 'debt', 'worry', 'trouble'], icon: 'leaf', color: 'from-green-400 via-emerald-400 to-teal-400' },
  // Home
  { keywords: ['home', 'house', 'enter', 'leave', 'door'], icon: 'home', color: 'from-amber-500 via-orange-500 to-red-400' },
  // Hajj & Umrah
  { keywords: ['hajj', 'umrah', 'tawaf', 'safa', 'marwa', 'arafat', 'muzdalifa', 'jamarat', 'kaaba'], icon: 'kaaba', color: 'from-stone-500 via-amber-600 to-yellow-500' },
  // Moon & Occasions
  { keywords: ['moon', 'crescent', 'ramadan', 'eid'], icon: 'moon', color: 'from-emerald-400 via-teal-400 to-cyan-400' },
  // Gratitude & Blessings
  { keywords: ['gratitude', 'thank', 'blessing', 'favour', 'pleasant', 'pleasing', 'amazement', 'delights'], icon: 'star', color: 'from-yellow-400 via-amber-400 to-orange-400' },
  // Social & Gatherings
  { keywords: ['gathering', 'sitting', 'meeting', 'greeting', 'praise', 'praised', 'sneez'], icon: 'users', color: 'from-blue-400 via-indigo-400 to-purple-400' },
  // Quran
  { keywords: ['quran', 'ayat', 'kursi', 'recit', 'qul', 'surah'], icon: 'book', color: 'from-emerald-600 via-green-500 to-teal-500' },
  // Prophet & Salawat
  { keywords: ['prophet', 'salawat', 'muhammad', 'prayers upon'], icon: 'star', color: 'from-emerald-500 via-green-500 to-lime-500' },
  // Sin & Repentance
  { keywords: ['sin', 'repent', 'expiation', 'committing'], icon: 'refresh', color: 'from-slate-400 via-gray-400 to-zinc-400' },
  // Doubt & Whisperings
  { keywords: ['doubt', 'whisper', 'faith'], icon: 'shield', color: 'from-indigo-400 via-blue-400 to-cyan-400' },
  // Sacrifice & Slaughter
  { keywords: ['slaughter', 'sacrifice', 'animal'], icon: 'gift', color: 'from-red-500 via-rose-500 to-pink-500' },
]

// Get icon and color for a category based on its title
function getCategoryTheme(title) {
  const lowerTitle = title.toLowerCase()

  for (const theme of CATEGORY_THEMES) {
    if (theme.keywords.some(keyword => lowerTitle.includes(keyword))) {
      return { icon: theme.icon, color: theme.color }
    }
  }

  // Default theme
  return { icon: 'book', color: 'from-teal-500 via-cyan-500 to-blue-500' }
}

function buildDuaData() {
  console.log('📚 Building dua data from chapter files...\n')

  // Find all chapter files
  const files = fs.readdirSync(DUA_DIR)
    .filter(f => f.startsWith('chapter_') && f.endsWith('.json'))
    .sort((a, b) => {
      // Sort by chapter number
      const numA = parseInt(a.match(/chapter_(\d+)/)?.[1] || '0')
      const numB = parseInt(b.match(/chapter_(\d+)/)?.[1] || '0')
      return numA - numB
    })

  console.log(`Found ${files.length} chapter files\n`)

  const categories = []
  const duasByCategory = {}
  let totalDuas = 0

  for (const file of files) {
    const filePath = path.join(DUA_DIR, file)
    const content = fs.readFileSync(filePath, 'utf8')

    let duas
    try {
      duas = JSON.parse(content)
    } catch (e) {
      console.error(`❌ Failed to parse ${file}: ${e.message}`)
      continue
    }

    // Ensure it's an array
    if (!Array.isArray(duas)) {
      if (duas.duas && Array.isArray(duas.duas)) {
        duas = duas.duas
      } else {
        console.warn(`⚠️ Skipping ${file} - not an array`)
        continue
      }
    }

    if (duas.length === 0) {
      console.warn(`⚠️ Skipping ${file} - empty array`)
      continue
    }

    // Extract chapter number from filename
    const chapterMatch = file.match(/chapter_(\d+)_(.+)\.json/)
    if (!chapterMatch) {
      console.warn(`⚠️ Skipping ${file} - unexpected filename format`)
      continue
    }

    const chapterNum = parseInt(chapterMatch[1])
    const chapterSlug = chapterMatch[2]

    // Get category info from first dua
    const firstDua = duas[0]
    const categoryId = `chapter_${chapterNum}`
    const categoryName = firstDua.category_name || chapterSlug.replace(/_/g, ' ')

    // Get theme (icon and color) based on category name
    const theme = getCategoryTheme(categoryName)

    // Create category entry
    categories.push({
      id: categoryId,
      numeric_id: chapterNum,
      title: categoryName,
      title_ar: '', // Can be filled later
      description: `Hisn al-Muslim Chapter ${chapterNum}`,
      icon: theme.icon,
      color: theme.color,
      dua_count: duas.length,
      order: chapterNum,
      tab: chapterNum <= 30 ? 'main' : 'other', // First 30 chapters in main tab
      parent_id: null,
      type: 'chapter'
    })

    // Update duas with consistent category_id and add unique global id
    const updatedDuas = duas.map((dua, idx) => ({
      ...dua,
      id: `${chapterNum}_${dua.id || idx + 1}`, // Unique global id
      category_id: categoryId,
      chapter_num: chapterNum
    }))

    duasByCategory[categoryId] = updatedDuas
    totalDuas += duas.length

    console.log(`  ✓ Chapter ${chapterNum}: ${categoryName} (${duas.length} duas)`)
  }

  console.log(`\n📊 Summary:`)
  console.log(`  - ${categories.length} categories`)
  console.log(`  - ${totalDuas} total duas`)

  // Write categories.json
  const categoriesPath = path.join(DUA_DIR, 'categories.json')
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2))
  console.log(`\n✅ Written ${categoriesPath}`)

  // Write duas.json
  const duasPath = path.join(DUA_DIR, 'duas.json')
  fs.writeFileSync(duasPath, JSON.stringify(duasByCategory, null, 2))
  console.log(`✅ Written ${duasPath}`)

  console.log('\n🎉 Build complete!')
}

buildDuaData()
