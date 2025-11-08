# Critical Functions Testing Priority Matrix

## Tier 1: CRITICAL (100% Must Test)

### Database Operations
| Function | File | Lines | Risk | Tests |
|----------|------|-------|------|-------|
| `WebSqlAdapter.executeQuery()` | dbFunctions.js | 474-490 | SQL injection, error handling | SELECT, INSERT, UPDATE, DELETE, errors, large sets, concurrent |
| `WebSqlAdapter.batchExecuteQuery()` | dbFunctions.js | 607-625 | Race conditions, no error handling, atomicity | Batch insert, rollback, error handling, atomic transactions |
| `WebSqlAdapter.initialize()` | dbFunctions.js | 425-471 | Database connection failure | Platform detection, DB open, error callbacks |

### Data Import Pipeline
| Function | File | Lines | Risk | Tests |
|----------|------|-------|------|-------|
| `populateCats()` | dbFunctions.js | 268-321 | Data validation, FK constraints | Valid hierarchy, parent validation, duplicate detection |
| `populateLatest()` | dbFunctions.js | 323-338 | Missing data handling | Valid imports, missing records |
| `populateQuest()` | dbFunctions.js | 340-356 | FK integrity | Category references, duplicate question_no |
| `populateAns()` | dbFunctions.js | 393-421 | Orphaned records | Answer-question links, missing questions |
| `getData()` | dbFunctions.js | 38-210 | AJAX failures, data integrity | File loading, JSON parsing, error recovery |

### Security-Critical Functions
| Function | File | Lines | Risk | Tests |
|----------|------|-------|------|-------|
| `renderAns()` | renderCode.js | 463-519 | SQL injection, XSS, race conditions | Injection attempts, XSS payloads, missing data |
| `loadNext()` with search | renderCode.js | 261-412 | SQL injection, complex queries | Search injection, stop words, quotes, pagination |

---

## Tier 2: HIGH (95%+ Must Test)

### Data Validation
| Function | File | Lines | Risk | Tests |
|----------|------|-------|------|-------|
| `setFolderCount()` | dbFunctions.js | 492-504 | Query correctness, DOM coupling | Count accuracy, empty folders |
| `setCategoryCount()` | dbFunctions.js | 506-520 | Query bugs, performance | Count accuracy, large categories |
| `insertFolders()` | dbFunctions.js | 522-542 | Data persistence | Batch insert, error handling |
| `insertSingleFolder()` | dbFunctions.js | 544-563 | Insert ID return | Insert validation, return values |

### Search & Rendering
| Function | File | Lines | Risk | Tests |
|----------|------|-------|------|-------|
| `processSearch()` | utilcode.js | 420-445 | Stop word removal, quote handling | Single word, multi-word, quotes, unicode |
| `String.removeStopWords()` | utilcode.js | 1138-1613 | Regex complexity, edge cases | Stop words, empty results, special chars |
| `renderCards()` | renderCode.js | 55-97 | Complex UNION query, layout | No data, max categories, resize |
| `getCompiledHtml()` | utilcode.js | 17-22 | Template compilation | Template exists, data passed correctly |

---

## Tier 3: MEDIUM (85%+ Should Test)

### Navigation & State Management
| Function | File | Lines | Risk | Tests |
|----------|------|-------|------|-------|
| `pushView()` | utilcode.js | 24-29 | View stack corruption, memory leak | Stack integrity, scroller reset, state |
| `popView()` | utilcode.js | 31-33 | History corruption | Stack consistency, back button |
| `backButton()` | utilcode.js | 264-336 | Complex logic, UI state | Pop to root, pop beyond root, tab restore |
| `renderHome()` | utilcode.js | 234-253 | Navigation state | Home navigation, history cleanup |

### Folder Management
| Function | File | Lines | Risk | Tests |
|----------|------|-------|------|-------|
| `addToFolder()` | utilcode.js | 672-701 | DOM manipulation, DB coupling | Add to existing, add to new, duplicate |
| `saveToFolder()` | utilcode.js | 703-802 | Cascade operations, validation | New folder + question, existing folder |
| `removeFolder()` | utilcode.js | 651-670 | Cascade delete, data loss | Delete folder, cleanup folder_questions |
| `removeFromFav()` | utilcode.js | 805-843 | Data integrity | Remove from folder, validation |

### Update & Sync
| Function | File | Lines | Risk | Tests |
|----------|------|-------|------|-------|
| `checkForUpdate()` | utilcode.js | 928-1120 | Network errors, partial updates | Update check, file download, batch insert |
| `promiseFail()` | utilcode.js | 846-909 | Transaction cleanup | Rollback, cleanup, error states |
| `updateProgress()` | utilcode.js | 917-926 | UI updates | Progress updates, edge cases |

