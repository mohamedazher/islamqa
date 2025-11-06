import { defineStore } from 'pinia'
import { ref } from 'vue'
import dexieDb from '@/services/dexieDatabase'

/**
 * Data Store - Reads data from IndexedDB (Dexie)
 * All data persistence is handled by Dexie database
 */
export const useDataStore = defineStore('data', () => {
  const isLoading = ref(false)
  const isReady = ref(false)

  /**
   * Initialize the store (check if database is ready)
   */
  async function initialize() {
    try {
      const hasData = await dexieDb.hasData()
      isReady.value = hasData
      if (hasData) {
        const stats = await dexieDb.getStats()
        console.log('✅ Data store initialized:', stats)
      } else {
        console.log('⚠️  Database is empty, need to import data')
      }
    } catch (error) {
      console.error('Failed to initialize data store:', error)
      isReady.value = false
    }
  }

  /**
   * Get categories by parent ID
   */
  async function getCategoriesByParent(parentElement = 0) {
    try {
      return await dexieDb.getCategories(parentElement)
    } catch (error) {
      console.error('Error getting categories:', error)
      return []
    }
  }

  /**
   * Get category by ID
   */
  async function getCategory(id) {
    try {
      return await dexieDb.getCategory(id)
    } catch (error) {
      console.error('Error getting category:', error)
      return null
    }
  }

  /**
   * Get questions by category ID
   */
  async function getQuestionsByCategory(categoryId, limit = 100, offset = 0) {
    try {
      return await dexieDb.getQuestionsByCategory(categoryId, limit, offset)
    } catch (error) {
      console.error('Error getting questions:', error)
      return []
    }
  }

  /**
   * Get question by ID
   */
  async function getQuestion(id) {
    try {
      return await dexieDb.getQuestion(id)
    } catch (error) {
      console.error('Error getting question:', error)
      return null
    }
  }

  /**
   * Get answer by question ID
   */
  async function getAnswer(questionId) {
    try {
      return await dexieDb.getAnswer(questionId)
    } catch (error) {
      console.error('Error getting answer:', error)
      return null
    }
  }

  /**
   * Search questions
   */
  async function searchQuestions(term, limit = 50) {
    try {
      return await dexieDb.searchQuestions(term, limit)
    } catch (error) {
      console.error('Error searching questions:', error)
      return []
    }
  }

  /**
   * Get all questions (for fuzzy search)
   */
  async function getAllQuestions() {
    try {
      return await dexieDb.getAllQuestions()
    } catch (error) {
      console.error('Error getting all questions:', error)
      return []
    }
  }

  /**
   * Get user folders
   */
  async function getFolders() {
    try {
      return await dexieDb.getFolders()
    } catch (error) {
      console.error('Error getting folders:', error)
      return []
    }
  }

  /**
   * Create a new folder
   */
  async function createFolder(folderName) {
    try {
      return await dexieDb.createFolder(folderName)
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  }

  /**
   * Delete a folder
   */
  async function deleteFolder(folderId) {
    try {
      await dexieDb.deleteFolder(folderId)
    } catch (error) {
      console.error('Error deleting folder:', error)
      throw error
    }
  }

  /**
   * Add question to folder
   */
  async function addQuestionToFolder(questionId, folderId) {
    try {
      await dexieDb.addQuestionToFolder(questionId, folderId)
    } catch (error) {
      console.error('Error adding question to folder:', error)
      throw error
    }
  }

  /**
   * Remove question from folder
   */
  async function removeQuestionFromFolder(questionId, folderId) {
    try {
      await dexieDb.removeQuestionFromFolder(questionId, folderId)
    } catch (error) {
      console.error('Error removing question from folder:', error)
      throw error
    }
  }

  /**
   * Get questions in a folder
   */
  async function getQuestionsInFolder(folderId) {
    try {
      return await dexieDb.getQuestionsInFolder(folderId)
    } catch (error) {
      console.error('Error getting folder questions:', error)
      return []
    }
  }

  /**
   * Check if data is imported
   */
  async function isDataImported() {
    try {
      return await dexieDb.isImported()
    } catch (error) {
      console.error('Error checking import status:', error)
      return false
    }
  }

  /**
   * Get database statistics
   */
  async function getStats() {
    try {
      return await dexieDb.getStats()
    } catch (error) {
      console.error('Error getting stats:', error)
      return { categories: 0, questions: 0, answers: 0 }
    }
  }

  return {
    // State
    isLoading,
    isReady,

    // Actions
    initialize,
    getCategoriesByParent,
    getCategory,
    getQuestionsByCategory,
    getQuestion,
    getAnswer,
    searchQuestions,
    getAllQuestions,
    getFolders,
    createFolder,
    deleteFolder,
    addQuestionToFolder,
    removeQuestionFromFolder,
    getQuestionsInFolder,
    isDataImported,
    getStats
  }
})
