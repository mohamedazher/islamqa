import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import db from '@/services/database'

export const useQuestionsStore = defineStore('questions', () => {
  // State
  const categories = ref([])
  const currentCategory = ref(null)
  const questions = ref([])
  const currentQuestion = ref(null)
  const currentAnswer = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const needsImport = ref(false)

  // Computed
  const rootCategories = computed(() => {
    return categories.value.filter(cat => cat.parent === 0 || cat.parent === '0')
  })

  const getSubcategories = computed(() => {
    return (parentId) => {
      return categories.value.filter(cat => cat.parent == parentId)
    }
  })

  // Actions
  async function initialize() {
    if (isInitialized.value) return

    try {
      isLoading.value = true
      await db.initialize()

      // Check if database has data
      const hasData = await db.hasData()
      needsImport.value = !hasData

      if (hasData) {
        await loadCategories()
      }

      isInitialized.value = true
    } catch (error) {
      console.error('Failed to initialize questions store:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function loadCategories() {
    try {
      isLoading.value = true
      const allCategories = await db.executeQuery('SELECT * FROM CATEGORIES ORDER BY id')
      categories.value = allCategories
    } catch (error) {
      console.error('Failed to load categories:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function loadCategory(categoryId) {
    try {
      isLoading.value = true
      const category = await db.getCategory(categoryId)
      currentCategory.value = category

      // Load questions for this category
      const categoryQuestions = await db.getQuestionsByCategory(categoryId)
      questions.value = categoryQuestions

      return category
    } catch (error) {
      console.error('Failed to load category:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function loadQuestion(questionId) {
    try {
      isLoading.value = true

      // Load question
      const question = await db.getQuestion(questionId)
      currentQuestion.value = question

      // Load answer
      if (question) {
        const answer = await db.getAnswer(questionId)
        currentAnswer.value = answer
      }

      return question
    } catch (error) {
      console.error('Failed to load question:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function searchQuestions(searchTerm) {
    try {
      isLoading.value = true
      const results = await db.searchQuestions(searchTerm)
      return results
    } catch (error) {
      console.error('Failed to search questions:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function importData(type, data) {
    try {
      isLoading.value = true

      if (type === 'categories') {
        await db.importCategories(data)
        await loadCategories()
      } else if (type === 'questions') {
        await db.importQuestions(data)
      } else if (type === 'answers') {
        await db.importAnswers(data)
      }

      // Check if import is complete
      const hasData = await db.hasData()
      needsImport.value = !hasData

    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    categories,
    currentCategory,
    questions,
    currentQuestion,
    currentAnswer,
    isLoading,
    isInitialized,
    needsImport,

    // Computed
    rootCategories,
    getSubcategories,

    // Actions
    initialize,
    loadCategories,
    loadCategory,
    loadQuestion,
    searchQuestions,
    importData
  }
})
