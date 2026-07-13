#!/usr/bin/env node
/**
 * Build Dua Data
 * Generates categories.json and duas.json from individual chapter files
 * Run: node scripts/build-dua-data.js
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const DUA_DIR = path.join(__dirname, '../public/data/dua')
const HISN_REFERENCE_PATH = path.join(__dirname, '../docs/reference/hisn_al_muslim.txt')
const DATASET_VERSION = 12
const EXPECTED_CATEGORY_COUNT = 133
const EXPECTED_DUA_COUNT = 258
const ARABIC_MARKS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g

function nfc(value) {
  return typeof value === 'string' ? value.normalize('NFC') : value
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function normalizeArabicForSearch(value) {
  return nfc(value || '')
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '')
    .normalize('NFC')
}

function arabicSkeleton(value) {
  return normalizeArabicForSearch(value)
    .replace(/[\s\p{P}\p{S}\u0640]/gu, '')
}

function loadReferenceIndex() {
  const content = fs.readFileSync(HISN_REFERENCE_PATH, 'utf8').normalize('NFC')
  const index = new Map()
  const blocks = content.matchAll(/Hisn al-Muslim\s+([0-9]+[a-z]?)([\s\S]*?)(?=Report Error \| Share \| Copy)/gi)
  for (const match of blocks) {
    const identifier = match[1]
    const arabicLines = match[2].split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => /[\u0600-\u06FF]/.test(line) && !line.includes('\uFFFD'))
    for (const line of arabicLines) {
      const skeleton = arabicSkeleton(line)
      if (skeleton.length < 3) continue
      if (!index.has(skeleton)) index.set(skeleton, new Set())
      index.get(skeleton).add(identifier)
    }
  }
  return index
}

function canonicalSourceIdentifier(dua) {
  const raw = dua.hisn_number ?? dua.hisn_al_muslim_number ?? null
  if (raw === null || raw === undefined || raw === '') return null
  return String(raw).replace(/^hisn_/i, '').replace(/^\((.+)\)$/, '$1')
}

function arabicQuality(arabic) {
  const letters = (arabic.match(/[\u0621-\u064A\u066E-\u06D3]/g) || []).length
  const marks = (arabic.match(ARABIC_MARKS) || []).length
  const coverage = letters === 0 ? 0 : Number((marks / letters).toFixed(3))
  return {
    harakat_count: marks,
    harakat_coverage: coverage,
    missing_harakat: letters > 0 && marks === 0,
    low_harakat: letters > 0 && coverage < 0.15
  }
}

function validateBuiltData(categories, duasByCategory) {
  const errors = []
  const warnings = []
  const allDuas = Object.values(duasByCategory).flat()
  const ids = new Set()

  if (categories.length !== EXPECTED_CATEGORY_COUNT) {
    errors.push(`Expected ${EXPECTED_CATEGORY_COUNT} categories, found ${categories.length}`)
  }
  if (allDuas.length !== EXPECTED_DUA_COUNT) {
    errors.push(`Expected ${EXPECTED_DUA_COUNT} duas, found ${allDuas.length}`)
  }
  if (Object.keys(duasByCategory).length !== categories.length) {
    errors.push('Category/dua-file parity failed')
  }

  for (const category of categories) {
    const duas = duasByCategory[category.id]
    if (!duas) errors.push(`Missing dua array for ${category.id}`)
    else if (duas.length !== category.dua_count) {
      errors.push(`Count mismatch for ${category.id}: category=${category.dua_count}, actual=${duas.length}`)
    }
  }

  for (const dua of allDuas) {
    if (ids.has(dua.id)) errors.push(`Duplicate runtime dua id: ${dua.id}`)
    ids.add(dua.id)
    if (!dua.source_collection || !dua.source_chapter || !dua.source_file) {
      errors.push(`Missing provenance for ${dua.id}`)
    }
    if (dua.arabic.includes('\uFFFD')) errors.push(`Replacement character in Arabic for ${dua.id}`)
    if (dua.arabic !== dua.arabic.normalize('NFC')) errors.push(`Arabic is not NFC for ${dua.id}`)
    if (!dua.source_identifier) warnings.push(`${dua.id}: missing Hisn source identifier`)
    if (!dua.reference) warnings.push(`${dua.id}: missing bibliographic reference`)
    if (dua.arabic_quality.low_harakat) warnings.push(`${dua.id}: Arabic has low harakat coverage`)
  }

  if (errors.length) throw new Error(`Dua data validation failed:\n- ${errors.join('\n- ')}`)
  return { warnings, totalDuas: allDuas.length }
}

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
// The ORDER in each array determines display order (logical daily flow)
const TAB_ASSIGNMENTS = {
  // TAB 1: DAILY - Ordered by time of day flow
  daily: [
    // === WAKING UP ===
    1,   // When waking up
    93,  // Upon rising in morning
    105, // Upon waking up from sleep

    // === MORNING ADHKAR ===
    '27_morning',  // Morning Adhkar (special handling for split chapter)

    // === BATHROOM & ABLUTION ===
    7,   // After leaving the bathroom
    8,   // Before ablution
    9,   // Upon completing ablution

    // === GETTING DRESSED ===
    2,   // When wearing a garment
    3,   // When wearing a new garment

    // === LEAVING HOME ===
    10,  // Remembrance when leaving home

    // === DURING THE DAY - EATING ===
    69,  // Before eating
    70,  // Upon completing the meal
    71,  // Ayat al-Kursi
    108, // After eating

    // === FASTING ===
    68,  // Upon breaking fast
    73,  // When breaking fast in someone's home
    74,  // By one fasting when presented with food
    75,  // When insulted while fasting

    // === RETURNING HOME ===
    11,  // Remembrance upon entering home

    // === UNDRESSING ===
    5,   // Before undressing
    6,   // Before undressing (alt)

    // === EVENING ADHKAR ===
    '27_evening',  // Evening Adhkar (special handling for split chapter)

    // === BEFORE SLEEP ===
    102, // When laying down to sleep
    103, // Before lying down to sleep
    104, // Before sleeping
    111, // Before sleeping (alt)
    115, // Apprehensiveness sleep

    // === DURING SLEEP ===
    29,  // When tossing and turning
    30,  // Upon experiencing unrest during sleep
    31,  // Upon seeing good/bad dream
    112, // When tossing and turning (alt)
  ],

  // TAB 2: SALAH - Prayer related (ordered by prayer sequence)
  salah: [
    // === GOING TO MOSQUE ===
    12,  // When going to the mosque
    13,  // Upon entering the mosque

    // === BEFORE PRAYER ===
    26,  // Istikhara - seeking guidance
    28,  // Istikhara (alt)

    // === DURING PRAYER (in sequence) ===
    16,  // At the start of the prayer (after takbeer)
    17,  // While bowing in prayer
    36,  // Bowing prayer (alt)
    18,  // Upon rising from bowing position
    19,  // While prostrating
    20,  // Between the two prostrations
    21,  // When prostrating due to Quran recitation
    22,  // The Tashahhud
    52,  // Tashahhud (alt)
    15,  // Prayers upon Prophet after tashahhud
    23,  // Prayers upon Prophet after tashahhud (alt)
    24,  // After the last tashahhud and before salam

    // === AFTER PRAYER ===
    25,  // After salam
    66,  // After salam (alt)
    118, // After obligatory prayer

    // === WITR PRAYER ===
    32,  // Qunoot Al-Witr
    116, // Qunoot of witr (alt)
    33,  // Immediately after salam of witr
    119, // After witr (alt)

    // === LEAVING MOSQUE ===
    14,  // Upon leaving the mosque

    // === SALAWAT ===
    107, // Excellence of prayers upon Prophet
  ],

  // TAB 3: PROTECTION - Spiritual protection & emotional relief
  protection: [
    // === QURANIC PROTECTION ===
    76,  // Three Quls (Al-Ikhlas, Al-Falaq, An-Nas)

    // === GENERAL PROTECTION ===
    88,  // Seeking help/refuge in Allah
    125, // Seeking refuge in Allah

    // === AGAINST EVIL/DEVILS ===
    45,  // For expelling the devil and his whisperings
    128, // To ward off rebellious devils
    42,  // Whisperings in prayer

    // === ANXIETY & DISTRESS ===
    34,  // For anxiety and sorrow
    35,  // For one in distress
    124, // For one in distress (alt)
    43,  // For one whose affairs have become difficult

    // === FAITH & SINS ===
    40,  // For one afflicted with doubt in faith
    44,  // Upon committing a sin
    92,  // For fear of shirk
    96,  // Seeking forgiveness

    // === CALAMITIES ===
    46,  // When stricken with a mishap
    53,  // For one afflicted by a calamity

    // === AGAINST ENEMIES & RULERS ===
    37,  // For one afraid of ruler's injustice
    129, // Fear of ruler's injustice (alt)
    130, // Fear of ruler's injustice (alt 2)
    38,  // Against enemies
    131, // Against enemies (alt)
    39,  // When afraid of a group
    132, // When afraid of a group (alt)
    126, // Upon encountering an enemy or authority

    // === CHILDREN PROTECTION ===
    48,  // Placing children under Allah's protection
    61,  // Children protection (alt)

    // === HEALTH & GRATITUDE ===
    81,  // Gratitude for blessings
    82,  // Seeking health and refuge from evil

    // === FORGIVENESS ===
    85,  // Expiation of sins at end of gathering
    86,  // Returning a supplication of forgiveness

    // === OTHER ===
    94,  // Scorn of ascribing things to evil omens
  ],

  // TAB 4: SOCIAL - Interactions, travel, weather
  social: [
    // === SOCIAL INTERACTIONS ===
    4,   // To someone wearing new garment
    77,  // Upon sneezing
    78,  // When a disbeliever praises Allah after sneezing
    84,  // At a sitting or gathering
    87,  // To one who does you a favour
    89,  // To one who pronounces love for Allah's sake
    90,  // To one who offered you wealth
    113, // Etiquette of praising a fellow Muslim
    114, // For the one that has been praised
    109, // Returning greeting to a disbeliever
    83,  // Upon seeing someone in trial

    // === NEWS & EMOTIONS ===
    106, // Upon receiving pleasing or displeasing news
    122, // At times of amazement and delight
    123, // Upon receiving pleasant news

    // === FOOD & HOSPITALITY ===
    72,  // To one who intends to give food/drink

    // === TRAVEL ===
    95,  // When mounting transport
    97,  // Upon entering a town or village
    98,  // When entering the market
    99,  // When transport stumbles
    100, // Supplication of traveller for resident
    101, // Supplication of resident for traveller

    // === WEATHER & NATURE ===
    62,  // Upon hearing thunder
    63,  // For rain
    64,  // When it rains
    65,  // After rainfall
    67,  // Upon sighting crescent moon
    110, // Upon hearing rooster crow or donkey braying
  ],

  // TAB 5: LIFE EVENTS - Major milestones (marriage, birth, death, hajj)
  life: [
    // === MARRIAGE ===
    79,  // To the newlywed
    80,  // On wedding night or buying animal

    // === BIRTH & CHILDREN ===
    47,  // Congratulation on birth

    // === FINANCES ===
    41,  // Settling a debt
    91,  // To the debtor when debt is settled

    // === SICKNESS ===
    49,  // When visiting the sick
    50,  // Excellence of visiting the sick
    51,  // When sick have renounced hope

    // === DEATH & FUNERAL ===
    54,  // When closing eyes of deceased
    55,  // For deceased at funeral prayer
    56,  // When deceased is a child
    57,  // Condolence
    58,  // Placing deceased in the grave
    59,  // After burying the deceased
    60,  // Visiting the graves

    // === HAJJ & UMRAH ===
    117, // Between Yemeni corner and black stone (Tawaf)
    120, // Remembrance at Muzdalifa
    121, // Takbir when throwing pebbles at Jamarat
    127, // When slaughtering or offering sacrifice
  ],
}

// Get tab and order for a chapter
// chapterKey can be a number (e.g., 27) or string (e.g., '27_morning')
function getTabAndOrder(chapterKey) {
  for (const [tab, chapters] of Object.entries(TAB_ASSIGNMENTS)) {
    const index = chapters.indexOf(chapterKey)
    if (index !== -1) {
      return { tab, order: index + 1 }
    }
    // Also check numeric version for string keys
    if (typeof chapterKey === 'string') {
      const numericKey = parseInt(chapterKey)
      const numIndex = chapters.indexOf(numericKey)
      if (numIndex !== -1) {
        return { tab, order: numIndex + 1 }
      }
    }
  }
  return { tab: 'daily', order: 999 } // Default fallback
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
  const idMigrations = {}
  const referenceIndex = loadReferenceIndex()
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

    // Handle special split chapters (e.g., chapter_27_morning, chapter_27_evening)
    const isMorning = chapterSlug === 'morning'
    const isEvening = chapterSlug === 'evening'
    const categoryId = (isMorning || isEvening) ? `chapter_${chapterNum}_${chapterSlug}` : `chapter_${chapterNum}`
    const categoryName = firstDua.category_name || chapterSlug.replace(/_/g, ' ')

    // Get emoji icon based on category name
    const icon = getEmojiForCategory(categoryName)

    // Get tab and order for this chapter
    // Use special key for morning/evening chapters
    const chapterKey = isMorning ? `${chapterNum}_morning` : isEvening ? `${chapterNum}_evening` : chapterNum
    const { tab, order: tabOrder } = getTabAndOrder(chapterKey)

    // Create category entry (colors computed in component based on numeric_id)
    categories.push({
      id: categoryId,
      numeric_id: chapterNum,
      title: categoryName,
      title_ar: '', // Can be filled later
      description: `Hisn al-Muslim Chapter ${chapterNum}`,
      icon: icon,
      dua_count: duas.length,
      order: tabOrder,  // Order within the tab (based on logical flow)
      tab: tab,
      parent_id: null,
      type: 'chapter'
    })

    // Update duas with consistent category_id, normalize field names, and add unique global id
    // IMPORTANT: Use categoryId (not chapterNum) in ID to avoid collisions between morning/evening
    const localIdCounts = new Map()
    for (const [idx, dua] of duas.entries()) {
      const localId = String(dua.id ?? idx + 1)
      localIdCounts.set(localId, (localIdCounts.get(localId) || 0) + 1)
    }
    const localIdOccurrences = new Map()

    const updatedDuas = duas.map((dua, idx) => {
      // For split chapters (morning/evening), use full categoryId to ensure unique IDs
      // e.g., "chapter_27_morning_hisn_75" vs "chapter_27_evening_hisn_75"
      const idPrefix = (isMorning || isEvening) ? `${chapterNum}_${chapterSlug}` : `${chapterNum}`

      // Normalize field names for consistent component access
      const localId = String(dua.id ?? idx + 1)
      const occurrence = (localIdOccurrences.get(localId) || 0) + 1
      localIdOccurrences.set(localId, occurrence)
      const duplicateCount = localIdCounts.get(localId)
      // bulkPut historically left the last duplicate visible. Keep its old ID so
      // existing favorites still point at the same text; expose earlier records.
      const duplicateSuffix = duplicateCount > 1 && occurrence < duplicateCount ? `_${occurrence}` : ''
      const runtimeId = `${idPrefix}_${localId}${duplicateSuffix}`
      const legacyId = `${idPrefix}_${localId}`
      const declaredSourceIdentifier = canonicalSourceIdentifier(dua)
      const arabic = nfc(dua.dua_text_arabic || dua.arabic || '')
      const referenceMatches = referenceIndex.get(arabicSkeleton(arabic))
      const inferredSourceIdentifier = !declaredSourceIdentifier && referenceMatches?.size === 1
        ? [...referenceMatches][0]
        : null
      const sourceIdentifier = declaredSourceIdentifier || inferredSourceIdentifier
      const normalized = {
        id: runtimeId,
        category_id: categoryId,
        category_name: categoryName,
        chapter_num: chapterNum,
        // Normalize text fields (support both old and new field names)
        arabic,
        arabic_search_text: normalizeArabicForSearch(arabic),
        arabic_quality: arabicQuality(arabic),
        transliteration: nfc(dua.dua_text_transliteration || dua.transliteration || ''),
        translation: nfc(dua.dua_text_english || dua.translation || ''),
        // Generate title from translation if not present
        title: dua.title || (dua.dua_text_english || dua.translation || '').slice(0, 100) + ((dua.dua_text_english || dua.translation || '').length > 100 ? '...' : ''),
        // Keep other fields
        reference: nfc(dua.reference || ''),
        virtue: dua.virtue || dua.hadith || '',
        repetitions: dua.repetitions || dua.repeat || null,
        tags: dua.tags || [],
        // String-valued identifiers (notably "75a") must never be coerced.
        hisn_al_muslim_number: sourceIdentifier,
        source_identifier: sourceIdentifier,
        source_identifier_inferred: Boolean(inferredSourceIdentifier),
        source_identifier_raw: dua.hisn_number ?? dua.hisn_al_muslim_number ?? null,
        source_collection: 'Hisn al-Muslim',
        source_chapter: String(chapterNum),
        source_file: file,
        source_verification: dua.arabic_source_verification || 'docs/reference/hisn_al_muslim.txt',
        arabic_normalization: 'NFC'
      }
      idMigrations[legacyId] = duplicateCount > 1 ? `${idPrefix}_${localId}` : runtimeId
      return normalized
    })

    duasByCategory[categoryId] = updatedDuas
    totalDuas += duas.length

    console.log(`  ✓ Chapter ${chapterNum}: ${categoryName} (${duas.length} duas)`)
  }

  console.log(`\n📊 Summary:`)
  console.log(`  - ${categories.length} categories`)
  console.log(`  - ${totalDuas} total duas`)

  const validation = validateBuiltData(categories, duasByCategory)
  console.log(`  - ${validation.warnings.length} review warnings (non-destructive; see manifest)`)

  // Write categories.json
  const categoriesPath = path.join(DUA_DIR, 'categories.json')
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2))
  console.log(`\n✅ Written ${categoriesPath}`)

  // Write duas.json
  const duasPath = path.join(DUA_DIR, 'duas.json')
  fs.writeFileSync(duasPath, JSON.stringify(duasByCategory, null, 2))
  console.log(`✅ Written ${duasPath}`)

  fs.writeFileSync(path.join(DUA_DIR, 'id-migrations.json'), JSON.stringify({
    dataset_version: DATASET_VERSION,
    mappings: idMigrations
  }, null, 2))
  fs.writeFileSync(path.join(DUA_DIR, 'manifest.json'), JSON.stringify({
    dataset_version: DATASET_VERSION,
    source_collection: 'Hisn al-Muslim',
    organization: 'Existing BetterIslam chapter/category structure',
    category_count: categories.length,
    dua_count: validation.totalDuas,
    unicode_normalization: 'NFC',
    checked_reference: 'docs/reference/hisn_al_muslim.txt',
    checked_reference_sha256: sha256(fs.readFileSync(HISN_REFERENCE_PATH)),
    generated_duas_sha256: sha256(JSON.stringify(duasByCategory)),
    validation_warnings: validation.warnings
  }, null, 2))
  console.log('✅ Written migration map and validation manifest')

  console.log('\n🎉 Build complete!')
}

buildDuaData()
