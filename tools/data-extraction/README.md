# IslamQA Data Extraction Tool

Extract fresh Q&A data from the IslamQA API for bundling with your Vue 3 app.

## Purpose

This tool extracts Islamic Q&A content from the [IslamQA API](https://archive-1446.islamqa.info/api/) and generates structured JSON files ready for:
- App bundling (offline-first capability)
- IndexedDB import with Dexie.js
- Full-text search implementation
- Category hierarchy navigation

## Quick Start

### 1. Install Dependencies

```bash
pip3 install requests
```

### 2. Test with Small Range

```bash
cd /Users/mohamedazher/Halsimplify/islamqa/tools/data-extraction

# Test extraction (1-100 references, ~1 minute)
python3 extract_fresh.py --range 1 100 --output ../../public/data --delay 0.3
```

Expected: ~80-90 questions extracted with categories intact.

### 3. Run Full Extraction

```bash
# Production extraction (1-250000 references, ~6 days)
python3 extract_fresh.py --range 1 250000 --output ../../public/data --delay 2.0
```

Or run in background:

```bash
nohup python3 extract_fresh.py \
  --range 1 250000 \
  --output ../../public/data \
  --delay 2.0 \
  > extraction.log 2>&1 &

# Monitor progress
tail -f extraction.log
```

## Output Files

Generated in `public/data/`:

```
public/data/
├── categories.json      (267 categories with hierarchy)
├── questions.json       (5000-25000 Q&As)
└── metadata.json        (version, stats)
```

### Data Structure

Each question has:
```json
{
  "reference": 230367,
  "title": "Question title",
  "question": "<p>HTML question text</p>",
  "answer": "<p>HTML answer (1000+ words)</p>",
  "category_reference": 3,
  "category_path": [3],
  "tags": ["Category Name"],
  "views": 135848,
  "date": "26-08-2015",
  "bookmarked": false,
  "last_read": null
}
```

## Usage in Vue App

### 1. Load data into IndexedDB

```javascript
// src/services/databaseService.js
import Dexie from 'dexie';

const db = new Dexie('IslamQA');
db.version(1).stores({
  categories: 'reference',
  questions: 'reference, category_reference'
});

export async function initializeDatabase() {
  const categories = await fetch('data/categories.json').then(r => r.json());
  const questions = await fetch('data/questions.json').then(r => r.json());

  await db.categories.bulkAdd(categories);
  await db.questions.bulkAdd(questions);

  return db;
}

export default db;
```

### 2. Use in Vue components

```javascript
// src/stores/islamqaStore.js (Pinia)
import db from '@/services/databaseService';

export const useIslamQAStore = defineStore('islamqa', {
  state: () => ({
    questions: [],
    categories: []
  }),

  actions: {
    async searchQuestions(query) {
      return await db.questions
        .where('title').startsWithIgnoreCase(query)
        .toArray();
    },

    async getCategoryQuestions(categoryRef) {
      return await db.questions
        .where('category_reference').equals(categoryRef)
        .toArray();
    }
  }
});
```

## Command Options

```bash
python3 extract_fresh.py --range START END [OPTIONS]

Required:
  --range START END        Reference ID range (e.g., 1 250000)

Optional:
  --output DIR             Output directory (default: public/data)
  --delay SECONDS          Delay between requests (default: 2.0)
  --lang CODE              Language code (default: en)
```

## Performance

| Range | Delay | Time | Hit Rate | Questions |
|-------|-------|------|----------|-----------|
| 1-100 | 0.3s | 1 min | 83% | ~83 |
| 1-10k | 0.5s | 1.4 hrs | 5-10% | ~500 |
| 1-100k | 1.0s | 28 hrs | 5-10% | ~5-10k |
| 1-250k | 2.0s | 140 hrs (6 days) | 5-10% | ~12-25k |

## How It Works

### STEP 1: Fetch Categories
- Single API call gets all 267 categories
- Builds hierarchy (5 levels deep)
- Saves to `categories.json`

### STEP 2: Discover Questions
- Tries each reference ID in range
- ~90% of IDs don't exist (normal)
- Saves progress every 50 questions
- Saves to `questions.json`

### STEP 3: Finalize
- Updates category question counts
- Creates `metadata.json` with stats
- Prints summary

## Resuming Interrupted Extraction

If extraction stops:

```bash
# Check last saved point
tail -20 extraction.log

# Resume from next range
python3 extract_fresh.py --range 150001 250000 --output ../../public/data --delay 2.0
```

## API Details

**Base URL:** `https://archive-1446.islamqa.info/api`

**Endpoints:**
- `GET /{lang}/categories/topics` - All categories
- `GET /{lang}/post/show/{ref}` - Single question by reference

## Next Steps

After extraction completes:

1. ✅ Verify data in `public/data/`
2. ✅ Test IndexedDB import in Vue app
3. ✅ Implement search functionality
4. ✅ Create category browser UI
5. ✅ Add bookmark system
6. ✅ Deploy with app bundle

## Troubleshooting

**Extraction too slow?**
```bash
python3 extract_fresh.py --range 1 250000 --output ../../public/data --delay 1.0
```

**Too many 404 errors?** - This is normal, script handles it.

**Want different language?**
```bash
python3 extract_fresh.py --range 1 250000 --output ../../public/data/ar --lang ar
```

## Full Documentation

See `EXTRACTION_GUIDE.md` for detailed strategies and troubleshooting.

---

**Status:** ✅ Tested and working
**Last Updated:** November 6, 2025
