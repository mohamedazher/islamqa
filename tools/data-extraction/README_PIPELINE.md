# 📊 IslamQA Data Pipeline - Complete Guide

## Overview

Automated system to extract Q&A data from IslamQA API, transform to app format, and bundle for deployment.

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA PIPELINE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  API → Extract → Transform → Bundle → App Import            │
│                                                              │
│  ✅ Automated      ✅ Validated      ✅ Optimized           │
│  ✅ Resumable      ✅ Consistent     ✅ Fast                │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Option 1: Full Pipeline (Automatic)

```bash
cd tools/data-extraction

# Test with 100 questions (recommended first)
./run-pipeline.sh --test

# Full extraction (1-250,000 references, ~6 days)
./run-pipeline.sh

# Skip extraction if you already have raw data
./run-pipeline.sh --quick
```

### Option 2: Manual Steps

```bash
# Step 1: Extract from API
python3 extract_fresh.py --range 1 100 --output raw/ --delay 0.3

# Step 2: Transform to app format
node transform.cjs --input raw/ --output transformed/

# Step 3: Bundle for app
node bundle.cjs --input transformed/ --output ../../public/data/
```

---

## Pipeline Stages Explained

### Stage 1: Extract from API

**Script**: `extract_fresh.py`
**Purpose**: Fetch categories and questions from IslamQA API
**Output**: `raw/categories.json`, `raw/questions.json`, `raw/metadata.json`

**API Format** (what we get from IslamQA):
```json
{
  "reference": 218,
  "title": "Basic Tenets of Faith",
  "question": "<p>Full HTML question text</p>",
  "answer": "<p>Full HTML answer text</p>",
  "category_reference": 218,
  "tags": ["Faith", "Islam"],
  "views": 12345,
  "date": "26-08-2015"
}
```

**Command Options**:
- `--range START END`: Reference IDs to try (e.g., `1 250000`)
- `--output DIR`: Where to save (default: `raw/`)
- `--delay SECONDS`: Delay between requests (default: `2.0`)
- `--lang CODE`: Language (default: `en`)

**Performance**:
- ~90% of reference IDs don't exist (normal)
- Saves progress every 50 questions
- Can be resumed if interrupted

---

### Stage 2: Transform to App Format

**Script**: `transform.cjs`
**Purpose**: Convert API format to app's expected structure
**Input**: `raw/categories.json`, `raw/questions.json`
**Output**: `transformed/categories.json`, `transformed/questions.json`, `transformed/answers.json`

**App Format** (what your app expects):
```json
// categories.json
{
  "id": "1",
  "element": "218",
  "category_links": "Basic Tenets of Faith",
  "category_url": "cat/218",
  "parent": "0",
  "status": "done"
}

// questions.json
{
  "id": "1",
  "category_id": "218",
  "question": "Ruling on sitting with...",
  "question_full": "<p>Full HTML question</p>",
  "question_url": "/en/115156",
  "question_no": "115156",
  "status": "done"
}

// answers.json
{
  "id": "1",
  "question_id": "1",
  "answers": "<p>Full HTML answer</p>"
}
```

**Transformations**:
1. **Categories**: Add sequential IDs, map field names, handle parent relationships
2. **Questions**: Split combined data, strip HTML for summaries, add URLs
3. **Answers**: Extract from questions, link via sequential IDs

---

### Stage 3: Bundle for App

**Script**: `bundle.cjs`
**Purpose**: Validate, optimize, and package data for app deployment
**Input**: `transformed/*.json`
**Output**: `public/data/*.json` + `manifest.json`

**Features**:
- ✅ Data integrity validation
- ✅ JSON minification (optional)
- ✅ Checksum calculation
- ✅ Metadata generation
- ✅ File size reporting

**Manifest** (auto-generated):
```json
{
  "version": "1.0.0",
  "generated_at": "2025-11-06T12:00:00.000Z",
  "counts": {
    "categories": 269,
    "questions": 8523,
    "answers": 8523
  },
  "checksums": {
    "categories": "abc123...",
    "questions": "def456...",
    "answers": "ghi789..."
  },
  "files": [
    "categories.json",
    "questions.json",
    "answers.json"
  ]
}
```

