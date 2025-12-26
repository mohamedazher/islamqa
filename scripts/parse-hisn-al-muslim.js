#!/usr/bin/env node

/**
 * Hisn al-Muslim Parser
 *
 * Parses the hisn_al_muslim.txt file and generates structured JSON data
 * for the IslamQA duas feature.
 *
 * Output:
 * - public/data/dua/hisn-al-muslim-categories.json
 * - public/data/dua/hisn-al-muslim-duas.json
 */

const fs = require('fs');
const path = require('path');

// Category metadata: icons, colors, and tab organization
const CATEGORY_METADATA = {
  // Tab 1: Morning, Evening & Frequent Duas
  'morning_evening': {
    chapters: ['In the morning and evening'],
    icon: '🌅',
    color: 'from-amber-400 to-orange-500',
    tab: 'main',
    order: 1
  },
  'waking_up': {
    chapters: ['When waking up'],
    icon: '☀️',
    color: 'from-sky-400 to-blue-500',
    tab: 'main',
    order: 2
  },
  'before_sleep': {
    chapters: ['Before sleeping'],
    icon: '🌙',
    color: 'from-indigo-500 to-purple-600',
    tab: 'main',
    order: 3
  },
  'salah': {
    chapters: [
      'At the start of the prayer (after takbeer)',
      'While bowing in prayer',
      'Upon rising from the bowing position',
      'While prostrating',
      'Between the two prostrations',
      'When prostrating due to recitation of the Quran',
      'The Tashahhud',
      'Prayers upon the Prophet ﷺ after the tashahhud',
      'After the last tashahhud and before salam',
      'After salam'
    ],
    icon: '🕌',
    color: 'from-green-400 to-emerald-500',
    tab: 'main',
    order: 4
  },
  'masjid': {
    chapters: [
      'When going to the mosque',
      'Upon entering the mosque',
      'Upon leaving the mosque',
      'Concerning the athan (the call to prayer)'
    ],
    icon: '🕋',
    color: 'from-rose-400 to-pink-500',
    tab: 'main',
    order: 5
  },
  'istighfar': {
    chapters: ['Seeking forgiveness and repentance'],
    icon: '🤲',
    color: 'from-purple-400 to-violet-500',
    tab: 'main',
    order: 6
  },
  'protection': {
    chapters: [
      'When tossing and turning during the night',
      'Upon experiencing unrest, fear, apprehensiveness during sleep',
      'What to say upon experiencing a bad dream'
    ],
    icon: '🛡️',
    color: 'from-red-400 to-rose-500',
    tab: 'main',
    order: 7
  },

  // Tab 2: Other Categories (alphabetically organized)
  'bathroom': {
    chapters: [
      'Before entering the bathroom',
      'After leaving the bathroom'
    ],
    icon: '🚿',
    color: 'from-cyan-400 to-blue-500',
    tab: 'other',
    order: 101
  },
  'clothes': {
    chapters: [
      'When wearing a garment',
      'When wearing a new garment',
      'To someone wearing a new garment',
      'Before undressing'
    ],
    icon: '👔',
    color: 'from-purple-400 to-indigo-500',
    tab: 'other',
    order: 102
  },
  'wudu': {
    chapters: [
      'Before ablution',
      'Upon completing the ablution'
    ],
    icon: '💧',
    color: 'from-teal-400 to-cyan-500',
    tab: 'other',
    order: 103
  },
  'home': {
    chapters: [
      'Remembrance when leaving the home',
      'Remembrance upon entering the home'
    ],
    icon: '🏠',
    color: 'from-green-400 to-emerald-500',
    tab: 'other',
    order: 104
  },
  'istikhara': {
    chapters: ['For seeking guidance in forming a decision or choosing the proper course'],
    icon: '🤔',
    color: 'from-violet-400 to-purple-500',
    tab: 'other',
    order: 105
  },
  'excellence_remembrance': {
    chapters: ['Excellence of remembrance and glorification of Allah'],
    icon: '✨',
    color: 'from-yellow-400 to-amber-500',
    tab: 'other',
    order: 106
  },
  'tasbeeh': {
    chapters: ['How the Prophet ﷺ made tasbeeh'],
    icon: '📿',
    color: 'from-emerald-400 to-teal-500',
    tab: 'other',
    order: 107
  },
  'good_manners': {
    chapters: ['Comprehensive types of good and manners'],
    icon: '🌟',
    color: 'from-orange-400 to-amber-500',
    tab: 'other',
    order: 108
  }
};

