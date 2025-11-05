# IslamQA Data Migration & Sync Plan

## Executive Summary

**Current State**: App uses old JS files (questions1-4.js, answers1-12.js, categories.js) with ~8000 Q&As from years ago

**Goal**: Migrate to modern API-based data system with regular sync capability while maintaining offline-first architecture

**Approach**: Three-phase migration with backward compatibility and zero data loss

---

## 📊 Current Data Format Analysis

### Old JS Files Structure

**Categories** (`categories.js`):
```json
{
  "id": "1",
  "category_links": "Basic Tenets of Faith",
  "category_url": "cat/218",
  "element": "218",  // Actual category ID
  "parent": "0",
  "status": "done"
}
```

**Questions** (`questions1-4.js`):
```json
{
  "id": "1",
  "category_id": "218",  // Links to category.element
  "question": "Short title",
  "question_full": "Full question text",
  "question_url": "/en/115156",
  "question_no": "115156",  // Reference ID
  "status": "done"
}
```

**Answers** (`answers1-12.js`):
```json
{
  "id": "1",
  "question_id": "1",  // Links to question.id
  "answers": "<p>HTML content...</p>"
}
```

**Total Size**: ~53MB across 16 files

### New IslamQA API Structure

**Single Post** (`/api/en/post/show/{reference}`):
```json
{
  "post": {
    "id": 25311,
    "reference": 230367,
    "title": "Question title",
    "question": "<p>HTML question</p>",
    "answer": "<p>HTML answer</p>",
    "tags": [
      {
        "id": 1885,
        "reference": 3,
        "title": "Category Name"
      }
    ],
    "views": "135848",
    "date": "26-08-2015"
  }
}
```

**Categories** (`/api/en/categories/topics`):
```json
[
  {
    "id": 1885,
    "reference": 3,
    "title": "Basic Tenets of Faith",
    "parent_id": null,
    "parent_reference": null,
    "children": []
  }
]
```

---

## 🎯 Migration Strategy

### Phase 1: Data Extraction & Normalization (Week 1-2)

#### 1.1 Map Old Data to New API Format

**Objective**: Create mapping between old data structure and new API structure

**Script**: `scripts/data-mapper.js`

```javascript
// Map old format to new format
function mapOldToNew(oldQuestion, oldAnswer, oldCategory) {
  return {
    post: {
      reference: parseInt(oldQuestion.question_no),
      title: oldQuestion.question,
      question: oldQuestion.question_full,
      answer: oldAnswer.answers,
      tags: [{
        reference: parseInt(oldCategory.element),
        title: oldCategory.category_links
      }],
      // Fields we don't have
      id: null,
      views: null,
      date: null
    }
  }
}
```

**Action Items**:
- [ ] Create `scripts/data-mapper.js`
- [ ] Test mapping with sample data
- [ ] Validate all 8000+ questions map correctly

#### 1.2 Extract Reference IDs

**Objective**: Get all question reference IDs from old data to fetch from API

**Script**: `scripts/extract-references.js`

```javascript
// Load all questions files
const allReferences = [];

for (let i = 1; i <= 4; i++) {
  const questions = loadJSONFile(`questions${i}.js`);
  questions.forEach(q => {
    allReferences.push({
      reference: q.question_no,
      category_element: q.category_id,
      oldId: q.id
    });
  });
}

// Save to reference map
fs.writeFileSync('reference-map.json', JSON.stringify(allReferences, null, 2));
```

**Output**: `reference-map.json` with ~8000 entries

**Action Items**:
- [ ] Create extraction script
- [ ] Generate reference map
- [ ] Verify no duplicates or missing IDs

---

### Phase 2: API Data Fetching & Sync System (Week 3-4)

#### 2.1 Build Data Sync Service

**Objective**: Fetch all existing questions from API using reference IDs

**Service**: `src/services/apiSyncService.js`

