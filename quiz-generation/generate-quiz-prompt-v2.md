# Quiz Enhancement Generation Prompt - V2.0

## Context

You are generating high-quality quiz enhancements for an Islamic Q&A mobile app. The app now uses a **semantic reference ID database** where:

- Each question has a unique `reference` ID (e.g., 106245)
- Questions contain full text: `question` (main text), `title` (short form), `answer` (explanation)
- These semantic IDs link the entire system (bookmarks, search, categories, etc.)

Your task is to convert database questions into **professional multiple-choice quiz items** with:
- 4 well-crafted options (not just True/False)
- Clear, unambiguous correct answers
- Concise explanations
- Appropriate difficulty levels
- Relevant tags for searchability

## Input Format

You will receive a batch of questions in this format:

```json
{
  "batchId": "batch-1234567890",
  "sourceQuestions": [
    {
      "reference": 106245,
      "title": "Is it permissible to repurchase a gift they previously gave?",
      "question": "I want to know the Islamic ruling on whether someone can repurchase a gift they previously gave to another person...",
      "answer": "<p>The Prophet (peace and blessings of Allah be upon him) forbade taking back a gift, comparing one who does so to a dog returning to its own vomit...</p>",
      "primary_category": 145,
      "tags": ["gifts", "transactions", "haram"]
    }
  ]
}
```

## Output Format

Generate enhancements in this **exact** JSON structure:

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
          "text": "It is forbidden (haram) based on a hadith comparing it to a dog returning to its own vomit",
          "isCorrect": true
        },
        {
          "id": "b",
          "text": "It is permissible if the original owner agrees to sell it back",
          "isCorrect": false
        },
        {
          "id": "c",
          "text": "It is permissible if purchased at the current market price",
          "isCorrect": false
        },
        {
          "id": "d",
          "text": "It is only forbidden if done within the first year",
          "isCorrect": false
        }
      ],
      "explanation": "The Prophet (peace and blessings of Allah be upon him) explicitly forbade repurchasing gifts, comparing the one who does so to a dog returning to its own vomit. This ruling applies regardless of circumstances or timeframe.",
      "tags": ["gifts", "transactions", "haram", "prophet-tradition"],
      "source": "IslamQA question 106245"
    }
  ],
  "metadata": {
    "batchId": "batch-1234567890",
    "processedCount": 50,
    "generatedDate": "2025-01-XX",
    "notes": "Any issues or special handling notes"
  }
}
```

## Generation Rules

### 1. Reference ID (CRITICAL)
- **MUST match the input** `reference` field exactly
- This is how the enhancement links to the database question
- Example: input `"reference": 106245` → output `"reference": 106245`

### 2. Question Text
- Extract from `title` (if clear and concise)
- Or synthesize from `question` field
- 1-2 sentences maximum
- Make it a clear quiz question
- Examples:
  - ❌ "Tell me about the Islamic ruling on..."
  - ✅ "What is the ruling on...?"
  - ✅ "Is it permissible to...?"

### 3. Multiple Choice Options
- Provide **exactly 4 options** (a, b, c, d)
- **One correct** marked with `isCorrect: true`
- **Three plausible wrong answers** (not obviously incorrect)
- Options should be roughly similar length
- Avoid "All of the above" or "None of the above" unless necessary

### 4. Option Quality (Important)
- Correct option should be derivable from the answer text
- Wrong options should be:
  - Opposite rulings (if applicable)
  - Related misconceptions
  - Common mistakes
  - Alternative scholarly views (if mentioned)
- All options must be grammatically correct
- No typos or formatting issues

### 5. Difficulty Levels

**Easy (35% of questions)**:
- Basic Islamic knowledge
- Core beliefs, 5 pillars
- Common worship practices
- Well-known rulings
- Most Muslims should know these

**Medium (45% of questions)**:
- Common fiqh rulings
- Detailed procedures
- Social/family rulings
- Everyday Islamic knowledge
- Educated Muslims should know

**Hard (20% of questions)**:
- Nuanced scholarly differences
- Complex fiqh issues
- Edge cases
- Advanced theological concepts
- Requires deeper study

### 6. Explanation
- 2-3 sentences maximum
- Summarize the key ruling from the source answer
- Include important nuances if applicable
- Mention scholarly consensus when relevant
- Avoid copying answer verbatim - synthesize
- Format: Clear, concise, authoritative

### 7. Tags
Add 4-6 relevant tags from:
- **Topics**: prayer, fasting, zakat, hajj, marriage, family, business, transactions, etc.
- **Rulings**: halal, haram, fard (obligatory), sunnah, makruh (disliked), mubah (permissible)
- **Categories**: worship, creed, family, transactions, social, miscellaneous
- **Scholarly terms**: ijma (consensus), ijtihad, madhab, hadith, sunnah-tradition
- **Concepts**: women's rights, children, contracts, charity, etc.

### 8. Difficulty Assignment Strategy

**When to mark as Easy:**
- Clear, straightforward rulings
- Widely known practices
- No scholarly disagreement mentioned
- Practical everyday issues

**When to mark as Medium:**
- Some complexity in conditions
- Multiple aspects to consider
- Requires knowledge of Islamic principles
- Mix of common and less common rulings

**When to mark as Hard:**
- Scholarly differences explicitly mentioned
- Complex conditions and exceptions
- Requires understanding of Islamic legal theory
- Philosophical or nuanced interpretation

## Question Types to Generate

### Type 1: Ruling Questions (60% - Most Common)
```
Question: "What is the ruling on [action/thing]?"
Options:
  - Haram/Forbidden
  - Halal/Permissible
  - Makruh/Disliked
  - Fard/Obligatory
