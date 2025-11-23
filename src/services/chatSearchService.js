import Fuse from 'fuse.js'

/**
 * Chat Search Service - Semantic search using Gemini embeddings
 * Uses cosine similarity for finding relevant Q&As
 */
class ChatSearchService {
  constructor() {
    this.questions = []
    this.summaries = {}
    this.embeddings = {}
    this.embeddingsList = [] // Array format for fast iteration
    this.fuseInstance = null
    this.isReady = false
    this.hasEmbeddings = false
  }

  /**
   * Initialize with questions, summaries, and embeddings
   */
  async initialize(questions, summaries, embeddings = null) {
    this.questions = questions
    this.summaries = summaries || {}

    // Process embeddings if provided
    if (embeddings && Object.keys(embeddings).length > 0) {
      this.embeddings = embeddings
      this.hasEmbeddings = true

      // Create array format for faster iteration
      this.embeddingsList = Object.entries(embeddings).map(([ref, vector]) => ({
        reference: ref,
        vector: new Float32Array(vector) // Use typed array for performance
      }))

      console.log(`Loaded ${this.embeddingsList.length} embeddings`)
    }

    // Create question lookup map
    this.questionMap = {}
    for (const q of this.questions) {
      this.questionMap[q.reference] = q
    }

    // Initialize Fuse as fallback
    this.initializeFuse()

    this.isReady = true
    console.log(`ChatSearchService initialized with ${questions.length} questions, ${Object.keys(summaries).length} summaries, embeddings: ${this.hasEmbeddings}`)
  }

  /**
   * Initialize Fuse.js for fallback/hybrid search
   */
  initializeFuse() {
    const enhancedData = this.questions.map(q => {
      const summary = this.summaries[q.reference] || {}
      return {
        ...q,
        ai_summary: summary.summary || '',
        ai_tags: (summary.tags || []).join(' '),
        ai_key_terms: (summary.key_terms || []).join(' '),
        ai_query_phrases: (summary.query_phrases || []).join(' ')
      }
    })

    this.fuseInstance = new Fuse(enhancedData, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'ai_summary', weight: 0.3 },
        { name: 'ai_query_phrases', weight: 0.15 },
        { name: 'ai_key_terms', weight: 0.1 },
        { name: 'ai_tags', weight: 0.05 }
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true,
      isCaseSensitive: false
    })
  }

  /**
   * Compute cosine similarity between two vectors
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
   * Search using vector similarity
   */
  vectorSearch(queryEmbedding, limit = 5) {
    if (!this.hasEmbeddings || !queryEmbedding) {
      return []
    }

    const queryVector = new Float32Array(queryEmbedding)

    // Calculate similarity for all embeddings
    const similarities = this.embeddingsList.map(item => ({
      reference: item.reference,
      similarity: this.cosineSimilarity(queryVector, item.vector)
    }))

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity)

    // Return top results with question data
    return similarities.slice(0, limit).map(item => {
      const question = this.questionMap[item.reference]
      const summary = this.summaries[item.reference]

      return {
        ...question,
        reference: item.reference,
        similarity: item.similarity,
        score: 1 - item.similarity, // Convert to score (lower is better for consistency)
        ai_summary: summary?.summary || '',
        ai_tags: summary?.tags || [],
        ai_ruling: summary?.ruling || null,
        matchType: 'vector'
      }
    }).filter(r => r.reference) // Filter out any missing questions
  }

  /**
   * Hybrid search: combines vector search with keyword fallback
   */
  search(query, limit = 5, queryEmbedding = null) {
    if (!this.isReady) {
      console.warn('ChatSearchService not initialized')
      return []
    }

    if (!query || query.trim().length === 0) {
      return []
    }

    // If we have query embedding, use vector search
    if (queryEmbedding && this.hasEmbeddings) {
      const vectorResults = this.vectorSearch(queryEmbedding, limit)
      if (vectorResults.length > 0) {
        return vectorResults
      }
    }

    // Fallback to Fuse.js keyword search
    return this.keywordSearch(query, limit)
  }

  /**
   * Keyword-based search using Fuse.js
   */
  keywordSearch(query, limit = 5) {
    if (!this.fuseInstance) {
      return []
    }

    const results = this.fuseInstance.search(query.trim())

    return results.slice(0, limit).map(result => ({
      ...result.item,
      score: result.score,
      similarity: 1 - result.score,
      matchType: 'keyword'
    }))
  }

  /**
   * Get suggested questions for empty state
   */
  getSuggestedQuestions() {
    return [
      "Is music haram in Islam?",
      "What breaks the fast during Ramadan?",
      "How to pray tahajjud?",
      "Is it permissible to take mortgage?",
      "What is the ruling on celebrating birthdays?"
    ]
  }

  /**
   * Format search results as chat response
   */
  formatAsResponse(results, query) {
    if (results.length === 0) {
      return {
        type: 'no_results',
        message: "I couldn't find any relevant answers for your question. Try rephrasing or using different keywords.",
        results: []
      }
    }

    const topResult = results[0]
    const summary = this.summaries[topResult.reference]

    return {
      type: 'found',
      message: summary?.summary || `Here's what I found about "${query}":`,
      ruling: summary?.ruling || null,
      similarity: topResult.similarity,
      results: results.map(r => ({
        reference: r.reference,
        title: r.title,
        summary: this.summaries[r.reference]?.summary || '',
        tags: this.summaries[r.reference]?.tags || [],
        ruling: this.summaries[r.reference]?.ruling || null,
        similarity: r.similarity,
        score: r.score
      }))
    }
  }
}

export default new ChatSearchService()
