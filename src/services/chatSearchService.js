import Fuse from 'fuse.js'

/**
 * Chat Search Service - Enhanced search using AI-generated summaries
 * Provides better semantic matching for chat interface
 */
class ChatSearchService {
  constructor() {
    this.questions = []
    this.summaries = {}
    this.fuseInstance = null
    this.enhancedData = []
    this.isReady = false

    // Common ruling words to exclude from topic search
    this.rulingWords = new Set([
      'halal', 'haram', 'makruh', 'mubah', 'mustahabb', 'wajib',
      'permissible', 'forbidden', 'allowed', 'prohibited', 'obligatory',
      'is', 'it', 'the', 'a', 'an', 'in', 'islam', 'islamic', 'ruling', 'on'
    ])
  }

  /**
   * Initialize with questions and AI summaries
   */
  async initialize(questions, summaries) {
    this.questions = questions
    this.summaries = summaries || {}

    // Create enhanced search data by merging questions with summaries
    this.enhancedData = this.questions.map(q => {
      const summary = this.summaries[q.reference] || {}
      return {
        ...q,
        ai_summary: summary.summary || '',
        ai_tags: (summary.tags || []).join(' '),
        ai_key_terms: (summary.key_terms || []).join(' '),
        ai_query_phrases: (summary.query_phrases || []).join(' '),
        ai_ruling: summary.ruling || null
      }
    })

    // Initialize Fuse with enhanced data - prioritize title and summary
    this.fuseInstance = new Fuse(this.enhancedData, {
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
      isCaseSensitive: false,
      findAllMatches: true
    })

    this.isReady = true
    console.log(`ChatSearchService initialized with ${questions.length} questions and ${Object.keys(summaries).length} summaries`)
  }

  /**
   * Extract topic words from query (excluding ruling words)
   */
  extractTopicWords(query) {
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 1 && !this.rulingWords.has(word))
  }

  /**
   * Extract ruling intent from query
   */
  extractRulingIntent(query) {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes('haram') || lowerQuery.includes('forbidden') || lowerQuery.includes('prohibited')) {
      return 'haram'
    }
    if (lowerQuery.includes('halal') || lowerQuery.includes('permissible') || lowerQuery.includes('allowed')) {
      return 'halal'
    }
    return null
  }

  /**
   * Search for relevant Q&As
   * Returns top matches with relevance scores
   */
  search(query, limit = 5) {
    if (!this.isReady || !this.fuseInstance) {
      console.warn('ChatSearchService not initialized')
      return []
    }

    if (!query || query.trim().length === 0) {
      return []
    }

    const topicWords = this.extractTopicWords(query)
    const rulingIntent = this.extractRulingIntent(query)

    // If we have topic words, search for them specifically
    let searchQuery = query.trim()
    if (topicWords.length > 0) {
      // Prioritize topic words in search
      searchQuery = topicWords.join(' ')
    }

    // Fuzzy search with topic-focused query
    const fuseResults = this.fuseInstance.search(searchQuery)

    // Score and filter results
    const scoredResults = fuseResults.map(result => {
      let adjustedScore = result.score

      // Boost if title contains topic words
      const titleLower = (result.item.title || '').toLowerCase()
      const topicInTitle = topicWords.some(word => titleLower.includes(word))
      if (topicInTitle) {
        adjustedScore *= 0.5 // Significant boost
      }

      // Boost if ruling matches intent
      if (rulingIntent && result.item.ai_ruling === rulingIntent) {
        adjustedScore *= 0.8 // Slight boost
      }

      return {
        ...result.item,
        score: adjustedScore,
        matchType: 'fuzzy'
      }
    })

    // Sort by adjusted score (lower is better)
    scoredResults.sort((a, b) => a.score - b.score)

    return scoredResults.slice(0, limit)
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
      results: results.map(r => ({
        reference: r.reference,
        title: r.title,
        summary: this.summaries[r.reference]?.summary || '',
        tags: this.summaries[r.reference]?.tags || [],
        ruling: this.summaries[r.reference]?.ruling || null,
        score: r.score
      }))
    }
  }
}

export default new ChatSearchService()
