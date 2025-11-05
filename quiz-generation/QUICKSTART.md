# Quiz Generation Quick Start

## TL;DR - Generate Your First 50 Quizzes

```bash
# 1. Select 50 random questions
cd quiz-generation/scripts
node generate-quiz.js --mode=select --count=50

# 2. Open batch file (e.g., batches/batch-1234567890.json)
# 3. Copy questions to Claude using generate-quiz-prompt.md
# 4. Save Claude output to batches/batch-1234567890-output.json
# 5. Merge into database
node generate-quiz.js --mode=merge --input=batch-1234567890-output.json

# 6. Check stats
node generate-quiz.js --mode=stats

# 7. Copy to app
cp ../quiz-questions.json ../../public/data/quiz-questions.json
```

## Detailed Walkthrough

### Step 1: Select Source Questions

```bash
cd /Users/mohamedazher/Halsimplify/islamqa/quiz-generation/scripts
node generate-quiz.js --mode=select --count=50
```

**Output:**
```
📋 Selecting 50 random unprocessed questions...

Found 11289 source questions
11289 unprocessed questions available

✅ Batch created: /path/to/batches/batch-1736179200000.json

Next steps:
1. Open the batch file
2. Use the prompt from generate-quiz-prompt.md with Claude
3. Save Claude's output as batch-1736179200000-output.json
4. Run: node generate-quiz.js --mode=merge --input=batch-1736179200000-output.json
```

### Step 2: Prepare Prompt for Claude

Open two files:
1. `batches/batch-XXX.json` (your selected questions)
2. `generate-quiz-prompt.md` (the prompt template)

### Step 3: Use Claude to Generate Quizzes

**In Claude Code or Claude.ai:**

1. Copy the entire content of `generate-quiz-prompt.md`
2. At the bottom where it says `[PASTE SOURCE QUESTIONS JSON HERE]`, paste your batch JSON
3. Claude will output quiz questions in the correct JSON format
4. Copy Claude's output

### Step 4: Save Claude's Output

Save the generated JSON to:
```
batches/batch-XXX-output.json
```

Example output structure:
```json
{
  "generatedQuizzes": [
    {
      "id": "quiz-001",
      "sourceQuestionId": 12345,
      "questionText": "What is the ruling on...?",
      "type": "multiple-choice",
      "difficulty": "medium",
      "options": [...],
      "explanation": "...",
      ...
    }
  ],
  "metadata": {
    "batchId": "batch-001",
    "processedCount": 50,
    "generatedDate": "2025-01-06"
  }
}
```

### Step 5: Validate & Merge

```bash
# Validate first (optional but recommended)
node generate-quiz.js --mode=validate --input=batch-XXX-output.json

# Merge into main database
node generate-quiz.js --mode=merge --input=batch-XXX-output.json
```

**Successful merge output:**
```
🔀 Merging quizzes from batch-XXX-output.json...

🔍 Validating batch-XXX-output.json...
✅ Validation passed: 50 quizzes

✅ Quiz database saved (50 quizzes)
✅ Metadata saved

✅ Merge complete:
   Added: 50
   Skipped: 0
   Total quizzes: 50
```

### Step 6: Check Statistics

```bash
node generate-quiz.js --mode=stats
```

**Output:**
```
📊 Quiz Generation Statistics

Source Questions:  11289
Processed:         50
Remaining:         11239
Success Rate:      100%

Current Quiz DB:   50 quizzes
Last Updated:      2025-01-06T12:34:56.789Z
```

### Step 7: Deploy to App

```bash
# From quiz-generation directory
cp quiz-questions.json ../public/data/quiz-questions.json
```

Or create the public/data directory if it doesn't exist:
```bash
mkdir -p ../public/data
cp quiz-questions.json ../public/data/quiz-questions.json
```

### Step 8: Update App to Use Generated Quizzes

The quizService.js needs to be updated to load from this JSON file instead of generating on-the-fly. (We'll handle this integration next)

## Batch Processing Tips

### Generate in Phases

**Phase 1: First 100 (Testing)**
- Mix of easy/medium questions
- Popular topics
- Validate quality

**Phase 2: Next 400 (Expansion)**
- Cover all main categories
- Add harder questions
- Fill gaps

**Phase 3: Next 500+ (Comprehensive)**
- Deep coverage
- Edge cases
- Advanced topics

### Category Distribution

Aim for balanced coverage:
- 20% - Worship (prayer, fasting, hajj)
- 20% - Halal/Haram rulings
- 15% - Creed & Beliefs
- 15% - Family & Marriage
- 10% - Business & Transactions
- 10% - Social Interactions
- 10% - Miscellaneous

### Quality Checks

After each batch:
- Review sample questions manually
- Check difficulty distribution
- Verify explanations are clear
- Test in app

## Troubleshooting

### "Module not found" Error
Make sure you're running from the `scripts/` directory:
```bash
cd quiz-generation/scripts
node generate-quiz.js --mode=stats
```

### "File not found" Error
Check that `www-old-backup/js/` exists with questions files:
```bash
ls ../../www-old-backup/js/questions*.js
```

### Validation Errors
Common issues:
- Missing required fields
- Multiple correct answers
- Invalid option structure
- Missing source reference

Fix in the output JSON and re-run merge.

### Duplicate Quiz IDs
The script automatically skips duplicates during merge. Just note them and continue.

## Advanced Usage

### Select Specific Categories

Modify the script to filter by category:
```javascript
// In generate-quiz.js selectQuestions()
const unprocessed = allQuestions.filter(q =>
  !processedIds.has(parseInt(q.id)) &&
  q.category_id == 218  // Specific category
);
```

### Generate More Questions per Source

In the Claude prompt, you can request 2-3 questions per long-form answer. Just update the generation rules.

### Export for Review

```bash
# Pretty print current database
cat ../quiz-questions.json | jq '.quizzes[] | {id, questionText, difficulty}' > review.txt
```

## Next Steps After Generation

1. **Test in app** - Make sure quizzes display correctly
2. **User testing** - Get feedback on question quality
3. **Iterate** - Improve prompt based on results
4. **Scale up** - Generate more batches
5. **Maintenance** - Update as source Q&A updates

## File Structure Reference

```
quiz-generation/
├── QUICKSTART.md                    # This file
├── QUIZ_GENERATION_GUIDE.md         # Detailed documentation
├── generate-quiz-prompt.md          # Prompt for Claude
├── quiz-questions.json              # Main database (deploy this)
├── quiz-metadata.json               # Tracking data
├── scripts/
│   └── generate-quiz.js             # Helper script
└── batches/
    ├── batch-XXX.json               # Selected source questions
    └── batch-XXX-output.json        # Generated quizzes from Claude
```

## Questions?

See the full documentation in `QUIZ_GENERATION_GUIDE.md` for:
- Detailed data structures
- Question quality guidelines
- Difficulty level definitions
- Category mapping
- Special handling cases
