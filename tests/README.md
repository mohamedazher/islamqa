# Breakage Detection Tests

## 🎯 Purpose

These tests catch **critical app failures** before deployment. They focus on the most common ways the app breaks:

1. **Data structure changes** - If you modify categories.js or questions/answers files incorrectly
2. **Missing files** - If critical files are accidentally deleted
3. **Service integrity** - If database or data loading services are broken
4. **Component integrity** - If critical Vue components are missing
5. **Data relationships** - If category/question relationships are broken

## 🏗️ Architecture

**Your app uses:**
- **Vue 3** - Modern reactive UI framework
- **Vite** - Fast build tool
- **Dexie (IndexedDB)** - Client-side database (replaced old SQLite)
- **Cordova** - Cross-platform mobile wrapper

**Data flow:**
```
Data files (www/js/*.js)
  → dataLoader.js (fetches and parses)
    → dexieDatabase.js (stores in IndexedDB)
      → Vue components (display)
```

## 🚀 Quick Start

```bash
# Install dependencies (first time only)
yarn install

# Run breakage detection tests only
yarn test:breakage

# Run quiz and bookmarks tests only
yarn test:features

# Run all tests (recommended before deployment)
yarn test:all

# Run tests in watch mode (for development)
yarn test:watch
```

## ✅ What Gets Tested

### Core App Tests (16 tests)

#### 1. Data Files Structure (CRITICAL)
- ✓ categories.js has 200+ categories with required fields
- ✓ All 4 question files exist (questions1-4.js)
- ✓ All 12 answer files exist (answers1-12.js)
- ✓ Data files have valid JSON structure
- ✓ Categories have unique IDs and elements

### 2. Service Files Integrity (CRITICAL)
- ✓ dexieDatabase.js exists with required schema
- ✓ dataLoader.js exists with import methods
- ✓ searchService.js exists
- ✓ All required database methods are defined

### 3. Vue Components Integrity
- ✓ All critical view components exist
- ✓ App.vue exists and is valid
- ✓ Component templates are not broken

### 4. Data Relationships (CRITICAL)
- ✓ Categories have valid parent relationships
- ✓ No excessive orphaned categories
- ✓ No duplicate category IDs or elements

### 5. Build Configuration
- ✓ package.json has Vue, Dexie, Vite dependencies
- ✓ config.xml is valid Cordova configuration
- ✓ Main entry point (src/main.js) exists

#### 6. Data Loading Logic
- ✓ dataLoader handles all 4 question files
- ✓ dataLoader handles all 12 answer files
- ✓ Database schema version is defined

### Quiz & Bookmarks Tests (18 tests)

#### 7. Quiz System - Data File Integrity (CRITICAL)
- ✓ quiz-questions.json exists (both Cordova and web builds)
- ✓ Quiz data has valid structure (version, totalQuizzes, quizzes array)
- ✓ Has minimum 100 quizzes (currently 445!)
- ✓ Each quiz has required fields (id, questionText, type, difficulty, category, options)
- ✓ Each option has valid structure (id, text, isCorrect)
- ✓ **Each quiz has exactly one correct answer** (validates all 445 quizzes)
- ✓ Valid difficulty levels (easy, medium, hard) - distribution shown
- ✓ Valid question types (multiple-choice, true-false)
- ✓ Diverse categories (11 unique categories found)

#### 8. Quiz Service Integrity
- ✓ quizService.js exists with required methods
- ✓ QuizView.vue component exists

#### 9. Bookmarks System - Database Schema
- ✓ Database has folders and folder_questions tables
- ✓ Database has all bookmark methods (createFolder, deleteFolder, addQuestionToFolder, etc.)
- ✓ Database schema supports folder operations with proper indexes

#### 10. Bookmarks System - UI Components
- ✓ FoldersView.vue exists with bookmark UI
- ✓ QuestionView.vue exists with bookmark functionality

