import Fuse from 'fuse.js'

/**
 * Unified Chat Search Service - Search Questions AND Duas
 *
 * Combines semantic search for both Q&A and duas in a single result set.
 * Intelligently ranks mixed results based on relevance type and content.
 */
class UnifiedChatSearchService {
  constructor() {
    this.questions = []
    this.duas = []
    this.summaries = {}
    this.questionEmbeddings = {}
    this.duaEmbeddings = {}
    this.embeddingsList = []
    this.duaEmbeddingsList = []
    this.fuseInstance = null
    this.fuseInstanceDua = null
    this.isReady = false
    this.hasQuestionEmbeddings = false
    this.hasDuaEmbeddings = false
  }

  /**
   * Initialize with questions, duas, summaries, and embeddings
   */
  async initialize(questions, duas = [], summaries = {}, embeddings = {}, duaEmbeddings = {}) {
    this.questions = questions || []
    this.duas = duas || []
    this.summaries = summaries || {}

    // Process question embeddings
    if (embeddings && Object.keys(embeddings).length > 0) {
      this.questionEmbeddings = embeddings
      this.hasQuestionEmbeddings = true
      this.embeddingsList = Object.entries(embeddings).map(([ref, vector]) => ({
        reference: ref,
        vector: new Float32Array(vector),
        type: 'question'
      }))
      console.log(`UnifiedChatSearchService: Loaded ${this.embeddingsList.length} question embeddings`)
    }

    // Process dua embeddings
    if (duaEmbeddings && Object.keys(duaEmbeddings).length > 0) {
      this.duaEmbeddings = duaEmbeddings
      this.hasDuaEmbeddings = true
      this.duaEmbeddingsList = Object.entries(duaEmbeddings).map(([duaId, vector]) => ({
        id: duaId,
        vector: new Float32Array(vector),
        type: 'dua'
      }))
      console.log(`UnifiedChatSearchService: Loaded ${this.duaEmbeddingsList.length} dua embeddings`)
    }

    // Build lookup maps
    this.questionMap = {}
    for (const q of this.questions) {
      this.questionMap[q.reference] = q
    }

    this.duaMap = {}
    for (const dua of this.duas) {
      // Use composite key to handle duplicate IDs across different dua files
      const compositeKey = dua.source_file ? `${dua.source_file}:${dua.id}` : `${dua.id}`
      this.duaMap[compositeKey] = dua
    }

    // Initialize Fuse for both question and dua fallback search
    this.initializeFuseQuestions()
    this.initializeFuseDuas()

    this.isReady = true
    console.log(
      `UnifiedChatSearchService initialized: ${this.questions.length} questions, ` +
      `${this.duas.length} duas, embeddings: Q=${this.hasQuestionEmbeddings}, D=${this.hasDuaEmbeddings}`
    )
  }

