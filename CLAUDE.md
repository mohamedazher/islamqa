# CLAUDE.md - IslamQA Development Guide

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**IslamQA** is a modern Vue 3 + Vite web application (with Cordova mobile support) that provides offline access to Islamic Q&A content from IslamQA.com. The app features hierarchical category browsing, fuzzy search, bookmarks, gamification system, and competitive leaderboards.

- **Framework**: Vue 3 (Composition API) with Vite
- **Platforms**: Web (GitHub Pages), Android (Cordova), iOS (Cordova)
- **Current Version**: 2.0+ (modernization complete, production-ready)
- **Data**: 15,622 questions across 268 categories
- **Database**: Dexie (IndexedDB) for cross-platform offline storage
- **State Management**: Pinia stores
- **Styling**: Tailwind CSS with dark mode support

---

## Quick Start

### Prerequisites
```bash
# Node.js 18+
node --version

# Install Yarn (recommended)
npm install -g yarn

# Install dependencies
yarn install
```

### Development
```bash
# Start dev server (web)
yarn dev
# Visit http://localhost:3000

# Build for web (GitHub Pages)
yarn build:web

# Build for Cordova (mobile)
yarn build

# Build Android APK
yarn cordova:build:android

# Build iOS app (macOS only)
yarn cordova:build:ios
```

---

## Architecture Overview

### Tech Stack
```
┌─────────────────────────────────────┐
│     UI Layer                        │
│  Vue 3 (Composition API)            │
│  Tailwind CSS + Dark Mode           │
│  Responsive Components              │
├─────────────────────────────────────┤
│  State Management                   │
│  Pinia Stores (data, gamification)  │
│  Vue Router (hash mode)             │
├─────────────────────────────────────┤
│  Business Logic                     │
│  Search (Fuse.js)                   │
│  Quiz & Gamification                │
│  Firebase Analytics                 │
├─────────────────────────────────────┤
│  Data Layer                         │
│  Dexie (IndexedDB wrapper)          │
│  LocalStorage (preferences)         │
├─────────────────────────────────────┤
│  Data Source                        │
│  JSON files (categories, questions) │
└─────────────────────────────────────┘
```

### Key Design Patterns

**Adapter Pattern**: `dexieDatabase.js` abstracts all database operations
```javascript
import dexieDb from '@/services/dexieDatabase'

// Query by semantic ID
const category = await dexieDb.getCategory(categoryReference)
const questions = await dexieDb.getQuestionsByCategory(categoryReference)
const question = await dexieDb.getQuestion(questionReference)
```

**Pinia Stores**: Centralized data access and state management
```javascript
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()
const category = await dataStore.getCategory(id)
```

**Composables**: Reusable logic with Vue 3 Composition API
```javascript
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
```

---

## Directory Structure

