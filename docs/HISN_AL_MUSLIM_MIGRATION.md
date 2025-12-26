# Hisn al-Muslim Migration Guide

This document describes the migration from LifeWithAllaah duas to Hisn al-Muslim duas.

## What Changed

### Data Source
- **Before**: Duas from LifeWithAllaah website (sunnah-duas.json, quranic-duas.json)
- **After**: Duas from Hisn al-Muslim (Fortress of the Muslim) - authentic collection of 268 duas from 132 chapters

### Data Structure Changes

#### Categories
**Before** (old structure):
```json
{
  "metadata": { ... },
  "categories": [
    {
      "id": 1,
      "name": "Morning Adhkar",
      "file": "morning.json",
      ...
    }
  ]
}
```

**After** (new structure):
```json
[
  {
    "id": "morning_evening",
    "category_id": 27,
    "title": "In the morning and evening",
    "title_ar": "أذكار الصباح والمساء",
    "icon": "🌅",
    "color": "from-amber-400 to-orange-500",
    "tab": "main",
    "order": 1,
    "dua_count": 24
  }
]
```

#### Duas
**Before**:
- Each category had its own JSON file
- Included `virtue` field with long markdown explanations
- Multiple sources mixed together

**After**:
- Single `duas.json` file with all duas grouped by category_id
- NO `virtue` or `explanation` fields
- Pure Hisn al-Muslim content
- Fields: `id`, `hisn_number`, `category_id`, `title`, `title_ar`, `arabic`, `transliteration`, `translation`, `reference`, `repetitions`, `order`, `tags`

### UI Changes
- **Removed**: "Show Virtue" toggle from settings
- **Removed**: Virtue/explanation display in dua views
- **Kept**: Same UI layout with Arabic, transliteration, translation, and reference

### Tab Organization
**Main Tab** (Frequent/Morning/Evening):
- Morning & Evening duas
- Waking up
- Before sleep
- Salah (prayer duas)
- Masjid & Adhan
- Istighfar (seeking forgiveness)
- Protection duas

**Other Tab**:
- Bathroom
- Clothes
- Wudu (ablution)
- Home
- Istikhara
- Tasbeeh
- Good manners
- And other categories

## Files Changed

### Data Files
- ✅ `public/data/dua/categories.json` - New category structure
- ✅ `public/data/dua/duas.json` - All duas in one file
- 🗄️ `public/data/dua/sunnah-duas.json.old` - Backed up
- 🗄️ `public/data/dua/quranic-duas.json.old` - Backed up

### Code Files Updated
- ✅ `src/services/duaDataLoader.js` - Updated to load new structure
- ✅ `src/stores/dua.js` - Removed `show_virtue` from settings
- ✅ `src/components/dua/DuaQuickSettings.vue` - Removed virtue toggle
- ✅ `src/views/SettingsView.vue` - Removed virtue toggle
- ✅ `src/views/ChatView.vue` - Removed virtue references

### Backup Location
All old data backed up to: `/home/user/islamqa/backups/duas-backup-YYYYMMDD/`

## Parser Script

The `scripts/parse-hisn-improved.js` script extracts duas from the source text file:

### Features
- Parses 268 duas from 132 chapters
- Properly escapes quotes and special characters for JSON
- Extracts: Arabic text, transliteration, translation, reference
- Generates category metadata (icons, colors, tabs)
- Organizes categories into main/other tabs

### Usage
```bash
node scripts/parse-hisn-improved.js
```

### Output
- `public/data/dua/hisn-al-muslim-categories.json`
- `public/data/dua/hisn-al-muslim-duas.json`

Then rename to `categories.json` and `duas.json`

## Embeddings Generation

### Current Embeddings
The old embeddings file (`public/data/dua-embeddings.json`) contains embeddings for the old duas. These need to be regenerated for Hisn al-Muslim content.

### How to Regenerate Embeddings

#### Step 1: Prepare the Data
The embeddings should be generated from the new duas in `public/data/dua/duas.json`.

#### Step 2: Generate Embeddings
You'll need to run an embeddings generation script that:
1. Loads all duas from `duas.json`
2. For each dua, creates an embedding from:
   - Title (English + Arabic)
   - Arabic text
   - Translation
   - Transliteration
   - Tags

3. Generates embeddings using a model (OpenAI, Cohere, or local model)
4. Saves to `public/data/dua-embeddings.json`

