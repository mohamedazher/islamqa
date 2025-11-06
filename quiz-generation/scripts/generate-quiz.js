#!/usr/bin/env node

/**
 * Quiz Generation Helper Script
 *
 * Modes:
 * - select: Select random unprocessed source questions
 * - validate: Validate generated quiz JSON
 * - merge: Merge generated quizzes into main database
 * - stats: Show processing statistics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths
const PATHS = {
  sourceQuestions: path.join(__dirname, '../../www-old-backup/js/questions1.js'),
  sourceAnswers: path.join(__dirname, '../../www-old-backup/js/answers1.js'),
  quizQuestions: path.join(__dirname, '../quiz-questions.json'),
  quizMetadata: path.join(__dirname, '../quiz-metadata.json'),
  batchesDir: path.join(__dirname, '../batches')
};

// Ensure directories exist
if (!fs.existsSync(PATHS.batchesDir)) {
  fs.mkdirSync(PATHS.batchesDir, { recursive: true });
}

/**
 * Load source questions from JS file
 */
function loadSourceQuestions(part = 1) {
  const filePath = path.join(__dirname, `../../www-old-backup/js/questions${part}.js`);
  const content = fs.readFileSync(filePath, 'utf8');
  const jsonMatch = content.match(/\[[\s\S]*\]/m);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return [];
}

/**
 * Load source answers from JS file
 */
function loadSourceAnswers(part = 1) {
  const filePath = path.join(__dirname, `../../www-old-backup/js/answers${part}.js`);
  const content = fs.readFileSync(filePath, 'utf8');
  const jsonMatch = content.match(/\[[\s\S]*\]/m);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return [];
}

/**
 * Load or initialize quiz metadata
 */
function loadMetadata() {
  if (fs.existsSync(PATHS.quizMetadata)) {
    return JSON.parse(fs.readFileSync(PATHS.quizMetadata, 'utf8'));
  }

  // Initialize empty metadata
  return {
    version: '1.0.0',
    lastProcessed: new Date().toISOString(),
    processedQuestions: [],
    processingStats: {
      totalProcessed: 0,
      successful: 0,
      failed: 0
    }
  };
}

/**
 * Save metadata
 */
function saveMetadata(metadata) {
  metadata.lastProcessed = new Date().toISOString();
  fs.writeFileSync(PATHS.quizMetadata, JSON.stringify(metadata, null, 2));
  console.log('✅ Metadata saved');
}

/**
 * Load or initialize quiz questions database
 */
function loadQuizDatabase() {
  if (fs.existsSync(PATHS.quizQuestions)) {
    return JSON.parse(fs.readFileSync(PATHS.quizQuestions, 'utf8'));
  }

  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    totalQuizzes: 0,
    quizzes: []
  };
}

/**
 * Save quiz database
 */
function saveQuizDatabase(database) {
  database.lastUpdated = new Date().toISOString();
  database.totalQuizzes = database.quizzes.length;
  fs.writeFileSync(PATHS.quizQuestions, JSON.stringify(database, null, 2));
  console.log(`✅ Quiz database saved (${database.totalQuizzes} quizzes)`);
}

/**
 * MODE: Select random unprocessed questions
 */
function selectQuestions(count = 50) {
  console.log(`\n📋 Selecting ${count} random unprocessed questions...\n`);

  // Load all questions from parts 1-4
  let allQuestions = [];
  for (let i = 1; i <= 4; i++) {
    allQuestions = allQuestions.concat(loadSourceQuestions(i));
  }

  // Load all answers from parts 1-12
  let allAnswers = [];
  for (let i = 1; i <= 12; i++) {
    allAnswers = allAnswers.concat(loadSourceAnswers(i));
  }

  // Create answer map
  const answerMap = {};
  allAnswers.forEach(a => {
    answerMap[a.question_id] = a.answers;
  });

  console.log(`Found ${allQuestions.length} source questions`);

  // Load metadata to check processed questions
  const metadata = loadMetadata();
  const processedIds = new Set(metadata.processedQuestions.map(p => p.questionId));

  // Filter unprocessed questions
  const unprocessed = allQuestions.filter(q => !processedIds.has(parseInt(q.id)));
  console.log(`${unprocessed.length} unprocessed questions available`);

  // Shuffle and select
  const shuffled = unprocessed.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  // Prepare batch with answers
  const batch = {
    batchId: `batch-${Date.now()}`,
    createdDate: new Date().toISOString(),
    sourceQuestions: selected.map(q => ({
      id: parseInt(q.id),
      question: q.question,
      question_full: q.question_full,
      question_no: q.question_no,
      category_id: q.category_id,
      answers: answerMap[q.id] || ''
    }))
  };

  // Save batch file
  const batchPath = path.join(PATHS.batchesDir, `${batch.batchId}.json`);
  fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2));

  console.log(`\n✅ Batch created: ${batchPath}`);
  console.log(`\nNext steps:`);
  console.log(`1. Open the batch file`);
  console.log(`2. Use the prompt from generate-quiz-prompt.md with Claude`);
  console.log(`3. Save Claude's output as ${batch.batchId}-output.json`);
  console.log(`4. Run: node generate-quiz.js --mode=merge --input=${batch.batchId}-output.json\n`);

  return batch.batchId;
}

/**
 * MODE: Validate generated quiz JSON
 */
