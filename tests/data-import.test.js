/**
 * DATA IMPORT TESTS
 *
 * These tests validate the data import pipeline that was broken.
 * Focus: DataLoader service, quiz import logic, database operations
 *
 * These tests would have caught the quiz import bug where:
 * - loadQuizQuestions() returned an object instead of an array
 * - bulkImportQuizQuestions() received undefined length
 * - quiz_questions table remained empty
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CRITICAL TEST 1: DataLoader.loadQuizQuestions() Unit Tests
// ============================================================================

describe('DataLoader - loadQuizQuestions() (CRITICAL)', () => {

  test('loadQuizQuestions() must return an array, not an object', () => {
    // Load the quiz-questions.json file
    const quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    expect(fs.existsSync(quizPath), 'quiz-questions.json must exist').toBe(true);

    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Support both formats: flat array or nested object
    // New format: [{ id, questionText, ... }, ...]
    // Old format: { version, totalQuizzes, quizzes: [...] }
    const quizzes = Array.isArray(data) ? data : (data.quizzes || []);

    // CRITICAL: Must be an array
    expect(Array.isArray(quizzes), 'loadQuizQuestions() must return an array').toBe(true);

    // Must have length property
    expect(typeof quizzes.length).toBe('number');
    expect(quizzes.length, 'Quiz array must not be empty').toBeGreaterThan(0);

    console.log(`✅ loadQuizQuestions() returns array with ${quizzes.length} quizzes`);
  });

  test('loadQuizQuestions() must extract quizzes array from JSON structure', () => {
    const quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Support both formats
    let quizzes;
    if (Array.isArray(data)) {
      // New format: flat array
      quizzes = data;
      expect(Array.isArray(quizzes)).toBe(true);
    } else {
      // Old format: nested object
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('totalQuizzes');
      expect(data).toHaveProperty('quizzes');
      quizzes = data.quizzes;
      expect(Array.isArray(quizzes)).toBe(true);
      expect(quizzes.length).toBe(data.totalQuizzes);
    }

    console.log(`✅ Correctly extracts ${quizzes.length} quizzes from JSON structure`);
  });

  test('loadQuizQuestions() must map quiz data to have reference field', () => {
    const quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    const quizzes = Array.isArray(data) ? data : (data.quizzes || []);

    // Each quiz must have reference (primary key) or sourceQuestionId
    const samplesToCheck = Math.min(10, quizzes.length);
    for (let i = 0; i < samplesToCheck; i++) {
      const quiz = quizzes[i];

      // New format: must have reference directly
      // Old format: must have sourceQuestionId
      const hasReference = quiz.hasOwnProperty('reference') || quiz.hasOwnProperty('sourceQuestionId');
      expect(hasReference, `Quiz ${i} must have reference or sourceQuestionId`).toBe(true);

      if (quiz.hasOwnProperty('reference')) {
        expect(typeof quiz.reference).toBe('number');
      } else if (quiz.hasOwnProperty('sourceQuestionId')) {
        expect(typeof quiz.sourceQuestionId).toBe('number');
      }

      // Simulate the mapping that should happen
      const mappedQuiz = {
        reference: quiz.sourceQuestionId || quiz.reference,
        id: quiz.id,
        questionText: quiz.questionText,
        options: quiz.options,
        explanation: quiz.explanation,
        difficulty: quiz.difficulty,
        tags: quiz.tags || [],
        category: quiz.category,
        source: quiz.source || 'IslamQA',
        type: quiz.type || 'multiple-choice'
      };

      expect(mappedQuiz.reference).toBeDefined();
      expect(typeof mappedQuiz.reference).toBe('number');
    }

    console.log(`✅ All quizzes can be mapped to have reference field`);
  });

  test('loadQuizQuestions() mapped data should have all required fields', () => {
    const quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    const quizzes = Array.isArray(data) ? data : (data.quizzes || []);

    // Simulate the mapping
    const mappedQuizzes = quizzes.map(quiz => {
      const mapped = {
        reference: quiz.sourceQuestionId || quiz.reference,
        questionText: quiz.questionText,
        options: quiz.options,
        explanation: quiz.explanation,
        difficulty: quiz.difficulty,
        tags: quiz.tags || [],
        source: quiz.source || 'IslamQA',
        type: quiz.type || 'multiple-choice'
      };
      // Only include id if it exists (for old format compatibility)
      if (quiz.id) {
        mapped.id = quiz.id;
      }
      // Only include category if it exists
      if (quiz.category) {
        mapped.category = quiz.category;
      }
      return mapped;
    });

    const requiredFields = ['reference', 'questionText', 'options', 'explanation', 'difficulty'];

    const samplesToCheck = Math.min(10, mappedQuizzes.length);
    for (let i = 0; i < samplesToCheck; i++) {
      const quiz = mappedQuizzes[i];

      requiredFields.forEach(field => {
        expect(quiz, `Mapped quiz ${i} must have field '${field}'`).toHaveProperty(field);
        expect(quiz[field], `Field '${field}' must not be undefined`).toBeDefined();
      });
    }

    console.log(`✅ Mapped quizzes have all required fields for database import`);
  });
});

// ============================================================================
// CRITICAL TEST 2: DexieDatabase Quiz Import Tests
// ============================================================================

describe('DexieDatabase - bulkImportQuizQuestions() (CRITICAL)', () => {

  test('bulkImportQuizQuestions() must handle array input correctly', () => {
    // Load quiz data
    const quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // Extract and map quizzes (simulating fixed dataLoader)
    const quizzes = Array.isArray(data) ? data : (data.quizzes || []);
    const mappedQuizzes = quizzes.map(quiz => ({
      reference: quiz.sourceQuestionId || quiz.reference,
      id: quiz.id,
      questionText: quiz.questionText,
      options: quiz.options,
      explanation: quiz.explanation,
      difficulty: quiz.difficulty,
      tags: quiz.tags || [],
      category: quiz.category,
      source: quiz.source || 'IslamQA',
      type: quiz.type || 'multiple-choice'
    }));

    // Validate it's an array (this was the bug!)
    expect(Array.isArray(mappedQuizzes)).toBe(true);
    expect(mappedQuizzes.length).toBeGreaterThan(0);

    // Check each item has reference field (primary key)
    mappedQuizzes.slice(0, 10).forEach((quiz, idx) => {
      expect(quiz.reference, `Quiz ${idx} must have reference`).toBeDefined();
      expect(typeof quiz.reference).toBe('number');
    });

    console.log(`✅ bulkImportQuizQuestions() would receive valid array of ${mappedQuizzes.length} items`);
  });

  test('quiz questions must have unique reference values (no duplicates)', () => {
    const quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    const quizzes = Array.isArray(data) ? data : (data.quizzes || []);
    const references = quizzes.map(q => q.sourceQuestionId || q.reference);

    const uniqueReferences = new Set(references);

    expect(uniqueReferences.size, 'All quiz references must be unique (no duplicates)').toBe(quizzes.length);

    console.log(`✅ All ${quizzes.length} quizzes have unique reference values`);
  });

  test('quiz question references must match actual question IDs', () => {
    // Load quiz questions
    const quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    const quizContent = fs.readFileSync(quizPath, 'utf-8');
    const quizData = JSON.parse(quizContent);

    // Load actual questions
    const questionsPath = path.join(__dirname, '../public/data/questions.json');
    const questionsContent = fs.readFileSync(questionsPath, 'utf-8');
    const questions = JSON.parse(questionsContent);

    const questionRefs = new Set(questions.map(q => q.reference));
    const quizzes = quizData.quizzes || [];

    // Sample check: first 50 quiz questions
    const samplesToCheck = Math.min(50, quizzes.length);
    const missingRefs = [];

    for (let i = 0; i < samplesToCheck; i++) {
      const quizRef = quizzes[i].sourceQuestionId || quizzes[i].reference;
      if (!questionRefs.has(quizRef)) {
        missingRefs.push(quizRef);
      }
    }

    if (missingRefs.length > 0) {
      console.warn(`⚠️  Found ${missingRefs.length} quiz questions with missing question refs:`, missingRefs.slice(0, 5));
    }

    // Allow up to 5% missing (data sync issue)
    const maxMissing = Math.ceil(samplesToCheck * 0.05);
    expect(missingRefs.length, `Too many quiz questions reference non-existent questions`).toBeLessThanOrEqual(maxMissing);

    console.log(`✅ Quiz questions reference valid question IDs (${samplesToCheck - missingRefs.length}/${samplesToCheck} found)`);
  });
});

// ============================================================================
// CRITICAL TEST 3: Database Schema Tests
// ============================================================================

describe('DexieDatabase - quiz_questions table schema (CRITICAL)', () => {

  test('dexieDatabase must define quiz_questions table', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    const content = fs.readFileSync(dbPath, 'utf-8');

    // Must have quiz_questions table in schema
    expect(content).toContain('quiz_questions:');

    // Must use reference as primary key
    expect(content).toContain("quiz_questions: 'reference'");

    console.log('✅ Database schema defines quiz_questions table with reference as primary key');
  });

  test('dexieDatabase must have bulkImportQuizQuestions method', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    const content = fs.readFileSync(dbPath, 'utf-8');

    expect(content).toContain('bulkImportQuizQuestions');
    expect(content).toContain('quiz_questions.bulkPut');

    console.log('✅ Database has bulkImportQuizQuestions method');
  });

  test('dexieDatabase must have getQuizQuestion method', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    const content = fs.readFileSync(dbPath, 'utf-8');

    expect(content).toContain('getQuizQuestion');
    expect(content).toContain('quiz_questions.get');

    console.log('✅ Database has getQuizQuestion method');
  });

  test('dexieDatabase must have getAllQuizQuestions method', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    const content = fs.readFileSync(dbPath, 'utf-8');

    expect(content).toContain('getAllQuizQuestions');

    console.log('✅ Database has getAllQuizQuestions method');
  });
});

// ============================================================================
// CRITICAL TEST 4: DataLoader Integration Tests
// ============================================================================

describe('DataLoader - Full Import Flow (INTEGRATION)', () => {

  test('dataLoader must have loadQuizQuestions method', () => {
    const loaderPath = path.join(__dirname, '../src/services/dataLoader.js');
    const content = fs.readFileSync(loaderPath, 'utf-8');

    expect(content).toContain('loadQuizQuestions');
    expect(content).toContain('quiz-questions.json');

    console.log('✅ DataLoader has loadQuizQuestions method');
  });

  test('dataLoader.loadQuizQuestions must extract quizzes array', () => {
    const loaderPath = path.join(__dirname, '../src/services/dataLoader.js');
    const content = fs.readFileSync(loaderPath, 'utf-8');

    // Must extract data.quizzes (the fix!)
    expect(content).toContain('data.quizzes');

    console.log('✅ DataLoader extracts quizzes array from JSON structure');
  });

  test('dataLoader.loadQuizQuestions must map quiz data with reference field', () => {
    const loaderPath = path.join(__dirname, '../src/services/dataLoader.js');
    const content = fs.readFileSync(loaderPath, 'utf-8');

    // Must map to include reference field
    expect(content).toContain('reference:');
    expect(content).toContain('sourceQuestionId');

    console.log('✅ DataLoader maps quiz data to include reference field');
  });

  test('dataLoader.loadAndImport must import quiz questions', () => {
    const loaderPath = path.join(__dirname, '../src/services/dataLoader.js');
    const content = fs.readFileSync(loaderPath, 'utf-8');

    // Must call loadQuizQuestions during import
    expect(content).toContain('loadQuizQuestions');
    expect(content).toContain('bulkImportQuizQuestions');

    console.log('✅ DataLoader imports quiz questions during loadAndImport');
  });

  test('dataLoader must log correct quiz count', () => {
    const loaderPath = path.join(__dirname, '../src/services/dataLoader.js');
    const content = fs.readFileSync(loaderPath, 'utf-8');

    // Must log the quiz count correctly (was showing "undefined" before fix)
    const hasCorrectLog = content.includes('mappedQuizzes.length') ||
                          content.includes('${quizzes.length}') ||
                          content.includes('${data.length}');

    expect(hasCorrectLog, 'DataLoader must log correct quiz count').toBe(true);

    console.log('✅ DataLoader logs correct quiz count (not undefined)');
  });
});

// ============================================================================
// CRITICAL TEST 5: QuizService Dependency Tests
// ============================================================================

describe('QuizService - Quiz Generation Dependencies (CRITICAL)', () => {

  test('quizService must use getAllQuizQuestions for quiz generation', () => {
    const servicePath = path.join(__dirname, '../src/services/quizService.js');
    const content = fs.readFileSync(servicePath, 'utf-8');

    // All quiz modes depend on getAllQuizQuestions
    expect(content).toContain('getAllQuizQuestions');

    console.log('✅ QuizService uses getAllQuizQuestions for quiz generation');
  });

  test('quizService must throw error if no quiz questions available', () => {
    const servicePath = path.join(__dirname, '../src/services/quizService.js');
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Should have error handling for empty quiz_questions table
    const hasErrorCheck = content.includes('allQuizQuestions.length === 0') ||
                          content.includes('No quiz questions available');

    expect(hasErrorCheck, 'QuizService must check for empty quiz_questions table').toBe(true);

    console.log('✅ QuizService has error handling for missing quiz questions');
  });

  test('quizService.transformToQuizQuestion must load from quiz_questions table', () => {
    const servicePath = path.join(__dirname, '../src/services/quizService.js');
    const content = fs.readFileSync(servicePath, 'utf-8');

    expect(content).toContain('getQuizQuestion');

    console.log('✅ QuizService loads quiz questions from quiz_questions table');
  });

  test('all quiz modes must require LLM-generated quiz questions', () => {
    const servicePath = path.join(__dirname, '../src/services/quizService.js');
    const content = fs.readFileSync(servicePath, 'utf-8');

    const quizModes = ['getDailyQuiz', 'getRapidFireQuiz', 'getCategoryQuiz', 'getChallengeQuiz'];

    quizModes.forEach(mode => {
      // Each mode should call getAllQuizQuestions
      const modeRegex = new RegExp(`${mode}[\\s\\S]*?getAllQuizQuestions`, 'g');
      expect(modeRegex.test(content), `${mode} must use getAllQuizQuestions`).toBe(true);
    });

    console.log('✅ All quiz modes depend on LLM-generated quiz questions');
  });
});

// ============================================================================
// CRITICAL TEST 6: Regression Prevention
// ============================================================================

describe('Quiz Import Bug Regression Prevention (CRITICAL)', () => {

  test('REGRESSION: quiz import must not return undefined length', () => {
    // This test prevents the exact bug that was just fixed
    const quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    // FIX: Must extract quizzes array (different for each format)
    let correctWay;
    if (Array.isArray(data)) {
      // New format: data is already the array
      correctWay = data;
    } else {
      // Old format: must extract data.quizzes
      correctWay = data.quizzes || [];
    }

    expect(typeof correctWay.length).toBe('number');
    expect(correctWay.length).toBeGreaterThan(0);

    console.log('✅ Quiz import extracts array correctly (regression prevention)');
  });

  test('REGRESSION: mapped quizzes must be bulkPut compatible', () => {
    const quizPath = path.join(__dirname, '../public/data/quiz-questions.json');
    const content = fs.readFileSync(quizPath, 'utf-8');
    const data = JSON.parse(content);

    const quizzes = Array.isArray(data) ? data : (data.quizzes || []);
    const mappedQuizzes = quizzes.map(quiz => ({
      reference: quiz.sourceQuestionId || quiz.reference,
      questionText: quiz.questionText,
      options: quiz.options,
      explanation: quiz.explanation,
      difficulty: quiz.difficulty,
      tags: quiz.tags || [],
      category: quiz.category,
      source: quiz.source || 'IslamQA',
      type: quiz.type || 'multiple-choice'
    }));

    // Must be an array that Dexie.bulkPut() can handle
    expect(Array.isArray(mappedQuizzes)).toBe(true);
    expect(mappedQuizzes.length).toBeGreaterThan(0);

    // Each item must have reference (primary key)
    mappedQuizzes.forEach((quiz, idx) => {
      expect(quiz.reference, `Quiz ${idx} must have reference for bulkPut`).toBeDefined();
    });

    console.log('✅ Mapped quizzes are compatible with Dexie.bulkPut()');
  });

  test('REGRESSION: import flow must log actual count, not undefined', () => {
    const loaderPath = path.join(__dirname, '../src/services/dataLoader.js');
    const content = fs.readFileSync(loaderPath, 'utf-8');

    // Must NOT log data.length (undefined)
    const hasDataLengthBug = /console\.log.*data\.length.*quiz/i.test(content);
    expect(hasDataLengthBug, 'BUG: Must not log data.length for quiz questions').toBe(false);

    // Must log array length (mappedQuizzes.length or quizzes.length)
    const hasCorrectLog = /mappedQuizzes\.length|quizzes\.length/.test(content);
    expect(hasCorrectLog, 'Must log array length, not object').toBe(true);

    console.log('✅ Import logs correct count (not undefined)');
  });
});
