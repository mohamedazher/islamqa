#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const METADATA_PATH = path.join(__dirname, 'quiz-metadata.json');

// Read metadata
const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));

// Collect all references from all batches
const allReferences = new Set();
for (const batch of metadata.batches) {
  for (const ref of batch.references) {
    allReferences.add(ref);
  }
}

// Update metadata
metadata.processedQuestions = Array.from(allReferences);
metadata.stats.totalQuestions = allReferences.size;
metadata.stats.generated = allReferences.size;
metadata.stats.coverage = 100;

// Save
fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));

console.log(`✅ Updated metadata with ${allReferences.size} processed questions`);
