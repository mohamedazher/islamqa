# Automated Testing Strategy for BetterIslam Q&A App

## Executive Summary

This document provides a comprehensive testing strategy for the BetterIslam Q&A Cordova hybrid mobile application. The app currently has **zero automated tests** and relies entirely on manual testing. This analysis identifies critical functions, data integrity risks, and recommends a phased testing implementation approach.

---

## 1. Current State Analysis

### 1.1 Codebase Structure (Critical Files)

**Legacy Architecture Files:**
```
www/js/
├── dbFunctions.js        (27 KB) - Database adapter & operations
├── renderCode.js         (21 KB) - Main UI rendering logic
├── utilcode.js           (21 KB) - Navigation & utilities
├── categories.js         (35 KB) - Category data (~269 entries)
├── questions1-4.js       (5.5 MB) - Q&A data (split for memory limits)
├── answers1-12.js        (38 MB) - Answer HTML content
└── latest_questions.js   (3.5 KB) - Featured questions data
```

**Modern Architecture Files (Partially Migrated):**
```
src/
├── App.vue               - Vue 3 app root
├── components/           - Vue components
├── stores/               - Pinia state management
└── modules/
```

### 1.2 Technology Stack
- **Framework**: Apache Cordova (hybrid mobile)
- **Build Tools**: Vite (modern web build), Cordova CLI (mobile)
- **Frontend**: Vue 3, jQuery (legacy code)
- **Database**: SQLite (via cordova-sqlite-storage plugin)
- **State Management**: Pinia (new), localStorage (legacy)
- **Languages**: JavaScript, HTML, CSS

### 1.3 Existing Test Infrastructure
- **No test framework installed** (Jest, Mocha, Vitest missing)
- **No test files** (No .test.js, .spec.js files found)
- **No CI/CD testing** (GitHub Actions only runs build, no test step)
- **Manual testing only** (Android device & iOS simulator required)

---

## 2. Critical Functions Requiring Automated Tests

### 2.1 Database Operations (HIGHEST PRIORITY)

**File**: `www/js/dbFunctions.js`

#### Function: `WebSqlAdapter.executeQuery(qry)`
```javascript
// Lines 474-490
this.executeQuery = function (qry) {
    var deferred = $.Deferred();
    this.db.transaction(
        function (tx) {
            var sql = qry;
            tx.executeSql(sql, [], function (tx, results) {
                deferred.resolve(results);
            });
        },
        function (error) {
            deferred.reject("Transaction Error: " + error.message);
        }
    );
    return deferred.promise();
};
```

**Why Test**: 
- Single point of failure for all database reads/writes
- Promise/Deferred pattern must handle async operations correctly
- SQL injection vulnerabilities if parameterized queries not used
- Transaction error handling must gracefully recover

**Test Cases**:
1. **Valid SELECT query** - Should return ResultSet with rows
2. **INSERT operation** - Should resolve with insertId
3. **UPDATE operation** - Should update records without error
4. **DELETE operation** - Should delete records and return rowsAffected
5. **Invalid SQL** - Should reject with error message
6. **Transaction rollback** - Should revert all changes on error
7. **Concurrent queries** - Should handle multiple simultaneous operations
8. **Large result sets** - Should not timeout with 1000+ rows

#### Function: `WebSqlAdapter.batchExecuteQuery(array)`
```javascript
// Lines 607-625
this.batchExecuteQuery = function (array) {
    var deferred = $.Deferred();
    this.db.transaction(
        function (tx) {
            for(var i = 0; i<array.length;i++){
                tx.executeSql(array[i]);
                if(i== (array.length-1)){
                    deferred.resolve('done');
                }
            }
        },
        // error callback...
    );
    return deferred.promise();
};
```

**Why Test**:
- Used for data import - critical for app initialization
- Must execute multiple SQL statements atomically
- **BUG IDENTIFIED**: No error handling in executeSql - queries may fail silently

**Test Cases**:
1. **Multiple INSERT statements** - All should succeed or all fail
2. **Mixed operations** - INSERT, UPDATE, DELETE in sequence
3. **Statement with error** - Should reject entire batch
4. **Empty array** - Should handle gracefully
5. **Large batch** - 100+ statements
6. **Atomic transaction** - Verify ACID properties

---

### 2.2 Data Import & Validation (HIGH PRIORITY)

**File**: `www/js/dbFunctions.js`

#### Functions: `populateCats()`, `populateLatest()`, `populateQuest()`, `populateAns()`
```javascript
// Lines 268-321 (populateCats example)
function populateCats(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS CATEGORIES (...)');
    // ... more CREATE/DELETE statements ...
    var catLen = catData.length - 1;
    $.each(catData, function (index, catData) {
        tx.executeSql('INSERT INTO CATEGORIES (id, category_links, ...) 
                       VALUES (?, ?, ?, ?, ?)',
            [catData.id, catData.category_links, ...]);
        if (index == catLen) {
            // Load next data file
            loadLatest();
        }
    });
}
```

