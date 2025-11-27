const fs = require('fs');
const path = require('path');

// Create output structure
const output = {
  metadata: {
    generated_at: new Date().toISOString(),
    model: "claude-sonnet-4-5-20250929",
    version: 1,
    total_questions: 0,
    batches_merged: 20,
    total_summaries: 0
  },
  summaries: {}
};

// Merge all 20 batch files
let totalQuestions = 0;
for (let i = 1; i <= 20; i++) {
  const batchNum = String(i).padStart(3, '0');
  const filepath = path.join(__dirname, '../public/data/summaries/batch_' + batchNum + '.json');

  try {
    const batchData = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    // Merge summaries
    Object.assign(output.summaries, batchData.summaries);

    totalQuestions += batchData.count;
    console.log('✓ Batch ' + i + ': ' + batchData.count + ' questions merged');
  } catch (err) {
    console.error('✗ Failed to merge batch ' + i + ': ' + err.message);
    process.exit(1);
  }
}

output.metadata.total_questions = totalQuestions;
output.metadata.total_summaries = Object.keys(output.summaries).length;

// Write merged file
const outputPath = path.join(__dirname, '../public/data/ai_summaries.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('\n✓ Merge complete!');
console.log('  Total questions merged: ' + totalQuestions);
console.log('  Total summaries in output: ' + output.metadata.total_summaries);
console.log('  Output file: ' + outputPath);
console.log('  File size: ' + (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2) + ' MB');
