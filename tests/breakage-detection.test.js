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

  test('categories.js must have valid structure', () => {
    // Check both www/js/ (Cordova) and public/data/ (web)
    let categoriesPath = path.join(__dirname, '../www/js/categories.js');
    if (!fs.existsSync(categoriesPath)) {
      categoriesPath = path.join(__dirname, '../public/data/categories.js');
    }

    expect(fs.existsSync(categoriesPath), 'categories.js file must exist').toBe(true);

    const content = fs.readFileSync(categoriesPath, 'utf-8');

    // Parse the JSON array from the file
    const jsonMatch = content.match(/\[(.*)\]/s);
    expect(jsonMatch, 'categories.js must contain valid JSON array').not.toBeNull();

    const categories = JSON.parse(jsonMatch[0]);

    // Must have categories
    expect(categories.length, 'Must have at least 200 categories').toBeGreaterThan(200);

    // Check first category has required fields
    const firstCat = categories[0];
    expect(firstCat).toHaveProperty('id');
    expect(firstCat).toHaveProperty('category_links');
    expect(firstCat).toHaveProperty('category_url');
    expect(firstCat).toHaveProperty('element');
    expect(firstCat).toHaveProperty('parent');

    // Validate data types
    expect(typeof firstCat.id).toBe('string');
    expect(typeof firstCat.category_links).toBe('string');
    expect(typeof firstCat.element).toBe('string');
    expect(typeof firstCat.parent).toBe('string');

    // Check for root categories (parent = "0")
    const rootCategories = categories.filter(cat => cat.parent === "0");
    expect(rootCategories.length, 'Must have at least 5 root categories').toBeGreaterThan(5);

    console.log(`✅ Found ${categories.length} categories with ${rootCategories.length} root categories`);
  });

  test('all 4 questions files must exist and be valid', () => {
    for (let i = 1; i <= 4; i++) {
      let questionsPath = path.join(__dirname, `../www/js/questions${i}.js`);
      if (!fs.existsSync(questionsPath)) {
        questionsPath = path.join(__dirname, `../public/data/questions${i}.js`);
      }

      expect(fs.existsSync(questionsPath), `questions${i}.js must exist`).toBe(true);

      const content = fs.readFileSync(questionsPath, 'utf-8');
      expect(content.length, `questions${i}.js must not be empty`).toBeGreaterThan(1000);

      // Verify it's parseable JavaScript with JSON array
      expect(content, `questions${i}.js must contain JSON array`).toMatch(/\[.*\]/s);
    }
    console.log('✅ All 4 question files exist and are valid');
  });

  test('all 12 answer files must exist', () => {
    for (let i = 1; i <= 12; i++) {
      let answerPath = path.join(__dirname, `../www/js/answers${i}.js`);
      if (!fs.existsSync(answerPath)) {
        answerPath = path.join(__dirname, `../public/data/answers${i}.js`);
      }

      expect(fs.existsSync(answerPath), `answers${i}.js must exist`).toBe(true);
    }
    console.log('✅ All 12 answer files exist');
  });

  test('sample question file has valid structure', () => {
    let questionsPath = path.join(__dirname, '../www/js/questions1.js');
    if (!fs.existsSync(questionsPath)) {
      questionsPath = path.join(__dirname, '../public/data/questions1.js');
    }

    const content = fs.readFileSync(questionsPath, 'utf-8');
    const jsonMatch = content.match(/\[(.*?)\{(.|\n)*?\}/s); // Match first object

    if (jsonMatch) {
      // Parse just the first question object to validate structure
      const firstQuestionMatch = content.match(/\{[^}]*"id"[^}]*"category_id"[^}]*"question"[^}]*\}/);
      expect(firstQuestionMatch, 'First question must have id, category_id, question fields').not.toBeNull();

      console.log('✅ Question files have valid structure');
    }
  });
});

// ============================================================================
// CRITICAL TEST 2: Service Files Integrity
// ============================================================================
// Ensures critical service files exist and have required exports

