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
  { keywords: ['tashahhud'], emoji: '🤲' },
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
  { keywords: ['fear', 'afraid', 'enemy', 'ruler', 'injustice'], emoji: '🛡️' },

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
  { keywords: ['distress', 'anxiety', 'sorrow', 'difficult', 'worry', 'trouble'], emoji: '💭' },
  { keywords: ['pleasant', 'pleasing', 'amazement', 'delights', 'good news'], emoji: '✨' },
  { keywords: ['gratitude', 'thank', 'blessing', 'favour'], emoji: '✨' },

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
  { keywords: ['doubt', 'whisper', 'faith'], emoji: '💭' },
  { keywords: ['slaughter', 'sacrifice', 'animal'], emoji: '🐑' },
  { keywords: ['rooster', 'donkey', 'crow', 'braying'], emoji: '🐓' },
  { keywords: ['love', 'allah'], emoji: '❤️' },
  { keywords: ['omens', 'scorn'], emoji: '🚫' },

  // General - checked last
  { keywords: ['remembrance', 'dhikr'], emoji: '📿' },
  { keywords: ['seeking'], emoji: '🔍' },
]

// Get emoji based on keywords
// Tab assignments for 132 chapters
// Based on usage frequency and logical grouping
const TAB_ASSIGNMENTS = {
  // TAB 1: DAILY - Most frequently used, multiple times a day
  daily: [
    1,   // When waking up
    2, 3, 5, 6,  // Clothes (wearing, new garment, undressing)
    7, 8, 9,     // Bathroom/ablution
    10, 11,      // Home (leaving, entering)
    27,  // Morning and evening adhkar (MOST IMPORTANT!)
    29, 30, 31,  // Sleep-related (tossing, unrest, dreams)
    68, 69, 70, 71, // Eating/fasting (breaking fast, before eating, after meal, ayat kursi)
    73, 74, 75,  // More fasting related
    93,  // Upon rising in morning
    102, 103, 104, 105, // Sleep (laying down, before lying, before sleeping, waking up)
    108, // After eating
    111, 112, 115, // More sleep related
  ],

  // TAB 2: SALAH - Prayer related
  salah: [
    12, 13, 14,  // Mosque (going, entering, leaving)
    15, 16, 17, 18, 19, 20, // Prayer positions (salawat, opening, bowing, rising, prostrating, between)
    21, 22, 23, 24, 25, // More prayer (sajdah tilawah, tashahhud, salawat, after tashahhud, after salam)
    26, 28,  // Istikhara
    32, 33,  // Witr/Qunoot
    36,  // Bowing prayer
    52,  // Tashahhud
    66,  // After salam
    107, // Excellence of prayers upon prophet
    116, // Qunoot of witr
    118, 119, // After obligatory prayer, after witr
  ],

  // TAB 3: PROTECTION - Spiritual protection & emotional relief
  protection: [
    34, 35,  // Anxiety, distress
    37, 38, 39, // Fear of rulers, against enemies, afraid of group
    40, 42,  // Doubt in faith, whisperings in prayer
    43, 44, 45, 46, // Affairs difficult, committing sin, expelling devil, mishap
    48,  // Children protection
    53,  // Calamity affliction
    61,  // Children protection
    76,  // Three quls protection
    81, 82,  // Gratitude, seeking health refuge
    85, 86,  // Expiation, returning forgiveness supplication
    88,  // Seeking help/refuge in Allah
    92, 94, 96, // Fear of shirk, scorn of omens, seeking forgiveness
    124, 125, 126, // Distress, seeking refuge, encountering enemy
    128, 129, 130, 131, 132, // Ward off devils, fear of rulers, against enemies, afraid of group
  ],

  // TAB 4: SOCIAL - Interactions, travel, weather
  social: [
    4,   // To someone wearing new garment
    62, 63, 64, 65, 67, // Weather (thunder, rain, after rain, crescent moon)
    72,  // Intending to give food
    77, 78,  // Sneezing
    83, 84,  // Seeing someone in trial, gatherings
    87,  // To one who does favour
    89, 90,  // Love for Allah's sake, one who offered wealth
    95, 97, 98, 99, 100, 101, // Travel (mounting, town, market, stumbles, traveller duas)
    106, // Pleasing/displeasing news
    109, 110, // Greeting disbeliever, rooster/donkey
    113, 114, // Praising, when praised
    122, 123, // Amazement, pleasant news
  ],

  // TAB 5: LIFE EVENTS - Major milestones (marriage, birth, death, hajj)
  life: [
    41,  // Settling debt
    47,  // Birth congratulation
    49, 50, 51, // Visiting sick, sick renounced hope
    54, 55, 56, 57, 58, 59, 60, // Death/funeral (closing eyes, funeral prayer, child, condolence, grave)
    79, 80,  // Marriage (newlywed, wedding)
    91,  // Settling debt
    117, 120, 121, 127, // Hajj (tawaf, muzdalifa, jamarat, slaughter)
  ],
}

// Get tab for a chapter number
function getTabForChapter(chapterNum) {
  for (const [tab, chapters] of Object.entries(TAB_ASSIGNMENTS)) {
    if (chapters.includes(chapterNum)) {
      return tab
    }
  }
  return 'daily' // Default fallback
}

function getEmojiForCategory(title) {
  const lowerTitle = title.toLowerCase()
  for (const mapping of EMOJI_KEYWORDS) {
    if (mapping.keywords.some(keyword => lowerTitle.includes(keyword))) {
      return mapping.emoji
    }
  }
  return '📿' // Default emoji (prayer beads)
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

    // Get emoji icon based on category name
    const icon = getEmojiForCategory(categoryName)

    // Get tab assignment for this chapter
    const tab = getTabForChapter(chapterNum)

    // Create category entry (colors computed in component based on numeric_id)
    categories.push({
      id: categoryId,
      numeric_id: chapterNum,
      title: categoryName,
      title_ar: '', // Can be filled later
      description: `Hisn al-Muslim Chapter ${chapterNum}`,
      icon: icon,
      dua_count: duas.length,
      order: chapterNum,
      tab: tab,
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