```
src/
├── App.vue                    # Root component, import redirect logic
├── main.js                    # Entry point, Cordova detection
│
├── assets/
│   └── styles/
│       └── main.css          # Global Tailwind imports
│
├── components/               # Reusable Vue components
│   ├── common/              # Shared UI components
│   │   ├── Button.vue       # 5 variants + dark mode
│   │   ├── Card.vue         # Container component
│   │   ├── Icon.vue         # 30+ SVG icons
│   │   ├── PageHeader.vue   # Page header
│   │   └── ThemeToggle.vue  # Dark/light toggle
│   ├── layout/              # Page layout
│   │   ├── DesktopSidebar.vue
│   │   └── MobileBottomNav.vue
│   └── browse/              # Feature components
│       ├── CategoryCard.vue
│       └── QuestionListItem.vue
│
├── composables/             # Vue 3 composables
│   └── useTheme.js         # Dark mode management
│
├── router/
│   └── index.js            # Vue Router config (hash mode)
│
├── stores/                 # Pinia state management
│   ├── data.js            # Main data access store
│   └── gamification.js    # Points, achievements, streaks
│
├── services/              # Business logic services
│   ├── dexieDatabase.js   # IndexedDB schema & operations
│   ├── dataLoader.js      # Data import from JSON files
│   ├── searchService.js   # Fuzzy search (Fuse.js)
│   ├── quizService.js     # Quiz generation & scoring
│   ├── leaderboardService.js  # Firebase leaderboard
│   ├── analytics.js       # Firebase Analytics
│   └── firebase.js        # Firebase config
│
├── utils/
│   └── sharing.js         # Social sharing utilities
│
└── views/                 # Page-level components
    ├── HomeView.vue       # Dashboard
    ├── BrowseView.vue     # Root categories
    ├── CategoryView.vue   # Category detail
    ├── QuestionView.vue   # Q&A display
    ├── SearchView.vue     # Fuzzy search
    ├── QuizView.vue       # Quiz game
    ├── FoldersView.vue    # Bookmarks
    ├── LeaderboardView.vue # Rankings
    ├── ImportView.vue     # Data import
    └── SettingsView.vue   # Settings

public/data/              # Data files (imported at runtime)
├── categories.json       # 268 categories
├── questions.json        # 15,622 questions with embedded answers
└── metadata.json        # Version info

docs/                    # Documentation (organized)
├── ARCHITECTURE.md      # System design
├── TESTING.md          # Testing strategy
├── FIREBASE.md         # Firebase setup
├── DEPLOYMENT.md       # Deployment guide
└── ARCHIVED/           # Historical docs
```

---

## Data Model

> **📚 For complete details, see [docs/DATA_STRUCTURE.md](docs/DATA_STRUCTURE.md)**
>
> This comprehensive guide covers:
> - Reference vs ID (critical concept!)
> - Complete field mappings
> - Common queries and examples
> - Troubleshooting guide
> - Quiz system integration

### Categories (from `categories.json`)
```javascript
{
  reference: 3,              // SEMANTIC ID (use for queries & routes)
  title: "Basic Tenets of Faith",
  parent_reference: null,    // null for root, number for children
  children_references: [21, 4, 20],
  has_subcategories: true,
  has_questions: true,
  question_count: 121,
  level: 0,                  // depth level
  ancestors: [],             // parent hierarchy
  url: "/category/3"
}
```

### Questions (from `questions.json`)
```javascript
{
  reference: 329,            // SEMANTIC ID (use for queries & routes)
  title: "Is Masturbation Haram in Islam?",
  question: "<p>Question HTML...</p>",
  answer: "<div>Answer HTML...</div>",  // EMBEDDED (no separate lookup)
  categories: [245, 250],    // can belong to multiple
  primary_category: 245,     // main category
  tags: ["Bad behaviour"],
  views: 2980371,
  date: "1997-04-10T00:00:00.000Z",
  bookmarked: false,
  last_read: null
}
```

**Key Point**: All IDs are **semantic references from IslamQA.com**, not sequential database IDs.

---

## Database Schema (Dexie/IndexedDB)

**File**: `src/services/dexieDatabase.js`

```javascript
version(1).stores({
  categories: '++id, reference, parent_reference',
  questions: '++id, reference, primary_category',
  folders: '++id, folder_name',
  folder_questions: '++id, question_id, folder_id',
  settings: 'key'
})
```

**Important**: The `++id` is auto-increment (for Dexie), but semantic `reference` is the business ID you use in queries and routes.

---

## Core Services

### dexieDatabase.js - Data Operations
```javascript
// Query by semantic reference ID
await getCategory(reference)           // Single category
await getCategoriesByParent(parentRef) // Children (null = root)
await getQuestionsByCategory(categoryRef)
await getQuestion(reference)           // Single question + embedded answer

// Search
await searchQuestions(term)            // Simple text search

// Folders (bookmarks)
await getFolders()
await createFolder(name)
await addQuestionToFolder(questionId, folderId)
```

### dataLoader.js - Data Import
```javascript
// Main import function (called from ImportView)
await dataLoader.loadAndImport(progressCallback)

// Returns on progress: { step: string, progress: 0-100 }
```

### searchService.js - Fuzzy Search
```javascript
import SearchService from '@/services/searchService'

const service = new SearchService(allQuestions)
const results = service.search(term)  // Typo-tolerant search
```

