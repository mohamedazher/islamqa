# Batch Quiz Generation Prompt - Content-Specific Options

Use this prompt when generating quiz questions in batches. This prompt emphasizes creating **content-specific options** that test understanding of the actual ruling, not generic templates.

---

## Task

Generate high-quality Islamic quiz questions from the provided batch file, ensuring all options are **content-specific** and test understanding of the actual ruling.

## Input

You will receive a batch input file: `quiz-generation/batches/batch-XXX-input.json`

This file contains 100 questions with:
- `reference` - Unique question ID
- `title` - Question title
- `question` - Full question text (may have HTML)
- `answer` - Full answer text with Islamic ruling (may have HTML)
- `primary_category` - Category ID
- `tags` - Array of tags

## Critical Requirements

### 1. Read BOTH Question and Answer
- **Read the full `answer` field first** to understand the actual ruling
- **Read the `question` field** to understand what's being asked
- Extract the SPECIFIC details of the ruling from the answer

### 2. Create Clear Question Text
- Clarify ambiguous titles using answer context
- Make question self-contained (understandable without seeing original title)
- Example transformation:
  * ❌ Original: "He gave his fiancée money to buy gold as a mahr"
  * ✅ Quiz: "If a man gave his fiancée money to buy gold as mahr, then the engagement was annulled, what should he take back?"

### 3. Create CONTENT-SPECIFIC Options (MOST IMPORTANT!)

**⚠️ THIS IS THE #1 PROBLEM TO FIX - 66% of options were generic templates!**

#### ❌ WRONG APPROACH - Generic Templates

**DO NOT** use generic ruling categories as options:

```json
{
  "questionText": "What is the ruling on returning mahr after engagement annulment?",
  "options": [
    {"id": "a", "text": "It is permissible (halal) in Islam", "isCorrect": false},
    {"id": "b", "text": "It is forbidden (haram) in Islam", "isCorrect": false},
    {"id": "c", "text": "It is obligatory (fard) upon all Muslims", "isCorrect": false},
    {"id": "d", "text": "It depends on circumstances", "isCorrect": true}
  ]
}
```

**Why this is WRONG**:
- Doesn't test if user understood the SPECIFIC ruling
- Options are generic Islamic law categories
- Could apply to ANY question
- User can't learn the actual ruling from these options

#### ✅ CORRECT APPROACH - Content-Specific Options

**DO** extract specific details from the answer:

```json
{
  "questionText": "If a man gave his fiancée money to buy gold as mahr, then the engagement was annulled before the marriage contract, what should he take back?",
  "options": [
    {"id": "a", "text": "The gold that was purchased with his money", "isCorrect": true},
    {"id": "b", "text": "The original cash amount he gave", "isCorrect": false},
    {"id": "c", "text": "Nothing, because engagement gifts cannot be returned", "isCorrect": false},
    {"id": "d", "text": "The current market value of the gold in cash", "isCorrect": false}
  ]
}
```

**Why this is CORRECT**:
- Tests understanding of the SPECIFIC ruling about mahr delegation
- Options are derived from the answer content
- User must understand the ruling to answer correctly
- Wrong options are plausible based on common misconceptions

### 4. How to Generate Content-Specific Options

**Step-by-step process**:

1. **Read the full answer** (strip HTML if needed)
2. **Identify the main ruling** or conclusion
3. **Extract specific details**:
   - What exactly does the ruling say?
   - Are there conditions mentioned?
   - Are there exceptions or edge cases?
   - What did scholars say specifically?
4. **Create correct option** using the exact ruling details
5. **Create 3 wrong options** by:
   - Using alternative interpretations mentioned in answer
   - Using common misconceptions addressed in answer
   - Using related but incorrect scenarios
   - Using conditions that don't apply

**Example Process**:

**Answer text**: "The suitor has the right to take back the mahr in full because the woman does not become entitled to anything of the mahr except when the marriage contract is done. Since the mahr was gold and he delegated them to buy it, he should take the gold itself that was purchased."

**Extracted details**:
- ✓ Suitor can take back mahr if no contract
- ✓ Since mahr was gold (delegation), take back the gold
- ✗ Not the cash (it was delegated)
- ✗ Not nothing (engagement ≠ marriage contract)

**Generated options**:
- a) The gold that was purchased ✓ (correct - matches delegation ruling)
- b) The original cash amount (wrong - delegation means he gets what was bought)
- c) Nothing, gift cannot be returned (wrong - mahr ≠ gift without contract)
- d) Current market value in cash (wrong - specific item purchased, not value)

## Examples

### Example 1: Marriage/Family Question

**Input**:
```json
{
  "reference": 12345,
  "title": "Can he marry her if she doesn't pray?",
  "answer": "It is not permissible for a Muslim to marry a woman who does not pray, because the one who does not pray is a kaafir according to the more correct of the two scholarly opinions..."
}
```

