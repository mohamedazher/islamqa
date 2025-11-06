<template>
  <div class="quiz-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow">
      <button @click="goBack" class="hover:opacity-80 transition-opacity mb-3">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div v-if="!currentQuiz" class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon name="lightning" size="md" />
          <h1 class="text-xl font-bold">Quiz Mode</h1>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold">{{ gamification.points }}</div>
          <div class="text-xs text-primary-100">Points</div>
        </div>
      </div>
      <div v-else class="flex items-center justify-between">
        <h1 class="text-xl font-bold">{{ currentQuiz.name }}</h1>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-lg font-bold">{{ currentQuestionIndex + 1 }}/{{ currentQuiz.questions.length }}</div>
            <div class="text-xs text-primary-100">Questions</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Quiz Mode Selection -->
      <div v-if="!currentQuiz" class="space-y-4">
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Choose a quiz mode:</h2>

        <!-- Daily Quiz Card -->
        <button
          @click="startDailyQuiz"
          class="w-full bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-5 text-left hover:shadow-md dark:hover:shadow-neutral-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Icon name="star" size="md" class="text-primary-600 dark:text-primary-400" />
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">Daily Quiz</h3>
            </div>
            <span class="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">+50 pts</span>
          </div>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">5 questions · Same quiz for all users today</p>
          <div class="flex items-center gap-1 text-xs text-accent-600 dark:text-accent-400 mt-2">
            <Icon name="fire" size="xs" />
            <span>Streak: {{ gamification.streak }} days</span>
          </div>
        </button>

        <!-- Rapid Fire Quiz Card -->
        <button
          @click="startRapidFireQuiz"
          class="w-full bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-5 text-left hover:shadow-md dark:hover:shadow-neutral-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Icon name="lightning" size="md" class="text-accent-600 dark:text-accent-400" />
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">Rapid Fire</h3>
            </div>
            <span class="text-xs bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300 px-3 py-1 rounded-full">+100 pts</span>
          </div>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">20 questions · 60 seconds · Fast paced</p>
        </button>

        <!-- Category Quiz Card -->
        <button
          @click="showCategorySelector = true"
          class="w-full bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-5 text-left hover:shadow-md dark:hover:shadow-neutral-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Icon name="book" size="md" class="text-primary-600 dark:text-primary-400" />
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">Category Quiz</h3>
            </div>
            <span class="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">+50 pts</span>
          </div>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">10 questions · Pick your topic</p>
        </button>

        <!-- Challenge Mode Card -->
        <button
          @click="startChallengeQuiz"
          class="w-full bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-5 text-left hover:shadow-md dark:hover:shadow-neutral-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition border-2 border-primary-400 dark:border-primary-600"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Icon name="star" size="md" class="text-primary-600 dark:text-primary-400" />
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">Challenge Mode</h3>
            </div>
            <span class="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">+150 pts</span>
          </div>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">15 questions · Tougher questions</p>
        </button>

        <!-- Stats Section -->
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-4 mt-6">
          <div class="flex items-center gap-2 mb-3">
            <Icon name="document" size="md" class="text-primary-600 dark:text-primary-400" />
            <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">Your Stats</h3>
          </div>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ gamification.stats.quizzesCompleted }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400">Quizzes</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-accent-600 dark:text-accent-400">{{ gamification.stats.avgAccuracy }}%</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400">Accuracy</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ gamification.currentLevel }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400">Level</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz in Progress -->
      <div v-else-if="currentQuiz && !quizCompleted" class="space-y-4">
        <!-- Progress Bar -->
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Progress</span>
            <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ currentQuestionIndex + 1 }}/{{ currentQuiz.questions.length }}</span>
          </div>
          <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              class="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100 + '%' }"
            ></div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            {{ currentQuestion.questionText }}
          </h3>

          <!-- Multiple Choice Options -->
          <div class="space-y-2">
            <button
              v-for="(option, idx) in currentQuestion.options"
              :key="idx"
              @click="selectAnswer(idx)"
              :disabled="answered"
              :class="[
                'w-full p-4 rounded-lg border-2 text-left transition font-medium',
                {
                  'border-primary-600 bg-primary-50 dark:bg-primary-950/30 text-primary-900 dark:text-primary-100': selectedAnswer === idx && !answered,
                  'border-accent-500 bg-accent-50 dark:bg-accent-950/30 text-accent-900 dark:text-accent-100': answered && idx === currentQuestion.correctOptionId,
                  'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100': answered && selectedAnswer === idx && idx !== currentQuestion.correctOptionId,
                  'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:border-primary-400 dark:hover:border-primary-600': !answered && selectedAnswer !== idx,
                  'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 cursor-not-allowed': answered && selectedAnswer !== idx
                }
              ]"
            >
              <div class="flex items-center">
                <span class="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3"
                  :class="{
                    'border-primary-600 bg-primary-600 text-white': selectedAnswer === idx && !answered,
                    'border-accent-500 bg-accent-500 text-white': answered && idx === currentQuestion.correctOptionId,
                    'border-red-500 bg-red-500 text-white': answered && selectedAnswer === idx && idx !== currentQuestion.correctOptionId,
                  }"
                >
                  {{ String.fromCharCode(65 + idx) }}
                </span>
                {{ option.text }}
              </div>
            </button>
          </div>

          <!-- Explanation (shown after answer) -->
          <div v-if="answered" class="mt-4 p-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg border-l-4 border-primary-500 dark:border-primary-600">
            <p class="text-sm text-primary-900 dark:text-primary-100">
              <span class="font-semibold">Explanation: </span>
              {{ currentQuestion.explanation }}
            </p>
          </div>
        </div>

        <!-- Next Button -->
        <button
          v-if="answered"
          @click="nextQuestion"
          class="w-full bg-primary-600 dark:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition"
        >
          {{ currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'See Results' }}
        </button>
      </div>

      <!-- Quiz Results -->
      <div v-else-if="quizCompleted && quizResults" class="space-y-4">
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-6 text-center">
          <h2 class="text-3xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">{{ quizResults.feedback }}</h2>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">Quiz completed!</p>

          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-4">
              <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ quizResults.correct }}</div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400">Correct</div>
            </div>
            <div class="bg-accent-50 dark:bg-accent-950/30 rounded-lg p-4">
              <div class="text-3xl font-bold text-accent-600 dark:text-accent-400">{{ quizResults.accuracy }}%</div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400">Accuracy</div>
            </div>
            <div class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-4">
              <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">+{{ quizResults.score }}</div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400">Points</div>
            </div>
          </div>

          <!-- Achievement Notification -->
          <div v-if="newAchievements.length > 0" class="bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800 rounded-lg p-4 mb-4">
            <p class="font-semibold text-accent-900 dark:text-accent-100 mb-2">🎉 Achievement Unlocked!</p>
            <div v-for="ach in newAchievements" :key="ach.id" class="text-sm text-accent-800 dark:text-accent-200">
              {{ ach.icon }} {{ ach.name }}: +{{ ach.points }} points
            </div>
          </div>

          <button
            @click="restartQuiz"
            class="w-full bg-primary-600 dark:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition mb-2"
          >
            Take Another Quiz
          </button>
          <button
            @click="goBack"
            class="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useGamificationStore } from '@/stores/gamification'
