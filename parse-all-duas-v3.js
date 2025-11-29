const fs = require('fs');
const path = require('path');

const INPUT_DIR = '/Users/mohamedazher/Halsimplify/islamqa/.dua-markdown/';
const OUTPUT_DIR = '/Users/mohamedazher/Halsimplify/islamqa/public/data/dua/';

// Category mapping
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

// Helper: detect Arabic text
function isArabic(text) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

// Helper: detect transliteration (has special Latin chars or specific patterns)
function isTransliteration(text) {
  // Has diacriticals
  if (/[āīūḍṣṭḥḍẓḍḥḍẓḍḍāīūḍṣṭḥḍẓḍḥḍẓḍḍĀĪŪḌṢṬḤḌẒḌḤḌẒḌḌʿ]/.test(text)) {
    return true;
  }
  // Starts with capital and has hyphens (typical transliteration pattern)
  if (/^[A-Z][a-z]+.*-/.test(text)) {
    return true;
  }
  return false;
}

// Helper: detect virtue/hadith text
function isVirtueText(text) {
  return /narrates|narrated|said:|reported|Messenger of Allah|Prophet|raḍiy Allāhu|ʿalayhis-salām|ﷺ|\(Bukhārī|\(Muslim|\(Tirmidhī|\(Abū Dāwūd|\(Nasā'ī|\(Aḥmad|\(Ibn Mājah|\(Ḥākim/i.test(text);
}

// Helper: extract tags
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

    // Look for dua title: contains #####
    if (line.includes('#####')) {
      const title = line.replace(/^\*\s*#+\s*/, '').trim();

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

      i++; // Move past title

      // Collect all non-empty content lines until next dua
      const contentLines = [];
      while (i < lines.length && !lines[i].trim().includes('#####')) {
        const trimmed = lines[i].trim();

        // Skip navigation/footer junk
        if (trimmed &&
            !trimmed.includes('[Skip to content]') &&
            !trimmed.includes('No products in the basket') &&
            !trimmed.includes('[Previous]') &&
            !trimmed.includes('Related Articles') &&
            !trimmed.includes('Page load link') &&
            !trimmed.includes('By clicking accept') &&
            !trimmed.includes('[Accept](#)') &&
            !trimmed.includes('[Go to Top](#)') &&
            !trimmed.startsWith('![](')) {
          contentLines.push(trimmed);
        }
        i++;
      }

      // Parse content lines using smart detection
      // Expected order: Arabic -> Translation -> Transliteration -> Virtue

      const arabicLines = [];
      const translationLines = [];
      const transliterationLines = [];
      const virtueLines = [];

      for (let j = 0; j < contentLines.length; j++) {
        const line = contentLines[j];

        if (isArabic(line)) {
          // Arabic text
          arabicLines.push(line);
        } else if (isVirtueText(line)) {
          // Virtue/hadith text - collect rest as virtue
          virtueLines.push(line);
          // Collect all remaining lines as virtue
          for (let k = j + 1; k < contentLines.length; k++) {
            virtueLines.push(contentLines[k]);
          }
          break;
        } else if (isTransliteration(line)) {
          // Transliteration
          transliterationLines.push(line);
        } else {
          // Plain English - likely translation
          // But check if we already have virtue text
          if (virtueLines.length === 0) {
            translationLines.push(line);
          } else {
            virtueLines.push(line);
          }
        }
      }

      dua.arabic = arabicLines.join(' ').trim();
      dua.translation = translationLines.join(' ').trim();
      dua.transliteration = transliterationLines.join(' ').trim();
      dua.virtue = virtueLines.join(' ').trim();

      // Extract reference from virtue
      const refMatch = dua.virtue.match(/\(([^)]*(?:Bukhārī|Muslim|Tirmidhī|Abū Dāwūd|Nasā'ī|Aḥmad|Ibn Mājah|Ḥākim)[^)]*\d+[^)]*)\)/);
      if (refMatch) {
        dua.reference = refMatch[1];
      }

      // Extract repetitions
      const repMatch = dua.virtue.match(/(\d+)\s*times?/i);
      if (repMatch) {
        dua.repetitions = parseInt(repMatch[1]);
      }

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

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

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

// Run
console.log('Starting to process all dua markdown files...\n');
const summary = processAllFiles();

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
  console.log('\nWARNINGS:');
  summary.warnings.forEach(warn => console.log(`  - ${warn}`));
}

console.log('\nDETAILED BREAKDOWN:');
summary.details
  .sort((a, b) => b.duas - a.duas)
  .forEach(item => {
    console.log(`  ${item.file.padEnd(30)} ${item.duas} duas`);
  });

console.log('\n✨ Processing complete!');
