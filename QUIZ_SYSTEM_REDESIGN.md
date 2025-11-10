# 🎯 Quiz Question Generation System - Simplified Design

**Status**: Design Phase - Awaiting Approval
**Date**: November 10, 2025
**Goal**: Simple, clear system for batch-generating quiz questions with LLM

---

## 🎪 Executive Summary

### What We're Building

A dead-simple system to:
1. Select batches of unprocessed questions
2. Generate quiz questions using Claude (or any LLM)
3. Track what's been generated
4. Import quiz questions into the app automatically
5. Support parallel batch processing

### Core Principle

**KISS (Keep It Simple, Stupid)**
- One source of truth
- One script to rule them all
- Clear terminology (no more "enhancements")
- Easy to understand in 5 minutes

---

## 🗂️ Directory Structure (New)

```
quiz-generation/
├── README.md                          # Simple guide
├── generate-quiz-questions.js         # ONE script for everything
├── generate-quiz-prompt.md            # LLM prompt template (UPDATED)
├── quiz-metadata.json                 # Tracking (which questions processed)
└── batches/                           # Generated batches
    ├── batch-001-input.json           # Selected questions
    ├── batch-001-output.json          # LLM response
    ├── batch-002-input.json
    ├── batch-002-output.json
    └── ...

public/data/
├── categories.json                    # Existing
├── questions.json                     # Existing
└── quiz-questions.json                # Quiz questions (RENAMED from enhancements.json)

src/services/
├── dexieDatabase.js                   # UPDATED: quiz_questions table
├── dataLoader.js                      # UPDATED: loads quiz-questions.json
└── quizService.js                     # UPDATED: uses quiz questions

DELETED FILES:
├── QUIZ_ENHANCEMENTS_INTEGRATION.md   # Stale docs
├── QUIZ_GENERATION_GUIDE.md           # Stale docs
├── enhancement-metadata.json          # Confusing name
├── quiz-generation/scripts/           # Over-engineered scripts
│   ├── generate-quiz.js               # DELETE
│   ├── generate-quiz-v2.js            # DELETE
│   ├── transform-to-v2.js             # DELETE
│   ├── process-batch.js               # DELETE
│   └── init-metadata.js               # DELETE
└── public/data/enhancements.json      # RENAME to quiz-questions.json
```

---

## 🔧 The ONE Script: `generate-quiz-questions.js`

### Commands

```bash
# 1. Select unprocessed questions
node generate-quiz-questions.js select --count=100

# 2. Show current progress
node generate-quiz-questions.js status

# 3. Build consolidated app data file
node generate-quiz-questions.js build

# 4. Reset (for testing)
node generate-quiz-questions.js reset
```

### Command Details

#### `select --count=N`
- Picks N unprocessed questions from `questions.json`
- Checks `quiz-metadata.json` for already-processed
- Creates `batches/batch-XXX-input.json`
- Formats for agent to process
- **Output**: Ready-to-use file for agent generation

#### `status`
- Shows: Total questions, Generated, Remaining, Coverage %
- Lists recent batches with status
- Simple progress bar
- **No complexity**: Just the facts

#### `build`
- Consolidates ALL processed batches from `batches/*-output.json`
- Creates/updates `public/data/quiz-questions.json`
- This file gets auto-imported by app on startup
- **Output**: Single source of truth for app

#### `reset` (dev only)
- Clears `quiz-metadata.json`
- Removes all batch files
- **Use case**: Starting fresh for testing

**Note**: No `import` command needed - the agent handles generation, validation, and metadata updates automatically!

---

## 📊 Data Formats

### `quiz-metadata.json` (Simple Tracking)

```json
{
  "version": "3.0",
  "processedQuestions": [
    329, 245, 8512, 22762, ...
  ],
  "batches": [
    {
      "id": "001",
      "date": "2025-11-10",
      "count": 100,
      "status": "completed"
    },
    {
      "id": "002",
      "date": "2025-11-11",
      "count": 100,
      "status": "pending"
    }
  ],
  "stats": {
    "totalQuestions": 15615,
    "generated": 200,
    "coverage": 1.3
  }
}
```

**That's it. No complex metadata. Just tracking.**

### `batches/batch-XXX-input.json` (For LLM)

```json
{
  "batch": "001",
  "created": "2025-11-10T12:00:00Z",
  "questions": [
    {
      "reference": 329,
      "title": "Is Masturbation Haram in Islam?",
      "question": "<p>Full question text...</p>",
      "answer": "<div>Full answer text...</div>",
      "category": 245
    }
    // ... 99 more
  ]
}
```

### `batches/batch-XXX-output.json` (From LLM)

