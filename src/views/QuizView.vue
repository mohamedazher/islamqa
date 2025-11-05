<template>
  <div class="quiz-view h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 shadow">
      <button @click="goBack" class="text-2xl mb-3">←</button>
      <div v-if="!currentQuiz" class="flex items-center justify-between">
        <h1 class="text-xl font-bold">🎯 Quiz Mode</h1>
        <div class="text-right">
          <div class="text-2xl font-bold">{{ gamification.points }}</div>
          <div class="text-xs text-purple-100">Points</div>
        </div>
      </div>
      <div v-else class="flex items-center justify-between">
        <h1 class="text-xl font-bold">{{ currentQuiz.name }}</h1>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-lg font-bold">{{ currentQuestionIndex + 1 }}/{{ currentQuiz.questions.length }}</div>
            <div class="text-xs text-purple-100">Questions</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Quiz Mode Selection -->
      <div v-if="!currentQuiz" class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Choose a quiz mode:</h2>

        <!-- Daily Quiz Card -->
        <button
          @click="startDailyQuiz"
          class="w-full bg-white rounded-lg shadow p-5 text-left hover:shadow-md hover:bg-purple-50 transition"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-900 text-lg">🌟 Daily Quiz</h3>
            <span class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">+50 pts</span>
          </div>
          <p class="text-sm text-gray-600">5 questions · Same quiz for all users today</p>
          <p class="text-xs text-purple-600 mt-2">🔥 Streak: {{ gamification.streak }} days</p>
        </button>

        <!-- Rapid Fire Quiz Card -->
        <button
          @click="startRapidFireQuiz"
          class="w-full bg-white rounded-lg shadow p-5 text-left hover:shadow-md hover:bg-purple-50 transition"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-900 text-lg">⚡ Rapid Fire</h3>
            <span class="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full">+100 pts</span>
          </div>
          <p class="text-sm text-gray-600">20 questions · 60 seconds · Fast paced</p>
        </button>

        <!-- Category Quiz Card -->
        <button
          @click="showCategorySelector = true"
          class="w-full bg-white rounded-lg shadow p-5 text-left hover:shadow-md hover:bg-purple-50 transition"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-900 text-lg">📚 Category Quiz</h3>
            <span class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">+50 pts</span>
          </div>
          <p class="text-sm text-gray-600">10 questions · Pick your topic</p>
        </button>

        <!-- Challenge Mode Card -->
        <button
          @click="startChallengeQuiz"
          class="w-full bg-white rounded-lg shadow p-5 text-left hover:shadow-md hover:bg-purple-50 transition border-2 border-purple-400"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-900 text-lg">🏆 Challenge Mode</h3>
            <span class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">+150 pts</span>
          </div>
          <p class="text-sm text-gray-600">15 questions · Tougher questions</p>
        </button>

        <!-- Stats Section -->
        <div class="bg-white rounded-lg shadow p-4 mt-6">
          <h3 class="font-semibold text-gray-900 mb-3">📊 Your Stats</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-purple-600">{{ gamification.stats.quizzesCompleted }}</div>
              <div class="text-xs text-gray-600">Quizzes</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ gamification.stats.avgAccuracy }}%</div>
              <div class="text-xs text-gray-600">Accuracy</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ gamification.currentLevel }}</div>
              <div class="text-xs text-gray-600">Level</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz in Progress -->
      <div v-else-if="currentQuiz && !quizCompleted" class="space-y-4">
        <!-- Progress Bar -->
        <div class="bg-white rounded-lg shadow p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Progress</span>
            <span class="text-sm text-gray-600">{{ currentQuestionIndex + 1 }}/{{ currentQuiz.questions.length }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-purple-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100 + '%' }"
            ></div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
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
                  'border-purple-600 bg-purple-50 text-purple-900': selectedAnswer === idx && !answered,
                  'border-green-500 bg-green-50 text-green-900': answered && idx === currentQuestion.correctOptionId,
                  'border-red-500 bg-red-50 text-red-900': answered && selectedAnswer === idx && idx !== currentQuestion.correctOptionId,
                  'border-gray-200 bg-white text-gray-900 hover:border-purple-400': !answered && selectedAnswer !== idx,
                  'border-gray-200 bg-white text-gray-400 cursor-not-allowed': answered && selectedAnswer !== idx
                }
              ]"
            >
              <div class="flex items-center">
                <span class="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3"
                  :class="{
                    'border-purple-600 bg-purple-600 text-white': selectedAnswer === idx && !answered,
                    'border-green-500 bg-green-500 text-white': answered && idx === currentQuestion.correctOptionId,
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
          <div v-if="answered" class="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p class="text-sm text-blue-900">
              <span class="font-semibold">Explanation: </span>
              {{ currentQuestion.explanation }}
            </p>
          </div>
        </div>

        <!-- Next Button -->
        <button
          v-if="answered"
          @click="nextQuestion"
          class="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          {{ currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'See Results' }}
        </button>
      </div>

      <!-- Quiz Results -->
      <div v-else-if="quizCompleted && quizResults" class="space-y-4">
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <h2 class="text-3xl font-bold mb-2">{{ quizResults.feedback }}</h2>
          <p class="text-gray-600 mb-4">Quiz completed!</p>

          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-purple-50 rounded-lg p-4">
              <div class="text-3xl font-bold text-purple-600">{{ quizResults.correct }}</div>
              <div class="text-sm text-gray-600">Correct</div>
            </div>
            <div class="bg-blue-50 rounded-lg p-4">
              <div class="text-3xl font-bold text-blue-600">{{ quizResults.accuracy }}%</div>
              <div class="text-sm text-gray-600">Accuracy</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4">
              <div class="text-3xl font-bold text-green-600">+{{ quizResults.score }}</div>
              <div class="text-sm text-gray-600">Points</div>
            </div>
          </div>

          <!-- Achievement Notification -->
          <div v-if="newAchievements.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p class="font-semibold text-yellow-900 mb-2">🎉 Achievement Unlocked!</p>
            <div v-for="ach in newAchievements" :key="ach.id" class="text-sm text-yellow-800">
              {{ ach.icon }} {{ ach.name }}: +{{ ach.points }} points
            </div>
          </div>

          <button
            @click="restartQuiz"
            class="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition mb-2"
          >
            Take Another Quiz
          </button>
          <button
            @click="goBack"
            class="w-full bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
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
  // Initialize gamification
  gamification.initializeFromStorage()

  // Wait for data to load
  if (!dataStore.isLoaded) {
    await dataStore.loadData()
  }

  // Initialize quiz service
  quizService.value = new QuizService(dataStore.questions)

  console.log('🎯 Quiz view initialized')
})
</script>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
