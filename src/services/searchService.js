import Fuse from 'fuse.js'

/**
 * Search Service - Provides fuzzy search using Fuse.js
 * Handles both exact and approximate matches
 */
class SearchService {
  constructor(questions = []) {
    this.questions = questions
    this.fuseInstance = null
    this.initializeFuse()
  }

  /**
   * Initialize Fuse.js with questions data
   */
  initializeFuse() {
    if (this.questions.length === 0) {
      console.warn('SearchService: No questions provided for search')
      return
    }

    this.fuseInstance = new Fuse(this.questions, {
      keys: [
        { name: 'title', weight: 0.7 },      // Question title (70% weight) - new field name
        { name: 'question', weight: 0.3 }     // Question HTML content (30% weight) - now used instead of question_full
      ],
      threshold: 0.4,                        // 0.4 = more fuzzy, allows typos
      ignoreLocation: true,                  // Don't prioritize position
      minMatchCharLength: 2,                 // Match at least 2 characters
      useExtendedSearch: false,              // Standard fuzzy, not extended
      includeScore: true,                    // Include relevance score
      isCaseSensitive: false                 // Case insensitive
    })
  }

  /**
   * Update questions data and reinitialize search
   */
  updateQuestions(questions) {
    this.questions = questions
    this.initializeFuse()
  }

  /**
   * Fuzzy search for questions
   * Returns array of {item: question, score: relevance}
   */
  fuzzySearch(term) {
    if (!term || term.trim().length === 0) {
      return []
    }

    if (!this.fuseInstance) {
      console.warn('SearchService: Fuse not initialized')
      return []
    }

    const results = this.fuseInstance.search(term.trim())
    // Return just the items, sorted by score
    return results.map(r => ({
      ...r.item,
      score: r.score  // 0 = perfect match, 1 = no match
    }))
  }

  /**
   * Combined search: exact + fuzzy
   * First tries exact substring match, then fuzzy fallback
   * UPDATED: Uses 'title' and 'question' fields, and 'reference' as ID
   */
  search(term) {
    if (!term || term.trim().length === 0) {
      return []
    }

    const searchTerm = term.trim().toLowerCase()

    // Exact substring matches (prioritized)
    // UPDATED: Now searches in title and question fields (not question_full)
    const exactMatches = this.questions.filter(q => {
      const title = q.title ? q.title.toLowerCase() : ''
      const question = q.question ? q.question.toLowerCase() : ''
      return title.includes(searchTerm) || question.includes(searchTerm)
    })

    // Fuzzy matches
    const fuzzyMatches = this.fuzzySearch(term)

    // Combine: exact matches first, then fuzzy (excluding duplicates)
    // UPDATED: Uses reference (semantic ID) instead of id
    const exactIds = new Set(exactMatches.map(q => q.reference))
    const fuzzyUnique = fuzzyMatches.filter(q => !exactIds.has(q.reference))

    return [...exactMatches, ...fuzzyUnique]
  }

  /**
   * Search by category (filter results)
   * UPDATED: Uses primary_category and categories array instead of category_id
   */
  searchByCategory(term, categoryReference) {
    const allResults = this.search(term)
    return allResults.filter(q =>
      q.primary_category === categoryReference ||
      (q.categories && q.categories.includes(categoryReference))
    )
  }

  /**
   * Get search suggestions (top 10 matches)
   */
  getSuggestions(term, limit = 10) {
    const results = this.search(term)
    return results.slice(0, limit)
  }
}

export default SearchService