**Why Test**:
- **Multi-step import process** - 3 wizard steps, each loading ~50MB data
- **Data validation missing** - No checks for null/empty values
- **SQL injection via string concatenation** - Some queries use string concat
- **Race conditions** - Multiple callbacks with interdependencies
- **Disk space** - Database grows to ~50MB, device may run out of space

**Data Structures to Validate**:

```javascript
// Categories (269 entries)
{
    id: "1",
    category_links: "Basic Tenets of Faith",
    category_url: "cat/218",
    element: "218",
    parent: "0",  // 0 = root
    status: "done"
}

// Questions (8000+ entries)
{
    id: "1",
    category_id: "218",
    question: "Ruling on...",  // short form
    question_full: "What is the ruling...",  // long form
    question_url: "/en/115156",
    question_no: "115156",
    status: "done"
}

// Answers (one per question, HTML content)
{
    id: integer,
    question_id: integer,
    answers: "<p>Answer text with HTML...</p>"  // 1-100KB per record
}
```

**Test Cases**:
1. **Validate category hierarchy** - parent IDs must exist
2. **Check question integrity** - No duplicate question_no
3. **Verify answer references** - question_id must exist in QUESTIONS
4. **Test missing fields** - Reject records missing required fields
5. **Validate data types** - category_id must be integer
6. **Check string lengths** - question text within reasonable bounds
7. **Detect HTML injection** - Sanitize answer content if needed
8. **Test import rollback** - If step 2 fails, step 1 data still exists

---

### 2.3 View Rendering (MEDIUM PRIORITY)

**File**: `www/js/renderCode.js`

#### Function: `renderCards()`
```javascript
// Lines 55-97
function renderCards() {
    onNav();
    var qry = 'SELECT * FROM CATEGORIES WHERE ELEMENT in (...)';
    adapter.executeQuery(qry).done(function (results) {
        // Complex query building for random categories
        adapter.executeQuery(qry).done(function (results) {
            cardData = results;
            layoutColumns();
            $(window).resize(onResize);
        })
    });
}
```

**Why Test**:
- **Complex SQL with UNION** - Easy to break when modifying
- **DOM manipulation** - jQuery depends on HTML structure
- **Responsive layout** - Column count changes on resize
- **Template rendering** - Handlebars templates must have correct data

**Test Cases**:
1. **Render with no questions** - Should handle empty results gracefully
2. **Render with 1 category** - Should still display properly
3. **Render with max categories** - Should handle 9+ categories
4. **Window resize** - Should recalculate columns correctly
5. **Question counts** - Should display correct count per category
6. **HTML structure validation** - Should generate valid DOM

#### Function: `loadNext(id, skip, count, query)` (Search & Pagination)
```javascript
// Lines 261-412
function loadNext(id, skip, count, query) {
    if (getStorageItem('upgrade4') != 'false') {
        return;
    }
    
    var qry = '';
    
    if (query == 'random32') {
        qry = 'SELECT * FROM QUESTIONS LIMIT ' + randNum + ',' + count;
    }
    else if (query == 'latest') {
        qry = 'SELECT * FROM QUESTIONS WHERE QUESTION_NO in 
               (SELECT QUESTION_NO from LATEST_QUESTIONS) ...';
    }
    else if (query != '%') {
        // SEARCH functionality
        resultArray = processSearch(query);
        // Multiple UNION queries with dynamic where clauses
        qry = qry0 + ' UNION ' + qry1 + ' UNION ' + qry2 + ...
    }
}
```

**Why Test**:
- **SQL string concatenation** - Vulnerable to injection with search terms
- **Search logic complexity** - Stop word removal, multi-word searches
- **Pagination** - Skip/offset may be out of bounds
- **Multiple result formats** - Different query paths return different data structures

**Test Cases**:
1. **Search with special characters** - ' " ; -- ) 
2. **Multi-word search** - Should match all words
3. **Search with stop words** - "the", "a", "is" should be filtered
4. **Search with quotes** - Exact phrase matching
5. **Empty search results** - Should handle gracefully
6. **Pagination boundaries** - skip=0, skip=9999, count=1, count=1000
7. **Latest questions filter** - Should return only LATEST_QUESTIONS entries
8. **Favorites filter** - Should return only FAV records
9. **Folder questions** - Should filter by FOLDER_QUESTIONS correctly