import QuizService from '@/services/quizService'
import Icon from '@/components/common/Icon.vue'

const router = useRouter()
const dataStore = useDataStore()
const gamification = useGamificationStore()

const currentQuiz = ref(null)
const quizService = ref(null)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const answered = ref(false)
const quizCompleted = ref(false)
const quizResults = ref(null)
const newAchievements = ref([])
const showCategorySelector = ref(false)

const currentQuestion = computed(() => {
  if (!currentQuiz.value || currentQuestionIndex.value >= currentQuiz.value.questions.length) {
    return null
  }
  return currentQuiz.value.questions[currentQuestionIndex.value]
})

// Quiz Mode Starters
function startDailyQuiz() {
  currentQuiz.value = quizService.value.getDailyQuiz()
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  answered.value = false
}

function startRapidFireQuiz() {
  currentQuiz.value = quizService.value.getRapidFireQuiz()
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  answered.value = false
}

function startChallengeQuiz() {
  currentQuiz.value = quizService.value.getChallengeQuiz()
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  answered.value = false
}

function selectAnswer(optionIndex) {
  if (answered.value) return
  selectedAnswer.value = optionIndex
  answered.value = true
}

function nextQuestion() {
  if (currentQuestionIndex.value < currentQuiz.value.questions.length - 1) {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    answered.value = false
  } else {
    completeQuiz()
  }
}

function completeQuiz() {
  const answers = [] // Would collect from user selections
  quizResults.value = quizService.value.calculateScore(currentQuiz.value, answers)

  // Award points and check achievements
  const previousUnlocked = gamification.unlockedAchievements.length
  gamification.completeQuiz(quizResults.value.score, quizResults.value.accuracy)
  const newlyUnlocked = gamification.unlockedAchievements.length - previousUnlocked
  newAchievements.value = gamification.unlockedAchievements.slice(-newlyUnlocked)

  quizCompleted.value = true
}

function restartQuiz() {
  currentQuiz.value = null
  quizCompleted.value = false
  quizResults.value = null
  newAchievements.value = []
  selectedAnswer.value = null
  answered.value = false
  currentQuestionIndex.value = 0
}

function goBack() {
  if (currentQuiz.value) {
    if (confirm('Are you sure? Your progress will be lost.')) {
      restartQuiz()
    }
  } else {
    router.back()
  }
}

// Initialize
onMounted(async () => {
  try {
    // Initialize gamification
    gamification.initializeFromStorage()

    // Load all questions from database
    const questions = await dataStore.getAllQuestions()

    // Initialize quiz service
    quizService.value = new QuizService(questions)

    console.log('🎯 Quiz view initialized with', questions.length, 'questions')
  } catch (error) {
    console.error('Error initializing quiz:', error)
  }
})
</script>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
