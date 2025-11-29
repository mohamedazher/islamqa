const fs = require('fs');
const path = require('path');

const INPUT_DIR = '/Users/mohamedazher/Halsimplify/islamqa/.dua-markdown/';
const OUTPUT_DIR = '/Users/mohamedazher/Halsimplify/islamqa/public/data/dua/';

// Category mapping with IDs and proper names
const CATEGORY_MAPPING = {
  'waking-up.md': { id: 1, name: 'Waking Up' },
  'before-sleep.md': { id: 2, name: 'Before Sleep' },
  'morning.md': { id: 3, name: 'Morning Adhkar' },
  'evening.md': { id: 4, name: 'Evening Adhkar' },
  'salah.md': { id: 5, name: 'Salah (Prayer)' },
  'after-salah.md': { id: 6, name: 'After Salah' },
  'dhikr-all-times.md': { id: 7, name: 'Dhikr for All Times' },
  'praises-allah.md': { id: 8, name: 'Praises of Allah' },
  'istighfar.md': { id: 9, name: 'Istighfar (Seeking Forgiveness)' },
  'salawat.md': { id: 10, name: 'Salawat (Blessings on the Prophet)' },
  'quranic-duas.md': { id: 11, name: 'Quranic Duas' },
  'sunnah-duas.md': { id: 12, name: 'Sunnah Duas' },
  'lavatory-wudu.md': { id: 13, name: 'Lavatory & Wudu' },
  'clothes.md': { id: 14, name: 'Clothing' },
  'home.md': { id: 15, name: 'Home' },
  'adhan-masjid.md': { id: 16, name: 'Adhan & Masjid' },
  'food-drink.md': { id: 17, name: 'Food & Drink' },
  'travel.md': { id: 18, name: 'Travel' },
  'gatherings.md': { id: 19, name: 'Gatherings' },
  'istikhara.md': { id: 20, name: 'Istikhara (Seeking Guidance)' },
  'marriage-children.md': { id: 21, name: 'Marriage & Children' },
  'ruqyah-illness.md': { id: 22, name: 'Ruqyah & Illness' },
  'death.md': { id: 23, name: 'Death & Bereavement' },
  'difficulties-happiness.md': { id: 24, name: 'Difficulties & Happiness' },
  'protection-iman.md': { id: 25, name: 'Protection & Iman' },
  'nature.md': { id: 26, name: 'Nature & Weather' },
  'nightmares.md': { id: 27, name: 'Nightmares' },
  'social-interactions.md': { id: 28, name: 'Social Interactions' },
  'hajj-umrah.md': { id: 29, name: 'Hajj & Umrah' },
  'money-shopping.md': { id: 30, name: 'Money & Shopping' },
  'names-allah.md': { id: 31, name: 'Names of Allah' }
};

// Helper function to detect Arabic text
function isArabic(text) {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicPattern.test(text);
}

// Helper function to check if line is transliteration (has special Latin chars)
function isTransliteration(text) {
  const translitPattern = /[āīūḍṣṭḥḍẓḍḥḍẓḍḍāīūḍṣṭḥḍẓḍḥḍẓḍḍĀĪŪḌṢṬḤḌẒḌḤḌẒḌḌʿ]/;
  return translitPattern.test(text) || (text.match(/^[A-Z][a-z]+/) && text.includes('-'));
}

// Helper function to extract tags from title
function extractTags(title, categoryName) {
  const tags = [categoryName];
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('morning') || lowerTitle.includes('fajr')) tags.push('Morning');
  if (lowerTitle.includes('evening') || lowerTitle.includes('maghrib')) tags.push('Evening');
  if (lowerTitle.includes('night') || lowerTitle.includes('sleep')) tags.push('Night');
  if (lowerTitle.includes('waking') || lowerTitle.includes('wake')) tags.push('Waking');
  if (lowerTitle.includes('protection') || lowerTitle.includes('refuge')) tags.push('Protection');
  if (lowerTitle.includes('forgiveness') || lowerTitle.includes('istighfar')) tags.push('Forgiveness');
  if (lowerTitle.includes('surah') || lowerTitle.includes('ayat')) tags.push('Quran');
  if (lowerTitle.includes('prophet') || lowerTitle.includes('salawat')) tags.push('Prophet');

  return [...new Set(tags)];
}