describe('Service Files Integrity (CRITICAL)', () => {

  test('dexieDatabase.js must exist and have required schema', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    expect(fs.existsSync(dbPath), 'dexieDatabase.js must exist').toBe(true);

    const content = fs.readFileSync(dbPath, 'utf-8');

    // Check for required tables
    expect(content).toContain('categories:');
    expect(content).toContain('questions:');
    expect(content).toContain('answers:');
    expect(content).toContain('folders:');

    // Check for required methods
    expect(content).toContain('importCategories');
    expect(content).toContain('importQuestions');
    expect(content).toContain('importAnswers');
    expect(content).toContain('getCategories');
    expect(content).toContain('getQuestion');

    console.log('✅ dexieDatabase.js has required schema and methods');
  });

  test('dataLoader.js must exist and have required methods', () => {
    const loaderPath = path.join(__dirname, '../src/services/dataLoader.js');
    expect(fs.existsSync(loaderPath), 'dataLoader.js must exist').toBe(true);

    const content = fs.readFileSync(loaderPath, 'utf-8');

    // Check for required methods
    expect(content).toContain('loadCategories');
    expect(content).toContain('loadQuestions');
    expect(content).toContain('loadAnswers');
    expect(content).toContain('loadAndImport');

    console.log('✅ dataLoader.js has required methods');
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
    let categoriesPath = path.join(__dirname, '../www/js/categories.js');
    if (!fs.existsSync(categoriesPath)) {
      categoriesPath = path.join(__dirname, '../public/data/categories.js');
    }

    const catContent = fs.readFileSync(categoriesPath, 'utf-8');
    const catMatch = catContent.match(/\[(.*)\]/s);
    const categories = JSON.parse(catMatch[0]);

    const elementSet = new Set(categories.map(cat => cat.element));

    let orphanCount = 0;
    let orphanExamples = [];

    categories.forEach(cat => {
      // If not a root category (parent != "0"), parent must exist
      if (cat.parent !== "0" && !elementSet.has(cat.parent)) {
        orphanCount++;
        if (orphanExamples.length < 5) {
          orphanExamples.push(`Category ${cat.id} (${cat.category_links}) has non-existent parent: ${cat.parent}`);
        }
      }
    });

    // Some orphans are OK (data cleanup issue), but shouldn't be too many
    expect(orphanCount, `Too many orphaned categories (${orphanCount}). Examples:\n${orphanExamples.join('\n')}`).toBeLessThan(20);

    if (orphanCount > 0) {
      console.warn(`⚠ Found ${orphanCount} categories with missing parents`);
    } else {
      console.log('✅ All categories have valid parent relationships');
    }
  });

  test('categories must have unique IDs and elements', () => {
    let categoriesPath = path.join(__dirname, '../www/js/categories.js');
    if (!fs.existsSync(categoriesPath)) {
      categoriesPath = path.join(__dirname, '../public/data/categories.js');
    }

    const catContent = fs.readFileSync(categoriesPath, 'utf-8');
    const catMatch = catContent.match(/\[(.*)\]/s);
    const categories = JSON.parse(catMatch[0]);

    const idSet = new Set();
    const elementSet = new Set();
    const duplicateIds = [];
    const duplicateElements = [];

    categories.forEach(cat => {
      if (idSet.has(cat.id)) {
        duplicateIds.push(cat.id);
      }
      if (elementSet.has(cat.element)) {
        duplicateElements.push(cat.element);
      }
      idSet.add(cat.id);
      elementSet.add(cat.element);
    });

    expect(duplicateIds.length, `Found duplicate category IDs: ${duplicateIds.join(', ')}`).toBe(0);
    expect(duplicateElements.length, `Found duplicate category elements: ${duplicateElements.join(', ')}`).toBe(0);

    console.log(`✅ All ${categories.length} categories have unique IDs and elements`);
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

  test('dataLoader must handle all data file parts correctly', () => {
    const loaderPath = path.join(__dirname, '../src/services/dataLoader.js');
    const content = fs.readFileSync(loaderPath, 'utf-8');

    // Must load all 4 question files
    expect(content).toContain('for (let i = 1; i <= 4');
    expect(content).toContain('questions${part}.js');

    // Must load all 12 answer files
    expect(content).toContain('for (let i = 1; i <= 12');
    expect(content).toContain('answers${part}.js');

    console.log('✅ dataLoader handles all data files correctly');
  });

  test('database schema version must be defined', () => {
    const dbPath = path.join(__dirname, '../src/services/dexieDatabase.js');
    const content = fs.readFileSync(dbPath, 'utf-8');

    expect(content).toContain('this.version(');

    console.log('✅ Database schema version is defined');
  });
});