#### Function: `renderAns(id)`
```javascript
// Lines 463-519
function renderAns(id) {
    var qry = "SELECT * FROM QUESTIONS WHERE question_no ='" + id + "'";
    adapter.executeQuery(qry).done(function (results) {
        // Get question details
        question = results.rows.item(0).question_full;
        questionNo = results.rows.item(0).question_no;
    });
    
    qry = 'SELECT * FROM ANSWERS WHERE QUESTION_ID in 
           (select id from questions where question_no = "' + id + '")';
    adapter.executeQuery(qry).done(function (results) {
        htmlDiv = getCompiledHtml("answersTemplate", 
            { results: [results, question, questionUrl, ...] });
    });
}
```

**Why Test**:
- **SQL injection vulnerability** - Direct string concatenation with id parameter
- **Race condition** - Two sequential queries, second depends on first
- **Template rendering** - HTML content is user-supplied from database

**Test Cases**:
1. **Valid question_no** - Should load question and answer
2. **Invalid question_no** - Should handle missing question gracefully
3. **SQL injection attempt** - `id = "1 OR 1=1"`
4. **XSS in answer HTML** - Should not execute scripts in rendered content
5. **Missing answer** - Question exists but no answer record
6. **Multiple answers per question** - Should handle rare edge case
7. **Very long answer HTML** - Should render without truncation

---

### 2.4 Navigation Stack (MEDIUM PRIORITY)

**File**: `www/js/utilcode.js`

#### Function: `pushView(viewDescriptor)` & `popView()`
```javascript
// Lines 24-33
function pushView(viewDescriptor) {
    window.RightViewNavigator.pushView(viewDescriptor);
    window.RightViewNavigator.resetScroller();
    hideLoad();
    fnCalled = false;
}

function popView() {
    window.RightViewNavigator.popView();
}
```

#### Function: `backButton()`
```javascript
// Lines 264-336
function backButton() {
    hideAlert();
    var hist = window.RightViewNavigator.history.length;
    
    if (hist > 2) {
        var poppingViewDescriptor = window.RightViewNavigator.history[
            window.RightViewNavigator.history.length - 1];
        window.RightViewNavigator.popView();
        
        // Restore UI state from previous view
        if (currentViewDescriptor.sub != '') {
            makeSubActive(currentViewDescriptor.sub);
        }
    }
    // ... more logic
}
```

**Why Test**:
- **View stack management** - Complex state with history array
- **UI state restoration** - Must restore active tabs/buttons on pop
- **Memory leaks** - Old views not garbage collected if not cleaned up
- **Back button misbehavior** - Can lead to stuck navigation states

**Test Cases**:
1. **Push single view** - History length should be 2 (root + new)
2. **Push multiple views** - History should be LIFO stack
3. **Pop to root** - Should return to home view
4. **Pop beyond root** - Should show exit confirmation
5. **Tab state restoration** - Active tabs should match previous view
6. **Scroller reset** - Should scroll to top on push
7. **Loading state** - hideLoad should set fnCalled=false

---

### 2.5 Folder Management (MEDIUM PRIORITY)

**File**: `www/js/utilcode.js`

#### Function: `saveToFolder()` & `confirmSaveToFolder()`
```javascript
// Lines 703-802
function saveToFolder() {
    var questionId = $('#questionId').val();
    var folderSelect = $('#folderSelect').val();
    var newFolderName = $('#newFolderName').val().toTitleCase();
    var newFolderColour = $('#newFolderColour option:selected').val();
    
    var confirmSaveToFolder = function (button, type) {
        if (button == 2 || button == true) {
            if (type == 'old') {
                var folderSelect = Number($('#folderSelect').val());
                adapter.insertSingleFolderQuestions(folderSelect, questionId)
                    .done(function (results) {
                        refreshView(true);
                    });
            }
            else if (type == 'new') {
                adapter.insertSingleFolder(newFolderName, newFolderColour)
                    .done(function (results) {
                        var folderId = results;
                        adapter.insertSingleFolderQuestions(folderId, questionId)
                            .done(function (results) {
                                refreshView(true);
                            });
                    });
            }
        }
    };
}
```

**Why Test**:
- **Data persistence** - Must write to database correctly
- **Cascade operations** - Create folder THEN add question
- **User input validation** - Folder name length, color format
- **Duplicate prevention** - Same question can't be in folder twice (likely)

**Test Cases**:
1. **Add question to new folder** - Should create folder and add question
2. **Add question to existing folder** - Should not duplicate folder
3. **Duplicate question in folder** - Should prevent or handle gracefully
4. **Remove question from folder** - Should delete only that record
5. **Delete folder** - Should cascade delete all folder questions
6. **Folder name validation** - Empty name, very long name
7. **Color value validation** - Invalid hex code
8. **Restore from backup** - Should import folder structure correctly

---

