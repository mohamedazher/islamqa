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

// Helper function to extract tags from title
function extractTags(title, categoryName) {
  const tags = [categoryName];

  // Add common tags based on keywords
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('morning') || lowerTitle.includes('fajr')) tags.push('Morning');
  if (lowerTitle.includes('evening') || lowerTitle.includes('maghrib')) tags.push('Evening');
  if (lowerTitle.includes('night') || lowerTitle.includes('sleep')) tags.push('Night');
  if (lowerTitle.includes('waking') || lowerTitle.includes('wake')) tags.push('Waking');
  if (lowerTitle.includes('protection') || lowerTitle.includes('refuge')) tags.push('Protection');
  if (lowerTitle.includes('forgiveness') || lowerTitle.includes('istighfar')) tags.push('Forgiveness');
  if (lowerTitle.includes('surah') || lowerTitle.includes('ayat')) tags.push('Quran');
  if (lowerTitle.includes('prophet') || lowerTitle.includes('salawat')) tags.push('Prophet');

  return [...new Set(tags)]; // Remove duplicates
}

// Parse a single markdown file
function parseMarkdownFile(filePath, categoryInfo) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const duas = [];
  let currentDua = null;
  let currentSection = null;
  let duaCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect dua title (##### heading)
    if (line.startsWith('#####')) {
      // Save previous dua if exists
      if (currentDua && currentDua.title) {
        currentDua.order = duaCounter - 1;
        duas.push(currentDua);
      }

      // Start new dua
      const title = line.replace(/^#+\s*/, '').trim();
      currentDua = {
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
      currentSection = 'started';
      continue;
    }

    // Skip empty lines
    if (!line || !currentDua) continue;

    // Skip navigation/footer content
    if (line.includes('[Skip to content]') ||
        line.includes('No products in the basket') ||
        line.includes('[Previous]') ||
        line.includes('Related Articles') ||
        line.includes('Page load link') ||
        line.startsWith('![](')) {
      continue;
    }

    // Detect sections based on content
    if (currentSection === 'started') {
      // First non-empty line after title is usually Arabic
      if (isArabic(line)) {
        currentDua.arabic = line;
        currentSection = 'arabic';
      }
    } else if (currentSection === 'arabic') {
      // After Arabic, translation comes (English sentence)
      if (!isArabic(line) && !line.match(/^[A-Z][a-z]+.*[a-z\u0101-\u017F\u1E00-\u1EFF].*$/)) {
        // This is the translation
        currentDua.translation = line;
        currentSection = 'translation';
      } else if (isArabic(line)) {
        // Continue collecting Arabic (multi-line)
        currentDua.arabic += ' ' + line;
      }
    } else if (currentSection === 'translation') {
      // After translation comes transliteration (has special chars)
      if (line.match(/[āīūḍṣṭḥḍẓḍḥḍẓḍḍāīūḍṣṭḥḍẓḍḥḍẓḍḍāīūḍṣṭḥḍẓḍḥḍẓḍḍĀĪŪḌṢṬḤḌẒḌḤḌẒḌḌʿ]/i) ||
          (line.match(/^[A-Z][a-z]+/) && line.includes('-'))) {
        currentDua.transliteration = line;
        currentSection = 'transliteration';
      } else if (!isArabic(line)) {
        // Multi-line translation
        currentDua.translation += ' ' + line;
      }
    } else if (currentSection === 'transliteration') {
      // After transliteration comes virtue/reference
      if (!line.match(/[āīūḍṣṭḥḍẓḍḥḍẓḍḍāīūḍṣṭḥḍẓḍḥḍẓḍḍāīūḍṣṭḥḍẓḍḥḍẓḍḍĀĪŪḌṢṬḤḌẒḌḤḌẒḌḌʿ]/i) ||
          line.includes('narrates') ||
          line.includes('said') ||
          line.includes('(')) {
        currentDua.virtue = line;
        currentSection = 'virtue';
      } else {
        // Multi-line transliteration
        currentDua.transliteration += ' ' + line;
      }
    } else if (currentSection === 'virtue') {
      // Continue collecting virtue text until next dua
      if (!line.startsWith('#')) {
        currentDua.virtue += ' ' + line;

        // Extract reference if found
        const refMatch = line.match(/\(([^)]+\d+[^)]*)\)/);
        if (refMatch && !currentDua.reference) {
          currentDua.reference = refMatch[1];
        }

        // Extract repetitions
        const repMatch = line.match(/(\d+)\s*times?/i);
        if (repMatch) {
          currentDua.repetitions = parseInt(repMatch[1]);
        }
      }
    }
  }

  // Add last dua
  if (currentDua && currentDua.title) {
    currentDua.order = duaCounter - 1;
    duas.push(currentDua);
  }

  // Clean up text fields
  duas.forEach(dua => {
    dua.arabic = dua.arabic.trim();
    dua.transliteration = dua.transliteration.trim();
    dua.translation = dua.translation.trim();
    dua.virtue = dua.virtue.trim();

    // Extract Arabic title if present in title
    if (dua.title && isArabic(dua.title)) {
      const parts = dua.title.split(/\s+[-–—]\s+/);
      if (parts.length > 1) {
        dua.title_ar = parts.find(p => isArabic(p)) || null;
        dua.title = parts.find(p => !isArabic(p)) || dua.title;
      }
    }
  });

  return duas;
}

// Main processing function
function processAllFiles() {
  const summary = {
    filesProcessed: 0,
    totalDuas: 0,
    errors: [],
    warnings: []
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

      console.log(`✅ ${filename} -> ${outputFilename} (${duas.length} duas)`);

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
console.log('\n' + '='.repeat(60));
console.log('PROCESSING SUMMARY');
console.log('='.repeat(60));
console.log(`Files Processed: ${summary.filesProcessed}`);
console.log(`Total Duas Extracted: ${summary.totalDuas}`);
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

console.log('\n✨ Processing complete!');
