const fs = require('fs');
const path = require('path');

const INPUT_DIR = '/Users/mohamedazher/Halsimplify/islamqa/.dua-markdown/';
const OUTPUT_DIR = '/Users/mohamedazher/Halsimplify/islamqa/public/data/dua/';

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

function isArabic(text) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

function hasTransliterationChars(text) {
  return /[āīūḍṣṭḥḍẓḍḥḍẓḍḍāīūḍṣṭḥḍẓḍḥḍẓḍḍĀĪŪḌṢṬḤḌẒḌḤḌẒḌḌʿ]/.test(text);
}

function isVirtueMarker(text) {
  return /narrates|narrated|said:|reported|Messenger of Allah|Prophet|raḍiy Allāhu|ʿalayhis-salām|ﷺ|\(Bukhārī|\(Muslim|\(Tirmidhī|\(Abū Dāwūd|\(Nasā'ī|\(Aḥmad|\(Ibn Mājah|\(Ḥākim/i.test(text);
}

function extractTags(title, categoryName) {
  const tags = [categoryName];
  const lower = title.toLowerCase();

  if (lower.includes('morning') || lower.includes('fajr')) tags.push('Morning');
  if (lower.includes('evening') || lower.includes('maghrib')) tags.push('Evening');
  if (lower.includes('night') || lower.includes('sleep')) tags.push('Night');
  if (lower.includes('waking') || lower.includes('wake')) tags.push('Waking');
  if (lower.includes('protection') || lower.includes('refuge')) tags.push('Protection');
  if (lower.includes('forgiveness') || lower.includes('istighfar')) tags.push('Forgiveness');
  if (lower.includes('surah') || lower.includes('ayat')) tags.push('Quran');
  if (lower.includes('prophet') || lower.includes('salawat')) tags.push('Prophet');

  return [...new Set(tags)];
}

function parseMarkdownFile(filePath, categoryInfo) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const duas = [];
  let duaCounter = 1;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

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

      i++;

      // Collect content lines
      const contentLines = [];
      while (i < lines.length && !lines[i].trim().includes('#####')) {
        const trimmed = lines[i].trim();

        if (trimmed &&
            !trimmed.includes('[Skip to content]') &&
            !trimmed.includes('No products in the basket') &&
            !trimmed.includes('[Previous]') &&
            !trimmed.includes('Related Articles') &&
            !trimmed.includes('Page load link') &&
            !trimmed.includes('By clicking accept') &&
            !trimmed.includes('[Accept](#)') &&
            !trimmed.includes('[Go to Top](#)') &&
            !trimmed.startsWith('![](') &&
            !trimmed.startsWith('---')) {
          contentLines.push(trimmed);
        }
        i++;
      }

      // Parse with state machine
      // States: 0=waiting_for_arabic, 1=got_arabic, 2=got_translation, 3=got_transliteration, 4=in_virtue
      let state = 0;
      let arabicLines = [];
      let translationLines = [];
      let transliterationLines = [];
      let virtueLines = [];

      for (const line of contentLines) {
        if (state === 0 || state === 1) {
          // Looking for Arabic
          if (isArabic(line)) {
            arabicLines.push(line);
            state = 1;
          } else if (state === 1) {
            // After Arabic, first non-Arabic is translation
            if (isVirtueMarker(line)) {
              // Skip to virtue
              virtueLines.push(line);
              state = 4;
            } else if (hasTransliterationChars(line)) {
              // This is transliteration (no translation for this dua)
              transliterationLines.push(line);
              state = 3;
            } else {
              // This is translation
              translationLines.push(line);
              state = 2;
            }
          }
        } else if (state === 2) {
          // After translation, looking for transliteration or virtue
          if (isVirtueMarker(line)) {
            virtueLines.push(line);
            state = 4;
          } else if (hasTransliterationChars(line)) {
            transliterationLines.push(line);
            state = 3;
          } else {
            // More translation text
            translationLines.push(line);
          }
        } else if (state === 3) {
          // After transliteration, looking for virtue
          if (isVirtueMarker(line)) {
            virtueLines.push(line);
            state = 4;
          } else if (hasTransliterationChars(line)) {
            // More transliteration
            transliterationLines.push(line);
          } else {
            // This might be virtue without clear markers
            virtueLines.push(line);
            state = 4;
          }
        } else if (state === 4) {
          // Collecting virtue
          virtueLines.push(line);
        }
      }

      dua.arabic = arabicLines.join(' ').trim();
      dua.translation = translationLines.join(' ').trim();
      dua.transliteration = transliterationLines.join(' ').trim();
      dua.virtue = virtueLines.join(' ').trim();

      // Extract reference
      const refMatch = dua.virtue.match(/\(([^)]*(?:Bukhārī|Muslim|Tirmidhī|Abū Dāwūd|Nasā'ī|Aḥmad|Ibn Mājah|Ḥākim|Bayhaqī)[^)]*\d+[^)]*)\)/);
      if (refMatch) {
        dua.reference = refMatch[1];
      }

      // Extract repetitions
      const repMatch = dua.virtue.match(/(\d+)\s*times?/i);
      if (repMatch) {
        dua.repetitions = parseInt(repMatch[1]);
      }

      // Extract Arabic title
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

  console.log(`Processing ${files.length} markdown files...\n`);

  files.forEach(filename => {
    const categoryInfo = CATEGORY_MAPPING[filename];

    if (!categoryInfo) {
      summary.warnings.push(`No category mapping for ${filename}`);
      console.log(`⚠️  Skipping ${filename}`);
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
      summary.details.push({ file: filename, duas: duas.length });

      console.log(`✅ ${filename.padEnd(30)} (${duas.length} duas)`);

      if (duas.length === 0) {
        summary.warnings.push(`${filename} has 0 duas`);
      }

    } catch (error) {
      summary.errors.push(`${filename}: ${error.message}`);
      console.log(`❌ ${filename}: ${error.message}`);
    }
  });

  return summary;
}

const summary = processAllFiles();

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`Files Processed: ${summary.filesProcessed}`);
console.log(`Total Duas: ${summary.totalDuas}`);
console.log(`Avg/file: ${(summary.totalDuas / summary.filesProcessed).toFixed(1)}`);
console.log(`Errors: ${summary.errors.length}`);
console.log(`Warnings: ${summary.warnings.length}\n`);

if (summary.errors.length > 0) {
  console.log('ERRORS:');
  summary.errors.forEach(e => console.log(`  - ${e}`));
  console.log('');
}

if (summary.warnings.length > 0) {
  console.log('WARNINGS:');
  summary.warnings.forEach(w => console.log(`  - ${w}`));
  console.log('');
}

console.log('TOP 10 FILES BY DUA COUNT:');
summary.details
  .sort((a, b) => b.duas - a.duas)
  .slice(0, 10)
  .forEach(item => console.log(`  ${item.file.padEnd(30)} ${item.duas} duas`));

console.log('\n✨ Complete! All JSON files written to:');
console.log(`   ${OUTPUT_DIR}\n`);
