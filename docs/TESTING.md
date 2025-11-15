# Testing Strategy & Guide

This document provides comprehensive testing guidance for the IslamQA application.

## Current State

- **Testing Framework**: Vitest (configured and active)
- **Automated Tests**: 56 tests across 3 test suites
- **Test Files**:
  - `tests/breakage-detection.test.js` (19 tests)
  - `tests/quiz-and-bookmarks.test.js` (14 tests)
  - `tests/data-import.test.js` (23 tests)
- **Manual Testing**: Recommended for UI/UX verification
- **CI/CD Testing**: Integrated in build scripts (runs before deploy)
- **Coverage**: Critical paths covered (data import, quiz system, database operations)

---

## Running Automated Tests

### Quick Start

```bash
# Run all tests
yarn test:all

# Run specific test suites
yarn test:breakage     # Data structure & critical service tests
yarn test:features     # Quiz & bookmark functionality tests

# Run tests in watch mode (for development)
yarn test:watch

# Run a specific test file
yarn test tests/data-import.test.js
```

### Test Suites Overview

#### 1. Breakage Detection Tests (`tests/breakage-detection.test.js`)
**Purpose**: Catch critical app failures before deployment

**Coverage**:
- ✅ Data file structure (categories.json, questions.json)
- ✅ Service file integrity (dexieDatabase, dataLoader)
- ✅ Vue component existence
- ✅ Data relationships and uniqueness
- ✅ Build configuration validation

**When to run**: Before every commit/deploy

#### 2. Quiz & Bookmarks Tests (`tests/quiz-and-bookmarks.test.js`)
**Purpose**: Validate quiz and bookmark features

**Coverage**:
- ✅ Quiz data file structure and integrity
- ✅ Quiz question validation (options, correct answers, difficulty)
- ✅ Database schema for folders/bookmarks
- ✅ Quiz service methods
- ✅ UI component existence

**When to run**: When changing quiz or bookmark features

#### 3. Data Import Tests (`tests/data-import.test.js`)
**Purpose**: Test data loading and import pipeline

**Coverage**:
- ✅ DataLoader.loadQuizQuestions() unit tests
- ✅ DexieDatabase quiz import operations
- ✅ Quiz data mapping and validation
- ✅ Integration tests for full import flow
- ✅ Regression prevention for quiz import bug

**When to run**: When modifying data import logic

**Key Features**:
- **Regression Prevention**: Tests specifically designed to catch the quiz import bug that was fixed
- **Unit Tests**: Individual method testing for loadQuizQuestions(), bulkImportQuizQuestions()
- **Integration Tests**: End-to-end import flow validation
- **Schema Validation**: Ensures database schema supports all quiz operations

### What These Tests Would Have Caught

The new `data-import.test.js` suite contains 23 tests that would have caught the quiz import bug:

1. ❌ **Bug**: `loadQuizQuestions()` returned object instead of array
   - ✅ **Test**: "loadQuizQuestions() must return an array, not an object"

2. ❌ **Bug**: `data.length` was undefined in logs
   - ✅ **Test**: "REGRESSION: quiz import must not return undefined length"

3. ❌ **Bug**: Quiz questions never imported (empty table)
   - ✅ **Test**: "bulkImportQuizQuestions() must handle array input correctly"

4. ❌ **Bug**: Quiz feature completely broken
   - ✅ **Test**: "all quiz modes must require LLM-generated quiz questions"

---

## Manual Testing Checklist

Before committing any changes, verify:

- [ ] Data imports successfully (should show 268 categories, 15,622 questions)
- [ ] Browse view loads root categories
- [ ] Category view displays subcategories and questions
- [ ] Question view displays title, question, and answer correctly
- [ ] Navigation works correctly (/category/3, /question/329)
- [ ] Bookmarking uses semantic IDs and persists
- [ ] Sharing works with embedded answer
- [ ] Home page shows question of the day and random questions
- [ ] Search functionality works with fuzzy matching
- [ ] Dark mode toggles properly
- [ ] Mobile responsive on actual device
- [ ] No console errors or warnings
- [ ] Build succeeds without errors

---

## Test Suites

### Suite 1: Data Import

**Test 1.1: Import Status Check**
- Expected: Data import wizard shows on first launch
- How to test: Clear browser IndexedDB, refresh app
- Pass criteria: ✅ Shows import page

