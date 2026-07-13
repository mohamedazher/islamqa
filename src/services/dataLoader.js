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
      const isImported = await dexieDb.isImported()
      let metadata

      try {
        metadata = await this.loadMetadata()
      } catch (error) {
        // An existing offline installation remains usable when metadata cannot
        // be checked. A fresh installation must not claim success without it.
        if (!isImported) throw error
        console.warn('⚠️  Could not check for Q&A data updates; using the installed dataset:', error.message)
      }

      const importedVersion = await dexieDb.getImportedDataVersion()
      const needsCoreImport = !isImported || (metadata && importedVersion !== metadata.version)

      if (!needsCoreImport) {
        console.log('✅ Data already imported')

        // Check if AI data needs to be imported (for existing users)
        const hasAiData = await dexieDb.hasAiData()
        const hasDuaData = await dexieDb.hasDuaData()

        if (!hasAiData || !hasDuaData) {
          console.log('📦 Main data exists but supplementary data missing - importing...')
          await this.importSupplementaryDataOnly(onProgress, !hasAiData, !hasDuaData)
        } else {
          if (onProgress) onProgress({ step: 'Data already loaded', progress: 100 })
        }
        return true
      }

      if (isImported) {
        console.log(`📦 Q&A data update available (${importedVersion || 'unversioned'} → ${metadata.version})`)
      }

      this.isLoading = true
      this.progress = 0

      // Step 1: Load and import categories
      this.currentStep = 'Loading categories...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 10 })

      const categoriesData = await this.loadCategories()
      if (categoriesData.length > 0) {
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
      if (questionsData.length > 0) {
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
      if (onProgress) onProgress({ step: this.currentStep, progress: 76 })

      const quizQuestionsData = await this.loadQuizQuestions()
      if (quizQuestionsData && quizQuestionsData.length > 0) {
        await dexieDb.bulkImportQuizQuestions(quizQuestionsData)
        this.progress = 80
        if (onProgress) onProgress({ step: `Quiz questions imported (${quizQuestionsData.length} total)`, progress: 80 })
      } else {
        if (onProgress) onProgress({ step: 'No quiz questions available yet', progress: 80 })
      }

      // Step 3b: Load and import dua categories (offline access)
      this.currentStep = 'Loading dua categories...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 81 })

      const duaCategoriesData = await this.loadDuaCategories()
      if (duaCategoriesData && duaCategoriesData.length > 0) {
        await dexieDb.importDuaCategories(duaCategoriesData)
        this.progress = 82
        if (onProgress) onProgress({ step: `Dua categories imported (${duaCategoriesData.length} total)`, progress: 82 })
      } else {
        if (onProgress) onProgress({ step: 'No dua categories available', progress: 82 })
      }

      // Step 3c: Load and import duas (offline access)
      this.currentStep = 'Loading duas...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 83 })

      const duasData = await this.loadAllDuas()
      if (duasData && duasData.length > 0) {
        await dexieDb.importDuas(duasData)
        this.progress = 84
        if (onProgress) onProgress({ step: `Duas imported (${duasData.length} total)`, progress: 84 })
      } else {
        if (onProgress) onProgress({ step: 'No duas available', progress: 84 })
      }

      // Step 3d: Load and import dua embeddings (for semantic search)
      this.currentStep = 'Loading dua embeddings...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 84.5 })

      const duaEmbeddingsData = await this.loadDuaEmbeddings()
      if (duaEmbeddingsData && Object.keys(duaEmbeddingsData).length > 0) {
        // Store dua embeddings in localStorage for access (or IndexedDB if needed)
        try {
          localStorage.setItem('dua_embeddings', JSON.stringify(duaEmbeddingsData))
          this.progress = 85
          if (onProgress) onProgress({ step: `Dua embeddings loaded (${Object.keys(duaEmbeddingsData).length} total)`, progress: 85 })
        } catch (error) {
          console.warn('⚠️  Failed to store dua embeddings in localStorage:', error.message)
          if (onProgress) onProgress({ step: 'Dua embeddings (storage error)', progress: 85 })
        }
      } else {
        if (onProgress) onProgress({ step: 'No dua embeddings available yet', progress: 85 })
      }

      // Step 4: Load and import AI summaries (for chat search)
      this.currentStep = 'Loading AI summaries...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 86 })

      const summariesData = await this.loadAiSummaries()
      if (summariesData && Object.keys(summariesData).length > 0) {
        await dexieDb.importSummaries(summariesData, (batchProgress) => {
          const batchPercent = batchProgress.percentage / 100
          const overallProgress = 86 + (batchPercent * 3)
          if (onProgress) {
            onProgress({
              step: `Importing AI summaries (${batchProgress.itemsProcessed}/${batchProgress.totalItems})`,
              progress: overallProgress
            })
          }
        })
        this.progress = 89
        if (onProgress) onProgress({ step: `AI summaries imported (${Object.keys(summariesData).length} total)`, progress: 89 })
      } else {
        if (onProgress) onProgress({ step: 'No AI summaries available yet', progress: 89 })
      }

      // Step 5: Load and import AI embeddings (for semantic search)
      this.currentStep = 'Loading AI embeddings...'
      if (onProgress) onProgress({ step: this.currentStep, progress: 90 })

      const embeddingsData = await this.loadAiEmbeddings()
      if (embeddingsData && Object.keys(embeddingsData).length > 0) {
        await dexieDb.importEmbeddings(embeddingsData, (batchProgress) => {
          const batchPercent = batchProgress.percentage / 100
          const overallProgress = 90 + (batchPercent * 5)
          if (onProgress) {
            onProgress({
              step: `Importing AI embeddings (${batchProgress.itemsProcessed}/${batchProgress.totalItems})`,
              progress: overallProgress
            })
          }
        })
        this.progress = 95
        if (onProgress) onProgress({ step: `AI embeddings imported (${Object.keys(embeddingsData).length} total)`, progress: 95 })
      } else {
        if (onProgress) onProgress({ step: 'No AI embeddings available yet', progress: 95 })
      }

      // Mark as imported
      await dexieDb.markAsImported(metadata.version)

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
    const basePath = this.getDataPath()
    const response = await fetch(`${basePath}/categories.json`)
    if (!response.ok) {
      throw new Error(`Failed to load categories.json (HTTP ${response.status}: ${response.statusText})`)
    }
    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('categories.json is empty or invalid')
    }
    console.log(`📁 Loaded ${data.length} categories from categories.json`)
    return data
  }

  /**
   * Load questions from JSON file (dump file method)
   * NEW: Loads from single questions.json file
   * OLD: Previously loaded from questions[1-4].js (4 files)
   * NOTE: Answers are now embedded in question.answer field
   */
  async loadQuestions() {
    const basePath = this.getDataPath()
    const response = await fetch(`${basePath}/questions.json`)
    if (!response.ok) {
      throw new Error(`Failed to load questions.json (HTTP ${response.status}: ${response.statusText})`)
    }
    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('questions.json is empty or invalid')
    }
    console.log(`📝 Loaded ${data.length} questions from questions.json`)
    return data
  }

  /**
   * Load Q&A dataset metadata used to decide whether an installed dataset
   * needs a content refresh.
   */
  async loadMetadata() {
    const basePath = this.getDataPath()
    const response = await fetch(`${basePath}/metadata.json`)
    if (!response.ok) {
      throw new Error(`Failed to load metadata.json (HTTP ${response.status}: ${response.statusText})`)
    }
    const metadata = await response.json()
    if (!metadata?.version) {
      throw new Error('metadata.json does not contain a data version')
    }
    return metadata
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
      const seenReferences = new Set()
      let invalidReferences = 0
      let duplicateReferences = 0
      const mappedQuizzes = quizzes
        .map(quiz => {
          const rawReference = quiz.sourceQuestionId ?? quiz.reference
          const reference = Number(rawReference)
          if (!Number.isSafeInteger(reference) || reference <= 0) {
            invalidReferences++
            return null
          }
          if (seenReferences.has(reference)) {
            duplicateReferences++
            return null
          }
          seenReferences.add(reference)
          return {
            reference: reference,
            id: quiz.id,
            questionText: quiz.questionText,
            options: quiz.options,
            explanation: quiz.explanation,
            difficulty: quiz.difficulty,
            tags: quiz.tags || [],
            category: quiz.category,
            source: quiz.source || 'IslamQA',
            type: quiz.type || 'multiple-choice'
          }
        })
        .filter(Boolean)

      if (invalidReferences > 0) {
        console.warn(`⚠️  Skipped ${invalidReferences} quiz(zes) without a valid positive reference`)
      }
      if (duplicateReferences > 0) {
        console.warn(`⚠️  Skipped ${duplicateReferences} duplicate quiz reference(s); keeping the first occurrence`)
      }

      console.log(`🎯 Loaded ${mappedQuizzes.length} quiz questions from quiz-questions.json`)
      return mappedQuizzes
    } catch (error) {
      console.warn('⚠️  Failed to load quiz questions (optional):', error.message)
      return []
    }
  }

  /**
   * Load dua categories from JSON file
   * Provides offline access to dua structure
   * Maps string IDs to numeric IDs for database queries
   */
  async loadDuaCategories() {
    try {
      const basePath = this.getDataPath()
      const response = await fetch(`${basePath}/dua/categories.json`)
      if (!response.ok) {
        console.warn(`⚠️  Dua categories file not found (HTTP ${response.status})`)
        return []
      }
      const data = await response.json()
      const categories = data.categories || []

      // Map each category to add numeric ID based on actual file content
      // The numeric ID is stored in each category's JSON file as category_id
      const categoryIdMap = {
        'waking-up': 1,
        'before-sleep': 2,
        'morning': 3,
        'evening': 4,
        'salah': 5,
        'after-salah': 6,
        'dhikr-all-times': 7,
        'praises-allah': 8,
        'istighfar': 9,
        'salawat': 10,
        'quranic-duas': 11,
        'sunnah-duas': 12,
        'lavatory-wudu': 13,
        'clothes': 14,
        'home': 15,
        'adhan-masjid': 16,
        'food-drink': 17,
        'travel': 18,
        'gatherings': 19,
        'istikhara': 20,
        'marriage-children': 21,
        'ruqyah-illness': 22,
        'death': 23,
        'difficulties-happiness': 24,
        'protection-iman': 25,
        'nature': 26,
        'nightmares': 27,
        'social-interactions': 28,
        'hajj-umrah': 29,
        'money-shopping': 30,
        'names-allah': 31
      }

      // Add numeric ID to each category for database queries
      categories.forEach(cat => {
        cat.numeric_id = categoryIdMap[cat.id] || null
      })

      console.log(`📿 Loaded ${categories.length} dua categories with numeric IDs`)
      return categories
    } catch (error) {
      console.warn('⚠️  Failed to load dua categories (optional):', error.message)
      return []
    }
  }

  /**
   * Load all duas from individual category files
   * Merges all dua data from separate category JSON files into a single array
   * Provides offline access to all duas
   */
  async loadAllDuas() {
    const allDuas = []
    try {
      const basePath = this.getDataPath()

      // Map of category IDs to filename slugs
      const categoryFileMap = {
        'morning': 'morning',
        'evening': 'evening',
        'before-sleep': 'before-sleep',
        'salah': 'salah',
        'after-salah': 'after-salah',
        'ruqyah-illness': 'ruqyah-illness',
        'praises-allah': 'praises-allah',
        'salawat': 'salawat',
        'quranic-duas': 'quranic-duas',
        'sunnah-duas': 'sunnah-duas',
        'names-allah': 'names-allah',
        'dhikr-all-times': 'dhikr-all-times',
        'istighfar': 'istighfar',
        'waking-up': 'waking-up',
        'nightmares': 'nightmares',
        'clothes': 'clothes',
        'lavatory-wudu': 'lavatory-wudu',
        'home': 'home',
        'adhan-masjid': 'adhan-masjid',
        'istikhara': 'istikhara',
        'gatherings': 'gatherings',
        'food-drink': 'food-drink',
        'travel': 'travel',
        'death': 'death',
        'nature': 'nature',
        'social-interactions': 'social-interactions',
        'protection-iman': 'protection-iman',
        'difficulties-happiness': 'difficulties-happiness',
        'hajj-umrah': 'hajj-umrah',
        'money-shopping': 'money-shopping',
        'marriage-children': 'marriage-children'
      }

      // Load each category file and extract duas
      for (const [categoryId, filename] of Object.entries(categoryFileMap)) {
        try {
          const response = await fetch(`${basePath}/dua/${filename}.json`)
          if (response.ok) {
            const data = await response.json()
            const categoryDuas = data.duas || []
            console.log(`📿 Loading ${categoryId} (${filename}): ${categoryDuas.length} duas, category_id=${data.category_id}`)

            // Add category_id and create unique global ID for each dua
            // Each dua file has id: 1,2,3... so we need to make them globally unique
            const numericCategoryId = data.category_id
            categoryDuas.forEach((dua, index) => {
              dua.category_id = numericCategoryId
              dua.order = dua.order || 1
              // Create a unique global ID: categoryId * 1000 + local id
              // This ensures no collisions across categories
              dua.id = numericCategoryId * 1000 + (dua.id || index + 1)
            })
            allDuas.push(...categoryDuas)
          }
        } catch (e) {
          console.warn(`⚠️  Failed to load dua category file: ${filename}.json`)
        }
      }

      console.log(`📿 Loaded ${allDuas.length} duas from ${Object.keys(categoryFileMap).length} category files`)
      return allDuas
    } catch (error) {
      console.warn('⚠️  Failed to load duas:', error.message)
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
   * Import supplementary data (AI summaries, embeddings, dua data) for existing users
   * Called when main data is already imported but supplementary data is missing
   * Handles version upgrades gracefully
   */
  async importSupplementaryDataOnly(onProgress, needsAiData = true, needsDuaData = true) {
    try {
      this.isLoading = true
      let progressBase = 10

      // Step 1: Load and import AI summaries (if needed)
      if (needsAiData) {
        this.currentStep = 'Loading AI summaries...'
        if (onProgress) onProgress({ step: this.currentStep, progress: progressBase })

        const summariesData = await this.loadAiSummaries()
        if (summariesData && Object.keys(summariesData).length > 0) {
          await dexieDb.importSummaries(summariesData, (batchProgress) => {
            const batchPercent = batchProgress.percentage / 100
            const overallProgress = progressBase + (batchPercent * 20)
            if (onProgress) {
              onProgress({
                step: `Importing AI summaries (${batchProgress.itemsProcessed}/${batchProgress.totalItems})`,
                progress: overallProgress
              })
            }
          })
          if (onProgress) onProgress({ step: `AI summaries imported (${Object.keys(summariesData).length} total)`, progress: progressBase + 20 })
        } else {
          if (onProgress) onProgress({ step: 'No AI summaries available', progress: progressBase + 20 })
        }

        // Step 2: Load and import AI embeddings
        progressBase += 20
        this.currentStep = 'Loading AI embeddings...'
        if (onProgress) onProgress({ step: this.currentStep, progress: progressBase })

        const embeddingsData = await this.loadAiEmbeddings()
        if (embeddingsData && Object.keys(embeddingsData).length > 0) {
          await dexieDb.importEmbeddings(embeddingsData, (batchProgress) => {
            const batchPercent = batchProgress.percentage / 100
            const overallProgress = progressBase + (batchPercent * 20)
            if (onProgress) {
              onProgress({
                step: `Importing AI embeddings (${batchProgress.itemsProcessed}/${batchProgress.totalItems})`,
                progress: overallProgress
              })
            }
          })
          if (onProgress) onProgress({ step: `AI embeddings imported (${Object.keys(embeddingsData).length} total)`, progress: progressBase + 20 })
        } else {
          if (onProgress) onProgress({ step: 'No AI embeddings available', progress: progressBase + 20 })
        }
        progressBase += 20
      }

      // Step 3: Load and import dua data (if needed)
      if (needsDuaData) {
        this.currentStep = 'Loading dua categories...'
        if (onProgress) onProgress({ step: this.currentStep, progress: progressBase })

        const duaCategoriesData = await this.loadDuaCategories()
        if (duaCategoriesData && duaCategoriesData.length > 0) {
          await dexieDb.importDuaCategories(duaCategoriesData)
          progressBase += 10
          if (onProgress) onProgress({ step: `Dua categories imported (${duaCategoriesData.length} total)`, progress: progressBase })
        } else {
          progressBase += 10
          if (onProgress) onProgress({ step: 'No dua categories available', progress: progressBase })
        }

        this.currentStep = 'Loading duas...'
        if (onProgress) onProgress({ step: this.currentStep, progress: progressBase })

        const duasData = await this.loadAllDuas()
        if (duasData && duasData.length > 0) {
          await dexieDb.importDuas(duasData)
          progressBase += 10
          if (onProgress) onProgress({ step: `Duas imported (${duasData.length} total)`, progress: progressBase })
        } else {
          progressBase += 10
          if (onProgress) onProgress({ step: 'No duas available', progress: progressBase })
        }

        // Load dua embeddings for semantic search
        this.currentStep = 'Loading dua embeddings...'
        if (onProgress) onProgress({ step: this.currentStep, progress: progressBase })

        const duaEmbeddingsData = await this.loadDuaEmbeddings()
        if (duaEmbeddingsData && Object.keys(duaEmbeddingsData).length > 0) {
          try {
            localStorage.setItem('dua_embeddings', JSON.stringify(duaEmbeddingsData))
            progressBase += 5
            if (onProgress) onProgress({ step: `Dua embeddings loaded (${Object.keys(duaEmbeddingsData).length} total)`, progress: progressBase })
          } catch (error) {
            console.warn('⚠️  Failed to store dua embeddings in localStorage:', error.message)
            progressBase += 5
            if (onProgress) onProgress({ step: 'Dua embeddings (storage error)', progress: progressBase })
          }
        } else {
          progressBase += 5
          if (onProgress) onProgress({ step: 'No dua embeddings available', progress: progressBase })
        }
      }

      this.isLoading = false
      if (onProgress) onProgress({ step: 'Supplementary data import complete!', progress: 100 })

      console.log('✅ Supplementary data import complete')
      return true
    } catch (error) {
      this.isLoading = false
      console.error('❌ Supplementary data import failed:', error)
      throw error
    }
  }

  /**
   * DEPRECATED: Use importSupplementaryDataOnly instead
   * Kept for backwards compatibility
   */
  async importAiDataOnly(onProgress) {
    return this.importSupplementaryDataOnly(onProgress, true, false)
  }

  /**
   * Load AI summaries from batch files
   * Loads all available summary batch files and merges them
   * @returns {Object} - Object with reference keys and summary data
   */
  async loadAiSummaries() {
    const summaries = {}
    try {
      const basePath = this.getDataPath()

      // Try to load batch files (batch_001.json to batch_020.json)
      for (let i = 1; i <= 20; i++) {
        const batchNum = String(i).padStart(3, '0')
        try {
          const response = await fetch(`${basePath}/summaries/batch_${batchNum}.json`)
          if (response.ok) {
            const batch = await response.json()
            if (batch.summaries) {
              Object.assign(summaries, batch.summaries)
            }
          }
        } catch (e) {
          // Batch file doesn't exist yet, skip silently
        }
      }

      const count = Object.keys(summaries).length
      if (count > 0) {
        console.log(`📝 Loaded ${count} AI summaries from batch files`)
      }
      return summaries
    } catch (error) {
      console.warn('⚠️  Error loading AI summaries:', error.message)
      return {}
    }
  }

  /**
   * Load AI embeddings from JSON file
   * @returns {Object} - Object with reference keys and vector arrays
   */
  async loadAiEmbeddings() {
    try {
      const basePath = this.getDataPath()
      const response = await fetch(`${basePath}/embeddings.json`)

      if (!response.ok) {
        console.warn(`⚠️  AI embeddings file not found (HTTP ${response.status})`)
        return {}
      }

      const data = await response.json()
      const embeddings = data.embeddings || {}
      const count = Object.keys(embeddings).length

      if (count > 0) {
        console.log(`🔢 Loaded ${count} AI embeddings (${data.metadata?.dimensions || 768}D vectors)`)
      }
      return embeddings
    } catch (error) {
      console.warn('⚠️  Error loading AI embeddings:', error.message)
      return {}
    }
  }

  /**
   * Load dua embeddings from JSON file
   * Embeddings enable semantic search for duas
   */
  async loadDuaEmbeddings() {
    try {
      const basePath = this.getDataPath()
      const response = await fetch(`${basePath}/dua-embeddings.json`)

      if (!response.ok) {
        console.warn(`⚠️  Dua embeddings file not found (HTTP ${response.status})`)
        return {}
      }

      const embeddings = await response.json()
      const count = Object.keys(embeddings).length

      if (count > 0) {
        console.log(`🔢 Loaded ${count} dua embeddings (768D vectors)`)
      }
      return embeddings
    } catch (error) {
      console.warn('⚠️  Error loading dua embeddings:', error.message)
      return {}
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