```json
{
  "batch": "001",
  "quizQuestions": [
    {
      "reference": 329,
      "questionText": "What is the Islamic ruling on masturbation?",
      "difficulty": "medium",
      "options": [
        {"id": "a", "text": "Haram (forbidden)", "isCorrect": true},
        {"id": "b", "text": "Halal (permissible)", "isCorrect": false},
        {"id": "c", "text": "Makruh (disliked)", "isCorrect": false},
        {"id": "d", "text": "Depends on circumstances", "isCorrect": false}
      ],
      "explanation": "Masturbation is considered haram in Islam...",
      "tags": ["fiqh", "haram", "personal-conduct"]
    }
    // ... 99 more
  ]
}
```

### `public/data/quiz-questions.json` (For App)

```json
[
  {
    "reference": 329,
    "questionText": "What is the Islamic ruling on masturbation?",
    "difficulty": "medium",
    "options": [...],
    "explanation": "...",
    "tags": [...]
  },
  {
    "reference": 245,
    "questionText": "...",
    ...
  }
  // All quiz questions from all batches
]
```

**Simple array. No nesting. No metadata wrapper. Just quiz questions.**

---

## 🚀 Complete Workflow (Simple)

### Step 1: Select Questions (2 min)
```bash
cd quiz-generation
node generate-quiz-questions.js select --count=100
```

**Output**:
```
✅ Created batch 001
📁 File: batches/batch-001-input.json
📊 Questions: 100
🎯 References: [329, 245, 8512, ...]

Next step: Ask Claude Code agent to generate quiz questions
```

### Step 2: Agent Generates Quiz Questions (Automatic)

**User tells agent:**
```
Generate quiz questions for batch 001
```

**Agent does automatically:**
1. Reads `batches/batch-001-input.json`
2. Reads `generate-quiz-prompt.md` for instructions
3. Generates quiz questions with proper format
4. Validates output (4 options, 1 correct, etc.)
5. Saves to `batches/batch-001-output.json`
6. Updates `quiz-metadata.json` with processed references

**Agent output:**
```
✅ Generated 100 quiz questions for batch 001
✅ Validation PASSED (100/100)
✅ Saved to batches/batch-001-output.json
✅ Updated metadata
🎯 Total generated: 100
📈 Coverage: 0.6% (100/15615)

Next step: Build app data file
```

### Step 3: Build App Data (1 min)
```bash
node generate-quiz-questions.js build
```

**Output**:
```
✅ Built quiz-questions.json
📊 Total quiz questions: 100
📁 File: public/data/quiz-questions.json
🎯 Ready for app import

Next step: Commit and push
```

### Step 4: Commit (2 min)
```bash
git add quiz-generation/quiz-metadata.json
git add quiz-generation/batches/batch-001-*
git add public/data/quiz-questions.json
git commit -m "Add 100 quiz questions (batch 001)"
git push -u origin claude/simplify-quiz-system-011CUzb7rFUGdTWpEFVvuexE
```

**Done! App will auto-load quiz questions on next import.**

---

## 🔄 Parallel Batch Processing

### Scenario: Generate 500 questions in parallel

```bash
# Create 5 batches
node generate-quiz-questions.js select --count=100  # batch-001
node generate-quiz-questions.js select --count=100  # batch-002
node generate-quiz-questions.js select --count=100  # batch-003
node generate-quiz-questions.js select --count=100  # batch-004
node generate-quiz-questions.js select --count=100  # batch-005
```

**Then tell agent:**
```
Generate quiz questions for batches 001, 002, 003, 004, and 005
```

**Agent processes all batches automatically:**
- Processes each batch independently
- Validates each output
- Updates metadata after each batch
- All outputs saved to respective batch files

```bash
# Build final consolidated file
node generate-quiz-questions.js build

# Commit all at once
git add quiz-generation/ public/data/quiz-questions.json
git commit -m "Add 500 quiz questions (batches 001-005)"
git push
```

**Benefits**:
- Each batch is independent
- Agent handles all generation automatically
- Easy to track which batch is which
- Simple to resume if interrupted (just regenerate failed batches)

---

## 🗄️ Database Integration

### Schema Change (Rename)

```javascript
// OLD
quiz_enhancements: 'reference'

// NEW
quiz_questions: 'reference'
```

### Import Flow

```
App Loads
  ↓
Check: Data imported?
  ├─ YES: Skip
  └─ NO: Import
        ↓
        Load categories.json (268) → 30%
        ↓
        Load questions.json (15,615) → 70%
        ↓
        Load quiz-questions.json (100+) → 95%
        ↓
        Mark complete → 100%
        ↓
        App ready! Quizzes work!
```

### Runtime Usage

```javascript
// In QuizService
const quizQuestion = await dexieDb.getQuizQuestion(questionReference)

if (quizQuestion) {
  // Use pre-generated quiz question
  return {
    reference: question.reference,
    questionText: quizQuestion.questionText,
    options: quizQuestion.options,
    explanation: quizQuestion.explanation,
    difficulty: quizQuestion.difficulty,
    originalQuestion: question  // Link back to original for "Read More"
  }
}
```

