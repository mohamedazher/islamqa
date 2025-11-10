# 🎯 Quiz Generation Workflow V2.0

**Complete Guide to Generating & Importing Quiz Enhancements**

---

## Quick Start (5 Minutes)

```bash
# Step 1: Select 50 unprocessed questions
cd quiz-generation/scripts
node generate-quiz.js --mode=select --count=50

# Step 2: Generate with Claude
# → Copy batch JSON from output
# → Use generate-quiz-prompt.md with Claude
# → Save output as: batch-TIMESTAMP-output.json

# Step 3: Validate & Merge
node generate-quiz.js --mode=validate --input=batch-TIMESTAMP-output.json
node generate-quiz.js --mode=merge --input=batch-TIMESTAMP-output.json

# Step 4: Import to Database (in browser)
node generate-quiz.js --mode=import --input=batch-TIMESTAMP-output.json-merged.json
# → Copy code from output
# → Paste in browser console (F12)
# → Refresh app and test quizzes

# Step 5: Check Progress
node generate-quiz.js --mode=stats
```

---

## Complete Workflow

### Phase 1: Selection (2 minutes)

**Purpose**: Identify 50 unprocessed questions for enhancement

**Command**:
```bash
node generate-quiz.js --mode=select --count=50
```

**What it does**:
- Loads all 15,000+ questions from database
- Checks `enhancement-metadata.json` for processed questions
- Randomly selects 50 unprocessed questions
- Creates `batch-TIMESTAMP.json` with selected questions

**Output**:
```
📋 Selecting 50 random unprocessed questions...

📚 Total questions: 15615
✅ Already enhanced: 0
⏳ Unprocessed: 15615

✅ Batch created: batch-1762714418160
📊 Selected: 50 questions
📁 Location: /path/to/batches/batch-1762714418160.json

📝 Next steps:
   1. Open generate-quiz-prompt.md
   2. Paste batch JSON into prompt
   3. Send to Claude for generation
   4. Save output as: batch-1762714418160-output.json
   5. Run: node generate-quiz.js --mode=validate --input=batch-1762714418160-output.json
```

**Batch Format** (V2.0 - Semantic Reference IDs):
```json
{
  "batchId": "batch-1762714418160",
  "createdDate": "2025-11-10T...",
  "format": "V2.0 - Semantic Reference IDs",
  "sourceQuestions": [
    {
      "reference": 8512,
      "title": "Giver buying the gift from...",
      "question": "A man gave his brother a car as a gift...",
      "answer": "<p>It is not permissible...</p>",
      "primary_category": 145,
      "tags": ["gifts", "transactions"]
    },
    // ... 49 more
  ]
}
```

---

### Phase 2: Generation (30-45 minutes)

**Purpose**: Use Claude to generate professional multiple-choice options

**Steps**:

1. **Open the Prompt**:
   ```bash
   cat quiz-generation/generate-quiz-prompt.md
   ```

2. **Prepare the Prompt in Claude**:
   - Copy the entire `generate-quiz-prompt.md`
   - Go to Claude.ai or Claude Code
   - Paste the prompt

3. **Add Your Batch**:
   - At the end of the prompt, find: `[PASTE SOURCE QUESTIONS BATCH HERE]`
   - Replace with your batch JSON (from Phase 1)
   - Paste the entire batch file content

4. **Send to Claude**:
   - Send the prompt with batch JSON
   - Wait for generation (~30-45 minutes for 50 questions)

5. **Save Output**:
   - Copy Claude's JSON output
   - Save as: `quiz-generation/batches/batch-TIMESTAMP-output.json`
   - Ensure valid JSON (can validate in VS Code)

