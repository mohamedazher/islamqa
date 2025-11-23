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
    this.isReady = false
  }

  /**
   * Initialize with questions and AI summaries
   */
  async initialize(questions, summaries) {
    this.questions = questions
    this.summaries = summaries || {}

    // Create enhanced search data by merging questions with summaries
    const enhancedData = this.questions.map(q => {
      const summary = this.summaries[q.reference] || {}
      return {
        ...q,
        ai_summary: summary.summary || '',
        ai_tags: summary.tags || [],
        ai_key_terms: summary.key_terms || [],
        ai_query_phrases: summary.query_phrases || [],
        ai_ruling: summary.ruling || null
      }
    })

    // Initialize Fuse with enhanced data
    this.fuseInstance = new Fuse(enhancedData, {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'ai_summary', weight: 0.35 },
        { name: 'ai_key_terms', weight: 0.15 },
        { name: 'ai_query_phrases', weight: 0.15 },
        { name: 'ai_tags', weight: 0.05 }
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true,
      isCaseSensitive: false
    })

    this.isReady = true
    console.log(`ChatSearchService initialized with ${questions.length} questions and ${Object.keys(summaries).length} summaries`)
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

    const searchTerm = query.trim().toLowerCase()

    // Fuzzy search
    const fuseResults = this.fuseInstance.search(searchTerm)

    // Also do exact tag matching for boost
    const tagMatches = this.findByTags(searchTerm)

    // Combine and deduplicate
    const seenRefs = new Set()
    const combined = []

    // Add fuse results first
    for (const result of fuseResults) {
      if (!seenRefs.has(result.item.reference)) {
        seenRefs.add(result.item.reference)
        combined.push({
          ...result.item,
          score: result.score,
          matchType: 'fuzzy'
        })
      }
    }

    // Boost tag matches
    for (const match of tagMatches) {
      if (!seenRefs.has(match.reference)) {
        seenRefs.add(match.reference)
        combined.push({
          ...match,
          score: 0.1, // High relevance for tag match
          matchType: 'tag'
        })
      }
    }

    // Sort by score (lower is better in Fuse)
    combined.sort((a, b) => a.score - b.score)

    return combined.slice(0, limit)
  }

  /**
   * Find questions by matching tags
   */
  findByTags(query) {
    const queryWords = query.toLowerCase().split(/\s+/)
    const matches = []

    for (const q of this.questions) {
      const summary = this.summaries[q.reference]
      if (!summary) continue

      const tags = summary.tags || []
      const keyTerms = summary.key_terms || []
      const allTerms = [...tags, ...keyTerms].map(t => t.toLowerCase())

      // Check if any query word matches tags
      const hasMatch = queryWords.some(word =>
        allTerms.some(term => term.includes(word) || word.includes(term))
      )

      if (hasMatch) {
        matches.push({
          ...q,
          ai_summary: summary.summary,
          ai_tags: summary.tags,
          ai_ruling: summary.ruling
        })
      }
    }

    return matches.slice(0, 10)
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