```javascript
import axios from 'axios';

const BASE_API = 'https://archive-1446.islamqa.info/api';

class ApiSyncService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_API,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Fetch single question from API
   */
  async fetchQuestion(reference, lang = 'en') {
    try {
      const response = await this.client.get(`/${lang}/post/show/${reference}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch question ${reference}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch all categories
   */
  async fetchAllCategories(lang = 'en') {
    try {
      const response = await this.client.get(`/${lang}/categories/topics`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error.message);
      return [];
    }
  }

  /**
   * Fetch subcategories for a topic
   */
  async fetchSubcategories(reference, lang = 'en') {
    try {
      const response = await this.client.get(`/${lang}/categories/topics/${reference}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch subcategories for ${reference}:`, error.message);
      return [];
    }
  }

  /**
   * Batch fetch questions with rate limiting
   */
  async batchFetchQuestions(references, lang = 'en', delay = 2000) {
    const results = [];

    for (let i = 0; i < references.length; i++) {
      const ref = references[i];
      console.log(`Fetching ${i + 1}/${references.length}: ${ref}`);

      const data = await this.fetchQuestion(ref, lang);
      if (data) {
        results.push(data);
      }

      // Rate limiting - be respectful!
      if (i < references.length - 1) {
        await this.sleep(delay);
      }
    }

    return results;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ApiSyncService();
```

#### 2.2 Full Data Migration Script

**Script**: `scripts/migrate-data.js`

```javascript
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import ApiSyncService from '../src/services/apiSyncService.js';

async function migrateData() {
  console.log('🚀 Starting data migration...');

  // Step 1: Load reference map
  const referenceMap = JSON.parse(
    fs.readFileSync('reference-map.json', 'utf-8')
  );
  console.log(`📋 Found ${referenceMap.length} questions to fetch`);

  // Step 2: Fetch categories
  console.log('\n📚 Fetching categories...');
  const categories = await ApiSyncService.fetchAllCategories('en');
  fs.writeFileSync(
    'data/categories-new.json',
    JSON.stringify(categories, null, 2)
  );
  console.log(`✅ Saved ${categories.length} categories`);

  // Step 3: Fetch all questions (with rate limiting)
  console.log('\n📥 Fetching questions from API...');
  console.log('⏱️  This will take ~4-5 hours for 8000 questions (2 sec delay)');

  const questions = await ApiSyncService.batchFetchQuestions(
    referenceMap.map(r => r.reference),
    'en',
    2000  // 2 second delay
  );

  // Step 4: Save fetched data
  fs.writeFileSync(
    'data/questions-new.json',
    JSON.stringify(questions, null, 2)
  );
  console.log(`\n✅ Migration complete! Fetched ${questions.length} questions`);

  // Step 5: Generate statistics
  const stats = {
    totalFetched: questions.length,
    totalExpected: referenceMap.length,
    missingCount: referenceMap.length - questions.length,
    categories: categories.length,
    migratedAt: new Date().toISOString()
  };

  fs.writeFileSync('data/migration-stats.json', JSON.stringify(stats, null, 2));
  console.log('\n📊 Migration Statistics:', stats);
}

migrateData().catch(console.error);
```

**Estimated Time**: 4-5 hours for 8000 questions with 2-second delays

**Action Items**:
- [ ] Create `apiSyncService.js`
- [ ] Create `migrate-data.js`
- [ ] Run initial migration (overnight)
- [ ] Verify data integrity

#### 2.3 Incremental Sync System

**Objective**: Check for new/updated content periodically

**Service**: `src/services/incrementalSync.js`

```javascript
class IncrementalSync {
  constructor() {
    this.lastSyncKey = 'last_sync_timestamp';
    this.knownReferencesKey = 'known_references';
  }

  /**
   * Get timestamp of last sync
   */
  getLastSyncTime() {
    return localStorage.getItem(this.lastSyncKey) || null;
  }

  /**
   * Set last sync timestamp
   */
  setLastSyncTime(timestamp) {
    localStorage.setItem(this.lastSyncKey, timestamp);
  }

  /**
   * Get all known question references
   */
  getKnownReferences() {
    const refs = localStorage.getItem(this.knownReferencesKey);
    return refs ? JSON.parse(refs) : [];
  }

  /**
   * Add new references
   */
  addKnownReferences(references) {
    const existing = new Set(this.getKnownReferences());
    references.forEach(ref => existing.add(ref));
    localStorage.setItem(
      this.knownReferencesKey,
      JSON.stringify([...existing])
    );
  }

  /**
   * Discover new questions by trying sequential IDs
   */
  async discoverNewQuestions(startRef, count = 100) {
    const newQuestions = [];
    const knownRefs = new Set(this.getKnownReferences());

    for (let ref = startRef; ref < startRef + count; ref++) {
      if (knownRefs.has(ref.toString())) {
        continue; // Already have it
      }

      const question = await ApiSyncService.fetchQuestion(ref, 'en');
      if (question && question.post) {
        newQuestions.push(question);
        knownRefs.add(ref.toString());
      }

      await ApiSyncService.sleep(2000);
    }

    this.addKnownReferences([...knownRefs]);
    return newQuestions;
  }

  /**
   * Perform incremental sync
   */
  async performSync() {
    console.log('🔄 Starting incremental sync...');

    // Get latest reference ID we have
    const known = this.getKnownReferences();
    const maxKnown = Math.max(...known.map(Number));

    // Try to discover 100 new questions after our max
    const newQuestions = await this.discoverNewQuestions(maxKnown + 1, 100);

    if (newQuestions.length > 0) {
      // Save new questions to local database
      await this.saveNewQuestions(newQuestions);
      console.log(`✅ Found and saved ${newQuestions.length} new questions`);
    } else {
      console.log('ℹ️  No new questions found');
    }

    this.setLastSyncTime(new Date().toISOString());
    return newQuestions;
  }

  async saveNewQuestions(questions) {
    // Save to IndexedDB or SQLite
    const dataStore = useDataStore();
    for (const q of questions) {
      await dataStore.addQuestion(q.post);
    }
  }
}

export default new IncrementalSync();
```

**Sync Schedule**:
- On app launch: Check if last sync > 7 days ago
- Manual sync: User can trigger from settings
- Background sync: Once per week

**Action Items**:
- [ ] Create `incrementalSync.js`
- [ ] Integrate with app startup
- [ ] Add sync UI in settings
- [ ] Test sync with small batches

---

### Phase 3: Data Storage & Bundling (Week 5-6)

#### 3.1 Choose Storage Strategy

**Option A: Pre-populated SQLite** (Recommended)

**Pros**:
- Fastest app startup (no import needed)
- Smaller bundle size (SQLite is compressed)
- Easy to query
- Well-tested in Cordova

**Cons**:
- More complex build process
- Need to regenerate database for updates

**Implementation**:

```bash
# Build script: scripts/build-sqlite.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function buildDatabase() {
  const db = await open({
    filename: 'assets/islamqa.db',
    driver: sqlite3.Database
  });

  // Create schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      reference INTEGER UNIQUE,
      title TEXT,
      parent_reference INTEGER,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY,
      reference INTEGER UNIQUE,
      title TEXT,
      question TEXT,
      answer TEXT,
      category_reference INTEGER,
      views INTEGER,
      date TEXT,
      FOREIGN KEY (category_reference) REFERENCES categories(reference)
    );

    CREATE INDEX idx_category_ref ON questions(category_reference);
    CREATE INDEX idx_reference ON questions(reference);
  `);

  // Load migrated data
  const categories = JSON.parse(fs.readFileSync('data/categories-new.json'));
  const questions = JSON.parse(fs.readFileSync('data/questions-new.json'));

  // Insert categories
  for (const cat of categories) {
    await db.run(
      `INSERT OR REPLACE INTO categories (reference, title, parent_reference, description)
       VALUES (?, ?, ?, ?)`,
      [cat.reference, cat.title, cat.parent_reference, cat.description]
    );
  }

  // Insert questions
  for (const q of questions) {
    const post = q.post;
    await db.run(
      `INSERT OR REPLACE INTO questions (reference, title, question, answer, category_reference, views, date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        post.reference,
        post.title,
        post.question,
        post.answer,
        post.tags[0]?.reference || null,
        post.views,
        post.date
      ]
    );
  }

  console.log('✅ Database built successfully');
  await db.close();
}