### 2.6 Search & Text Processing (MEDIUM PRIORITY)

**File**: `www/js/utilcode.js`

#### Function: `processSearch(query)`
```javascript
// Lines 420-445
function processSearch(query) {
    query = query.removeStopWords();
    var resultArray = new Array();
    
    if (query.indexOf("\"") == -1) {
        resultArray[0] = 'm|' + query;
    } else {
        resultArray[0] = 'm|' + query.replace(/"/g, '');
    }
    
    var aQuery = query.match(/("[^"]+"|[^"\s]+)/g);
    if (aQuery.length == 1) {
        return resultArray;
    }
    
    for (var i = 0; i < aQuery.length; i++) {
        aQuery[i] = aQuery[i].replace(/"/g, '');
        if (/\s/.test(aQuery[i])) {
            resultArray[i + 1] = 'y|' + aQuery[i];
        }
        else {
            resultArray[i + 1] = 'n|' + aQuery[i];
        }
    }
    return resultArray;
}
```

#### String Method: `String.prototype.removeStopWords()`
```javascript
// Lines 1138-1613
String.prototype.removeStopWords = function () {
    // Removes 250+ English stop words
    var words = cleansed_string.match(/[^\s]+|\s+[^\s+]$/g);
    // ... processes each word against stop words list
    return cleansed_string.replace(/^\s+|\s+$/g, "");
}
```

**Why Test**:
- **Stop word list** - Comprehensive but may have issues
- **Regex complexity** - Pattern matching fragile for edge cases
- **Quote handling** - Exact phrase searches must preserve quoted text
- **Special characters** - Unicode, punctuation, symbols

**Test Cases**:
1. **Single word search** - "prayer" should return single term
2. **Two word search** - "prayer time" should split correctly
3. **Quoted phrase** - `"prayer time"` should stay together
4. **All stop words** - "the a is" should return empty
5. **Mixed stop/content** - "is prayer best time" should filter "is"
6. **Unicode characters** - Arabic text should work
7. **Punctuation** - "what's" should handle apostrophe
8. **Numbers** - "5 pillars" should preserve numbers

---

## 3. Critical Risk Areas

### 3.1 SQL Injection Vulnerabilities

**Severity**: CRITICAL

Multiple functions concatenate user input directly into SQL:

1. **renderAns(id)** - Line 471, 485
```javascript
var qry = "SELECT * FROM QUESTIONS WHERE question_no ='" + id + "'";  // VULNERABLE
```

2. **loadNext() search** - Line 326, 331
```javascript
var qry0 = 'SELECT 1, * FROM QUESTIONS WHERE QUESTION LIKE "%' + 
           query.replace(/"/g, '') + '%"';  // PARTIALLY MITIGATED
```

**Remediation**: Use parameterized queries with ? placeholders:
```javascript
// Instead of:
'SELECT * FROM QUESTIONS WHERE question_no = "' + id + '"'

// Use:
'SELECT * FROM QUESTIONS WHERE question_no = ?'
// Pass [id] as parameters array
```

---

### 3.2 Race Conditions in Data Import

**Severity**: HIGH

The three-step import wizard has interdependent callbacks:

```javascript
// Step 1: loadCate() -> populateCats() -> calls loadLatest()
// Step 2: populateLatest() -> calls loadQues()  
// Step 3: loadQues() -> populateQuest() -> calls loadAnsw(1)
// Step 4: loadAnsw(1) -> loads answers1-5
// Step 5: loadAnsw(2) -> loads answers6-12
// Step 6: loadAnsw(3) -> calls renderCards()
```

If any AJAX fails or is slow, entire app state becomes corrupted.

---

### 3.3 XSS Vulnerabilities

**Severity**: HIGH

Answers contain raw HTML from database, no sanitization:

```javascript
// Line 491
htmlDiv = getCompiledHtml("answersTemplate", { results: [results, ...] });

// In answersTemplate (index.html):
<div class="answer-content">{{{answers}}}</div>  // Triple braces = HTML mode
```

If database is compromised or admin account hacked, arbitrary JavaScript could execute.

---

### 3.4 Data Integrity Issues

**Severity**: MEDIUM

No validation on imported data:

1. Missing foreign key constraints
2. No duplicate detection on question_no
3. No type validation (category_id should be integer)
4. No bounds checking (question text length)
5. Orphaned records possible (question without answer)

---

### 3.5 Performance Issues

**Severity**: MEDIUM

1. **Large result sets** - Loading 1000+ questions without pagination causes UI freeze
2. **No indexing strategy** - Query on question text has no index
3. **Memory leaks** - jQuery event listeners not cleaned up on pop()
4. **Handlebars compilation** - Compiles template every render instead of caching

---

## 4. Recommended Testing Stack

