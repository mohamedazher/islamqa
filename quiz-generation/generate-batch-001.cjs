#!/usr/bin/env node

/**
 * Generate Quiz Questions for Batch 001
 *
 * This script generates 100 quiz questions based on the questions in batch-001-input.json
 * Each quiz question will have:
 * - Exact reference from source question
 * - Question text based on the title/answer
 * - 4 options (1 correct, 3 plausible distractors)
 * - Explanation citing Islamic sources
 * - Appropriate difficulty level
 */

const fs = require('fs');
const path = require('path');

// Read batch input
const batchInputPath = path.join(__dirname, 'batches', 'batch-001-input.json');
const batchInput = JSON.parse(fs.readFileSync(batchInputPath, 'utf8'));

console.log(`🎯 Generating ${batchInput.count} quiz questions for Batch ${batchInput.batch}\n`);

/**
 * Helper function to extract text from HTML
 */
function extractText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Helper function to determine difficulty based on content
 */
function determineDifficulty(answer, title) {
  const text = extractText(answer).toLowerCase();
  const titleLower = title.toLowerCase();

  // Easy: Basic rulings (haram/halal/permissible)
  if (titleLower.includes('haram') || titleLower.includes('halal') ||
      titleLower.includes('permissible') || titleLower.includes('allowed')) {
    return 'easy';
  }

  // Hard: Detailed fiqh, conditions, exceptions
  if (text.includes('conditions') || text.includes('except') ||
      text.includes('different views') || text.includes('scholars differ')) {
    return 'hard';
  }

  // Medium: everything else
  return 'medium';
}

/**
 * Generate quiz questions from batch input
 */
function generateQuizQuestions() {
  const quizzes = [];
  const difficultyCount = { easy: 0, medium: 0, hard: 0 };

  batchInput.questions.forEach((question, index) => {
    const reference = question.reference;
    const title = question.title;
    const answer = extractText(question.answer);
    const questionText = extractText(question.question);
    const difficulty = determineDifficulty(question.answer, title);

    difficultyCount[difficulty]++;

    // This is a placeholder - actual quiz questions will be generated manually
    // to ensure accuracy and quality
    const quiz = {
      id: `quiz-${index}`,
      questionText: `PLACEHOLDER: ${title}`,
      options: [
        { id: "a", text: "PLACEHOLDER - Correct answer", isCorrect: true },
        { id: "b", text: "PLACEHOLDER - Wrong option 1", isCorrect: false },
        { id: "c", text: "PLACEHOLDER - Wrong option 2", isCorrect: false },
        { id: "d", text: "PLACEHOLDER - Wrong option 3", isCorrect: false }
      ],
      explanation: `PLACEHOLDER: Explanation for reference ${reference}`,
      tags: question.tags || [],
      difficulty: difficulty,
      reference: reference,
      source: `IslamQA reference ${reference}`,
      type: "multiple-choice",
      category: `category-${question.primary_category}`,
      sourceQuestionId: reference
    };

    quizzes.push(quiz);
  });

  console.log(`📊 Difficulty distribution:`);
  console.log(`   Easy: ${difficultyCount.easy} (${(difficultyCount.easy/100*100).toFixed(0)}%)`);
  console.log(`   Medium: ${difficultyCount.medium} (${(difficultyCount.medium/100*100).toFixed(0)}%)`);
  console.log(`   Hard: ${difficultyCount.hard} (${(difficultyCount.hard/100*100).toFixed(0)}%)`);

  return quizzes;
}

// Generate output structure
const output = {
  version: "1.0.0",
  batch: "001",
  totalQuizzes: batchInput.count,
  quizzes: generateQuizQuestions()
};

// Save to output file
const outputPath = path.join(__dirname, 'batches', 'batch-001-output-placeholder.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✅ Placeholder file created: ${outputPath}`);
console.log(`\n⚠️  Note: This contains placeholders. Actual quiz questions need to be`);
console.log(`   generated manually to ensure accuracy and quality.`);
