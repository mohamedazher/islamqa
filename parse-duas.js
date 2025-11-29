const fs = require('fs');
const path = require('path');

const INPUT_DIR = '/Users/mohamedazher/Halsimplify/islamqa/.dua-markdown/';
const OUTPUT_DIR = '/Users/mohamedazher/Halsimplify/islamqa/public/data/dua/';

// Category ID mapping based on file names
const CATEGORY_MAP = {
  'waking-up': { id: 1, name: 'Waking Up' },
  'morning': { id: 2, name: 'Morning Adhkar' },
  'evening': { id: 3, name: 'Evening Adhkar' },
  'before-sleep': { id: 4, name: 'Before Sleep' },
  'salah': { id: 5, name: 'Salah (Prayer)' },
  'after-salah': { id: 6, name: 'After Salah' },
  'home': { id: 7, name: 'Home' },
  'travel': { id: 8, name: 'Travel' },
  'food-drink': { id: 9, name: 'Food & Drink' },
  'lavatory-wudu': { id: 10, name: 'Lavatory & Wudu' },
  'adhan-masjid': { id: 11, name: 'Adhan & Masjid' },
  'gatherings': { id: 12, name: 'Gatherings' },
  'nature': { id: 13, name: 'Nature & Weather' },
  'clothes': { id: 14, name: 'Clothes' },
  'death': { id: 15, name: 'Death & Condolences' },
  'nightmares': { id: 16, name: 'Nightmares' },
  'istikhara': { id: 17, name: 'Istikhara' },
  'istighfar': { id: 18, name: 'Istighfar (Seeking Forgiveness)' },
  'dhikr-all-times': { id: 19, name: 'Dhikr for All Times' },
  'praises-allah': { id: 20, name: 'Praises of Allah' },
  'names-allah': { id: 21, name: 'Names of Allah' },
  'salawat': { id: 22, name: 'Salawat (Blessings on the Prophet)' },
  'quranic-duas': { id: 23, name: 'Quranic Duas' },
  'sunnah-duas': { id: 24, name: 'Sunnah Duas' },
  'ruqyah-illness': { id: 25, name: 'Ruqyah & Illness' },
  'difficulties': { id: 26, name: 'Difficulties & Hardship' },
  'duas-ummah': { id: 27, name: 'Duas for the Ummah' }
};

// Check if a line contains Arabic characters
function hasArabic(text) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

// Check if a line is transliteration (has special diacritic marks)
function isTransliteration(text) {
  return /[āīūḥṣḍṭẓʿĀĪŪḤṢḌṬẒ]/.test(text);
}

