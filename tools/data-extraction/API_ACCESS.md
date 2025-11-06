# 🔐 IslamQA API Access & Troubleshooting

## Current Issue: 403 Forbidden

The IslamQA API is currently returning `403 Forbidden` errors:

```
ERROR: 403 Client Error: Forbidden for url:
https://archive-1446.islamqa.info/api/en/categories/topics
```

---

## Possible Causes

1. **Authentication Required** - API may require authentication headers or API key
2. **Rate Limiting** - IP address may be rate-limited or blocked
3. **Access Restrictions** - API may be restricted to specific domains/IPs
4. **Regional Restrictions** - API may be geo-blocked in certain regions
5. **API Changes** - API endpoint may have moved or been deprecated

---

## Solutions & Workarounds

### Solution 1: Use Existing Data ✅ (Current Best Option)

You already have complete data in `public/data/*.js`:
- 269 categories
- 8000+ questions
- Full answers

**This data is already in the correct format!** ✅

The pipeline is ready for when you get fresh data from the API.

### Solution 2: Contact IslamQA for API Access

Reach out to IslamQA to request:
- API documentation
- Authentication credentials
- Rate limit information
- Proper access permissions

**Contact**: Check IslamQA.info website for contact information

### Solution 3: Try Different Request Headers

Modify `extract_fresh.py` line 31-35 to try different headers:

```python
self.session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Referer': 'https://islamqa.info/',  # Try adding this
    'Origin': 'https://islamqa.info/'     # And this
})
```

### Solution 4: Use VPN or Proxy

If the issue is regional:
```bash
# Try from different location
# Use VPN service or proxy
```

### Solution 5: Wait and Retry

Sometimes 403 errors are temporary:
```bash
# Try again after a few hours
python3 extract_fresh.py --range 1 100 --output raw/ --delay 5.0
```

---

## Testing the Pipeline Without API

You can still test the transformation and bundling stages!

### Option A: Use Existing Data

```bash
cd tools/data-extraction

# Copy existing data to raw/ in API format (one-time setup)
# You'll need to manually convert the existing .js files to API format
# OR use the existing data as-is (it's already correct!)

# Skip extraction, just transform
./run-pipeline.sh --quick
```

### Option B: Create Mock API Data

```bash
# Create sample API format data for testing
cat > raw/categories.json << 'EOF'
[
  {
    "reference": 218,
    "title": "Basic Tenets of Faith",
    "description": "",
    "parent_reference": null,
    "children_references": [219, 230],
    "has_subcategories": true,
    "has_questions": false,
    "question_count": 0,
    "level": 0,
    "url": "cat/218"
  }
]
EOF

cat > raw/questions.json << 'EOF'
[
  {
    "reference": 115156,
    "title": "Test Question",
    "question": "<p>Test question text</p>",
    "answer": "<p>Test answer text</p>",
    "category_reference": 218,
    "category_path": [218],
    "tags": ["Faith"],
    "views": 100,
    "date": "2025-11-06",
    "bookmarked": false,
    "last_read": null
  }
]
EOF

# Now run transformation and bundling
node transform.cjs --input raw/ --output transformed/
node bundle.cjs --input transformed/ --output ../../public/data/
```

---

## Verification

### Check Current Data Format

```bash
cd tools/data-extraction
node verify-format.cjs
```

Expected output:
```
✅ All formats are correct!
Your transformation script will produce the exact format your app expects.
```

### Test Transformation Script

```bash
# Create mock data (see Option B above)
# Then transform it
node transform.cjs --input raw/ --output transformed/
```

---

## Error Handling in Pipeline

The pipeline already handles API errors gracefully:

**extract_fresh.py**:
- ✅ Line 145-197: Handles missing questions (404)
- ✅ Line 48-50: Catches request exceptions
- ✅ Line 196-197: Tracks not-found count
- ✅ Continues processing even if some questions fail

**transform.cjs**:
- ✅ Handles empty fields with defaults
- ✅ Uses `.get()` for optional fields
- ✅ Strips HTML safely
- ✅ Provides fallback values

**bundle.cjs**:
- ✅ Validates data before bundling
- ✅ Checks required fields
- ✅ Verifies data integrity
- ✅ Reports errors clearly

---

## Recommended Next Steps

1. **✅ Your current data is ready to use** - No action needed!

2. **When you need fresh data**:
   - Contact IslamQA for API access
   - Or try the workarounds above
   - Or use web scraping as alternative (with permission)

3. **Continue with app development**:
   - Your existing data works perfectly
   - The pipeline is ready for future updates
   - Focus on app features for now

---

## Alternative: Web Scraping

If API access is not available, you could scrape the website:

**⚠️ Important**:
- Get permission from IslamQA first
- Respect robots.txt
- Use respectful delays
- Only for personal/non-commercial use

```python
# Example approach (requires permission!)
# scrape from https://islamqa.info/en/answers/...
# Parse HTML instead of API JSON
# Convert to same format as API
```

---

## Summary

### ✅ What Works Now
- Transformation script (`transform.cjs`)
- Bundling script (`bundle.cjs`)
- Format verification (`verify-format.cjs`)
- Your existing data (8000+ Q&As in correct format)

### ❌ What's Blocked
- Fresh API extraction (403 Forbidden)

### 🎯 What To Do
1. Use existing data (it's perfect!)
2. Contact IslamQA for API access when needed
3. Continue app development
4. Pipeline is ready when API becomes available

---

**Status**: Pipeline is fully functional, just waiting for API access.
**Your Data**: Already in perfect format, ready to use!
**Next**: Continue building your app! ✅

**Created**: November 6, 2025
