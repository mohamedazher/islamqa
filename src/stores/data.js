import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Data Store - Loads and caches data from old JS files
 * This allows the app to work in browser mode for development
 */
export const useDataStore = defineStore('data', () => {
  const categories = ref([])
  const questions = ref([])
  const answers = ref([])
  const isLoading = ref(false)
  const isLoaded = ref(false)

  /**
   * Load all data from old JS files
   */
  async function loadData() {
    if (isLoaded.value) return

    try {
      isLoading.value = true
      console.log('📚 Loading data from old JS files...')

      // Load categories
      await loadCategories()

      // Load all questions (4 parts)
      for (let i = 1; i <= 4; i++) {
        await loadQuestions(i)
      }

      // Load all answers (12 parts)
      for (let i = 1; i <= 12; i++) {
        await loadAnswers(i)
      }

      isLoaded.value = true
      console.log(`✅ Data loaded: ${categories.value.length} categories, ${questions.value.length} questions, ${answers.value.length} answers`)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load categories
   */
  async function loadCategories() {
    try {
      const response = await fetch('/www-old-backup/js/categories.js')
      const text = await response.text()
      const jsonMatch = text.match(/\[[\s\S]*\]/m)
      if (jsonMatch) {
        categories.value = JSON.parse(jsonMatch[0])
        console.log(`📁 Loaded ${categories.value.length} categories`)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  /**
   * Load questions (parts 1-4)
   */
  async function loadQuestions(part) {
    try {
      const response = await fetch(`/www-old-backup/js/questions${part}.js`)
      const text = await response.text()
      const jsonMatch = text.match(/\[[\s\S]*\]/m)
      if (jsonMatch) {
        const partQuestions = JSON.parse(jsonMatch[0])
        questions.value.push(...partQuestions)
        console.log(`📝 Loaded ${partQuestions.length} questions (part ${part})`)
      }
    } catch (error) {
      console.error(`Failed to load questions part ${part}:`, error)
    }
  }

  /**
   * Load answers (parts 1-12)
   */
  async function loadAnswers(part) {
    try {
      const response = await fetch(`/www-old-backup/js/answers${part}.js`)
      const text = await response.text()
      const jsonMatch = text.match(/\[[\s\S]*\]/m)
      if (jsonMatch) {
        const partAnswers = JSON.parse(jsonMatch[0])
        answers.value.push(...partAnswers)
        console.log(`💬 Loaded ${partAnswers.length} answers (part ${part})`)
      }
    } catch (error) {
      console.error(`Failed to load answers part ${part}:`, error)
    }
  }

  /**
   * Get categories by parent (using element field)
   */
  function getCategoriesByParent(parentElement = 0) {
    return categories.value.filter(cat => cat.parent == parentElement || cat.parent === parentElement.toString())
  }

  /**
   * Get category by ID
   */
  function getCategory(id) {
    return categories.value.find(cat => cat.id == id)
  }

  /**
   * Get category by element
   */
  function getCategoryByElement(element) {
    return categories.value.find(cat => cat.element == element)
  }

  /**
   * Get questions by category (using element field)
   */
  function getQuestionsByCategory(categoryElement) {
    return questions.value.filter(q => q.category_id == categoryElement)
  }

  /**
   * Get question by ID
   */
  function getQuestion(id) {
    return questions.value.find(q => q.id == id)
  }

  /**
   * Get answer by question ID
   */
  function getAnswer(questionId) {
    return answers.value.find(a => a.question_id == questionId)
  }

  /**
   * Search questions
   */
  function searchQuestions(term) {
    const lowerTerm = term.toLowerCase()
    return questions.value.filter(q =>
      q.question.toLowerCase().includes(lowerTerm) ||
      q.question_full.toLowerCase().includes(lowerTerm)
    )
  }

  return {
    // State
    categories,
    questions,
    answers,
    isLoading,
    isLoaded,

    // Actions
    loadData,
    loadCategories,
    loadQuestions,
    loadAnswers,

    // Getters
    getCategoriesByParent,
    getCategory,
    getCategoryByElement,
    getQuestionsByCategory,
    getQuestion,
    getAnswer,
    searchQuestions
  }
})