#### 11. Quiz and Bookmarks Integration
- ✓ Router has quiz and bookmarks routes
- ✓ Quiz categories align with question system

## 📊 Test Output Example

**All Tests Combined (34 tests total)**
```
 ✓ tests/breakage-detection.test.js (16 tests)
 ✓ tests/quiz-and-bookmarks.test.js (18 tests)

Test Files  2 passed (2)
     Tests  34 passed (34)
  Duration  2.68s
```

**Breakage Detection Tests**

```
 ✓ tests/breakage-detection.test.js (18 tests) 450ms

   ✓ Data Files Structure (CRITICAL) (4)
     ✓ categories.js must have valid structure
       ✅ Found 269 categories with 9 root categories
     ✓ all 4 questions files must exist and be valid
       ✅ All 4 question files exist and are valid
     ✓ all 12 answer files must exist
       ✅ All 12 answer files exist
     ✓ sample question file has valid structure
       ✅ Question files have valid structure

   ✓ Service Files Integrity (CRITICAL) (3)
     ✓ dexieDatabase.js must exist and have required schema
       ✅ dexieDatabase.js has required schema and methods
     ✓ dataLoader.js must exist and have required methods
       ✅ dataLoader.js has required methods
     ✓ all critical service files must exist
       ✅ All critical service files exist

   ✓ Vue Components Integrity (2)
     ✓ critical view components must exist
       ✅ All critical view components exist
     ✓ App.vue must exist and be valid
       ✅ App.vue exists and is valid

   ✓ Data Relationships (CRITICAL) (2)
     ✓ categories must have valid parent relationships
       ✅ All categories have valid parent relationships
     ✓ categories must have unique IDs and elements
       ✅ All 269 categories have unique IDs and elements

   ✓ Build Configuration (3)
     ✓ package.json must have required dependencies
       ✅ package.json has all required dependencies
     ✓ config.xml must be valid Cordova configuration
       ✅ config.xml is valid
     ✓ main entry point must exist
       ✅ Main entry point exists

   ✓ Data Loading Logic (2)
     ✓ dataLoader must handle all data file parts correctly
       ✅ dataLoader handles all data files correctly
     ✓ database schema version must be defined
       ✅ Database schema version is defined

Test Files  1 passed (1)
     Tests  18 passed (18)
      Time  450ms
```

## 🔧 When to Run Tests

### Automatically (CI/CD)
Tests run automatically on:
- Every push to main/master/develop branches
- Every pull request
- Before building Android/iOS releases (`yarn cordova:build:android`)
- Before deploying web version (`yarn predeploy`)

### Manually
Run tests manually when you:
- Modify categories.js
- Modify questions or answers files
- **Modify quiz-questions.json**
- **Add or edit quiz data**
- Change database schema in dexieDatabase.js
- Update dataLoader.js or quizService.js
- Add/remove Vue components
- **Modify bookmark/folder functionality**
- Before committing data changes

## 🚨 Common Failures and Fixes

### ❌ Test: "categories.js must have valid structure" fails

**Cause:** You edited categories.js and broke the JSON structure

**Fix:**
1. Check for syntax errors (missing commas, quotes)
2. Ensure all categories have required fields: `id`, `category_links`, `category_url`, `element`, `parent`
3. Validate structure: Each field should be a string
4. Test parsing: Open browser console and paste the file content

**Example of valid category:**
```json
{
  "id": "1",
  "category_links": "Basic Tenets of Faith",
  "category_url": "cat/218",
  "element": "218",
  "parent": "0"
}
```

### ❌ Test: "all 4 questions files must exist" fails

**Cause:** One or more question files are missing or renamed

**Fix:** Ensure these files exist:
- `www/js/questions1.js` (or `public/data/questions1.js`)
- `www/js/questions2.js`
- `www/js/questions3.js`
- `www/js/questions4.js`

### ❌ Test: "dexieDatabase.js must have required schema" fails

**Cause:** You modified the database service and removed critical code

