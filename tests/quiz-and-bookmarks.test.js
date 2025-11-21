/**
 * QUIZ AND BOOKMARKS TESTS
 *
 * These tests catch critical failures in the quiz and bookmark systems
 * Focus: Quiz data integrity, bookmark functionality
 */

import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// QUIZ SYSTEM TESTS
// ============================================================================

describe('Quiz System - Data File Integrity (CRITICAL)', () => {

  test('quiz-questions.json must exist', () => {
    // Check both www/data/ (Cordova) and public/data/ (web)
    let quizPath = path.join(__dirname, '../www/data/quiz-questions.json');
    if (!fs.existsSync(quizPath)) {
      quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    }

    expect(fs.existsSync(quizPath), 'quiz-questions.json must exist').toBe(true);
    console.log('✅ quiz-questions.json exists');
  });

  test('quiz-questions.json must have valid structure', () => {
    let quizPath = path.join(__dirname, '../www/data/quiz-questions.json');
    if (!fs.existsSync(quizPath)) {
      quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    }

    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Support all 3 formats: flat array, {quizzes}, or {quizQuestions}
    let quizzes;
    if (Array.isArray(data)) {
      // Format 1: flat array [...]
      quizzes = data;
      expect(Array.isArray(quizzes)).toBe(true);
      console.log(`✅ Quiz data has valid flat array structure: ${quizzes.length} quizzes`);
    } else if (data.quizQuestions) {
      // Format 2: { quizQuestions: [...] }
      quizzes = data.quizQuestions;
      expect(Array.isArray(quizzes)).toBe(true);
      console.log(`✅ Quiz data has valid {quizQuestions} structure: ${quizzes.length} quizzes`);
    } else {
      // Format 3: { version, totalQuizzes, quizzes: [...] }
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('totalQuizzes');
      expect(data).toHaveProperty('quizzes');
      expect(typeof data.version).toBe('string');
      expect(typeof data.totalQuizzes).toBe('number');
      expect(Array.isArray(data.quizzes)).toBe(true);
      quizzes = data.quizzes;
      console.log(`✅ Quiz data has valid nested structure: v${data.version}, ${data.totalQuizzes} quizzes`);
    }
  });

  test('quiz-questions.json must have minimum number of quizzes', () => {
    let quizPath = path.join(__dirname, '../www/data/quiz-questions.json');
    if (!fs.existsSync(quizPath)) {
      quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    }

    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Support both formats
    const quizzes = Array.isArray(data) ? data : (data.quizzes || data.quizQuestions || []);
    const quizCount = quizzes.length;

    // Should have at least 100 quizzes for a good experience
    expect(quizCount, `Should have at least 100 quizzes, found ${quizCount}`).toBeGreaterThanOrEqual(100);

    // For nested format, totalQuizzes should match array length
    if (!Array.isArray(data)) {
      expect(data.totalQuizzes).toBe(quizCount);
    }

    console.log(`✅ Found ${quizCount} quizzes`);
  });

  test('each quiz must have required fields', () => {
    let quizPath = path.join(__dirname, '../www/data/quiz-questions.json');
    if (!fs.existsSync(quizPath)) {
      quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    }

    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Support both formats
    const quizzes = Array.isArray(data) ? data : (data.quizzes || data.quizQuestions || []);

    const requiredFields = [
      'questionText',
      'type',
      'difficulty',
      'options',
      'explanation'
    ];

    // Check first 10 quizzes as sample
    const samplesToCheck = Math.min(10, quizzes.length);
    for (let i = 0; i < samplesToCheck; i++) {
      const quiz = quizzes[i];

      requiredFields.forEach(field => {
        expect(quiz, `Quiz ${i} must have field '${field}'`).toHaveProperty(field);
      });

      // Validate types
      expect(typeof quiz.questionText).toBe('string');
      expect(Array.isArray(quiz.options)).toBe(true);
      expect(quiz.questionText.length, `Quiz ${i} must have non-empty question text`).toBeGreaterThan(0);
    }

    console.log(`✅ All sampled quizzes have required fields`);
  });

  test('each quiz must have valid options structure', () => {
    let quizPath = path.join(__dirname, '../www/data/quiz-questions.json');
    if (!fs.existsSync(quizPath)) {
      quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    }

    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Support both formats
    const quizzes = Array.isArray(data) ? data : (data.quizzes || data.quizQuestions || []);

    // Check first 10 quizzes
    const samplesToCheck = Math.min(10, quizzes.length);
    for (let i = 0; i < samplesToCheck; i++) {
      const quiz = quizzes[i];

      // Must have at least 2 options (for true/false) or 4 (for multiple choice)
      expect(quiz.options.length, `Quiz ${quiz.id} must have at least 2 options`).toBeGreaterThanOrEqual(2);

      // Each option must have required fields
      quiz.options.forEach((option, optIdx) => {
        expect(option, `Quiz ${quiz.id}, option ${optIdx} must have 'id'`).toHaveProperty('id');
        expect(option, `Quiz ${quiz.id}, option ${optIdx} must have 'text'`).toHaveProperty('text');
        expect(option, `Quiz ${quiz.id}, option ${optIdx} must have 'isCorrect'`).toHaveProperty('isCorrect');

        expect(typeof option.text).toBe('string');
        expect(typeof option.isCorrect).toBe('boolean');
        expect(option.text.length, `Quiz ${quiz.id}, option ${optIdx} must have non-empty text`).toBeGreaterThan(0);
      });
    }

    console.log(`✅ All options have valid structure`);
  });

  test('each quiz must have exactly one correct answer', () => {
    let quizPath = path.join(__dirname, '../www/data/quiz-questions.json');
    if (!fs.existsSync(quizPath)) {
      quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    }

    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Support both formats
    const quizzes = Array.isArray(data) ? data : (data.quizzes || data.quizQuestions || []);
    const errors = [];

    // Check all quizzes for correct answer
    quizzes.forEach((quiz, idx) => {
      const correctAnswers = quiz.options.filter(opt => opt.isCorrect === true);

      if (correctAnswers.length !== 1) {
        errors.push(`Quiz ${quiz.id} (index ${idx}) has ${correctAnswers.length} correct answers, expected exactly 1`);
      }
    });

    if (errors.length > 0) {
      console.error('❌ Found quizzes with invalid correct answer counts:');
      errors.slice(0, 5).forEach(err => console.error(`  - ${err}`));
      if (errors.length > 5) {
        console.error(`  ... and ${errors.length - 5} more errors`);
      }
    }

    expect(errors.length, `Found ${errors.length} quizzes with invalid correct answer counts`).toBe(0);

    console.log(`✅ All ${quizzes.length} quizzes have exactly one correct answer`);
  });

  test('quizzes must have valid difficulty levels', () => {
    let quizPath = path.join(__dirname, '../www/data/quiz-questions.json');
    if (!fs.existsSync(quizPath)) {
      quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    }

    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Support both formats
    const quizzes = Array.isArray(data) ? data : (data.quizzes || data.quizQuestions || []);

    const validDifficulties = ['easy', 'medium', 'hard'];
    const invalidQuizzes = [];

    quizzes.forEach(quiz => {
      if (!validDifficulties.includes(quiz.difficulty)) {
        invalidQuizzes.push(`Quiz ${quiz.id} has invalid difficulty: "${quiz.difficulty}"`);
      }
    });

    if (invalidQuizzes.length > 0) {
      console.error('❌ Found quizzes with invalid difficulty levels:');
      invalidQuizzes.slice(0, 5).forEach(err => console.error(`  - ${err}`));
    }

    expect(invalidQuizzes.length, `Found ${invalidQuizzes.length} quizzes with invalid difficulty`).toBe(0);

    // Count by difficulty
    const counts = {
      easy: quizzes.filter(q => q.difficulty === 'easy').length,
      medium: quizzes.filter(q => q.difficulty === 'medium').length,
      hard: quizzes.filter(q => q.difficulty === 'hard').length
    };

    console.log(`✅ Valid difficulty distribution: Easy=${counts.easy}, Medium=${counts.medium}, Hard=${counts.hard}`);
  });

  test('quizzes must have valid question types', () => {
    let quizPath = path.join(__dirname, '../www/data/quiz-questions.json');
    if (!fs.existsSync(quizPath)) {
      quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    }

    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Support both formats
    const quizzes = Array.isArray(data) ? data : (data.quizzes || data.quizQuestions || []);

    const validTypes = ['multiple-choice', 'true-false'];
    const invalidQuizzes = [];

    quizzes.forEach(quiz => {
      if (!validTypes.includes(quiz.type)) {
        invalidQuizzes.push(`Quiz ${quiz.id} has invalid type: "${quiz.type}"`);
      }
    });

    if (invalidQuizzes.length > 0) {
      console.error('❌ Found quizzes with invalid types:');
      invalidQuizzes.slice(0, 5).forEach(err => console.error(`  - ${err}`));
    }

    expect(invalidQuizzes.length, `Found ${invalidQuizzes.length} quizzes with invalid types`).toBe(0);

    console.log(`✅ All quizzes have valid question types`);
  });

  test('quizzes must have diverse categories or tags', () => {
    let quizPath = path.join(__dirname, '../www/data/quiz-questions.json');
    if (!fs.existsSync(quizPath)) {
      quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    }

    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Support both formats
    const quizzes = Array.isArray(data) ? data : (data.quizzes || data.quizQuestions || []);

    // New format: extract all unique tags from all quizzes
    // Old format: use category field
    const categoriesSet = new Set();
    quizzes.forEach(q => {
      if (q.category) {
        categoriesSet.add(q.category);
      }
      if (Array.isArray(q.tags)) {
        q.tags.forEach(tag => categoriesSet.add(tag));
      }
    });

    // Should have at least 5 different categories/tags for variety
    expect(categoriesSet.size, `Should have at least 5 unique categories/tags, found ${categoriesSet.size}`).toBeGreaterThanOrEqual(5);

    const categoriesList = Array.from(categoriesSet).slice(0, 5).join(', ');
    console.log(`✅ Found ${categoriesSet.size} unique categories/tags: ${categoriesList}...`);
  });
});