```

### Type 2: Concept/Definition Questions (15%)
```
Question: "What does [Islamic term] mean?"
Options: 4 different definitions
```

### Type 3: Procedure Questions (15%)
```
Question: "What is the correct way to [perform act of worship]?"
Options: 4 different procedures
```

### Type 4: Condition Questions (10%)
```
Question: "What [action] the validity of [act of worship]?"
Options: 4 different conditions
```

## Processing Checklist

For each source question, verify:

- ✅ Reference ID matches input exactly
- ✅ Question is clear and unambiguous
- ✅ 4 options provided (all labeled a-d)
- ✅ Exactly one correct option
- ✅ Wrong options are plausible
- ✅ Explanation is concise (2-3 sentences)
- ✅ Difficulty assigned appropriately
- ✅ 4-6 relevant tags included
- ✅ Source field notes the question reference
- ✅ No HTML tags in output (clean text)

## Special Handling

### Controversial Topics
If the answer mentions scholarly disagreement:
- Note the **majority view** as correct
- Mention the **minority view** in explanation
- Tag with "scholarly-difference"
- Consider difficulty: hard

### Multiple Rulings in One Answer
If one answer covers multiple rulings:
- **Generate one quiz question per major ruling**
- Focus on the primary/most important ruling
- Can generate 2-3 questions from complex answers

### Technical Islamic Terms
- Keep Arabic terms in parentheses: "obligatory (fard)"
- Define briefly if needed: "haram (forbidden)"
- Use English in options when possible
- Explain in tags if very specialized

### HTML in Answers
- Strip all HTML tags before reading
- Convert to plain text
- Preserve meaning and structure
- Example: `<p>Text</p>` → `Text`

## Example Workflow

### Input:
```json
{
  "reference": 106245,
  "title": "Ruling on repurchasing a gift",
  "question": "What is the Islamic ruling on someone repurchasing a gift they previously gave?",
  "answer": "<p>The Prophet forbade this, comparing it to a dog returning to its own vomit...</p>",
  "primary_category": 145,
  "tags": ["gifts", "transactions"]
}
```

### Output:
```json
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
  "explanation": "The Prophet (peace be upon him) explicitly forbade someone from repurchasing a gift they had given, comparing such a person to a dog returning to its own vomit. This hadith establishes the prohibition clearly.",
  "tags": ["gifts", "transactions", "haram", "hadith"],
  "source": "IslamQA reference 106245"
}
```

## Skip Criteria

Skip generating quiz for questions that:
- ❌ Have no clear ruling (purely informational/background)
- ❌ Are extremely specific to individuals/dates
- ❌ Have contradictory information with no resolution
- ❌ Are too complex to simplify to multiple choice
- ❌ Contain inappropriate content for quiz format
- ❌ Are incomplete or unclear

If skipping, note in `metadata.notes` field.

## Important Notes

### For Database Integration:
- **Reference ID must match exactly** - this is the foreign key to the question
- Output can be directly imported into `quiz_enhancements` table
- Each enhancement supplements a question in the database
- Non-enhanced questions will use dynamic generation as fallback

### Quality Matters:
- These enhancements will be used by thousands of users
- Take time to create quality options
- Test questions mentally - can they be answered from the answer text?
- Invalid JSON will fail merge

### Generation Tips:
- Read the full answer before creating options
- Generate 4 plausible options from the answer content
- Make options distinct but all reasonable
- Balance difficulty across the batch
- Vary question types (not all "What is the ruling on...")

## Batch Processing

When I provide source questions:

1. **Process each question** independently
2. **Generate 1 enhancement per source** (unless very long answer → 2-3)
3. **Maintain diversity** in question types
4. **Balance difficulty** (35% easy, 45% medium, 20% hard)
5. **Note any skipped** questions in metadata
6. **Output valid JSON** ready for merge

---

## Ready to Generate

Please generate enhancements for the source questions below.

Remember:
- ✅ Match reference IDs exactly
- ✅ Create 4 professional multiple-choice options
- ✅ Clear, unambiguous correct answers
- ✅ 2-3 sentence explanations
- ✅ Valid JSON output

---

## Source Questions to Process:

[PASTE SOURCE QUESTIONS BATCH HERE]
