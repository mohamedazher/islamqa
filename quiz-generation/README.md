# Quiz Question Generation

Ultra-simple system for generating quiz questions using Claude Code agent.

## Quick Start (All-in-One)

Just tell the agent:
```
Generate 100 quiz questions
```

**Agent does everything automatically:**
1. ✅ Runs `select` to pick 100 unprocessed questions
2. ✅ Creates batch file
3. ✅ Generates quiz questions with proper format
4. ✅ Validates output
5. ✅ Saves to batch output file
6. ✅ Runs `build` to consolidate into app data
7. ✅ Reports completion

Then commit:
```bash
git add quiz-generation/ public/data/quiz-questions.json
git commit -m "Add 100 quiz questions"
git push
```

Done! App will auto-import quiz questions on next load.

---

## Alternative: Manual Step-by-Step

If you prefer to control each step manually:

### 1. Select Questions

```bash
node generate-quiz-questions.cjs select --count=100
```

Creates `batches/batch-001-input.json`.

### 2. Generate with Agent

Tell agent:
```
Generate quiz questions for batch 001
```

Agent generates and saves output.

### 3. Build

```bash
node generate-quiz-questions.cjs build
```

Consolidates all batches.

### 4. Commit

```bash
git add quiz-generation/ public/data/quiz-questions.json
git commit -m "Add 100 quiz questions"
git push
```

---

## Commands

### `select --count=N`
Select N unprocessed questions for a new batch.

```bash
node generate-quiz-questions.cjs select --count=100
```

**Output**: `batches/batch-XXX-input.json`

### `status`
Show current progress and statistics.

```bash
node generate-quiz-questions.cjs status
```

**Shows**:
- Total questions vs generated
- Coverage percentage
- Recent batches with status

### `build`
Build consolidated app data file.

```bash
node generate-quiz-questions.cjs build
```

**Output**: `public/data/quiz-questions.json` (ready for app import)

### `reset`
Clear all metadata (for testing).

```bash
node generate-quiz-questions.cjs reset
```

⚠️ **Warning**: Deletes all batch files and metadata. Use only for testing.

---

## File Structure

```
quiz-generation/
├── README.md                          # This file
├── generate-quiz-questions.cjs        # Main script
├── generate-quiz-prompt.md            # Prompt for agent
├── quiz-metadata.json                 # Tracking metadata
└── batches/                           # Generated batches
    ├── batch-001-input.json           # Selected questions
    ├── batch-001-output.json          # Generated quiz questions
    ├── batch-002-input.json
    └── batch-002-output.json

public/data/
└── quiz-questions.json                # Consolidated output for app
```

---

## Data Flow

```
questions.json (15,615)
    ↓
[agent selects] → batch-XXX-input.json
    ↓
[agent generates] → batch-XXX-output.json
    ↓
[agent builds] → quiz-questions.json
    ↓
[app imports automatically]
```

---

## Agent Instructions

The file `generate-quiz-prompt.md` contains complete instructions for the agent.

When you say **"Generate 100 quiz questions"**, the agent will:

1. **Run select command**
   ```bash
   node generate-quiz-questions.cjs select --count=100
   ```

2. **Read batch file** created in step 1

3. **Generate quiz questions** following the prompt:
   - 4 multiple-choice options
   - 1 correct answer
   - Clear explanation
   - Appropriate difficulty

4. **Validate output** automatically

5. **Save to batch output file**

6. **Update metadata** with processed references

7. **Run build command**
   ```bash
   node generate-quiz-questions.cjs build
   ```

8. **Report completion** with stats

---

## Parallel Processing

Generate multiple sets in parallel:

**Tell agent:**
```
Generate 500 quiz questions in 5 batches
```

**Agent will:**
- Create 5 batches of 100 questions each
- Generate quiz questions for all batches
- Build consolidated file
- Report total completion

**You commit once:**
```bash
git add quiz-generation/ public/data/quiz-questions.json
git commit -m "Add 500 quiz questions (5 batches)"
git push
```

---

## Troubleshooting

### Check Progress

```bash
node generate-quiz-questions.cjs status
```

Shows how many questions generated and remaining.

### Want to Start Over

```bash
node generate-quiz-questions.cjs reset
```

Clears all metadata and batches.

### Build Not Finding Batches

Agent hasn't generated yet. Tell agent:
```
Generate quiz questions for batch 001
```

---

## Progress Tracking

The `quiz-metadata.json` file tracks:
- Which questions have been processed (avoids duplicates)
- Batch status (pending/completed)
- Generation statistics

Example:
```json
{
  "version": "3.0",
  "processedQuestions": [329, 245, ...],
  "batches": [
    {
      "id": "001",
      "date": "2025-11-10",
      "count": 100,
      "status": "completed"
    }
  ],
  "stats": {
    "totalQuestions": 15615,
    "generated": 100,
    "coverage": 0.6
  }
}
```

---

## Tips

- **Start small**: Test with 10-20 questions first
- **Check status**: Run `status` to see progress
- **All-in-one is easier**: Just tell agent "Generate N quiz questions"
- **Commit often**: Commit after each batch or set of batches
- **Monitor coverage**: Track percentage to see overall progress

---

## Goals

- **Short-term**: 500+ questions (3% coverage)
- **Medium-term**: 1,000+ questions (6% coverage)
- **Long-term**: 2,000+ questions (12% coverage)

With the all-in-one workflow, generating 100 questions takes ~2-3 minutes + commit time!
