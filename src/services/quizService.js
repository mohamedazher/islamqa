/**
 * Quiz Service - Generate quizzes from the database using reference IDs
 *
 * UPDATED: Uses Dexie database with semantic reference IDs instead of pre-generated JSON
 * All questions referenced by their semantic reference ID from IslamQA
 */

import dexieDb from './dexieDatabase'

class QuizService {
  constructor() {
    this.db = dexieDb
  }

  /**
   * Get daily quiz (deterministic - same quiz all day)
   * Uses date-based seed for consistent selection
   */
  async getDailyQuiz() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const seed = today.split('-').reduce((acc, num) => acc + parseInt(num), 0)

      // Get all questions (will be filtered)
      const allQuestions = await this.db.getAllQuestions()
      if (allQuestions.length === 0) {
        throw new Error('No questions in database')
      }

      // Use seed to consistently select 5 questions for the day
      const selected = this.selectWithSeed(allQuestions, 5, seed)

      // Transform to quiz format (only use enhanced questions)
      const quizQuestionsRaw = await Promise.all(selected.map(q => this.transformToQuizQuestion(q)))
      const quizQuestions = quizQuestionsRaw.filter(q => q !== null)

      if (quizQuestions.length === 0) {
        throw new Error('No quiz questions available for daily quiz. Please generate quiz questions first.')
      }

