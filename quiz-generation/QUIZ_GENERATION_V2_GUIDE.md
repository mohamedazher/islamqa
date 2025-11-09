# Quiz Generation V2.0 - Complete Guide

## Overview

This is the **modernized quiz enhancement system** for IslamQA that works exclusively with the **new database structure** (semantic reference IDs). It generates high-quality multiple-choice options for quiz questions using Claude.

## Key Differences from V1

| Feature | V1 (Old) | V2 (New) |
|---------|----------|---------|
| **Data Source** | `www-old-backup/` (legacy) | Dexie Database (new) |
| **IDs Used** | Old numeric IDs (8512) | Semantic reference IDs (106245) |
| **Storage** | Pre-generated JSON file | Database table (quiz_enhancements) |
| **Architecture** | Complete quiz data | Quiz enhancements (question + dynamic) |
| **Fallback** | None | Dynamic generation if not enhanced |

## System Architecture

```
Dexie Database (8000+ questions with semantic reference IDs)
    ↓ (Load questions from database)
[generate-quiz-v2.js --mode=select]
    ↓ (Create batch file with reference IDs)
[generate-quiz-prompt-v2.md + Claude]
    ↓ (Generate 4-option multiple choice)
[Batch output JSON]
    ↓ (Validate & merge)
[generate-quiz-v2.js --mode=merge]
    ↓ (Save to enhancement metadata)
[quiz_enhancements table in Dexie]
    ↓ (Load enhancements at runtime)
[QuizService.transformToQuizQuestion()]
    ↓ (Use enhanced options or fall back to dynamic)
[Quiz displayed to user]
```

## Data Flow

```
When User Starts Quiz:
  1. QuizService loads questions from database
  2. For each question, check quiz_enhancements table
  3. If enhanced version exists → Use professional 4-option version
  4. If not enhanced → Generate simple True/False version
  5. Display to user with enhanced explanation
```

## Quick Start

### Step 1: Select Questions for Enhancement

```bash
cd quiz-generation/scripts
node generate-quiz-v2.js --mode=select --count=50
```

**Output:**
```
📋 Selecting 50 random unprocessed questions...
📚 Loaded 8000 questions from database
Already processed: 0 questions
7500 unprocessed questions available

✅ Batch created: /path/to/batches/batch-1234567890.json
```

### Step 2: Generate Enhancements with Claude

1. Open `batches/batch-1234567890.json` (your selected questions)
2. Go to Claude or Claude Code
3. Open `generate-quiz-prompt-v2.md` (the prompt template)
4. At the bottom, replace `[PASTE SOURCE QUESTIONS BATCH HERE]` with your batch JSON
5. Send to Claude
6. Claude generates quiz enhancements

**Claude will output something like:**
```json
{
  "generatedEnhancements": [
    {
      "reference": 106245,
      "questionText": "What is the Islamic ruling on...",
      "options": [
        {"id": "a", "text": "...", "isCorrect": true},
        ...
      ],
      "explanation": "...",
      "difficulty": "medium",
      "tags": [...]
    }
  ]
}
```

### Step 3: Save & Validate

Save Claude's output as:
```
batches/batch-1234567890-output.json
```

Validate before merge:
```bash
node generate-quiz-v2.js --mode=validate --input=batch-1234567890-output.json
```

### Step 4: Merge into Database

```bash
node generate-quiz-v2.js --mode=merge --input=batch-1234567890-output.json
```

**Output:**
```
🔀 Merging enhancements from batch-1234567890-output.json...
🔍 Validating batch-1234567890-output.json...
✅ Validation passed: 50 enhancements

✅ Merge complete:
   Added: 50
   Skipped: 0
   Total processed: 50

💾 To import into Dexie:
   - Use db.bulkImportEnhancements() in browser console
   - Or reference the merged file for import
```

### Step 5: Check Progress

```bash
node generate-quiz-v2.js --mode=stats
```

**Output:**
```
📊 Quiz Enhancement Generation Statistics

Source Questions:  8000
Enhanced:          50
Remaining:         7950
Success Rate:      100%

Last Updated:      2025-01-09T12:34:56.789Z
```

## Data Formats

### Input: Source Questions

```json
{
  "batchId": "batch-1234567890",
  "createdDate": "2025-01-09T...",
  "format": "2.0 (semantic reference IDs)",
  "sourceQuestions": [
    {
      "reference": 106245,
      "title": "Is it permissible to repurchase a gift?",
      "question": "I want to know the Islamic ruling on...",
      "answer": "<p>The Prophet forbade...</p>",
      "primary_category": 145,
      "tags": ["gifts", "transactions"]
    }
  ]
}
```

**Key Fields:**
- **reference**: Semantic reference ID (used as primary key)
- **title**: Short version of question
- **question**: Full question text
- **answer**: Full answer with explanation
- **primary_category**: Category reference
- **tags**: Existing question tags

