# Quiz Question Generation

Simple system for generating quiz questions using Claude Code agent.

## Quick Start

### 1. Select Questions (2 min)

```bash
node generate-quiz-questions.cjs select --count=100
```

Creates `batches/batch-001-input.json` with 100 unprocessed questions.

### 2. Generate with Agent (Automatic)

Tell Claude Code agent:
```
Generate quiz questions for batch 001
```

Agent will:
- Read the batch input file
- Generate quiz questions following the prompt
- Validate output
- Save to `batches/batch-001-output.json`
- Update metadata

### 3. Build App Data (1 min)

```bash
node generate-quiz-questions.js build
```

Consolidates all batches into `public/data/quiz-questions.json`.

### 4. Commit (2 min)

```bash
git add quiz-generation/ public/data/quiz-questions.json
git commit -m "Add 100 quiz questions (batch 001)"
git push
```

Done! App will auto-import quiz questions on next load.

## Commands

### `select --count=N`
Select N unprocessed questions for a new batch.

```bash
# Select 100 questions
node generate-quiz-questions.cjs select --count=100

# Select 50 questions
node generate-quiz-questions.js select --count=50
```

**Output**: `batches/batch-XXX-input.json`

### `status`
Show current progress and statistics.

```bash
node generate-quiz-questions.js status
```

**Shows**:
- Total questions vs generated
- Coverage percentage
- Recent batches with status

### `build`
Build consolidated app data file.

```bash
node generate-quiz-questions.js build
```

**Output**: `public/data/quiz-questions.json` (ready for app import)

### `reset`
Clear all metadata (for testing).

```bash
node generate-quiz-questions.js reset
```

⚠️ **Warning**: Deletes all batch files and metadata. Use only for testing.

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

## Data Flow

```
questions.json (15,615)
    ↓
[select] → batch-XXX-input.json
    ↓
[agent] → batch-XXX-output.json
    ↓
[build] → quiz-questions.json
    ↓
[app imports automatically]
```

## Agent Instructions

The file `generate-quiz-prompt.md` contains complete instructions for the agent to generate quiz questions.

When you ask the agent to "Generate quiz questions for batch XXX", it will:
1. Read `batches/batch-XXX-input.json`
2. Follow the prompt instructions
3. Generate quiz questions with:
   - 4 multiple-choice options
   - 1 correct answer
   - Clear explanation
   - Appropriate difficulty
4. Validate output
5. Save to `batches/batch-XXX-output.json`
6. Update `quiz-metadata.json`

## Parallel Processing

Generate multiple batches in parallel:

```bash
# Create 5 batches
node generate-quiz-questions.cjs select --count=100  # batch-001
node generate-quiz-questions.cjs select --count=100  # batch-002
node generate-quiz-questions.cjs select --count=100  # batch-003
node generate-quiz-questions.cjs select --count=100  # batch-004
node generate-quiz-questions.cjs select --count=100  # batch-005

# Tell agent to process all
"Generate quiz questions for batches 001, 002, 003, 004, and 005"

# Build once
node generate-quiz-questions.js build

# Commit all
git add quiz-generation/ public/data/quiz-questions.json
git commit -m "Add 500 quiz questions (batches 001-005)"
git push
```

## Troubleshooting

### No questions selected
All questions already processed. Check status:
```bash
node generate-quiz-questions.js status
```

### Build shows no batch files
Agent hasn't generated quiz questions yet. Ask agent:
```
Generate quiz questions for batch 001
```

### Want to start over
Reset everything:
```bash
node generate-quiz-questions.js reset
```

## Progress Tracking

The `quiz-metadata.json` file tracks:
- Which questions have been processed
- Batch status (pending/completed)
- Generation statistics

Format:
```json
{
  "version": "3.0",
  "processedQuestions": [329, 245, ...],
  "batches": [
    {
      "id": "001",
      "date": "2025-11-10",
      "count": 100,
      "status": "completed",
      "references": [329, 245, ...]
    }
  ],
  "stats": {
    "totalQuestions": 15615,
    "generated": 100,
    "coverage": 0.6
  }
}
```

## Tips

- **Start small**: Test with `--count=10` first
- **Check status**: Run `status` command frequently
- **Build often**: Run `build` after each batch to see results
- **Commit incrementally**: Commit after each batch or set of batches
- **Monitor progress**: Track coverage percentage to see overall progress

## Goals

- **Short-term**: 500+ questions (3% coverage)
- **Medium-term**: 1,000+ questions (6% coverage)
- **Long-term**: 2,000+ questions (12% coverage)

Each batch of 100 questions takes ~5 minutes total (select + agent + build).
