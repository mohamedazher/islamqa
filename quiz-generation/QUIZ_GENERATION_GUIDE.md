# Quiz Generation Guide

## Overview

This system generates high-quality quiz questions from the 8000+ Islamic Q&A database using LLMs (Claude). Questions are pre-generated offline and bundled with the app.

## Directory Structure

```
quiz-generation/
├── QUIZ_GENERATION_GUIDE.md        # This file
├── generate-quiz-prompt.md         # Prompt template for Claude
├── quiz-questions.json              # Generated quiz questions (bundle with app)
├── quiz-metadata.json               # Tracks which source questions processed
└── scripts/
    └── generate-quiz.js             # Node script to batch process
```

## Data Structure

### quiz-questions.json
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-06",
  "totalQuizzes": 100,
  "quizzes": [
    {
      "id": "quiz-001",
      "sourceQuestionId": 12345,
      "questionText": "What is the Islamic ruling on listening to music?",
      "type": "multiple-choice",
      "difficulty": "medium",
      "category": "Halal & Haram",
      "options": [
        {
          "id": "a",
          "text": "It is haram according to the majority of scholars",
          "isCorrect": true
        },
        {
          "id": "b",
          "text": "It is halal without restrictions",
          "isCorrect": false
        },
        {
          "id": "c",
          "text": "It is makruh (disliked)",
          "isCorrect": false
        },
        {
          "id": "d",
          "text": "There is no ruling on this matter",
          "isCorrect": false
        }
      ],
      "explanation": "According to the majority of classical scholars, listening to music is considered haram due to various hadiths and scholarly consensus. However, some scholars permit certain types of Islamic songs without instruments.",
      "sourceReference": {
        "questionId": 12345,
        "questionNo": 5011,
        "questionTitle": "Ruling on music",
        "categoryId": 218
      },
      "points": 10,
      "tags": ["music", "haram", "entertainment"]
    }
  ]
}
```

### quiz-metadata.json
```json
{
  "version": "1.0.0",
  "lastProcessed": "2025-01-06T10:30:00Z",
  "totalSourceQuestions": 8000,
  "processedQuestions": [
    {
      "questionId": 12345,
      "processedDate": "2025-01-06",
      "quizId": "quiz-001",
      "status": "completed"
    }
  ],
  "processingStats": {
    "totalProcessed": 100,
    "successful": 98,
    "failed": 2,
    "remaining": 7900
  }
}
```

## Quiz Generation Workflow

### Step 1: Select Source Questions
```bash
# Run script to select 100 random unprocessed questions
node scripts/generate-quiz.js --mode=select --count=100
```

This creates `batch-001.json` with 100 source questions.

### Step 2: Generate Quiz Questions with Claude

Use the prompt template in `generate-quiz-prompt.md`:

1. Copy source questions from batch file
2. Paste into Claude with the generation prompt
3. Claude outputs quiz questions in JSON format
4. Save output to `quiz-questions.json`

### Step 3: Validate & Merge

```bash
# Validate generated quizzes
node scripts/generate-quiz.js --mode=validate --input=batch-001-output.json

# Merge into main quiz database
node scripts/generate-quiz.js --mode=merge --input=batch-001-output.json
```

### Step 4: Bundle with App

The `quiz-questions.json` file is copied to:
```
public/data/quiz-questions.json
```

Then loaded by the app at runtime.

## Quiz Question Requirements

### Good Quiz Questions:
✅ Clear and unambiguous
✅ Based on scholarly consensus (when applicable)
✅ Has 4 plausible options (not obviously wrong)
✅ Explanation references the source answer
✅ Appropriate difficulty level
✅ Tags for categorization

### Bad Quiz Questions:
❌ Controversial topics with no clear answer
❌ Overly specific details (names, dates) unless important
❌ Trick questions
❌ Options that are too similar

## Quiz Types

### 1. Multiple Choice (Primary)
- 4 options (A, B, C, D)
- 1 correct answer
- Good for rulings and concepts

### 2. True/False (Secondary)
- 2 options
- Good for clear yes/no rulings
- Simpler questions

### 3. Fill-in-the-Blank (Future)
- Complete a statement
- Good for memorization

## Difficulty Levels

- **Easy**: Basic Islamic knowledge (5 pillars, halal/haram basics)
- **Medium**: Common rulings and practices
- **Hard**: Detailed fiqh, scholarly differences, nuanced rulings

## Categories

Map to existing app categories:
- Basic Tenets of Faith
- Islamic Jurisprudence
- Halal & Haram
- Prayer
- Fasting
- Zakat
- Hajj & Umrah
- etc.

## Processing Strategy

### Phase 1: Initial 100 Questions
- Select diverse categories (10-15 per category)
- Mix difficulty levels (40% easy, 40% medium, 20% hard)
- Focus on popular/frequently asked questions

### Phase 2: Expand to 500
- Add more questions per category
- Cover more topics
- Include edge cases

### Phase 3: Full Coverage (2000+)
- Comprehensive coverage
- Multiple questions per source Q&A
- Advanced topics

## Tracking System

### quiz-metadata.json Fields:

**processedQuestions Array:**
- `questionId`: Original question ID from database
- `processedDate`: When it was processed
- `quizId`: Generated quiz question ID
- `status`: completed | failed | skipped

**Skip Criteria:**
- Questions already processed
- Questions too short (< 50 chars)
- Questions marked as "not suitable" (controversial, too specific)

## Manual Generation Steps

### Using Claude Code:

1. **Select Questions**:
```bash
# In terminal
node quiz-generation/scripts/generate-quiz.js --mode=select --count=50
```

2. **Copy to Claude**:
- Open `batch-xxx.json`
- Copy questions array
- Use prompt from `generate-quiz-prompt.md`

3. **Process Output**:
```bash
# Save Claude's output to batch-xxx-output.json
node quiz-generation/scripts/generate-quiz.js --mode=merge --input=batch-xxx-output.json
```

4. **Deploy**:
```bash
# Copy to app
cp quiz-generation/quiz-questions.json public/data/quiz-questions.json
```

## Integration with App

### Load Quiz Data:

```javascript
// In quizService.js
async loadQuizQuestions() {
  const response = await fetch('/data/quiz-questions.json')
  const data = await response.json()
  this.quizQuestions = data.quizzes
}

generateQuiz(options) {
  // Filter pre-generated quizzes instead of generating on-the-fly
  let filtered = this.quizQuestions

  if (options.categoryId) {
    filtered = filtered.filter(q => q.category === options.categoryId)
  }

  if (options.difficulty) {
    filtered = filtered.filter(q => q.difficulty === options.difficulty)
  }

  // Shuffle and return
  return this.shuffleArray(filtered).slice(0, options.count)
}
```

## Benefits of This Approach

1. **Quality**: Human-reviewed (via Claude) questions
2. **Performance**: No on-the-fly generation
3. **Consistency**: Same questions for all users (daily quiz)
4. **Scalability**: Generate in batches offline
5. **Maintainability**: Easy to update/fix specific questions
6. **Tracking**: Know which source questions are covered

## Next Steps

1. Create `generate-quiz-prompt.md` (detailed prompt for Claude)
2. Create `scripts/generate-quiz.js` (selection & merging script)
3. Initialize empty `quiz-questions.json` and `quiz-metadata.json`
4. Run first batch (100 questions)
5. Update `quizService.js` to load from JSON instead of generating
6. Test quiz modes with real data
