# 📊 IslamQA Data Pipeline - Design Document

## Overview

Automated pipeline to extract data from IslamQA API, transform it to app format, and bundle it for offline use.

---

## Current vs New Architecture

### ❌ Current (Manual Process)
```
API → Python Script → Manual Conversion → JS Files → Copy to public/data → Manual Import
```
- Manual conversion needed between API format and app format
- Inconsistent data structures
- Time-consuming process

### ✅ New (Automated Pipeline)
```
API → extract_fresh.py → transform.js → bundle.js → public/data/*.json → Auto Import
```
- Fully automated transformation
- Consistent data structures
- One command triggers entire pipeline

---

## Data Format Mapping

### Python Script Output (API Format)
```json
// categories.json
{
  "reference": 218,
  "title": "Basic Tenets of Faith",
  "description": "",
  "parent_reference": null,
  "children_references": [219, 230, 234, 235],
  "has_subcategories": true,
  "has_questions": false,
  "question_count": 0,
  "level": 0,
  "url": "cat/218"
}

// questions.json
{
  "reference": 115156,
  "title": "Ruling on sitting with...",
  "question": "<p>HTML question text</p>",
  "answer": "<p>HTML answer text (full)</p>",
  "category_reference": 218,
  "category_path": [218],
  "tags": ["Basic Tenets of Faith"],
  "views": 12345,
  "date": "26-08-2015",
  "bookmarked": false,
  "last_read": null
}
```

### App Expected Format (Current)
```json
// categories
{
  "id": "1",
  "category_links": "Basic Tenets of Faith",
  "category_url": "cat/218",
  "element": "218",
  "parent": "0",
  "status": "done"
}

// questions
{
  "id": "1",
  "category_id": "218",
  "question": "Ruling on sitting with...",
  "question_full": "Full question text...",
  "question_url": "/en/115156",
  "question_no": "115156",
  "status": "done"
}

// answers
{
  "id": "1",
  "question_id": "1",
  "answers": "<p>HTML answer text</p>"
}
```

---

## Pipeline Stages

### Stage 1: Extract from API
**Script**: `extract_fresh.py` (already exists)
**Input**: IslamQA API
**Output**:
- `raw/categories.json` (API format)
- `raw/questions.json` (API format)
- `raw/metadata.json`

**Command**:
```bash
python3 extract_fresh.py --range 1 250000 --output raw/ --delay 2.0
```

### Stage 2: Transform to App Format
**Script**: `transform.js` (NEW - to be created)
**Input**: `raw/*.json`
**Output**:
- `transformed/categories.json` (app format)
- `transformed/questions.json` (app format)
- `transformed/answers.json` (app format)

**Transformations**:
1. **Categories**: `reference` → `element`, add sequential `id`, `parent_reference` → `parent`, `title` → `category_links`
2. **Questions**: Split combined data into `questions` + `answers`, add sequential `id`, `reference` → `question_no`, `question` (HTML) → `question_full`, extract plain text → `question`
3. **Answers**: Extract from questions, link via sequential IDs

**Command**:
```bash
node transform.js --input raw/ --output transformed/
```

### Stage 3: Bundle for App
**Script**: `bundle.js` (NEW - to be created)
**Input**: `transformed/*.json`
**Output**: `../../public/data/*.json` (optimized, ready for app)

**Optimizations**:
- Minify JSON (remove whitespace)
- Validate data integrity
- Generate import manifest
- Calculate checksums

**Command**:
```bash
node bundle.js --input transformed/ --output ../../public/data/
```

### Stage 4: Import to Dexie (App Side)
**Script**: `src/services/dataImporter.js` (NEW - to be created)
**Input**: `public/data/*.json`
**Output**: Dexie IndexedDB populated

**Process**:
1. Check if data already imported
2. Fetch JSON files
3. Transform to Dexie format if needed
4. Bulk insert to IndexedDB
5. Mark as imported

---

## File Structure

```
tools/data-extraction/
├── extract_fresh.py          ✅ Existing - API extraction
├── transform.js              🆕 New - Format transformation
├── bundle.js                 🆕 New - Bundle optimization
├── run-pipeline.sh           🆕 New - Run entire pipeline
├── raw/                      🆕 Temp - API output
│   ├── categories.json
│   ├── questions.json
│   └── metadata.json
├── transformed/              🆕 Temp - Transformed data
│   ├── categories.json
│   ├── questions.json
│   └── answers.json
└── README.md                 ✅ Existing

public/data/                  ✅ Existing - App bundle
├── categories.json           🔄 Updated format
├── questions.json            🔄 Updated format
├── answers.json              🔄 Updated format
└── manifest.json             🆕 New - Import metadata

src/services/
├── dexieDatabase.js          ✅ Existing - Database
└── dataImporter.js           🆕 New - Import logic
```

---

## Transformation Logic Details

### 1. Categories Transformation

**Input** (API):
```json
{
  "reference": 218,
  "title": "Basic Tenets of Faith",
  "parent_reference": null,
  "url": "cat/218",
  "children_references": [219, 230],
  "question_count": 5
}
```

**Output** (App):
```json
{
  "id": "1",
  "element": "218",
  "category_links": "Basic Tenets of Faith",
  "category_url": "cat/218",
  "parent": "0",
  "status": "done"
}
```

