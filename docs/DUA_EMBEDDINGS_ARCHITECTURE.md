# Dua Embeddings & Semantic Search Architecture

## Overview

This document describes the architecture for semantic search on duas using Gemini embeddings. The system enables users to find the right dua for their situation/time/purpose through natural language queries.

**Goal**: Users can search by situation ("I'm anxious") and find relevant duas without needing to know exact titles or categories.

---

## Architecture Components

### 1. Core Services

#### `duaChatSearchService.js`
A specialized search engine for duas that combines semantic and contextual search.

**Key Features**:
- **Vector Search**: Semantic understanding via embeddings (cosine similarity)
- **Metadata Indexing**: Fast filtering by category, tags, context
- **Contextual Ranking**: Multi-factor scoring algorithm
- **Hybrid Fallback**: Fuse.js keyword search if embeddings unavailable

**Primary Methods**:
```javascript
// Semantic search with optional filters
search(query, limit, {
  queryEmbedding,    // Vector from Gemini API
  category,          // Filter by category
  tags,              // Filter by tags
  context,           // Filter by context (morning/evening/travel)
  useKeywordOnly     // Fallback mode
})

// Get duas by context (time/situation)
getByContext(contextType, limit)

// Get duas by category
getByCategory(categoryName, limit)
```

### 2. Data Flow

```
User Query
    ↓
Gemini API (generate embedding for query)
    ↓
duaChatSearchService.search()
    ├─→ Vector Search (if embeddings available)
    ├─→ Metadata Filtering (category/tags/context)
    └─→ Keyword Search (fallback/enhancement via Fuse.js)
    ↓
Contextual Ranking Algorithm
    ↓
Ranked Results (top N duas)
```

### 3. Embedding Composition Strategy

For each dua, we embed a composed text that includes:

```
{title} + {category} + {tags} + {virtue excerpt}

Example:
"Duʿa of Prophet Musa ﷺ for Forgiveness. Category: Quranic Duas.
Tags: Forgiveness, Prophet. Benefits: Acknowledge our sins as acknowledging
one's sins and shortcomings is a sunnah of the Prophets..."
```

**Why this composition?**
- **Title** (30% of context): Primary intent signal
- **Category** (20%): Situational context
- **Tags** (20%): Purpose and use case
- **Virtue** (30%): Detailed benefits and applications

This ensures embeddings capture both semantic meaning and practical intent.

### 4. Ranking Algorithm

```
finalScore = (vectorSimilarity × 0.5) +
             (keywordScore × 0.25) +
             (categoryMatch × 0.15) +
             (tagMatch × 0.10)
```

**Score Factors**:
- **Vector Similarity** (50%): Semantic relevance to query
- **Keyword Score** (25%): Exact/fuzzy text matches
- **Category Match** (15%): Exact category filter match
- **Tag Match** (10%): Purpose-specific tag matches

This balanced approach ensures:
- Semantic understanding is primary
- Exact matches aren't lost
- Metadata filtering helps precision
- Context/purpose matching adds relevance

---

## Implementation Guide

### Step 1: Generate Embeddings

```bash
# Install dependencies (if not already done)
npm install @google/generative-ai

# Set API key (optional, hardcoded in script)
export GEMINI_API_KEY=your_key_here

# Generate all dua embeddings
node scripts/generate-dua-embeddings-gemini.js
```

**Output**: `public/data/dua-embeddings.json`
```json
{
  "1": [0.023, -0.045, 0.102, ...],  // dua id: embedding vector
  "2": [0.034, 0.021, -0.087, ...],
  "3": [...]
}
```

**Features**:
- Batch processing (50 duas at a time)
- Resumable from checkpoints
- Progress logging
- Error recovery

### Step 2: Load in Data Loader

Update `src/services/dataLoader.js` to load dua embeddings:

```javascript
// In dataLoader.js
async loadAndImport(progressCallback) {
  // ... existing code ...

  // Load dua embeddings
  const response = await fetch('data/dua-embeddings.json')
  const duaEmbeddings = await response.json()

  // Store in Dexie
  await dexieDb.setEmbeddings('dua', duaEmbeddings)

  // Initialize search service
  const duas = await dexieDb.getAllDuas()
  await duaChatSearchService.initialize(duas, duaEmbeddings)
}
```

### Step 3: Integrate with Dexie Schema

Update `src/services/dexieDatabase.js`:

```javascript
version(1).stores({
  // ... existing stores ...
  dua_embeddings: 'id'  // Store embeddings
})

// Methods to add:
async setEmbeddings(type, embeddings) {
  if (type === 'dua') {
    await this.db.dua_embeddings.clear()
    await this.db.dua_embeddings.add({
      id: 'dua',
      embeddings: embeddings,
      timestamp: new Date()
    })
  }
}

async getEmbeddings(type) {
  const stored = await this.db.dua_embeddings.get('dua')
  return stored?.embeddings || {}
}
```

### Step 4: Use in Components

```javascript
// In Vue component
import duaChatSearchService from '@/services/duaChatSearchService'

// Simple search
const results = duaChatSearchService.search('anxiety', 5)

// Search with context
const results = duaChatSearchService.search('peace', 5, {
  queryEmbedding: userQueryEmbedding,  // From Gemini API
  context: ['morning'],  // Filter to morning duas
  useKeywordOnly: false  // Use embeddings
})

// Get duas by time of day
const morningDuas = duaChatSearchService.getByContext('morning', 10)

// Format for display
const formatted = duaChatSearchService.formatResults(results, 'anxiety')
```