### 4.1 Test Framework Selection

**Recommended: Vitest**
- Modern, ESM native (matches package.json "type": "module")
- 10x faster than Jest
- Works with Vue 3 components
- Excellent TypeScript support
- Can test Node.js utilities independently from UI

**Alternative: Jest**
- If corporate requirements mandate Jest
- Setup more complex with Cordova
- Still viable

### 4.2 Testing Library Recommendations

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/vue": "^8.0.0",
    "happy-dom": "^12.0.0",
    "dexie-test-utils": "^1.0.0"
  }
}
```

---

## 5. Phased Testing Implementation Plan

### Phase 1: Core Database Functions (Weeks 1-2)

**Priority**: Critical  
**Effort**: 40 hours  
**Coverage Target**: 100%

**What to Test**:
- WebSqlAdapter.executeQuery()
- WebSqlAdapter.batchExecuteQuery()
- Data import validation
- SQL error handling

**Deliverable**: 20+ unit tests, test database setup

### Phase 2: Data Import Pipeline (Weeks 3-4)

**Priority**: High  
**Effort**: 30 hours  
**Coverage Target**: 95%

**What to Test**:
- populateCats() / populateLatest() / populateQuest() / populateAns()
- Category hierarchy validation
- Question/Answer integrity
- Rollback on failure

**Deliverable**: 15+ integration tests, data fixtures

### Phase 3: Search & Rendering (Weeks 5-6)

**Priority**: Medium  
**Effort**: 35 hours  
**Coverage Target**: 90%

**What to Test**:
- loadNext() with all query types
- renderAns() with XSS prevention
- renderCards() column layout
- Search text processing

**Deliverable**: 25+ component tests, mock database

### Phase 4: Navigation & Folder Management (Week 7)

**Priority**: Medium  
**Effort**: 25 hours  
**Coverage Target**: 85%

**What to Test**:
- View stack push/pop
- UI state restoration
- Folder CRUD operations
- Backup/restore

**Deliverable**: 15+ tests, navigation fixtures

### Phase 5: CI/CD Integration (Week 8)

**Priority**: High  
**Effort**: 15 hours  
**Coverage Target**: N/A

**What to Setup**:
- GitHub Actions test workflow
- Coverage reporting
- Automated test on PR
- Test result badges

**Deliverable**: .github/workflows/test.yml, codecov integration

---

## 6. Example Test File Structure

### 6.1 Unit Test Example: Database Adapter

**File**: `src/__tests__/dbFunctions.test.js`

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestDatabase } from './fixtures/testDb';
import { WebSqlAdapter } from '../../www/js/dbFunctions';

describe('WebSqlAdapter', () => {
  let adapter;
  let testDb;

  beforeEach(async () => {
    testDb = await createTestDatabase();
    adapter = new WebSqlAdapter();
    adapter.db = testDb;
  });

  afterEach(async () => {
    await testDb.close();
  });

  describe('executeQuery', () => {
    it('should execute SELECT and return results', async () => {
      // Insert test data
      await testDb.exec('INSERT INTO QUESTIONS VALUES (1, 218, "test", "test", "/url", 123)');
      
      // Execute query
      const result = await adapter.executeQuery(
        'SELECT * FROM QUESTIONS WHERE id = 1'
      );
      
      // Assert
      expect(result.rows.length).toBe(1);
      expect(result.rows.item(0).question_no).toBe(123);
    });

    it('should reject with error message on invalid SQL', async () => {
      const promise = adapter.executeQuery('SELECT * FROM NONEXISTENT');
      
      await expect(promise).rejects.toContain('Transaction Error');
    });

    it('should handle SQL injection attempts safely', async () => {
      const maliciousId = "1 OR 1=1 --";
      
      // With parameterized query, this should be safe
      const result = await adapter.executeQuery(
        'SELECT * FROM QUESTIONS WHERE id = ?',
        [maliciousId]
      );
      
      // Should return 0 results (not all rows)
      expect(result.rows.length).toBe(0);
    });

    it('should resolve large result sets without timeout', async () => {
      // Insert 1000 test records
      for (let i = 1; i <= 1000; i++) {
        await testDb.exec(
          'INSERT INTO QUESTIONS VALUES (?, 218, "q?", "q?", "/url", ?)',
          [i, i, i]
        );
      }
      
      const result = await adapter.executeQuery(
        'SELECT * FROM QUESTIONS LIMIT 1000'
      );
      
      expect(result.rows.length).toBe(1000);
      // Should complete without timeout
    });
  });

  describe('batchExecuteQuery', () => {
    it('should execute multiple statements atomically', async () => {
      const statements = [
        'INSERT INTO CATEGORIES VALUES (1, "cat1", "/url", 218, 0)',
        'INSERT INTO CATEGORIES VALUES (2, "cat2", "/url", 219, 1)',
        'INSERT INTO QUESTIONS VALUES (1, 218, "q", "q", "/url", 123)',
      ];
      
      const result = await adapter.batchExecuteQuery(statements);
      
      expect(result).toBe('done');
      
      // Verify all inserts succeeded
      const cats = await adapter.executeQuery('SELECT COUNT(*) as count FROM CATEGORIES');
      expect(cats.rows.item(0).count).toBe(2);
    });

    it('should rollback all on first error', async () => {
      const statements = [
        'INSERT INTO CATEGORIES VALUES (1, "cat1", "/url", 218, 0)',
        'INSERT INTO INVALID_TABLE VALUES (1)',  // This will fail
        'INSERT INTO QUESTIONS VALUES (1, 218, "q", "q", "/url", 123)',
      ];
      
      await expect(adapter.batchExecuteQuery(statements))
        .rejects.toThrow();
      
      // Verify rollback - first insert should not exist
      const cats = await adapter.executeQuery('SELECT COUNT(*) as count FROM CATEGORIES');
      expect(cats.rows.item(0).count).toBe(0);
    });
  });
});
```