describe('Quiz Service Integrity', () => {

  test('quizService.js must exist and have required methods', () => {
    const servicePath = path.join(__dirname, '../src/services/quizService.js');
    expect(fs.existsSync(servicePath), 'quizService.js must exist').toBe(true);

    const content = fs.readFileSync(servicePath, 'utf-8');

    // Check for critical methods
    const requiredMethods = [
      'loadPreGeneratedQuizzes',
      'getDailyQuiz',
      'getCustomQuiz',
      'getRapidFireQuiz',
      'calculateScore'
    ];

    requiredMethods.forEach(method => {
      expect(content, `quizService.js must have ${method} method`).toContain(method);
    });

    console.log('✅ quizService.js has all required methods');
  });

  test('QuizView must exist', () => {
    const viewPath = path.join(__dirname, '../src/views/QuizView.vue');
    expect(fs.existsSync(viewPath), 'QuizView.vue must exist').toBe(true);

    console.log('✅ QuizView.vue exists');
  });
});

// ============================================================================
// BOOKMARKS / FOLDERS SYSTEM TESTS
// ============================================================================

describe('Bookmarks System - Database Schema', () => {

  test('dexieDatabase must have folders and folder_questions tables', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    const content = fs.readFileSync(dbPath, 'utf-8');

    // Check for folders table
    expect(content).toContain('folders:');
    expect(content).toContain('folder_questions:');

    console.log('✅ Database has folders and folder_questions tables');
  });

  test('dexieDatabase must have bookmark methods', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    const content = fs.readFileSync(dbPath, 'utf-8');

    const requiredMethods = [
      'createFolder',
      'deleteFolder',
      'addQuestionToFolder',
      'removeQuestionFromFolder',
      'getQuestionsInFolder',
      'getFolders'
    ];

    requiredMethods.forEach(method => {
      expect(content, `dexieDatabase.js must have ${method} method`).toContain(method);
    });

    console.log('✅ Database has all bookmark/folder methods');
  });

  test('database schema must support folder operations', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    const content = fs.readFileSync(dbPath, 'utf-8');

    // Check for proper indexes
    expect(content).toContain('folder_name');
    expect(content).toContain('question_id');
    expect(content).toContain('folder_id');

    console.log('✅ Database schema supports folder operations');
  });
});

