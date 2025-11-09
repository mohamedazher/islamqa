# BetterIslam Q&A - Application Structure Analysis

## Project Overview

**BetterIslam Q&A** is a modern Vue 3 + Vite web application (with Cordova mobile support) that provides offline access to Islamic Q&A content from IslamQA.com. The new modernized version uses IndexedDB (Dexie) instead of SQLite.

- **Framework**: Vue 3 (Composition API) with Vite
- **State Management**: Pinia stores
- **Database**: Dexie (IndexedDB wrapper) for cross-platform persistence
- **Styling**: Tailwind CSS
- **Data**: 15,622 questions across 268 categories from IslamQA.com
- **Platforms**: Web browsers, Cordova (Android/iOS)

---

## 1. Directory Structure

```
src/
├── App.vue                        # Root component with navigation layout
├── main.js                        # Entry point (Cordova & browser support)
│
├── assets/
│   └── styles/
│       └── main.css              # Global Tailwind imports
│
├── components/                   # Reusable Vue components
│   ├── common/                   # Shared components
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   ├── Icon.vue
│   │   ├── PageHeader.vue
│   │   ├── SkeletonCard.vue
│   │   ├── ThemeToggle.vue
│   │   └── NavCard.vue
│   ├── browse/                   # Category/Question browsing
│   │   ├── CategoryCard.vue      # Card for displaying categories
│   │   └── QuestionListItem.vue  # List item for questions
│   └── layout/                   # Page layout components
│       ├── DesktopSidebar.vue    # Navigation sidebar (desktop)
│       ├── MobileBottomNav.vue   # Bottom nav (mobile)
│       └── MobileHeader.vue      # Mobile header
│
├── composables/                  # Vue 3 composable functions
│   └── useTheme.js               # Theme management (light/dark)
│
├── router/
│   └── index.js                  # Vue Router configuration (hash mode for Cordova)
│
├── stores/                       # Pinia state management
│   ├── data.js                   # useDataStore - main data access
│   ├── questions.js              # useQuestionsStore - legacy (unused)
│   └── gamification.js           # useGamificationStore - points & achievements
│
├── services/                     # Business logic & data services
│   ├── dexieDatabase.js          # IndexedDB schema & operations
│   ├── dataLoader.js             # Data import from JSON files
│   ├── searchService.js          # Fuzzy search using Fuse.js
│   ├── quizService.js            # Quiz generation & management
│   ├── leaderboardService.js     # Leaderboard tracking
│   ├── analytics.js              # Firebase Analytics
│   └── firebase.js               # Firebase configuration
│
├── utils/
│   └── sharing.js                # Social sharing utilities
│
└── views/                        # Page-level components
    ├── HomeView.vue              # Dashboard/home page
    ├── BrowseView.vue            # Browse root categories
    ├── CategoryView.vue          # Category detail & subcategories
    ├── QuestionView.vue          # Question detail + answer
    ├── SearchView.vue            # Search interface
    ├── QuizView.vue              # Quiz game
    ├── FoldersView.vue           # User bookmarks/folders
    ├── LeaderboardView.vue       # Leaderboard
    ├── ImportView.vue            # Data import wizard
    └── SettingsView.vue          # App settings

public/data/                      # Data files served to app
├── categories.json               # Category structure (268 items)
├── questions.json                # Question data (15,622 items)
└── metadata.json                 # Database metadata
```

---

## 2. Data Model & ID Scheme

### Identifier Fields

The app uses **two different ID schemes** depending on the data context:

#### Categories (from `categories.json`)
```javascript
{
  "reference": 3,              // PRIMARY IDENTIFIER - semantic category ID
  "title": "Basic Tenets of Faith",
  "description": "...",
  "parent_reference": null,    // Parent category reference (null for root)
  "children_references": [21, 4, 20, ...],  // Array of child references
  "has_subcategories": true,
  "has_questions": true,
  "question_count": 121,
  "level": 0,                  // Depth level (0 = root)
  "ancestors": [],             // Array of ancestor references
  "url": "/category/3"
}
```

**Key Point**: Categories use `reference` as the semantic ID (not database row ID)

#### Questions (from `questions.json`)
```javascript
{
  "reference": 329,            // QUESTION ID - used in routes
  "title": "Is Masturbation Haram in Islam?",
  "question": "<p>Question text...</p>",     // Short question
  "answer": "<div>Answer HTML...</div>",     // Full answer with HTML
  "categories": [245],                       // Array of category references
  "primary_category": 245,                   // Primary category reference
  "tags": ["Bad behaviour"],
  "views": 2980371,
  "date": "1997-04-10T00:00:00.000Z",
  "bookmarked": false,
  "last_read": null
}
```

**Key Point**: Questions use `reference` as the semantic ID