### Output: Generated Enhancements

```json
{
  "generatedEnhancements": [
    {
      "reference": 106245,
      "questionText": "What is the Islamic ruling on someone repurchasing a gift they previously gave?",
      "type": "multiple-choice",
      "difficulty": "medium",
      "options": [
        {
          "id": "a",
          "text": "It is forbidden based on a hadith from the Prophet",
          "isCorrect": true
        },
        {
          "id": "b",
          "text": "It is permissible if both parties agree",
          "isCorrect": false
        },
        {
          "id": "c",
          "text": "It is makruh (disliked) but permissible",
          "isCorrect": false
        },
        {
          "id": "d",
          "text": "The ruling depends on the value of the gift",
          "isCorrect": false
        }
      ],
      "explanation": "The Prophet explicitly forbade someone from repurchasing a gift, comparing such a person to a dog returning to its own vomit.",
      "tags": ["gifts", "transactions", "haram", "hadith"],
      "source": "IslamQA reference 106245"
    }
  ],
  "metadata": {
    "batchId": "batch-1234567890",
    "processedCount": 50,
    "generatedDate": "2025-01-09",
    "notes": "All 50 successfully generated"
  }
}
```

**Key Fields:**
- **reference**: Must match source reference exactly (links to database)
- **questionText**: Clear multiple-choice question
- **options**: 4 options with a-d ids, one correct
- **difficulty**: easy, medium, or hard
- **explanation**: 2-3 sentence summary
- **tags**: 4-6 relevant tags
- **source**: Notes the original reference

## Database Integration

### Importing Enhancements

The enhancements are automatically tracked in `enhancement-metadata.json` when you merge. To actually use them in the app:

**Option A: Manual Import (Browser Console)**

```javascript
// In browser DevTools console while app is running:
const enhancements = [/* paste merged enhancements here */]
await dexieDb.bulkImportEnhancements(enhancements.generatedEnhancements)
```

**Option B: Automatic via QuizService**

QuizService automatically checks `quiz_enhancements` table when generating quizzes. Once imported, enhancements are used automatically.

### Checking Stats

```javascript
// Check how many questions are enhanced
const stats = await dexieDb.getEnhancementStats()
console.log(`${stats.enhanced} of ${stats.total} questions enhanced (${stats.percentage}%)`)
```

## Generation Strategy

### Phased Approach

**Phase 1: Quality Testing (50 enhancements)**
- Generate first 50 to verify quality
- Test in app with real users
- Gather feedback
- Refine prompt if needed

**Phase 2: Core Coverage (400 enhancements)**
- Generate next 400 covering main categories
- Aim for 5-10% of questions enhanced
- Focus on popular topics
- Verify category distribution

**Phase 3: Comprehensive (1000+ enhancements)**
- Scale up to 1000+ enhancements
- Cover all categories evenly
- Advanced topics and edge cases
- Comprehensive coverage

### Recommended Timeline

- **Week 1**: 50 questions (1 batch) - Quality validation
- **Week 2**: 200 questions (4 batches) - Category coverage
- **Week 3+**: 500+ questions (10+ batches) - Full implementation

## Quality Checklist

For each batch, verify:

- ✅ **Reference IDs match** input exactly
- ✅ **Questions are clear** and unambiguous
- ✅ **4 options provided** with a-d ids
- ✅ **Exactly one correct** option per question
- ✅ **Wrong options plausible** (not obviously wrong)
- ✅ **Explanations concise** (2-3 sentences)
- ✅ **Difficulty levels** appropriate
- ✅ **Tags are relevant** (4-6 per question)
- ✅ **No HTML tags** in output
- ✅ **JSON is valid** (no syntax errors)

## Prompt Engineering Tips

### For Better Option Quality

1. **Emphasize plausible wrong answers**
   - Use common misconceptions
   - Base on opposite rulings
   - Include minority scholarly views
   - Avoid "obviously wrong" options

2. **Make correct answer clear**
   - Should be derivable from answer text
   - No ambiguity
   - Factually accurate

3. **Vary question types**
   - Ruling questions (60%)
   - Definition questions (15%)
   - Procedure questions (15%)
   - Condition questions (10%)

### For Better Coverage

- Balance easy/medium/hard (35/45/20)
- Cover different categories evenly
- Include various Islamic topics
- Mix common and advanced rulings

## Troubleshooting

### "Module not found" Error
Make sure you're in the right directory:
```bash
cd /path/to/islamqa/quiz-generation/scripts
node generate-quiz-v2.js --mode=stats
```

### "File not found" Error
Check that public/data files exist:
```bash
ls ../../public/data/questions.json
ls ../../public/data/categories.json
```

