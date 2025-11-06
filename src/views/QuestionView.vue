<template>
  <div class="question-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 text-2xl hover:opacity-80 transition-opacity">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex-1">
        <h1 class="text-xl font-bold">Question</h1>
        <p class="text-primary-100 dark:text-primary-200 text-sm">Q#{{ currentQuestion?.question_no }}</p>
      </div>
      <button @click="toggleBookmark" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
        <Icon :name="isBookmarked ? 'bookmarkSolid' : 'bookmark'" size="lg" :class="isBookmarked ? 'text-accent-400' : 'text-white'" />
      </button>
    </header>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p class="mt-4 text-neutral-600 dark:text-neutral-400">Loading question...</p>
        </div>
      </div>

      <!-- Question & Answer Content -->
      <div v-else-if="currentQuestion && currentAnswer" class="space-y-6">
        <!-- Question Section -->
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-900/50 p-6">
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">{{ currentQuestion.question }}</h2>
          <p class="text-neutral-600 dark:text-neutral-400">{{ currentQuestion.question_full }}</p>
        </div>

        <!-- Answer Section -->
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-900/50 p-6">
          <h3 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Answer</h3>
          <div class="prose prose-sm dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300" v-html="currentAnswer.answers"></div>
        </div>

        <!-- Related Questions Section (placeholder) -->
        <div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Related Questions</h3>
          <p class="text-neutral-600 dark:text-neutral-400 text-sm">Coming soon...</p>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else class="text-center py-12">
        <div class="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="xCircle" size="xl" class="text-neutral-400 dark:text-neutral-600" />
        </div>
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Question Not Found</h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6">This question could not be loaded</p>
        <Button variant="primary" size="lg" @click="goBack">
          Go Back
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import Icon from '@/components/common/Icon.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()

const currentQuestion = ref(null)
const currentAnswer = ref(null)
const loading = ref(false)
const isBookmarked = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    const questionId = route.params.id

    console.log('Loading question:', questionId)

    // Load question and answer from database
    const [question, answer] = await Promise.all([
      dataStore.getQuestion(questionId),
      dataStore.getAnswer(questionId)
    ])

    console.log('Question loaded:', question)
    console.log('Answer loaded:', answer)

    currentQuestion.value = question
    currentAnswer.value = answer

    // Check if bookmarked
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    isBookmarked.value = bookmarks.includes(parseInt(questionId))
  } catch (error) {
    console.error('Error loading question:', error)
  } finally {
    loading.value = false
  }
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
