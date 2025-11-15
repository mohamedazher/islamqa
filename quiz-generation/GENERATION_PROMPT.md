# Quiz Question Generation Prompt

Use this prompt with a faster model (Haiku/GPT-4o-mini) to generate quiz questions.

---

## Task

Generate 300+ high-quality multiple-choice quiz questions from the IslamQA questions database.

## Critical Requirements

### 1. Reference ID Accuracy (MOST IMPORTANT!)

**⚠️ The reference field MUST match the actual question in questions.json**

For each quiz question you generate:
1. ✅ Read the question from `public/data/questions.json`
2. ✅ Use the EXACT `reference` number from that question
3. ✅ Create quiz content based on that question's title/answer
4. ❌ NEVER assign random or incorrect reference numbers

**Example of CORRECT mapping:**
```json
// In questions.json, reference 106815:
{
  "reference": 106815,
  "title": "Can Women Work in Islam?",
  "answer": "...women working is permissible with conditions..."
}

// Quiz question MUST use reference 106815:
{
  "reference": 106815,
  "questionText": "Is women working outside the home permissible in Islam?",
  "explanation": "Women working is permissible if: maintaining hijab..."
}
```

**Example of WRONG (what caused the bug):**
```json
// ❌ WRONG - Reference 366120 is actually about "swallowing saliva"
{
  "reference": 366120,  // ❌ Wrong reference!
  "questionText": "Is women working outside the home permissible?",
  "explanation": "Women working is permissible..."
}
```

### 2. Quiz Question Format

Each quiz question must have:

```json
{
  "id": "quiz-0",
  "questionText": "Clear, concise question based on the IslamQA content",
  "options": [
    {
      "id": "a",
      "text": "Correct answer with Islamic evidence",
      "isCorrect": true
    },
    {
      "id": "b",
      "text": "Plausible but incorrect option",
      "isCorrect": false
    },
    {
      "id": "c",
      "text": "Another plausible but incorrect option",
      "isCorrect": false
    },
    {
      "id": "d",
      "text": "Third plausible but incorrect option",
      "isCorrect": false
    }
  ],
  "explanation": "Clear explanation citing Islamic sources (Quran/Hadith/Scholars) from the answer",
  "tags": ["relevant", "topic", "tags"],
  "difficulty": "easy|medium|hard",
  "reference": 12345,  // ✅ MUST match questions.json reference!
  "source": "IslamQA reference 12345",
  "type": "multiple-choice",
  "category": "category-X",
  "sourceQuestionId": 12345
}
```

### 3. Quality Standards

**Question Text:**
- Clear and unambiguous
- Based on actual IslamQA content
- Appropriate difficulty level
- Tests understanding, not just memorization

**Options:**
- ONE correct answer (isCorrect: true)
- THREE plausible distractors (isCorrect: false)
- All options should be similar length
- Avoid "all of the above" or "none of the above"

**Explanation:**
- Cite Quran/Hadith when mentioned in answer
- Reference scholarly opinions from the answer
- Keep under 200 words
- Be educational, not just correctional

**Difficulty Levels:**
- `easy`: Basic knowledge (40%)
- `medium`: Applied understanding (40%)
- `hard`: Nuanced rulings (20%)

---

## Step-by-Step Process

### Step 1: Select Questions

```bash
cd quiz-generation
node generate-quiz-questions.cjs select --count=100
```

This creates `batches/batch-001-input.json` with 100 question references.

### Step 2: Read the Batch File

```bash
cat batches/batch-001-input.json
```

Example content:
```json
{
  "batchId": "001",
  "questions": [
    {
      "reference": 329,
      "title": "Is Masturbation Haram in Islam?",
      "primary_category": 245
    },
    ...
  ]
}
```

### Step 3: For Each Question

1. **Read the full question** from `public/data/questions.json`:
   ```bash
   grep -A 10 '"reference": 329' public/data/questions.json
   ```

