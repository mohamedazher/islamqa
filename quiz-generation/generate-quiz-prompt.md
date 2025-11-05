# Quiz Question Generation Prompt

## Context

You are generating high-quality quiz questions for an Islamic Q&A mobile app. The app contains 8000+ questions and answers from IslamQA.com covering all aspects of Islamic knowledge.

Your task is to convert long-form Q&A content into short, clear quiz questions with multiple choice options.

## Input Format

I will provide you with a list of source questions and their answers in JSON format:

```json
{
  "sourceQuestions": [
    {
      "id": 12345,
      "question": "What is the ruling on listening to music?",
      "question_full": "I want to know the Islamic ruling on listening to music and songs.",
      "question_no": 5011,
      "category_id": 218,
      "answers": "<p>Praise be to Allah...</p><p>The majority of scholars are of the view that listening to music is haram...</p>"
    }
  ]
}
```

## Output Format

Generate quiz questions in this exact JSON structure:

```json
{
  "generatedQuizzes": [
    {
      "id": "quiz-001",
      "sourceQuestionId": 12345,
      "questionText": "What is the Islamic ruling on listening to music according to the majority of scholars?",
      "type": "multiple-choice",
      "difficulty": "medium",
      "category": "Halal & Haram",
      "options": [
        {
          "id": "a",
          "text": "It is haram (forbidden)",
          "isCorrect": true
        },
        {
          "id": "b",
          "text": "It is halal (permissible)",
          "isCorrect": false
        },
        {
          "id": "c",
          "text": "It is makruh (disliked)",
          "isCorrect": false
        },
        {
          "id": "d",
          "text": "There is no clear ruling",
          "isCorrect": false
        }
      ],
      "explanation": "According to the majority of classical scholars, listening to music is considered haram based on various hadiths. The minority view permits certain types of Islamic songs without instruments.",
      "sourceReference": {
        "questionId": 12345,
        "questionNo": 5011,
        "questionTitle": "Ruling on music"
      },
      "points": 10,
      "tags": ["music", "haram", "entertainment", "ruling"]
    }
  ],
  "metadata": {
    "batchId": "batch-001",
    "processedCount": 50,
    "generatedDate": "2025-01-06",
    "processingNotes": "Any issues or notes about specific questions"
  }
}
```

## Generation Rules

### 1. Question Quality
- **Clear and Concise**: Question should be 1-2 sentences max
- **Unambiguous**: Should have one definitively correct answer
- **Educational**: Should teach something valuable
- **Based on Answer**: Extract key ruling/concept from the answer text
- **Strip HTML**: Remove all HTML tags from answer text before processing

### 2. Options (Multiple Choice)
- Provide exactly **4 options** labeled a, b, c, d
- **One correct option** marked with `isCorrect: true`
- **Three plausible wrong options** (not obviously incorrect)
- Options should be similar length
- Avoid options like "All of the above" or "None of the above" unless appropriate

### 3. Difficulty Levels
Assign based on content complexity:

**Easy (40% of questions)**:
- Basic Islamic knowledge
- 5 pillars, basic halal/haram
- Common worship practices
- Questions most Muslims would know

**Medium (40% of questions)**:
- Common fiqh rulings
- Detailed worship procedures
- Social/family Islamic rulings
- Questions educated Muslims should know

**Hard (20% of questions)**:
- Nuanced scholarly differences
- Complex fiqh issues
- Advanced theological concepts
- Edge cases and exceptions

### 4. Explanation
- **2-3 sentences max**
- Summarize the key ruling/concept
- Mention scholarly consensus when relevant
- Include important nuances if applicable
- Reference source answer but don't copy verbatim

### 5. Tags
Add 3-5 relevant tags for searchability:
- Topic keywords (prayer, fasting, zakat, etc.)
- Ruling type (halal, haram, fard, sunnah, etc.)
- Category (worship, transactions, family, etc.)