**Link back to original**: Use `reference` field to fetch full Q&A for explanation.

---

## 📝 Terminology Changes

### Find & Replace Everywhere

| Old Term | New Term |
|----------|----------|
| enhancement(s) | quiz question(s) |
| quiz_enhancements | quiz_questions |
| enhancements.json | quiz-questions.json |
| enhancement-metadata.json | quiz-metadata.json |
| bulkImportEnhancements | bulkImportQuizQuestions |
| getQuizEnhancement | getQuizQuestion |
| generatedEnhancements | quizQuestions |
| saveQuizEnhancement | saveQuizQuestion |

### Files to Update

- [ ] `src/services/dexieDatabase.js` (table name, methods)
- [ ] `src/services/dataLoader.js` (file name, import method)
- [ ] `src/services/quizService.js` (method calls)
- [ ] `quiz-generation/generate-quiz-prompt.md` (prompt text)
- [ ] `public/data/enhancements.json` → `quiz-questions.json`
- [ ] `quiz-generation/enhancement-metadata.json` → `quiz-metadata.json`

---

## 🧪 Testing Checklist

### After Implementation

- [ ] Run `node generate-quiz-questions.js select --count=10`
- [ ] Verify `batches/batch-001-input.json` created correctly
- [ ] Generate with Claude (use 10 questions for quick test)
- [ ] Save output as `batches/batch-001-output.json`
- [ ] Run `node generate-quiz-questions.js import --batch=001`
- [ ] Verify validation passes
- [ ] Check `quiz-metadata.json` updated
- [ ] Run `node generate-quiz-questions.js build`
- [ ] Verify `public/data/quiz-questions.json` created
- [ ] Clear browser IndexedDB
- [ ] Load app and verify quiz questions imported
- [ ] Start quiz and verify questions work
- [ ] Check "Read More" links back to original question

---

## 📚 Documentation (New)

### Keep

- `quiz-generation/README.md` - Simple guide (rewrite)
- `quiz-generation/generate-quiz-prompt.md` - LLM prompt (update terminology)

### Delete

- `QUIZ_ENHANCEMENTS_INTEGRATION.md` (too complex, outdated)
- `QUIZ_GENERATION_GUIDE.md` (too long, confusing)
- All docs in `docs/ARCHIVED/` related to quiz (already archived)

### Create New

- `quiz-generation/README.md` - 1-page quick start guide
- `QUIZ_QUESTIONS.md` (root) - High-level overview for users

---

## 🎯 Benefits of New System

### Before (Current)
❌ Multiple scripts (generate-quiz.js, v2, transform, process-batch)
❌ Confusing terminology (enhancements vs quiz questions)
❌ Complex workflow (6 steps)
❌ Multiple metadata files
❌ Hard to run in parallel
❌ Difficult to understand

### After (New)
✅ ONE script for everything
✅ Clear terminology (quiz questions)
✅ Simple workflow (4 steps: select → generate → import → build)
✅ One metadata file
✅ Easy parallel processing (independent batches)
✅ 5-minute learning curve

---

## 🚀 Implementation Plan

### Phase 1: Cleanup (10 min)
1. Delete stale documentation
2. Delete old scripts
3. Rename existing files

### Phase 2: Rename (15 min)
1. Rename database table and methods
2. Update all references in codebase
3. Rename data files

### Phase 3: Build New Script (30 min)
1. Create `generate-quiz-questions.js`
2. Implement `select` command
3. Implement `import` command
4. Implement `build` command
5. Implement `status` command

### Phase 4: Update Prompt (5 min)
1. Update `generate-quiz-prompt.md`
2. Change all "enhancement" to "quiz question"

### Phase 5: Documentation (15 min)
1. Write new `quiz-generation/README.md`
2. Write new `QUIZ_QUESTIONS.md`

### Phase 6: Testing (20 min)
1. Test complete workflow
2. Verify app integration works
3. Check parallel batch processing

### Phase 7: Commit (5 min)
1. Commit all changes
2. Push to branch

**Total Time: ~90 minutes**

---

## ✅ Approval Checklist

Before proceeding, confirm:
- [ ] Architecture makes sense
- [ ] Workflow is simple enough
- [ ] Terminology is clear
- [ ] Data formats are good
- [ ] Nothing important missing
- [ ] Ready to delete old complexity

---

## 📌 Summary

This redesign simplifies the quiz question generation system to:

1. **One script** - `generate-quiz-questions.js` does everything
2. **Clear names** - No more "enhancements", just "quiz questions"
3. **Simple workflow** - Select → Generate → Import → Build
4. **Easy tracking** - One metadata file
5. **Parallel ready** - Independent batches
6. **Auto-import** - Works with existing data pipeline

**Next Step**: Review and approve this plan, then implement.
