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

### Testing

**Run all tests locally (before committing):**
```bash
yarn test:all
# Runs: Vite tests, unit tests, and integration tests
# Must pass before deployment
```

### Web Build (GitHub Pages)

**Manual build:**
```bash
yarn build:web
# Outputs to dist/
# Deploy: push to `main` branch, GitHub Actions auto-deploys
# Live at: https://mohamedazher.github.io/islamqa/
```

**GitHub Actions (automatic):**
- Triggered on push to `main` branch
- Runs tests → builds web → deploys to GitHub Pages
- Workflow file: `.github/workflows/deploy-web.yml`

### Mobile Builds

**Android APK (debug/development):**
```bash
yarn cordova:build:android
# APK at: platforms/android/app/build/outputs/apk/release/
# For testing on device only, not for distribution
```

**iOS App (macOS only):**
```bash
yarn cordova:build:ios
# Xcode project at: platforms/ios/
# For local testing and Fastlane distribution
```

### Android Deployment

#### Option 1: Local with Fastlane (from Mac)

**Deploy to Google Play Beta track:**
```bash
source ~/.zshrc
bundle exec fastlane android beta
```

**What this does:**
- Installs dependencies
- Runs all tests
- Builds web app
- Auto-increments version (patch)
- Builds signed APK and AAB (Android App Bundle)
- Uploads to Google Play Open Testing (beta) track

**Prerequisites:**
- Google Play API key: `google-play-api-key.json` in project root OR
- Environment variable: `export PLAY_STORE_JSON_KEY="path/to/key.json"`
- `JAVA_HOME` configured in `~/.zshrc`

**Available lanes:**
```bash
bundle exec fastlane android build          # Build debug APK only
bundle exec fastlane android release        # Build signed APK + AAB (no upload)
bundle exec fastlane android beta           # Full workflow → Google Play Beta
bundle exec fastlane android promote_to_production  # Move from beta to production
bundle exec fastlane android production     # Full workflow → Google Play Production
```

#### Option 2: CI/CD with GitHub Actions (automated)

**Triggered on:**
- Push to `master` branch **with commit message containing `[beta]`, `[release]`, or `[production]` tags**
- Manual trigger via GitHub Actions UI

**Important: Commit Message Tags**
The workflow only runs automatically if the commit message contains one of these tags:
- `[beta]` - Deploy to Google Play Open Testing (beta track)
- `[release]` or `[production]` - Deploy to Production track

Example commit messages:
```bash
git commit -m "Add new feature [beta]"
git commit -m "Bug fix ready for production [release]"
```

Alternatively, trigger manually:
```bash
gh workflow run deploy-android.yml -f deployment_target=beta
```

**What it does:**
- Checks out code
- Sets up Android SDK and Fastlane
- Runs tests
- Builds and signs APK + AAB
- Uploads to Google Play (track determined by workflow configuration)

**Workflow file:** `.github/workflows/android-build-deploy.yml`

### iOS Deployment

#### Local with Fastlane (from Mac only)

**Deploy to TestFlight (beta testing):**
```bash
source ~/.zshrc
bundle exec fastlane ios beta
```

**What this does:**
- Installs dependencies
- Runs all tests
- Builds web app
- Auto-increments version (patch)
- Builds and archives iOS app
- Exports signed IPA
- Uploads to TestFlight

**Deploy to App Store (production):**
```bash
source ~/.zshrc
bundle exec fastlane ios production
```

**What this does:**
- Same as `beta` but:
- Submits to App Store for review
- Requires confirmation prompt before submission

**Upload pre-built IPA (utility lane):**
```bash
source ~/.zshrc
bundle exec fastlane ios upload_ipa
# Use this if you already have a built IPA and just want to upload to TestFlight
```

**Prerequisites:**
- App Store Connect API key setup:
  - Download `.p8` file from App Store Connect
  - Save to `~/.fastlane/api_key.p8`
- Environment variables in `~/.zshrc`:
  ```bash
  export FASTLANE_TEAM_ID="YOUR_TEAM_ID"
  export FASTLANE_ITC_TEAM_ID="YOUR_TEAM_ID"
  export FASTLANE_API_KEY_ID="YOUR_KEY_ID"
  export FASTLANE_API_ISSUER_ID="YOUR_ISSUER_ID"
  export FASTLANE_API_KEY_PATH="$HOME/.fastlane/api_key.p8"
  ```

