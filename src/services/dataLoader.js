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
    // For Cordova builds, files are in www/data/
    // For web builds, files are in public/data/ (served as /data/)
    if (window.cordova) {
      return './data'
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
        if (onProgress) onProgress({ step: 'Data already loaded', progress: 100 })
        return true
      }

      this.isLoading = true
      this.progress = 0

      // Step 1: Load and import categories
      this.currentStep = 'Loading categories...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 10 })

      const categoriesData = await this.loadCategories()
      if (categoriesData && categoriesData.length > 0) {
        // Import with progress updates (10% to 30%)
        await dexieDb.importCategories(categoriesData, (batchProgress) => {
          const batchPercent = batchProgress.percentage / 100
          const overallProgress = 10 + (batchPercent * 20) // 10% base + up to 20% for categories
          this.progress = overallProgress
          if (onProgress) {
            onProgress({
              step: `Importing categories (${batchProgress.itemsProcessed}/${batchProgress.totalItems})`,
              progress: overallProgress
            })
          }
        })
        this.progress = 30
        if (onProgress) onProgress({ step: `Categories imported (${categoriesData.length} total)`, progress: 30 })
      }

      // Step 2: Load and import questions (single file now)
      this.currentStep = 'Loading questions...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 35 })

      const questionsData = await this.loadQuestions()
      if (questionsData && questionsData.length > 0) {
        // Import with progress updates (40% to 75%)
        await dexieDb.importQuestions(questionsData, (batchProgress) => {
          const batchPercent = batchProgress.percentage / 100
          const overallProgress = 40 + (batchPercent * 35) // 40% base + up to 35% for questions
          this.progress = overallProgress
          if (onProgress) {
            onProgress({
              step: `Importing questions (${batchProgress.itemsProcessed}/${batchProgress.totalItems})`,
              progress: overallProgress
            })
          }
        })
        this.progress = 75
        if (onProgress) onProgress({ step: `Questions imported (${questionsData.length} total)`, progress: 75 })
      }

      // Note: Answers are now embedded in questions.answer field
      // No separate import needed!

      // Step 3: Load and import quiz questions (LLM-generated)
      this.currentStep = 'Loading quiz questions...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 80 })

      const quizQuestionsData = await this.loadQuizQuestions()
      if (quizQuestionsData && quizQuestionsData.length > 0) {
        await dexieDb.bulkImportQuizQuestions(quizQuestionsData)
        this.progress = 90
        if (onProgress) onProgress({ step: `Quiz questions imported (${quizQuestionsData.length} total)`, progress: 90 })
      } else {
        if (onProgress) onProgress({ step: 'No quiz questions available yet', progress: 90 })
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
   * Load quiz questions from JSON file
   * Loads LLM-generated quiz questions for high-quality quizzes
   * NOTE: Quiz questions are optional - app works without them but provides better quiz experience with them
   */
  async loadQuizQuestions() {
    try {
      const basePath = this.getDataPath()
      const response = await fetch(`${basePath}/quiz-questions.json`)
      if (!response.ok) {
        // Quiz questions are optional, so it's okay if the file doesn't exist
        console.warn(`⚠️  Quiz questions file not found (HTTP ${response.status})`)
        return []
      }
      const data = await response.json()

      // Extract quizzes array from the JSON structure
      // File can be either:
      // 1. Flat array format: [{ id, questionText, ... }, ...]
      // 2. Nested object format: { version: "1.0.0", totalQuizzes: N, quizzes: [...] }
      // 3. Nested object format: { quizQuestions: [...] }
      const quizzes = Array.isArray(data) ? data : (data.quizzes || data.quizQuestions || [])

      // Map the quiz data to match the expected schema
      // Each quiz needs a 'reference' field (sourceQuestionId) for the primary key
      const mappedQuizzes = quizzes
        .map(quiz => ({
          reference: quiz.sourceQuestionId || quiz.reference,
          id: quiz.id,
          questionText: quiz.questionText,
          options: quiz.options,
          explanation: quiz.explanation,
          difficulty: quiz.difficulty,
          tags: quiz.tags || [],
          category: quiz.category,
          source: quiz.source || 'IslamQA',
          type: quiz.type || 'multiple-choice'
        }))
        .filter(quiz => quiz.reference != null) // Filter out quizzes without valid reference

      const skipped = quizzes.length - mappedQuizzes.length
      if (skipped > 0) {
        console.warn(`⚠️  Skipped ${skipped} quiz(zes) without valid reference field`)
      }

      console.log(`🎯 Loaded ${mappedQuizzes.length} quiz questions from quiz-questions.json`)
      return mappedQuizzes
    } catch (error) {
      console.warn('⚠️  Failed to load quiz questions (optional):', error.message)
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
