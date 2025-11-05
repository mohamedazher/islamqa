<template>
  <div class="folders-view h-full flex flex-col bg-gray-50">
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 text-2xl">←</button>
      <div class="flex-1">
        <h1 class="text-xl font-bold">My Folders</h1>
        <p class="text-blue-100 text-sm">{{ bookmarkedQuestions.length }} bookmarks</p>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading State -->
      <div v-if="dataStore.isLoading" class="flex items-center justify-center h-32">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading bookmarks...</p>
        </div>
      </div>

      <!-- Bookmarked Questions -->
      <div v-else-if="bookmarkedQuestions.length > 0">
        <div class="mb-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">🔖 Bookmarked Questions</h2>
            <button
              @click="clearAll"
              class="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="question in bookmarkedQuestions"
            :key="question.id"
            class="bg-white rounded-lg shadow p-4"
          >
            <div class="flex items-start justify-between">
              <div
                @click="selectQuestion(question)"
                class="flex-1 cursor-pointer hover:text-blue-600 transition"
              >
                <h4 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ question.question }}</h4>
                <p class="text-sm text-gray-600 mb-2 line-clamp-1">{{ question.question_full }}</p>
                <span class="text-xs text-blue-600 font-medium">Q#{{ question.question_no }}</span>
              </div>
              <button
                @click="removeBookmark(question.id)"
                class="ml-3 text-xl hover:text-red-600 transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
        <p class="text-gray-600 mb-6">Start bookmarking questions to save them for later</p>
        <button
          @click="goToBrowse"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
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

const router = useRouter()
const dataStore = useDataStore()

const bookmarkIds = ref([])

const bookmarkedQuestions = computed(() => {
  return bookmarkIds.value
    .map(id => dataStore.getQuestion(id))
    .filter(q => q !== undefined)
})

// Load bookmarks from localStorage
function loadBookmarks() {
  const stored = localStorage.getItem('bookmarks')
  if (stored) {
    bookmarkIds.value = JSON.parse(stored)
  }
}

// Save bookmarks to localStorage
function saveBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(bookmarkIds.value))
  localStorage.setItem('bookmarkCount', bookmarkIds.value.length.toString())
}

// Remove single bookmark
function removeBookmark(questionId) {
  bookmarkIds.value = bookmarkIds.value.filter(id => id !== parseInt(questionId))
  saveBookmarks()
}

// Clear all bookmarks
function clearAll() {
  if (confirm('Are you sure you want to clear all bookmarks?')) {
    bookmarkIds.value = []
    saveBookmarks()
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

  // Wait for data to load if needed
  if (!dataStore.isLoaded) {
    await dataStore.loadData()
  }

  console.log('📂 Folders view loaded with', bookmarkIds.value.length, 'bookmarks')
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
