# Manual Test Plan - Data Migration Verification

## Overview
Since there are no automated tests configured, this document provides a comprehensive manual testing plan to verify the data migration is working correctly.

## Test Environment Setup

### Prerequisites
- Browser DevTools open
- IndexedDB Inspector available
- Console logging enabled
- Fresh browser cache (clear IndexedDB before testing)

### Steps to Reset
```bash
# 1. Open DevTools (F12)
# 2. Go to Application → Storage → IndexedDB
# 3. Delete "IslamQA" database
# 4. Go to Application → Local Storage
# 5. Clear all entries for the app domain
# 6. Refresh the page
```

---

## Test Suite 1: Data Import

### Test 1.1: Import Status Check
**Expected**: Data import wizard shows on first launch

```javascript
// In browser console
// Check: dataStore.isReady should be false
console.log('Is data ready?', dataStore.isReady)
// Should show: Is data ready? false
```

**Pass Criteria**: ✅ Shows import page

---

### Test 1.2: Categories Import
**Expected**: Categories.json loads and imports successfully

```javascript
// Monitor console for:
// "📁 Loaded 268 categories from categories.json"
// "✅ Imported 268 categories"
// "Categories imported (268 total) 40%"
```

**Pass Criteria**: 
- ✅ Console shows "268 categories" loaded
- ✅ Progress bar shows 40% after categories

---

### Test 1.3: Questions Import
**Expected**: Questions.json loads and imports successfully

```javascript
// Monitor console for:
// "📝 Loaded 15622 questions from questions.json"
// "✅ Imported 15622 questions"
// "Questions imported (15622 total) 90%"
```

**Pass Criteria**:
- ✅ Console shows "15622 questions" loaded
- ✅ Progress bar shows 90% after questions
- ✅ No errors about missing "answers" table

---

### Test 1.4: Database Statistics
**Expected**: Final stats show correct counts

```javascript
// Monitor console for:
// "📊 Database stats: {categories: 268, questions: 15622}"
```

**Pass Criteria**:
- ✅ Shows 268 categories
- ✅ Shows 15622 questions
- ✅ No "answers" count (removed from new schema)

---

## Test Suite 2: Category Browsing

### Test 2.1: Root Categories Load
**Expected**: Browse page shows root categories with null parent_reference

```javascript
// In browser console
const root = await dataStore.getCategoriesByParent(null)
console.log('Root categories:', root.length)
// Should show: Root categories: X (where X > 0)
```

**Pass Criteria**:
- ✅ Root categories load without errors
- ✅ Shows multiple categories (typically 6-10 root categories)
- ✅ No "parent_reference" field has a value (all null)

---

### Test 2.2: Root Categories Display
**Expected**: Browse view shows category cards with icons and counts

**Steps**:
1. Navigate to Browse
2. Observe category cards
3. Each card should show:
   - Emoji icon (✨, ⚖️, 📖, etc.)
   - Category title (e.g., "Basic Tenets of Faith")
   - Subcategory count
   - Question count

**Pass Criteria**:
- ✅ Cards display with proper styling
- ✅ Titles use `title` field (not `category_links`)
- ✅ Icons match categories
- ✅ Counts are accurate

---

### Test 2.3: Category Navigation
**Expected**: Clicking category navigates to category page

**Steps**:
1. Click on any root category in Browse
2. Observe URL changes to `/category/X` where X is the reference ID

**Pass Criteria**:
- ✅ URL is semantic (e.g., `/category/3` not `/category/1`)
- ✅ Category page loads
- ✅ Category title displays correctly

---

## Test Suite 3: Subcategory and Question Navigation

### Test 3.1: Subcategories Load
**Expected**: Category page shows subcategories with correct hierarchy

**Steps**:
1. Navigate to category (e.g., "Basic Tenets of Faith")
2. Observe Subcategories section

**Pass Criteria**:
- ✅ Subcategories display
- ✅ Show correct parent-child relationships
- ✅ Each shows sub-count and question count
- ✅ Titles use `title` field

---

### Test 3.2: Questions Load
**Expected**: Category page shows questions for that category

**Steps**:
1. View category with questions
2. Questions section shows list

```javascript
// In console, get category and its questions
const cat = await dataStore.getCategory(3)
const questions = await dataStore.getQuestionsByCategory(cat.reference)
console.log('Questions in category:', questions.length)
```

**Pass Criteria**:
- ✅ Questions load for category
- ✅ Use `primary_category` field correctly
- ✅ Each question shows title, reference, category