#### Step 3: Embedding Format
The embedding file should have this structure:
```json
{
  "model": "text-embedding-ada-002",
  "dimensions": 1536,
  "embeddings": [
    {
      "id": 1,  // Matches dua.id or dua.hisn_number
      "category_id": "waking_up",
      "text": "Combined text that was embedded",
      "embedding": [0.123, -0.456, ...]  // Vector of floats
    }
  ]
}
```

#### Step 4: Update Search
After regenerating embeddings, the semantic search feature will work with the new Hisn al-Muslim content.

### Embedding Script Template
Create a script like `scripts/generate-dua-embeddings.js`:

```javascript
const fs = require('fs');
const OpenAI = require('openai');  // or your preferred embeddings provider

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateEmbeddings() {
  // Load duas
  const duasByCategory = require('../public/data/dua/duas.json');
  const allDuas = Object.values(duasByCategory).flat();

  const embeddings = [];

  for (const dua of allDuas) {
    // Combine text for embedding
    const text = [
      dua.title,
      dua.title_ar,
      dua.arabic,
      dua.transliteration,
      dua.translation,
      dua.tags.join(' ')
    ].filter(Boolean).join(' ');

    console.log(`Generating embedding for dua ${dua.id}...`);

    // Generate embedding
    const response = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });

    embeddings.push({
      id: dua.id,
      category_id: dua.category_id,
      text: text,
      embedding: response.data[0].embedding
    });

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Save embeddings
  const output = {
    model: 'text-embedding-ada-002',
    dimensions: 1536,
    total_embeddings: embeddings.length,
    generated_at: new Date().toISOString(),
    embeddings: embeddings
  };

  fs.writeFileSync(
    'public/data/dua-embeddings.json',
    JSON.stringify(output, null, 2)
  );

  console.log(`✅ Generated ${embeddings.length} embeddings`);
}

generateEmbeddings().catch(console.error);
```

### Running Embeddings Generation

```bash
# Install dependencies
npm install openai  # or your provider

# Set API key
export OPENAI_API_KEY="your-key-here"

# Run generator
node scripts/generate-dua-embeddings.js
```

## Testing the Migration

### 1. Clear Existing Data
Open browser console and run:
```javascript
// Clear IndexedDB
indexedDB.deleteDatabase('IslamQADB')
// Refresh page
location.reload()
```

### 2. Test Import
- App should redirect to import page
- Should show progress loading Hisn al-Muslim
- Should complete with 15 categories and 268 duas

### 3. Verify Categories
- Check that main tab has 7 categories
- Check that other tab has 8 categories
- Verify icons and colors display correctly

### 4. Verify Duas
- Open a category
- Check that Arabic text displays
- Check that transliteration displays
- Check that translation displays
- Check that reference displays
- **Verify NO virtue/explanation section**

### 5. Test Search
- Search for common words like "Allah", "forgiveness", "sleep"
- Verify search results are from Hisn al-Muslim

### 6. Test Settings
- Verify "Show Virtue" toggle is REMOVED
- Test other toggles (transliteration, translation, reference)
- Test font size adjusters

## Summary

- ✅ **268 duas** from **Hisn al-Muslim** now in app
- ✅ **Authentic sources only** - no more mixed content
- ✅ **Cleaner structure** - virtue/explanation removed
- ✅ **Better organization** - main/other tabs
- ✅ **Same great UI** - familiar experience for users
- 🔄 **Embeddings** - need to be regenerated (see guide above)

## Rollback (if needed)

If you need to rollback to old duas:
```bash
# Restore old files
cp backups/duas-backup-YYYYMMDD/dua/sunnah-duas.json public/data/dua/
cp backups/duas-backup-YYYYMMDD/dua/quranic-duas.json public/data/dua/

# Update data loader back to old structure
git checkout src/services/duaDataLoader.js
git checkout src/stores/dua.js

# Clear database and refresh
```

## Next Steps

1. ✅ Migration complete
2. 🔄 User to run embeddings generation script
3. ✅ Test all functionality
4. ✅ Deploy to production

---

**Migration Date**: December 26, 2025
**Duas Count**: 268 (from 132 chapters)
**Source**: Hisn al-Muslim (Fortress of the Muslim)
**Status**: ✅ Complete (pending embeddings regeneration)