**Algorithm**:
```javascript
function transformCategory(apiCategory, sequentialId) {
  return {
    id: String(sequentialId),
    element: String(apiCategory.reference),
    category_links: apiCategory.title,
    category_url: apiCategory.url,
    parent: apiCategory.parent_reference ? String(apiCategory.parent_reference) : "0",
    status: "done"
  }
}
```

### 2. Questions + Answers Transformation

**Input** (API):
```json
{
  "reference": 115156,
  "title": "Ruling on sitting with...",
  "question": "<p>Full HTML question...</p>",
  "answer": "<p>Full HTML answer...</p>",
  "category_reference": 218
}
```

**Output** (App):
```json
// questions.json
{
  "id": "1",
  "category_id": "218",
  "question": "Ruling on sitting with...",
  "question_full": "Full HTML question...",
  "question_url": "/en/115156",
  "question_no": "115156",
  "status": "done"
}

// answers.json
{
  "id": "1",
  "question_id": "1",
  "answers": "<p>Full HTML answer...</p>"
}
```

**Algorithm**:
```javascript
function transformQuestion(apiQuestion, sequentialId) {
  const question = {
    id: String(sequentialId),
    category_id: String(apiQuestion.category_reference),
    question: apiQuestion.title,
    question_full: apiQuestion.question,
    question_url: `/en/${apiQuestion.reference}`,
    question_no: String(apiQuestion.reference),
    status: "done"
  }

  const answer = {
    id: String(sequentialId),
    question_id: String(sequentialId),
    answers: apiQuestion.answer
  }

  return { question, answer }
}
```

---

## Run Pipeline Script

**`run-pipeline.sh`**:
```bash
#!/bin/bash
set -e

echo "🚀 IslamQA Data Pipeline"
echo "======================="

# Step 1: Extract from API
echo ""
echo "📥 Step 1: Extracting from API..."
python3 extract_fresh.py \
  --range 1 250000 \
  --output raw/ \
  --delay 2.0 \
  --lang en

# Step 2: Transform to app format
echo ""
echo "🔄 Step 2: Transforming to app format..."
node transform.js \
  --input raw/ \
  --output transformed/

# Step 3: Bundle for app
echo ""
echo "📦 Step 3: Bundling for app..."
node bundle.js \
  --input transformed/ \
  --output ../../public/data/

# Step 4: Verify
echo ""
echo "✅ Step 4: Verifying..."
node verify.js --input ../../public/data/

echo ""
echo "✨ Pipeline complete!"
echo "Data ready in: public/data/"
```

---

## Import Flow (App Side)

### ImportView.vue Updates
```vue
<template>
  <div class="import-view">
    <h1>Import Data</h1>

    <div v-if="!isImported">
      <button @click="startImport">Import Fresh Data</button>
      <progress :value="progress" max="100"></progress>
    </div>

    <div v-else>
      <p>✅ Data already imported</p>
      <button @click="reimport">Reimport</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import dataImporter from '@/services/dataImporter'

const isImported = ref(false)
const progress = ref(0)

async function startImport() {
  await dataImporter.importAll((p) => {
    progress.value = p
  })
  isImported.value = true
}
</script>
```

### dataImporter.js
```javascript
import dexieDb from './dexieDatabase'

export default {
  async importAll(onProgress) {
    // Step 1: Load JSON
    onProgress(10)
    const [categories, questions, answers] = await Promise.all([
      fetch('/data/categories.json').then(r => r.json()),
      fetch('/data/questions.json').then(r => r.json()),
      fetch('/data/answers.json').then(r => r.json())
    ])

    // Step 2: Import to Dexie
    onProgress(40)
    await dexieDb.importCategories(categories)

    onProgress(60)
    await dexieDb.importQuestions(questions)

    onProgress(80)
    await dexieDb.importAnswers(answers)

    // Step 3: Mark as imported
    onProgress(100)
    await dexieDb.markAsImported()
  }
}
```

---

## Advantages of This System

1. **✅ Automated**: One command runs entire pipeline
2. **✅ Consistent**: Single source of truth (API)
3. **✅ Maintainable**: Clear separation of concerns
4. **✅ Verifiable**: Built-in validation at each stage
5. **✅ Efficient**: Optimized JSON for app bundle size
6. **✅ Flexible**: Easy to modify transformations
7. **✅ Incremental**: Can update just changed data in future

---

## Next Steps

1. ✅ Design pipeline (this document)
2. 🔄 Create `transform.js` script
3. 🔄 Create `bundle.js` script
4. 🔄 Create `run-pipeline.sh` orchestrator
5. 🔄 Create `dataImporter.js` service
6. 🔄 Update ImportView.vue to use new import flow
7. 🔄 Test full pipeline end-to-end
8. 🔄 Document usage in README

---

## Usage

### For Fresh Data Extraction
```bash
cd tools/data-extraction
chmod +x run-pipeline.sh
./run-pipeline.sh
```

### For Testing (Small Range)
```bash
# Test with 100 questions
python3 extract_fresh.py --range 1 100 --output raw/ --delay 0.3
node transform.js --input raw/ --output transformed/
node bundle.js --input transformed/ --output ../../public/data/
```

### In App (ImportView)
1. User opens ImportView
2. Clicks "Import Data"
3. App fetches JSON from `/data/*.json`
4. Imports to Dexie IndexedDB
5. Marks as imported
6. Redirects to HomeView

---

**Status**: ✅ Design Complete - Ready for Implementation
**Created**: November 6, 2025
