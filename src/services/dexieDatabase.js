/**
 * Dexie Database Service
 * Modern IndexedDB wrapper for cross-platform data persistence
 * Works in browsers, Cordova, and all platforms
 */

import Dexie from 'dexie'

class DexieDatabase extends Dexie {
  constructor() {
    super('IslamQA')

    // Define database schema
    // UPDATED: Using new dump file data structure
    // - categories: reference is the semantic ID (from IslamQA), parent_reference for hierarchy
    // - questions: reference is semantic ID, primary_category for main category link
    // - answers are now embedded in questions.answer, no separate table needed
    this.version(1).stores({
      categories: '++id, reference, parent_reference',  // ++id is Dexie internal PK, reference is semantic ID
      questions: '++id, reference, primary_category',   // ++id is Dexie internal PK, reference is semantic ID
      // REMOVED: answers table - answers are now embedded in questions.answer field
      folders: '++id, folder_name',
      folder_questions: '++id, question_id, folder_id',
      latest_questions: 'id, category_id',
      settings: 'key' // Store import status and other settings
    })

    // Shortcuts to tables
    this.categories = this.table('categories')
    this.questions = this.table('questions')
    // REMOVED: this.answers - no longer needed
    this.folders = this.table('folders')
    this.folder_questions = this.table('folder_questions')
    this.latest_questions = this.table('latest_questions')
    this.settings = this.table('settings')
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
      // Query by parent_reference
      return await this.categories.where('parent_reference').equals(parentReference).toArray()
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
      return await this.categories.where('reference').equals(reference).first()
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
      return await this.questions
        .where('primary_category')
        .equals(categoryReference)
        .offset(offset)
        .limit(limit)
        .toArray()
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
   */
  async searchQuestions(searchTerm, limit = 50) {
    try {
      const term = searchTerm.toLowerCase()
      const results = await this.questions
        .filter(q =>
          q.question?.toLowerCase().includes(term) ||
          q.question_full?.toLowerCase().includes(term)
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
   */
  async addQuestionToFolder(questionId, folderId) {
    try {
      // Check if already exists
      const existing = await this.folder_questions
        .where('[question_id+folder_id]')
        .equals([questionId, folderId])
        .first()

      if (existing) {
        return // Already bookmarked
      }

      await this.folder_questions.add({
        question_id: questionId,
        folder_id: folderId
      })
    } catch (error) {
      console.error('Error adding question to folder:', error)
      throw error
    }
  }

  /**
   * Remove question from folder
   */
  async removeQuestionFromFolder(questionId, folderId) {
    try {
      await this.folder_questions
        .where('[question_id+folder_id]')
        .equals([questionId, folderId])
        .delete()
    } catch (error) {
      console.error('Error removing question from folder:', error)
      throw error
    }
  }

  /**
   * Get questions in a folder
   */
  async getQuestionsInFolder(folderId) {
    try {
      const folderQuestions = await this.folder_questions
        .where('folder_id')
        .equals(folderId)
        .toArray()

      const questionIds = folderQuestions.map(fq => fq.question_id)
      const questions = await this.questions
        .where('id')
        .anyOf(questionIds)
        .toArray()

      return questions
    } catch (error) {
      console.error('Error getting folder questions:', error)
      return []
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
        this.settings
      ], async () => {
        await this.categories.clear()
        await this.questions.clear()
        await this.folders.clear()
        await this.folder_questions.clear()
        await this.latest_questions.clear()
        await this.settings.clear()
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