### 6.2 Integration Test Example: Data Import

**File**: `src/__tests__/dataImport.integration.test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from './fixtures/testDb';
import { loadCategoryData, loadQuestionData } from '../../www/js/dbFunctions';

describe('Data Import Pipeline', () => {
  let testDb;

  beforeEach(async () => {
    testDb = await createTestDatabase();
  });

  describe('Category Import', () => {
    it('should import valid category hierarchy', async () => {
      const categoryData = [
        { id: '1', category_links: 'Root', category_url: 'cat/1', 
          element: '1', parent: '0', status: 'done' },
        { id: '2', category_links: 'Child', category_url: 'cat/2', 
          element: '2', parent: '1', status: 'done' },
      ];

      await loadCategoryData(categoryData, testDb);

      const result = await testDb.exec('SELECT COUNT(*) as count FROM CATEGORIES');
      expect(result[0].count).toBe(2);
      
      // Verify parent-child relationship
      const child = await testDb.exec('SELECT * FROM CATEGORIES WHERE parent = 1');
      expect(child[0].category_links).toBe('Child');
    });

    it('should validate parent IDs exist', async () => {
      const invalidData = [
        { id: '1', element: '1', parent: '999' } // Parent doesn't exist
      ];

      await expect(loadCategoryData(invalidData, testDb))
        .rejects.toThrow('Parent category not found');
    });

    it('should reject duplicate category IDs', async () => {
      const duplicateData = [
        { id: '1', element: '1', parent: '0' },
        { id: '1', element: '1', parent: '0' },  // Duplicate
      ];

      await expect(loadCategoryData(duplicateData, testDb))
        .rejects.toThrow('Duplicate category ID');
    });
  });

  describe('Question Import', () => {
    it('should link questions to valid categories', async () => {
      // First insert category
      await testDb.exec(
        'INSERT INTO CATEGORIES VALUES (?, ?, ?, ?, ?)',
        ['1', 'Test Cat', '/url', '218', '0']
      );

      const questionData = [
        { id: '1', category_id: '218', question: 'Q1', 
          question_full: 'Full Q1', question_url: '/url', question_no: '100' },
      ];

      await loadQuestionData(questionData, testDb);

      const q = await testDb.exec(
        'SELECT * FROM QUESTIONS WHERE category_id = ?',
        ['218']
      );
      expect(q[0].question_no).toBe('100');
    });

    it('should reject questions with invalid category_id', async () => {
      const invalidData = [
        { id: '1', category_id: '999', question: 'Q1', ... }
      ];

      await expect(loadQuestionData(invalidData, testDb))
        .rejects.toThrow('Category ID not found');
    });

    it('should prevent duplicate question_no values', async () => {
      const duplicateData = [
        { id: '1', category_id: '218', question_no: '100', ... },
        { id: '2', category_id: '218', question_no: '100', ... },  // Duplicate
      ];

      await expect(loadQuestionData(duplicateData, testDb))
        .rejects.toThrow('Duplicate question_no');
    });

    it('should handle missing optional fields', async () => {
      const dataWithMissing = [
        { id: '1', category_id: '218', question: 'Q1', 
          question_full: '', question_url: '', question_no: '100' },
      ];

      // Should succeed with empty strings
      await expect(loadQuestionData(dataWithMissing, testDb))
        .resolves.not.toThrow();
    });
  });
});
```

### 6.3 Component Test Example: Search Function

**File**: `src/__tests__/search.test.js`

