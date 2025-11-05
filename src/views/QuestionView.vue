<template>
  <div class="question-view h-full flex flex-col bg-gray-50">
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 text-2xl">←</button>
      <div class="flex-1">
        <h1 class="text-xl font-bold">Question</h1>
        <p class="text-blue-100 text-sm">Q#{{ currentQuestion?.question_no }}</p>
      </div>
      <button @click="toggleBookmark" class="text-2xl" :class="{ 'text-yellow-300': isBookmarked, 'text-white': !isBookmarked }">
        🔖
      </button>
    </header>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>

      <!-- Question & Answer Content -->
      <div v-else-if="currentQuestion && currentAnswer" class="space-y-6">
        <!-- Question Section -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ currentQuestion.question }}</h2>
          <p class="text-gray-600">{{ currentQuestion.question_full }}</p>
        </div>

        <!-- Answer Section -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Answer</h3>
          <div class="prose prose-sm max-w-none text-gray-700" v-html="currentAnswer.answers"></div>
        </div>

        <!-- Related Questions Section (placeholder) -->
        <div class="bg-blue-50 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Related Questions</h3>
          <p class="text-gray-600 text-sm">Coming soon...</p>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">❌</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Question Not Found</h3>
        <p class="text-gray-600 mb-6">This question could not be loaded</p>
        <button @click="goBack" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()

const currentQuestion = ref(null)
const currentAnswer = ref(null)
const loading = ref(false)
const isBookmarked = ref(false)

onMounted(async () => {
  loading.value = true
  const questionId = route.params.id

  // Load data if not loaded yet
  if (!dataStore.isLoaded) {
    await dataStore.loadData()
  }

  currentQuestion.value = dataStore.getQuestion(questionId)
  currentAnswer.value = dataStore.getAnswer(questionId)

  // Check if bookmarked
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
  isBookmarked.value = bookmarks.includes(parseInt(questionId))

  loading.value = false
})

function goBack() {
  router.back()
}

function toggleBookmark() {
  if (!currentQuestion.value) return

  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
  const questionId = parseInt(currentQuestion.value.id)

  if (isBookmarked.value) {
    // Remove bookmark
    const index = bookmarks.indexOf(questionId)
    if (index > -1) {
      bookmarks.splice(index, 1)
    }
  } else {
    // Add bookmark
    bookmarks.push(questionId)
  }

  isBookmarked.value = !isBookmarked.value
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
  localStorage.setItem('bookmarkCount', bookmarks.length.toString())
  console.log('Bookmark toggled:', isBookmarked.value)
}
</script>

<style scoped>
.prose {
  font-size: 1rem;
  line-height: 1.6;
}

.prose :deep(p) {
  margin-bottom: 1rem;
}

.prose :deep(strong) {
  font-weight: 600;
  color: #111827;
}

.prose :deep(em) {
  font-style: italic;
}

.prose :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(li) {
  margin-bottom: 0.5rem;
}
</style>