  /**
   * Initialize Fuse.js for questions
   */
  initializeFuseQuestions() {
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
   * Initialize Fuse.js for duas
   */
  initializeFuseDuas() {
    const enhancedData = this.duas.map(dua => ({
      ...dua,
      tag_string: (dua.tags || []).join(' '),
      category_lower: (dua.category_name || '').toLowerCase()
    }))

    this.fuseInstanceDua = new Fuse(enhancedData, {
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
   * Vector search across questions and duas
   * Returns balanced mix of both types for better user experience
   */
  vectorSearch(queryEmbedding, limit = 10) {
    if (!queryEmbedding) return []

    const queryVector = new Float32Array(queryEmbedding)
    let questionResults = []
    let duaResults = []

    // Search questions
    if (this.hasQuestionEmbeddings) {
      const questionSimilarities = this.embeddingsList
        .map(item => ({
          reference: item.reference,
          similarity: this.cosineSimilarity(queryVector, item.vector)
        }))
        .sort((a, b) => b.similarity - a.similarity)

      questionResults = questionSimilarities.map(sim => {
        const question = this.questionMap[sim.reference]
        return question ? {
          ...question,
          reference: sim.reference,
          similarity: sim.similarity,
          score: 1 - sim.similarity,
          matchType: 'vector',
          resultType: 'question'
        } : null
      }).filter(Boolean)
    }

    // Search duas
    if (this.hasDuaEmbeddings) {
      const duaSimilarities = this.duaEmbeddingsList
        .map(item => ({
          id: item.id,
          similarity: this.cosineSimilarity(queryVector, item.vector)
        }))
        .sort((a, b) => b.similarity - a.similarity)

      duaResults = duaSimilarities.map(sim => {
        const dua = this.duaMap[sim.id]
        return dua ? {
          ...dua,
          id: sim.id,
          similarity: sim.similarity,
          score: 1 - sim.similarity,
          matchType: 'vector',
          resultType: 'dua'
        } : null
      }).filter(Boolean)
    }

    // Interleave results to balance questions and duas
    const balanced = this.interleaveResults(questionResults, duaResults, limit)
    return balanced
  }

  /**
   * Interleave two result arrays for balanced distribution
   * Example: [Q1, Q2, Q3] + [D1, D2] → [Q1, D1, Q2, D2, Q3]
   */
  interleaveResults(questions, duas, limit) {
    const results = []
    let qIndex = 0
    let dIndex = 0

    // Determine interleaving strategy based on available results
    const totalAvailable = questions.length + duas.length

    // If one type is missing, just return the available type
    if (questions.length === 0) return duas.slice(0, limit)
    if (duas.length === 0) return questions.slice(0, limit)

    // Interleave alternating between questions and duas
    while (results.length < limit && (qIndex < questions.length || dIndex < duas.length)) {
      // Alternate: question, dua, question, dua...
      if (qIndex < questions.length && (dIndex >= duas.length || results.length % 2 === 0)) {
        results.push(questions[qIndex++])
      } else if (dIndex < duas.length) {
        results.push(duas[dIndex++])
      } else if (qIndex < questions.length) {
        results.push(questions[qIndex++])
      }
    }

    return results.slice(0, limit)
  }

  /**
   * Keyword search across questions and duas
   * Returns balanced mix of both types
   */
  keywordSearch(query, limit = 10) {
    let questionResults = []
    let duaResults = []

    // Search questions
    if (this.fuseInstance) {
      const results = this.fuseInstance.search(query.trim())
      questionResults = results.map(result => ({
        ...result.item,
        fuseScore: result.score,
        similarity: 1 - result.score,
        matchType: 'keyword',
        resultType: 'question'
      }))
    }

    // Search duas
    if (this.fuseInstanceDua) {
      const results = this.fuseInstanceDua.search(query.trim())
      duaResults = results.map(result => ({
        ...result.item,
        fuseScore: result.score,
        similarity: 1 - result.score,
        matchType: 'keyword',
        resultType: 'dua'
      }))
    }

    // Interleave results for balanced distribution
    const interleaved = this.interleaveResults(questionResults, duaResults, limit * 2)

    // Re-rank combined results by type and relevance
    return this.rankMixedResults(interleaved, query).slice(0, limit)
  }

  /**
   * Unified hybrid search: questions + duas
   * Returns mixed results ranked by relevance
   */
  search(query, limit = 10, queryEmbedding = null) {
    if (!this.isReady) {
      console.warn('UnifiedChatSearchService not initialized')
      return []
    }

    if (!query || query.trim().length === 0) {
      return []
    }

    // If we have query embedding, use vector search
    if (queryEmbedding && (this.hasQuestionEmbeddings || this.hasDuaEmbeddings)) {
      const vectorResults = this.vectorSearch(queryEmbedding, limit * 2)
      if (vectorResults.length > 0) {
        return vectorResults.slice(0, limit)
      }
    }

    // Fallback to keyword search
    return this.keywordSearch(query, limit)
  }

  /**
   * Intelligent ranking for mixed question + dua results
   * Prioritizes questions for queries about rulings/knowledge
   * Prioritizes duas for queries about supplications/situations
   */
  rankMixedResults(results, query) {
    const queryLower = query.toLowerCase()

    // Keywords that suggest looking for duas vs questions
    const duaKeywords = [
      'dua', 'duas', 'supplication', 'supplicate', 'pray', 'prayer', 'morning',
      'evening', 'anxiety', 'worried', 'worry', 'fear', 'protection', 'forgiveness',
      'mercy', 'blessings', 'blessing', 'guidance', 'travel', 'sleep', 'bedtime'
    ]

    const questionKeywords = [
      'haram', 'halal', 'permissible', 'forbidden', 'ruling', 'Islamic', 'islam',
      'prophet', 'sunnah', 'quran', 'quranic', 'hadith', 'sharia', 'law', 'allowed'
    ]

    // Boost scores based on query intent
    const boostedResults = results.map(result => {
      let boost = 1.0

      // Check if query suggests dua search
      if (duaKeywords.some(kw => queryLower.includes(kw))) {
        // Boost duas, slightly reduce questions
        if (result.resultType === 'dua') {
          boost *= 1.15
        } else {
          boost *= 0.85
        }
      }

      // Check if query suggests question search
      if (questionKeywords.some(kw => queryLower.includes(kw))) {
        // Boost questions, slightly reduce duas
        if (result.resultType === 'question') {
          boost *= 1.15
        } else {
          boost *= 0.85
        }
      }

      // If no strong intent signals, prioritize questions (they have more comprehensive answers)
      if (!duaKeywords.some(kw => queryLower.includes(kw)) &&
          !questionKeywords.some(kw => queryLower.includes(kw))) {
        if (result.resultType === 'question') {
          boost *= 1.05
        }
      }

      return {
        ...result,
        boostedScore: (result.similarity || result.fuseScore || 0) * boost
      }
    })

    // Sort by boosted score
    boostedResults.sort((a, b) => b.boostedScore - a.boostedScore)

    return boostedResults
  }

  /**
   * Format search results for display
   */
  formatAsResponse(results, query) {
    if (results.length === 0) {
      return {
        type: 'no_results',
        message: "I couldn't find any relevant answers or duas for your question. Try rephrasing or using different keywords.",
        results: []
      }
    }

    const topResult = results[0]
    const resultTypeName = topResult.resultType === 'dua' ? 'dua' : 'answer'

    return {
      type: 'found',
      message: `I found relevant ${resultTypeName}s for your question. Here's what I found:`,
      ruling: topResult.ai_ruling || null,
      similarity: topResult.similarity,
      results: results.map(r => {
        // For duas, include all content fields; for questions, include AI summary
        if (r.resultType === 'dua') {
          return {
            id: r.id,
            reference: r.reference || r.id,
            title: r.title,
            title_ar: r.title_ar,
            arabic: r.arabic,
            transliteration: r.transliteration,
            translation: r.translation,
            virtue: r.virtue,
            tags: r.tags || [],
            similarity: r.similarity,
            score: r.score,
            resultType: r.resultType,
            category_id: r.category_id,
            category: r.category_name || null
          }
        } else {
          // Question result
          return {
            reference: r.reference || r.id,
            title: r.title,
            summary: this.summaries[r.reference]?.summary || '',
            tags: r.tags || [],
            ruling: this.summaries[r.reference]?.ruling || null,
            similarity: r.similarity,
            score: r.score,
            resultType: r.resultType,
            category: r.category_name || null
          }
        }
      })
    }
  }

  /**
   * Get suggested questions
   */
  getSuggestedQuestions() {
    return [
      "Is music haram in Islam?",
      "What breaks the fast during Ramadan?",
      "How to pray tahajjud?",
      "Dua for anxiety and worry",
      "What is the ruling on celebrating birthdays?"
    ]
  }
}

export default new UnifiedChatSearchService()