### Validation Errors
Common issues:
- **Missing reference**: Enhancement missing `reference` field
- **Multiple correct answers**: More than one option marked `isCorrect: true`
- **Invalid difficulty**: Use only `easy`, `medium`, `hard`
- **Missing options**: Less than 2 options provided

Fix in the output JSON and re-run merge.

### Duplicate Questions
The system automatically skips duplicates during merge. If you see warnings:
```
⚠️  Skipping duplicate: reference 106245
```

This means that question reference is already processed. You can re-run selection to get new questions.

## Monitoring Progress

### Enhancement Statistics
```bash
node generate-quiz-v2.js --mode=stats
```

Shows:
- Total questions in database
- Questions already enhanced
- Percentage complete
- Last update time

### Batch Processing
Each batch file contains metadata:
```json
{
  "batchId": "batch-1234567890",
  "sourceQuestions": 50
}
```

Track which batches you've processed to avoid duplicates.

## Advanced Usage

### Generate Specific Categories

To enhance only questions from a specific category, modify the script to filter:

```javascript
// In selectQuestions() function, add category filter:
const unprocessed = questions.filter(q =>
  !processedReferences.has(q.reference) &&
  q.primary_category === 145  // Only category 145
)
```

### Generate Multiple Questions per Source

For longer answers, you can request multiple quiz questions per source:

In the prompt, ask Claude:
> "For particularly long or complex answers, you may generate 2-3 related quiz questions from a single source."

### Export for Review

Create a review document before merging:
```bash
cat ../batches/batch-1234567890-output.json | \
  jq '.generatedEnhancements[] | {reference, questionText, difficulty}' > review.txt
```

## Files Reference

```
quiz-generation/
├── README.md                              # Overview (original)
├── QUICKSTART.md                          # Quick start (original V1)
├── QUIZ_GENERATION_V2_GUIDE.md            # This file (V2)
├── QUIZ_GENERATION_GUIDE.md               # Detailed docs (original)
│
├── generate-quiz-prompt-v2.md             # Claude prompt (NEW)
├── generate-quiz-prompt.md                # Claude prompt (old V1)
│
├── enhancement-metadata.json              # Track progress (NEW)
├── quiz-metadata.json                     # Metadata (V1)
├── quiz-questions.json                    # Pre-generated quizzes (V1, deprecated)
│
├── scripts/
│   ├── generate-quiz-v2.js               # Helper script (NEW)
│   └── generate-quiz.js                  # Helper script (V1, deprecated)
│
└── batches/
    ├── batch-1234567890.json             # Selected questions
    ├── batch-1234567890-output.json      # Claude's output
    └── batch-1234567890-merged.json      # After validation
```

## Migration from V1

If you have V1 quizzes, they're **not needed anymore**. The new system:
- Loads questions directly from database
- Generates quiz enhancements dynamically
- Falls back to simple generation if not enhanced

Old quiz-questions.json is deprecated and can be deleted.

## API Reference

### Database Methods

```javascript
// Get enhancement for a question
const enhancement = await dexieDb.getQuizEnhancement(reference)

// Save single enhancement
await dexieDb.saveQuizEnhancement({ reference, options, explanation, ... })

// Import batch of enhancements
await dexieDb.bulkImportEnhancements(enhancementsArray)

// Get statistics
const stats = await dexieDb.getEnhancementStats()
// Returns: { enhanced: 50, total: 8000, percentage: "0.6" }
```

### QuizService Methods

```javascript
// Check if question is enhanced
const isEnhanced = quizQuestion.isEnhanced

// Fall back to dynamic if not enhanced
const quizQuestion = await quizService.transformToQuizQuestion(dbQuestion)
// Returns: { options, explanation, difficulty, ..., isEnhanced: true/false }
```

## Best Practices

1. **Generate in batches**
   - 50-100 questions per batch is manageable
   - Easier to review and iterate
   - Smaller batches easier to debug

2. **Test early**
   - Generate 50, test with users
   - Get feedback before scaling
   - Refine prompt based on feedback

3. **Maintain quality**
   - Review sample questions from each batch
   - Spot-check for clarity and accuracy
   - Don't sacrifice quality for speed

4. **Prioritize coverage**
   - Start with popular topics
   - Cover major categories
   - Then fill in gaps

5. **Keep metadata**
   - Track which batches are processed
   - Update stats regularly
   - Document any issues or special handling

## Support & Feedback

For issues or questions:
1. Check troubleshooting section above
2. Review the prompt (generate-quiz-prompt-v2.md)
3. Check batch output for validation errors
4. Review metadata for progress tracking

## Next Steps

1. **Try it out**: Generate first 50 questions
2. **Import & test**: Load into app and test
3. **Gather feedback**: Get user input on quality
4. **Iterate**: Improve prompt if needed
5. **Scale up**: Generate more batches

Happy generating! 🚀
