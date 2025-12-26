#!/usr/bin/env node

/**
 * Improved Hisn al-Muslim Parser
 * Properly extracts Arabic text and handles escaping
 */

const fs = require('fs');
const path = require('path');

// Category metadata (keeping the same from before)
const CATEGORY_METADATA = {
  'morning_evening': {
    keywords: ['morning and evening'],
    icon: '🌅',
    color: 'from-amber-400 to-orange-500',
    tab: 'main',
    order: 1
  },
  'waking_up': {
    keywords: ['waking up'],
    icon: '☀️',
    color: 'from-sky-400 to-blue-500',
    tab: 'main',
    order: 2
  },
  'before_sleep': {
    keywords: ['Before sleeping'],
    icon: '🌙',
    color: 'from-indigo-500 to-purple-600',
    tab: 'main',
    order: 3
  },
  'salah': {
    keywords: ['prayer', 'bowing', 'prostrating', 'Tashahhud', 'takbeer', 'salam'],
    icon: '🕌',
    color: 'from-green-400 to-emerald-500',
    tab: 'main',
    order: 4
  },
  'masjid': {
    keywords: ['mosque', 'athan', 'adhan'],
    icon: '🕋',
    color: 'from-rose-400 to-pink-500',
    tab: 'main',
    order: 5
  },
  'istighfar': {
    keywords: ['forgiveness', 'repentance'],
    icon: '🤲',
    color: 'from-purple-400 to-violet-500',
    tab: 'main',
    order: 6
  },
  'protection': {
    keywords: ['tossing', 'unrest', 'fear', 'bad dream'],
    icon: '🛡️',
    color: 'from-red-400 to-rose-500',
    tab: 'main',
    order: 7
  },
  'bathroom': {
    keywords: ['bathroom'],
    icon: '🚿',
    color: 'from-cyan-400 to-blue-500',
    tab: 'other',
    order: 101
  },
  'clothes': {
    keywords: ['garment', 'undressing'],
    icon: '👔',
    color: 'from-purple-400 to-indigo-500',
    tab: 'other',
    order: 102
  },
  'wudu': {
    keywords: ['ablution'],
    icon: '💧',
    color: 'from-teal-400 to-cyan-500',
    tab: 'other',
    order: 103
  },
  'home': {
    keywords: ['home'],
    icon: '🏠',
    color: 'from-green-400 to-emerald-500',
    tab: 'other',
    order: 104
  },
  'istikhara': {
    keywords: ['istikhara', 'guidance in forming'],
    icon: '🤔',
    color: 'from-violet-400 to-purple-500',
    tab: 'other',
    order: 105
  },
  'excellence': {
    keywords: ['Excellence of remembrance'],
    icon: '✨',
    color: 'from-yellow-400 to-amber-500',
    tab: 'other',
    order: 106
  },
  'tasbeeh': {
    keywords: ['tasbeeh'],
    icon: '📿',
    color: 'from-emerald-400 to-teal-500',
    tab: 'other',
    order: 107
  },
  'good_manners': {
    keywords: ['good and manners'],
    icon: '🌟',
    color: 'from-orange-400 to-amber-500',
    tab: 'other',
    order: 108
  }
};

function getCategoryId(chapterName) {
  const lowerChapter = chapterName.toLowerCase();
  for (const [id, meta] of Object.entries(CATEGORY_METADATA)) {
    if (meta.keywords.some(kw => lowerChapter.includes(kw.toLowerCase()))) {
      return id;
    }
  }
  return 'other_duas';
}

