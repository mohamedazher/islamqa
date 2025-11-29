const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = '/Users/mohamedazher/Halsimplify/islamqa/public/data/dua/';

console.log('\n=== DUA DATA VALIDATION ===\n');

const files = fs.readdirSync(OUTPUT_DIR)
  .filter(f => f.endsWith('.json'))
  .filter(f => !['categories.json', 'difficulties.json', 'duas-ummah.json', 'index.json'].includes(f))
  .sort();

let totalDuas = 0;
let totalWithArabic = 0;
let totalWithTransliteration = 0;
let totalWithTranslation = 0;
let totalWithVirtue = 0;
let totalWithReference = 0;
const issues = [];

files.forEach(file => {
  const filePath = path.join(OUTPUT_DIR, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!data.duas || data.duas.length === 0) {
      issues.push(`${file}: No duas found`);
      return;
    }

    data.duas.forEach((dua, idx) => {
      totalDuas++;

      // Check required fields
      if (!dua.arabic || dua.arabic.trim() === '') {
        issues.push(`${file} - Dua #${idx + 1}: Missing Arabic text`);
      } else {
        totalWithArabic++;
      }

      if (!dua.translation || dua.translation.trim() === '') {
        issues.push(`${file} - Dua #${idx + 1}: Missing translation`);
      } else {
        totalWithTranslation++;
      }

      // Check optional but important fields
      if (dua.transliteration && dua.transliteration.trim() !== '') {
        totalWithTransliteration++;
      }

      if (dua.virtue && dua.virtue.trim() !== '') {
        totalWithVirtue++;
      }

      if (dua.reference && dua.reference.trim() !== '') {
        totalWithReference++;
      }

      // Validate Arabic text contains Arabic characters
      if (dua.arabic && !/[\u0600-\u06FF]/.test(dua.arabic)) {
        issues.push(`${file} - Dua #${idx + 1}: Arabic field doesn't contain Arabic text`);
      }

      // Check for required properties
      if (!dua.id) issues.push(`${file} - Dua #${idx + 1}: Missing ID`);
      if (!dua.title) issues.push(`${file} - Dua #${idx + 1}: Missing title`);
      if (!dua.category_id) issues.push(`${file} - Dua #${idx + 1}: Missing category_id`);
      if (!dua.order) issues.push(`${file} - Dua #${idx + 1}: Missing order`);
      if (!dua.tags || dua.tags.length === 0) issues.push(`${file} - Dua #${idx + 1}: Missing tags`);
    });

  } catch (error) {
    issues.push(`${file}: JSON parse error - ${error.message}`);
  }
});

console.log('Data Quality Report:');
console.log('-'.repeat(60));
console.log(`Total Duas Validated: ${totalDuas}`);
console.log(`\nField Coverage:`);
console.log(`  Arabic Text:      ${totalWithArabic}/${totalDuas} (${(totalWithArabic/totalDuas*100).toFixed(1)}%)`);
console.log(`  Translation:      ${totalWithTranslation}/${totalDuas} (${(totalWithTranslation/totalDuas*100).toFixed(1)}%)`);
console.log(`  Transliteration:  ${totalWithTransliteration}/${totalDuas} (${(totalWithTransliteration/totalDuas*100).toFixed(1)}%)`);
console.log(`  Virtue/Hadith:    ${totalWithVirtue}/${totalDuas} (${(totalWithVirtue/totalDuas*100).toFixed(1)}%)`);
console.log(`  Reference:        ${totalWithReference}/${totalDuas} (${(totalWithReference/totalDuas*100).toFixed(1)}%)`);

if (issues.length > 0) {
  console.log(`\n⚠️  Issues Found: ${issues.length}`);
  console.log('-'.repeat(60));
  issues.forEach(issue => console.log(`  - ${issue}`));
} else {
  console.log('\n✅ No issues found! All data is valid.');
}

console.log('\n' + '='.repeat(60));
console.log('VALIDATION COMPLETE');
console.log('='.repeat(60) + '\n');