      return {
        id: `daily-${today}`,
        name: 'Daily Quiz',
        description: 'Your daily Islamic knowledge challenge',
        mode: 'daily',
        questions: quizQuestions,
        timeLimit: null,
        points: 50
      }
    } catch (error) {
      console.error('Error generating daily quiz:', error)
      throw error
    }
  }

  /**
   * Get rapid-fire quiz (20 questions, timed)
   * Dynamic selection with difficulty filter
   */
  async getRapidFireQuiz(options = {}) {
    try {
      const { difficulty = 'all', categories = [] } = options

      let questions = await this.db.getAllQuestions()

      // Filter by categories if specified
      if (categories && categories.length > 0) {
        questions = questions.filter(q =>
          q.primary_category && categories.includes(q.primary_category) ||
          (q.categories && q.categories.some(cat => categories.includes(cat)))
        )
      }

      // Shuffle and select 20 questions
      const selected = this.shuffleArray([...questions]).slice(0, 20)

      // Transform to quiz format (only use enhanced questions)
      const quizQuestionsRaw = await Promise.all(selected.map(q => this.transformToQuizQuestion(q)))
      const quizQuestions = quizQuestionsRaw.filter(q => q !== null)

      if (quizQuestions.length === 0) {
        throw new Error('No quiz questions available for rapid-fire quiz. Please generate quiz questions first.')
      }

      return {
        id: `rapid-fire-${Date.now()}`,
        name: 'Rapid Fire',
        description: '20 quick questions - answer fast!',
        mode: 'rapid-fire',
        questions: quizQuestions,
        timeLimit: 60,
        pointsPerQuestion: 5
      }
    } catch (error) {
      console.error('Error generating rapid-fire quiz:', error)
      throw error
    }
  }

  /**
   * Get category-specific quiz
   * Queries all questions from a specific category
   */
  async getCategoryQuiz(categoryReference, count = 10, difficulty = 'all') {
    try {
      const categoryReference_num = typeof categoryReference === 'string'
        ? parseInt(categoryReference, 10)
        : categoryReference

      // Get questions from this category
      const questions = await this.db.getQuestionsByCategory(categoryReference_num, 1000)

      if (questions.length === 0) {
        throw new Error(`No questions found for category ${categoryReference_num}`)
      }

      // Shuffle and select
      const selected = this.shuffleArray([...questions]).slice(0, Math.min(count, questions.length))

      // Transform to quiz format (only use enhanced questions)
      const quizQuestionsRaw = await Promise.all(selected.map(q => this.transformToQuizQuestion(q)))
      const quizQuestions = quizQuestionsRaw.filter(q => q !== null)

      if (quizQuestions.length === 0) {
        throw new Error(`No quiz questions available for this category. Please generate quiz questions first.`)
      }

      return {
        id: `category-${categoryReference_num}-${Date.now()}`,
        name: 'Category Quiz',
        description: `Test your knowledge in this category`,
        mode: 'category',
        questions: quizQuestions,
        categoryReference: categoryReference_num,
        timeLimit: null,
        points: quizQuestions.length * 10
      }
    } catch (error) {
      console.error('Error generating category quiz:', error)
      throw error
    }
  }

  /**
   * Get custom quiz with filters
   */
  async getCustomQuiz(options = {}) {
    try {
      const {
        categories = [],  // Array of category references
        difficulty = 'all',
        count = 10
      } = options

      let questions = await this.db.getAllQuestions()

      // Filter by categories if specified
      if (categories.length > 0) {
        questions = questions.filter(q =>
          q.primary_category && categories.includes(q.primary_category) ||
          (q.categories && q.categories.some(cat => categories.includes(cat)))
        )
      }

      // Shuffle and select
      const selected = this.shuffleArray([...questions]).slice(0, Math.min(count, questions.length))

      // Transform to quiz format (only use enhanced questions)
      const quizQuestionsRaw = await Promise.all(selected.map(q => this.transformToQuizQuestion(q)))
      const quizQuestions = quizQuestionsRaw.filter(q => q !== null)

      if (quizQuestions.length === 0) {
        throw new Error('No quiz questions available. Please generate quiz questions first.')
      }

      return {
        id: `custom-${Date.now()}`,
        name: 'Custom Quiz',
        description: `${quizQuestions.length} questions${categories.length > 0 ? ' from selected categories' : ''}`,
        mode: 'custom',
        questions: quizQuestions,
        selectedCategories: categories,
        timeLimit: null,
        points: quizQuestions.length * 10
      }
    } catch (error) {
      console.error('Error generating custom quiz:', error)
      throw error
    }
  }

  /**
   * Get challenge quiz (15 harder questions)
   */
  async getChallengeQuiz() {
    try {
      // Get random questions (all have similar difficulty in our data)
      const allQuestions = await this.db.getAllQuestions()
      if (allQuestions.length === 0) {
        throw new Error('No questions in database')
      }

      // Select 15 random questions for challenge
      const selected = this.shuffleArray([...allQuestions]).slice(0, Math.min(15, allQuestions.length))

      // Transform to quiz format (only use enhanced questions)
      const quizQuestionsRaw = await Promise.all(selected.map(q => this.transformToQuizQuestion(q)))
      const quizQuestions = quizQuestionsRaw.filter(q => q !== null)

      if (quizQuestions.length === 0) {
        throw new Error('No quiz questions available for challenge quiz. Please generate quiz questions first.')
      }

      return {
        id: `challenge-${Date.now()}`,
        name: 'Challenge Mode',
        description: 'Test your Islamic knowledge - challenging questions',
        mode: 'challenge',
        questions: quizQuestions,
        timeLimit: 90,
        points: quizQuestions.length * 10
      }
    } catch (error) {
      console.error('Error generating challenge quiz:', error)
      throw error
    }
  }

  /**
   * Get all available categories for quiz filtering
   */
  async getAvailableCategories() {
    try {
      const categories = await this.db.getCategories(null) // Get root categories
      console.log(`Found ${categories.length} available categories for quiz`)
      return categories
    } catch (error) {
      console.error('Error getting available categories:', error)
      return []
    }
  }

  /**
   * Calculate quiz score and generate results
   */
  calculateScore(quiz, answers) {
    try {
      let correct = 0
      const results = []

      quiz.questions.forEach((question, idx) => {
        const userAnswerIndex = answers[idx]
        const isCorrect = userAnswerIndex === question.correctOptionId

        if (isCorrect) {
          correct++
        }

        results.push({
          questionReference: question.reference,  // Use reference ID
          userAnswerIndex,
          isCorrect,
          correctOptionIndex: question.correctOptionId,
          pointsEarned: isCorrect ? (question.points || 10) : 0
        })
      })

      const total = quiz.questions.length
      const accuracy = Math.round((correct / total) * 100)
      const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0)
      const score = results.reduce((sum, r) => sum + r.pointsEarned, 0)

      return {
        score,
        correct,
        total,
        accuracy,
        maxScore: totalPoints,
        results,
        feedback: this.generateFeedback(accuracy)
      }
    } catch (error) {
      console.error('Error calculating score:', error)
      throw error
    }
  }

  /**
   * Save quiz attempt to database
   */
  async saveQuizAttempt(quizConfig, answers, score) {
    try {
      const attempt = {
        quiz_config_id: quizConfig.id,
        answers,  // Array of answer indices
        correct: score.correct,
        total: score.total,
        accuracy: score.accuracy,
        points: score.score,
        timestamp: Date.now(),
        session_id: this.generateSessionId()  // For grouping by user session
      }

      const attemptId = await this.db.saveQuizAttempt(attempt)
      console.log(`✅ Saved quiz attempt with ID: ${attemptId}`)
      return attemptId
    } catch (error) {
      console.error('Error saving quiz attempt:', error)
      throw error
    }
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats() {
    try {
      const stats = await this.db.getQuizStats()
      return stats
    } catch (error) {
      console.error('Error getting quiz stats:', error)
      return { total_attempts: 0, average_score: 0, total_points: 0 }
    }
  }

  /**
   * Transform a database question into a quiz question with LLM-generated multiple choice options
   * ONLY loads from quiz_questions table (LLM-generated)
   * Returns null if quiz question doesn't exist
   */
  async transformToQuizQuestion(question) {
    // Load LLM-generated quiz question from database
    const quizQuestion = await this.db.getQuizQuestion(question.reference)

    if (!quizQuestion) {
      console.log(`⚠️  Question ${question.reference} not generated yet (skipping)`)
      return null  // Quiz question not generated, skip it
    }

    console.log(`📚 Loading quiz question ${question.reference}`)
    return {
      reference: question.reference,
      questionText: quizQuestion.questionText,
      question: question.question,
      answer: question.answer,
      explanation: quizQuestion.explanation,
      primaryCategory: question.primary_category,
      categories: question.categories,
      options: quizQuestion.options,
      correctOptionId: quizQuestion.options.findIndex(opt => opt.isCorrect),
      points: quizQuestion.points || 10,
      tags: quizQuestion.tags,
      difficulty: quizQuestion.difficulty
    }
  }

  /**
   * Generate feedback based on accuracy
   */
  generateFeedback(accuracy) {
    if (accuracy === 100) return '🌟 Perfect score! Excellent knowledge!'
    if (accuracy >= 80) return '👏 Great job! Very good understanding'
    if (accuracy >= 60) return '✅ Good effort! Keep learning'
    if (accuracy >= 40) return '📚 Keep practicing, you\'re making progress'
    return '💪 Don\'t give up! Try again to improve'
  }

  /**
   * Utility: Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Utility: Select items using a seed for deterministic results
   */
  selectWithSeed(array, count, seed) {
    const startIdx = seed % Math.max(array.length - count, 1)
    return array.slice(startIdx, startIdx + count)
  }

  /**
   * Generate a session ID for tracking user quiz session
   */
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

export default QuizService