// Parse a single markdown file
function parseMarkdownFile(filePath, categoryInfo) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const duas = [];
  let duaCounter = 1;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Look for dua title line: *   ##### Title
    if (line.includes('#####')) {
      const title = line.replace(/^\*\s*#+\s*/, '').trim();

      // Initialize new dua
      const dua = {
        id: duaCounter++,
        category_id: categoryInfo.id,
        title: title,
        title_ar: null,
        arabic: '',
        transliteration: '',
        translation: '',
        virtue: '',
        reference: '',
        repetitions: null,
        order: 0,
        tags: extractTags(title, categoryInfo.name)
      };

      i++; // Move past title line

      // Collect content lines until next dua or end
      const contentLines = [];
      while (i < lines.length) {
        const nextLine = lines[i];

        // Stop if we hit the next dua
        if (nextLine.trim().includes('#####')) {
          break;
        }

        // Skip navigation/footer
        if (nextLine.includes('[Skip to content]') ||
            nextLine.includes('No products in the basket') ||
            nextLine.includes('[Previous]') ||
            nextLine.includes('Related Articles') ||
            nextLine.includes('Page load link') ||
            nextLine.trim().startsWith('![](')) {
          i++;
          continue;
        }

        const trimmed = nextLine.trim();
        if (trimmed) {
          contentLines.push(trimmed);
        }
        i++;
      }

      // Now parse the collected content lines
      // Expected order: Arabic, Translation (English), Transliteration, Virtue/Reference
      let contentIndex = 0;

      // 1. Collect all Arabic lines (first non-empty lines that are Arabic)
      while (contentIndex < contentLines.length && isArabic(contentLines[contentIndex])) {
        if (dua.arabic) dua.arabic += ' ';
        dua.arabic += contentLines[contentIndex];
        contentIndex++;
      }

      // 2. Collect translation (first non-Arabic, non-transliteration line)
      while (contentIndex < contentLines.length &&
             !isArabic(contentLines[contentIndex]) &&
             !isTransliteration(contentLines[contentIndex])) {
        // Check if this might be virtue instead (has references or narrator mentions)
        if (contentLines[contentIndex].includes('narrates') ||
            contentLines[contentIndex].includes('said:') ||
            contentLines[contentIndex].match(/\([^)]*\d+[^)]*\)/) ||
            contentLines[contentIndex].includes('Messenger of Allah') ||
            contentLines[contentIndex].includes('Prophet')) {
          break; // This is virtue, not translation
        }

        if (dua.translation) dua.translation += ' ';
        dua.translation += contentLines[contentIndex];
        contentIndex++;
      }

      // 3. Collect transliteration (lines with special Latin characters)
      while (contentIndex < contentLines.length && isTransliteration(contentLines[contentIndex])) {
        if (dua.transliteration) dua.transliteration += ' ';
        dua.transliteration += contentLines[contentIndex];
        contentIndex++;
      }

      // 4. Everything else is virtue/reference
      while (contentIndex < contentLines.length) {
        if (dua.virtue) dua.virtue += ' ';
        dua.virtue += contentLines[contentIndex];
        contentIndex++;
      }

      // Extract reference from virtue
      const refMatch = dua.virtue.match(/\(([^)]+\d+[^)]*)\)/);
      if (refMatch) {
        dua.reference = refMatch[1];
      }

      // Extract repetitions
      const repMatch = dua.virtue.match(/(\d+)\s*times?/i);
      if (repMatch) {
        dua.repetitions = parseInt(repMatch[1]);
      }

      // Clean up fields
      dua.arabic = dua.arabic.trim();
      dua.transliteration = dua.transliteration.trim();
      dua.translation = dua.translation.trim();
      dua.virtue = dua.virtue.trim();

      // Extract Arabic title if present
      if (dua.title && isArabic(dua.title)) {
        const parts = dua.title.split(/\s+[-–—]\s+/);
        if (parts.length > 1) {
          dua.title_ar = parts.find(p => isArabic(p)) || null;
          dua.title = parts.find(p => !isArabic(p)) || dua.title;
        }
      }

      dua.order = duas.length + 1;
      duas.push(dua);

    } else {
      i++;
    }
  }

  return duas;
}

// Main processing function
function processAllFiles() {
  const summary = {
    filesProcessed: 0,
    totalDuas: 0,
    errors: [],
    warnings: [],
    details: []
  };

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get all markdown files
  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => f.endsWith('.md') && f !== 'VERIFICATION_REPORT.md')
    .sort();

  console.log(`Found ${files.length} markdown files to process\n`);

  files.forEach(filename => {
    const categoryInfo = CATEGORY_MAPPING[filename];

    if (!categoryInfo) {
      summary.warnings.push(`No category mapping for ${filename}`);
      console.log(`⚠️  Skipping ${filename} - no category mapping`);
      return;
    }

    try {
      const inputPath = path.join(INPUT_DIR, filename);
      const duas = parseMarkdownFile(inputPath, categoryInfo);

      const jsonData = {
        category_id: categoryInfo.id,
        category_name: categoryInfo.name,
        duas: duas
      };

      // Write to JSON file
      const outputFilename = filename.replace('.md', '.json');
      const outputPath = path.join(OUTPUT_DIR, outputFilename);
      fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');

      summary.filesProcessed++;
      summary.totalDuas += duas.length;
      summary.details.push({
        file: filename,
        duas: duas.length
      });

      const status = duas.length === 0 ? '⚠️ ' : '✅';
      console.log(`${status} ${filename.padEnd(30)} -> ${outputFilename.padEnd(30)} (${duas.length} duas)`);

      if (duas.length === 0) {
        summary.warnings.push(`${filename} has 0 duas extracted`);
      }

    } catch (error) {
      summary.errors.push(`${filename}: ${error.message}`);
      console.log(`❌ Error processing ${filename}: ${error.message}`);
    }
  });

  return summary;
}

// Run the processor
console.log('Starting to process all dua markdown files...\n');
const summary = processAllFiles();

// Print summary
console.log('\n' + '='.repeat(70));
console.log('PROCESSING SUMMARY');
console.log('='.repeat(70));
console.log(`Files Processed: ${summary.filesProcessed}`);
console.log(`Total Duas Extracted: ${summary.totalDuas}`);
console.log(`Average per file: ${(summary.totalDuas / summary.filesProcessed).toFixed(1)}`);
console.log(`Errors: ${summary.errors.length}`);
console.log(`Warnings: ${summary.warnings.length}`);

if (summary.errors.length > 0) {
  console.log('\nERRORS:');
  summary.errors.forEach(err => console.log(`  - ${err}`));
}

if (summary.warnings.length > 0) {
  console.log('\nFILES WITH 0 DUAS (may need manual review):');
  summary.warnings.forEach(warn => console.log(`  - ${warn}`));
}

console.log('\nDETAILED BREAKDOWN:');
summary.details
  .sort((a, b) => b.duas - a.duas)
  .forEach(item => {
    console.log(`  ${item.file.padEnd(30)} ${item.duas} duas`);
  });

console.log('\n✨ Processing complete!');