```javascript
import { describe, it, expect } from 'vitest';
import { processSearch } from '../../www/js/utilcode';

describe('Search Processing', () => {
  describe('processSearch', () => {
    it('should process single word search', () => {
      const result = processSearch('prayer');
      
      expect(result[0]).toBe('m|prayer');
      expect(result.length).toBe(1);
    });

    it('should process multi-word search', () => {
      const result = processSearch('daily prayer');
      
      expect(result[0]).toBe('m|daily prayer');
      expect(result[1]).toBe('n|daily');
      expect(result[2]).toBe('n|prayer');
    });

    it('should handle quoted phrases', () => {
      const result = processSearch('"daily prayer" ritual');
      
      // Quoted phrase should stay together
      expect(result.some(r => r.includes('daily prayer'))).toBe(true);
    });

    it('should remove stop words', () => {
      const result = processSearch('the best prayer in islam');
      
      // "the", "in" should be removed
      const combined = result.join('|');
      expect(combined).not.toContain('|the');
      expect(combined).not.toContain('|in');
      expect(combined).toContain('best');
    });

    it('should handle empty search after stop word removal', () => {
      const result = processSearch('the a is');
      
      // Should return at least empty main search
      expect(result.length).toBeGreaterThan(0);
    });

    it('should preserve unicode characters', () => {
      const arabicText = 'الصلاة';
      const result = processSearch(arabicText);
      
      expect(result[0]).toContain(arabicText);
    });

    it('should handle special characters safely', () => {
      const result = processSearch("what's the best time?");
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
```

---

## 7. Test Data & Fixtures

### 7.1 Sample Test Database Setup

**File**: `src/__tests__/fixtures/testDb.js`

```javascript
import initSqlJs from 'sql.js';

let SQL;

async function createTestDatabase() {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  const db = new SQL.Database();

  // Create schema
  db.run(`
    CREATE TABLE IF NOT EXISTS CATEGORIES (
      id INTEGER,
      category_links TEXT,
      category_url TEXT,
      element INTEGER,
      parent INTEGER
    );

    CREATE TABLE IF NOT EXISTS QUESTIONS (
      id INTEGER,
      category_id INTEGER,
      question TEXT COLLATE NOCASE,
      question_full TEXT COLLATE NOCASE,
      question_url TEXT,
      question_no INTEGER
    );

    CREATE TABLE IF NOT EXISTS ANSWERS (
      id INTEGER,
      question_id INTEGER,
      answers TEXT
    );

    CREATE TABLE IF NOT EXISTS FAV (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_no INTEGER
    );

    CREATE TABLE IF NOT EXISTS FOLDERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folder_name TEXT,
      colour TEXT
    );

    CREATE TABLE IF NOT EXISTS FOLDER_QUESTIONS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folder_id INTEGER,
      question_no INTEGER
    );

    CREATE INDEX IF NOT EXISTS QUEST_ID ON QUESTIONS (ID);
    CREATE INDEX IF NOT EXISTS QUEST_NO ON QUESTIONS (QUESTION_NO);
    CREATE INDEX IF NOT EXISTS QUESTION_ID ON ANSWERS (question_id);
    CREATE INDEX IF NOT EXISTS PARENT_ID ON CATEGORIES (parent);
    CREATE INDEX IF NOT EXISTS FOLDER_ID ON FOLDER_QUESTIONS (folder_id);
  `);

  return db;
}

export { createTestDatabase };
```

### 7.2 Sample Test Data

**File**: `src/__tests__/fixtures/sampleData.js`

```javascript
export const sampleCategories = [
  {
    id: '1',
    category_links: 'Basic Tenets of Faith',
    category_url: 'cat/218',
    element: '218',
    parent: '0',
    status: 'done'
  },
  {
    id: '2',
    category_links: 'Belief',
    category_url: 'cat/219',
    element: '219',
    parent: '218',
    status: 'done'
  },
  {
    id: '3',
    category_links: 'Belief in Allah',
    category_url: 'cat/220',
    element: '220',
    parent: '219',
    status: 'done'
  }
];

export const sampleQuestions = [
  {
    id: '1',
    category_id: '218',
    question: 'Ruling on sitting with one who does not pray',
    question_full: 'What is the ruling on being in company with a person...',
    question_url: '/en/115156',
    question_no: '115156',
    status: 'done'
  },
  {
    id: '2',
    category_id: '219',
    question: 'Does faith increase and decrease',
    question_full: 'What is the definition of eemaan (faith)...',
    question_url: '/en/9356',
    question_no: '9356',
    status: 'done'
  }
];

export const sampleAnswers = [
  {
    id: '1',
    question_id: '1',
    answers: '<p>The ruling on sitting with a person...</p>'
  },
  {
    id: '2',
    question_id: '2',
    answers: '<p>Faith (eemaan) increases and decreases...</p>'
  }
];
```