**Test 1.2: Categories Import**
- Expected: categories.json loads successfully
- Monitor console for: "✅ Imported 268 categories"
- Pass criteria: ✅ Progress bar shows 40% after categories

**Test 1.3: Questions Import**
- Expected: questions.json loads successfully
- Monitor console for: "✅ Imported 15622 questions"
- Pass criteria: ✅ Progress bar shows 90% after questions

**Test 1.4: Database Statistics**
- Expected: Final stats show 268 categories, 15,622 questions
- Command: `await dataStore.getStats()`
- Pass criteria: ✅ Correct counts, no errors

---

### Suite 2: Category Browsing

**Test 2.1: Root Categories Load**
```javascript
// In browser console:
const root = await dataStore.getCategoriesByParent(null)
console.log('Root categories:', root.length)  // Should be > 0
```

**Test 2.2: Root Categories Display**
1. Navigate to Browse
2. Observe category cards display with:
   - Category title (from `title` field)
   - Subcategory count
   - Question count
   - Proper styling

**Test 2.3: Category Navigation**
1. Click any root category
2. URL should change to `/category/X` where X is the reference ID (semantic)
3. Category page should load correctly

---

### Suite 3: Subcategories & Questions

**Test 3.1: Subcategories Load**
1. Navigate to any category (e.g., "Basic Tenets of Faith")
2. Subcategories section shows with correct parent-child relationships
3. Pass criteria: ✅ All relationships correct

**Test 3.2: Questions Load**
```javascript
// In console:
const cat = await dataStore.getCategory(3)
const questions = await dataStore.getQuestionsByCategory(cat.reference)
console.log('Questions in category:', questions.length)
```

**Test 3.3: Question Navigation**
1. Click on any question in category
2. URL changes to `/question/329` (reference ID)
3. Question detail page loads

---

### Suite 4: Question Detail View

**Test 4.1: Question Display**
- Title displays correctly (from `title` field)
- HTML question renders properly (from `question` field)
- HTML answer renders properly (from `answer` field - embedded)

**Test 4.2: Answer Display**
```javascript
// In console:
const q = await dataStore.getQuestion(329)
console.log('Has answer embedded?', q.answer ? 'Yes' : 'No')
// Should show: Yes
```

**Test 4.3: Question Metadata**
- Shows Q# with semantic reference ID
- Shows view count if available
- Shows category name correctly

---

### Suite 5: Bookmarking

**Test 5.1: Bookmark Toggle**
1. Open a question
2. Click bookmark icon (should toggle between filled/outline)
3. Refresh page - icon state should persist
4. Bookmarks should use semantic reference IDs

**Test 5.2: Bookmarks View**
1. Bookmark several questions
2. Go to Bookmarks/Folders view
3. All bookmarked questions should display
4. Titles use `title` field
5. Q# shows reference IDs

---

### Suite 6: Search Functionality

**Test 6.1: Search Works**
```javascript
// In console:
const results = await dataStore.searchQuestions('prayer')
console.log('Results:', results.length)  // Should be > 0
```

**Test 6.2: Fuzzy Search**
- Typo-tolerant search works (e.g., "profet" finds "prophet")
- Multi-word searches work
- Results display correctly

---

### Suite 7: Dark Mode

**Test 7.1: Toggle Dark Mode**
1. Click theme toggle button
2. App switches to dark mode
3. Refresh page - preference persists

**Test 7.2: Dark Mode Coverage**
- Home view fully visible in dark mode
- Browse view fully visible in dark mode
- Question view fully visible in dark mode
- All text readable (good contrast)
- No broken colors or styles

---

### Suite 8: Performance

**Test 8.1: Import Time**
- Data imports in approximately 30 seconds
- Progress updates smoothly
- No hanging or freezing

**Test 8.2: Navigation Speed**
- Category loads < 1 second
- Questions load < 1 second
- Question detail loads instantly
- Smooth scrolling, no lag

---

### Suite 9: Mobile Responsiveness

**Test 9.1: Mobile Layout**
1. Open app in mobile browser (Chrome DevTools mobile view)
2. All views display correctly
3. No overflow or broken layouts

**Test 9.2: Touch Interactions**
1. Tap category cards - should navigate
2. Tap questions - should open detail
3. Tap bookmarks button - should toggle
4. Tap search - should show results

---

### Suite 10: Data Integrity

**Test 10.1: Category Hierarchy**
```javascript
// In console:
const cat = await dataStore.getCategory(3)
console.log('Has parent?', cat.parent_reference)  // null for root
console.log('Children:', cat.children_references)  // Should be array
```

