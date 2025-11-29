const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = '/Users/mohamedazher/Halsimplify/islamqa/public/data/dua/';

console.log('\n=== DUA PARSING SUMMARY ===\n');

const files = fs.readdirSync(OUTPUT_DIR)
  .filter(f => f.endsWith('.json'))
  .filter(f => !['categories.json', 'difficulties.json', 'duas-ummah.json'].includes(f))
  .sort();

let totalDuas = 0;
const summary = [];

files.forEach(file => {
  const filePath = path.join(OUTPUT_DIR, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const duaCount = data.duas ? data.duas.length : 0;
    totalDuas += duaCount;

    summary.push({
      file: file.replace('.json', ''),
      category: data.category_name || 'Unknown',
      count: duaCount
    });
  } catch (error) {
    console.error(`Error reading ${file}:`, error.message);
  }
});

console.log('File Summary (sorted by category):');
console.log('-'.repeat(80));

summary.forEach(s => {
  console.log(`${s.file.padEnd(25)} | ${s.category.padEnd(35)} | ${s.count} duas`);
});

console.log('-'.repeat(80));
console.log(`\nTOTAL FILES: ${summary.length}`);
console.log(`TOTAL DUAS: ${totalDuas}`);
console.log(`AVERAGE: ${(totalDuas / summary.length).toFixed(1)} duas per file`);

// Top 5 categories by dua count
const topCategories = [...summary].sort((a, b) => b.count - a.count).slice(0, 5);
console.log('\nTop 5 Categories by Dua Count:');
topCategories.forEach((s, i) => {
  console.log(`${i + 1}. ${s.category} - ${s.count} duas`);
});

console.log('\n✅ All parsing complete!\n');
