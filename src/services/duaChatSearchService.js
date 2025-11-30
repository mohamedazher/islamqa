import Fuse from 'fuse.js'

/**
 * Dua Chat Search Service - Semantic & contextual search for duas
 * Uses Gemini embeddings + metadata filtering for situation-aware discovery
 *
 * Search Strategy:
 * 1. Vector Search: Semantic understanding (similarity to query intent)
 * 2. Metadata Filtering: Category, tags, context matching
 * 3. Contextual Ranking: Combine vector similarity + metadata relevance
 * 4. Fallback: Keyword search using Fuse.js
 */
class DuaChatSearchService {
  constructor() {
    this.duas = []
    this.duaMap = {}
    this.metadataIndex = {}
    this.embeddings = {}
    this.embeddingsList = []
    this.fuseInstance = null
    this.isReady = false
    this.hasEmbeddings = false

    // Category context mapping
    this.categoryContextMap = {
      'morning': ['Morning Adhkar', 'Morning duas'],
      'evening': ['Evening Adhkar', 'Evening duas'],
      'sleep': ['Before Sleep', 'before-sleep'],
      'travel': ['Travel', 'travel'],
      'protection': ['Protection', 'protection-iman'],
      'forgiveness': ['Forgiveness', 'Istighfar', 'istighfar'],
      'anxiety': ['Difficulties & Happiness', 'difficulties-happiness'],
      'food': ['Food', 'food-drink'],
      'prayer': ['Prayer', 'Salah', 'salah'],
    }
  }

  /**
   * Initialize with duas and embeddings
   */
  async initialize(duas, embeddings = null) {
    this.duas = duas
    this.buildMetadataIndex()

    // Process embeddings if provided
    if (embeddings && Object.keys(embeddings).length > 0) {
      this.embeddings = embeddings
      this.hasEmbeddings = true

      this.embeddingsList = Object.entries(embeddings).map(([ref, vector]) => ({
        reference: ref,
        vector: new Float32Array(vector)
      }))

      console.log(`DuaChatSearchService: Loaded ${this.embeddingsList.length} dua embeddings`)
    }

    // Build lookup map with composite keys to handle duplicate IDs across files
    this.duaMap = {}
    for (const dua of this.duas) {
      const compositeKey = dua.source_file ? `${dua.source_file}:${dua.id}` : `${dua.id}`
      this.duaMap[compositeKey] = dua
    }

    // Initialize Fuse for keyword fallback
    this.initializeFuse()

    this.isReady = true
    console.log(`DuaChatSearchService initialized: ${this.duas.length} duas, embeddings: ${this.hasEmbeddings}`)
  }

  /**
   * Build metadata index for fast filtering
   */
  buildMetadataIndex() {
    for (const dua of this.duas) {
      const metadata = {
        id: dua.id,
        title: dua.title?.toLowerCase() || '',
        category: dua.category_name?.toLowerCase() || '',
        tags: (dua.tags || []).map(t => t.toLowerCase()),
        purposes: this.extractPurposes(dua),
        contexts: this.extractContexts(dua),
        keyword: this.buildKeywordString(dua)
      }
      // Use composite key to match duaMap
      const compositeKey = dua.source_file ? `${dua.source_file}:${dua.id}` : `${dua.id}`
      this.metadataIndex[compositeKey] = metadata
    }
  }

  /**
   * Extract purpose keywords from title, virtue, and tags
   */
  extractPurposes(dua) {
    const purposes = new Set()

    // From tags
    if (dua.tags) {
      dua.tags.forEach(t => purposes.add(t.toLowerCase()))
    }

    // From title
    const titleKeywords = dua.title?.toLowerCase().split(/\s+/) || []
    titleKeywords.forEach(kw => {
      if (this.isPurposefulKeyword(kw)) {
        purposes.add(kw)
      }
    })

    // Common purpose keywords
    const purposeKeywords = [
      'protection', 'forgiveness', 'guidance', 'anxiety', 'peace',
      'strength', 'health', 'mercy', 'evil', 'fear', 'worry',
      'success', 'blessing', 'family', 'money', 'travel'
    ]
    titleKeywords.forEach(kw => {
      if (purposeKeywords.includes(kw)) {
        purposes.add(kw)
      }
    })

    return Array.from(purposes)
  }

