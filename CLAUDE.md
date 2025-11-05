# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BetterIslam Q&A** is a hybrid mobile application built with Apache Cordova that provides offline access to Islamic Q&A content from Islam Q&A (IslamQA.com). The app features browseable categories, searchable questions, custom folders for organization, and a persistent SQLite database of ~50MB containing 8000+ Q&As.

- **Framework**: Apache Cordova (hybrid mobile)
- **Languages**: JavaScript, HTML, CSS
- **Platforms**: Android 4.2+, iOS 9+
- **Current Version**: 1.6.1 (Play Store)
- **Package**: com.dkurve.betterislamqa

## Build and Development Commands

### Prerequisites
```bash
# Install dependencies
yarn install

# Install Cordova globally (if needed)
npm install -g cordova
```

### Platform Setup
```bash
# Add Android platform
cordova platform add android

# Add iOS platform (macOS only)
cordova platform add ios
```

### Building
```bash
# Development builds
cordova build android
cordova build ios

# Release builds (requires build.json with signing keys)
cordova build android --release
cordova build ios --release

# Clean and rebuild
cordova clean
cordova build android
```

### Running
```bash
# Run on Android emulator
cordova emulate android

# Run on Android device
cordova run android

# Run on iOS simulator
cordova emulate ios

# Run on iOS device
cordova run ios
```

### Configuration Files
- `config.xml` - Cordova configuration (app metadata, permissions, plugins, icons)
- `build.json` - Signing credentials for release builds
- `platforms/android/build.gradle` - Android Gradle configuration
- `platforms/android/AndroidManifest.xml` - Android permissions and manifest

## Architecture Overview

The application uses a **single-page app (SPA) architecture** with a stack-based view navigation system:

```
┌─────────────────────────────────────┐
│     UI Layer (HTML/CSS/JS)          │
│  - Handlebars templates             │
│  - jQuery event handling            │
│  - ViewNavigator stack-based nav    │
├─────────────────────────────────────┤
│  Application Layer                  │
│  - renderCode.js (main logic)       │
│  - utilcode.js (utilities)          │
│  - handlebarHelpers.js (templates)  │
├─────────────────────────────────────┤
│  Data Access Layer                  │
│  - WebSqlAdapter (dbFunctions.js)   │
├─────────────────────────────────────┤
│  SQLite Database (cordova-plugin)   │
│  - QUESTIONS, ANSWERS, CATEGORIES   │
│  - FOLDERS, LATEST_QUESTIONS        │
└─────────────────────────────────────┘
```

### Key Patterns

**Adapter Pattern**: `WebSqlAdapter` in `www/js/dbFunctions.js` (lines 423-651) abstracts all database operations using jQuery Deferred/promises:
```javascript
adapter.executeQuery(sql)
  .done(function(results) { /* success */ })
  .fail(function(error) { /* error */ });
```

**View Navigation**: `ViewNavigator` manages a stack of views with push/pop semantics. Views are objects with properties like `title`, `view` (jQuery element), and `data`.

**Template Rendering**: Handlebars templates with custom helpers (`handlebarHelpers.js`) for rendering lists, categories, and answers.

## Directory Structure

```
www/                           # Main application source
├── index.html                 # Entry point
├── js/
│   ├── dbFunctions.js         # WebSqlAdapter & DB operations
│   ├── renderCode.js          # Main rendering & event logic
│   ├── utilcode.js            # Navigation, storage utilities
│   ├── handlebarHelpers.js    # Template helpers
│   ├── categories.js          # Category data
│   ├── questions[1-4].js      # Q&A data (split for memory)
│   ├── answers[1-12].js       # Answer content (split)
│   ├── latest_questions.js    # Featured questions
│   ├── strings-en.js          # i18n strings
│   ├── highlighter.js         # Text highlighting
│   └── [libraries]            # jQuery, Handlebars, iScroll
├── css/
│   ├── main.css               # Global styles
│   ├── appStyle.css           # App-specific
│   └── android.css            # Platform overrides
├── viewnavigator/             # Navigation framework
└── img/, icons/, fonts/       # Assets

platforms/                     # Platform-specific code
├── android/                   # Android project
└── ios/                       # iOS project

plugins/                       # Cordova plugins
├── cordova-sqlite-storage     # SQLite database
├── cordova-plugin-device      # Device info
├── cordova-plugin-file        # File system
├── cordova-plugin-splashscreen
├── cordova-plugin-statusbar
└── cordova-plugin-x-socialsharing

res/                           # App icons & splash screens
└── android/, ios/
```

## Data Model