### quizService.js - Quiz System
```javascript
const quiz = quizService.generateQuiz(options)
quizService.submitScore(score, accuracy)
```

### leaderboardService.js - Firebase Rankings
```javascript
// Automatic sync on quiz completion
await leaderboardService.submitScore(userData)
const rankings = await leaderboardService.getLeaderboard(type)
```

---

## Navigation Routes

All routes use **semantic reference IDs** (from IslamQA), not database row IDs.

```javascript
/                    → HomeView (dashboard)
/import              → ImportView (data setup)
/browse              → BrowseView (root categories)
/category/:id        → CategoryView (id = category reference, e.g., /category/3)
/question/:id        → QuestionView (id = question reference, e.g., /question/329)
/search              → SearchView (fuzzy search)
/bookmarks           → FoldersView (user bookmarks)
/quiz                → QuizView (quiz modes)
/leaderboard         → LeaderboardView (rankings)
/settings            → SettingsView (preferences)
```

---

## Common Development Workflows

### Adding a New Feature

1. **Create Vue component** in `src/views/` or `src/components/`
2. **Add route** in `src/router/index.js`
3. **Use Pinia store** for data access:
   ```javascript
   import { useDataStore } from '@/stores/data'
   const dataStore = useDataStore()
   ```
4. **Style with Tailwind** (no custom CSS)
5. **Add dark mode** support (use `dark:` prefix)
6. **Test on mobile** (Chrome DevTools + Cordova)

### Accessing Data

```javascript
// In Vue component
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

// Get root categories
const roots = await dataStore.getCategoriesByParent(null)

// Navigate to subcategories
const subCats = await dataStore.getCategoriesByParent(categoryRef)

// Get questions in category
const questions = await dataStore.getQuestionsByCategory(categoryRef)

// Load question with embedded answer
const question = await dataStore.getQuestion(questionRef)
// question.answer is already loaded
```

### Modifying Database Schema

1. Update `dexieDatabase.js` schema version
2. Update import logic in `dataLoader.js`
3. Update all query methods
4. Update views that access data
5. Clear browser IndexedDB to reset (DevTools → Application → IndexedDB)
6. Test import flow from scratch

### Dark Mode

The app uses class-based dark mode with `dark:` prefix in Tailwind:

```vue
<div class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
  Content
</div>
```

Toggle theme via `useTheme()`:
```javascript
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()

// Dark mode preference persists to localStorage
```

---

## Important Implementation Details

### Data Import Flow

1. User opens app
2. App.vue checks if data imported: `await dataStore.isDataImported()`
3. If not imported, redirect to `/import`
4. ImportView shows progress wizard
5. DataLoader loads and imports:
   - categories.json → Dexie
   - questions.json → Dexie (answers embedded)
6. App marks as imported: `await dexieDb.markAsImported()`
7. User redirected to home/browse

### Query ID Usage

**Always use semantic reference IDs** in URLs, routes, and queries:

```javascript
// ✅ CORRECT - use reference
router.push(`/category/${category.reference}`)
await dataStore.getCategory(categoryReference)
const questions = await dataStore.getQuestionsByCategory(category.reference)

// ❌ WRONG - don't use database row IDs
router.push(`/category/${category.id}`)
await dataStore.getCategory(categoryId)  // This won't work!
```

### Bookmarks Storage

Bookmarks use semantic question references, stored in localStorage:

```javascript
// localStorage key: 'bookmarks'
// Value: array of question references
["329", "245", "156"]
```

---

## Key Global State (Pinia Stores)

### useDataStore
```javascript
isLoading: boolean          // During import
isReady: boolean            // Data loaded & ready
selectedFolderId: number    // Active folder
```

### useGamificationStore
```javascript
points: number              // Total points
level: number               // User level (1-6)
streak: number              // Daily quiz streak
achievements: array         // Unlocked achievements
stats: {
  totalPoints: number
  quizzesCompleted: number
  questionsRead: number
  bookmarksCreated: number
  avgAccuracy: number
  longestStreak: number
}
```

All persist to localStorage automatically.

---

