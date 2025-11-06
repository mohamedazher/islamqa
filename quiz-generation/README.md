# Quiz Generation System

## Overview

A complete system for generating high-quality quiz questions from the Islamic Q&A database using LLMs (Claude). Questions are pre-generated offline, tracked, and bundled with the app.

## Why This Approach?

### Problems with On-the-Fly Generation:
- ❌ Inconsistent quality (no review)
- ❌ Complex logic to parse long-form answers
- ❌ Performance overhead (CPU/memory)
- ❌ Different questions for each user (can't share daily quiz)
- ❌ Hard to improve/fix specific questions

### Benefits of Pre-Generation:
- ✅ High quality (LLM-generated, human-reviewable)
- ✅ Consistent across all users
- ✅ Fast (no runtime generation)
- ✅ Trackable (know which source questions are covered)
- ✅ Scalable (generate in batches offline)
- ✅ Maintainable (easy to update specific quizzes)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Source Data (8000+ Q&As)                                    │
│  └── www-old-backup/js/questions*.js, answers*.js           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Selection Script (generate-quiz.js --mode=select)           │
│  - Selects random unprocessed questions                     │
│  - Creates batch JSON with questions + answers              │
│  - Tracks processed IDs in metadata                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  LLM Generation (Claude)                                     │
│  - Uses structured prompt (generate-quiz-prompt.md)         │
│  - Converts long-form Q&A → multiple choice quiz            │
│  - Generates 4 plausible options + explanation              │
│  - Assigns difficulty, category, tags                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Validation & Merge (generate-quiz.js --mode=merge)         │
│  - Validates JSON structure                                 │
│  - Checks for duplicates                                    │
│  - Merges into quiz-questions.json                          │
│  - Updates metadata with processed IDs                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Deployment (copy to public/data/)                          │
│  - quiz-questions.json bundled with app                     │
│  - Loaded by quizService at runtime                         │
│  - Used for all quiz modes                                  │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
quiz-generation/
├── README.md                        # This file (overview)
├── QUICKSTART.md                    # Quick start guide
├── QUIZ_GENERATION_GUIDE.md         # Detailed documentation
├── generate-quiz-prompt.md          # Prompt template for Claude
│
├── quiz-questions.json              # Main database (SOURCE OF TRUTH)
├── quiz-metadata.json               # Tracking data
│
├── scripts/
│   └── generate-quiz.js             # Helper Node.js script
│
└── batches/
    ├── batch-XXX.json               # Selected source questions
    └── batch-XXX-output.json        # Generated quizzes from Claude
```

## Quick Start

### Generate Your First 50 Quizzes:

```bash
# 1. Navigate to scripts directory
cd quiz-generation/scripts

# 2. Select 50 random unprocessed questions
node generate-quiz.js --mode=select --count=50

# 3. Open the batch file created in batches/
# 4. Use generate-quiz-prompt.md with Claude to generate quizzes
# 5. Save Claude's output to batches/batch-XXX-output.json

# 6. Merge into database
node generate-quiz.js --mode=merge --input=batch-XXX-output.json

# 7. Deploy to app
cp ../quiz-questions.json ../../public/data/quiz-questions.json
```

See `QUICKSTART.md` for detailed walkthrough.

## Key Features

### 1. Tracking System
- **quiz-metadata.json** tracks which source questions have been processed
- Prevents duplicate quiz generation
- Shows processing statistics
- Can resume from any point

### 2. Validation
- Validates JSON structure before merge
- Checks for required fields
- Ensures exactly one correct answer
- Verifies option structure

### 3. Smart Selection
- Only selects unprocessed questions
- Random sampling for diversity
- Can filter by category (with modification)
- Tracks success/failure rates

### 4. Batch Processing
- Generate 50-100 quizzes at a time
- Each batch is independent
- Failed batches don't affect others
- Easy to review and iterate

## Data Formats

### Source Question Format:
```json
{
  "id": 12345,
  "question": "What is the ruling on music?",
  "question_full": "I want to know the Islamic ruling...",
  "question_no": 5011,
  "category_id": 218,
  "answers": "<p>HTML formatted answer...</p>"
}
```

### Generated Quiz Format:
```json
{
  "id": "quiz-5011",
  "sourceQuestionId": 12345,
  "questionText": "What is the ruling on listening to music?",
  "type": "multiple-choice",
  "difficulty": "medium",
  "category": "Halal & Haram",
  "options": [
    {"id": "a", "text": "Haram", "isCorrect": true},
    {"id": "b", "text": "Halal", "isCorrect": false},
    {"id": "c", "text": "Makruh", "isCorrect": false},
    {"id": "d", "text": "No ruling", "isCorrect": false}
  ],
  "explanation": "According to the majority of scholars...",
  "sourceReference": {
    "questionId": 12345,
    "questionNo": 5011,
    "questionTitle": "Ruling on music"
  },
  "points": 10,
  "tags": ["music", "haram", "entertainment"]
}
```

## Integration with App

### Current Implementation (Phase 3):
- QuizView generates questions on-the-fly
- Uses placeholder algorithm
- No persistence

### After Quiz Generation (Phase 4):
1. Update `quizService.js` to load from JSON:
```javascript
async loadQuizQuestions() {
  const response = await fetch('/data/quiz-questions.json')
  const data = await response.json()
  this.quizQuestions = data.quizzes
}

getDailyQuiz(date) {
  // Filter pre-generated quizzes by tags/category
  // Use date as seed to select same 5 questions all day
  const seed = this.dateToSeed(date)
  return this.selectQuestionsWithSeed(5, seed)
}
```

2. Update quiz modes to filter pre-generated questions
3. Test with 50-100 quiz questions
4. Scale up to 500+ as needed

## Processing Workflow

### Typical Batch Cycle (1-2 hours):

1. **Select** (2 min): Run script to select 50 questions
2. **Generate** (30-45 min): Use Claude to generate quizzes
   - Copy prompt template
   - Paste batch questions
   - Review Claude's output
   - Make any manual adjustments
3. **Validate** (1 min): Run validation script
4. **Merge** (1 min): Merge into database
5. **Review** (10-15 min): Spot-check sample questions
6. **Deploy** (1 min): Copy to app

**Result**: 50 high-quality quiz questions added to database

### Scale Strategy:

- **Week 1**: Generate 100 questions (2 batches) - Test quality
- **Week 2**: Generate 400 questions (8 batches) - Cover main topics
- **Week 3**: Generate 500 questions (10 batches) - Comprehensive coverage
- **Ongoing**: Generate 100/week until 2000+ questions

## Quality Control

### Manual Review Checklist:
- ✅ Question is clear and unambiguous
- ✅ All 4 options are plausible (no obviously wrong ones)
- ✅ Exactly one correct answer
- ✅ Explanation is accurate and concise
- ✅ Difficulty level appropriate
- ✅ Tags are relevant
- ✅ No typos or formatting issues

### Iterative Improvement:
1. Generate batch
2. Review sample (10-20 questions)
3. Note issues (ambiguous questions, poor options, etc.)
4. Update prompt template
5. Regenerate if needed
6. Repeat

## Maintenance

### Adding New Quizzes:
```bash
# Just run selection again - it automatically skips processed questions
node generate-quiz.js --mode=select --count=100
```

### Updating Existing Quizzes:
1. Edit `quiz-questions.json` directly
2. Find quiz by ID
3. Make changes
4. Re-deploy to app

### Fixing Bad Quizzes:
1. Identify quiz ID
2. Remove from `quiz-questions.json`
3. Remove from `quiz-metadata.json` processedQuestions array
4. Re-run selection to get new question
5. Regenerate

## Statistics

Check current progress:
```bash
cd quiz-generation/scripts
node generate-quiz.js --mode=stats
```

Output:
```
📊 Quiz Generation Statistics

Source Questions:  11289
Processed:         100
Remaining:         11189
Success Rate:      98%

Current Quiz DB:   100 quizzes
Last Updated:      2025-01-06T12:34:56.789Z
```

## Troubleshooting

See `QUICKSTART.md` for common issues and solutions.

## Documentation

- **README.md** (this file) - Overview and architecture
- **QUICKSTART.md** - Step-by-step getting started guide
- **QUIZ_GENERATION_GUIDE.md** - Comprehensive documentation
  - Data structures
  - Quality guidelines
  - Processing strategies
  - Integration details
- **generate-quiz-prompt.md** - Prompt template for LLM generation

## Future Enhancements

- [ ] Web UI for batch review
- [ ] Automated quality scoring
- [ ] Category-specific prompts
- [ ] Multi-language support (Arabic)
- [ ] Community contributions
- [ ] A/B testing for question quality
- [ ] Analytics on question difficulty/accuracy

## Support

Questions or issues? Check the documentation:
1. Start with `QUICKSTART.md`
2. Read `QUIZ_GENERATION_GUIDE.md` for details
3. Review `generate-quiz-prompt.md` for prompt engineering

## License

Part of the BetterIslam Q&A project.