**Expected Output Format**:
```json
{
  "generatedEnhancements": [
    {
      "reference": 8512,
      "questionText": "Is it permissible for someone to repurchase a gift they gave?",
      "type": "multiple-choice",
      "difficulty": "medium",
      "options": [
        {
          "id": "a",
          "text": "No, it is forbidden based on hadith",
          "isCorrect": true
        },
        {
          "id": "b",
          "text": "Yes, if the owner agrees",
          "isCorrect": false
        },
        {
          "id": "c",
          "text": "Yes, if purchased at fair price",
          "isCorrect": false
        },
        {
          "id": "d",
          "text": "Only forbidden if within one year",
          "isCorrect": false
        }
      ],
      "explanation": "The Prophet forbade repurchasing gifts, comparing it to a dog returning to its vomit.",
      "tags": ["gifts", "transactions", "haram", "hadith"],
      "source": "IslamQA reference 8512"
    }
    // ... 49 more enhancements
  ],
  "metadata": {
    "batchId": "batch-1762714418160",
    "processedCount": 50,
    "generatedDate": "2025-11-10",
    "notes": "All 50 successfully generated"
  }
}
```

---

### Phase 3: Validation (1-2 minutes)

**Purpose**: Check that Claude's output matches V2.0 format

**Command**:
```bash
node generate-quiz.js --mode=validate --input=batch-1762714418160-output.json
```

**What it checks**:
- ✅ Valid JSON syntax
- ✅ Has `generatedEnhancements` array
- ✅ Each enhancement has `reference` field
- ✅ Each has exactly 4 options (a, b, c, d)
- ✅ Exactly one option marked `isCorrect: true`
- ✅ `difficulty` is easy/medium/hard
- ✅ Has `explanation` (2+ sentences)
- ✅ Has `tags` array (4-6 tags)

**Validation Output**:
```
🔍 Validating batch-1762714418160-output.json...

📊 Validation Results:

   Total: 50
   ✅ Errors: 0
   ⚠️  Warnings: 0

✅ Validation PASSED

📝 Next: node generate-quiz.js --mode=merge --input=batch-1762714418160-output.json
```

**If Errors Found**:
- Edit the JSON file in VS Code
- Fix the issues (missing fields, invalid options, etc.)
- Re-run validation until it passes
- Ask Claude to regenerate if many issues

---

### Phase 4: Merge & Tracking (1 minute)

**Purpose**: Record processed questions in metadata

**Command**:
```bash
node generate-quiz.js --mode=merge --input=batch-1762714418160-output.json
```

**What it does**:
1. Validates enhancements (runs validation first)
2. Loads `enhancement-metadata.json`
3. Adds each reference to `processedReferences[]`
4. Updates `stats.totalEnhanced`
5. Saves updated metadata
6. Creates `-merged.json` file for import

**Merge Output**:
```
🔀 Merging enhancements...

✅ Merge Complete:

   Added: 50
   Duplicates: 0
   Total enhanced: 50

📦 Merged file: batch-1762714418160-output.json-merged.json

📝 Next: node generate-quiz.js --mode=import --input=batch-1762714418160-output.json-merged.json
```

**Metadata Updated** (`enhancement-metadata.json`):
```json
{
  "version": "2.0.0",
  "createdDate": "2025-11-10T...",
  "lastProcessed": "2025-11-10T...",
  "processedReferences": [8512, 2189, 3245, ...],
  "processedBatches": ["batch-1762714418160"],
  "stats": {
    "totalEnhanced": 50,
    "successful": 50,
    "failed": 0
  }
}
```

---

### Phase 5: Import into Database (2 minutes)

**Purpose**: Load enhancements into Dexie IndexedDB

**Command** (generates import script):
```bash
node generate-quiz.js --mode=import --input=batch-1762714418160-output.json-merged.json
```

**Output**:
```
📥 Generating import script...

✅ Ready to import: 50 enhancements

═══════════════════════════════════════════════════════════
BROWSER CONSOLE IMPORT INSTRUCTIONS
═══════════════════════════════════════════════════════════

1. Open the app in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Copy and paste this code:

const enhancements = [
  {...},
  {...},
  // ... 48 more
];
await dexieDb.bulkImportEnhancements(enhancements);
const stats = await dexieDb.getEnhancementStats();
console.log('✅ Imported:', stats);

═══════════════════════════════════════════════════════════

After import:
  • Refresh the app
  • Try starting a quiz
  • Enhanced questions will appear automatically
```