function cleanText(text) {
  return text
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseHisnAlMuslim(filePath) {
  console.log('📖 Reading file...');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Split by "Report Error | Share | Copy" to get dua blocks
  const blocks = content.split(/Report Error \| Share \| Copy/);

  const categories = new Map();
  const duas = [];

  let currentChapter = null;
  let currentChapterNum = null;
  let currentChapterAr = null;

  console.log(`📄 Processing ${blocks.length} dua blocks...`);

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length === 0) continue;

    // Look for chapter markers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Chapter number like (1)
      if (line.match(/^\(\d+\)$/)) {
        currentChapterNum = parseInt(line.match(/\((\d+)\)/)[1]);
        continue;
      }

      // Chapter name
      if (line.startsWith('Chapter:')) {
        currentChapter = line.replace('Chapter:', '').trim();
        // Next line should be Arabic
        if (i + 1 < lines.length && /[\u0600-\u06FF]/.test(lines[i + 1])) {
          currentChapterAr = lines[i + 1];
        }

        // Add/update category
        const catId = getCategoryId(currentChapter);
        if (!categories.has(catId)) {
          const meta = CATEGORY_METADATA[catId] || {
            icon: '📖',
            color: 'from-gray-400 to-slate-500',
            tab: 'other',
            order: 999
          };

          categories.set(catId, {
            id: catId,
            category_id: currentChapterNum,
            title: currentChapter,
            title_ar: currentChapterAr,
            icon: meta.icon,
            color: meta.color,
            tab: meta.tab,
            order: meta.order,
            dua_count: 0
          });
        }
        continue;
      }
    }

    // Look for Hisn al-Muslim number
    const hisnMatch = block.match(/Hisn al-Muslim (\d+)/);
    if (!hisnMatch) continue;

    const hisnNumber = parseInt(hisnMatch[1]);

    // Extract parts
    const parts = block.split('Hisn al-Muslim ' + hisnNumber);
    if (parts.length < 2) continue;

    const afterHisn = parts[1];

    // Find reference
    let reference = '';
    const refMatch = afterHisn.match(/Reference:\s*(.+?)(?=[\u0600-\u06FF]|$)/s);
    if (refMatch) {
      reference = cleanText(refMatch[1]);
    }

    // Extract transliteration and translation (before Reference or Arabic)
    const beforeRef = refMatch
      ? afterHisn.substring(0, afterHisn.indexOf('Reference:'))
      : afterHisn;

    let transliteration = '';
    let translation = '';

    const englishPart = cleanText(beforeRef.replace(/[\u0600-\u06FF]/g, ''));

    // Try to split transliteration and translation
    // Translation usually starts with common phrases
    const translationStarts = [
      'In the Name',
      'O Allah',
      'I seek',
      'Praise is',
      'Glory is',
      'There is none',
      'All praise',
      'May Allah',
      'Glorified is',
      'I bear witness',
      'None has',
      'How perfect',
      'Repeat what',
      'When ',
      'Whoever',
      'Allah'
    ];

    let splitIndex = -1;
    for (const start of translationStarts) {
      const idx = englishPart.indexOf(start);
      if (idx > 5) { // Need some transliteration first
        splitIndex = idx;
        break;
      }
    }

    if (splitIndex > 0) {
      transliteration = englishPart.substring(0, splitIndex).trim();
      translation = englishPart.substring(splitIndex).trim();
    } else if (englishPart.length > 0) {
      // If can't split, check if it looks like transliteration
      if (englishPart.match(/[āīūḥṣṭẓḍ]/)) {
        transliteration = englishPart;
      } else {
        translation = englishPart;
      }
    }

    // Extract Arabic text (comes after Reference or after English)
    let arabic = '';
    const arabicMatch = afterHisn.match(/([\u0600-\u06FF][\u0600-\u06FF\s\{\}]+)/);
    if (arabicMatch) {
      arabic = cleanText(arabicMatch[1]);
    }

    // Create dua object
    const catId = getCategoryId(currentChapter || '');
    const dua = {
      id: hisnNumber,
      hisn_number: hisnNumber,
      category_id: catId,
      category_name: currentChapter || '',
      category_name_ar: currentChapterAr || '',
      title: currentChapter || '',
      title_ar: currentChapterAr || '',
      arabic: arabic,
      transliteration: transliteration,
      translation: translation,
      reference: reference,
      repetitions: null,
      order: hisnNumber,
      tags: [currentChapter || 'General']
    };

    duas.push(dua);

    // Update category count
    if (categories.has(catId)) {
      categories.get(catId).dua_count++;
    }
  }

  console.log(`✅ Parsed ${categories.size} categories and ${duas.length} duas`);

  return {
    categories: Array.from(categories.values()),
    duas
  };
}

// Main execution
try {
  const inputFile = path.join(__dirname, '../docs/reference/hisn_al_muslim.txt');
  const outputDir = path.join(__dirname, '../public/data/dua');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { categories, duas } = parseHisnAlMuslim(inputFile);

  // Sort categories
  categories.sort((a, b) => {
    if (a.tab !== b.tab) return a.tab === 'main' ? -1 : 1;
    return a.order - b.order;
  });

  // Write categories
  fs.writeFileSync(
    path.join(outputDir, 'hisn-al-muslim-categories.json'),
    JSON.stringify(categories, null, 2)
  );

  // Group duas by category
  const duasByCategory = {};
  duas.forEach(dua => {
    if (!duasByCategory[dua.category_id]) {
      duasByCategory[dua.category_id] = [];
    }
    duasByCategory[dua.category_id].push(dua);
  });

  // Write duas
  fs.writeFileSync(
    path.join(outputDir, 'hisn-al-muslim-duas.json'),
    JSON.stringify(duasByCategory, null, 2)
  );

  console.log(`\n📊 Summary:`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Duas: ${duas.length}`);
  console.log(`   Main tab: ${categories.filter(c => c.tab === 'main').length}`);
  console.log(`   Other tab: ${categories.filter(c => c.tab === 'other').length}`);
  console.log('\n✅ Complete!');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
