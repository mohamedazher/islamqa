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
      quiz_sessions: '++id, quiz_config_id'  // For active quiz sessions
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
   * Import categories in bulk
   */
  async importCategories(categories) {
    try {
      await this.categories.bulkPut(categories)
      console.log(`✅ Imported ${categories.length} categories`)
    } catch (error) {
      console.error('Error importing categories:', error)
      throw error
    }
  }

  /**
   * Import questions in bulk
   */
  async importQuestions(questions) {
    try {
      await this.questions.bulkPut(questions)
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
   * Clear all data (for debugging/reset)
   * UPDATED: Removed answers from transaction since table no longer exists
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
        this.quiz_sessions
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
