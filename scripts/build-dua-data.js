#!/usr/bin/env node
/**
 * Build Dua Data
 * Generates categories.json and duas.json from individual chapter files
 * Run: node scripts/build-dua-data.js
 */

const fs = require('fs')
const path = require('path')

const DUA_DIR = path.join(__dirname, '../public/data/dua')

// Emoji mappings based on category keywords (order matters - more specific first!)
const EMOJI_KEYWORDS = [
  // Location-specific (check before general "remembrance")
  { keywords: ['home', 'house'], emoji: '🏠' },
  { keywords: ['mosque', 'masjid'], emoji: '🕌' },
  { keywords: ['town', 'village', 'market'], emoji: '🏘️' },
  { keywords: ['grave', 'visiting the grave'], emoji: '🪦' },

  // Time-specific
  { keywords: ['waking', 'morning', 'rising', 'dawn'], emoji: '🌅' },
  { keywords: ['evening'], emoji: '🌆' },
  { keywords: ['sleep', 'night', 'bed', 'lying', 'dream', 'nightmare', 'tossing', 'turning', 'apprehensive'], emoji: '🌙' },

  // Prayer-specific
  { keywords: ['tashahhud'], emoji: '🙏' },
  { keywords: ['salam'], emoji: '✋' },
  { keywords: ['witr', 'qunoot'], emoji: '🤲' },
  { keywords: ['prayer', 'salah', 'prostrat', 'bowing', 'ruku', 'sujud', 'obligatory', 'takbir'], emoji: '🤲' },

  // Ablution
  { keywords: ['ablution', 'wudu', 'bathroom', 'lavatory'], emoji: '💧' },

  // Food & Fasting
  { keywords: ['eating', 'food', 'meal', 'drink'], emoji: '🍽️' },
  { keywords: ['fast', 'fasting', 'iftar', 'breaking fast'], emoji: '🌙' },

  // Travel
  { keywords: ['travel', 'journey', 'transport', 'traveller', 'resident'], emoji: '✈️' },
  { keywords: ['mount', 'stumbles'], emoji: '🐪' },

  // Death & Hardship
  { keywords: ['death', 'deceased', 'funeral', 'bury', 'closing eyes'], emoji: '🕊️' },
  { keywords: ['condolence', 'calamity', 'affliction'], emoji: '💔' },
  { keywords: ['sick', 'ill', 'health', 'pain', 'visit'], emoji: '🏥' },

  // Protection
  { keywords: ['protect', 'refuge', 'shield', 'safe'], emoji: '🛡️' },
  { keywords: ['evil', 'devil', 'ward off', 'expelling'], emoji: '⚔️' },
  { keywords: ['fear', 'afraid', 'enemy', 'ruler', 'injustice'], emoji: '😰' },

  // Clothing
  { keywords: ['garment', 'cloth', 'wear', 'dress', 'undress'], emoji: '👔' },

  // Weather
  { keywords: ['rain', 'rainfall'], emoji: '🌧️' },
  { keywords: ['thunder'], emoji: '⛈️' },

  // Family
  { keywords: ['child', 'birth', 'baby', 'newborn', 'children'], emoji: '👶' },
  { keywords: ['marriage', 'wedding', 'newlywed', 'spouse'], emoji: '💑' },

  // Forgiveness & Guidance
  { keywords: ['istighfar', 'forgive', 'forgiveness', 'repent', 'sin', 'expiation'], emoji: '🤲' },
  { keywords: ['guidance', 'istikhara', 'decision'], emoji: '🧭' },

  // Emotions
  { keywords: ['distress', 'anxiety', 'sorrow', 'difficult', 'worry', 'trouble'], emoji: '😢' },
  { keywords: ['pleasant', 'pleasing', 'amazement', 'delights', 'good news'], emoji: '😊' },
  { keywords: ['gratitude', 'thank', 'blessing', 'favour'], emoji: '🙏' },

  // Finances
  { keywords: ['debt', 'settling'], emoji: '💰' },
  { keywords: ['wealth', 'offered'], emoji: '🎁' },

  // Hajj
  { keywords: ['hajj', 'umrah', 'tawaf', 'kaaba', 'jamarat', 'muzdalifa'], emoji: '🕋' },

  // Moon
  { keywords: ['moon', 'crescent'], emoji: '🌙' },

  // Social
  { keywords: ['gathering', 'sitting', 'meeting'], emoji: '👥' },
  { keywords: ['greeting', 'disbeliever'], emoji: '👋' },
  { keywords: ['sneez'], emoji: '🤧' },
  { keywords: ['praised', 'praising', 'etiquette'], emoji: '👏' },

  // Islamic texts
  { keywords: ['quran', 'ayat', 'kursi', 'recit', 'qul', 'surah'], emoji: '📖' },
  { keywords: ['prophet', 'salawat', 'muhammad', 'prayers upon'], emoji: '💚' },

  // Other
  { keywords: ['doubt', 'whisper', 'faith'], emoji: '🤔' },
  { keywords: ['slaughter', 'sacrifice', 'animal'], emoji: '🐑' },
  { keywords: ['rooster', 'donkey', 'crow', 'braying'], emoji: '🐓' },
  { keywords: ['love', 'allah'], emoji: '❤️' },
  { keywords: ['omens', 'scorn'], emoji: '🚫' },

  // General - checked last
  { keywords: ['remembrance', 'dhikr'], emoji: '📿' },
  { keywords: ['seeking'], emoji: '🔍' },
]

