/**
 * Dexie Database Service
 * Modern IndexedDB wrapper for cross-platform data persistence
 * Works in browsers, Cordova, and all platforms
 */

import Dexie from 'dexie'

class DexieDatabase extends Dexie {
  constructor() {
    super('IslamQA')

    // Define database schema (final)
    // Using semantic reference IDs from IslamQA as primary keys for all data
    // - categories: reference (semantic ID) is primary key
    // - questions: reference (semantic ID) is primary key
    // - folder_questions: uses reference (semantic ID)
    // - latest_questions: uses reference (semantic ID)
    // - answers are embedded in questions.answer field (no separate table)
    this.version(1).stores({
      categories: 'reference, parent_reference',
      questions: 'reference, primary_category',
      folders: '++id, folder_name',
      folder_questions: '++id, reference, folder_id',
      latest_questions: 'reference, primary_category',  // UPDATED: primary_category instead of category_id
      settings: 'key',
      // NEW: Quiz system tables
      quiz_configurations: '++id, mode, difficulty',
      quiz_attempts: '++id, session_id, completion_date',
      quiz_sessions: '++id, quiz_config_id',  // For active quiz sessions
      quiz_questions: 'reference'  // Pre-generated quiz questions by LLM, indexed by question reference
    })

    // Version 2: Add AI chat support with embeddings and summaries
    this.version(2).stores({
      categories: 'reference, parent_reference',
      questions: 'reference, primary_category',
      folders: '++id, folder_name',
      folder_questions: '++id, reference, folder_id',
      latest_questions: 'reference, primary_category',
      settings: 'key',
      quiz_configurations: '++id, mode, difficulty',
      quiz_attempts: '++id, session_id, completion_date',
      quiz_sessions: '++id, quiz_config_id',
      quiz_questions: 'reference',
      // NEW: AI chat tables for semantic search
      ai_summaries: 'reference',  // LLM-generated summaries, tags, key_terms per question
      ai_embeddings: 'reference'   // Gemini embeddings (768 dimensions) per question
    })

    // Version 3: Add Dua & Adhkar tables
    this.version(3).stores({
      categories: 'reference, parent_reference',
      questions: 'reference, primary_category',
      folders: '++id, folder_name',
      folder_questions: '++id, reference, folder_id',
      latest_questions: 'reference, primary_category',
      settings: 'key',
      quiz_configurations: '++id, mode, difficulty',
      quiz_attempts: '++id, session_id, completion_date',
      quiz_sessions: '++id, quiz_config_id',
      quiz_questions: 'reference',
      ai_summaries: 'reference',
      ai_embeddings: 'reference',
      // NEW: Dua & Adhkar tables
      dua_categories: 'id, parent_id, type, order',
      duas: 'id, category_id, order',
      dua_favorites: '++id, dua_id',
      dua_settings: 'key'
    })

    // Version 4: Add numeric_id index to dua_categories for category lookup
    this.version(4).stores({
      categories: 'reference, parent_reference',
      questions: 'reference, primary_category',
      folders: '++id, folder_name',
      folder_questions: '++id, reference, folder_id',
      latest_questions: 'reference, primary_category',
      settings: 'key',
      quiz_configurations: '++id, mode, difficulty',
      quiz_attempts: '++id, session_id, completion_date',
      quiz_sessions: '++id, quiz_config_id',
      quiz_questions: 'reference',
      ai_summaries: 'reference',
      ai_embeddings: 'reference',
      // UPDATED: Added numeric_id index to dua_categories
      dua_categories: 'id, parent_id, type, order, numeric_id',
      duas: 'id, category_id, order',
      dua_favorites: '++id, dua_id',
      dua_settings: 'key'
    })

    // Shortcuts to tables
    this.categories = this.table('categories')
    this.questions = this.table('questions')
    // REMOVED: this.answers - no longer needed
    this.folders = this.table('folders')
    this.folder_questions = this.table('folder_questions')
    this.latest_questions = this.table('latest_questions')
    this.settings = this.table('settings')
    // NEW: Quiz tables
    this.quiz_configurations = this.table('quiz_configurations')
    this.quiz_attempts = this.table('quiz_attempts')
    this.quiz_sessions = this.table('quiz_sessions')
    this.quiz_questions = this.table('quiz_questions')
    // NEW: AI chat tables
    this.ai_summaries = this.table('ai_summaries')
    this.ai_embeddings = this.table('ai_embeddings')
    // NEW: Dua & Adhkar tables
    this.dua_categories = this.table('dua_categories')
    this.duas = this.table('duas')
    this.dua_favorites = this.table('dua_favorites')
    this.dua_settings = this.table('dua_settings')
  }

