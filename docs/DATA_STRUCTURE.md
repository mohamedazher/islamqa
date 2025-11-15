# IslamQA Data Structure Guide

**Last Updated**: November 15, 2025
**Purpose**: Authoritative guide to the IslamQA app data model, ID scheme, and field mappings

This document explains the complete data structure used throughout the IslamQA application. Understanding this structure is **critical** for working with categories, questions, routing, and quiz systems.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concept: Reference vs ID](#core-concept-reference-vs-id)
3. [Categories Data Structure](#categories-data-structure)
4. [Questions Data Structure](#questions-data-structure)
5. [Database Schema (IndexedDB)](#database-schema-indexeddb)
6. [Data Flow](#data-flow)
7. [Field Mapping Reference](#field-mapping-reference)
8. [Common Queries](#common-queries)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The IslamQA app imports and stores Islamic Q&A content from IslamQA.com:

- **268 Categories** - Hierarchical topic organization
- **15,622+ Questions** - Each with embedded answers
- **Cross-platform storage** - Uses IndexedDB via Dexie wrapper

**Data Source Files** (in `public/data/`):
```
public/data/
├── categories.json       # Category hierarchy
├── questions.json        # Questions with embedded answers
├── quiz-questions.json   # LLM-generated quiz questions (optional)
└── metadata.json         # Version info
```

---

## Core Concept: Reference vs ID

### The Most Important Thing to Understand ⚠️

The app uses **semantic reference IDs** from IslamQA.com, **NOT** auto-incrementing database row IDs.

| Field | Description | Example | Use Case |
|-------|-------------|---------|----------|
| `reference` | **Semantic ID** from IslamQA.com | `3`, `329`, `106815` | Routes, queries, relationships |
| `id` (auto) | Auto-increment database row ID | `1`, `2`, `3` | **NEVER USED** in queries |

**✅ CORRECT**:
```javascript
// Use reference for routes
router.push(`/category/${category.reference}`)

// Use reference for queries
await dexieDb.getCategory(category.reference)
await dexieDb.getQuestionsByCategory(category.reference)
```

**❌ WRONG**:
```javascript
// DON'T use database auto-increment id
router.push(`/category/${category.id}`)  // WRONG!
await dexieDb.getCategory(category.id)   // WRONG!
```

---

## Categories Data Structure

### JSON File Format (`public/data/categories.json`)

```javascript
{
  "reference": 3,                    // ✅ PRIMARY IDENTIFIER (semantic ID)
  "title": "Basic Tenets of Faith",
  "description": "Discusses what the Muslim must believe...",
  "parent_reference": null,          // ✅ null = root category
  "children_references": [           // ✅ Array of child category references
    21, 4, 20, 22, 19, 15
  ],
  "has_subcategories": true,
  "has_questions": true,
  "question_count": 121,             // Total questions in this category
  "level": 0,                        // Depth: 0=root, 1=1st level, etc.
  "ancestors": [],                   // Array of parent references (empty for root)
  "url": "/category/3"               // Route URL
}
```

### Subcategory Example

```javascript
{
  "reference": 21,
  "title": "Belief in Allah",
  "description": "...",
  "parent_reference": 3,             // ✅ Parent is category 3
  "children_references": [
    172, 174, 173, 178, 176, 177, 175
  ],
  "has_subcategories": true,
  "has_questions": true,
  "question_count": 28,
  "level": 1,                        // ✅ One level deep
  "ancestors": [3],                  // ✅ Parent chain
  "url": "/category/21"
}
```

### Key Fields

| Field | Type | Description | Usage |
|-------|------|-------------|-------|
| `reference` | Number | **Semantic category ID** | Queries, routes, parent/child relationships |
| `parent_reference` | Number/null | Parent category reference (null for root) | Finding subcategories |
| `children_references` | Array<Number> | Child category references | Navigation, tree building |
| `title` | String | Display name | UI rendering |
| `question_count` | Number | Total questions (including subcategories) | Display stats |
| `level` | Number | Depth in hierarchy (0 = root) | UI indentation, breadcrumbs |
| `ancestors` | Array<Number> | Parent chain from root to this category | Breadcrumb navigation |

---

## Questions Data Structure

### JSON File Format (`public/data/questions.json`)

```javascript
{
  "reference": 329,                  // ✅ PRIMARY IDENTIFIER (semantic ID)
  "title": "Is Masturbation Haram in Islam?",
  "question": "<p>Question HTML...</p>",
  "answer": "<div>Answer HTML...</div>",  // ✅ EMBEDDED (not separate table!)
  "categories": [245],               // ✅ Array of category references
  "primary_category": 245,           // ✅ Main category reference
  "tags": ["Bad behaviour"],
  "views": 2983376,
  "date": "1997-04-10T00:00:00.000Z",
  "bookmarked": false,
  "last_read": null
}
```

### Multi-Category Question Example

```javascript
{
  "reference": 106815,
  "title": "Can Women Work in Islam?",
  "question": "<p>What is the ruling...</p>",
  "answer": "<div>Detailed answer...</div>",
  "categories": [34, 125, 210],      // ✅ Belongs to multiple categories
  "primary_category": 34,            // ✅ Primary is "Fiqh of the family"
  "tags": ["women", "work", "employment"],
  "views": 850123,
  "date": "2005-03-15T00:00:00.000Z",
  "bookmarked": false,
  "last_read": null
}
```

### Key Fields

| Field | Type | Description | Usage |
|-------|------|-------------|-------|
| `reference` | Number | **Semantic question ID** | Routes, queries, bookmarks |
| `title` | String | Question title | Display, search |
| `question` | HTML String | Short question text | Detail view |
| `answer` | HTML String | **Full answer (embedded!)** | Detail view |
| `primary_category` | Number | Main category reference | **Used for queries** |
| `categories` | Array<Number> | All category references | Cross-category display |
| `tags` | Array<String> | Topic tags | Search, filtering |
| `views` | Number | View count | Popularity sorting |

**CRITICAL**: Questions can belong to **multiple categories** but have ONE `primary_category` which is used for database queries.

---

## Database Schema (IndexedDB)

### Schema Definition (`src/services/dexieDatabase.js`)

```javascript
this.version(1).stores({
  categories: 'reference, parent_reference',
  questions: 'reference, primary_category',
  folders: '++id, folder_name',
  folder_questions: '++id, reference, folder_id',
  latest_questions: 'reference, primary_category',
  settings: 'key',
  quiz_configurations: '++id, mode, difficulty',
  quiz_attempts: '++id, session_id, completion_date',
  quiz_sessions: '++id, quiz_config_id',
  quiz_questions: 'reference'
})
```

### Indexes Explained

| Table | Primary Key | Indexes | Purpose |
|-------|-------------|---------|---------|
| `categories` | `reference` | `parent_reference` | Find categories by parent |
| `questions` | `reference` | `primary_category` | Find questions by category |
| `folders` | `++id` (auto) | `folder_name` | User bookmark folders |
| `folder_questions` | `++id` (auto) | `reference`, `folder_id` | Bookmark junction table |
| `quiz_questions` | `reference` | - | LLM-generated quiz questions |

**Note**: `++id` means auto-increment (only used for user-created data like folders)

### Storage Details

- **Categories**: Stored as-is from `categories.json`
- **Questions**: Stored with embedded `answer` field (no separate answers table!)
- **Folders**: User-created bookmark collections
- **Quiz Questions**: Optional LLM-generated quiz data

---

## Data Flow

### 1. Import Process

```
User clicks "Import Data"
         ↓
dataLoader.loadAndImport()
         ↓
     ┌─────────────────────────┐
     │ Fetch categories.json   │
     │ dexieDb.importCategories│
     └─────────────────────────┘
         ↓
     ┌─────────────────────────┐
     │ Fetch questions.json    │
     │ dexieDb.importQuestions │
     │ (answers embedded!)     │
     └─────────────────────────┘
         ↓
     ┌─────────────────────────┐
     │ Fetch quiz-questions    │
     │ (optional)              │
     └─────────────────────────┘
         ↓
  dexieDb.markAsImported()
```

### 2. Browse Categories Flow

```
User visits /browse
         ↓
BrowseView.vue
         ↓
dataStore.getCategoriesByParent(null)
         ↓
dexieDb.getCategories(null)
         ↓
WHERE parent_reference IS NULL
         ↓
Returns root categories
         ↓
User clicks category
         ↓
Router: /category/{reference}
```

### 3. Category Detail Flow

```
User visits /category/3
         ↓
CategoryView.vue
         ↓
route.params.id = "3"
         ↓
dataStore.getCategory(3)
         ↓
dexieDb.getCategory(3)
         ↓
WHERE reference = 3
         ↓
Returns category object
         ↓
Parallel queries:
  - getCategoriesByParent(3) → subcategories
  - getQuestionsByCategory(3) → questions
         ↓
WHERE parent_reference = 3
WHERE primary_category = 3
```

### 4. Question Detail Flow

```
User clicks question
         ↓
Router: /question/{reference}
         ↓
QuestionView.vue
         ↓
dataStore.getQuestion(reference)
         ↓
dexieDb.getQuestion(reference)
         ↓
WHERE reference = reference
         ↓
Returns question with embedded answer
(question.answer contains full HTML)
```

---

## Field Mapping Reference

### What to Use When

| Task | Field to Use | Example |
|------|--------------|---------|
| Route to category | `category.reference` | `/category/${category.reference}` |
| Route to question | `question.reference` | `/question/${question.reference}` |
| Find root categories | `parent_reference === null` | `getCategories(null)` |
| Find subcategories | `parent_reference === X` | `getCategories(3)` |
| Find questions in category | `primary_category === X` | `getQuestionsByCategory(3)` |
| Display category name | `category.title` | `{{ category.title }}` |
| Display question title | `question.title` | `{{ question.title }}` |
| Get answer for question | `question.answer` | Already embedded! |
| Link categories | `category.reference` | NOT `category.id` ❌ |

### Migration from Old Schema

If you see these old field names, they're **DEPRECATED**:

| Old Field (WRONG) | New Field (CORRECT) | Notes |
|-------------------|---------------------|-------|
| `element` | `reference` | Categories |
| `category_id` | `primary_category` | Questions |
| `question_full` | `question` | Questions |
| Separate `answers` table | `question.answer` | Now embedded |

---

## Common Queries

### Get Root Categories

```javascript
// View: BrowseView.vue
const rootCategories = await dataStore.getCategoriesByParent(null)

// Database: dexieDatabase.js
await this.categories.filter(cat => cat.parent_reference === null).toArray()
```

### Get Subcategories

```javascript
// View: CategoryView.vue
const subcategories = await dataStore.getCategoriesByParent(categoryReference)

// Database: dexieDatabase.js
await this.categories.where('parent_reference').equals(categoryReference).toArray()
```

### Get Category by Reference

```javascript
// View: CategoryView.vue
const category = await dataStore.getCategory(route.params.id)

// Database: dexieDatabase.js
await this.categories.where('reference').equals(reference).first()
```

### Get Questions in Category

```javascript
// View: CategoryView.vue
const questions = await dataStore.getQuestionsByCategory(categoryReference)

// Database: dexieDatabase.js
await this.questions.where('primary_category').equals(categoryReference).toArray()
```

### Get Question with Answer

```javascript
// View: QuestionView.vue
const question = await dataStore.getQuestion(route.params.id)
// question.answer contains the full HTML answer (already loaded!)
```

---

## Troubleshooting

### Quiz Question Mismatch

**Problem**: Quiz shows "Women working" question but loads "Swallowing saliva" answer

**Root Cause**: `quiz-questions.json` has wrong `reference` value

```javascript
// WRONG - reference doesn't match question content
{
  "reference": 366120,  // ❌ This is "swallowing saliva" in questions.json
  "questionText": "Is women working outside the home permissible?",
  "explanation": "Women working is permissible if..."
}
```

**Fix**: Quiz generation must use correct `reference` from `questions.json`

### Wrong Category ID in Routes

**Problem**: Category page shows wrong content or 404

**Root Cause**: Using database `id` instead of `reference`

```javascript
// ❌ WRONG
router.push(`/category/${category.id}`)  // Auto-increment ID (1, 2, 3...)

// ✅ CORRECT
router.push(`/category/${category.reference}`)  // Semantic ID (3, 21, 34...)
```

### Questions Not Appearing in Category

**Problem**: Category shows 0 questions but should have some

**Root Cause**: Query uses wrong field

```javascript
// ❌ WRONG - old schema
await this.questions.where('category_id').equals(ref).toArray()

// ✅ CORRECT - new schema
await this.questions.where('primary_category').equals(ref).toArray()
```

### Answer Not Loading

**Problem**: Question shows but answer is empty

**Root Cause**: Trying to fetch answer separately instead of using embedded field

```javascript
// ❌ WRONG - old approach
const answer = await dexieDb.getAnswer(questionId)

// ✅ CORRECT - answers are embedded
const question = await dexieDb.getQuestion(questionReference)
const answerHtml = question.answer  // Already here!
```

---

## Examples from Codebase

### BrowseView.vue (Correct Implementation)

```javascript
// Line 82: Get root categories using null
rootCategories.value = await dataStore.getCategoriesByParent(null)

// Line 92: Route using reference
router.push(`/category/${category.reference}`)
```

### CategoryView.vue (Correct Implementation)

```javascript
// Line 123: Get category by reference from route
currentCategory.value = await dataStore.getCategory(categoryId)

// Line 128: Get subcategories using reference
dataStore.getCategoriesByParent(currentCategory.value.reference)

// Line 129: Get questions using reference
dataStore.getQuestionsByCategory(currentCategory.value.reference)

// Line 200: Route to subcategory using reference
router.push(`/category/${category.reference}`)

// Line 205: Route to question using reference
router.push(`/question/${question.reference}`)
```

### dexieDatabase.js (Correct Schema)

```javascript
// Line 21: Primary key is 'reference'
categories: 'reference, parent_reference',
questions: 'reference, primary_category',

// Line 154: Query root categories
.filter(cat => cat.parent_reference === null)

// Line 165: Query subcategories
.where('parent_reference').equals(refNum)

// Line 214: Query category by reference
.where('reference').equals(refNum).first()

// Line 235: Query questions by primary_category
.where('primary_category').equals(refNum)
```

---

## Summary Checklist

When working with categories and questions, always remember:

- ✅ Use `reference` for all IDs (routes, queries, relationships)
- ✅ Use `parent_reference` to find categories (null = root)
- ✅ Use `primary_category` to find questions in a category
- ✅ Answers are embedded in `question.answer` (no separate table)
- ✅ Questions can have multiple categories but one primary
- ✅ All references are semantic IDs from IslamQA.com
- ❌ Never use auto-increment `id` for business logic
- ❌ Never query by `element` (deprecated)
- ❌ Never query by `category_id` (deprecated)

---

**For Quiz System**: When generating quiz questions, **always** verify that the `reference` in `quiz-questions.json` matches the actual question content in `questions.json` by cross-checking the title and content.

**Last Verified**: November 15, 2025
**Verified By**: Analysis of BrowseView, CategoryView, dexieDatabase, and data files