**Available lanes:**
```bash
bundle exec fastlane ios build              # Build debug version for simulator
bundle exec fastlane ios build_release      # Build release IPA (no upload)
bundle exec fastlane ios beta               # Full workflow → TestFlight
bundle exec fastlane ios production         # Full workflow → App Store (with review submission)
bundle exec fastlane ios upload_ipa         # Upload pre-built IPA to TestFlight
```

### Deployment Reference Table

| Platform | Method | Command | Destination | Auto-Version |
|----------|--------|---------|-------------|--------------|
| Web | GitHub Actions | `git push main` | GitHub Pages | No |
| Web | Manual | `yarn build:web` + deploy | Any host | No |
| Android | Local Fastlane | `fastlane android beta` | Google Play Beta | ✅ Yes |
| Android | Local Fastlane | `fastlane android production` | Google Play Production | ✅ Yes |
| Android | GitHub Actions | `git push master` | Google Play | ✅ Yes |
| iOS | Local Fastlane | `fastlane ios beta` | TestFlight | ✅ Yes |
| iOS | Local Fastlane | `fastlane ios production` | App Store | ✅ Yes |
| iOS | Local Fastlane | `fastlane ios upload_ipa` | TestFlight | No |

### Version Management

Versions auto-increment with `beta` and `production` lanes:

**Current version tracking:**
- `package.json` - npm version
- `config.xml` - Cordova version
- iOS build number - auto-managed by Fastlane

**Manual version bump:**
```bash
yarn version:patch   # Increments patch version (x.x.Y)
yarn version:minor   # Increments minor version (x.Y.0)
yarn version:major   # Increments major version (Y.0.0)
```

### Deployment Checklist

Before any deployment:
- [ ] All tests pass: `yarn test:all`
- [ ] No console errors
- [ ] Version increment verified
- [ ] Credentials/API keys configured
- [ ] Working on correct branch (master for Android, local for iOS)

See **docs/LOCAL_DEPLOYMENT.md** for complete setup guide and troubleshooting.

---

## Testing

### Automated Tests

**Run all tests:**
```bash
yarn test:all
# Required before any deployment
# Run locally before pushing to git
```

### Manual Testing Checklist

Before commits or deployments, manually verify:
- [ ] Data imports successfully
- [ ] Browse categories work
- [ ] Question detail shows content correctly
- [ ] Bookmarking works
- [ ] Search finds questions
- [ ] Dark mode toggles properly
- [ ] Mobile responsive on actual device (iOS/Android)
- [ ] No console errors (DevTools)

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

## Cordova Plugins Status

**Removed Plugins (November 17, 2025):**
Removed all non-essential Cordova plugins to diagnose blank screen issue on iOS simulator:
- ❌ `@microsoft/cordova-clarity` (Microsoft Analytics) - **Auto-discovered, removed for testing**
- ❌ `cordova-plugin-device` (Device info) - **Auto-discovered as dependency of Clarity, removed for testing**
- ❌ `cordova-plugin-file` (File operations)
- ❌ `cordova-plugin-geolocation` (GPS/location)
- ❌ `cordova-plugin-statusbar` (Status bar styling)
- ❌ `cordova-support-android-plugin` (Android support)
- ❌ `cordova.plugins.diagnostic` (Device diagnostics)
- ❌ `cordova-plugin-firebase-analytics` (Firebase Analytics)

**Reason:** Testing minimal build to isolate plugin-related issues causing blank screen on iOS simulator

**Important Note:** Some plugins auto-discover and reinstall when running `cordova prepare`. If plugins reappear:
1. They're referenced in `plugins.xml` or package.json
2. Remove them again if not needed
3. Or modify config.xml to prevent auto-discovery

**Next Steps for Adding Plugins Back:**
Only add back essential plugins after blank screen issue is resolved:
- `cordova-plugin-statusbar` (recommended for iOS UX)
- `cordova-plugin-device` (only if needed for app logic)

---

## Version Info

- **Current Version**: 2.0.27 (iOS debugging)
- **Last Updated**: November 17, 2025
- **Status**: Troubleshooting iOS blank screen issue
- **Maintenance**: Active development on feature branches

---

## Related Documentation

- **docs/DATA_STRUCTURE.md** - **⭐ CRITICAL**: Comprehensive guide to data model, ID scheme, and field mappings
- **docs/LOCAL_DEPLOYMENT.md** - **Local builds**: Fastlane setup for Android & iOS deployment from Mac
- **docs/ARCHITECTURE.md** - Detailed system design
- **docs/TESTING.md** - Testing strategies and guides
- **docs/FIREBASE.md** - Firebase setup instructions
- **docs/DEPLOYMENT.md** - Production deployment guide (web)
- **PROGRESS.md** - Current project status
