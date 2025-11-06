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
    this.version(1).stores({
      categories: 'id, parent, element',
      questions: 'id, category_id, question',
      answers: 'id, question_id',
      folders: '++id, folder_name',
      folder_questions: '++id, question_id, folder_id',
      latest_questions: 'id, category_id',
      settings: 'key' // Store import status and other settings
    })

    // Shortcuts to tables
    this.categories = this.table('categories')
    this.questions = this.table('questions')
    this.answers = this.table('answers')
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
   */
  async getStats() {
    try {
      const [categoriesCount, questionsCount, answersCount] = await Promise.all([
        this.categories.count(),
        this.questions.count(),
        this.answers.count()
      ])
      return {
        categories: categoriesCount,
        questions: questionsCount,
        answers: answersCount
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return { categories: 0, questions: 0, answers: 0 }
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
   * Import answers in bulk
   */
  async importAnswers(answers) {
    try {
      await this.answers.bulkPut(answers)
      console.log(`✅ Imported ${answers.length} answers`)
    } catch (error) {
      console.error('Error importing answers:', error)
      throw error
    }
  }

  /**
   * Get all categories or filter by parent
   * parentId can be "0" for root categories or element id like "218" for subcategories
   */
  async getCategories(parentId = 0) {
    try {
      // Convert to string for consistent comparison (data stores parent as strings)
      const parentStr = String(parentId)
      return await this.categories.where('parent').equals(parentStr).toArray()
    } catch (error) {
      console.error('Error getting categories:', error)
      return []
    }
  }

  /**
   * Get category by element (actual category ID, not row id)
   * The route passes element as the ID since that's the semantic identifier
   */
  async getCategory(elementId) {
    try {
      // Convert to string for consistent comparison with how data is stored
      const elementStr = String(elementId)
      return await this.categories.where('element').equals(elementStr).first()
    } catch (error) {
      console.error('Error getting category:', error)
      return null
    }
  }

  /**
   * Get questions by category ID (element, not id)
   * categoryId should be the element field (e.g. "218"), not the primary id
   */
  async getQuestionsByCategory(categoryId, limit = 100, offset = 0) {
    try {
      // Convert to string for consistent comparison (data stores category_id as strings)
      const categoryStr = String(categoryId)
      return await this.questions
        .where('category_id')
        .equals(categoryStr)
        .offset(offset)
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Error getting questions:', error)
      return []
    }
  }

  /**
   * Get question by ID
   */
  async getQuestion(id) {
    try {
      return await this.questions.get(parseInt(id))
    } catch (error) {
      console.error('Error getting question:', error)
      return null
    }
  }

  /**
   * Get answer by question ID
   */
  async getAnswer(questionId) {
    try {
      // Try with string first (as stored in data), then try with integer
      const questionStr = String(questionId)
      let answer = await this.answers.where('question_id').equals(questionStr).first()

      // If not found and questionId looks numeric, try as integer
      if (!answer && !isNaN(questionId)) {
        answer = await this.answers.where('question_id').equals(parseInt(questionId)).first()
      }

      return answer
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
   */
  async clearAllData() {
    try {
      await this.transaction('rw', [
        this.categories,
        this.questions,
        this.answers,
        this.folders,
        this.folder_questions,
        this.latest_questions,
        this.settings
      ], async () => {
        await this.categories.clear()
        await this.questions.clear()
        await this.answers.clear()
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