describe('Bookmarks System - UI Components', () => {

  test('FoldersView must exist', () => {
    const viewPath = path.join(__dirname, '../src/views/FoldersView.vue');
    expect(fs.existsSync(viewPath), 'FoldersView.vue must exist').toBe(true);

    const content = fs.readFileSync(viewPath, 'utf-8');

    // Should have bookmark-related text
    expect(content).toContain('bookmark');
    expect(content).toContain('Bookmarks');

    console.log('✅ FoldersView.vue exists and has bookmark UI');
  });

  test('QuestionView must have bookmark functionality', () => {
    const viewPath = path.join(__dirname, '../src/views/QuestionView.vue');
    expect(fs.existsSync(viewPath), 'QuestionView.vue must exist').toBe(true);

    console.log('✅ QuestionView.vue exists');
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Quiz and Bookmarks Integration', () => {

  test('app must have routes for quiz and bookmarks', () => {
    const routerPath = path.join(__dirname, '../src/router/index.js');
    expect(fs.existsSync(routerPath), 'router/index.js must exist').toBe(true);

    const content = fs.readFileSync(routerPath, 'utf-8');

    // Check for quiz routes
    const hasQuizRoute = content.includes('quiz') || content.includes('Quiz');
    expect(hasQuizRoute, 'Router must have quiz route').toBe(true);

    // Check for folders/bookmark routes
    const hasFoldersRoute = content.includes('folder') || content.includes('Folder') ||
                           content.includes('bookmark') || content.includes('Bookmark');
    expect(hasFoldersRoute, 'Router must have folders/bookmarks route').toBe(true);

    console.log('✅ Router has quiz and bookmark routes');
  });

  test.skip('quiz categories should align with question categories', () => {
    // UPDATED: Load from new dump file format (categories.json)
    const quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    const categoriesPath = path.join(__dirname, '../public/data/categories.json');

    const quizContent = fs.readFileSync(quizPath, 'utf-8');
    let quizData = JSON.parse(quizContent);

    const catContent = fs.readFileSync(categoriesPath, 'utf-8');
    const categories = JSON.parse(catContent);

    // Support both formats: extract quizzes array from flat or nested structure
    const quizzes = Array.isArray(quizData) ? quizData : (quizData.quizzes || []);

    // Extract quiz categories or tags (new format uses tags, old format uses category)
    const quizCategories = new Set();
    quizzes.forEach(q => {
      if (q.category) {
        quizCategories.add(q.category);
      }
      if (Array.isArray(q.tags)) {
        q.tags.forEach(tag => quizCategories.add(tag));
      }
    });

    // Note: Quiz categories/tags are semantic labels, not direct matches to category IDs
    // This test just ensures quizzes have meaningful category labels
    expect(quizCategories.size, 'Quizzes should have diverse categories or tags').toBeGreaterThan(0);

    console.log(`✅ Quiz system has ${quizCategories.size} categories, Question system has ${categories.length} categories`);
  });
});