---

## File Structure

```
tools/data-extraction/
├── extract_fresh.py          # Stage 1: API extraction
├── transform.cjs             # Stage 2: Format transformation
├── bundle.cjs                # Stage 3: Bundle optimization
├── run-pipeline.sh           # Orchestrator script
├── DATA_PIPELINE.md          # Design documentation
├── README_PIPELINE.md        # This file
├── README.md                 # Original README
├── EXTRACTION_GUIDE.md       # Original guide
│
├── raw/                      # Temp - API output
│   ├── categories.json       # API format
│   ├── questions.json        # API format
│   └── metadata.json         # Stats
│
└── transformed/              # Temp - Transformed data
    ├── categories.json       # App format
    ├── questions.json        # App format
    └── answers.json          # App format

public/data/                  # Final bundle (in app)
├── categories.json           # Ready for import
├── questions.json            # Ready for import
├── answers.json              # Ready for import
└── manifest.json             # Import metadata
```

---

## Usage Examples

### Test with Small Dataset
```bash
cd tools/data-extraction

# Extract 100 questions (takes ~30 seconds)
./run-pipeline.sh --test
```

### Production Extraction
```bash
cd tools/data-extraction

# Full extraction (takes ~6 days with 2s delay)
./run-pipeline.sh

# Or run in background
nohup ./run-pipeline.sh > extraction.log 2>&1 &

# Monitor progress
tail -f extraction.log
```

### Resume Interrupted Extraction
```bash
# If stopped at reference 50000, continue from there
python3 extract_fresh.py --range 50001 250000 --output raw/ --delay 2.0

# Then run transform and bundle
./run-pipeline.sh --quick
```

### Use Existing Extraction
```bash
# If you already have raw/*.json files
./run-pipeline.sh --quick
```

### Custom Range
```bash
# Extract specific range
python3 extract_fresh.py --range 100000 200000 --output raw/ --delay 1.5
node transform.cjs --input raw/ --output transformed/
node bundle.cjs --input transformed/ --output ../../public/data/
```

---

## App Integration

### Import Data in App

The app automatically imports data on first launch via `ImportView.vue`:

```javascript
// src/services/dataImporter.js
export default {
  async importAll() {
    // Load from public/data/*.json
    const [categories, questions, answers] = await Promise.all([
      fetch('/data/categories.json').then(r => r.json()),
      fetch('/data/questions.json').then(r => r.json()),
      fetch('/data/answers.json').then(r => r.json())
    ])

    // Import to Dexie IndexedDB
    await dexieDb.importCategories(categories)
    await dexieDb.importQuestions(questions)
    await dexieDb.importAnswers(answers)

    // Mark as imported
    await dexieDb.markAsImported()
  }
}
```

### Database Schema (Dexie)

```javascript
// src/services/dexieDatabase.js
db.version(1).stores({
  categories: 'id, parent, element',
  questions: 'id, category_id, question',
  answers: 'id, question_id',
  folders: '++id, folder_name',
  folder_questions: '++id, question_id, folder_id',
  settings: 'key'
})
```

---

## Troubleshooting

### API Returns 403 Forbidden
- **Issue**: IslamQA API may have rate limiting or require authentication
- **Solution**:
  - Increase delay: `--delay 3.0`
  - Try different time of day
  - Contact IslamQA for API access
  - Use existing data if available

### Transform Script Fails (ES Module Error)
- **Issue**: Package.json has `"type": "module"` which breaks `require()`
- **Solution**: Use `.cjs` versions (already implemented)
  - `transform.cjs` instead of `transform.js`
  - `bundle.cjs` instead of `bundle.js`

### Data Validation Errors
- **Issue**: Transformed data doesn't match expected structure
- **Fix**: Check transformation logic in `transform.cjs`
- **Debug**: Inspect `transformed/*.json` files manually