**Test 10.2: Question-Category Link**
```javascript
// In console:
const q = await dataStore.getQuestion(329)
console.log('Primary category:', q.primary_category)  // Should be number
console.log('All categories:', q.categories)  // Should be array
```

---

### Suite 11: Edge Cases

**Test 11.1: Non-existent Question**
```javascript
// In console:
const q = await dataStore.getQuestion(99999)
console.log('Result:', q)  // Should be null, no error
```

**Test 11.2: Category with No Questions**
1. Find a category with no direct questions (rare)
2. View category page
3. Should show empty state gracefully

---

### Suite 12: Browser Compatibility

**Test 12.1: Desktop Browsers**
- Test in Chrome, Firefox, Safari
- Run through Suites 1-11

**Test 12.2: Mobile Browsers**
- Test on iPhone/iPad
- Test on Android
- Run through Suites 1-11

---

### Suite 13: Build & Deployment

**Test 13.1: Web Build**
```bash
yarn build:web
# Check for errors
# Should create dist/ folder
```

**Test 13.2: Cordova Build**
```bash
yarn build
yarn cordova:build:android
# Should create APK
```

---

## Test Environment Setup

### Prerequisites
- Browser DevTools open
- IndexedDB Inspector available
- Console logging enabled

### Steps to Reset Database
```
1. Open DevTools (F12)
2. Go to Application → Storage → IndexedDB
3. Delete "IslamQA" database
4. Go to Application → Local Storage
5. Clear all entries for the app domain
6. Refresh the page
```

---

## Issues to Watch For

### If Data Import Fails
- Check `public/data/categories.json` and `questions.json` exist
- Verify files are valid JSON
- Check browser console for specific error messages
- Try clearing IndexedDB and retrying

### If Navigation Broken
- Check routes use semantic `reference` IDs (not database row IDs)
- Verify router is finding correct views
- Check for 404 errors in console

### If Display Issues
- Check field names match current schema (title, reference, answer)
- Verify fallbacks are working
- Check HTML rendering in answer field

### If Dark Mode Broken
- Check `dark:` classes in component
- Verify `useTheme()` is imported
- Check localStorage for theme preference key

---

## Test Results Template

Use this template to document manual testing:

```
Date: ___________
Tester: __________
Browser: ________
Platform: ________

Test Suite 1: Import _______ PASS / FAIL
Test Suite 2: Browse _______ PASS / FAIL
Test Suite 3: Navigation ___ PASS / FAIL
Test Suite 4: Question Detail _ PASS / FAIL
Test Suite 5: Bookmarks ___ PASS / FAIL
Test Suite 6: Search _______ PASS / FAIL
Test Suite 7: Dark Mode ___ PASS / FAIL
Test Suite 8: Performance __ PASS / FAIL
Test Suite 9: Responsive ___ PASS / FAIL
Test Suite 10: Data Integrity _ PASS / FAIL
Test Suite 11: Edge Cases __ PASS / FAIL
Test Suite 12: Compatibility _ PASS / FAIL
Test Suite 13: Build _______ PASS / FAIL

Overall Result: __________ PASS / FAIL

Issues Found:
___________________________
___________________________
___________________________
```

---

## Future: Automated Testing

When ready to implement automated tests:

**Recommended Stack**:
- Framework: Vitest (10x faster than Jest)
- DOM: happy-dom (lightweight)
- Testing Library: @testing-library/vue
- Database: sql.js (in-memory SQLite for tests)

**Priority Test Areas**:
1. Database operations (dexieDatabase.js) - 100% coverage
2. Data import pipeline (dataLoader.js) - 95% coverage
3. Search functionality (searchService.js) - 90% coverage
4. Navigation (router, views) - 85% coverage

See **PROGRESS.md** for more details on future test implementation.

---

## Before Creating a Pull Request

Ensure:
- [ ] All 13 test suites pass (manual)
- [ ] No console errors or warnings
- [ ] Build succeeds without errors
- [ ] Tested on at least mobile and desktop
- [ ] Dark mode looks correct
- [ ] Performance acceptable (no lag)

---

## Getting Help

- **Test Questions**: Check browser DevTools console for specific error messages
- **Data Issues**: Use console commands to inspect database state
- **Build Errors**: Run `yarn build` for detailed error output
- **Claude Code**: Use `/help` command for assistance

