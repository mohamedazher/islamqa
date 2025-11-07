/**
 * Quiz Service - Loads pre-generated quizzes and provides different modes
 */
class QuizService {
  constructor(questions = []) {
    this.questions = questions // Legacy database questions (for backward compatibility)
    this.preGeneratedQuizzes = [] // Pre-generated high-quality quizzes
    this.loaded = false
  }

  /**
   * Load pre-generated quizzes from JSON file
   */
  async loadPreGeneratedQuizzes() {
    console.log('🔄 Loading pre-generated quizzes from /data/quiz-questions.json...')

    try {
      const response = await fetch('/data/quiz-questions.json')

      console.log('📡 Fetch response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Raw data received:', {
        version: data.version,
        totalQuizzes: data.totalQuizzes,
        actualQuizCount: data.quizzes?.length || 0
      })

      if (!data.quizzes || data.quizzes.length === 0) {
        throw new Error('No quizzes found in quiz-questions.json')
      }

      // Transform loaded quizzes to match expected format
      this.preGeneratedQuizzes = data.quizzes.map(quiz => this.transformQuizFormat(quiz))

      this.loaded = true
      console.log(`✅ Successfully loaded and transformed ${this.preGeneratedQuizzes.length} quizzes`)
      console.log('📋 Sample transformed quiz:', this.preGeneratedQuizzes[0])

      return this.preGeneratedQuizzes
    } catch (error) {
      console.error('❌ CRITICAL: Failed to load pre-generated quizzes')
      console.error('   Error:', error)
      console.error('   Stack:', error.stack)
      this.loaded = false
      throw error // Don't swallow the error - let it bubble up
    }
  }

  /**
   * Transform pre-generated quiz format to match UI expectations
   */
  transformQuizFormat(quiz) {
    // Find the correct answer index
    const correctIndex = quiz.options.findIndex(opt => opt.isCorrect === true)

    // Transform options to expected format with numeric indices
    const transformedOptions = quiz.options.map((opt, idx) => ({
      text: opt.text,
      id: idx,
      isCorrect: opt.isCorrect || false
    }))

    return {
      id: quiz.id,
      sourceQuestionId: quiz.sourceQuestionId,
      questionText: quiz.questionText,
      type: quiz.type,
      difficulty: quiz.difficulty,
      category: quiz.category,
      options: transformedOptions,
      correctOptionId: correctIndex, // Add the index of correct answer
      explanation: quiz.explanation,
      sourceReference: quiz.sourceReference,
      points: quiz.points || 10,
      tags: quiz.tags || []
    }
  }