### Database Schema (Dexie/IndexedDB)

**File**: `/src/services/dexieDatabase.js`

```javascript
version(1).stores({
  categories: 'id, parent, element',           // 'id' = semantic ID (reference)
  questions: 'id, category_id, question',      // 'id' = semantic ID (reference)
  answers: 'id, question_id',                  // 'id' = question_id
  folders: '++id, folder_name',                // Auto-increment primary key
  folder_questions: '++id, question_id, folder_id',  // Junction table
  latest_questions: 'id, category_id',
  settings: 'key'                              // Key-value store
})
```

**Important**: The database stores semantic IDs (from data) as the primary key, NOT sequential integers!

---

## 3. Data Stores (Pinia)

### useDataStore (`src/stores/data.js`) - PRIMARY STORE

The main data access layer that wraps Dexie operations:

```javascript
export const useDataStore = defineStore('data', () => {
  // State
  const isLoading = ref(false)
  const isReady = ref(false)

  // Key Methods
  async initialize()                        // Check DB status
  async getCategoriesByParent(parentId)   // Get categories by parent reference
  async getCategory(id)                    // Get category by element/reference
  async getQuestionsByCategory(categoryId) // Get questions by category reference
  async getQuestion(id)                    // Get question by reference
  async getAnswer(questionId)              // Get answer by question reference
  async searchQuestions(term)              // Simple text search
  async getAllQuestions()                  // All questions (for fuzzy search)
  
  // Folder operations
  async getFolders()
  async createFolder(folderName)
  async deleteFolder(folderId)
  async addQuestionToFolder(questionId, folderId)
  async removeQuestionFromFolder(questionId, folderId)
  async getQuestionsInFolder(folderId)
  
  // Status & Stats
  async isDataImported()                   // Check if import completed
  async getStats()                         // Get DB counts
})
```

**Usage Pattern**:
```javascript
const dataStore = useDataStore()

// Get root categories (parent_reference = null → stored as "0")
const rootCats = await dataStore.getCategoriesByParent(0)

// Navigate to subcategories
const subcats = await dataStore.getCategoriesByParent(category.element)

// Get questions in category
const questions = await dataStore.getQuestionsByCategory(category.element)

// Load question detail
const question = await dataStore.getQuestion(questionId)
const answer = await dataStore.getAnswer(questionId)
```

### useGamificationStore (`src/stores/gamification.js`)

Tracks user engagement, points, and achievements:

```javascript
// State
const points = ref(0)
const level = ref(1)
const streak = ref(0)
const achievements = ref([])
const stats = ref({
  totalPoints: 0,
  quizzesCompleted: 0,
  questionsRead: 0,
  bookmarksCreated: 0,
  avgAccuracy: 0,
  longestStreak: 0
})

// Tier system (Bronze → Legend)
const tiers = [
  { name: 'Bronze', minPoints: 0 },
  { name: 'Silver', minPoints: 500 },
  { name: 'Gold', minPoints: 1500 },
  // ... up to Legend (10,000 points)
]

// Methods
function readQuestion(questionId)      // Track question reads (+5 points)
function completeQuiz(score, accuracy) // Quiz completion (+score points)
function createBookmark()              // Bookmark created (+10 points)
```

Persists to localStorage as JSON.

### useQuestionsStore (`src/stores/questions.js`) - DEPRECATED

Legacy store using old database interface. Avoid using - data.js is preferred.

---

## 4. Services

### dexieDatabase.js - Database Abstraction

**Singleton instance**: `dexieDb` (exported as default)

Core operations:

```javascript
// Data import
async importCategories(categories)    // Bulk insert from JSON
async importQuestions(questions)
async importAnswers(answers)

// Queries by semantic ID
async getCategories(parentId)         // Where parent = parentId
async getCategory(elementId)          // Where element = elementId
async getQuestionsByCategory(categoryId)
async getQuestion(id)
async getAnswer(questionId)

// Search
async searchQuestions(searchTerm)      // Filter match on question text

// Folder management
async getFolders()
async createFolder(folderName)
async addQuestionToFolder(questionId, folderId)
async getQuestionsInFolder(folderId)

// Metadata
async isImported()                     // Check settings table
async markAsImported()
async getStats()                       // Count rows
async clearAllData()                   // Reset (debugging)
```

**String/Integer Handling**: Methods convert IDs to strings for consistent comparison with how data is stored.

### dataLoader.js - Data Import Pipeline

Loads data from JSON files in `/public/data/` and imports to Dexie:

```javascript
class DataLoaderService {
  getDataPath()                     // Returns data directory path
  async loadAndImport(onProgress)   // Main import with progress tracking
  async loadCategories()            // Fetch & parse categories.json
  async loadQuestions(part)         // Load questions (part 1-4)
  async loadAnswers(part)           // Load answers (part 1-12)
  async isDataImported()
  async getStats()
}

export default new DataLoaderService()
```