---

## 8. GitHub Actions CI/CD Integration

**File**: `.github/workflows/test.yml`

```yaml
name: Test & Coverage

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run unit tests
        run: yarn test:unit

      - name: Run integration tests
        run: yarn test:integration

      - name: Generate coverage report
        run: yarn test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          fail_ci_if_error: false

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
```

**File**: `package.json` (Add test scripts)

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest --reporter=verbose",
    "test:integration": "vitest --run src/__tests__/integration",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 9. Coverage Goals & Metrics

### 9.1 Target Coverage by Phase

| Component | Phase | Target | Priority |
|-----------|-------|--------|----------|
| dbFunctions.js | 1 | 100% | Critical |
| Data Import | 2 | 95% | High |
| renderCode.js | 3 | 90% | Medium |
| utilcode.js | 4 | 85% | Medium |
| **Overall** | **5** | **90%** | **High** |

### 9.2 Critical Path Functions (Must Test)

1. WebSqlAdapter.executeQuery() - 100%
2. WebSqlAdapter.batchExecuteQuery() - 100%
3. renderAns() - 100% (security)
4. loadNext() - 100% (security)
5. processSearch() - 95%
6. Data import pipeline - 95%
7. Navigation stack - 85%

---

## 10. Known Issues to Address in Tests

### 10.1 SQL Injection (CRITICAL)

**Current Code**:
```javascript
var qry = "SELECT * FROM QUESTIONS WHERE question_no ='" + id + "'";
```

**Refactored**:
```javascript
adapter.executeQuery('SELECT * FROM QUESTIONS WHERE question_no = ?', [id]);
```

### 10.2 Race Conditions (HIGH)

**Current**: Sequential callbacks can fail independently  
**Fix**: Use Promise chains or async/await

```javascript
// Before
loadCate();  // Calls next in callback

// After
try {
  await loadCate();
  await loadLatest();
  await loadQues();
  await loadAnsw();
} catch (err) {
  handleImportError(err);
}
```

### 10.3 Missing Error Handling (HIGH)

**Current**:
```javascript
tx.executeSql(array[i]);  // No error callback
```

**Fix**:
```javascript
tx.executeSql(array[i], [], 
  (tx, result) => { /* success */ },
  (tx, error) => { throw error; }
);
```

---

## 11. Getting Started

### 11.1 Initial Setup (1 hour)

```bash
# Install test dependencies
yarn add -D vitest @vitest/ui @testing-library/vue happy-dom

# Create test structure
mkdir -p src/__tests__/{unit,integration,fixtures,e2e}

# Copy this strategy
cp TESTING_STRATEGY.md src/__tests__/README.md

# Initialize Vitest config
# (See example below)
```

### 11.2 Vitest Configuration

**File**: `vitest.config.js`

```javascript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'dist/',
        '**/*.config.js',
      ]
    },
    include: ['src/__tests__/**/*.test.js'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
```

### 11.3 First Test to Write

Start with the most critical function: `WebSqlAdapter.executeQuery()`

**File**: `src/__tests__/unit/dbFunctions.test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../fixtures/testDb';

describe('WebSqlAdapter.executeQuery', () => {
  let db;

  beforeEach(async () => {
    db = await createTestDatabase();
  });

  it('should execute a SELECT query', async () => {
    // TODO: Implement
  });
});
```

---

## 12. Reference Documentation

### 12.1 Useful Links

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Vue](https://testing-library.com/docs/vue-testing-library/intro/)
- [SQLite Testing Patterns](https://www.sqlitetutorial.net/)
- [Jest Migration Guide to Vitest](https://vitest.dev/guide/migration.html)

### 12.2 Testing Best Practices

1. **One assertion per test** (or related assertions)
2. **Descriptive test names** - "should X when Y"
3. **Arrange-Act-Assert** pattern
4. **Use fixtures** for test data
5. **Mock external dependencies**
6. **Test edge cases** (empty, null, huge values)
7. **Don't test framework code** (jQuery, Handlebars)

---

## 13. Conclusion & Next Steps

The BetterIslam Q&A app has **significant testing gaps** that pose risks to **data integrity** and **security**. Implementing automated tests following this strategy will:

✅ **Prevent regressions** when refactoring legacy code  
✅ **Catch SQL injection** and XSS vulnerabilities early  
✅ **Enable confident deployment** to Play Store & App Store  
✅ **Document expected behavior** for future developers  
✅ **Reduce manual testing time** from 2 hours to 15 minutes  

**Recommended action**: Start Phase 1 (database tests) immediately to establish testing culture and CI/CD integration.

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-08  
**Author**: Claude Code Analysis  
**Status**: Ready for Implementation