### 6. Categories
Map to these main categories:
- Basic Tenets of Faith
- Islamic Jurisprudence
- Halal & Haram
- Prayer
- Fasting
- Zakat & Charity
- Hajj & Umrah
- Family & Marriage
- Business & Transactions
- Social Interactions
- Other

## Question Types to Generate

### Type 1: Ruling Questions (Most Common)
```
Q: What is the ruling on [action]?
Options: Haram, Halal, Makruh, Neutral
```

### Type 2: Concept Questions
```
Q: What is the definition of [Islamic term]?
Options: 4 different definitions
```

### Type 3: Procedure Questions
```
Q: What is the correct way to perform [act of worship]?
Options: 4 different procedures
```

### Type 4: Condition Questions
```
Q: What breaks [act of worship]?
Options: 4 different things
```

### Type 5: True/False Conversions
For clear yes/no answers, use true/false format:
```json
{
  "type": "true-false",
  "questionText": "Is Zakat obligatory on all Muslims?",
  "options": [
    {"id": "a", "text": "True", "isCorrect": true},
    {"id": "b", "text": "False", "isCorrect": false}
  ]
}
```

## Special Handling

### Controversial Topics
If source answer mentions scholarly disagreement:
- Note the majority view as correct
- Mention minority view in explanation
- Tag as "scholarly-difference"
- Consider difficulty: hard

### Lengthy Answers
For answers > 500 words:
- Extract the main ruling/conclusion
- Focus on the core concept
- Don't try to cover everything
- Multiple questions can be generated from one source

### Technical Terms
- Keep Arabic terms in parentheses: "obligatory (fard)"
- Define briefly in explanation if needed
- Use English for options when possible

## Processing Checklist

For each source question, verify:
- ✅ Extracted clear ruling from answer
- ✅ Question is unambiguous
- ✅ 4 options provided (or 2 for true/false)
- ✅ Only one correct option
- ✅ Wrong options are plausible
- ✅ Explanation is concise
- ✅ Difficulty assigned appropriately
- ✅ Category mapped correctly
- ✅ Tags are relevant
- ✅ Source reference included

## Skip Criteria

Skip generating quiz for source questions that:
- ❌ Have no clear ruling (purely informational)
- ❌ Are about specific people/dates (too specific)
- ❌ Have controversial answers with no clear majority
- ❌ Are too complex to simplify to multiple choice
- ❌ Contain inappropriate content for quiz format

If skipping, note in `processingNotes` field.

## Example Workflow

**Input:**
```json
{
  "id": 5011,
  "question": "Ruling on music",
  "answers": "<p>Music is haram according to majority of scholars based on authentic hadiths. However, some scholars permit Islamic nasheeds without instruments.</p>"
}
```

**Output:**
```json
{
  "id": "quiz-5011",
  "questionText": "What is the ruling on listening to music according to the majority of scholars?",
  "type": "multiple-choice",
  "difficulty": "medium",
  "options": [
    {"id": "a", "text": "It is haram (forbidden)", "isCorrect": true},
    {"id": "b", "text": "It is halal without restrictions", "isCorrect": false},
    {"id": "c", "text": "It is makruh (disliked)", "isCorrect": false},
    {"id": "d", "text": "It is permissible with conditions", "isCorrect": false}
  ],
  "explanation": "The majority of scholars rule music as haram based on authentic hadiths. A minority permits Islamic nasheeds without musical instruments.",
  "tags": ["music", "haram", "entertainment", "scholarly-difference"]
}
```

## Batch Processing Instructions

When I provide you with source questions:

1. **Analyze each question and answer**
2. **Generate 1 quiz question per source** (unless answer is very long, then 2-3)
3. **Maintain diversity** in question types
4. **Balance difficulty** across the batch
5. **Note any skipped questions** in metadata
6. **Output valid JSON** ready to merge

## Ready to Generate

I will now provide you with the source questions. Please generate quiz questions following the format and rules above.

---

## Source Questions to Process:

[PASTE SOURCE QUESTIONS JSON HERE]