**Steps to Import**:

1. **Open Browser DevTools**:
   - Open app at http://localhost:3000 (or production)
   - Press `F12` to open DevTools
   - Go to "Console" tab

2. **Paste Import Code**:
   - Copy the entire code block from script output
   - Paste into browser console
   - Press Enter

3. **Verify Import**:
   - Should see console output: `✅ Imported: { enhanced: 50, total: 15615, percentage: "0.3" }`
   - Enhancements are now in `quiz_enhancements` table

4. **Test in App**:
   - Refresh the page (F5)
   - Go to Quiz section
   - Start a quiz (Daily, Rapid Fire, etc.)
   - Questions should now have professional multiple-choice options
   - All 4 options should be present

---

### Phase 6: Verify Progress (1 minute)

**Purpose**: Confirm everything is working

**Command**:
```bash
node generate-quiz.js --mode=stats
```

**Output**:
```
📊 Enhancement Statistics

══════════════════════════════════════════════════
Total Questions:  15615
Enhanced:         50 (0.3%)
Remaining:        15565
Success Rate:     100%
Last Updated:     11/10/2025, 10:25:31 AM
══════════════════════════════════════════════════
```

**In App - Test Quizzes**:
- Try "Daily Quiz" → Should get 5 enhanced questions
- Try "Rapid Fire" → Should get 20 enhanced questions (if 20+ enhanced)
- Try "Category Quiz" → Should work if category has enhanced questions
- Each quiz question should have:
  - Clear question text
  - 4 distinct options (a, b, c, d)
  - One clearly correct answer
  - Explanation below options

---

## Workflow Summary

```
Selection (2 min)
    ↓ batch-TIMESTAMP.json
Generation (30-45 min)
    ↓ batch-TIMESTAMP-output.json
Validation (1-2 min)
    ↓ Validated JSON
Merge & Track (1 min)
    ↓ batch-TIMESTAMP-output.json-merged.json
    ↓ enhancement-metadata.json updated
Import to Database (2 min)
    ↓ Enhancements in Dexie
Verify (1 min)
    ↓ Quiz stats show progress
Test in App (5 min)
    ↓ Quizzes work with enhancements

Total time: 45-65 minutes per batch (mostly Claude generation)
```

---

## Scaling Strategy

### Week 1: Quality Testing
- **Goal**: Process first 50 questions
- **Tasks**: Follow complete workflow
- **Outcome**: Verify system works end-to-end
- **Test**: Run quizzes with users, get feedback

### Week 2: Expand Coverage
- **Goal**: Process 200 more questions (250 total)
- **Tasks**: Repeat workflow 4 times
- **Outcome**: Quizzes available in multiple categories
- **Distribution**: Spread across different topics

### Week 3+: Comprehensive
- **Goal**: Process 500+ more questions (750+ total)
- **Tasks**: Run workflows in parallel with Claude
- **Outcome**: Rich quiz variety, ~5% of database enhanced
- **Distribution**: Balanced across all categories

### Long-term Target
- **Goal**: 1000+ enhanced questions (12.5%+ of database)
- **Outcome**: Excellent quiz coverage across all topics
- **Frequency**: Run 10+ batches to reach target

---

## Common Issues & Fixes

### Issue: Validation Fails - Missing Reference

**Error**: `Enhancement 5: missing reference`

**Fix**:
1. Open output JSON in VS Code
2. Find enhancement with missing `reference` field
3. Look at source question in original batch
4. Add the reference ID manually OR
5. Ask Claude to regenerate that specific question

### Issue: Validation Fails - Wrong Option Count

**Error**: `need exactly 4 options, got 3`

**Fix**:
1. Find the enhancement with wrong option count
2. Ask Claude to add a 4th plausible option
3. Or manually add an option (less preferred)
4. Re-run validation

### Issue: Import Doesn't Work in Browser