// Parse a single markdown file
function parseMarkdownFile(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const baseFileName = fileName.replace('.md', '');
  const category = CATEGORY_MAP[baseFileName] || { id: baseFileName, name: baseFileName };

  const duas = [];

  // Split content into lines
  const lines = content.split('\n');

  let currentDua = null;
  let currentParagraph = [];
  let inDuaBlock = false;
  let duaOrder = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect start of a new dua (##### heading, possibly with bullet point)
    if (line.match(/^\*?\s*#{5}\s+.+/)) {
      // Save previous dua if exists
      if (currentDua && currentDua.arabic && currentDua.translation) {
        duas.push({
          ...currentDua,
          id: duaOrder,
          category_id: category.id,
          order: duaOrder
        });
        duaOrder++;
      }

      // Start new dua
      const titleMatch = line.match(/^\*?\s*#{5}\s+(.+)$/);
      const title = titleMatch ? titleMatch[1].trim() : '';

      currentDua = {
        title: title,
        title_ar: null,
        arabic: '',
        transliteration: '',
        translation: '',
        virtue: '',
        reference: '',
        repetitions: null,
        tags: []
      };

      currentParagraph = [];
      inDuaBlock = true;

      // Extract repetitions from title
      const repMatch = title.match(/(\d+)\s*(?:times|x)/i);
      if (repMatch) {
        currentDua.repetitions = parseInt(repMatch[1]);
      }

      continue;
    }

    // Skip if not in a dua block
    if (!inDuaBlock || !currentDua) continue;

    // Skip empty lines and metadata
    if (!line || line.startsWith('[') || line.startsWith('*') && !hasArabic(line)) {
      continue;
    }

    // Process content lines
    if (line) {
      // Arabic text
      if (hasArabic(line) && !currentDua.arabic) {
        currentDua.arabic = line;
      }
      // Transliteration
      else if (isTransliteration(line) && !currentDua.transliteration) {
        currentDua.transliteration = line;
      }
      // Translation (English text that's not narration/virtue)
      else if (!currentDua.translation &&
               !line.includes('narrates') &&
               !line.includes('said:') &&
               !line.includes('ﷺ') &&
               !line.includes('(raḍiy') &&
               !line.includes('Bukhārī') &&
               !line.includes('Muslim') &&
               !line.includes('Tirmidhī') &&
               !line.includes('Nasā') &&
               !line.includes('Abū Dāwūd') &&
               /^[A-Z]/.test(line) &&
               !isTransliteration(line)) {
        currentDua.translation = line;
      }
      // Virtue/Reference text
      else if (line.includes('narrates') ||
               line.includes('said:') ||
               line.includes('ﷺ') ||
               line.includes('(raḍiy') ||
               line.includes('Bukhārī') ||
               line.includes('Muslim') ||
               line.includes('Tirmidhī') ||
               line.includes('Nasā') ||
               line.includes('Abū Dāwūd') ||
               line.includes('Ibn') ||
               line.includes('Allah says')) {
        currentDua.virtue += (currentDua.virtue ? ' ' : '') + line;
      }
    }
  }

  // Save last dua
  if (currentDua && currentDua.arabic && currentDua.translation) {
    duas.push({
      ...currentDua,
      id: duaOrder,
      category_id: category.id,
      order: duaOrder
    });
  }

  // Extract references and add tags
  duas.forEach(dua => {
    // Extract reference
    const refMatch = dua.virtue.match(/\(([^)]*(?:Bukhārī|Muslim|Tirmidhī|Nasā|Abū Dāwūd|Ibn)[^)]*)\)(?!.*\((?:Bukhārī|Muslim|Tirmidhī|Nasā|Abū Dāwūd|Ibn))/);
    if (refMatch) {
      dua.reference = refMatch[1];
    }

    // Add tags
    const tags = [];
    const titleLower = dua.title.toLowerCase();
    const categoryLower = category.name.toLowerCase();

    if (titleLower.includes('morning') || categoryLower.includes('morning')) tags.push('morning');
    if (titleLower.includes('evening') || categoryLower.includes('evening')) tags.push('evening');
    if (titleLower.includes('waking') || titleLower.includes('wake')) tags.push('waking');
    if (titleLower.includes('sleep') || categoryLower.includes('sleep')) tags.push('sleep');
    if (titleLower.includes('protection') || dua.virtue.toLowerCase().includes('protect')) tags.push('protection');
    if (dua.virtue.toLowerCase().includes('forgive') || titleLower.includes('forgive')) tags.push('forgiveness');
    if (categoryLower.includes('salah') || categoryLower.includes('prayer')) tags.push('salah');
    if (categoryLower.includes('travel')) tags.push('travel');
    if (categoryLower.includes('food') || categoryLower.includes('drink')) tags.push('food');
    if (titleLower.includes('home') || categoryLower.includes('home')) tags.push('home');

    dua.tags = tags.length > 0 ? tags : ['general'];

    // Clean up null/empty fields
    if (!dua.transliteration) dua.transliteration = null;
    if (!dua.virtue) dua.virtue = null;
    if (!dua.reference) dua.reference = null;
  });

  return {
    category_id: category.id,
    category_name: category.name,
    duas: duas
  };
}

// Main execution
function main() {
  console.log('Starting dua parsing...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read all markdown files
  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  console.log(`Found ${files.length} markdown files\n`);

  let totalDuas = 0;
  let processedFiles = 0;
  let emptyFiles = [];
  const fileSummaries = [];

  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    const stats = fs.statSync(filePath);

    // Skip very small files (likely empty or errors)
    if (stats.size < 50) {
      console.log(`⚠️  Skipping ${file} (too small: ${stats.size} bytes)`);
      emptyFiles.push(file);
      continue;
    }

    try {
      console.log(`Processing: ${file}...`);
      const result = parseMarkdownFile(filePath, file);

      if (result.duas.length === 0) {
        console.log(`   ⚠️  No duas extracted from ${file}`);
        emptyFiles.push(file);
        continue;
      }

      // Write JSON file
      const outputFileName = file.replace('.md', '.json');
      const outputPath = path.join(OUTPUT_DIR, outputFileName);
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

      console.log(`   ✅ Extracted ${result.duas.length} duas → ${outputFileName}`);

      totalDuas += result.duas.length;
      processedFiles++;

      fileSummaries.push({
        file: file,
        category: result.category_name,
        duaCount: result.duas.length
      });

    } catch (error) {
      console.log(`   ❌ Error processing ${file}: ${error.message}`);
      emptyFiles.push(file);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('PARSING COMPLETE');
  console.log('='.repeat(70));
  console.log(`Total files processed: ${processedFiles}/${files.length}`);
  console.log(`Total duas extracted: ${totalDuas}`);
  console.log(`Empty/error files: ${emptyFiles.length}`);

  if (emptyFiles.length > 0) {
    console.log('\nFiles with issues:');
    emptyFiles.forEach(f => console.log(`  - ${f}`));
  }

  console.log('\nFirst 10 files with dua counts:');
  fileSummaries.slice(0, 10).forEach(s => {
    console.log(`  ${s.file.padEnd(30)} | ${s.category.padEnd(30)} | ${s.duaCount} duas`);
  });

  if (fileSummaries.length > 10) {
    console.log(`\n  ... and ${fileSummaries.length - 10} more files`);
  }

  console.log('\n✅ All JSON files written to:', OUTPUT_DIR);
  console.log('\n📊 Total statistics:');
  console.log(`   - Processed: ${processedFiles} files`);
  console.log(`   - Extracted: ${totalDuas} duas`);
  console.log(`   - Average: ${(totalDuas / processedFiles).toFixed(1)} duas per file`);
}

// Run the script
main();
