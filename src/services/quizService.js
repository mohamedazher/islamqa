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
    try {
      const response = await fetch('/data/quiz-questions.json')
      const data = await response.json()
      this.preGeneratedQuizzes = data.quizzes || []
      this.loaded = true
      console.log(`✅ Loaded ${this.preGeneratedQuizzes.length} pre-generated quizzes`)
      return this.preGeneratedQuizzes
    } catch (error) {
      console.error('❌ Failed to load pre-generated quizzes:', error)
      console.warn('⚠️ Falling back to on-the-fly generation')
      this.loaded = false
      return []
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
    // Use pre-generated quizzes if available
    if (this.loaded && this.preGeneratedQuizzes.length > 0) {
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

    // Fallback to old generation method
    const dayString = date.toISOString().split('T')[0]
    const seed = dayString.split('-').reduce((acc, num) => acc + parseInt(num), 0)
    const startIdx = seed % Math.max(this.questions.length - 5, 1)
    const dailyQuestions = this.questions.slice(startIdx, startIdx + 5)

    return {
      id: `daily-${dayString}`,
      name: 'Daily Quiz',
      description: 'Your daily challenge',
      mode: 'daily',
      questions: dailyQuestions.map((q, idx) => this.questionToQuizItem(q, 'daily')),
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
   * Get rapid fire quiz (20 questions, timed)
   */
  getRapidFireQuiz(categoryId = null) {
    // Use pre-generated quizzes if available
    if (this.loaded && this.preGeneratedQuizzes.length > 0) {
      // Shuffle and select 20 random quizzes
      const shuffled = this.shuffleArray([...this.preGeneratedQuizzes])
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

    // Fallback to old generation
    return {
      id: `rapid-fire-${Date.now()}`,
      name: 'Rapid Fire',
      description: '20 quick questions',
      mode: 'rapid-fire',
      questions: this.generateQuiz({
        mode: 'rapid-fire',
        count: 20,
        categoryId
      }),
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
    // Use pre-generated quizzes if available, prefer hard/medium difficulty
    if (this.loaded && this.preGeneratedQuizzes.length > 0) {
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

    // Fallback to old generation
    return {
      id: `challenge-${Date.now()}`,
      name: 'Challenge Mode',
      description: 'Test your knowledge',
      mode: 'challenge',
      questions: this.generateQuiz({
        mode: 'challenge',
        count: 15,
        difficulty: 'hard'
      }),
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