## Theme System

**File**: `src/composables/useTheme.js`

```javascript
const { isDark, toggleTheme } = useTheme()

// Automatically:
// - Detects system preference on first load
// - Persists to localStorage
// - Applies dark: class to <html>
// - Updates Tailwind styles
```

**Color Palette** (in `tailwind.config.js`):
- **Primary**: Emerald green (#10b981)
- **Accent**: Teal (#14b8a6)
- **Neutral**: Gray scale (50-950)

---

## Build & Deployment

### Web Build (GitHub Pages)
```bash
yarn build:web
# Outputs to dist/
# GitHub Actions auto-deploys on push to main
# Live at: https://mohamedazher.github.io/islamqa/
```

### Mobile Build (Cordova)
```bash
# Android
yarn cordova:build:android
# APK at: platforms/android/app/build/outputs/apk/

# iOS (macOS only)
yarn cordova:build:ios
# Xcode project at: platforms/ios/
```

See **docs/DEPLOYMENT.md** for detailed setup.

---

## Testing

Currently: **Manual testing only** (no automated test framework configured)

**Test checklist before commits:**
- [ ] Data imports successfully
- [ ] Browse categories work
- [ ] Question detail shows content correctly
- [ ] Bookmarking works
- [ ] Search finds questions
- [ ] Dark mode toggles properly
- [ ] Mobile responsive on actual device
- [ ] No console errors

See **docs/TESTING.md** for comprehensive testing guide.

---

## Firebase Integration

**Features**:
- Analytics (auto screen tracking)
- Leaderboard (Firebase Firestore)
- Anonymous authentication

**Setup**: See **docs/FIREBASE.md** (requires Firebase project)

**Environment variables** (`.env` file):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
# etc.
```

---

## Performance Notes

- **Bundle Size**: ~120KB gzipped
- **Import Time**: ~30 seconds (15,622 questions)
- **Build Time**: ~2-3 seconds
- **First Load**: Fast (optimized with lazy routes)

**Optimizations**:
- Code splitting by route
- Tree-shaking unused code
- Gzip compression
- Tailwind purging unused styles

---

## Dependencies

Key packages:
- `vue@3.4` - UI framework
- `vite@5.1` - Build tool
- `pinia@2.1` - State management
- `vue-router@4.3` - Routing
- `tailwindcss@3.4` - Styling
- `dexie@4` - IndexedDB wrapper
- `fuse.js@7.0` - Fuzzy search
- `firebase@11.0` - Backend services

See `package.json` for complete list and versions.

---

## Troubleshooting

### Data not loading
1. Check `public/data/categories.json` and `questions.json` exist
2. Verify files are valid JSON
3. Clear browser IndexedDB (DevTools → Application → IndexedDB)
4. Check browser console for errors

### Navigation broken
1. Verify routes use semantic `reference` IDs
2. Check URL parameters in route definition
3. Check for 404 errors in console

### Dark mode not working
1. Check `dark:` classes in component
2. Verify `useTheme()` is imported
3. Check localStorage for theme preference

### Build errors
1. `yarn install` to ensure all deps installed
2. `yarn build` for detailed error messages
3. Check Node.js version: `node --version`

---

## Getting Help

- **Project Issues**: Check `docs/` folder for detailed guides
- **Claude Code Help**: `/help` command
- **GitHub Issues**: Report bugs with reproduction steps
- **Code Questions**: Comment in the relevant file explaining the issue

---

## Version Info

- **Current Version**: 2.0+ (modernization complete)
- **Last Updated**: November 9, 2025
- **Status**: Production-ready
- **Maintenance**: Active development on feature branches

---

## Related Documentation

- **docs/DATA_STRUCTURE.md** - **⭐ CRITICAL**: Comprehensive guide to data model, ID scheme, and field mappings
- **docs/ARCHITECTURE.md** - Detailed system design
- **docs/TESTING.md** - Testing strategies and guides
- **docs/FIREBASE.md** - Firebase setup instructions
- **docs/DEPLOYMENT.md** - Production deployment guide
- **PROGRESS.md** - Current project status