// Helper function to escape special characters for JSON
function escapeForJson(text) {
  if (!text) return '';

  return text
    // Replace actual newlines with space
    .replace(/\n/g, ' ')
    // Replace carriage returns
    .replace(/\r/g, '')
    // Replace tabs with space
    .replace(/\t/g, ' ')
    // Handle backslashes first (before quotes)
    .replace(/\\/g, '\\\\')
    // Escape double quotes
    .replace(/"/g, '\\"')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

// Helper function to clean Arabic text
function cleanArabicText(text) {
  if (!text) return '';

  return text
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to determine category ID from chapter name
function getCategoryId(chapterName) {
  for (const [id, metadata] of Object.entries(CATEGORY_METADATA)) {
    if (metadata.chapters.some(ch => chapterName.includes(ch) || ch.includes(chapterName))) {
      return id;
    }
  }
  return 'other_duas'; // Fallback for uncategorized chapters
}

// Main parser function
function parseHisnAlMuslim(filePath) {
  console.log('📖 Reading Hisn al-Muslim file...');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const categories = [];
  const duas = [];
  let currentChapter = null;
  let currentChapterNumber = null;
  let currentChapterArabic = null;
  let currentDua = null;
  let duaCounter = 0;
  let lineBuffer = [];

  console.log(`📄 Processing ${lines.length} lines...`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and separators
    if (!line || line === '#' || line.includes('Report Error') || line.includes('Share') || line.includes('Copy')) {
      continue;
    }

    // Detect chapter number (e.g., "(1)")
    const chapterNumMatch = line.match(/^\((\d+)\)$/);
    if (chapterNumMatch) {
      currentChapterNumber = parseInt(chapterNumMatch[1]);
      continue;
    }

    // Detect chapter name (starts with "Chapter:")
    if (line.startsWith('Chapter:')) {
      currentChapter = line.replace('Chapter:', '').trim();
      currentChapterArabic = null; // Will be set by next line
      continue;
    }

    // Detect Arabic chapter name (comes after English chapter name)
    if (currentChapter && !currentChapterArabic && /[\u0600-\u06FF]/.test(line) && !line.startsWith('Hisn al-Muslim')) {
      currentChapterArabic = cleanArabicText(line);

      // Create or update category
      const categoryId = getCategoryId(currentChapter);
      const metadata = CATEGORY_METADATA[categoryId] || {
        icon: '📖',
        color: 'from-gray-400 to-slate-500',
        tab: 'other',
        order: 999
      };

      if (!categories.find(c => c.id === categoryId)) {
        categories.push({
          id: categoryId,
          category_id: currentChapterNumber,
          title: currentChapter,
          title_ar: currentChapterArabic,
          icon: metadata.icon,
          color: metadata.color,
          tab: metadata.tab,
          order: metadata.order,
          dua_count: 0
        });
      }
      continue;
    }

    // Detect dua number (e.g., "Hisn al-Muslim 1")
    const duaNumMatch = line.match(/^Hisn al-Muslim (\d+)$/);
    if (duaNumMatch) {
      // Save previous dua if exists
      if (currentDua) {
        // Clean and save the dua
        currentDua.arabic = cleanArabicText(lineBuffer.join(' '));
        duas.push(currentDua);
        duaCounter++;

        // Update category dua count
        const cat = categories.find(c => c.id === currentDua.category_id);
        if (cat) cat.dua_count++;
      }

      // Start new dua
      const duaNumber = parseInt(duaNumMatch[1]);
      const categoryId = getCategoryId(currentChapter);

      currentDua = {
        id: duaNumber,
        hisn_number: duaNumber,
        category_id: categoryId,
        category_name: currentChapter,
        category_name_ar: currentChapterArabic,
        title: currentChapter, // Will be updated if there's a specific title
        title_ar: currentChapterArabic,
        arabic: '',
        transliteration: '',
        translation: '',
        reference: '',
        repetitions: null,
        order: duaNumber,
        tags: [currentChapter]
      };

      lineBuffer = [];

      // Read next few lines for transliteration, translation, reference
      let j = i + 1;
      let foundContent = false;

      while (j < lines.length && !foundContent) {
        const nextLine = lines[j].trim();

        // Skip empty lines
        if (!nextLine) {
          j++;
          continue;
        }

        // Stop at separator
        if (nextLine.includes('Report Error') || nextLine.includes('Share') || nextLine.includes('Copy')) {
          break;
        }

        // Stop at next dua
        if (nextLine.startsWith('Hisn al-Muslim')) {
          break;
        }

        // This line contains transliteration, translation, and reference
        // They're usually in one long line
        if (!foundContent && !nextLine.match(/^[\u0600-\u06FF\s]+$/)) {
          // This is the English content line
          const content = nextLine;

          // Try to extract reference (usually at the end after "Reference:")
          const refMatch = content.match(/Reference:\s*(.+)$/);
          if (refMatch) {
            currentDua.reference = escapeForJson(refMatch[1]);

            // Remove reference from content
            const beforeRef = content.substring(0, content.indexOf('Reference:')).trim();

            // The content before reference contains transliteration and translation
            // Usually transliteration is in italics/special chars, translation is plain English
            // For simplicity, we'll try to split intelligently

            // Look for common translation starts
            const translationStarts = [
              'In the Name of Allah',
              'O Allah',
              'I seek',
              'Praise is to',
              'Glory',
              'There is none',
              'All praise',
              'May Allah',
              'Glorified is',
              'I bear witness'
            ];

            let splitIndex = -1;
            for (const start of translationStarts) {
              const idx = beforeRef.indexOf(start);
              if (idx > 0) {
                splitIndex = idx;
                break;
              }
            }

            if (splitIndex > 0) {
              currentDua.transliteration = escapeForJson(beforeRef.substring(0, splitIndex).trim());
              currentDua.translation = escapeForJson(beforeRef.substring(splitIndex).trim());
            } else {
              // Couldn't split, put everything in transliteration
              currentDua.transliteration = escapeForJson(beforeRef);
            }
          } else {
            // No reference found, entire line is content
            currentDua.transliteration = escapeForJson(content);
          }

          foundContent = true;
        } else if (nextLine.match(/^[\u0600-\u06FF\s]+$/)) {
          // This is Arabic text
          lineBuffer.push(nextLine);
        }

        j++;
      }

      i = j - 1; // Update main loop index
      continue;
    }
  }

  // Save last dua
  if (currentDua) {
    currentDua.arabic = cleanArabicText(lineBuffer.join(' '));
    duas.push(currentDua);
    duaCounter++;

    const cat = categories.find(c => c.id === currentDua.category_id);
    if (cat) cat.dua_count++;
  }

  console.log(`✅ Parsed ${categories.length} categories and ${duas.length} duas`);

  return { categories, duas };
}

// Main execution
try {
  const inputFile = path.join(__dirname, '../docs/reference/hisn_al_muslim.txt');
  const outputDir = path.join(__dirname, '../public/data/dua');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Parse the file
  const { categories, duas } = parseHisnAlMuslim(inputFile);

  // Sort categories by tab and order
  categories.sort((a, b) => {
    if (a.tab !== b.tab) {
      return a.tab === 'main' ? -1 : 1;
    }
    return a.order - b.order;
  });

  // Write categories file
  const categoriesFile = path.join(outputDir, 'hisn-al-muslim-categories.json');
  fs.writeFileSync(
    categoriesFile,
    JSON.stringify(categories, null, 2),
    'utf-8'
  );
  console.log(`💾 Saved categories to: ${categoriesFile}`);

  // Write duas file (organized by category)
  const duasFile = path.join(outputDir, 'hisn-al-muslim-duas.json');

  // Group duas by category
  const duasByCategory = {};
  duas.forEach(dua => {
    if (!duasByCategory[dua.category_id]) {
      duasByCategory[dua.category_id] = [];
    }
    duasByCategory[dua.category_id].push(dua);
  });

  fs.writeFileSync(
    duasFile,
    JSON.stringify(duasByCategory, null, 2),
    'utf-8'
  );
  console.log(`💾 Saved duas to: ${duasFile}`);

  // Print summary
  console.log('\n📊 Summary:');
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Duas: ${duas.length}`);
  console.log(`   Main tab categories: ${categories.filter(c => c.tab === 'main').length}`);
  console.log(`   Other tab categories: ${categories.filter(c => c.tab === 'other').length}`);
  console.log('\n✅ Parsing complete!');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