buildDatabase();
```

**Bundle Size Estimate**: ~15-20MB (compressed)

**Option B: JSON Files with IndexedDB** (Current approach)

**Pros**:
- Simpler to maintain
- Easy to update
- Works in browser testing

**Cons**:
- Slower first load (import needed)
- Larger bundle size
- Import process on first launch

**Implementation**: Continue using current approach but with new API data

#### 3.2 Data Update Strategy

**For Pre-populated SQLite**:

```javascript
// Update mechanism
class DatabaseUpdater {
  async checkForUpdates() {
    const localVersion = await this.getLocalVersion();
    const remoteVersion = await this.fetchRemoteVersion();

    if (remoteVersion > localVersion) {
      await this.downloadAndApplyUpdate(remoteVersion);
    }
  }

  async fetchRemoteVersion() {
    // Fetch from your server
    const response = await fetch('https://yourserver.com/api/db-version');
    const data = await response.json();
    return data.version;
  }

  async downloadAndApplyUpdate(version) {
    // Download delta SQL file
    const delta = await fetch(`https://yourserver.com/api/delta/${version}`);
    const sqlStatements = await delta.text();

    // Apply to local database
    const db = await openDatabase();
    await db.exec(sqlStatements);
    await this.setLocalVersion(version);
  }
}
```

**Delta Update Format**:
```sql
-- delta-v2.sql
INSERT OR REPLACE INTO questions (reference, title, question, answer, category_reference, views, date)
VALUES (250000, 'New Question', '<p>...</p>', '<p>...</p>', 218, 100, '2025-01-01');