---

## Tier 4: LOW (Should Test if Time)

### Utilities & Helpers
| Function | File | Lines | Risk | Tests |
|----------|------|-------|------|-------|
| `logNow()` | utilcode.js | 1-6 | Logging only | Basic functionality |
| `setStorageItem()` | utilcode.js | 8-10 | LocalStorage | Set/get round trip |
| `getStorageItem()` | utilcode.js | 12-15 | LocalStorage | Null handling, types |
| `hideLoad()` / `showLoad()` | utilcode.js | 48-65 | UI state | Show, hide, state |
| `makeFooterActive()` | utilcode.js | 141-175 | DOM manipulation | Tab switching |
| `makeSubActive()` | utilcode.js | 177-201 | DOM manipulation | Tab switching |
| `onResize()` | utilcode.js | 68-73 | Responsive layout | Column recalc |
| `refreshFavourites()` | utilcode.js | 75-89 | Data refresh | Load from DB, populate array |
| `backup2CardNow()` | utilcode.js | 464-521 | Backup operations | Export folders, error handling |
| `restoreFromCardNow()` | utilcode.js | 551-603 | Restore operations | Import folders, data merge |

---

## Data Integrity Tests Required

### Category Tests
- Parent ID references valid categories
- No orphaned categories (parent=0 if root)
- No duplicate category IDs
- Category hierarchy is acyclic
- Element field matches category ID

### Question Tests
- question_no is globally unique
- category_id references valid category
- question_full populated (not empty)
- question_url valid format
- No orphaned questions (category exists)

### Answer Tests
- question_id references valid question
- answers HTML is properly encoded
- No answers without questions
- Content length within bounds

### Folder Tests
- folder_id references valid folder
- question_no references valid question
- No duplicate folder-question pairs
- Folder deletion cascades correctly

---

## SQL Injection Test Cases

### Search Input
```javascript
// Test vectors for loadNext() search
loadNext('%', 0, 20, "1' OR '1'='1");
loadNext('%', 0, 20, "prayer\"; DROP TABLE QUESTIONS; --");
loadNext('%', 0, 20, "prayer\" UNION SELECT * FROM ANSWERS WHERE \"1\"=\"1");
loadNext('%', 0, 20, "prayer); DELETE FROM QUESTIONS WHERE 1=1; --");
```

### Question ID Input
```javascript
// Test vectors for renderAns()
renderAns("1' OR '1'='1");
renderAns("1; DELETE FROM ANSWERS; --");
renderAns("1\" UNION SELECT * FROM QUESTIONS WHERE \"1\"=\"1");
renderAns("1) OR (1=1");
```

---

## XSS Test Cases

### Answer HTML Content
```javascript
// Test vectors in ANSWERS table
"<script>alert('xss')</script>"
"<img src=x onerror=alert('xss')>"
"<svg onload=alert('xss')>"
"<body onload=alert('xss')>"
"<iframe src='javascript:alert(\"xss\")'>"
```

---

## Performance Test Cases

### Large Result Sets
- 1000 questions in single category
- 10,000 total questions in database
- 100+ categories with questions
- 50MB database size

### Concurrent Operations
- Multiple executeQuery calls simultaneously
- Import while user browsing
- Search while import running

### Memory Leaks
- Push/pop 100 views
- Open/close 100 answers
- Perform 100 searches

---

## Test Execution Order

1. **Database layer tests** (Tier 1: Database Operations)
2. **Data import tests** (Tier 1: Data Import)
3. **Security tests** (Tier 1: Security)
4. **Data validation tests** (Tier 2: Data Validation)
5. **Search & rendering tests** (Tier 2: Search & Rendering)
6. **Navigation tests** (Tier 3: Navigation)
7. **Folder management tests** (Tier 3: Folder Management)
8. **Update & sync tests** (Tier 3: Update & Sync)
9. **Utility tests** (Tier 4: Utilities)

---

## Coverage Goals by Phase

| Phase | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Total |
|-------|--------|--------|--------|--------|-------|
| 1 (Week 1-2) | 100% | 0% | 0% | 0% | **20-25%** |
| 2 (Week 3-4) | 100% | 95% | 0% | 0% | **50-55%** |
| 3 (Week 5-6) | 100% | 95% | 85% | 0% | **75-80%** |
| 4 (Week 7) | 100% | 95% | 85% | 50% | **85-90%** |
| 5 (Week 8) | 100% | 95% | 85% | 75% | **90%+** |

---

**Document Version**: 1.0  
**Created**: 2025-11-08  
**Total Functions Analyzed**: 45+  
**Critical Tier Functions**: 10  
**High Tier Functions**: 15  
**Medium Tier Functions**: 13  
**Low Tier Functions**: 10+