**Error**: `ReferenceError: dexieDb is not defined`

**Fix**:
1. Make sure you're in the app (not just DevTools)
2. Refresh the page (F5)
3. Wait for app to load
4. Then open DevTools and try again
5. If still fails, app data may not be imported yet
   - Go to /import in app
   - Complete data import first
   - Then try enhancement import

### Issue: Quizzes Still Show "No Enhanced Questions"

**Error**: `No enhanced questions available for quiz`

**Fix**:
1. Check stats: `node generate-quiz.js --mode=stats`
2. Should show `Enhanced: 50` (or your number)
3. Refresh the app
4. Try a different quiz mode
5. If still fails, check browser console for errors
6. Verify enhancements imported: Open DevTools → IndexedDB → IslamQA → quiz_enhancements

---

## File References

**Main Script**:
- `/home/user/islamqa/quiz-generation/scripts/generate-quiz.js` - V2.0 generation pipeline

**Prompt**:
- `/home/user/islamqa/quiz-generation/generate-quiz-prompt.md` - Claude prompt template

**Data**:
- `/home/user/islamqa/quiz-generation/batches/` - Batch files (input/output)
- `/home/user/islamqa/quiz-generation/enhancement-metadata.json` - Progress tracking

**Database Integration**:
- `/home/user/islamqa/src/services/dexieDatabase.js` - `quiz_enhancements` table
- `/home/user/islamqa/src/services/quizService.js` - Uses enhancements at runtime

---

## Architecture Diagram

```
┌─────────────────────────────────────┐
│   V2.0 Quiz Generation Pipeline     │
└─────────────────────────────────────┘

SELECTION PHASE
  Input: questions.json (15,000+ questions)
  Process: Filter unprocessed via metadata
  Output: batch-TIMESTAMP.json (50 questions)

      ↓

GENERATION PHASE
  Input: batch JSON + generate-quiz-prompt.md
  Process: Claude generates enhancements
  Output: batch-TIMESTAMP-output.json (50 enhanced)

      ↓

VALIDATION PHASE
  Input: batch-TIMESTAMP-output.json
  Process: Verify format, structure, content
  Output: Validation report (pass/fail)

      ↓

MERGE PHASE
  Input: Validated enhancements
  Process: Update metadata, track progress
  Output: enhancement-metadata.json updated

      ↓

IMPORT PHASE
  Input: batch-TIMESTAMP-output.json-merged.json
  Process: Load into quiz_enhancements table
  Output: Enhancements in Dexie

      ↓

RUNTIME PHASE
  Process: QuizService.transformToQuizQuestion()
  Lookup: Check quiz_enhancements table
  Output: Professional multiple-choice quiz
```

---

## Key Design Points

### ✅ V2.0 Native
- No V1 fallbacks or legacy code
- Everything uses semantic reference IDs
- Clean, modern architecture

### ✅ Semantic Reference IDs
- `reference` field is primary key
- Links all system: quizzes, bookmarks, routes
- Matches IslamQA.com database

### ✅ LLM-Only Quizzes
- Only enhanced questions in quizzes
- No auto-generation fallback
- Professional quality guaranteed

### ✅ Scalable Workflow
- Batch processing (50-100 at a time)
- Easy to scale to 1000+ questions
- Metadata tracks progress
- No duplicate processing

### ✅ Simple Pipeline
- 5 clear phases
- 45-65 minutes per 50 questions
- Mostly waiting for Claude
- Easy to run in parallel batches

---

## Next Steps

1. **Complete First Batch**: Follow Phase 1-6 with batch-1762368648805
2. **Test Thoroughly**: Verify quizzes work with real users
3. **Gather Feedback**: Ask for quality feedback
4. **Refine Prompt**: Adjust if needed
5. **Scale Up**: Generate more batches
6. **Target 1000+**: Long-term goal for comprehensive coverage

---

**Status**: V2.0 Production Ready
**Last Updated**: November 10, 2025
**Version**: 2.0.0 (Native)
