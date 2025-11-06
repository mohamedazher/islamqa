<template>
  <div class="bookmarks-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 hover:opacity-80 transition-opacity">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <Icon name="bookmark" size="md" />
          <h1 class="text-xl font-bold">My Bookmarks</h1>
        </div>
        <p class="text-primary-100 text-sm">{{ bookmarkedQuestions.length }} bookmarks</p>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-32">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p class="mt-4 text-neutral-600 dark:text-neutral-400">Loading bookmarks...</p>
        </div>
      </div>

      <!-- Bookmarked Questions -->
      <div v-else-if="bookmarkedQuestions.length > 0">
        <div class="mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="bookmark" size="md" class="text-primary-600 dark:text-primary-400" />
              <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Bookmarked Questions</h2>
            </div>
            <button
              @click="clearAll"
              class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="question in bookmarkedQuestions"
            :key="question.id"
            class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-4"
          >
            <div class="flex items-start justify-between">
              <div
                @click="selectQuestion(question)"
                class="flex-1 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition"
              >
                <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">{{ question.question }}</h4>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-1">{{ question.question_full }}</p>
                <span class="text-xs text-primary-600 dark:text-primary-400 font-medium">Q#{{ question.question_no }}</span>
              </div>
              <button
                @click="removeBookmark(question.id)"
                class="ml-3 hover:text-red-600 dark:hover:text-red-400 transition"
              >
                <Icon name="xCircle" size="md" class="text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="flex justify-center mb-4">
          <Icon name="bookmark" size="xl" class="text-neutral-300 dark:text-neutral-700 w-16 h-16" />
        </div>
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No bookmarks yet</h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6">Start bookmarking questions to save them for later</p>
        <button
          @click="goToBrowse"
          class="bg-primary-600 dark:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition"
        >
          Browse Questions
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import Icon from '@/components/common/Icon.vue'

const router = useRouter()
const dataStore = useDataStore()

const bookmarkIds = ref([])

const bookmarkedQuestions = ref([])
const isLoading = ref(true)

// Load bookmarks from localStorage
function loadBookmarks() {
  const stored = localStorage.getItem('bookmarks')
  if (stored) {
    bookmarkIds.value = JSON.parse(stored)
  }
}

// Load questions for bookmarks
async function loadBookmarkedQuestions() {
  try {
    isLoading.value = true
    const questions = await Promise.all(
      bookmarkIds.value.map(id => dataStore.getQuestion(id))
    )
    bookmarkedQuestions.value = questions.filter(q => q !== null && q !== undefined)
  } catch (error) {
    console.error('Error loading bookmarked questions:', error)
    bookmarkedQuestions.value = []
  } finally {
    isLoading.value = false
  }
}

// Save bookmarks to localStorage
function saveBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(bookmarkIds.value))
  localStorage.setItem('bookmarkCount', bookmarkIds.value.length.toString())
}

// Remove single bookmark
async function removeBookmark(questionId) {
  bookmarkIds.value = bookmarkIds.value.filter(id => id !== parseInt(questionId))
  saveBookmarks()
  await loadBookmarkedQuestions()
}

// Clear all bookmarks
async function clearAll() {
  if (confirm('Are you sure you want to clear all bookmarks?')) {
    bookmarkIds.value = []
    saveBookmarks()
    await loadBookmarkedQuestions()
  }
}

// Navigate to question
function selectQuestion(question) {
  router.push(`/question/${question.id}`)
}

function goBack() {
  router.back()
}

function goToBrowse() {
  router.push('/browse')
}

// Initialize
onMounted(async () => {
  loadBookmarks()
  await loadBookmarkedQuestions()

  console.log('🔖 Bookmarks view loaded with', bookmarkIds.value.length, 'bookmarks')
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