  /**
   * Generate a quiz with specified options
   */
  generateQuiz(options = {}) {
    const {
      mode = 'daily',           // daily, rapid-fire, category, challenge
      count = 5,
      categoryId = null,
      difficulty = 'medium'
    } = options

    let selectedQuestions = this.questions

    // Filter by category if specified
    if (categoryId) {
      selectedQuestions = selectedQuestions.filter(q => q.category_id == categoryId)
    }

    // Filter by difficulty if needed
    if (difficulty !== 'all') {
      selectedQuestions = this.filterByDifficulty(selectedQuestions, difficulty)
    }

    // Shuffle and select random questions
    const shuffled = this.shuffleArray([...selectedQuestions])
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))

    // Convert questions to quiz items with options
    return selected.map(q => this.questionToQuizItem(q, mode))
  }

  /**
   * Convert a question to a quiz item with multiple choice options
   */
  questionToQuizItem(question, mode = 'daily') {
    // For true/false mode, generate boolean options
    if (mode === 'true-false') {
      return {
        id: question.id,
        questionText: question.question,
        questionNumber: question.question_no,
        category: question.category_id,
        mode: 'true-false',
        options: [
          { text: 'True', value: true, id: 1 },
          { text: 'False', value: false, id: 2 }
        ],
        correctOptionId: this.extractTrueOrFalse(question.answers ? question.answers : '') ? 1 : 2,
        explanation: `Answer: This is a true/false question about Islamic knowledge`,
        points: 10
      }
    }

    // For multiple choice, generate 4 options
    const correctAnswer = this.extractCorrectAnswer(question)
    const options = this.generateMultipleChoiceOptions(question, correctAnswer)

    return {
      id: question.id,
      questionText: question.question,
      questionNumber: question.question_no,
      category: question.category_id,
      mode: 'multiple-choice',
      options: options,
      correctOptionId: options.findIndex(opt => opt.isCorrect),
      explanation: `The correct answer is: ${correctAnswer}`,
      points: 10
    }
  }

  /**
   * Extract key facts from question text
   */
  extractCorrectAnswer(question) {
    // For now, return a simple fact from question text
    // In real implementation, would parse answer HTML
    if (question.question_full) {
      const words = question.question_full.split(' ')
      return words.slice(0, Math.min(5, words.length)).join(' ')
    }
    return 'Yes'
  }

  /**
   * Generate multiple choice options
   * Correct answer + 3 plausible wrong answers
   */
  generateMultipleChoiceOptions(question, correctAnswer) {
    const options = [
      {
        text: correctAnswer,
        isCorrect: true,
        id: 1
      }
    ]

    // Generate plausible wrong answers based on question variations
    const wrongAnswers = [
      'None of the above',
      'It depends on circumstances',
      'All of the above',
      'Not mentioned in Islamic teachings'
    ]

    // Add 3 random wrong answers
    for (let i = 0; i < 3; i++) {
      options.push({
        text: wrongAnswers[i],
        isCorrect: false,
        id: i + 2
      })
    }

    // Shuffle options
    return this.shuffleArray(options)
  }

  /**
   * Extract true/false from answer
   */
  extractTrueOrFalse(answerText) {
    const lowerText = answerText.toLowerCase()
    return lowerText.includes('yes') || lowerText.includes('permissible') || lowerText.includes('allowed')
  }

  /**
   * Get daily quiz (same quiz all day)
   */
  getDailyQuiz(date = new Date()) {
    if (!this.loaded || this.preGeneratedQuizzes.length === 0) {
      throw new Error('Pre-generated quizzes not loaded. Cannot generate daily quiz.')
    }

    const dayString = date.toISOString().split('T')[0]
    const seed = dayString.split('-').reduce((acc, num) => acc + parseInt(num), 0)

    // Select 5 questions using seed for consistent daily quiz
    const selected = this.selectQuizzesWithSeed(5, seed)

    return {
      id: `daily-${dayString}`,
      name: 'Daily Quiz',
      description: 'Your daily challenge',
      mode: 'daily',
      questions: selected,
      timeLimit: null,
      points: 50
    }
  }

  /**
   * Select quizzes using seed for deterministic selection
   */
  selectQuizzesWithSeed(count, seed) {
    const startIdx = seed % Math.max(this.preGeneratedQuizzes.length - count, 1)
    return this.preGeneratedQuizzes.slice(startIdx, startIdx + count)
  }

  /**
   * Get all available categories from pre-generated quizzes
   */
  getAvailableCategories() {
    if (!this.loaded || this.preGeneratedQuizzes.length === 0) {
      return []
    }
    const categories = [...new Set(this.preGeneratedQuizzes.map(q => q.category))]
    return categories.sort()
  }

  /**
   * Get custom quiz with category and difficulty filters
   */
  getCustomQuiz(options = {}) {
    const {
      categories = [], // Array of category names, empty = all
      difficulty = 'all', // 'easy', 'medium', 'hard', 'all'
      count = 10,
      mode = 'custom'
    } = options

    if (!this.loaded || this.preGeneratedQuizzes.length === 0) {
      throw new Error('Pre-generated quizzes not loaded. Cannot generate custom quiz.')
    }

    // Start with all quizzes
    let filtered = [...this.preGeneratedQuizzes]

    // Filter by categories if specified
    if (categories.length > 0) {
      filtered = filtered.filter(q => categories.includes(q.category))
    }

    // Filter by difficulty if specified
    if (difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === difficulty)
    }

    // Shuffle and select
    const shuffled = this.shuffleArray(filtered)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))

    return {
      id: `custom-${Date.now()}`,
      name: 'Custom Quiz',
      description: this.getQuizDescription(categories, difficulty, count),
      mode: mode,
      questions: selected,
      timeLimit: null,
      points: count * 10
    }
  }

  /**
   * Generate description for custom quiz
   */
  getQuizDescription(categories, difficulty, count) {
    const parts = []
    parts.push(`${count} questions`)

    if (categories.length > 0) {
      if (categories.length === 1) {
        parts.push(categories[0])
      } else {
        parts.push(`${categories.length} categories`)
      }
    }

    if (difficulty !== 'all') {
      parts.push(difficulty.charAt(0).toUpperCase() + difficulty.slice(1))
    }

    return parts.join(' · ')
  }

  /**
   * Get rapid fire quiz (20 questions, timed)
   */
  getRapidFireQuiz(options = {}) {
    const { categories = [], difficulty = 'all' } = options

    if (!this.loaded || this.preGeneratedQuizzes.length === 0) {
      throw new Error('Pre-generated quizzes not loaded. Cannot generate rapid fire quiz.')
    }

    // Apply filters if specified
    let filtered = [...this.preGeneratedQuizzes]

    if (categories.length > 0) {
      filtered = filtered.filter(q => categories.includes(q.category))
    }

    if (difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === difficulty)
    }

    // Shuffle and select 20 random quizzes
    const shuffled = this.shuffleArray(filtered)
    const selected = shuffled.slice(0, Math.min(20, shuffled.length))

    return {
      id: `rapid-fire-${Date.now()}`,
      name: 'Rapid Fire',
      description: '20 quick questions',
      mode: 'rapid-fire',
      questions: selected,
      timeLimit: 60,
      pointsPerQuestion: 5
    }
  }

  /**
   * Get category quiz
   */
  getCategoryQuiz(categoryId, count = 10) {
    return {
      id: `category-${categoryId}-${Date.now()}`,
      name: 'Category Quiz',
      description: `Learn about category ${categoryId}`,
      mode: 'category',
      questions: this.generateQuiz({
        mode: 'category',
        count,
        categoryId
      }),
      timeLimit: null,
      points: 50
    }
  }

  /**
   * Get challenge quiz (increasing difficulty)
   */
  getChallengeQuiz() {
    if (!this.loaded || this.preGeneratedQuizzes.length === 0) {
      throw new Error('Pre-generated quizzes not loaded. Cannot generate challenge quiz.')
    }

    // Filter for harder quizzes first, then shuffle
    const hardQuizzes = this.preGeneratedQuizzes.filter(q => q.difficulty === 'hard')
    const mediumQuizzes = this.preGeneratedQuizzes.filter(q => q.difficulty === 'medium')

    // Combine hard and medium, prioritizing hard
    const challengePool = [...hardQuizzes, ...mediumQuizzes]
    const shuffled = this.shuffleArray(challengePool)
    const selected = shuffled.slice(0, Math.min(15, shuffled.length))

    return {
      id: `challenge-${Date.now()}`,
      name: 'Challenge Mode',
      description: 'Test your knowledge',
      mode: 'challenge',
      questions: selected,
      timeLimit: 90,
      points: 150
    }
  }

  /**
   * Calculate score and feedback
   */
  calculateScore(quiz, answers) {
    let score = 0
    let correct = 0
    const results = []

    quiz.questions.forEach((question, idx) => {
      const userAnswerId = answers[idx]
      const isCorrect = userAnswerId === question.correctOptionId

      if (isCorrect) {
        correct++
        score += question.points
      }

      results.push({
        questionId: question.id,
        userAnswerId,
        isCorrect,
        correctOptionId: question.correctOptionId,
        pointsEarned: isCorrect ? question.points : 0
      })
    })

    const accuracy = Math.round((correct / quiz.questions.length) * 100)
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)

    return {
      score,
      correct,
      total: quiz.questions.length,
      accuracy,
      maxScore: totalPoints,
      results,
      feedback: this.generateFeedback(accuracy)
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
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Utility: Filter by difficulty
   */
  filterByDifficulty(questions, difficulty) {
    // For now, simple random selection as difficulty indicator
    if (difficulty === 'easy') return questions.slice(0, Math.floor(questions.length * 0.5))
    if (difficulty === 'hard') return questions.slice(Math.floor(questions.length * 0.5))
    return questions
  }
}

export default QuizService