UPDATE categories SET title = 'Updated Title' WHERE reference = 218;
```

**For JSON Files**:

```javascript
// Simpler: just download new JSON files
async function checkForDataUpdates() {
  const localVersion = localStorage.getItem('data_version');
  const remoteVersion = await fetch('https://yourserver.com/version.json');

  if (remoteVersion > localVersion) {
    // Download new data files
    const newQuestions = await fetch('https://yourserver.com/questions.json');
    const newCategories = await fetch('https://yourserver.com/categories.json');

    // Save to IndexedDB
    await importToIndexedDB(newQuestions, newCategories);
    localStorage.setItem('data_version', remoteVersion);
  }
}
```

#### 3.3 Recommended Storage Decision

**Recommendation**: **Pre-populated SQLite**

**Reasons**:
1. Faster app startup (critical for user experience)
2. Better memory efficiency
3. Industry standard for Cordova apps
4. Smaller bundle size after compression

**Migration Path**:
1. Phase 1-2: Use JSON files during development
2. Phase 3: Build pre-populated SQLite for production
3. Implement delta update system

**Action Items**:
- [ ] Create `build-sqlite.js` script
- [ ] Test SQLite import in Cordova
- [ ] Benchmark startup time (JSON vs SQLite)
- [ ] Make final decision based on benchmarks

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     INITIAL MIGRATION (ONE-TIME)                │
└─────────────────────────────────────────────────────────────────┘

  Old JS Files                                     IslamQA API
  ┌──────────┐                                    ┌──────────┐
  │questions │───┐                          ┌────>│  /post/  │
  │answers   │   │                          │     │  show/   │
  │categories│   │                          │     └──────────┘
  └──────────┘   │                          │
                 │                          │
                 v                          │
        ┌────────────────┐                  │
        │Extract         │                  │
        │Reference IDs   │──────────────────┘
        │(8000 refs)     │
        └────────────────┘
                 │
                 v
        ┌────────────────┐
        │ Batch Fetch    │
        │ from API       │
        │(~5 hours)      │
        └────────────────┘
                 │
                 v
        ┌────────────────┐
        │  Normalize &   │
        │  Save as JSON  │
        │     or         │
        │  Build SQLite  │
        └────────────────┘
                 │
                 v
        ┌────────────────┐
        │   Bundle in    │
        │      App       │
        └────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    ONGOING SYNC (WEEKLY)                        │
└─────────────────────────────────────────────────────────────────┘

  App Startup                      IslamQA API
       │                          ┌──────────────┐
       │                          │Try sequential│
       v                          │reference IDs │
┌──────────────┐                  │  (discovery) │
│Check last    │                  └──────────────┘
│sync date     │                          ^
└──────────────┘                          │
       │                                  │
       │ >7 days?                         │
       v                                  │
┌──────────────┐                          │
│Discover new  │──────────────────────────┘
│questions     │
│(ref > max)   │
└──────────────┘
       │
       v
┌──────────────┐
│Save to local │
│database      │
└──────────────┘
```

