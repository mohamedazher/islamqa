# 🚀 IslamQA Data Extraction - Dump File Method

**Fast, simple, and reliable data extraction using official IslamQA dump files**

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [How It Works](#how-it-works)
4. [Output](#output)
5. [Configuration](#configuration)
6. [Advanced Usage](#advanced-usage)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What This Does

Downloads pre-packaged NDJSON dump files from IslamQA's CDN and transforms them into your app's format.

```
IslamQA CDN → Download Dump → Parse NDJSON → Transform → App-Ready JSON
```

### Why Dump Files vs API?

| Aspect | API Method (Old) | Dump Files (New) |
|--------|------------------|------------------|
| **Time** | 40-50 minutes | ~30 seconds ⚡ |
| **Requests** | Thousands | 2 (manifest + dump) |
| **Complexity** | High | Low ✅ |
| **Reliability** | Pagination, rate limits | Single download ✅ |
| **Data Freshness** | Real-time | Daily dumps |

**Result: 100x faster with simpler code!**

### What You Get

- **268 categories** with full hierarchy (parent-child relationships, ancestors)
- **15,622 questions** with complete HTML answers
- **2.98M** views on most popular question
- **86 MB** of Islamic Q&A content
- **Perfect format** for your app

---

## Quick Start

### One Command

```bash
cd tools/data-extraction
python3 download_dumps.py
```

**That's it!** In ~30 seconds you'll have all the data.

### Output

Data will be in `public/data/`:
- `categories.json` (94 KB) - 268 categories
- `questions.json` (86 MB) - 15,622 Q&As
- `metadata.json` (184 B) - Generation info

---

## How It Works

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────┐
│ Step 1: Download Manifest                           │
│   URL: files.zadapps.info/m.islamqa.info/           │
│        dumps/manifest.json                           │
│   Time: < 1 second                                   │
│   Purpose: Find latest dump file                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Step 2: Find Latest English Dump                    │
│   Folder: dumps/2025-11-02-220000/en/               │
│   File: data.ndjson.gz                               │
│   Size: 28.7 MB compressed                           │
│         97.0 MB uncompressed                         │
│   Records: 17,911                                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Step 3: Download Dump File                          │
│   Time: ~10-15 seconds                               │
│   Progress: Live progress bar                        │
│   Note: Server auto-decompresses gzip                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Step 4: Parse NDJSON                                │
│   Format: One JSON object per line                   │
│   Types: topic, answer, source, file, learn-with-us  │
│   Extracted:                                         │
│     - 268 topics/categories                          │
│     - 15,622 answers/questions                       │
│     - Other metadata                                 │
│   Time: ~5 seconds                                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Step 5: Transform to App Format                     │
│   Categories:                                        │
│     - Build parent-child relationships               │
│     - Calculate hierarchy levels                     │
│     - Add ancestor paths                             │
│   Questions:                                         │
│     - Extract from topics field                      │
│     - Map categories                                 │
│     - Preserve HTML content                          │
│     - Add metadata                                   │
│   Time: ~5 seconds                                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Step 6: Save Output                                 │
│   Files:                                             │
│     - categories.json (94 KB)                        │
│     - questions.json (86 MB)                         │
│     - metadata.json (184 B)                          │
│   Time: ~5 seconds                                   │
└─────────────────────────────────────────────────────┘
                        ↓
                   ✅ DONE!
        Total Time: ~30 seconds
```

### Data Structure

**NDJSON Dump Format:**
```json
{"serial":1581425672000,"op":"created","type":"answer","data":{
  "type":"answer",
  "reference":11789,
  "title":"Question title",
  "question":"<p>HTML question</p>",
  "body":"<p>HTML answer</p>",
  "topics":[{"reference":170,"title":"Category","ancestors":[...]}],
  "source":{"reference":1,"title":"Sheikh Name"},
  "views":8467,
  "contentLangs":["en","ar","fr"]
}}

{"serial":1762126300847,"op":"created","type":"topic","data":{
  "reference":92,
  "title":"Category Title",
  "parentId":90,
  "answerCount":56,
  "ancestors":[{"reference":55,"title":"Parent Category"}]
}}
```

**App Format:**
```json
// categories.json
{
  "reference": 92,
  "title": "Category Title",
  "description": "Category description",
  "parent_reference": 90,
  "children_references": [93, 94, 95],
  "has_subcategories": true,
  "has_questions": true,
  "question_count": 56,
  "level": 2,
  "ancestors": [55, 90],
  "url": "/category/92"
}

// questions.json
{
  "reference": 11789,
  "title": "Question title",
  "question": "<p>HTML question</p>",
  "answer": "<p>HTML answer</p>",
  "categories": [170],
  "primary_category": 170,
  "tags": ["Category Title"],
  "taxonomies": {...},
  "views": 8467,
  "date": "2000-08-08T00:00:00.000Z",
  "content_langs": ["en","ar","fr"],
  "bookmarked": false,
  "last_read": null
}
```

---

## Output

### File Details

| File | Size | Records | Description |
|------|------|---------|-------------|
| `categories.json` | 94 KB | 268 | Categories with hierarchy |
| `questions.json` | 86 MB | 15,622 | Complete Q&As with HTML |
| `metadata.json` | 184 B | - | Generation metadata |

### Sample Category

```json
{
  "reference": 3,
  "title": "Basic Tenets of Faith",
  "description": "Discusses what the Muslim must believe...",
  "parent_reference": null,
  "children_references": [21, 4, 20, 22, 19, 15],
  "has_subcategories": true,
  "has_questions": true,
  "question_count": 121,
  "level": 0,
  "ancestors": [],
  "url": "/category/3"
}
```

### Sample Question

```json
{
  "reference": 329,
  "title": "Is Masturbation Haram in Islam?",
  "question": "<p>I have a question which I am shy to ask...</p>",
  "answer": "<div id=\"toc_container\">...</div>",
  "categories": [245],
  "primary_category": 245,
  "tags": ["Forbidden Matters"],
  "views": 2980371,
  "date": "1997-11-24T00:00:00.000Z",
  "content_langs": ["en", "ar", "fr", "hi", "ur"]
}
```

### Metadata

```json
{
  "version": "3.0.0",
  "method": "dump-file-extraction",
  "language": "en",
  "total_categories": 268,
  "total_questions": 15622,
  "generated_at": "2025-11-09T16:30:47.031107Z"
}
```

---

## Configuration

### Change Language

Edit `download_dumps.py`:

```python
LANG = "en"  # Change to: ar, fr, ur, id, es, etc.
```

Available languages: ar (Arabic), en (English), ur (Urdu), fr (French), id (Indonesian), es (Spanish), tr (Turkish), bn (Bengali), ru (Russian), hi (Hindi), fa (Persian), pt (Portuguese), zh (Chinese), ge (Georgian), ug (Uyghur), tg (Tajik), ta (Tamil)

### Change Output Directory

Edit `download_dumps.py`:

```python
OUTPUT_DIR = Path(__file__).parent.parent.parent / "public" / "data"
```

### CDN Base URL

The script uses:
```python
CDN_BASE_URL = "https://files.zadapps.info/m.islamqa.info"
```

---

## Advanced Usage

### Verify Output

```bash
# Check files exist
ls -lh public/data/

# View metadata
cat public/data/metadata.json | jq .

# Count records
jq 'length' public/data/categories.json  # Should be 268
jq 'length' public/data/questions.json   # Should be 15,622

# View sample category
jq '.[0]' public/data/categories.json

# View sample question
jq '.[0]' public/data/questions.json
```

### Incremental Updates (Future)

The manifest also includes delta dumps for incremental updates:

```bash
# Delta files track created/updated/deleted records
# Format: dumps/deltas/2025-11-03-210000/en/data.ndjson.gz
# Size: Usually < 1 KB (very few daily changes)
```

To implement delta updates, modify the script to:
1. Track `lastSerial` from previous extraction
2. Download only delta files since last serial
3. Apply changes (created/updated/deleted) to existing data

### Alternative: Using curl

If you prefer shell scripts:

```bash
# Download manifest
curl -o manifest.json \
  "https://files.zadapps.info/m.islamqa.info/dumps/manifest.json"

# Extract dump URL (requires jq)
DUMP_URL=$(jq -r '.dumps[] | select(.lang=="en") | .folder + "/" + .file.name' manifest.json | head -1)

# Download dump
curl -o data.ndjson.gz \
  "https://files.zadapps.info/m.islamqa.info/$DUMP_URL"

# Decompress (if needed)
gunzip data.ndjson.gz

# Parse with jq or Python
```

---

## Troubleshooting

### Issue: Download fails

**Solutions:**
```bash
# Check internet connection
ping files.zadapps.info

# Check URL manually
curl -I "https://files.zadapps.info/m.islamqa.info/dumps/manifest.json"

# Increase timeout in script
response = self.session.get(url, timeout=120)
```

### Issue: Parsing errors

**Check:**
```bash
# Verify NDJSON format
head -1 data.ndjson | jq .

# Count lines
wc -l data.ndjson
```

**Solutions:**
- Re-download dump file
- Check for corrupted download
- Verify JSON syntax

### Issue: Out of memory

**Solutions:**
```bash
# Process in chunks (modify script to stream parse)
# Or use a machine with more RAM
# Minimum: 1 GB free memory
```

### Issue: Old data

**Check manifest for latest dump:**
```bash
curl -s "https://files.zadapps.info/m.islamqa.info/dumps/manifest.json" | jq '.dumps[] | select(.lang=="en") | {folder, date}'
```

**Note:** Dumps are updated daily/weekly by IslamQA

---

## Performance

### Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| Download manifest | < 1s | Tiny JSON file |
| Download dump | 10-15s | 28.7 MB compressed |
| Parse NDJSON | 5s | 17,911 records |
| Transform data | 5s | Build relationships |
| Save output | 5s | Write JSON files |
| **Total** | **~30s** | **100x faster than API!** |

### Resource Usage

- **Network**: 28.7 MB download
- **Disk**: 100 MB temporary, 90 MB final
- **Memory**: ~200 MB peak
- **CPU**: Minimal (mostly I/O bound)

### Comparison

| Method | Time | API Calls | Complexity | Reliability |
|--------|------|-----------|------------|-------------|
| Old (API) | 40-50 min | 1000s | High | Medium |
| New (Dump) | 30 sec | 2 | Low ✅ | High ✅ |
| **Speedup** | **100x** | **500x fewer** | **Much simpler** | **Much better** |

---

## Summary

### Quick Reference

```bash
# One command to get all data
python3 download_dumps.py

# Verify output
ls -lh public/data/
cat public/data/metadata.json

# Check counts
jq 'length' public/data/categories.json   # 268
jq 'length' public/data/questions.json    # 15,622
```

### What You Get

✅ 268 categories with full hierarchy
✅ 15,622 Q&As with complete HTML content
✅ Perfect format for your app
✅ 100x faster than API method
✅ Simpler, more reliable code

### Next Steps

1. **Run extraction**: `python3 download_dumps.py`
2. **Verify output**: Check `public/data/` directory
3. **Integrate with app**: Use the JSON files in your Cordova app

---

**Created**: November 9, 2025
**Version**: 3.0.0
**Method**: Dump File Extraction
**Status**: ✅ Production Ready
**Performance**: ⚡ 100x faster than API method!

---

**Simple, fast, and reliable!** 🚀
