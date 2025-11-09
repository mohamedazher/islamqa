# Data Migration Plan - From Old to New Data Structure

## Current Problem

The app currently expects:
- Old data files: `categories.js`, `questions[1-4].js`, `answers[1-12].js` (JavaScript files with embedded JSON)
- Old schema: Uses `element` field for semantic IDs, `parent` for parent reference
- Old questions: Split across multiple files, answers in separate files
- Question structure: `id`, `category_id`, `question_full`, `question`, `question_url`
- Answer structure: `id`, `question_id`, `answers` (HTML content)

But we now have:
- New data files: `categories.json`, `questions.json` (2 files, pure JSON format)
- New schema: Uses `reference` field for semantic IDs, `parent_reference` for parent reference
- New structure: Single unified JSON array per file
- Category structure: `reference`, `title`, `description`, `parent_reference`, `children_references`, `has_subcategories`, `question_count`, `level`, `ancestors`, `url`
- Question structure: `reference`, `title`, `question`, `answer` (HTML content embedded), `categories` (array), `primary_category`, `tags`, `taxonomies`, `views`, `date`, `content_langs`, `bookmarked`, `last_read`

## Critical ID Scheme Change

### OLD (element ID - arbitrary sequential)
- Categories used `element` field with sequential numbers
- Questions used `id` field with sequential numbers
- IDs were meaningless, not from source
- Problem: Navigation used arbitrary IDs that didn't match IslamQA

### NEW (reference ID - from IslamQA source)
- Categories use `reference` field (actual IslamQA category IDs)
- Questions use `reference` field (actual IslamQA question IDs)
- IDs are semantic, meaningful, match source data
- Benefit: Proper data linkage, semantic navigation

## Files to Update

1. **src/services/dataLoader.js** - Load new JSON files, remove old multi-file logic
2. **src/services/dexieDatabase.js** - Update schema and all query methods
3. **Review src/views/** - Check for any direct ID field access

## Key Changes Summary

| Aspect | Old | New |
|--------|-----|-----|
| Category ID Field | `element` | `reference` |
| Category Parent Field | `parent` | `parent_reference` |
| Question ID Field | `id` | `reference` |
| Question Category Link | `category_id` | `primary_category` |
| Answer Storage | Separate table | Embedded in question.answer |
| Data Files | 17 files (categories.js, questions[1-4].js, answers[1-12].js) | 2 files (categories.json, questions.json) |
| Root Categories | Query parent == "0" | Query parent_reference == null |

