# Quiz Generation Scripts - Usage Guide

## ✅ **Scripts You Should Use**

### 1. **`generate-quiz.js`** - Main CLI Tool
**Status**: ✅ **ACTIVE** - Primary tool for quiz generation workflow

**What it does**:
- Selects unprocessed questions for enhancement
- Validates Claude's output
- Merges enhancements into metadata
- Shows statistics

**Usage**:
```bash
# Select 100 questions for enhancement
node generate-quiz.js --mode=select --count=100

# Validate Claude's output
node generate-quiz.js --mode=validate --input=batch-TIMESTAMP-output.json

# Merge validated output
node generate-quiz.js --mode=merge --input=batch-TIMESTAMP-output.json

# Show statistics
node generate-quiz.js --mode=stats
```

**When to use**: For generating NEW quiz enhancements in batches

---

### 2. **`convert-quiz-questions.js`** - Format Converter
**Status**: ✅ **ACTIVE** - Just created to fix quality issue

**What it does**:
- Converts quiz-questions.json (445 high-quality) to enhancements.json format
- Transforms `sourceQuestionId` → `reference`
- Backs up existing enhancements.json

**Usage**:
```bash
node convert-quiz-questions.js
```

**When to use**:
- ✅ Already run once to upgrade from 100 → 445 questions
- Only run again if quiz-questions.json is updated with new high-quality quizzes

---

## ⚠️ **Scripts That May Be Outdated**

### 3. **`generate-quiz-v2.js`** - Alternative CLI
**Status**: ⚠️ **UNCLEAR** - May be duplicate/older version

**Recommendation**: Stick with `generate-quiz.js` (non-v2) as it has more modes

---

### 4. **`process-batch.js`** - Batch Processor
**Status**: ⚠️ **UNCLEAR** - May combine multiple steps

**Recommendation**: Use `generate-quiz.js` with explicit modes instead for clarity

---

### 5. **`init-metadata.js`** - Metadata Initializer
**Status**: ℹ️ **ONE-TIME USE**

**What it does**: Initializes `enhancement-metadata.json` if missing

**When to use**: Only if metadata file is corrupted/deleted

---

### 6. **`transform-to-v2.js`** - Format Transformer
**Status**: ℹ️ **LEGACY**

**What it does**: Converts old format to v2 format

**When to use**: Only if you have quiz data in old format

---

## 📁 **Key Files Explained**

### **`quiz-questions.json`** (445 questions) ✅ HIGH QUALITY
- **Location**: `quiz-generation/quiz-questions.json`
- **Format**: Claude AI generated with good prompt
- **Quality**: Clear questions, detailed explanations
- **Status**: Source of truth for high-quality quizzes
- **Usage**: Converted to enhancements.json via `convert-quiz-questions.js`

### **`enhancements.json`** (now 445 questions) ✅ USED BY APP
- **Location**: `public/data/enhancements.json`
- **Format**: App-compatible format with `reference` field
- **Quality**: Now HIGH (after conversion)
- **Status**: Loaded by dataLoader.js on app startup
- **Usage**: This is what the quiz feature uses

---

## 🎯 **Current State (After Fix)**

✅ **Before Fix**: 100 low-quality questions
✅ **After Fix**: 445 high-quality questions
✅ **Coverage**: 445 / 15,615 = 2.8% (up from 0.6%)
✅ **Quality**: Clear questions with detailed explanations

---

## 🚀 **Recommended Workflow for Adding More Quizzes**

### Option A: Generate New Batches (Best for bulk additions)
```bash
# 1. Select 100 unprocessed questions
cd quiz-generation/scripts
node generate-quiz.js --mode=select --count=100

# 2. Use Claude AI with generate-quiz-prompt.md
#    (Manual: paste batch + prompt to Claude)

# 3. Validate output
node generate-quiz.js --mode=validate --input=batch-TIMESTAMP-output.json

# 4. Merge to quiz-questions.json
node generate-quiz.js --mode=merge --input=batch-TIMESTAMP-output.json

# 5. Convert to enhancements.json
node convert-quiz-questions.js

# 6. Commit and push
git add public/data/enhancements.json quiz-generation/quiz-questions.json
git commit -m "Add 100 new quiz enhancements"
git push
```

### Option B: Update Existing Questions (Best for quality improvements)
1. Edit `quiz-generation/quiz-questions.json` directly
2. Run `node convert-quiz-questions.js` to update enhancements.json
3. Commit and push

---

## 📊 **Progress Tracking**

Check current status:
```bash
node generate-quiz.js --mode=stats
```

Current coverage:
- **Enhanced**: 445 questions
- **Total**: 15,615 questions
- **Coverage**: 2.8%
- **Goal**: ~1,500 questions (10% coverage) for good quiz variety

---

## ❓ **FAQ**

**Q: Why are there two JSON files?**
- `quiz-questions.json` = Source of truth (Claude's raw output)
- `enhancements.json` = App-compatible format (auto-generated from quiz-questions.json)

**Q: Which file should I edit?**
- Edit `quiz-questions.json`, then run `convert-quiz-questions.js`
- Never edit `enhancements.json` directly (it gets overwritten)

**Q: How do I add more quizzes?**
- Use `generate-quiz.js` to create batches → Claude AI → validate → merge
- OR manually add to quiz-questions.json → run converter

**Q: Do I need to restart the app?**
- Yes, refresh browser after updating enhancements.json
- The app auto-imports enhancements on startup

---

## 🔧 **Troubleshooting**

**Problem**: Quiz still shows low-quality questions

**Solution**:
1. Check browser console for "Auto-imported X quiz enhancements"
2. Clear IndexedDB: DevTools → Application → IndexedDB → Delete "IslamQA"
3. Refresh page
4. Should see "Auto-imported 445 quiz enhancements"

**Problem**: Script can't find files

**Solution**:
```bash
# Ensure you're in the right directory
cd /home/user/islamqa/quiz-generation/scripts

# Check files exist
ls -lh ../quiz-questions.json
ls -lh ../../public/data/enhancements.json
```