  /**
   * Check if database has been imported
   */
  async isImported() {
    try {
      const setting = await this.settings.get('import_status')
      return setting?.value === 'completed'
    } catch (error) {
      console.error('Error checking import status:', error)
      return false
    }
  }

  /**
   * Mark database as imported
   */
  async markAsImported() {
    try {
      await this.settings.put({
        key: 'import_status',
        value: 'completed',
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Error marking as imported:', error)
    }
  }

  /**
   * Check if database has data
   */
  async hasData() {
    try {
      const count = await this.questions.count()
      return count > 0
    } catch (error) {
      console.error('Error checking data:', error)
      return false
    }
  }

  /**
   * Get database statistics
   * UPDATED: Removed answers count since answers are embedded in questions
   */
  async getStats() {
    try {
      const [categoriesCount, questionsCount] = await Promise.all([
        this.categories.count(),
        this.questions.count()
      ])
      return {
        categories: categoriesCount,
        questions: questionsCount
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return { categories: 0, questions: 0 }
    }
  }

  /**
   * Import categories in bulk with batching and progress updates
   * @param {Array} categories - Array of category objects to import
   * @param {Function} onProgress - Optional callback for progress updates
   */
  async importCategories(categories, onProgress = null) {
    try {
      const BATCH_SIZE = 100 // Import 100 categories at a time
      const totalItems = categories.length
      const totalBatches = Math.ceil(totalItems / BATCH_SIZE)

      console.log(`📦 Importing ${totalItems} categories in ${totalBatches} batches of ${BATCH_SIZE}`)

      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE
        const end = Math.min(start + BATCH_SIZE, totalItems)
        const batch = categories.slice(start, end)

        // Import this batch
        await this.categories.bulkPut(batch)

        const itemsProcessed = end

        // Report progress
        if (onProgress) {
          onProgress({
            batchIndex: i + 1,
            totalBatches,
            itemsProcessed,
            totalItems,
            percentage: (itemsProcessed / totalItems) * 100
          })
        }

        console.log(`  ✓ Batch ${i + 1}/${totalBatches} (${itemsProcessed}/${totalItems} categories)`)

        // Yield to event loop to allow UI updates (except on last batch)
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }

      console.log(`✅ Imported ${categories.length} categories`)
    } catch (error) {
      console.error('Error importing categories:', error)
      throw error
    }
  }

  /**
   * Import questions in bulk with batching and progress updates
   * @param {Array} questions - Array of question objects to import
   * @param {Function} onProgress - Optional callback for progress updates (batchIndex, totalBatches, itemsProcessed, totalItems)
   */
  async importQuestions(questions, onProgress = null) {
    try {
      const BATCH_SIZE = 500 // Import 500 questions at a time
      const totalItems = questions.length
      const totalBatches = Math.ceil(totalItems / BATCH_SIZE)

      console.log(`📦 Importing ${totalItems} questions in ${totalBatches} batches of ${BATCH_SIZE}`)

      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE
        const end = Math.min(start + BATCH_SIZE, totalItems)
        const batch = questions.slice(start, end)

        // Import this batch
        await this.questions.bulkPut(batch)

        const itemsProcessed = end

        // Report progress
        if (onProgress) {
          onProgress({
            batchIndex: i + 1,
            totalBatches,
            itemsProcessed,
            totalItems,
            percentage: (itemsProcessed / totalItems) * 100
          })
        }

        console.log(`  ✓ Batch ${i + 1}/${totalBatches} (${itemsProcessed}/${totalItems} questions)`)

        // Yield to event loop to allow UI updates (except on last batch)
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }

      console.log(`✅ Imported ${questions.length} questions`)
    } catch (error) {
      console.error('Error importing questions:', error)
      throw error
    }
  }

  /**
   * DEPRECATED: Answers are now embedded in questions
   * This method is no longer needed - answers come with the question data
   */
  async importAnswers(answers) {
    console.warn('⚠️  importAnswers() is deprecated. Answers are now embedded in questions.answer')
    // Silently succeed for backward compatibility, but don't do anything
  }

  /**
   * Get all categories or filter by parent reference
   * UPDATED: Now uses parent_reference (semantic ID) instead of parent element
   * parentReference can be null for root categories, or reference like 3, 21, 4 for subcategories
   */
  async getCategories(parentReference = null) {
    try {
      // Handle root categories separately (null values can't use .equals())
      if (parentReference === null) {
        const results = await this.categories
          .filter(cat => cat.parent_reference === null)
          .toArray()
        console.log(`Found ${results.length} root categories (parent_reference=null)`)
        return results
      }

      // Convert to number if it's a string (from route params)
      const refNum = typeof parentReference === 'string' ? parseInt(parentReference, 10) : parentReference

      // Query by parent_reference for non-null values
      const results = await this.categories.where('parent_reference').equals(refNum).toArray()
      console.log(`Found ${results.length} categories with parent_reference=${refNum}`)
      return results
    } catch (error) {
      console.error('Error getting categories:', error)
      return []
    }
  }

  /**
   * Get all descendant category references for a given category (recursive)
   * Used for quiz filtering to include subcategories
   */
  async getAllDescendantCategoryReferences(categoryReference) {
    try {
      const refNum = typeof categoryReference === 'string' ? parseInt(categoryReference, 10) : categoryReference
      const category = await this.categories.where('reference').equals(refNum).first()

      if (!category) {
        return [refNum] // Return just the reference if category not found
      }

      // Start with the current category
      const descendants = [refNum]

      // If it has children, recursively get their descendants
      if (category.children_references && category.children_references.length > 0) {
        for (const childRef of category.children_references) {
          const childDescendants = await this.getAllDescendantCategoryReferences(childRef)
          descendants.push(...childDescendants)
        }
      }

      return descendants
    } catch (error) {
      console.error('Error getting descendant categories:', error)
      return [categoryReference]
    }
  }

  /**
   * Get category by reference (semantic ID from IslamQA)
   * UPDATED: Now queries by reference field instead of element
   * The route passes reference as the ID since that's the semantic identifier
   */
  async getCategory(reference) {
    try {
      // Convert to number if it's a string (from route params)
      const refNum = typeof reference === 'string' ? parseInt(reference, 10) : reference
      const category = await this.categories.where('reference').equals(refNum).first()
      console.log(`Looking for category with reference=${refNum}:`, category)
      return category
    } catch (error) {
      console.error('Error getting category:', error)
      return null
    }
  }

  /**
   * Get questions by category reference (semantic ID)
   * UPDATED: Now uses primary_category instead of category_id
   * categoryReference should be the reference field (e.g. 3, 21, 245)
   * Note: Questions can belong to multiple categories (categories array), but we query by primary_category
   */
  async getQuestionsByCategory(categoryReference, limit = 100, offset = 0) {
    try {
      // Convert to number if it's a string (from route params)
      const refNum = typeof categoryReference === 'string' ? parseInt(categoryReference, 10) : categoryReference

      const results = await this.questions
        .where('primary_category')
        .equals(refNum)
        .offset(offset)
        .limit(limit)
        .toArray()

      console.log(`Found ${results.length} questions for primary_category=${refNum}`)
      return results
    } catch (error) {
      console.error('Error getting questions:', error)
      return []
    }
  }

  /**
   * Get question by reference (semantic ID from IslamQA)
   * UPDATED: Now queries by reference field instead of id
   */
  async getQuestion(reference) {
    try {
      // Convert to number if it's a string
      const refNum = typeof reference === 'string' ? parseInt(reference) : reference

      const question = await this.questions.where('reference').equals(refNum).first()
      console.log(`Looking for question with reference=${refNum}:`, question)
      return question
    } catch (error) {
      console.error('Error getting question:', error)
      return null
    }
  }

  /**
   * Get answer by question reference
   * UPDATED: Answers are now embedded in the question object (question.answer field)
   * This method retrieves the full question which contains the answer
   */
  async getAnswer(questionReference) {
    try {
      // Convert to number if it's a string
      const refNum = typeof questionReference === 'string' ? parseInt(questionReference) : questionReference

      // Get the question which contains the answer
      const question = await this.questions.where('reference').equals(refNum).first()
      console.log(`Looking for answer for question with reference=${refNum}`)

      // Return the question object which contains the answer field
      return question
    } catch (error) {
      console.error('Error getting answer:', error)
      return null
    }
  }

  /**
   * Search questions by text
   * UPDATED: Searches in title and question fields (not question_full)
   */
  async searchQuestions(searchTerm, limit = 50) {
    try {
      const term = searchTerm.toLowerCase()
      const results = await this.questions
        .filter(q =>
          q.title?.toLowerCase().includes(term) ||
          q.question?.toLowerCase().includes(term)
        )
        .limit(limit)
        .toArray()
      return results
    } catch (error) {
      console.error('Error searching questions:', error)
      return []
    }
  }

  /**
   * Get all questions (for fuzzy search initialization)
   */
  async getAllQuestions() {
    try {
      return await this.questions.toArray()
    } catch (error) {
      console.error('Error getting all questions:', error)
      return []
    }
  }

  /**
   * Get all folders
   */
  async getFolders() {
    try {
      return await this.folders.toArray()
    } catch (error) {
      console.error('Error getting folders:', error)
      return []
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(folderName) {
    try {
      const id = await this.folders.add({ folder_name: folderName })
      return id
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  }

  /**
   * Delete a folder
   */
  async deleteFolder(folderId) {
    try {
      await this.transaction('rw', [this.folders, this.folder_questions], async () => {
        await this.folders.delete(folderId)
        await this.folder_questions.where('folder_id').equals(folderId).delete()
      })
    } catch (error) {
      console.error('Error deleting folder:', error)
      throw error
    }
  }

  /**
   * Add question to folder
   * UPDATED: Uses reference (semantic ID) instead of question_id
   */
  async addQuestionToFolder(questionReference, folderId) {
    try {
      // Check if already exists
      const existing = await this.folder_questions
        .where('[reference+folder_id]')
        .equals([questionReference, folderId])
        .first()

      if (existing) {
        return // Already bookmarked
      }

      await this.folder_questions.add({
        reference: questionReference,  // Store the semantic ID reference
        folder_id: folderId
      })
    } catch (error) {
      console.error('Error adding question to folder:', error)
      throw error
    }
  }

  /**
   * Remove question from folder
   * UPDATED: Uses reference (semantic ID) instead of question_id
   */
  async removeQuestionFromFolder(questionReference, folderId) {
    try {
      await this.folder_questions
        .where('[reference+folder_id]')
        .equals([questionReference, folderId])
        .delete()
    } catch (error) {
      console.error('Error removing question from folder:', error)
      throw error
    }
  }

  /**
   * Get questions in a folder
   * UPDATED: Uses reference (semantic ID) instead of question_id
   */
  async getQuestionsInFolder(folderId) {
    try {
      const folderQuestions = await this.folder_questions
        .where('folder_id')
        .equals(folderId)
        .toArray()

      const questionReferences = folderQuestions.map(fq => fq.reference)
      const questions = await this.questions
        .where('reference')
        .anyOf(questionReferences)
        .toArray()

      return questions
    } catch (error) {
      console.error('Error getting folder questions:', error)
      return []
    }
  }

  /**
   * Get quiz configurations by mode
   * Modes: 'daily', 'rapid-fire', 'category', 'challenge'
   */
  async getQuizConfigurations(mode = null) {
    try {
      let query = this.quiz_configurations
      if (mode) {
        query = query.where('mode').equals(mode)
      }
      const configs = await query.toArray()
      console.log(`Found ${configs.length} quiz configurations${mode ? ` for mode=${mode}` : ''}`)
      return configs
    } catch (error) {
      console.error('Error getting quiz configurations:', error)
      return []
    }
  }

  /**
   * Get a specific quiz configuration
   */
  async getQuizConfiguration(configId) {
    try {
      const config = await this.quiz_configurations.get(configId)
      return config || null
    } catch (error) {
      console.error('Error getting quiz configuration:', error)
      return null
    }
  }

  /**
   * Create a quiz configuration (for seeding initial data)
   */
  async createQuizConfiguration(config) {
    try {
      const id = await this.quiz_configurations.add(config)
      console.log(`✅ Created quiz configuration with id=${id}`)
      return id
    } catch (error) {
      console.error('Error creating quiz configuration:', error)
      throw error
    }
  }

  /**
   * Save a quiz attempt
   */
  async saveQuizAttempt(attempt) {
    try {
      const id = await this.quiz_attempts.add({
        ...attempt,
        completion_date: Date.now()
      })
      console.log(`✅ Saved quiz attempt with id=${id}`)
      return id
    } catch (error) {
      console.error('Error saving quiz attempt:', error)
      throw error
    }
  }

  /**
   * Get quiz attempts (optionally filtered by session_id)
   */
  async getQuizAttempts(sessionId = null) {
    try {
      let query = this.quiz_attempts
      if (sessionId) {
        query = query.where('session_id').equals(sessionId)
      }
      const attempts = await query.toArray()
      return attempts
    } catch (error) {
      console.error('Error getting quiz attempts:', error)
      return []
    }
  }

  /**
   * Get quiz stats (total attempts, average score, etc)
   */
  async getQuizStats() {
    try {
      const attempts = await this.quiz_attempts.toArray()
      if (attempts.length === 0) {
        return { total_attempts: 0, average_score: 0, total_points: 0 }
      }

      const total_points = attempts.reduce((sum, a) => sum + (a.points || 0), 0)
      const total_correct = attempts.reduce((sum, a) => sum + (a.correct || 0), 0)
      const total_questions = attempts.reduce((sum, a) => sum + (a.total || 0), 0)
      const average_accuracy = total_questions > 0 ? (total_correct / total_questions * 100).toFixed(1) : 0

      return {
        total_attempts: attempts.length,
        total_points,
        total_questions,
        total_correct,
        average_accuracy: parseFloat(average_accuracy)
      }
    } catch (error) {
      console.error('Error getting quiz stats:', error)
      return { total_attempts: 0, average_score: 0, total_points: 0 }
    }
  }

  /**
   * Get quiz question for a question reference
   * Returns null if not available
   */
  async getQuizQuestion(questionReference) {
    try {
      const quizQuestion = await this.quiz_questions.get(questionReference)
      return quizQuestion || null
    } catch (error) {
      console.error('Error getting quiz question:', error)
      return null
    }
  }

  /**
   * Save quiz question (generated by LLM)
   */
  async saveQuizQuestion(quizQuestion) {
    try {
      const result = await this.quiz_questions.put({
        reference: quizQuestion.reference,
        questionText: quizQuestion.questionText,
        options: quizQuestion.options,
        explanation: quizQuestion.explanation,
        difficulty: quizQuestion.difficulty,
        tags: quizQuestion.tags || [],
        source: quizQuestion.source || 'llm-generated',
        generatedDate: Date.now(),
        ...quizQuestion  // Include any other fields
      })
      return result
    } catch (error) {
      console.error('Error saving quiz question:', error)
      throw error
    }
  }

  /**
   * Bulk import quiz questions from batch
   */
  async bulkImportQuizQuestions(quizQuestions) {
    try {
      const processed = quizQuestions.map(q => ({
        reference: q.reference,
        questionText: q.questionText,
        options: q.options,
        explanation: q.explanation,
        difficulty: q.difficulty,
        tags: q.tags || [],
        source: q.source || 'llm-generated',
        generatedDate: q.generatedDate || Date.now(),
        ...q
      }))

      await this.quiz_questions.bulkPut(processed)
      console.log(`✅ Imported ${quizQuestions.length} quiz questions`)
      return quizQuestions.length
    } catch (error) {
      console.error('Error bulk importing quiz questions:', error)
      throw error
    }
  }

  /**
   * Get all quiz questions (LLM-generated questions only)
   */
  async getAllQuizQuestions() {
    try {
      return await this.quiz_questions.toArray()
    } catch (error) {
      console.error('Error getting all quiz questions:', error)
      return []
    }
  }

  /**
   * Get count of quiz questions
   */
  async getQuizQuestionStats() {
    try {
      const count = await this.quiz_questions.count()
      const total = await this.questions.count()
      return {
        quizQuestions: count,
        total: total,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
      }
    } catch (error) {
      console.error('Error getting quiz question stats:', error)
      return { quizQuestions: 0, total: 0, percentage: 0 }
    }
  }

  // ==========================================
  // AI Chat Methods (Summaries & Embeddings)
  // ==========================================

  /**
   * Import AI summaries in bulk
   * @param {Object} summaries - Object with reference keys and summary data values
   * @param {Function} onProgress - Optional progress callback
   */
  async importSummaries(summaries, onProgress = null) {
    try {
      const entries = Object.entries(summaries)
      const BATCH_SIZE = 500
      const totalItems = entries.length
      const totalBatches = Math.ceil(totalItems / BATCH_SIZE)

      console.log(`📦 Importing ${totalItems} AI summaries in ${totalBatches} batches`)

      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE
        const end = Math.min(start + BATCH_SIZE, totalItems)
        const batch = entries.slice(start, end).map(([reference, data]) => ({
          reference: String(reference),
          summary: data.summary || '',
          tags: data.tags || [],
          key_terms: data.key_terms || [],
          query_phrases: data.query_phrases || [],
          ruling: data.ruling || null
        }))

        await this.ai_summaries.bulkPut(batch)

        if (onProgress) {
          onProgress({
            batchIndex: i + 1,
            totalBatches,
            itemsProcessed: end,
            totalItems,
            percentage: (end / totalItems) * 100
          })
        }

        // Yield to event loop
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }

      console.log(`✅ Imported ${totalItems} AI summaries`)
    } catch (error) {
      console.error('Error importing AI summaries:', error)
      throw error
    }
  }

  /**
   * Import AI embeddings in bulk
   * @param {Object} embeddings - Object with reference keys and vector arrays
   * @param {Function} onProgress - Optional progress callback
   */
  async importEmbeddings(embeddings, onProgress = null) {
    try {
      const entries = Object.entries(embeddings)
      const BATCH_SIZE = 200 // Smaller batch for large vectors
      const totalItems = entries.length
      const totalBatches = Math.ceil(totalItems / BATCH_SIZE)

      console.log(`📦 Importing ${totalItems} AI embeddings in ${totalBatches} batches`)

      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE
        const end = Math.min(start + BATCH_SIZE, totalItems)
        const batch = entries.slice(start, end).map(([reference, vector]) => ({
          reference: String(reference),
          vector: vector // 768-dimension array from Gemini
        }))

        await this.ai_embeddings.bulkPut(batch)

        if (onProgress) {
          onProgress({
            batchIndex: i + 1,
            totalBatches,
            itemsProcessed: end,
            totalItems,
            percentage: (end / totalItems) * 100
          })
        }

        // Yield to event loop
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }

      console.log(`✅ Imported ${totalItems} AI embeddings`)
    } catch (error) {
      console.error('Error importing AI embeddings:', error)
      throw error
    }
  }

  /**
   * Get all AI summaries as object (for chatSearchService)
   * @returns {Object} - Object with reference keys and summary data
   */
  async getAllSummaries() {
    try {
      const summaries = await this.ai_summaries.toArray()
      const result = {}
      for (const s of summaries) {
        result[s.reference] = {
          summary: s.summary,
          tags: s.tags,
          key_terms: s.key_terms,
          query_phrases: s.query_phrases,
          ruling: s.ruling
        }
      }
      console.log(`📖 Loaded ${summaries.length} AI summaries from Dexie`)
      return result
    } catch (error) {
      console.error('Error getting AI summaries:', error)
      return {}
    }
  }

  /**
   * Get all AI embeddings as object (for chatSearchService)
   * @returns {Object} - Object with reference keys and vector arrays
   */
  async getAllEmbeddings() {
    try {
      const embeddings = await this.ai_embeddings.toArray()
      const result = {}
      for (const e of embeddings) {
        result[e.reference] = e.vector
      }
      console.log(`🔢 Loaded ${embeddings.length} AI embeddings from Dexie`)
      return result
    } catch (error) {
      console.error('Error getting AI embeddings:', error)
      return {}
    }
  }

  /**
   * Get AI summary for a specific question
   */
  async getSummary(reference) {
    try {
      const refStr = String(reference)
      return await this.ai_summaries.get(refStr)
    } catch (error) {
      console.error('Error getting AI summary:', error)
      return null
    }
  }

  /**
   * Get AI embedding for a specific question
   */
  async getEmbedding(reference) {
    try {
      const refStr = String(reference)
      return await this.ai_embeddings.get(refStr)
    } catch (error) {
      console.error('Error getting AI embedding:', error)
      return null
    }
  }

  /**
   * Get AI data stats
   */
  async getAiStats() {
    try {
      const [summariesCount, embeddingsCount] = await Promise.all([
        this.ai_summaries.count(),
        this.ai_embeddings.count()
      ])
      return {
        summaries: summariesCount,
        embeddings: embeddingsCount
      }
    } catch (error) {
      console.error('Error getting AI stats:', error)
      return { summaries: 0, embeddings: 0 }
    }
  }

  /**
   * Check if AI data has been imported
   */
  async hasAiData() {
    try {
      const count = await this.ai_embeddings.count()
      return count > 0
    } catch (error) {
      console.error('Error checking AI data:', error)
      return false
    }
  }

  // ==========================================
  // Dua & Adhkar Methods
  // ==========================================

  /**
   * Get all dua categories, optionally filtered by type
   * @param {string|null} type - 'main' or 'other', null for all
   */
  async getDuaCategories(type = null) {
    try {
      let query = this.dua_categories.orderBy('order')
      const all = await query.toArray()
      console.log(`📚 getDuaCategories: Found ${all.length} total categories in DB`)
      if (all.length > 0) {
        console.log(`  → First category:`, all[0])
        console.log(`  → Sample category keys:`, Object.keys(all[0]))
      }
      if (type) {
        const filtered = all.filter(c => c.type === type)
        console.log(`  → Filtered to ${filtered.length} ${type} categories`)
        return filtered
      }
      return all
    } catch (error) {
      console.error('Error getting dua categories:', error)
      return []
    }
  }

  /**
   * Get a single dua category by id
   */
  async getDuaCategory(id) {
    try {
      console.log(`📂 getDuaCategory called with: ${id} (type: ${typeof id})`)

      // First try direct lookup by string ID (e.g., "morning")
      let category = await this.dua_categories.get(id)
      if (category) {
        console.log(`  ✅ Found category by string ID: ${id}`)
        return category
      }

      // If not found, try numeric ID lookup
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      if (!isNaN(numericId)) {
        console.log(`  🔍 Searching by numeric_id: ${numericId}`)
        category = await this.dua_categories
          .where('numeric_id')
          .equals(numericId)
          .first()

        if (category) {
          console.log(`  ✅ Found category by numeric_id: ${numericId}`)
          return category
        }
      }

      console.warn(`  ⚠️ Category not found: ${id}`)
      return null
    } catch (error) {
      console.error('Error getting dua category:', error)
      return null
    }
  }

  /**
   * Get duas by category id
   * In Hisn al-Muslim data: categoryId is a string like "morning_evening"
   */
  async getDuasByCategory(categoryId) {
    try {
      console.log(`🔍 getDuasByCategory called with: ${categoryId} (type: ${typeof categoryId})`)

      // In the Hisn al-Muslim data structure:
      // - Categories have string `id` (e.g., "morning_evening")
      // - Duas have string `category_id` that matches the category's `id`
      const stringId = String(categoryId)

      console.log(`  → Querying duas with category_id = "${stringId}"`)
      const results = await this.duas
        .where('category_id')
        .equals(stringId)
        .sortBy('order')

      console.log(`  → Found ${results.length} duas`)
      return results
    } catch (error) {
      console.error('Error getting duas by category:', error)
      return []
    }
  }

  /**
   * Get a single dua by id
   */
  async getDua(id) {
    try {
      return await this.duas.get(id)
    } catch (error) {
      console.error('Error getting dua:', error)
      return null
    }
  }

  /**
   * Get all favorite dua ids
   */
  async getDuaFavorites() {
    try {
      const favorites = await this.dua_favorites.toArray()
      return favorites.map(f => f.dua_id)
    } catch (error) {
      console.error('Error getting dua favorites:', error)
      return []
    }
  }

  /**
   * Add dua to favorites
   */
  async addDuaFavorite(duaId) {
    try {
      const existing = await this.dua_favorites
        .where('dua_id')
        .equals(duaId)
        .first()
      if (!existing) {
        await this.dua_favorites.add({ dua_id: duaId })
      }
    } catch (error) {
      console.error('Error adding dua favorite:', error)
      throw error
    }
  }

  /**
   * Remove dua from favorites
   */
  async removeDuaFavorite(duaId) {
    try {
      await this.dua_favorites
        .where('dua_id')
        .equals(duaId)
        .delete()
    } catch (error) {
      console.error('Error removing dua favorite:', error)
      throw error
    }
  }

  /**
   * Check if dua is favorited
   */
  async isDuaFavorite(duaId) {
    try {
      const favorite = await this.dua_favorites
        .where('dua_id')
        .equals(duaId)
        .first()
      return !!favorite
    } catch (error) {
      console.error('Error checking dua favorite:', error)
      return false
    }
  }

  /**
   * Get dua settings
   */
  async getDuaSettings() {
    try {
      const settings = await this.dua_settings.toArray()
      const result = {}
      settings.forEach(s => { result[s.key] = s.value })
      return {
        arabic_font_size: result.arabic_font_size ?? 28,
        transliteration_font_size: result.transliteration_font_size ?? 16,
        translation_font_size: result.translation_font_size ?? 14,
        show_transliteration: result.show_transliteration ?? true,
        show_translation: result.show_translation ?? true,
        show_reference: result.show_reference ?? true,
        show_virtue: result.show_virtue ?? true
      }
    } catch (error) {
      console.error('Error getting dua settings:', error)
      return {
        arabic_font_size: 28,
        transliteration_font_size: 16,
        translation_font_size: 14,
        show_transliteration: true,
        show_translation: true,
        show_reference: true,
        show_virtue: true
      }
    }
  }

  /**
   * Update dua settings
   */
  async updateDuaSettings(settings) {
    try {
      const entries = Object.entries(settings)
      for (const [key, value] of entries) {
        await this.dua_settings.put({ key, value })
      }
    } catch (error) {
      console.error('Error updating dua settings:', error)
      throw error
    }
  }

  /**
   * Import dua categories
   */
  async importDuaCategories(categories) {
    try {
      await this.dua_categories.bulkPut(categories)
      console.log(`✅ Imported ${categories.length} dua categories`)
    } catch (error) {
      console.error('Error importing dua categories:', error)
      throw error
    }
  }

  /**
   * Import duas with batching
   */
  async importDuas(duas) {
    try {
      console.log(`📝 importDuas called with ${duas.length} duas`)
      if (duas.length > 0) {
        console.log(`  → First dua:`, duas[0])
        console.log(`  → Last dua:`, duas[duas.length - 1])
      }

      // Import in batches like we do for questions
      const BATCH_SIZE = 100
      const batches = Math.ceil(duas.length / BATCH_SIZE)

      for (let i = 0; i < batches; i++) {
        const start = i * BATCH_SIZE
        const end = Math.min(start + BATCH_SIZE, duas.length)
        const batch = duas.slice(start, end)

        console.log(`  📝 Batch ${i + 1}/${batches}: Importing duas ${start + 1}-${end}`)
        await this.duas.bulkPut(batch)
      }

      console.log(`✅ Imported ${duas.length} duas in ${batches} batches`)
    } catch (error) {
      console.error('❌ Error importing duas:', error)
      throw error
    }
  }

  /**
   * Check if dua data is imported
   */
  async hasDuaData() {
    try {
      const count = await this.dua_categories.count()
      return count > 0
    } catch (error) {
      console.error('Error checking dua data:', error)
      return false
    }
  }

  /**
   * Get dua stats
   */
  async getDuaStats() {
    try {
      const [categoriesCount, duasCount, favoritesCount] = await Promise.all([
        this.dua_categories.count(),
        this.duas.count(),
        this.dua_favorites.count()
      ])
      return {
        categories: categoriesCount,
        duas: duasCount,
        favorites: favoritesCount
      }
    } catch (error) {
      console.error('Error getting dua stats:', error)
      return { categories: 0, duas: 0, favorites: 0 }
    }
  }

  /**
   * Clear all data (for debugging/reset)
   * UPDATED: Includes AI tables and Dua tables
   */
  async clearAllData() {
    try {
      await this.transaction('rw', [
        this.categories,
        this.questions,
        this.folders,
        this.folder_questions,
        this.latest_questions,
        this.settings,
        this.quiz_configurations,
        this.quiz_attempts,
        this.quiz_sessions,
        this.quiz_questions,
        this.ai_summaries,
        this.ai_embeddings,
        this.dua_categories,
        this.duas,
        this.dua_favorites,
        this.dua_settings
      ], async () => {
        await this.categories.clear()
        await this.questions.clear()
        await this.folders.clear()
        await this.folder_questions.clear()
        await this.latest_questions.clear()
        await this.settings.clear()
        await this.quiz_configurations.clear()
        await this.quiz_attempts.clear()
        await this.quiz_sessions.clear()
        await this.quiz_questions.clear()
        await this.ai_summaries.clear()
        await this.ai_embeddings.clear()
        await this.dua_categories.clear()
        await this.duas.clear()
        await this.dua_favorites.clear()
        await this.dua_settings.clear()
      })
      console.log('✅ Database cleared')
    } catch (error) {
      console.error('Error clearing database:', error)
      throw error
    }
  }
}

// Export singleton instance
export const dexieDb = new DexieDatabase()
export default dexieDb