**Import Flow**:
1. Check if already imported
2. Load categories.json → import to DB
3. Load questions1.js-4.js → import to DB
4. Load answers1.js-12.js → import to DB
5. Mark as imported in settings table
6. Log statistics

**Progress Callback**: Receives `{ step: string, progress: 0-100 }`

### searchService.js - Fuzzy Search

Uses Fuse.js for fuzzy matching:

```javascript
class SearchService {
  constructor(questions)           // Init with question array
  initializeFuse()                 // Setup Fuse.js with weights
  updateQuestions(questions)       // Update searchable data
  fuzzySearch(term)                // Fuzzy matching only
  search(term)                     // Combined: exact + fuzzy
  searchByCategory(term, categoryId)
  getSuggestions(term, limit=10)
}
```

**Configuration**:
- 70% weight on `question` field (title)
- 30% weight on `question_full` field (body)
- Threshold: 0.4 (allows typos)
- Case insensitive

### Other Services

- **quizService.js**: Quiz generation, scoring, tracking
- **leaderboardService.js**: User rankings, stats aggregation
- **analytics.js**: Firebase Analytics event tracking
- **firebase.js**: Firebase initialization

---

## 5. Data Flow Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    VIEW COMPONENTS                         │
│  (BrowseView, CategoryView, QuestionView, etc.)           │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    PINIA STORES                             │
│  • useDataStore() - primary data access                    │
│  • useGamificationStore() - user engagement               │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                           │
│  • dexieDatabase.js - DB operations                       │
│  • dataLoader.js - data import                            │
│  • searchService.js - fuzzy search                        │
│  • quizService.js - quiz logic                            │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                  DEXIE (IndexedDB)                          │
│  ├─ categories table (semantic ID = reference)            │
│  ├─ questions table (semantic ID = reference)             │
│  ├─ answers table (linked to questions)                   │
│  ├─ folders table (user bookmarks)                        │
│  └─ settings table (import status, etc.)                  │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│           JSON Data Files (/public/data/)                  │
│  • categories.json (268 items)                            │
│  • questions.json (15,622 items)                          │
│  • metadata.json (version info)                           │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Navigation Routes

**File**: `/src/router/index.js` (Hash mode for Cordova)

```javascript
/                    → HomeView (dashboard)
/import              → ImportView (data setup)
/browse              → BrowseView (root categories)
/category/:id        → CategoryView (category + subcats + questions)
/question/:id        → QuestionView (Q&A detail)
/search              → SearchView (fuzzy search)
/bookmarks           → FoldersView (user folders)
/quiz                → QuizView (quiz game)
/leaderboard         → LeaderboardView (rankings)
/settings            → SettingsView (preferences)
```

**ID Parameter Semantics**:
- `/category/:id` - expects `id` = category `element`/`reference` (e.g., `/category/3`)
- `/question/:id` - expects `id` = question `reference` (e.g., `/question/329`)

---

## 7. Component Data Consumption

### BrowseView.vue
```javascript
// Load root categories (parent = 0)
rootCategories.value = await dataStore.getCategoriesByParent(0)

// Navigate to category using element/reference
router.push(`/category/${category.element}`)
```

### CategoryView.vue
```javascript
// Load category by element/reference
currentCategory.value = await dataStore.getCategory(categoryId)

// Get subcategories and questions
const subcats = await dataStore.getCategoriesByParent(currentCategory.value.element)
const questions = await dataStore.getQuestionsByCategory(currentCategory.value.element)

// Navigate using element/reference
router.push(`/category/${category.element}`)
router.push(`/question/${question.id}`)
```

### QuestionView.vue
```javascript
// Load question and answer by ID
const question = await dataStore.getQuestion(questionId)
const answer = await dataStore.getAnswer(questionId)

// Track reading for gamification
gamificationStore.readQuestion(questionId)
```

### SearchView.vue
```javascript
// Load all questions for fuzzy search
const allQuestions = await dataStore.getAllQuestions()

// Initialize search service
searchService = new SearchService(allQuestions)

// Perform search
const results = searchService.search(term)
```

---

## 8. Data Import Workflow

### Step 1: App Initialization (App.vue)
```javascript
onMounted(async () => {
  const isImported = await dataStore.isDataImported()
  
  if (!isImported && currentPath !== '/import') {
    router.push('/import')  // Redirect to import wizard
  }
})
```

### Step 2: User Starts Import (ImportView.vue)
```javascript
async function startImport() {
  await dataLoader.loadAndImport((progressInfo) => {
    currentStep.value = progressInfo.step
    progress.value = progressInfo.progress
  })
}
```

