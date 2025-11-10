/**
 * Data Loader Service
 * Loads Q&A data from JS files and imports to IndexedDB
 */

import dexieDb from './dexieDatabase'

class DataLoaderService {
  constructor() {
    this.isLoading = false
    this.progress = 0
    this.currentStep = ''
  }

  /**
   * Get the correct base path for data files
   */
  getDataPath() {
    // For Cordova builds, files are in www/js/
    // For web builds, files are in public/data/ (served as /data/)
    if (window.cordova) {
      return './js'
    }
    // Use Vite's base URL for web builds to support GitHub Pages deployment
    const baseUrl = import.meta.env.BASE_URL || '/'
    return `${baseUrl}data`.replace(/\/+/g, '/') // Normalize slashes
  }

  /**
   * Load all data and import to IndexedDB
   * NEW: Loads categories.json and questions.json (dump file method)
   * OLD: Previously loaded categories.js, questions[1-4].js, answers[1-12].js
   */
  async loadAndImport(onProgress) {
    try {
      // Check if already imported
      const isImported = await dexieDb.isImported()
      if (isImported) {
        console.log('✅ Data already imported')

        // Check if enhancements need to be imported (added in v2.0)
        const enhancementStats = await dexieDb.getEnhancementStats()
        if (enhancementStats.enhanced === 0) {
          console.log('⚠️  No enhancements found, importing...')
          if (onProgress) onProgress({ step: 'Importing quiz enhancements...', progress: 50 })

          const enhancementsData = await this.loadEnhancements()
          if (enhancementsData && enhancementsData.length > 0) {
            await dexieDb.bulkImportEnhancements(enhancementsData)
            console.log(`✅ Imported ${enhancementsData.length} quiz enhancements`)
            if (onProgress) onProgress({ step: `Quiz enhancements imported (${enhancementsData.length} total)`, progress: 100 })
          }
        } else {
          console.log(`✅ Enhancements already imported (${enhancementStats.enhanced} questions)`)
          if (onProgress) onProgress({ step: 'Data already loaded', progress: 100 })
        }

        return true
      }

      this.isLoading = true
      this.progress = 0

      // Step 1: Load and import categories
      this.currentStep = 'Loading categories...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 10 })

      const categoriesData = await this.loadCategories()
      if (categoriesData && categoriesData.length > 0) {
        await dexieDb.importCategories(categoriesData)
        this.progress = 40
        if (onProgress) onProgress({ step: `Categories imported (${categoriesData.length} total)`, progress: 40 })
      }

      // Step 2: Load and import questions (single file now)
      this.currentStep = 'Loading questions...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 50 })

      const questionsData = await this.loadQuestions()
      if (questionsData && questionsData.length > 0) {
        await dexieDb.importQuestions(questionsData)
        this.progress = 80
        if (onProgress) onProgress({ step: `Questions imported (${questionsData.length} total)`, progress: 80 })
      }

      // Note: Answers are now embedded in questions.answer field
      // No separate import needed!

      // Step 3: Load and import quiz enhancements (LLM-generated quiz options)
      this.currentStep = 'Loading quiz enhancements...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 85 })

      const enhancementsData = await this.loadEnhancements()
      if (enhancementsData && enhancementsData.length > 0) {
        await dexieDb.bulkImportEnhancements(enhancementsData)
        this.progress = 95
        if (onProgress) onProgress({ step: `Quiz enhancements imported (${enhancementsData.length} total)`, progress: 95 })
      } else {
        if (onProgress) onProgress({ step: 'No quiz enhancements available yet', progress: 95 })
      }

      // Mark as imported
      await dexieDb.markAsImported()

      this.progress = 100
      if (onProgress) onProgress({ step: 'Import complete!', progress: 100 })

      // Log stats
      const stats = await dexieDb.getStats()
      console.log('📊 Database stats:', stats)

      this.isLoading = false
      return true
    } catch (error) {
      this.isLoading = false
      console.error('❌ Data import failed:', error)
      throw error
    }
  }

  /**
   * Load categories from JSON file (dump file method)
   * NEW: Loads from categories.json directly
   * OLD: Previously loaded from categories.js with regex extraction
   */
  async loadCategories() {
    try {
      const basePath = this.getDataPath()
      const response = await fetch(`${basePath}/categories.json`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      console.log(`📁 Loaded ${data.length} categories from categories.json`)
      return data
    } catch (error) {
      console.error('Failed to load categories:', error)
      return []
    }
  }

  /**
   * Load questions from JSON file (dump file method)
   * NEW: Loads from single questions.json file
   * OLD: Previously loaded from questions[1-4].js (4 files)
   * NOTE: Answers are now embedded in question.answer field
   */
  async loadQuestions() {
    try {
      const basePath = this.getDataPath()
      const response = await fetch(`${basePath}/questions.json`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      console.log(`📝 Loaded ${data.length} questions from questions.json`)
      return data
    } catch (error) {
      console.error('Failed to load questions:', error)
      return []
    }
  }

  /**
   * Load quiz enhancements from JSON file
   * NEW: V2.0 - Loads LLM-generated quiz options for high-quality quizzes
   * NOTE: Enhancements are optional - quizzes work without them but are enhanced with them
   */
  async loadEnhancements() {
    try {
      const basePath = this.getDataPath()
      const response = await fetch(`${basePath}/enhancements.json`)
      if (!response.ok) {
        // Enhancements are optional, so it's okay if the file doesn't exist
        console.warn(`⚠️  Enhancements file not found (HTTP ${response.status})`)
        return []
      }
      const data = await response.json()
      console.log(`🎯 Loaded ${data.length} quiz enhancements from enhancements.json`)
      return data
    } catch (error) {
      console.warn('⚠️  Failed to load enhancements (optional):', error.message)
      return []
    }
  }

  /**
   * DEPRECATED: Answers are now embedded in questions
   * Previously loaded answers from 12 separate files
   * Now: Access answers via question.answer field directly
   * This method is kept for reference but no longer used
   */
  async loadAnswers(part) {
    console.warn('⚠️  loadAnswers() is deprecated. Answers are now embedded in questions.answer')
    return []
  }

  /**
   * Check if data is already imported
   */
  async isDataImported() {
    return await dexieDb.isImported()
  }

  /**
   * Get database statistics
   */
  async getStats() {
    return await dexieDb.getStats()
  }
}

export default new DataLoaderService()
