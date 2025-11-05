/**
 * Data Loader Service
 * Loads Q&A data from the old JS files
 */

class DataLoaderService {
  constructor() {
    this.isLoading = false
    this.progress = 0
    this.currentStep = ''
  }

  /**
   * Load all data and import to database
   */
  async loadAndImport(db, onProgress) {
    try {
      this.isLoading = true
      this.progress = 0

      // Step 1: Load and import categories (from www-old-backup/js/categories.js)
      this.currentStep = 'Loading categories...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 0 })

      const categoriesData = await this.loadCategories()
      if (categoriesData && categoriesData.length > 0) {
        await db.importCategories(categoriesData)
        this.progress = 20
        if (onProgress) onProgress({ step: 'Categories imported', progress: 20 })
      }

      // Step 2: Load and import questions (4 files)
      this.currentStep = 'Loading questions...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 25 })

      for (let i = 1; i <= 4; i++) {
        const questionsData = await this.loadQuestions(i)
        if (questionsData && questionsData.length > 0) {
          await db.importQuestions(questionsData)
        }
        const progress = 25 + (i * 15)
        this.progress = progress
        if (onProgress) onProgress({ step: `Questions part ${i} imported`, progress })
      }

      // Step 3: Load and import answers (12 files)
      this.currentStep = 'Loading answers...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 85 })

      for (let i = 1; i <= 12; i++) {
        const answersData = await this.loadAnswers(i)
        if (answersData && answersData.length > 0) {
          await db.importAnswers(answersData)
        }
        const progress = 85 + (i * 1.25)
        this.progress = progress
        if (onProgress) onProgress({ step: `Answers part ${i} imported`, progress })
      }

      this.progress = 100
      if (onProgress) onProgress({ step: 'Import complete!', progress: 100 })

      this.isLoading = false
      return true
    } catch (error) {
      this.isLoading = false
      console.error('Data import failed:', error)
      throw error
    }
  }

  /**
   * Load categories from old JS file
   */
  async loadCategories() {
    try {
      const response = await fetch('/www-old-backup/js/categories.js')
      const text = await response.text()
      // Extract JSON from JavaScript file
      const jsonMatch = text.match(/\[.*\]/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      console.error('Could not extract JSON from categories.js')
      return []
    } catch (error) {
      console.error('Failed to load categories:', error)
      return []
    }
  }

  /**
   * Load questions from old JS file (parts 1-4)
   */
  async loadQuestions(part) {
    try {
      const response = await fetch(`/www-old-backup/js/questions${part}.js`)
      const text = await response.text()
      // Extract JSON from JavaScript file
      const jsonMatch = text.match(/\[.*\]/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return []
    } catch (error) {
      console.error(`Failed to load questions part ${part}:`, error)
      return []
    }
  }

  /**
   * Load answers from old JS file (parts 1-12)
   */
  async loadAnswers(part) {
    try {
      const response = await fetch(`/www-old-backup/js/answers${part}.js`)
      const text = await response.text()
      // Extract JSON from JavaScript file
      const jsonMatch = text.match(/\[.*\]/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return []
    } catch (error) {
      console.error(`Failed to load answers part ${part}:`, error)
      return []
    }
  }
}

export default new DataLoaderService()
