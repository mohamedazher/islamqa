# 🎯 Quiz Generation System - Complete Guide

**Version**: 2.0 (V2.0-only, no legacy code)
**Status**: ✅ Production Ready
**Last Updated**: November 10, 2025
**Coverage**: 150 enhanced questions (1.0% of 15,615)

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Detailed Workflow](#detailed-workflow)
5. [Data Formats](#data-formats)
6. [CLI Commands](#cli-commands)
7. [App Integration](#app-integration)
8. [Scaling & Progress](#scaling--progress)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## System Overview

### What Is It?

A complete **LLM-powered quiz generation system** that transforms long-form Islamic Q&A content into professional multiple-choice quiz questions using Claude AI.

**Key Points**:
- ✅ Pre-generated (not runtime)
- ✅ LLM-only (Claude AI, no fallbacks)
- ✅ Tracked & verifiable
- ✅ Scalable batch processing
- ✅ Automatically imported into app
- ✅ 15,615 source questions available

### Why This Approach?

**Problems with on-the-fly generation**:
- ❌ Inconsistent quality (no review)
- ❌ Complex parsing logic (long-form Q&A)
- ❌ Performance overhead (slow at runtime)
- ❌ Different questions per user (no consistency)
- ❌ Hard to fix specific questions

**Benefits of pre-generation**:
- ✅ High quality (LLM-reviewed, professional)
- ✅ Consistent (same quiz for all users)
- ✅ Fast (instant quiz loading)
- ✅ Trackable (progress visibility)
- ✅ Maintainable (easy to update)
- ✅ Scalable (process in offline batches)

---

## Architecture

### System Flow

```
Source Database
15,615 Q&A Questions
      ↓
Selection Script
Pick unprocessed questions
      ↓
Batch Files
Raw questions + answers
      ↓
Claude AI
Generate 4-option quizzes
      ↓
Validation
Verify JSON & content
      ↓
Metadata Tracking
Update processed list
      ↓
Enhancement Data
JSON file with all quizzes
      ↓
App Data Import
Load into Dexie database
      ↓
Quiz Service
Serve in app
      ↓
User Experience
Professional quizzes!
```

### Key Components

#### 1. **Selection Script** (`scripts/generate-quiz.js --mode=select`)
- Picks unprocessed questions from database
- Creates batch JSON files
- Tracks which questions selected
- Prevents duplicates via metadata

#### 2. **LLM Generation** (Claude AI + `generate-quiz-prompt.md`)
- Reads 50-100 source Q&As
- Generates 4-option quizzes
- Creates plausible wrong answers
- Writes explanations
- Takes 30-45 minutes per batch

#### 3. **Validation** (`scripts/generate-quiz.js --mode=validate`)
- Checks JSON format
- Verifies 4 options per question
- Confirms exactly 1 correct answer
- Validates difficulty levels
- Checks explanation length
- **Must pass before merge**

#### 4. **Metadata Merge** (`scripts/generate-quiz.js --mode=merge`)
- Tracks processed references
- Updates `enhancement-metadata.json`
- Prevents re-processing
- Records statistics

#### 5. **App Integration** (Automatic)
- DataLoaderService loads `enhancements.json`
- Dexie database stores quiz_enhancements table
- QuizService retrieves on quiz start
- Users get enhanced quizzes immediately

---

## Quick Start

### One-Time Setup

```bash
# 1. Install dependencies (if not done)
cd /home/user/islamqa
yarn install

# 2. Navigate to scripts
cd quiz-generation/scripts
```

### Process a Batch (1-2 hours)

```bash
# STEP 1: Select questions (2 min)
node generate-quiz.js --mode=select --count=100
# Creates: ../batches/batch-TIMESTAMP.json

# STEP 2: Generate with Claude (30-45 min)
# → Open batch-TIMESTAMP.json
# → Go to Claude.ai and start new chat
# → Copy entire JSON contents
# → Paste generate-quiz-prompt.md (from quiz-generation/ folder)
# → Paste batch JSON
# → Send message
# → Copy output from Claude
# → Create file: ../batches/batch-TIMESTAMP-output.json
# → Paste output

# STEP 3: Validate (1 min)
node generate-quiz.js --mode=validate --input=batch-TIMESTAMP-output.json
# Review results - MUST show "PASSED"

# STEP 4: Merge (1 min)
node generate-quiz.js --mode=merge --input=batch-TIMESTAMP-output.json
# Updates: enhancement-metadata.json

# STEP 5: Update app data (1 min)
node -e "
const fs = require('fs');
const merged = JSON.parse(fs.readFileSync('../batches/batch-TIMESTAMP-output-merged.json', 'utf8'));
const enhancements = merged.generatedEnhancements;
fs.writeFileSync('../../public/data/enhancements.json', JSON.stringify(enhancements, null, 2));
console.log('✅ Updated enhancements.json with ' + enhancements.length + ' enhancements');
"

# STEP 6: Commit (2 min)
cd /home/user/islamqa
git add public/data/enhancements.json
git commit -m "Add [N] quiz enhancements from new batch"
git push -u origin claude/quiz-generation-batches-011CUywVVrpLpZCQhb3r8Qej
```

### Test in App

```bash
# 1. Clear browser IndexedDB
# → Open DevTools (F12)
# → Application tab
# → IndexedDB
# → Delete "IslamQA"
# → Refresh page

# 2. Watch import process
# → Should show: "🎯 Loaded [N] quiz enhancements"

# 3. Go to Quiz page
# → Start Daily Quiz
# → Verify questions have 4 options
# → Check difficulty levels
# → Review explanations
```

---

## Detailed Workflow

### Phase 1: Selection (2 minutes)

**Command**:
```bash
node generate-quiz.js --mode=select --count=100
```

**What happens**:
1. Loads `questions.json` (15,615 questions)
2. Checks `enhancement-metadata.json` for already-processed
3. Selects 100 random unprocessed questions
4. Creates `batches/batch-TIMESTAMP.json`
5. Displays confirmation with question references

**Output example**:
```
✅ Batch created: batch-1762766428921.json
📊 Selected: 100 questions
📁 Location: batches/batch-1762766428921.json
🔍 References: [8512, 22762, 97786, ...]
```

**Output file structure**:
```json
{
  "batchInfo": {
    "createdAt": "2025-11-10T12:00:00Z",
    "totalQuestions": 100,
    "format": "v2.0"
  },
  "questions": [
    {
      "reference": 8512,
      "title": "Can I gift money to charity in my mother's name after her death?",
      "question": "<p>Question HTML...</p>",
      "answer": "<div>Answer HTML...</div>",
      "primary_category": 245,
      "categories": [245, 250]
    }
  ]
}
```

### Phase 2: LLM Generation (30-45 minutes)

**Manual process** (uses Claude AI directly):

1. Open `batches/batch-TIMESTAMP.json` in text editor
2. Go to [Claude.ai](https://claude.ai)
3. Start new conversation
4. Provide context:
   - Paste contents of `generate-quiz-prompt.md` (instructions for Claude)
   - Paste your batch JSON
   - Ask Claude to generate quizzes
5. Claude processes 30-45 minutes
6. Copy Claude's response
7. Save to `batches/batch-TIMESTAMP-output.json`

**Expected Claude output format**:
```json
{
  "generatedEnhancements": [
    {
      "reference": 8512,
      "questionText": "Can you gift money to charity in someone else's name?",
      "type": "multiple-choice",
      "difficulty": "medium",
      "options": [
        {"id": "a", "text": "Yes, always permissible", "isCorrect": true},
        {"id": "b", "text": "No, never permissible", "isCorrect": false},
        {"id": "c", "text": "Only if directly instructed", "isCorrect": false},
        {"id": "d", "text": "Requires specific intention", "isCorrect": false}
      ],
      "explanation": "Islamic law permits making gifts on behalf of others...",
      "tags": ["Charity", "Islamic Rulings", "Wealth"],
      "source": "IslamQA reference 8512"
    }
  ]
}
```

**Why Claude?**:
- Understands long-form Islamic Q&A
- Creates plausible, scholarly wrong answers
- Assigns appropriate difficulty
- Writes concise explanations
- Fast and cost-effective
- Human-reviewable output

### Phase 3: Validation (1-2 minutes)

**Command**:
```bash
node generate-quiz.js --mode=validate --input=batch-TIMESTAMP-output.json
```

**What happens**:
1. Checks JSON is valid
2. Verifies each enhancement has:
   - `reference` (matches source question)
   - `questionText` (clear question)
   - `options` (exactly 4 options a-d)
   - Exactly 1 `isCorrect: true`
   - `explanation` (2+ sentences)
   - `difficulty` (easy/medium/hard)
3. Reports results with pass/fail
4. Shows any errors to fix

**Output example** (pass):
```
✅ Validation PASSED
📊 Total: 100 enhancements
✅ Format: Valid
✅ References: All unique
✅ Options: All have 4
✅ Explanations: All substantive
✅ Difficulties: Valid
🎯 Status: READY TO MERGE
```

**Output example** (fail):
```
❌ Validation FAILED
❌ Reference 8512: Missing explanation
⚠️  Reference 22762: Options only 3 (need 4)
⚠️  Reference 97786: No isCorrect flag

Fix these issues and retry.
```

**Must fix before proceeding to Phase 4!**

### Phase 4: Metadata Merge (1 minute)

**Command**:
```bash
node generate-quiz.js --mode=merge --input=batch-TIMESTAMP-output.json
```

**What happens**:
1. Takes validated output
2. Adds to `enhancement-metadata.json`
3. Tracks processed question references
4. Prevents duplicate processing
5. Updates statistics
6. Creates `batch-TIMESTAMP-output-merged.json`

**Output example**:
```
✅ Merge complete
📊 Added: 100 enhancements
✅ Duplicates prevented: 0
📈 Total enhanced: 150 (was 50)
📊 Coverage: 1.0% (150/15615)
🎯 Success Rate: 100%
```

**Updated metadata structure**:
```json
{
  "version": "2.0.0",
  "processedReferences": [8512, 22762, 97786, ...150 total],
  "stats": {
    "totalEnhanced": 150,
    "successful": 150,
    "failed": 0
  }
}
```

### Phase 5: App Data Update (1 minute)

**Extract enhancements for app**:
```bash
node -e "
const fs = require('fs');
const merged = JSON.parse(fs.readFileSync('../batches/batch-TIMESTAMP-output-merged.json', 'utf8'));
const enhancements = merged.generatedEnhancements;
fs.writeFileSync('../../public/data/enhancements.json', JSON.stringify(enhancements, null, 2));
console.log('✅ Updated enhancements.json with ' + enhancements.length + ' enhancements');
"
```

**What happens**:
1. Extracts `generatedEnhancements` array
2. Saves to `public/data/enhancements.json`
3. File is served with app data
4. Will be auto-imported on next app load

### Phase 6: Commit & Push

**Commands**:
```bash
git add public/data/enhancements.json
git commit -m "Add 100 quiz enhancements from batch-TIMESTAMP"
git push -u origin claude/quiz-generation-batches-011CUywVVrpLpZCQhb3r8Qej
```

### Phase 7: Automatic App Integration

**When user opens app**:
1. DataLoaderService checks if data imported
2. If not, runs import process:
   - Load categories.json (268 categories) → 40%
   - Load questions.json (15,615 questions) → 80%
   - Load enhancements.json (150 quizzes) → 95%
   - Mark complete → 100%
3. Dexie stores in `quiz_enhancements` table
4. QuizService retrieves on quiz start
5. User gets professional quizzes immediately! ✨

---

## Data Formats

### Source Question Format

**From `questions.json`**:
```json
{
  "reference": 8512,
  "title": "Can I gift money to charity in my mother's name after her death?",
  "question": "<p>Islamic ruling on gifting money...</p>",
  "answer": "<div>According to Islamic law...</div>",
  "primary_category": 245,
  "categories": [245, 250],
  "tags": ["Charity", "Inheritance"],
  "views": 5200,
  "date": "2010-03-15T00:00:00Z"
}
```

**Key fields**:
- `reference`: Semantic ID (unique identifier)
- `title`: Short question title
- `question`: Full question as HTML
- `answer`: Complete answer/ruling (embedded)
- `primary_category`: Main category reference
- `categories`: All applicable categories

### Generated Quiz Format

**In `enhancements.json`**:
```json
[
  {
    "reference": 8512,
    "questionText": "Can you gift money to charity in someone else's name?",
    "type": "multiple-choice",
    "difficulty": "medium",
    "options": [
      {
        "id": "a",
        "text": "Yes, always permissible",
        "isCorrect": true
      },
      {
        "id": "b",
        "text": "No, never permissible",
        "isCorrect": false
      },
      {
        "id": "c",
        "text": "Only if directly instructed",
        "isCorrect": false
      },
      {
        "id": "d",
        "text": "Requires specific intention",
        "isCorrect": false
      }
    ],
    "explanation": "Islamic law permits making gifts on behalf of others with proper intention...",
    "tags": ["Charity", "Islamic Rulings", "Wealth"],
    "source": "IslamQA reference 8512"
  }
]
```

**Key fields**:
- `reference`: Links to source question
- `questionText`: Clear, concise question
- `difficulty`: easy/medium/hard
- `options`: Array of 4 options (exactly 1 correct)
- `explanation`: 2-3 sentence summary
- `tags`: Islamic topic tags
- `source`: Attribution

### Database Storage Format

**In Dexie `quiz_enhancements` table**:
```javascript
{
  reference: 8512,        // Primary key (semantic ID)
  questionText: "...",
  type: "multiple-choice",
  difficulty: "medium",
  options: [...4 objects...],
  explanation: "...",
  tags: [...],
  source: "...",
  generatedDate: 1731194400000
}
```

---

## CLI Commands

### Mode: Select

**Purpose**: Pick unprocessed questions

```bash
node generate-quiz.js --mode=select --count=50
```

**Parameters**:
- `--mode=select` (required)
- `--count=N` (default: 50, range: 1-1000)

**Output**: `batches/batch-TIMESTAMP.json`

**Example**:
```bash
node generate-quiz.js --mode=select --count=100
# Creates: batches/batch-1762766428921.json
# Selected: 100 unprocessed questions
# Ready for Claude
```

### Mode: Validate

**Purpose**: Check generated output format

```bash
node generate-quiz.js --mode=validate --input=batch-TIMESTAMP-output.json
```

**Parameters**:
- `--mode=validate` (required)
- `--input=FILENAME` (required)

**Checks**:
- Valid JSON
- Each enhancement has all required fields
- Exactly 4 options (a, b, c, d)
- Exactly 1 correct answer
- Valid difficulty (easy/medium/hard)
- Explanations are substantive (2+ sentences)
- References are unique

**Output**: Pass/Fail with details

**Example**:
```bash
node generate-quiz.js --mode=validate --input=batch-1762766428921-output.json
# ✅ PASSED
# 100 enhancements validated
# Ready to merge
```

### Mode: Merge

**Purpose**: Track processed questions and merge metadata

```bash
node generate-quiz.js --mode=merge --input=batch-TIMESTAMP-output.json
```

**Parameters**:
- `--mode=merge` (required)
- `--input=FILENAME` (required)

**Actions**:
- Updates `enhancement-metadata.json`
- Adds processed references
- Prevents duplicates
- Records statistics
- Creates `batch-TIMESTAMP-output-merged.json`

**Example**:
```bash
node generate-quiz.js --mode=merge --input=batch-1762766428921-output.json
# ✅ Merged 100 enhancements
# Total enhanced: 150
# Duplicates prevented: 0
```

### Mode: Stats

**Purpose**: Show current progress

```bash
node generate-quiz.js --mode=stats
```

**Parameters**: None

**Output**: Current statistics

**Example**:
```bash
node generate-quiz.js --mode=stats
# 📊 Quiz Enhancement Statistics
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Total Questions:    15,615
# Enhanced:           150 (1.0%)
# Remaining:          15,465 (99.0%)
# Success Rate:       100%
```

---

## App Integration

### Automatic Import on App Load

**When user opens app first time**:

1. **Check imported** (ImportView checks `isDataImported()`)
2. **If not imported**, DataLoaderService runs:
   ```
   Step 1: Load categories.json     → 40%
   Step 2: Load questions.json      → 80%
   Step 3: Load enhancements.json   → 95%
   Step 4: Mark complete            → 100%
   ```
3. **Dexie stores**:
   - `categories` table (268 records)
   - `questions` table (15,615 records)
   - `quiz_enhancements` table (150 records)
4. **LocalStorage flag**: `import_status: "completed"`
5. **App ready**: Quiz page loads enhanced questions

### Runtime Quiz Loading

**When user starts Quiz**:

```javascript
// QuizService.generateQuiz()
const quiz = {
  questions: []
}

for (const question of selectedQuestions) {
  // Check if enhanced
  const enhancement = await db.getQuizEnhancement(question.reference)

  if (enhancement) {
    // Use enhanced version
    quiz.questions.push({
      reference: question.reference,
      questionText: enhancement.questionText,
      options: enhancement.options,        // 4 options
      explanation: enhancement.explanation,
      difficulty: enhancement.difficulty
    })
  }
  // else: skip (only enhanced questions in quizzes)
}

return quiz
```

**Result**: User gets professional multiple-choice quizzes immediately

### Adding More Batches

**Process**:
1. Run Phase 1-7 (Selection through Commit)
2. `enhancements.json` is automatically updated
3. On next app load, new enhancements import
4. Users see more quizzes

**Example with 3 batches**:
- Batch 1: 50 questions → 50 total
- Batch 2: 100 questions → 150 total  ← Current state
- Batch 3: 100 questions → 250 total  ← Next batch

---

## Scaling & Progress

### Current State

```
Total Questions:  15,615
Enhanced:         150 (1.0%)
Coverage:         Low but growing
Processing Speed: 100 questions/batch (1-2 hours)
Quality:          100% validation pass rate
```

### 2-Week Plan

| Week | Target | Status | Actions |
|------|--------|--------|---------|
| 1 | 150 | ✅ Done | Initial batches processed |
| 2 | 350 | ⏳ Next | Process 2-3 more batches (200 questions) |
| 3 | 500 | 📋 Planned | Target 5%+ coverage |

### Weekly Workflow

```
Monday:    Select & generate 1-2 batches (100-200 questions)
Wednesday: Validate and merge
Thursday:  Update app data and commit
Friday:    Test in app, gather feedback
```

### Target Milestones

```
150 (1.0%) ✅ Done
250 (1.6%)    2 weeks
500 (3.2%)    4 weeks
1000 (6.4%)   8 weeks
2000 (12.8%)  16 weeks
```

---

## Troubleshooting

### Selection Issues

**Problem**: "No unprocessed questions available"
- **Cause**: All questions already processed (unlikely)
- **Solution**: Check `enhancement-metadata.json` processedReferences

**Problem**: Selection script crashes
- **Cause**: File permission or corruption
- **Solution**: Verify `questions.json` exists and is valid JSON

### Generation Issues

**Problem**: Claude gives wrong output format
- **Cause**: Prompt not clear or Claude misunderstood
- **Solution**:
  1. Review `generate-quiz-prompt.md`
  2. Make sure you copy entire prompt + batch JSON
  3. Check Claude's output matches expected format

**Problem**: Claude output incomplete
- **Cause**: Context limit or connection dropped
- **Solution**:
  1. Try batch with fewer questions (50 instead of 100)
  2. Copy partial output that's complete
  3. Use validation to see what's missing

### Validation Issues

**Problem**: Validation fails with reference errors
- **Cause**: References don't match source questions
- **Solution**: Check references in Claude's output against original batch

**Problem**: "Only 3 options" error
- **Cause**: Claude missed one option
- **Solution**: Fix manually in output JSON or regenerate

**Problem**: "Missing explanation" error
- **Cause**: Claude didn't generate explanation
- **Solution**: Add manually or ask Claude to regenerate that question

### Merge Issues

**Problem**: Merge fails with "duplicate references"
- **Cause**: These questions already processed
- **Solution**: Select new questions with --mode=select

**Problem**: Enhancement-metadata.json corrupted
- **Cause**: Unexpected file format
- **Solution**: Restore from last git commit

### App Import Issues

**Problem**: "Enhancements not loading"
- **Cause**: File not in public/data/enhancements.json
- **Solution**: Run Phase 5 (update app data)

**Problem**: "Quiz still empty"
- **Cause**: Enhancements.json exists but IndexedDB not refreshed
- **Solution**: Clear IndexedDB and reload (DevTools → IndexedDB → Delete IslamQA)

---

## Next Steps

### Immediate (This Week)
1. ✅ Complete system implemented
2. ✅ 150 questions enhanced
3. ✅ Automatic app integration working
4. ⏳ Test with fresh app load
5. ⏳ Process 1-2 more batches

### Short-term (Weeks 2-3)
- [ ] Process 200+ more questions (250 total)
- [ ] Cover 5+ main categories
- [ ] Test different quiz modes
- [ ] Gather user feedback

### Medium-term (Weeks 4-6)
- [ ] Reach 500+ enhanced questions (3%+ coverage)
- [ ] All major categories covered
- [ ] Performance optimization if needed
- [ ] Automated batch processing script

### Long-term (Months 2+)
- [ ] Target 1000+ enhanced (6%+)
- [ ] Balanced category distribution
- [ ] Maintenance and refinement
- [ ] Continuous user feedback loop

---

## Reference Files

### Documentation
- `QUIZ_GENERATION_GUIDE.md` (this file) - Complete guide
- `generate-quiz-prompt.md` - Claude AI prompt template
- `QUIZ_ENHANCEMENTS_INTEGRATION.md` - App integration details

### Scripts
- `scripts/generate-quiz.js` - Main CLI tool
- `scripts/init-metadata.js` - Metadata management
- `scripts/transform-to-v2.js` - Format conversion
- `scripts/process-batch.js` - Full automation

### Data Files
- `questions.json` - 15,615 source questions
- `enhancements.json` - Generated quizzes (in public/data/)
- `enhancement-metadata.json` - Processing metadata
- `batches/batch-TIMESTAMP.json` - Selected questions
- `batches/batch-TIMESTAMP-output.json` - Claude output

### Related App Files
- `src/services/dataLoader.js` - Data import pipeline
- `src/services/dexieDatabase.js` - Database schema & methods
- `src/services/quizService.js` - Quiz generation at runtime

---

## Support

### Getting Help

1. **Quick issues**: Check Troubleshooting section above
2. **Script errors**: Run with verbose output and check error messages
3. **Data issues**: Verify JSON format matches expected structure
4. **App issues**: Check browser console for errors

### Reporting Problems

Include:
- Exact command used
- Error message (full text)
- What step it failed on
- Input file name (if applicable)

---

## Summary

✅ **V2.0 system complete and production ready**
✅ **150 questions enhanced (1% coverage)**
✅ **Automatic app integration working**
✅ **Clear scaling path to 1000+**
✅ **Zero legacy code**

The quiz generation system is ready for ongoing batch processing and scaling to comprehensive coverage.

**Next action**: Process more batches to increase quiz coverage across categories.

