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
   */
  async loadAndImport(onProgress) {
    try {
      // Check if already imported
      const isImported = await dexieDb.isImported()
      if (isImported) {
        console.log('✅ Data already imported')
        if (onProgress) onProgress({ step: 'Data already loaded', progress: 100 })
        return true
      }

      this.isLoading = true
      this.progress = 0

      // Step 1: Load and import categories
      this.currentStep = 'Loading categories...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 5 })

      const categoriesData = await this.loadCategories()
      if (categoriesData && categoriesData.length > 0) {
        await dexieDb.importCategories(categoriesData)
        this.progress = 20
        if (onProgress) onProgress({ step: 'Categories imported', progress: 20 })
      }

      // Step 2: Load and import questions (4 files)
      this.currentStep = 'Loading questions...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 20 })

      for (let i = 1; i <= 4; i++) {
        const questionsData = await this.loadQuestions(i)
        if (questionsData && questionsData.length > 0) {
          await dexieDb.importQuestions(questionsData)
        }
        const progress = 20 + (i * 10)
        this.progress = progress
        if (onProgress) onProgress({ step: `Questions part ${i} imported`, progress })
      }

      // Step 3: Load and import answers (12 files)
      this.currentStep = 'Loading answers...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 60 })

      for (let i = 1; i <= 12; i++) {
        const answersData = await this.loadAnswers(i)
        if (answersData && answersData.length > 0) {
          await dexieDb.importAnswers(answersData)
        }
        const progress = 60 + (i * 3)
        this.progress = progress
        if (onProgress) onProgress({ step: `Answers part ${i} imported`, progress })
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
   * Load categories from JS file
   */
  async loadCategories() {
    try {
      const basePath = this.getDataPath()
      const response = await fetch(`${basePath}/categories.js`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const text = await response.text()
      // Extract JSON from JavaScript file
      const jsonMatch = text.match(/\[.*\]/s)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        console.log(`📁 Loaded ${data.length} categories`)
        return data
      }
      console.error('Could not extract JSON from categories.js')
      return []
    } catch (error) {
      console.error('Failed to load categories:', error)
      return []
    }
  }

  /**
   * Load questions from JS file (parts 1-4)
   */
  async loadQuestions(part) {
    try {
      const basePath = this.getDataPath()
      const response = await fetch(`${basePath}/questions${part}.js`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const text = await response.text()
      // Extract JSON from JavaScript file
      const jsonMatch = text.match(/\[.*\]/s)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        console.log(`📝 Loaded ${data.length} questions (part ${part})`)
        return data
      }
      return []
    } catch (error) {
      console.error(`Failed to load questions part ${part}:`, error)
      return []
    }
  }

  /**
   * Load answers from JS file (parts 1-12)
   */
  async loadAnswers(part) {
    try {
      const basePath = this.getDataPath()
      const response = await fetch(`${basePath}/answers${part}.js`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const text = await response.text()
      // Extract JSON from JavaScript file
      const jsonMatch = text.match(/\[.*\]/s)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        console.log(`💬 Loaded ${data.length} answers (part ${part})`)
        return data
      }
      return []
    } catch (error) {
      console.error(`Failed to load answers part ${part}:`, error)
      return []
    }
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