---

## 📋 Implementation Checklist

### Week 1: Data Analysis & Mapping
- [ ] Analyze old data structure (Done from above)
- [ ] Map old structure to new API format
- [ ] Create `data-mapper.js`
- [ ] Create `extract-references.js`
- [ ] Generate `reference-map.json`
- [ ] Verify reference map integrity

### Week 2: API Integration
- [ ] Create `apiSyncService.js`
- [ ] Test API endpoints with small samples
- [ ] Add rate limiting and error handling
- [ ] Create `migrate-data.js` script
- [ ] Test migration with 100 questions

### Week 3: Full Migration
- [ ] Run full migration (overnight)
- [ ] Verify data integrity
- [ ] Compare old vs new data
- [ ] Document any missing/changed questions
- [ ] Save migration statistics

### Week 4: Incremental Sync
- [ ] Create `incrementalSync.js`
- [ ] Implement discovery algorithm
- [ ] Add sync UI to app settings
- [ ] Test weekly sync workflow

### Week 5: Storage Decision
- [ ] Benchmark JSON vs SQLite startup times
- [ ] Create `build-sqlite.js` if choosing SQLite
- [ ] Test pre-populated database in Cordova
- [ ] Measure bundle sizes

### Week 6: Update Mechanism
- [ ] Design delta update format
- [ ] Create update server endpoint (if needed)
- [ ] Implement update check on startup
- [ ] Test update workflow end-to-end

---

## 🚀 Quick Start Commands

### Extract reference IDs from old data:
```bash
node scripts/extract-references.js
```

### Fetch all data from API (overnight):
```bash
node scripts/migrate-data.js
```

### Build pre-populated SQLite database:
```bash
node scripts/build-sqlite.js
```

### Test incremental sync:
```bash
node scripts/test-sync.js
```

---

## 📊 Expected Outcomes

### Data Quality:
- ✅ All 8000+ questions preserved
- ✅ Categories properly mapped
- ✅ HTML content maintained
- ✅ Relationships intact (question → category)

### Performance:
- ⚡ **Startup time**: <3 seconds (SQLite) vs ~5 seconds (JSON)
- 💾 **Bundle size**: ~15-20MB (SQLite) vs ~53MB (JSON)
- 🔄 **Sync time**: ~5 minutes for 100 new questions

### Maintenance:
- 📅 Weekly automatic sync
- 🔍 Discovery of new content
- 🛠️ Easy update deployment
- 📈 Versioned data format

---

## ⚠️ Risk Mitigation

### Risk 1: API Changes
**Mitigation**:
- Version API service layer
- Add API response validation
- Cache responses locally

### Risk 2: Missing Questions
**Mitigation**:
- Keep old JS files as backup
- Generate missing questions report
- Allow manual API fetch for missing items

### Risk 3: Large Migration Time
**Mitigation**:
- Run migration overnight
- Use parallel batches (with caution)
- Resume capability if interrupted

### Risk 4: Storage Size
**Mitigation**:
- Compress database with gzip
- Remove old data after successful migration
- Implement data cleanup for old content

---

## 🎯 Success Criteria

✅ **Migration Complete** when:
1. All 8000+ questions fetched from API
2. Categories properly structured
3. Data integrity verified (no corruption)
4. App starts with new data source
5. Old JS files can be safely removed

✅ **Sync Working** when:
1. App can discover new questions
2. Updates applied without data loss
3. Sync completes in <10 minutes
4. User can manually trigger sync

✅ **Production Ready** when:
1. Bundle size optimized
2. Startup time <3 seconds
3. All features working with new data
4. Tested on real devices (Android + iOS)
5. Update mechanism validated

---

## 📞 Next Steps

1. **Review this plan** and provide feedback
2. **Choose storage strategy** (SQLite vs JSON)
3. **Run Phase 1** (data extraction)
4. **Schedule migration** (overnight run)
5. **Integrate with app** (replace old data loaders)

---

**Questions?**

- How often do you want to sync? (Weekly, monthly?)
- Do you need multi-language support? (English only or also Arabic, Urdu, etc.?)
- Where will you host update files? (Your server, GitHub, CDN?)
- Should old JS files be preserved as fallback?
