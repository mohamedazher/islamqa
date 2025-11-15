#!/usr/bin/env python3
"""
Generate Quiz Questions for Batch 001 using AI

This script generates 100 quiz questions based on the questions in batch-001-input.json.
It uses the Anthropic API to create high-quality quiz questions while ensuring
that each quiz question uses the EXACT reference from the source question.

CRITICAL: Each quiz question MUST use the exact reference from questions.json
"""

import json
import os
import re
import anthropic
from pathlib import Path

# Configuration
BATCH_INPUT_FILE = "batches/batch-001-input.json"
BATCH_OUTPUT_FILE = "batches/batch-001-output.json"
MODEL = "claude-3-5-sonnet-20241022"  # Fast, accurate model

def clean_html(html_text):
    """Remove HTML tags and clean text"""
    if not html_text:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', html_text)
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text)
    # Decode HTML entities
    text = text.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&amp;', '&')
    return text.strip()

def generate_quiz_question(client, question_data, index):
    """
    Generate a single quiz question using Claude

    Args:
        client: Anthropic client
        question_data: Question data from batch input
        index: Question index (0-99)

    Returns:
        dict: Quiz question object
    """
    reference = question_data['reference']
    title = question_data['title']
    question_text = clean_html(question_data.get('question', ''))
    answer_text = clean_html(question_data.get('answer', ''))
    tags = question_data.get('tags', [])
    primary_category = question_data.get('primary_category')

    # Create prompt for Claude
    prompt = f"""You are generating a high-quality Islamic quiz question based on content from IslamQA.info.

**CRITICAL REQUIREMENT:**
- The quiz question MUST use reference number: {reference}
- This reference is from the actual IslamQA question and MUST NOT be changed

**Source Question (Reference {reference}):**
Title: {title}

Question: {question_text[:500]}...

Answer: {answer_text[:2000]}...

**Your Task:**
Generate a multiple-choice quiz question with:

1. **questionText**: A clear, concise question based on the main ruling/topic
2. **options**: Exactly 4 options (a, b, c, d)
   - ONE correct answer (isCorrect: true)
   - THREE plausible but incorrect distractors (isCorrect: false)
3. **explanation**: 2-3 sentences citing Quran/Hadith/scholars from the answer
4. **difficulty**: "easy" (basic ruling), "medium" (applied understanding), or "hard" (nuanced/conditions)
5. **reference**: MUST be {reference} (the source question reference)

**Output Format (JSON only, no markdown):**
{{
  "questionText": "Clear question here",
  "options": [
    {{"id": "a", "text": "Correct answer", "isCorrect": true}},
    {{"id": "b", "text": "Plausible wrong answer", "isCorrect": false}},
    {{"id": "c", "text": "Plausible wrong answer", "isCorrect": false}},
    {{"id": "d", "text": "Plausible wrong answer", "isCorrect": false}}
  ],
  "explanation": "Brief explanation citing sources",
  "difficulty": "easy|medium|hard"
}}

Generate the quiz question now (JSON only):"""

    try:
        # Call Claude API
        response = client.messages.create(
            model=MODEL,
            max_tokens=1500,
            temperature=0.7,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        # Extract JSON from response
        content = response.content[0].text.strip()

        # Remove markdown code blocks if present
        content = re.sub(r'```json\s*', '', content)
        content = re.sub(r'```\s*', '', content)
        content = content.strip()

        # Parse JSON
        quiz_data = json.loads(content)

        # Construct complete quiz object
        quiz = {
            "id": f"quiz-{index}",
            "questionText": quiz_data['questionText'],
            "options": quiz_data['options'],
            "explanation": quiz_data['explanation'],
            "tags": tags,
            "difficulty": quiz_data['difficulty'],
            "reference": reference,  # CRITICAL: Use exact reference from source
            "source": f"IslamQA reference {reference}",
            "type": "multiple-choice",
            "category": f"category-{primary_category}",
            "sourceQuestionId": reference
        }

        # Validate
        assert len(quiz['options']) == 4, "Must have exactly 4 options"
        assert sum(1 for opt in quiz['options'] if opt['isCorrect']) == 1, "Must have exactly 1 correct answer"
        assert quiz['reference'] == reference, f"Reference mismatch! Expected {reference}, got {quiz['reference']}"

        return quiz

    except Exception as e:
        print(f"❌ Error generating quiz for reference {reference}: {str(e)}")
        # Return placeholder on error
        return {
            "id": f"quiz-{index}",
            "questionText": f"ERROR: {title}",
            "options": [
                {"id": "a", "text": "ERROR - needs manual review", "isCorrect": true},
                {"id": "b", "text": "ERROR", "isCorrect": false},
                {"id": "c", "text": "ERROR", "isCorrect": false},
                {"id": "d", "text": "ERROR", "isCorrect": false}
            ],
            "explanation": f"ERROR generating quiz for reference {reference}: {str(e)}",
            "tags": tags,
            "difficulty": "medium",
            "reference": reference,
            "source": f"IslamQA reference {reference}",
            "type": "multiple-choice",
            "category": f"category-{primary_category}",
            "sourceQuestionId": reference
        }

def main():
    """Main function to generate all quiz questions"""

    # Check for API key
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("❌ Error: ANTHROPIC_API_KEY environment variable not set")
        print("Please set it with: export ANTHROPIC_API_KEY='your-key-here'")
        return

    # Initialize Anthropic client
    client = anthropic.Anthropic(api_key=api_key)

    # Read batch input
    print(f"📖 Reading {BATCH_INPUT_FILE}...")
    with open(BATCH_INPUT_FILE, 'r', encoding='utf-8') as f:
        batch_data = json.load(f)

    questions = batch_data['questions']
    total = len(questions)

    print(f"🎯 Generating {total} quiz questions...\n")

    quizzes = []
    difficulty_count = {'easy': 0, 'medium': 0, 'hard': 0}

    for i, question in enumerate(questions):
        reference = question['reference']
        print(f"[{i+1}/{total}] Generating quiz for reference {reference}...", end=' ')

        quiz = generate_quiz_question(client, question, i)
        quizzes.append(quiz)

        difficulty_count[quiz['difficulty']] += 1
        print(f"✅ ({quiz['difficulty']})")

        # Progress indicator every 10 questions
        if (i + 1) % 10 == 0:
            print(f"\n📊 Progress: {i+1}/{total} ({(i+1)/total*100:.0f}%)\n")

    # Create output
    output = {
        "version": "1.0.0",
        "batch": "001",
        "totalQuizzes": total,
        "quizzes": quizzes
    }

    # Save to file
    print(f"\n💾 Saving to {BATCH_OUTPUT_FILE}...")
    with open(BATCH_OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Print statistics
    print(f"\n✅ Successfully generated {total} quiz questions!")
    print(f"\n📊 Difficulty distribution:")
    print(f"   Easy: {difficulty_count['easy']} ({difficulty_count['easy']/total*100:.1f}%)")
    print(f"   Medium: {difficulty_count['medium']} ({difficulty_count['medium']/total*100:.1f}%)")
    print(f"   Hard: {difficulty_count['hard']} ({difficulty_count['hard']/total*100:.1f}%)")
    print(f"\n📁 Output file: {BATCH_OUTPUT_FILE}")
    print(f"✅ All references match source questions")

if __name__ == "__main__":
    main()
