#!/usr/bin/env node

/**
 * Process batch input and generate quiz questions
 * This script helps structure the quiz generation process
 */

const fs = require('fs');
const path = require('path');

// Read batch input
const batchInputPath = path.join(__dirname, 'batches', 'batch-001-input.json');
const batchInput = JSON.parse(fs.readFileSync(batchInputPath, 'utf8'));

console.log(`📚 Batch ${batchInput.batch}: ${batchInput.count} questions`);
console.log(`📅 Created: ${batchInput.created}`);
console.log('');

// Display first 5 questions for preview
console.log('📝 First 5 questions:');
batchInput.questions.slice(0, 5).forEach((q, i) => {
  console.log(`\n${i + 1}. Reference: ${q.reference}`);
  console.log(`   Title: ${q.title}`);
  console.log(`   Category: ${q.primary_category}`);
  console.log(`   Tags: ${q.tags.join(', ')}`);
});

console.log('\n' + '='.repeat(80));
console.log('📊 Statistics:');
console.log(`Total questions: ${batchInput.count}`);
console.log(`References: ${batchInput.questions.map(q => q.reference).join(', ')}`);

// Create a template for quiz output
const quizTemplate = {
  version: "1.0.0",
  batch: "001",
  totalQuizzes: batchInput.count,
  quizzes: []
};

// Save template
const templatePath = path.join(__dirname, 'batches', 'batch-001-template.json');
fs.writeFileSync(templatePath, JSON.stringify(quizTemplate, null, 2));
console.log(`\n✅ Template created: ${templatePath}`);