---

## Search Scenarios

### Scenario 1: Situation-Based Search
**User**: "I'm feeling anxious and worried"
**Query Flow**:
1. Embed query → semantic vector
2. Vector search across all duas
3. Filter by tag "Anxiety" if available
4. Rank by relevance
5. Return top 5 duas

**Expected Results**:
- "Protect Yourself From Anxiety, Laziness, Debt etc" ✓
- "Well-being in this World and the Hereafter" ✓
- Related duas from "difficulties-happiness" category

### Scenario 2: Time-Based Search
**User**: "I want a dua for morning"
**Query Flow**:
1. Search for "morning" → keyword match
2. Filter by context='morning'
3. Return morning adhkar
4. Supplement with semantic matches

**Expected Results**:
- All "Morning Adhkar" duas
- Ranked by relevance to morning routine

### Scenario 3: Purpose-Based Search
**User**: "Dua for protection"
**Query Flow**:
1. Embed query → semantic match
2. Filter by tags containing "protection"
3. Combine semantic + keyword scores
4. Rank by relevance

**Expected Results**:
- "Ayat al-Kursi: The Greatest Protection"
- "3 Quls: Be Sufficed in All Your Matters"
- Protection duas from various categories

### Scenario 4: Fallback Mode
**User**: "Please give me..." (incomplete query)
**Query Flow**:
1. Keyword search fails (too vague)
2. Fall back to Fuse.js
3. Return approximate matches
4. Suggest featured duas

---

## Performance Optimization

### Indexing
- **Metadata Index**: O(1) category/tag lookup
- **Embedding Array**: Pre-converted to Float32Array for fast math
- **Fuse Index**: Cached and persistent

### Filtering
- Pre-filter by category before similarity calculation
- Short-circuit on keyword-only mode
- Cache frequent context queries

### Memory
- Float32Array (4 bytes/float) vs Array (8+ bytes)
- ~600 duas × 768 dimensions = ~1.8 MB embeddings

### Batching
- Generate embeddings in batches of 50
- Respect Gemini API rate limits
- Checkpoint-based resumption

---

## Embedding Details

### Model
- **Provider**: Google Gemini
- **Model**: `text-embedding-004`
- **Dimension**: 768
- **Distance Metric**: Cosine similarity

### Quality Factors
✓ Composition includes context (category, tags, benefits)
✓ Virtue/explanation text captures semantic meaning
✓ Tags provide purpose signals
✓ Title anchors to specific intent

---

## Future Enhancements

### Phase 2: Personalization
- Track user search patterns
- Suggest frequently-accessed duas
- Personalized context preferences

### Phase 3: Smart Recommendations
- Pair complementary duas
- Suggest additional duas after selection
- Time-aware recommendations (prayer times, Ramadan)

### Phase 4: Multi-Language
- Arabic semantic search (separate embeddings)
- Cross-language matching
- Transliteration search

### Phase 5: Advanced Features
- Dua combination suggestions
- Benefits-based search ("for success")
- Interactive chatbot for dua discovery

---

## Integration Checklist

- [ ] Generate dua embeddings: `node scripts/generate-dua-embeddings-gemini.js`
- [ ] Verify embeddings file: `public/data/dua-embeddings.json`
- [ ] Update data loader to load embeddings
- [ ] Add dua_embeddings store to Dexie schema
- [ ] Create DuaSearchView component
- [ ] Integrate search bar into navigation
- [ ] Test with sample queries
- [ ] Monitor performance metrics
- [ ] Deploy embeddings with next release

---

## Files Modified/Created

**New Files**:
- `src/services/duaChatSearchService.js` - Core search engine
- `scripts/generate-dua-embeddings-gemini.js` - Embedding generation
- `public/data/dua-embeddings.json` - Generated embeddings (after running script)
- `docs/DUA_EMBEDDINGS_ARCHITECTURE.md` - This document

**Files to Update**:
- `src/services/dataLoader.js` - Load embeddings
- `src/services/dexieDatabase.js` - Add embeddings store
- `src/router/index.js` - Add search route
- `src/views/DuaSearchView.vue` - Search UI (new component)

---

## Troubleshooting

### Issue: Embeddings don't load
**Solution**: Verify `public/data/dua-embeddings.json` exists and is valid JSON
```bash
npm run build  # Ensure file is included in build
```

### Issue: Search results aren't semantic
**Solution**:
- Verify embeddings were generated successfully
- Check that `queryEmbedding` is provided to search method
- Fall back to keyword search if embeddings unavailable

### Issue: API rate limit errors
**Solution**:
- Reduce BATCH_SIZE in generation script
- Increase DELAY_MS between batches
- Resume from checkpoint after rate limit

### Issue: High memory usage
**Solution**:
- Clear browser cache (embeddings stored there)
- Use IndexedDB for caching instead of memory
- Compress embeddings (quantization)

---

## References

- [Gemini API Documentation](https://ai.google.dev/)
- [Text Embeddings Guide](https://ai.google.dev/tutorials/python_quickstart)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Semantic Search Concepts](https://www.pinecone.io/learn/semantic-search/)

