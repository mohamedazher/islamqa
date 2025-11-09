/**
 * BREAKAGE DETECTION TESTS
 *
 * These tests catch critical app failures before deployment.
 * Focus: Data integrity, critical functionality, service integrity
 *
 * Architecture: Vue 3 + Vite + Dexie (IndexedDB)
 */

import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CRITICAL TEST 1: Data Files Structure
// ============================================================================
// This catches if you accidentally break categories.js or questions.js structure

describe('Data Files Structure (CRITICAL)', () => {

  test('categories.json must have valid structure (NEW: dump file method)', () => {
    // Check public/data/ (web builds) for new dump file format
    const categoriesPath = path.join(__dirname, '../public/data/categories.json');

    expect(fs.existsSync(categoriesPath), 'categories.json file must exist').toBe(true);

    const content = fs.readFileSync(categoriesPath, 'utf-8');

    // Parse JSON directly (new dump file format)
    let categories;
    try {
      categories = JSON.parse(content);
    } catch (e) {
      expect(false, 'categories.json must be valid JSON').toBe(true);
      return;
    }

    // Must have categories
    expect(Array.isArray(categories), 'categories.json must be an array').toBe(true);
    expect(categories.length, 'Must have at least 50 categories').toBeGreaterThan(50);

    // Check first category has NEW required fields (dump file structure)
    const firstCat = categories[0];
    expect(firstCat).toHaveProperty('reference');  // Semantic ID from IslamQA
    expect(firstCat).toHaveProperty('title');      // Not category_links
    expect(firstCat).toHaveProperty('parent_reference'); // Not parent
    expect(firstCat).toHaveProperty('children_references');
    expect(firstCat).toHaveProperty('level');
    expect(firstCat).toHaveProperty('has_questions');
    expect(firstCat).toHaveProperty('has_subcategories');

    // Validate data types
    expect(typeof firstCat.reference).toBe('number');
    expect(typeof firstCat.title).toBe('string');
    expect(typeof firstCat.children_references).toBe('object'); // Array

    // Check for root categories (parent_reference = null)
    const rootCategories = categories.filter(cat => cat.parent_reference === null);
    expect(rootCategories.length, 'Must have at least 3 root categories').toBeGreaterThanOrEqual(3);

    console.log(`✅ Found ${categories.length} categories with ${rootCategories.length} root categories (semantic IDs)`);
  });

  test('questions.json must exist and have valid structure (NEW: single dump file)', () => {
    // NEW: Single questions.json file (dump file method)
    const questionsPath = path.join(__dirname, '../public/data/questions.json');

    expect(fs.existsSync(questionsPath), 'questions.json file must exist').toBe(true);

    const content = fs.readFileSync(questionsPath, 'utf-8');

    // Parse JSON directly
    let questions;
    try {
      questions = JSON.parse(content);
    } catch (e) {
      expect(false, 'questions.json must be valid JSON').toBe(true);
      return;
    }

    expect(Array.isArray(questions), 'questions.json must be an array').toBe(true);
    expect(questions.length, 'Must have at least 10000 questions').toBeGreaterThan(10000);

    console.log(`✅ Found ${questions.length} questions in single questions.json file`);
  });

  test('questions must have answers embedded (no separate answers table)', () => {
    // NEW: Answers are embedded in question.answer field
    const questionsPath = path.join(__dirname, '../public/data/questions.json');
    const content = fs.readFileSync(questionsPath, 'utf-8');

    let questions;
    try {
      questions = JSON.parse(content);
    } catch (e) {
      expect(false, 'questions.json must be valid JSON').toBe(true);
      return;
    }

    // Check that first question has embedded answer
    const firstQuestion = questions[0];
    expect(firstQuestion).toHaveProperty('reference');  // Semantic ID
    expect(firstQuestion).toHaveProperty('title');      // Question title
    expect(firstQuestion).toHaveProperty('question');   // Question HTML
    expect(firstQuestion).toHaveProperty('answer');     // EMBEDDED answer (not separate!)
    expect(firstQuestion).toHaveProperty('primary_category'); // Category reference
    expect(firstQuestion).toHaveProperty('categories');  // Array of categories

    // Validate types
    expect(typeof firstQuestion.reference).toBe('number');
    expect(typeof firstQuestion.title).toBe('string');
    expect(typeof firstQuestion.answer).toBe('string'); // HTML content embedded
    expect(typeof firstQuestion.primary_category).toBe('number');
    expect(Array.isArray(firstQuestion.categories)).toBe(true);

    // Check that a sample of questions have answers
    const questionsWithAnswers = questions.slice(0, 100).filter(q => q.answer && q.answer.length > 0);
    expect(questionsWithAnswers.length, 'Most questions should have embedded answers').toBeGreaterThan(80);

    console.log(`✅ Questions have embedded answers (${questionsWithAnswers.length}/100 sample have answers)`);
  });
});

