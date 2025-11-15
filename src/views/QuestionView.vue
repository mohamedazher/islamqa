<template>
  <div class="question-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow flex items-center islamic-hero-pattern">
      <button @click="goBack" class="mr-3 text-2xl hover:opacity-80 transition-opacity">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex-1">
        <h1 class="text-xl font-bold">Question</h1>
        <!-- UPDATED: Changed question_no to reference (semantic ID from IslamQA) -->
        <p class="text-primary-100 dark:text-primary-200 text-sm">Q#{{ currentQuestion?.reference }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="handleShare" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Icon name="share" size="lg" class="text-white" />
        </button>
        <button @click="toggleBookmark" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Icon :name="isBookmarked ? 'bookmarkSolid' : 'bookmark'" size="lg" :class="isBookmarked ? 'text-accent-400' : 'text-white'" />
        </button>
      </div>
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
      <div v-else-if="currentQuestion" class="space-y-6">
        <!-- Question Section -->
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-900/50 p-6">
          <!-- UPDATED: Changed to title field (new data structure) -->
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">{{ currentQuestion.title }}</h2>
          <!-- UPDATED: Changed to question field (HTML content) - removed question_full -->
          <div class="prose prose-sm dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400" v-html="currentQuestion.question"></div>
        </div>

        <!-- Answer Section -->
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-900/50 p-6">
          <h3 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Answer</h3>
          <!-- UPDATED: Changed to access answer directly from currentQuestion (no longer separate table) -->
          <div class="prose prose-sm dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300" v-html="currentQuestion.answer"></div>
        </div>

        <!-- Related Questions Section -->
        <div v-if="relatedQuestions.length > 0 || loadingRelated" class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Related Questions</h3>

          <!-- Loading related questions -->
          <div v-if="loadingRelated" class="flex items-center justify-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          </div>

          <!-- Related questions list -->
          <div v-else class="space-y-3">
            <router-link
              v-for="related in relatedQuestions"
              :key="related.reference"
              :to="`/question/${related.reference}`"
              class="block p-4 bg-white dark:bg-neutral-800 rounded-lg hover:shadow-md dark:hover:shadow-neutral-900/50 transition-all group"
            >
              <div class="flex items-start">
                <div class="flex-1">
                  <h4 class="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                    {{ related.title }}
                  </h4>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Q#{{ related.reference }}</p>
                </div>
                <Icon name="arrowRight" size="sm" class="text-neutral-400 dark:text-neutral-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ml-2 mt-1" />
              </div>
            </router-link>
          </div>
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
import { useGamificationStore } from '@/stores/gamification'
import Icon from '@/components/common/Icon.vue'
import Button from '@/components/common/Button.vue'
import { shareQuestion } from '@/utils/sharing'
import { getRelatedQuestionsData } from '@/utils/relatedQuestions'

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()
const gamificationStore = useGamificationStore()

const currentQuestion = ref(null)
const currentAnswer = ref(null)
const loading = ref(false)
const isBookmarked = ref(false)
const relatedQuestions = ref([])
const loadingRelated = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    const questionId = route.params.id

    console.log('Loading question:', questionId)

    // UPDATED: Load question (answer is embedded in question.answer)
    const question = await dataStore.getQuestion(questionId)

    console.log('Question loaded:', question)

    currentQuestion.value = question
    // DEPRECATED: No longer need separate answer query - answer is in question.answer

    // Track question read for gamification (only unique questions count)
    // UPDATED: Use reference instead of id
    if (question) {
      gamificationStore.readQuestion(question.reference)
    }

    // Check if bookmarked
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    // UPDATED: Use reference for bookmark tracking
    isBookmarked.value = bookmarks.includes(parseInt(questionId))

    // Load related questions
    if (question && question.answer) {
      loadingRelated.value = true
      try {
        relatedQuestions.value = await getRelatedQuestionsData(
          question.answer,
          dataStore.getQuestion.bind(dataStore),
          question.reference,
          5 // Limit to 5 related questions
        )
        console.log('Related questions loaded:', relatedQuestions.value.length)
      } catch (error) {
        console.error('Error loading related questions:', error)
      } finally {
        loadingRelated.value = false
      }
    }
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
  // UPDATED: Use reference instead of id
  const questionId = currentQuestion.value.reference

  if (isBookmarked.value) {
    // Remove bookmark
    const index = bookmarks.indexOf(questionId)
    if (index > -1) {
      bookmarks.splice(index, 1)
    }
  } else {
    // Add bookmark
    bookmarks.push(questionId)
    // Track bookmark creation for gamification
    gamificationStore.createBookmark()
  }

  isBookmarked.value = !isBookmarked.value
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
  localStorage.setItem('bookmarkCount', bookmarks.length.toString())
  console.log('Bookmark toggled:', isBookmarked.value)
}

async function handleShare() {
  if (!currentQuestion.value) return

  try {
    // UPDATED: Pass only currentQuestion (answer is embedded in question.answer)
    const result = await shareQuestion(currentQuestion.value)

    if (result.success && result.platform === 'clipboard') {
      // Show a toast notification if copied to clipboard
      alert(result.message || 'Copied to clipboard!')
    }
  } catch (error) {
    console.error('Error sharing question:', error)
    if (!error.cancelled) {
      alert('Failed to share question. Please try again.')
    }
  }
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