---

### Test 3.3: Question Navigation
**Expected**: Clicking question navigates to question detail

**Steps**:
1. Click on any question in category
2. Observe URL changes

**Pass Criteria**:
- ✅ URL is `/question/329` (semantic reference ID)
- ✅ Question detail page loads
- ✅ Question title and content display

---

## Test Suite 4: Question Detail View

### Test 4.1: Question Display
**Expected**: Question title and HTML content display correctly

**Steps**:
1. Navigate to a question (e.g., Q#329)
2. Observe title and question content

**Expected Fields**:
- Title: `question.title` (displayed as main heading)
- Question: `question.question` (HTML content)
- Answer: `question.answer` (HTML content)

**Pass Criteria**:
- ✅ Title displays correctly
- ✅ HTML question renders properly (with formatting)
- ✅ HTML answer renders properly
- ✅ No "question_full" field errors

---

### Test 4.2: Answer Display
**Expected**: Answer HTML is embedded and displays correctly

```javascript
// In console
const q = await dataStore.getQuestion(329)
console.log('Has answer embedded?', q.answer ? 'Yes' : 'No')
console.log('Answer type:', typeof q.answer)
// Should show: Yes, string
```

**Pass Criteria**:
- ✅ Answer is present in question object
- ✅ HTML renders with formatting, lists, etc.
- ✅ No separate answer table query needed
- ✅ Content is readable

---

### Test 4.3: Question Metadata
**Expected**: Question shows correct metadata

**Pass Criteria**:
- ✅ Q# shows semantic reference ID (e.g., "Q#329")
- ✅ View count displays if available
- ✅ Category name shows (e.g., "Forbidden Matters")

---

## Test Suite 5: Bookmarking

### Test 5.1: Bookmark Toggle
**Expected**: Can bookmark and unbookmark questions

**Steps**:
1. Open a question
2. Click bookmark icon
3. Icon changes (filled vs outline)
4. Refresh page
5. Icon state persists

```javascript
// In console, check bookmarks
const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
console.log('Bookmarks:', bookmarks)
// Should show array of reference IDs, e.g., [329, 245, ...]
```

**Pass Criteria**:
- ✅ Bookmarks use `reference` IDs (not sequential)
- ✅ State persists across page reloads
- ✅ Icon toggles correctly

---

### Test 5.2: Bookmarks View
**Expected**: Bookmarks page shows saved questions

**Steps**:
1. Bookmark several questions
2. Go to Bookmarks/Folders view
3. See all bookmarked questions

**Pass Criteria**:
- ✅ All bookmarked questions display
- ✅ Titles use `title` field
- ✅ Q# shows reference IDs
- ✅ Can remove individual bookmarks
- ✅ Can clear all bookmarks

---

## Test Suite 6: Home Page

### Test 6.1: Question of the Day
**Expected**: Shows a featured question

**Steps**:
1. Go to home page
2. Observe "Question of the Day" card

**Pass Criteria**:
- ✅ Shows question title (`title` field)
- ✅ Clicking navigates to question with reference ID
- ✅ Daily question changes at midnight (or use same seed)

---

### Test 6.2: Random Questions Carousel
**Expected**: Shows 6 random questions

```javascript
// In console
const allQ = await dataStore.getAllQuestions()
console.log('Total questions in DB:', allQ.length)
// Should show: 15622
```

**Pass Criteria**:
- ✅ Shows 6 random questions
- ✅ Each shows title, category, Q#
- ✅ Category name loaded correctly from `primary_category`
- ✅ Clicking navigates to question detail

---

## Test Suite 7: Search Functionality

### Test 7.1: Search Works
**Expected**: Can search questions by text

**Steps**:
1. Go to Search page
2. Type a keyword (e.g., "prayer", "hadith")
3. Results show

```javascript
// In console
const results = await dataStore.searchQuestions('prayer')
console.log('Results:', results.length)
```

**Pass Criteria**:
- ✅ Search returns results
- ✅ Results use new data structure
- ✅ Each result shows title, category
- ✅ Clicking navigates to question

---

## Test Suite 8: Performance

### Test 8.1: Import Performance
**Expected**: Data imports in ~30 seconds

**Steps**:
1. Clear IndexedDB
2. Go to import page
3. Start import
4. Time the completion

**Pass Criteria**:
- ✅ Completes in 20-40 seconds
- ✅ Progress updates smoothly
- ✅ No hanging or freezing

---

### Test 8.2: Navigation Performance
**Expected**: Page loads are fast

**Steps**:
1. Measure page load times
2. Browse categories (should be instant)
3. Load questions (should be instant)

**Pass Criteria**:
- ✅ Category loads < 1 second
- ✅ Questions load < 1 second
- ✅ Smooth scrolling, no lag

---

## Test Suite 9: Data Integrity

### Test 9.1: Category Hierarchy
**Expected**: Parent-child relationships are correct

```javascript
// In console
const cat = await dataStore.getCategory(3)  // Root category
console.log('Has parent?', cat.parent_reference)  // Should be null
console.log('Children:', cat.children_references)  // Should be array
```

**Pass Criteria**:
- ✅ Root categories have `parent_reference: null`
- ✅ Non-root have correct parent reference
- ✅ `children_references` array is populated

---

### Test 9.2: Question-Category Link
**Expected**: Questions linked to correct categories

```javascript
// In console
const q = await dataStore.getQuestion(329)
console.log('Primary category:', q.primary_category)
console.log('All categories:', q.categories)
// Should show arrays of references
```

**Pass Criteria**:
- ✅ `primary_category` is a number (reference)
- ✅ `categories` is an array of numbers
- ✅ All references are valid

---

## Test Suite 10: Edge Cases

### Test 10.1: Non-existent Question
**Expected**: Returns null gracefully

```javascript
// In console
const q = await dataStore.getQuestion(99999)
console.log('Non-existent question:', q)  // Should be null
```

**Pass Criteria**:
- ✅ No error thrown
- ✅ Returns null
- ✅ UI shows "Not found" gracefully

---

### Test 10.2: Category with No Questions
**Expected**: Shows empty state correctly

**Steps**:
1. Find a category with no questions (rare)
2. View category

**Pass Criteria**:
- ✅ Shows "No subcategories or questions" message
- ✅ No errors
- ✅ Navigation still works

---

## Test Suite 11: Browser Compatibility

### Test 11.1: Desktop Browser
**Steps**:
1. Test in Chrome, Firefox, Safari
2. Run through Test Suites 1-9

**Pass Criteria**: ✅ All tests pass in all browsers

---

### Test 11.2: Mobile Browser
**Steps**:
1. Test on iPhone/iPad
2. Test on Android
3. Run through Test Suites 1-9

**Pass Criteria**: ✅ All tests pass on mobile

---

## Test Suite 12: Cordova Build

### Test 12.1: Build Succeeds
```bash
yarn build
```

**Pass Criteria**:
- ✅ No TypeScript errors
- ✅ Build completes successfully
- ✅ No warnings about missing fields

---

### Test 12.2: App Runs on Device
```bash
yarn cordova:build:android
# or
yarn cordova:build:ios
```

**Pass Criteria**:
- ✅ Builds successfully
- ✅ Installs on device
- ✅ Data imports correctly
- ✅ All features work

---

## Issue Checklist

### If tests fail, check:

**Import fails:**
- [ ] Is `public/data/categories.json` present?
- [ ] Is `public/data/questions.json` present?
- [ ] Are files valid JSON?
- [ ] Check browser console for errors

**Data not loading:**
- [ ] Check IndexedDB in DevTools
- [ ] Verify table names: `categories`, `questions`
- [ ] Check for JavaScript errors in console
- [ ] Verify Dexie schema matches code

**Navigation broken:**
- [ ] Check URL parameters are using `reference` IDs
- [ ] Verify router is finding correct views
- [ ] Check for 404 errors in console

**Display issues:**
- [ ] Check field names match (title, reference, answer)
- [ ] Verify fallbacks are working (`title || category_links`)
- [ ] Check HTML rendering in answer field

---

## Test Results Template

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
Test Suite 6: Home Page ___ PASS / FAIL
Test Suite 7: Search _______ PASS / FAIL
Test Suite 8: Performance __ PASS / FAIL
Test Suite 9: Data Integrity _ PASS / FAIL
Test Suite 10: Edge Cases __ PASS / FAIL
Test Suite 11: Compatibility _ PASS / FAIL
Test Suite 12: Build _______ PASS / FAIL

Overall Result: __________ PASS / FAIL

Issues Found:
___________________________
___________________________
___________________________
```

---

## Sign-Off

Once all tests pass, the migration is complete and ready for production deployment.

**Migration Ready**: _____ YES / NO
**Tester Name**: ___________________
**Date**: _______________________