❌ **WRONG - Generic options**:
```json
{
  "questionText": "Is it permissible to marry a woman who doesn't pray?",
  "options": [
    {"id": "a", "text": "It is forbidden (haram)", "isCorrect": true},
    {"id": "b", "text": "It is permissible (halal)", "isCorrect": false},
    {"id": "c", "text": "It is makruh (disliked)", "isCorrect": false},
    {"id": "d", "text": "It depends on circumstances", "isCorrect": false}
  ]
}
```

✅ **CORRECT - Content-specific options**:
```json
{
  "questionText": "Can a Muslim man marry a woman who does not pray?",
  "options": [
    {"id": "a", "text": "No, because one who does not pray is considered a disbeliever according to the stronger scholarly opinion", "isCorrect": true},
    {"id": "b", "text": "Yes, if he can convince her to start praying after marriage", "isCorrect": false},
    {"id": "c", "text": "Yes, but it is disliked unless she has a valid excuse", "isCorrect": false},
    {"id": "d", "text": "Yes, if she prays occasionally even if not regularly", "isCorrect": false}
  ]
}
```

### Example 2: Fasting Question

**Input**:
```json
{
  "reference": 67890,
  "title": "Sick person and fasting",
  "answer": "If a trustworthy Muslim doctor says that fasting will cause harm or delay recovery, the sick person should not fast. Allah says: 'whoever is sick... should fast an equal number of other days.' The Prophet said: 'Allah loves for His concession to be used.'"
}
```

❌ **WRONG - Generic options**:
```json
{
  "questionText": "Should a sick person fast in Ramadan?",
  "options": [
    {"id": "a", "text": "It depends on circumstances", "isCorrect": true},
    {"id": "b", "text": "It is always obligatory", "isCorrect": false},
    {"id": "c", "text": "It is always forbidden", "isCorrect": false},
    {"id": "d", "text": "It is recommended", "isCorrect": false}
  ]
}
```

✅ **CORRECT - Content-specific options**:
```json
{
  "questionText": "If a trustworthy Muslim doctor advises that fasting will cause harm or delay recovery, what should the sick person do?",
  "options": [
    {"id": "a", "text": "Accept Allah's concession and not fast, fasting an equal number of days later", "isCorrect": true},
    {"id": "b", "text": "Fast anyway to show strong faith, as the reward is greater when fasting is difficult", "isCorrect": false},
    {"id": "c", "text": "Fast but only until noon, then break the fast", "isCorrect": false},
    {"id": "d", "text": "Not fast but pay fidyah (feeding the poor) instead of making up the days", "isCorrect": false}
  ]
}
```

## Output Format

Save your output to: `quiz-generation/batches/batch-XXX-output.json`

```json
{
  "quizQuestions": [
    {
      "reference": 12345,
      "questionText": "Clear, self-contained question with answer context",
      "type": "multiple-choice",
      "difficulty": "easy|medium|hard",
      "options": [
        {"id": "a", "text": "Content-specific option from answer", "isCorrect": true},
        {"id": "b", "text": "Plausible wrong option from answer", "isCorrect": false},
        {"id": "c", "text": "Another specific wrong option", "isCorrect": false},
        {"id": "d", "text": "Third specific wrong option", "isCorrect": false}
      ],
      "explanation": "2-3 sentences from the answer citing sources",
      "tags": ["tag1", "tag2", "tag3", "tag4"],
      "source": "IslamQA reference 12345"
    }
    // ... 99 more questions
  ]
}
```

## Validation Checklist

Before saving, verify EACH question:

- ✅ Reference ID matches input exactly
- ✅ Question text is clear and self-contained
- ✅ **ALL 4 options are content-specific** (NOT generic templates!)
- ✅ Options test understanding of THIS SPECIFIC ruling
- ✅ Correct option derives from answer text
- ✅ Wrong options are plausible misconceptions from answer
- ✅ Exactly 1 correct answer
- ✅ Explanation cites Islamic sources from answer
- ✅ No HTML tags in output

## Common Mistakes to Avoid

1. ❌ Using "permissible/forbidden/obligatory" as the only differentiator
2. ❌ Options that could apply to any question
3. ❌ Not reading the full answer before creating options
4. ❌ Options that don't relate to the specific ruling
5. ❌ Generic "it depends" without specifying what it depends on

## Success Criteria

✅ **Good quiz question**:
- User must understand the SPECIFIC ruling to answer
- Options teach about the ruling even when wrong
- Tests knowledge, not just guessing halal/haram

❌ **Bad quiz question**:
- User can guess without understanding the ruling
- Options are interchangeable with any question
- Only tests generic Islamic law categories

---

## For Parallel Generation

When generating multiple batches in parallel:

1. Each batch should be independent (100 questions each)
2. Use same quality standards for all batches
3. Verify content-specific options in ALL batches before saving
4. Save each batch to: `batch-XXX-output.json`

Remember: **Content-specific options are the #1 priority!**