**Fix:** Ensure dexieDatabase.js has:
- Table definitions: `categories`, `questions`, `answers`, `folders`
- Methods: `importCategories`, `importQuestions`, `importAnswers`
- Schema version: `this.version(1).stores({...})`

### ❌ Test: "categories must have valid parent relationships" fails

**Cause:** Too many categories have non-existent parent references

**Fix:**
1. Check the test output for orphaned category examples
2. Either add the missing parent categories, or fix the parent references
3. Root categories should have `parent: "0"`

### ❌ Test: "dataLoader must handle all data file parts" fails

**Cause:** You modified dataLoader.js and changed the file loading logic

**Fix:** Ensure dataLoader.js has:
- Loop for questions: `for (let i = 1; i <= 4; i++)`
- Loop for answers: `for (let i = 1; i <= 12; i++)`
- Template literals: `` `questions${part}.js` ``, `` `answers${part}.js` ``

### ❌ Test: "quiz-questions.json must exist" fails

**Cause:** Quiz data file is missing or in wrong location

**Fix:** Ensure quiz-questions.json exists in:
- `www/data/quiz-questions.json` (for Cordova builds)
- `public/data/quiz-questions.json` (for web builds)

### ❌ Test: "each quiz must have exactly one correct answer" fails

**Cause:** You edited quiz-questions.json and broke the answer structure

**Fix:**
1. Check the test output for which quiz IDs have errors
2. Ensure each quiz has exactly one option with `isCorrect: true`
3. All other options must have `isCorrect: false`

**Example of valid quiz options:**
```json
"options": [
  { "id": "a", "text": "Correct answer", "isCorrect": true },
  { "id": "b", "text": "Wrong answer", "isCorrect": false },
  { "id": "c", "text": "Wrong answer", "isCorrect": false }
]
```

### ❌ Test: "quizzes must have valid difficulty levels" fails

**Cause:** You added quizzes with invalid difficulty values

**Fix:** Ensure all quizzes have difficulty set to one of:
- `"easy"`
- `"medium"`
- `"hard"`

### ❌ Test: "database must have bookmark methods" fails

**Cause:** You modified dexieDatabase.js and removed bookmark functionality

**Fix:** Ensure dexieDatabase.js has these methods:
- `createFolder()`
- `deleteFolder()`
- `addQuestionToFolder()`
- `removeQuestionFromFolder()`
- `getQuestionsInFolder()`
- `getFolders()`

## 🛡️ What These Tests DON'T Catch

These are **smoke tests** - they catch obvious breakage, but won't catch:
- Logic bugs in Vue components
- UI rendering issues
- Performance problems
- Edge cases in search functionality
- Race conditions in data loading

For those, you'll need:
- Unit tests for individual functions
- Component tests for Vue components
- E2E tests for full user flows
- Manual testing

## 📝 Adding More Tests

To add tests for new features:

```javascript
describe('My New Feature', () => {
  test('should not break when...', () => {
    // Your test code
    const result = someFunction();
    expect(result).toBe(expected);
  });
});
```

## 🎓 Test Framework

- **Framework:** [Vitest](https://vitest.dev/) - Fast, Vite-native testing
- **Test Runner:** Node.js environment
- **Assertions:** `expect()` API (Jest-compatible)

## 🤔 Why These Specific Tests?

Each test targets a **real breakage scenario**:

1. **Data structure tests** - Catches when you accidentally break JSON while editing data
2. **File existence tests** - Catches when files are accidentally deleted or renamed
3. **Service tests** - Catches when critical code is removed during refactoring
4. **Component tests** - Catches when Vue files are deleted
5. **Relationship tests** - Catches data inconsistencies that crash the app
6. **Config tests** - Catches broken dependencies or build configuration

## 📚 Learn More

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://vitest.dev/guide/best-practices)
- [Vue Test Utils](https://test-utils.vuejs.org/) - For component testing (future)