### Main Tables
```sql
CATEGORIES
  id INTEGER PRIMARY KEY
  category_links TEXT
  category_url TEXT
  element INTEGER
  parent INTEGER (0 = root category)

QUESTIONS
  id INTEGER PRIMARY KEY
  category_id INTEGER
  question TEXT COLLATE NOCASE
  question_full TEXT COLLATE NOCASE
  question_url TEXT
  question_no INTEGER

ANSWERS
  id INTEGER
  question_id INTEGER
  answers TEXT (HTML content)

FOLDERS (user-created)
  id INTEGER
  folder_name TEXT

FOLDER_QUESTIONS
  id INTEGER
  question_id INTEGER
  folder_id INTEGER
```

### Storage Mechanisms
- **SQLite Database** - Full offline Q&A data (~50MB)
- **LocalStorage** - User preferences (upgrade status, loaded data flags)
- **Virtual Folders** - User-created custom Q&A collections

## Application Flow

### First Launch
1. User opens app → Cordova initializes plugins
2. Database adapter loads → checks upgrade status
3. If first launch: Show import wizard with 3 steps
   - Import categories & latest questions
   - Import answers part 1 (answers 1-5)
   - Import answers part 2 (answers 6-12)
4. Data written to SQLite → App ready
5. Main card view loads with categories

### Runtime Navigation
- **Browse**: Categories → Subcategories → Questions → Answer detail
- **Search**: Keyword search across question database
- **Favorites/Folders**: User-organized collections
- **Latest**: Featured questions
- **Settings**: App preferences

## Important Implementation Details

### Initialization (www/index.html lines 68-146)
The `systemReady()` function initializes the app after Cordova plugins load:
1. Creates WebSqlAdapter instance
2. Checks upgrade status (first launch detection)
3. Initializes ViewNavigator for navigation
4. Loads import wizard or main app view

### Database Adapter Usage
Always use the global `adapter` object for database operations:
```javascript
// Single query
adapter.executeQuery(sql)
  .done(function(results) { ... });

// Batch operations (more efficient)
adapter.batchExecuteQuery([sql1, sql2, sql3])
  .done(function(results) { ... });
```

### View Rendering
Use Handlebars templates defined in index.html script tags:
```javascript
var src = document.getElementById("templateId").innerHTML;
var template = Handlebars.compile(src);
var html = template(data);
rootView.view.html(html);
```

### Platform Detection
```javascript
// Android/iOS detection happens at initialization
if (platform == 'Android') {
  var androidVer = getAndroidVersion();  // returns version number
}
```

### Event Handling Notes
- Older Android versions (4.0.2 and below) use `ontouchend`
- Newer versions use standard `onclick`
- View-specific handlers are registered when views are rendered
- Always clean up event listeners when destroying views

## Key Global Variables

- `adapter` - WebSqlAdapter instance (database access)
- `window.RightViewNavigator` - ViewNavigator for app navigation
- `rootView` - Current root view object
- `upgrade` - First-launch detection flag
- `platform` - 'Android' or 'iOS'
- `db` - SQLite database reference
- `favQuestions` - Array of favorited question IDs
- `foldersWithItems` - User folder structure

## Testing

Currently, no automated testing framework is configured. Manual testing on both Android and iOS devices is the standard approach. Consider implementing tests for:
- Database operations (WebSqlAdapter)
- View rendering and navigation
- Data import process
- Search functionality

## Plugin Dependencies

| Plugin | Version | Purpose |
|--------|---------|---------|
| cordova-sqlite-storage | ^1.4.1 | SQLite database |
| cordova-plugin-device | ^3.0.0 | Device info |
| cordova-plugin-file | ^6.0.1 | File system access |
| cordova-plugin-splashscreen | ^6.0.2 | Splash screen |
| cordova-plugin-statusbar | ^3.0.0 | Status bar control |
| cordova-plugin-whitelist | ^1.3.5 | Security whitelist |
| cordova-plugin-x-socialsharing | ^5.1.1 | Social sharing |

## Common Development Workflows

### Adding a New Feature
1. Add UI template to index.html (if needed)
2. Add rendering logic to renderCode.js
3. Add database queries to dbFunctions.js (if needed)
4. Register event handlers in renderCode.js
5. Test on Android device (most critical platform)
6. Test on iOS device
7. Test on both old and new Android versions

### Modifying Database Schema
1. Update table creation in `createDB()` function
2. Update data import logic for affected tables
3. Increment version check in storage (upgrade detection)
4. Test first-launch import flow
5. Test on both fresh and existing database states

### Debugging
- Use Chrome DevTools remote debugging for Android: `chrome://inspect`
- Console.log statements are viewable in device logs
- Test first-launch flow with fresh SQLite (delete and reimport)
- Check LocalStorage for upgrade flags and load status

## Version and Release Information

- **Current Play Store Version**: 1.6.1
- **Config.xml Version**: 2.0.4
- **Build System**: Cordova 11.x (via npm)
- **Android Target**: API 29+ (Android 10+)
- **iOS Target**: 9.0+

The version discrepancy between Play Store (1.6.1) and config.xml (2.0.4) suggests a pending release. Always update both when publishing.