// ============================================================================
// CRITICAL TEST 2: Service Files Integrity
// ============================================================================
// Ensures critical service files exist and have required exports

describe('Service Files Integrity (CRITICAL)', () => {

  test('dexieDatabase.js must exist and have required schema (NEW: no answers table)', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    expect(fs.existsSync(dbPath), 'dexieDatabase.js must exist').toBe(true);

    const content = fs.readFileSync(dbPath, 'utf-8');

    // Check for required tables (NEW schema)
    expect(content).toContain('categories:');
    expect(content).toContain('questions:');
    // REMOVED: answers table (answers are now embedded in questions)
    // expect(content).toContain('answers:');
    expect(content).toContain('folders:');

    // Check for required methods
    expect(content).toContain('importCategories');
    expect(content).toContain('importQuestions');
    // importAnswers is deprecated but may still exist
    expect(content).toContain('getCategories');
    expect(content).toContain('getQuestion');

    // Check for new semantic ID queries
    expect(content).toContain('parent_reference'); // New hierarchy field
    expect(content).toContain('primary_category');  // New category link field
    expect(content).toContain('reference');         // New semantic ID field

    console.log('✅ dexieDatabase.js has required schema (answers embedded in questions, semantic IDs)');
  });

  test('dataLoader.js must exist and have required methods (NEW: dump file method)', () => {
    const loaderPath = path.join(__dirname, '../src/services/dataLoader.js');
    expect(fs.existsSync(loaderPath), 'dataLoader.js must exist').toBe(true);

    const content = fs.readFileSync(loaderPath, 'utf-8');

    // Check for required methods (NEW dump file method)
    expect(content).toContain('loadCategories');
    expect(content).toContain('loadQuestions');
    expect(content).toContain('loadAndImport');

    // Check that it loads from new file format
    expect(content).toContain('categories.json');
    expect(content).toContain('questions.json');
    expect(content).toContain('getDataPath');

    console.log('✅ dataLoader.js has required methods for dump file method');
  });

  test('all critical service files must exist', () => {
    const criticalServices = [
      'src/services/dexieDatabase.js',
      'src/services/dataLoader.js',
      'src/services/searchService.js',
    ];

    criticalServices.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath), `${file} must exist`).toBe(true);
    });

    console.log('✅ All critical service files exist');
  });
});

// ============================================================================
// CRITICAL TEST 3: Vue Components and Views
// ============================================================================

describe('Vue Components Integrity', () => {

  test('critical view components must exist', () => {
    const criticalViews = [
      'src/views/HomeView.vue',
      'src/views/BrowseView.vue',
      'src/views/CategoryView.vue',
      'src/views/QuestionView.vue',
      'src/views/SearchView.vue',
      'src/views/ImportView.vue',
    ];

    criticalViews.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath), `${file} must exist`).toBe(true);
    });

    console.log('✅ All critical view components exist');
  });

  test('App.vue must exist and be valid', () => {
    const appPath = path.join(__dirname, '../src/App.vue');
    expect(fs.existsSync(appPath), 'App.vue must exist').toBe(true);

    const content = fs.readFileSync(appPath, 'utf-8');
    expect(content).toContain('<template>');
    expect(content).toContain('</template>');

    console.log('✅ App.vue exists and is valid');
  });
});

// ============================================================================
// CRITICAL TEST 4: Data Relationships
// ============================================================================