### File Size Too Large
- **Issue**: Bundle is too big for git/deployment
- **Solutions**:
  - Enable minification: `--minify true`
  - Split into smaller chunks
  - Use git LFS for large files
  - Host data separately and fetch on demand

### Missing Dependencies
```bash
# Python
pip3 install requests

# Node.js (already installed)
node --version

# bc (for time estimation)
sudo apt-get install bc  # Ubuntu/Debian
brew install bc          # macOS
```

---

## Performance Metrics

### Extraction Speed
| Range | Delay | Time | Expected Questions |
|-------|-------|------|--------------------|
| 1-100 | 0.3s | 30s | ~85 |
| 1-10,000 | 1.0s | 2.8h | ~850 |
| 1-100,000 | 2.0s | 56h | ~8,500 |
| 1-250,000 | 2.0s | 140h (6 days) | ~21,000 |

### File Sizes (Estimated)
- `categories.json`: 50-100 KB
- `questions.json`: 5-15 MB
- `answers.json`: 20-40 MB
- **Total**: 25-55 MB

### Transform & Bundle
- Transformation: ~2-5 seconds (10,000 questions)
- Bundling: ~1-3 seconds (10,000 questions)
- Validation: <1 second

---

## Data Quality

### Validation Checks
✅ All categories have required fields
✅ All questions have required fields
✅ All answers have required fields
✅ Question count matches answer count
✅ Category relationships are valid
✅ No duplicate IDs
✅ All HTML is properly encoded

### Data Integrity
- Sequential IDs for questions/answers (1, 2, 3...)
- String IDs throughout (consistent with old format)
- Parent-child relationships preserved
- Original reference IDs kept in `element` and `question_no`

---

## Advanced Usage

### Incremental Updates

To update only new questions:

```bash
# Find highest existing reference
MAX_REF=$(cat public/data/questions.json | grep -o '"question_no":"[0-9]*"' | grep -o '[0-9]*' | sort -n | tail -1)

# Extract from MAX_REF+1 onwards
python3 extract_fresh.py --range $((MAX_REF + 1)) 300000 --output raw-new/

# Merge with existing data (manual script needed)
# ... merge logic ...
```

### Multi-Language Support

```bash
# Extract Arabic content
python3 extract_fresh.py --range 1 250000 --output raw-ar/ --lang ar --delay 2.0

# Transform
node transform.cjs --input raw-ar/ --output transformed-ar/

# Bundle to separate directory
node bundle.cjs --input transformed-ar/ --output ../../public/data/ar/
```

### Parallel Extraction

Split range across multiple processes (use with caution):

```bash
# Terminal 1
python3 extract_fresh.py --range 1 62500 --output raw-1/ &

# Terminal 2
python3 extract_fresh.py --range 62501 125000 --output raw-2/ &

# Terminal 3
python3 extract_fresh.py --range 125001 187500 --output raw-3/ &

# Terminal 4
python3 extract_fresh.py --range 187501 250000 --output raw-4/ &

# Merge later (manual script needed)
```

---

## Comparison: Old vs New System

### Old System ❌
- Manual extraction
- Manual conversion from API format
- Copy-paste into JS files
- No validation
- Time-consuming
- Error-prone

### New System ✅
- Automated extraction
- Automatic format conversion
- One-command pipeline
- Built-in validation
- Fast and reliable
- Repeatable

---

## Next Steps

1. ✅ **Test the pipeline** with `--test` flag
2. ✅ **Verify data** in `public/data/`
3. ✅ **Test import** in app (ImportView)
4. ✅ **Run full extraction** when ready
5. ✅ **Commit** or deploy updated data

---

## Support

- **Issues**: Check `extraction.log` for errors
- **Questions**: See `DATA_PIPELINE.md` for design details
- **API Docs**: https://archive-1446.islamqa.info/api/

---

## License

Same as main project (MIT)

---

**Created**: November 6, 2025
**Status**: ✅ Ready for Production
**Version**: 1.0.0
