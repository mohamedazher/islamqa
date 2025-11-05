# Fresh Data Extraction Guide

## ✅ Test Passed!

The extraction script works perfectly. Here's how to do the full extraction.

---

## 📊 Understanding the Data

Reference IDs are **sparse** - not every number exists. For example:
- ✅ 230367 exists
- ❌ 230368, 230369... don't exist
- ✅ Some other high number might exist

So we need to scan a wide range to find all questions.

---

## 🎯 Recommended Extraction Strategy

### Option 1: Conservative (Recommended for first try)

Try a range that likely contains most questions:

```bash
python3 extract_fresh.py --range 1 250000 --output ../public/data --delay 2.0
```

**Estimated time:** ~140 hours (6 days) with 2-second delays
**Expected to find:** Several thousand questions

**Pros:**
- Respectful to the API (2 sec delay)
- You can monitor progress
- Saves every 50 questions

**Cons:**
- Takes a long time
- Will try many IDs that don't exist

### Option 2: Faster (Use with caution)

Reduce delay to 1 second:

```bash
python3 extract_fresh.py --range 1 250000 --output ../public/data --delay 1.0
```

**Estimated time:** ~70 hours (3 days)

⚠️ **Be careful not to hammer the API!**

### Option 3: Targeted Ranges (Smart approach)

Based on your old data, questions seem clustered. Try multiple smaller ranges:

```bash
# Morning: Try range 1-100k
python3 extract_fresh.py --range 1 100000 --output ../public/data --delay 1.5

# Afternoon: Try range 100k-200k
python3 extract_fresh.py --range 100001 200000 --output ../public/data --delay 1.5

# Evening: Try range 200k-250k
python3 extract_fresh.py --range 200001 250000 --output ../public/data --delay 1.5
```

This lets you:
- ✅ Stop and check progress
- ✅ Adjust strategy based on findings
- ✅ Spread load across different times

---

## 💡 Tips for Long Extraction

### 1. Run in Background with nohup

```bash
nohup python3 extract_fresh.py --range 1 250000 --output ../public/data --delay 2.0 > extraction.log 2>&1 &
```

This lets you:
- Close terminal without stopping
- Check progress anytime: `tail -f extraction.log`
- Get process ID: `jobs` or `ps aux | grep extract_fresh`

### 2. Monitor Progress

```bash
# Watch log in real-time
tail -f extraction.log

# Count questions found so far
cat public/data/questions.json | grep '"reference"' | wc -l

# Check file size
ls -lh public/data/
```

### 3. Resume if Interrupted

The script saves progress every 50 questions, so if it stops, you can continue from where you left off:

```bash
# If you stopped at 150000, continue from there
python3 extract_fresh.py --range 150001 250000 --output ../public/data --delay 2.0
```

---

## 📊 What to Expect

Based on typical IslamQA content:

- **Categories:** 267 (already extracted)
- **Questions:** Likely 5,000 - 15,000 in range 1-250,000
- **Hit rate:** ~5-10% (most IDs don't exist)
- **File size:**
  - categories.json: ~100 KB
  - questions.json: 15-30 MB

---

## ✅ Verifying Success

After extraction completes:

### 1. Check the counts

```bash
cat public/data/metadata.json
```

Should show:
```json
{
  "version": "1.0.0",
  "total_categories": 267,
  "total_questions": 8523,  // or whatever was found
  "categories_with_questions": 145,
  "language": "en"
}
```

### 2. Verify data structure

```bash
# Check categories
cat public/data/categories.json | head -50

# Check questions
cat public/data/questions.json | head -50
```

### 3. Test a sample question

```bash
# Get a reference ID
cat public/data/questions.json | grep '"reference"' | head -1

# Verify it's valid
cat public/data/questions.json | grep -A 10 '"reference": 230367'
```

---

## 🔧 Troubleshooting

### Extraction Stops/Crashes

**Resume from last saved point:**
```bash
# Check last saved reference
cat extraction.log | grep "Found:" | tail -5

# Continue from next number
python3 extract_fresh.py --range 150001 250000 --output ../public/data
```

### Too Many 404 Errors

This is normal! ~90% of IDs don't exist. The script handles this gracefully.

### API Rate Limiting

If you see timeout errors, increase delay:
```bash
python3 extract_fresh.py --range X Y --output ../public/data --delay 3.0
```

### Out of Disk Space

Questions file will be 20-30 MB max. Make sure you have at least 100 MB free.

---

## 🚀 Quick Start Command

**For production extraction (recommended):**

```bash
cd /Users/mohamedazher/Halsimplify/islamqa/scripts

# Run in background
nohup python3 extract_fresh.py \
  --range 1 250000 \
  --output ../public/data \
  --delay 2.0 \
  > extraction.log 2>&1 &

# Get the process ID
echo $!

# Monitor progress
tail -f extraction.log
```

Press `Ctrl+C` to stop watching (extraction continues in background)

---

## 📈 After Extraction

Once extraction completes:

1. ✅ Verify data looks good
2. ✅ Update Vue app to load from `public/data/`
3. ✅ Test app with new data structure
4. ✅ Delete old `www/js/` files
5. ✅ Commit new data to git (or store elsewhere)

---

## 💾 Data Will Be Ready For:

- ✅ IndexedDB import (via your Vue app)
- ✅ Offline-first architecture
- ✅ Fast queries by category
- ✅ Search functionality
- ✅ Bookmark system
- ✅ Future incremental updates

---

## ❓ Questions?

- **How long will it take?** 2-6 days with respectful delays
- **Can I stop it?** Yes! Progress saves every 50 questions
- **Will it get all questions?** It will get everything in the range you specify
- **What if I want more?** Try ranges 250001-500000 after first run completes

---

## 🎉 Next Steps

After extraction:
1. **See data structure:** Check `public/data/` files
2. **Update app:** Modify Vue app to load from JSON
3. **Test thoroughly:** Make sure all features work
4. **Deploy:** Bundle data with app

The data structure is **perfect** for your IndexedDB + Dexie.js setup!