// Beautiful gradient color palette - vibrant combinations (no gray/black)
const COLOR_PALETTE = [
  'from-rose-500 via-pink-500 to-fuchsia-500',
  'from-pink-500 via-fuchsia-500 to-purple-500',
  'from-fuchsia-500 via-purple-500 to-violet-500',
  'from-purple-500 via-violet-500 to-indigo-500',
  'from-violet-500 via-indigo-500 to-blue-500',
  'from-indigo-500 via-blue-500 to-cyan-500',
  'from-blue-500 via-cyan-500 to-teal-500',
  'from-cyan-500 via-teal-500 to-emerald-500',
  'from-teal-500 via-emerald-500 to-green-500',
  'from-emerald-500 via-green-500 to-lime-500',
  'from-green-500 via-lime-500 to-yellow-500',
  'from-lime-500 via-yellow-500 to-amber-500',
  'from-yellow-500 via-amber-500 to-orange-500',
  'from-amber-500 via-orange-500 to-red-500',
  'from-orange-500 via-red-500 to-rose-500',
  'from-red-500 via-rose-500 to-pink-500',
  'from-sky-400 via-blue-500 to-indigo-600',
  'from-emerald-400 via-teal-500 to-cyan-600',
  'from-amber-400 via-orange-500 to-red-600',
  'from-fuchsia-400 via-pink-500 to-rose-600',
  'from-violet-400 via-purple-500 to-fuchsia-600',
  'from-cyan-400 via-sky-500 to-blue-600',
  'from-lime-400 via-green-500 to-emerald-600',
  'from-rose-400 via-red-500 to-orange-600',
  'from-indigo-400 via-violet-500 to-purple-600',
  'from-teal-400 via-cyan-500 to-sky-600',
  'from-orange-400 via-amber-500 to-yellow-600',
  'from-pink-400 via-rose-500 to-red-600',
  'from-blue-400 via-indigo-500 to-violet-600',
  'from-green-400 via-emerald-500 to-teal-600',
  'from-red-400 via-orange-500 to-amber-600',
  'from-purple-400 via-fuchsia-500 to-pink-600',
  'from-sky-500 via-cyan-400 to-teal-500',
  'from-rose-600 via-pink-500 to-fuchsia-400',
  'from-amber-600 via-yellow-500 to-lime-400',
  'from-violet-600 via-indigo-500 to-blue-400',
  'from-emerald-600 via-green-500 to-lime-400',
  'from-fuchsia-600 via-purple-500 to-violet-400',
  'from-cyan-600 via-teal-500 to-emerald-400',
]

// Simple hash function to generate consistent index from string
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Get emoji based on keywords
function getEmojiForCategory(title) {
  const lowerTitle = title.toLowerCase()
  for (const mapping of EMOJI_KEYWORDS) {
    if (mapping.keywords.some(keyword => lowerTitle.includes(keyword))) {
      return mapping.emoji
    }
  }
  return '📿' // Default emoji (prayer beads)
}

// Get unique color based on category title hash
function getColorForCategory(title, chapterNum) {
  // Use both title and chapter number for better distribution
  const hash = hashString(title + chapterNum)
  const colorIndex = hash % COLOR_PALETTE.length
  return COLOR_PALETTE[colorIndex]
}

// Get emoji and color for a category
function getCategoryTheme(title, chapterNum) {
  return {
    icon: getEmojiForCategory(title),
    color: getColorForCategory(title, chapterNum)
  }
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

    // Get theme (icon and color) based on category name and chapter number
    const theme = getCategoryTheme(categoryName, chapterNum)

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