function validateQuizzes(inputPath) {
  console.log(`\n🔍 Validating ${inputPath}...\n`);

  const content = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  if (!content.generatedQuizzes || !Array.isArray(content.generatedQuizzes)) {
    console.error('❌ Invalid format: missing generatedQuizzes array');
    return false;
  }

  const errors = [];
  content.generatedQuizzes.forEach((quiz, idx) => {
    // Check required fields
    if (!quiz.id) errors.push(`Quiz ${idx}: missing id`);
    if (!quiz.sourceQuestionId) errors.push(`Quiz ${idx}: missing sourceQuestionId`);
    if (!quiz.questionText) errors.push(`Quiz ${idx}: missing questionText`);
    if (!quiz.options || quiz.options.length < 2) errors.push(`Quiz ${idx}: need at least 2 options`);

    // Check options
    const correctCount = quiz.options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      errors.push(`Quiz ${idx}: must have exactly 1 correct option (found ${correctCount})`);
    }

    // Check option ids
    quiz.options.forEach((opt, optIdx) => {
      if (!opt.id) errors.push(`Quiz ${idx}, option ${optIdx}: missing id`);
      if (!opt.text) errors.push(`Quiz ${idx}, option ${optIdx}: missing text`);
      if (opt.isCorrect === undefined) errors.push(`Quiz ${idx}, option ${optIdx}: missing isCorrect`);
    });
  });

  if (errors.length > 0) {
    console.error('❌ Validation failed:\n');
    errors.forEach(e => console.error(`  - ${e}`));
    return false;
  }

  console.log(`✅ Validation passed: ${content.generatedQuizzes.length} quizzes`);
  return true;
}

/**
 * MODE: Merge generated quizzes into main database
 */
function mergeQuizzes(inputPath) {
  console.log(`\n🔀 Merging quizzes from ${inputPath}...\n`);

  // Validate first
  if (!validateQuizzes(inputPath)) {
    console.error('❌ Merge aborted due to validation errors');
    return;
  }

  const generated = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const database = loadQuizDatabase();
  const metadata = loadMetadata();

  let added = 0;
  let skipped = 0;

  generated.generatedQuizzes.forEach(quiz => {
    // Check if already exists
    const exists = database.quizzes.some(q => q.id === quiz.id);
    if (exists) {
      console.log(`⚠️  Skipping duplicate: ${quiz.id}`);
      skipped++;
      return;
    }

    // Add to database
    database.quizzes.push(quiz);
    added++;

    // Update metadata
    metadata.processedQuestions.push({
      questionId: quiz.sourceQuestionId,
      processedDate: new Date().toISOString().split('T')[0],
      quizId: quiz.id,
      status: 'completed'
    });
  });

  // Update stats
  metadata.processingStats.totalProcessed += added;
  metadata.processingStats.successful += added;

  // Save
  saveQuizDatabase(database);
  saveMetadata(metadata);

  console.log(`\n✅ Merge complete:`);
  console.log(`   Added: ${added}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total quizzes: ${database.quizzes.length}\n`);
}

/**
 * MODE: Show statistics
 */
function showStats() {
  console.log(`\n📊 Quiz Generation Statistics\n`);

  const metadata = loadMetadata();
  const database = loadQuizDatabase();

  // Load source questions count
  let totalSourceQuestions = 0;
  for (let i = 1; i <= 4; i++) {
    totalSourceQuestions += loadSourceQuestions(i).length;
  }

  console.log(`Source Questions:  ${totalSourceQuestions}`);
  console.log(`Processed:         ${metadata.processingStats.totalProcessed}`);
  console.log(`Remaining:         ${totalSourceQuestions - metadata.processingStats.totalProcessed}`);
  console.log(`Success Rate:      ${metadata.processingStats.totalProcessed > 0 ? Math.round((metadata.processingStats.successful / metadata.processingStats.totalProcessed) * 100) : 0}%`);
  console.log(`\nCurrent Quiz DB:   ${database.quizzes.length} quizzes`);
  console.log(`Last Updated:      ${database.lastUpdated}`);
  console.log();
}

// CLI
const args = process.argv.slice(2);
const mode = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'help';
const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 50;
const input = args.find(a => a.startsWith('--input='))?.split('=')[1];

switch (mode) {
  case 'select':
    selectQuestions(count);
    break;

  case 'validate':
    if (!input) {
      console.error('❌ --input required for validate mode');
      process.exit(1);
    }
    validateQuizzes(path.join(PATHS.batchesDir, input));
    break;

  case 'merge':
    if (!input) {
      console.error('❌ --input required for merge mode');
      process.exit(1);
    }
    mergeQuizzes(path.join(PATHS.batchesDir, input));
    break;

  case 'stats':
    showStats();
    break;

  default:
    console.log(`
Quiz Generation Helper Script

Usage:
  node generate-quiz.js --mode=<mode> [options]

Modes:
  --mode=select   Select random unprocessed questions
                  Options: --count=<number> (default: 50)

  --mode=validate Validate generated quiz JSON
                  Options: --input=<filename>

  --mode=merge    Merge generated quizzes into main database
                  Options: --input=<filename>

  --mode=stats    Show processing statistics

Examples:
  node generate-quiz.js --mode=select --count=100
  node generate-quiz.js --mode=validate --input=batch-123-output.json
  node generate-quiz.js --mode=merge --input=batch-123-output.json
  node generate-quiz.js --mode=stats
    `);
}