describe('Data Relationships (CRITICAL)', () => {

  test('categories must have valid parent relationships', () => {
    // UPDATED: Load from categories.json (new dump file format)
    const categoriesPath = path.join(__dirname, '../public/data/categories.json');
    const catContent = fs.readFileSync(categoriesPath, 'utf-8');
    const categories = JSON.parse(catContent);

    // Map of reference IDs to check parent relationships
    const referenceSet = new Set(categories.map(cat => cat.reference));

    let orphanCount = 0;
    let orphanExamples = [];

    categories.forEach(cat => {
      // If not a root category (parent_reference != null), parent must exist
      if (cat.parent_reference !== null && !referenceSet.has(cat.parent_reference)) {
        orphanCount++;
        if (orphanExamples.length < 5) {
          orphanExamples.push(`Category ${cat.reference} (${cat.title}) has non-existent parent: ${cat.parent_reference}`);
        }
      }
    });

    // Some orphans are OK (data cleanup issue), but shouldn't be too many
    expect(orphanCount, `Too many orphaned categories (${orphanCount}). Examples:\n${orphanExamples.join('\n')}`).toBeLessThan(5);

    if (orphanCount > 0) {
      console.warn(`⚠ Found ${orphanCount} categories with missing parents`);
    } else {
      console.log('✅ All categories have valid parent relationships');
    }
  });

  test('categories must have unique reference IDs', () => {
    // UPDATED: Load from categories.json (new dump file format)
    const categoriesPath = path.join(__dirname, '../public/data/categories.json');
    const catContent = fs.readFileSync(categoriesPath, 'utf-8');
    const categories = JSON.parse(catContent);

    const referenceSet = new Set();
    const duplicateReferences = [];

    categories.forEach(cat => {
      if (referenceSet.has(cat.reference)) {
        duplicateReferences.push(cat.reference);
      }
      referenceSet.add(cat.reference);
    });

    expect(duplicateReferences.length, `Found duplicate category references: ${duplicateReferences.join(', ')}`).toBe(0);

    console.log(`✅ All ${categories.length} categories have unique semantic reference IDs`);
  });
});

// ============================================================================
// CRITICAL TEST 5: Build Configuration
// ============================================================================

describe('Build Configuration', () => {

  test('package.json must have required dependencies', () => {
    const pkgPath = path.join(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    // Critical dependencies
    expect(pkg.dependencies).toHaveProperty('vue');
    expect(pkg.dependencies).toHaveProperty('dexie');
    expect(pkg.dependencies).toHaveProperty('vue-router');

    // Critical dev dependencies
    expect(pkg.devDependencies).toHaveProperty('vite');
    expect(pkg.devDependencies).toHaveProperty('@vitejs/plugin-vue');

    console.log('✅ package.json has all required dependencies');
  });

  test('config.xml must be valid Cordova configuration', () => {
    const configPath = path.join(__dirname, '../config.xml');
    expect(fs.existsSync(configPath), 'config.xml must exist').toBe(true);

    const content = fs.readFileSync(configPath, 'utf-8');

    // Basic XML validation
    expect(content).toContain('<widget');
    expect(content).toContain('com.dkurve.betterislamqa');
    expect(content).toContain('</widget>');

    console.log('✅ config.xml is valid');
  });

  test('main entry point must exist', () => {
    const mainPath = path.join(__dirname, '../src/main.js');
    expect(fs.existsSync(mainPath), 'src/main.js must exist').toBe(true);

    const content = fs.readFileSync(mainPath, 'utf-8');
    expect(content).toContain('createApp');

    console.log('✅ Main entry point exists');
  });
});

// ============================================================================
// CRITICAL TEST 6: Data Loading Logic
// ============================================================================

describe('Data Loading Logic', () => {

  test('dataLoader must load categories and questions from JSON files (dump file method)', () => {
    const loaderPath = path.join(__dirname, '../src/services/dataLoader.js');
    const content = fs.readFileSync(loaderPath, 'utf-8');

    // UPDATED: Must load from new dump file method (categories.json and questions.json)
    expect(content).toContain('loadCategories');
    expect(content).toContain('loadQuestions');
    expect(content).toContain('categories.json');
    expect(content).toContain('questions.json');

    // OLD method should no longer exist
    expect(content).not.toContain('for (let i = 1; i <= 4');  // No longer loading 4 question files
    expect(content).not.toContain('for (let i = 1; i <= 12'); // No longer loading 12 answer files

    console.log('✅ dataLoader uses new dump file method (categories.json, questions.json)');
  });

  test('database schema version must be defined', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    const content = fs.readFileSync(dbPath, 'utf-8');

    expect(content).toContain('this.version(');

    console.log('✅ Database schema version is defined');
  });
});