  /**
   * Extract context from category name (time of day, situation)
   */
  extractContexts(dua) {
    const contexts = new Set()
    const categoryLower = dua.category_name?.toLowerCase() || ''

    // Map categories to contexts
    for (const [context, categories] of Object.entries(this.categoryContextMap)) {
      if (categories.some(cat => categoryLower.includes(cat.toLowerCase()))) {
        contexts.add(context)
      }
    }

    return Array.from(contexts)
  }

  /**
   * Check if keyword is purposeful (not just common words)
   */
  isPurposefulKeyword(word) {
    const stopwords = new Set([
      'the', 'of', 'and', 'for', 'is', 'a', 'in', 'on', 'from', 'by', 'to', 'at'
    ])
    return word.length > 2 && !stopwords.has(word)
  }

  /**
   * Build searchable keyword string from dua
   */
  buildKeywordString(dua) {
    const parts = [
      dua.title || '',
      dua.category_name || '',
      (dua.tags || []).join(' '),
      dua.translation || ''
    ]
    return parts.join(' ').toLowerCase()
  }

  /**
   * Initialize Fuse.js for keyword fallback
   */
  initializeFuse() {
    const enhancedData = this.duas.map(dua => {
      const metadata = this.metadataIndex[dua.id]
      return {
        ...dua,
        keyword_string: metadata.keyword,
        tag_string: (dua.tags || []).join(' ')
      }
    })

    this.fuseInstance = new Fuse(enhancedData, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'category_name', weight: 0.25 },
        { name: 'tag_string', weight: 0.2 },
        { name: 'translation', weight: 0.15 }
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true,
      isCaseSensitive: false
    })
  }

  /**
   * Compute cosine similarity between vectors
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Vector search with optional metadata filtering
   */
  vectorSearch(queryEmbedding, limit = 10, filters = {}) {
    if (!this.hasEmbeddings || !queryEmbedding) {
      return []
    }

    const queryVector = new Float32Array(queryEmbedding)

    // Calculate similarity for all embeddings
    let similarities = this.embeddingsList.map(item => {
      const dua = this.duaMap[item.reference]
      if (!dua) return null

      return {
        reference: item.reference,
        id: dua.id,
        similarity: this.cosineSimilarity(queryVector, item.vector)
      }
    }).filter(Boolean)

    // Apply filters if provided
    if (filters.category) {
      const categoryLower = filters.category.toLowerCase()
      similarities = similarities.filter(sim => {
        const dua = this.duaMap[sim.reference]
        return dua.category_name?.toLowerCase().includes(categoryLower)
      })
    }

    if (filters.tags && filters.tags.length > 0) {
      const filterTags = filters.tags.map(t => t.toLowerCase())
      similarities = similarities.filter(sim => {
        const dua = this.duaMap[sim.reference]
        return filterTags.some(tag =>
          dua.tags?.some(t => t.toLowerCase().includes(tag))
        )
      })
    }

    if (filters.context && filters.context.length > 0) {
      similarities = similarities.filter(sim => {
        const metadata = this.metadataIndex[sim.reference]
        return metadata && filters.context.some(ctx =>
          metadata.contexts.includes(ctx.toLowerCase())
        )
      })
    }

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity)

    // Return top results with dua data
    return similarities.slice(0, limit).map(item => {
      const dua = this.duaMap[item.reference]
      return {
        ...dua,
        id: item.id,
        similarity: item.similarity,
        score: 1 - item.similarity,
        matchType: 'vector'
      }
    }).filter(r => r.id)
  }

  /**
   * Keyword search using Fuse.js
   */
  keywordSearch(query, limit = 10, filters = {}) {
    if (!this.fuseInstance) {
      return []
    }

    let results = this.fuseInstance.search(query.trim())

    // Apply category filter
    if (filters.category) {
      const categoryLower = filters.category.toLowerCase()
      results = results.filter(r =>
        r.item.category_name?.toLowerCase().includes(categoryLower)
      )
    }

    // Apply tag filter
    if (filters.tags && filters.tags.length > 0) {
      const filterTags = filters.tags.map(t => t.toLowerCase())
      results = results.filter(r =>
        filterTags.some(tag =>
          r.item.tags?.some(t => t.toLowerCase().includes(tag))
        )
      )
    }

    return results.slice(0, limit).map(result => ({
      ...result.item,
      fuseScore: result.score,
      similarity: 1 - result.score,
      matchType: 'keyword'
    }))
  }

  /**
   * Hybrid search: vector + metadata + keyword
   * Implements contextual ranking algorithm
   */
  search(query, limit = 5, options = {}) {
    if (!this.isReady) {
      console.warn('DuaChatSearchService not initialized')
      return []
    }

    if (!query || query.trim().length === 0) {
      return []
    }

    const {
      queryEmbedding = null,
      category = null,
      tags = [],
      context = [],
      useKeywordOnly = false
    } = options

    // If keyword-only or no embeddings, use keyword search
    if (useKeywordOnly || !this.hasEmbeddings) {
      return this.keywordSearch(query, limit, {
        category,
        tags: tags || []
      })
    }

    // Prepare filters
    const filters = { category, tags, context }

    // Vector search (primary)
    const vectorResults = queryEmbedding
      ? this.vectorSearch(queryEmbedding, limit * 2, filters)
      : []

    // Keyword search (fallback/enhancement)
    const keywordResults = this.keywordSearch(query, limit * 2, {
      category,
      tags
    })

    // Combine and rank using contextual algorithm
    const combined = this.combineAndRank(vectorResults, keywordResults, limit, {
      category,
      tags,
      context
    })

    return combined.slice(0, limit)
  }

  /**
   * Combine vector and keyword results with contextual ranking
   *
   * Ranking algorithm:
   * score = (vectorSim × 0.5) + (keywordScore × 0.25) +
   *         (categoryMatch × 0.15) + (tagMatch × 0.10)
   */
  combineAndRank(vectorResults, keywordResults, limit, context) {
    const resultMap = new Map()

    // Add vector results
    vectorResults.forEach(result => {
      const score = {
        vector: result.similarity || 0,
        keyword: 0,
        categoryMatch: context.category ? 1 : 0,
        tagMatch: 0
      }
      resultMap.set(result.id, { ...result, scores: score })
    })

    // Add/merge keyword results
    keywordResults.forEach(result => {
      const vectorScore = {
        vector: 0,
        keyword: 1 - (result.fuseScore || 0),
        categoryMatch: context.category ? 1 : 0,
        tagMatch: 0
      }

      if (resultMap.has(result.id)) {
        const existing = resultMap.get(result.id)
        existing.scores.keyword = vectorScore.keyword
      } else {
        resultMap.set(result.id, { ...result, scores: vectorScore })
      }
    })

    // Calculate tag matches
    if (context.tags && context.tags.length > 0) {
      const filterTags = context.tags.map(t => t.toLowerCase())
      resultMap.forEach((result, id) => {
        const matchCount = (result.tags || []).filter(tag =>
          filterTags.some(ft => tag.toLowerCase().includes(ft))
        ).length
        result.scores.tagMatch = Math.min(matchCount / context.tags.length, 1)
      })
    }

    // Calculate final scores
    const ranked = Array.from(resultMap.values()).map(result => {
      const s = result.scores
      result.finalScore = (s.vector * 0.5) + (s.keyword * 0.25) +
                          (s.categoryMatch * 0.15) + (s.tagMatch * 0.10)
      return result
    })

    // Sort by final score
    ranked.sort((a, b) => b.finalScore - a.finalScore)

    return ranked
  }

  /**
   * Get duas by context (time/situation)
   */
  getByContext(contextType, limit = 5) {
    const results = this.duas.filter(dua => {
      const metadata = this.metadataIndex[dua.id]
      return metadata.contexts.includes(contextType.toLowerCase())
    })

    return results.slice(0, limit)
  }

  /**
   * Get duas by category
   */
  getByCategory(categoryName, limit = null) {
    const categoryLower = categoryName.toLowerCase()
    const results = this.duas.filter(dua =>
      dua.category_name?.toLowerCase().includes(categoryLower)
    )

    return limit ? results.slice(0, limit) : results
  }

  /**
   * Format search results for display
   */
  formatResults(results, query) {
    if (results.length === 0) {
      return {
        type: 'no_results',
        message: `I couldn't find a dua matching "${query}". Try searching for a situation, time, or purpose (e.g., "protection", "morning", "anxiety").`,
        results: []
      }
    }

    const topResult = results[0]
    return {
      type: 'found',
      message: `I found ${results.length} dua(s) for your search. Here's the most relevant:`,
      topResult: {
        id: topResult.id,
        title: topResult.title,
        category: topResult.category_name,
        tags: topResult.tags || [],
        similarity: topResult.similarity || topResult.finalScore
      },
      results: results.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category_name,
        tags: r.tags || [],
        similarity: r.similarity || r.finalScore,
        matchType: r.matchType
      }))
    }
  }
}

export default new DuaChatSearchService()