### Step 3: DataLoader Executes Pipeline
```javascript
// 1. Load categories.json
const categoriesData = await this.loadCategories()
await dexieDb.importCategories(categoriesData)

// 2. Load questions (4 files)
for (let i = 1; i <= 4; i++) {
  const questionsData = await this.loadQuestions(i)
  await dexieDb.importQuestions(questionsData)
}

// 3. Load answers (12 files)
for (let i = 1; i <= 12; i++) {
  const answersData = await this.loadAnswers(i)
  await dexieDb.importAnswers(answersData)
}

// 4. Mark as complete
await dexieDb.markAsImported()
```

### Step 4: Ready to Browse
App redirects to `/browse` or home, data is queryable via useDataStore

---

## 9. Key Design Patterns

### 1. **Semantic ID Pattern**
- Data uses `reference` as the logical ID
- Database stores semantic ID as primary key (not auto-increment)
- Queries use semantic IDs: `await db.getCategory(element)`

### 2. **Adapter Pattern**
- Dexie database class wraps IndexedDB operations
- Consistent interface for all data access
- Abstract away query details from components

### 3. **Service Locator Pattern**
- Singleton services (dataLoader, searchService)
- Injected into Pinia stores for consistency
- Example: `import dataLoader from '@/services/dataLoader'`

### 4. **Hierarchical Navigation**
- Categories have parent/child relationships via `parent_reference`
- Questions linked to categories via `primary_category`
- Breadcrumb-style navigation through category tree

### 5. **Progressive Enhancement**
- Cordova-ready (hash routing, device API checks)
- Falls back to web mode if Cordova unavailable
- Data files loadable from both `/public/data/` (web) and `./js/` (Cordova)

---

## 10. Data Transformation During Import

### Categories Transformation
**Input** (categories.json):
```json
{
  "reference": 3,
  "title": "Basic Tenets of Faith",
  "parent_reference": null,
  "children_references": [21, 4, 20, ...],
  ...
}
```

**Stored in DB** (as-is, with `reference` as ID):
```
id: 3,
category_links: "Basic Tenets of Faith",
parent: "0",  // null → "0" for root
element: 3,
...
```

### Questions Transformation
**Input** (questions.json):
```json
{
  "reference": 329,
  "title": "Is Masturbation Haram in Islam?",
  "question": "...",
  "answer": "...",
  "primary_category": 245,
  ...
}
```

**Stored in DB** (split into two tables):
```
// questions table
id: 329,
question: "Is Masturbation Haram in Islam?",
question_full: "...",
category_id: 245,  // from primary_category
...

// answers table
id: 329,
question_id: 329,  // links to questions
answers: "<div>...</div>",
```

---

## 11. Current Implementation Notes

### What's New (Modern Version)
- Vue 3 Composition API
- Vite build system
- Dexie/IndexedDB (cross-platform)
- Tailwind CSS
- Pinia stores
- Fuzzy search with Fuse.js
- Gamification system
- Firebase Analytics

### What's Retained from Legacy
- Category hierarchy system
- Question structure
- Answer content (HTML)
- Bookmark/folder system
- Cordova mobile support

### Storage Mechanism
- **Web/Browser**: IndexedDB (Dexie)
- **Mobile**: IndexedDB (Dexie) or WebSQL fallback
- **Preferences**: localStorage (gamification, theme, etc.)

---

## 12. Important Files Reference

| File | Purpose |
|------|---------|
| `/src/main.js` | App entry point, Cordova detection |
| `/src/App.vue` | Root component, import redirect logic |
| `/src/router/index.js` | Route definitions, analytics tracking |
| `/src/stores/data.js` | Primary Pinia store for data access |
| `/src/services/dexieDatabase.js` | IndexedDB schema & operations |
| `/src/services/dataLoader.js` | JSON file loading & import pipeline |
| `/src/services/searchService.js` | Fuzzy search implementation |
| `/public/data/categories.json` | 268 categories from IslamQA |
| `/public/data/questions.json` | 15,622 questions + answers |
| `/src/views/BrowseView.vue` | Category browsing UI |
| `/src/views/CategoryView.vue` | Category detail & subcategories |
| `/src/views/QuestionView.vue` | Question detail & answer |
| `/src/views/ImportView.vue` | Data import wizard |

---

## Summary

The BetterIslam Q&A app is a **semantic ID-based hierarchical Q&A browser** with:
- **Data Model**: Categories (with parent/child relationships) → Questions → Answers
- **ID Scheme**: Uses semantic IDs from source data (reference field)
- **Storage**: IndexedDB via Dexie for cross-platform offline access
- **Navigation**: Hash-based routing through category tree → question details
- **Gamification**: Points, achievements, streaks tracked in localStorage
- **Extensibility**: Service layer abstractions allow easy feature additions