2. **Read the answer** (it's embedded in the same question object):
   ```json
   {
     "reference": 329,
     "title": "Is Masturbation Haram in Islam?",
     "answer": "<div>Full HTML answer with Islamic evidence...</div>",
     "primary_category": 245
   }
   ```

3. **Extract key information:**
   - Main ruling (halal/haram/makruh/permissible with conditions)
   - Evidence cited (Quran verses, Hadith, scholarly opinions)
   - Key conditions or exceptions
   - Common misconceptions

4. **Create quiz question** using the EXACT reference:
   ```json
   {
     "reference": 329,  // ✅ Same reference from questions.json
     "questionText": "What is the Islamic ruling on masturbation?",
     "options": [
       {
         "id": "a",
         "text": "Haram (forbidden) according to majority of scholars",
         "isCorrect": true
       },
       {
         "id": "b",
         "text": "Halal (permissible) without restrictions",
         "isCorrect": false
       },
       {
         "id": "c",
         "text": "Makruh (disliked) but not sinful",
         "isCorrect": false
       },
       {
         "id": "d",
         "text": "Permissible only if married",
         "isCorrect": false
       }
     ],
     "explanation": "Masturbation is haram according to the majority of scholars based on the verse 'And those who guard their private parts' (Quran 23:5-6). The Quran permits sexual relations only with spouses or those whom one's right hand possesses.",
     "difficulty": "easy"
   }
   ```

### Step 4: Validate Each Question

Before adding to output, verify:

✅ `reference` matches the source question
✅ `questionText` relates to the actual question title
✅ `explanation` comes from the actual answer
✅ Exactly ONE `isCorrect: true` option
✅ Three `isCorrect: false` options
✅ All required fields present

### Step 5: Save Output

Create `batches/batch-001-output.json`:

```json
{
  "version": "1.0.0",
  "totalQuizzes": 100,
  "quizzes": [
    {
      "id": "quiz-0",
      "questionText": "...",
      "options": [...],
      "explanation": "...",
      "tags": [...],
      "difficulty": "medium",
      "reference": 329,
      "source": "IslamQA reference 329",
      "type": "multiple-choice",
      "category": "category-X",
      "sourceQuestionId": 329
    },
    // ... 99 more questions
  ]
}
```

### Step 6: Build Consolidated File

```bash
node generate-quiz-questions.cjs build
```

This creates `public/data/quiz-questions.json` ready for the app.

### Step 7: Validate Output

Run this check to verify no mismatches:

```bash
python3 -c "
import json

with open('public/data/quiz-questions.json', 'r') as qz, \
     open('public/data/questions.json', 'r') as qs:
    quiz_data = json.load(qz)
    questions_data = json.load(qs)

    quiz_questions = quiz_data.get('quizzes', [])
    question_refs = {q['reference']: q['title'] for q in questions_data}

    mismatches = 0
    for quiz_q in quiz_questions:
        ref = quiz_q.get('reference')
        quiz_text = quiz_q.get('questionText', '')

        if ref in question_refs:
            actual_title = question_refs[ref]
            # Basic validation: check if question topics align
            quiz_words = set(quiz_text.lower().split())
            title_words = set(actual_title.lower().split())
            overlap = len(quiz_words & title_words) / min(len(quiz_words), len(title_words))

            if overlap < 0.15:
                print(f'⚠️  Ref {ref}:')
                print(f'   Quiz: {quiz_text[:60]}')
                print(f'   Actual: {actual_title[:60]}')
                mismatches += 1

    print(f'\n✅ Total: {len(quiz_questions)}')
    print(f'⚠️  Mismatches: {mismatches}')
    print(f'📊 Accuracy: {((len(quiz_questions) - mismatches) / len(quiz_questions) * 100):.1f}%')
"
```

**Target: 95%+ accuracy**

---

## Batch Strategy

Generate in batches of 100:

1. **Batch 001**: 100 questions → Validate → Commit
2. **Batch 002**: 100 questions → Validate → Commit
3. **Batch 003**: 100 questions → Validate → Commit
4. Continue until you have 300+ questions

After each batch:
```bash
git add quiz-generation/ public/data/quiz-questions.json
git commit -m "Add batch 001: 100 quiz questions (validated)"
git push
```

---

## Common Pitfalls to Avoid

### ❌ Wrong Reference Assignment

```json
// DON'T create quiz question first then assign random reference
{
  "reference": 12345,  // ❌ Random number!
  "questionText": "What is the ruling on X?"
}
```

### ✅ Correct Approach

```json
// DO read question first, then create quiz using its reference
// Step 1: Read from questions.json
{
  "reference": 106815,
  "title": "Can Women Work in Islam?"
}

// Step 2: Create quiz with SAME reference
{
  "reference": 106815,  // ✅ Matches source!
  "questionText": "Is women working outside the home permissible?"
}
```

### ❌ Mismatched Content

```json
// Reference 366120 is about "swallowing saliva"
{
  "reference": 366120,
  "questionText": "Is women working permissible?"  // ❌ Wrong topic!
}
```

### ✅ Matched Content

```json
// Reference 366120 is about "swallowing saliva"
{
  "reference": 366120,
  "questionText": "What is the ruling on swallowing saliva during fasting?"  // ✅ Correct!
}
```

---

## Example: Complete Workflow

```bash
# 1. Select 100 questions
node generate-quiz-questions.cjs select --count=100

# 2. Read the batch
cat batches/batch-001-input.json

# 3. For first question (reference 329):
grep -A 20 '"reference": 329' public/data/questions.json

# 4. Generate quiz question with reference 329
# ... (AI generates quiz question)

# 5. Repeat for all 100 questions

# 6. Save to batches/batch-001-output.json

# 7. Build consolidated file
node generate-quiz-questions.cjs build

# 8. Validate
python3 [validation script above]

# 9. If validation passes (95%+ accuracy), commit
git add -A
git commit -m "Add batch 001: 100 quiz questions (97% accuracy)"
git push
```

---

## Quality Checklist

Before committing each batch:

- [ ] All references match actual questions in questions.json
- [ ] Each quiz question has exactly 4 options
- [ ] Each quiz question has exactly 1 correct answer
- [ ] Explanations cite Islamic sources from the answer
- [ ] Difficulty distribution: ~40% easy, 40% medium, 20% hard
- [ ] Tags are relevant and specific
- [ ] Validation script shows 95%+ accuracy
- [ ] No duplicate references across batches

---

## Target Goals

- **Short-term**: 300 questions (2% of 15,622)
- **Medium-term**: 1,000 questions (6% coverage)
- **Long-term**: 3,000 questions (19% coverage)

---

## Success Metrics

- ✅ **Reference accuracy**: 95%+ match rate
- ✅ **Question quality**: Clear, unambiguous, educational
- ✅ **Option quality**: Plausible distractors, not obvious
- ✅ **Explanation quality**: Cites sources, teaches concept
- ✅ **Difficulty balance**: 40/40/20 split

---

## Final Notes

**Remember:** The biggest mistake in the previous generation was assigning wrong references. Always:

1. Read the question from questions.json FIRST
2. Note its reference number
3. Create quiz content based on that question
4. Use the SAME reference in the quiz question
5. Validate before saving

This ensures the quiz system works correctly and users get accurate content.
