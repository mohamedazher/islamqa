<template>
  <div class="search-view h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow">
      <button @click="goBack" class="text-2xl mb-3">←</button>
      <div class="relative">
        <input
          v-model="searchTerm"
          @input="handleSearch"
          @focus="showHistory = true"
          @blur="delayHideHistory"
          type="text"
          placeholder="Search questions..."
          class="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          autofocus
        />
        <span class="absolute right-3 top-2.5 text-gray-400">🔍</span>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Search History (when focused, no input) -->
      <div v-if="showHistory && !searchTerm && searchHistory.length > 0" class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Recent Searches</h3>
        <div class="space-y-2">
          <button
            v-for="(historyItem, idx) in searchHistory"
            :key="idx"
            @click="selectHistory(historyItem)"
            class="w-full text-left bg-white rounded-lg shadow p-3 hover:bg-blue-50 transition"
          >
            <span class="text-gray-700">{{ historyItem }}</span>
            <span class="float-right text-gray-400 text-sm">→</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isSearching" class="flex items-center justify-center h-32">
        <div class="text-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p class="text-gray-600">Searching...</p>
        </div>
      </div>

      <!-- Search Results -->
      <div v-else-if="results.length > 0">
        <div class="mb-3">
          <p class="text-sm text-gray-600">
            Found <span class="font-semibold text-blue-600">{{ results.length }}</span> result{{ results.length !== 1 ? 's' : '' }}
          </p>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <QuestionListItem
            v-for="question in results"
            :key="question.id"
            :question="question"
            @click="selectQuestion(question)"
          />
        </div>
      </div>

      <!-- Empty Search State -->
      <div v-else-if="searchTerm && !isSearching" class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
        <p class="text-gray-600 mb-4">Try different keywords or check your spelling</p>
        <p class="text-sm text-gray-500">Fuzzy search enabled: "profet" will find "prophet"</p>
      </div>

      <!-- Initial State -->
      <div v-else-if="!searchTerm && !showHistory" class="text-center py-12">
        <div class="text-6xl mb-4">🔎</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Start searching</h3>
        <p class="text-gray-600">Find questions by keyword or topic</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import SearchService from '@/services/searchService'
import QuestionListItem from '@/components/browse/QuestionListItem.vue'

const router = useRouter()
const dataStore = useDataStore()

const searchTerm = ref('')
const results = ref([])
const isSearching = ref(false)
const showHistory = ref(false)
const searchHistory = ref([])
const searchService = ref(null)

// Load search history from localStorage
function loadSearchHistory() {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history).slice(0, 5) // Keep last 5 searches
  }
}

// Save to search history
function saveToHistory(term) {
  if (!term || term.trim().length === 0) return

  const trimmedTerm = term.trim()
  // Remove duplicates (move to front)
  searchHistory.value = searchHistory.value.filter(h => h !== trimmedTerm)
  searchHistory.value.unshift(trimmedTerm)
  // Keep only last 5
  searchHistory.value = searchHistory.value.slice(0, 5)

  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// Handle search input with debouncing
const handleSearch = (() => {
  let timeout
  return () => {
    clearTimeout(timeout)
    if (searchTerm.value.trim().length === 0) {
      results.value = []
      return
    }

    isSearching.value = true
    timeout = setTimeout(() => {
      if (searchService.value) {
        results.value = searchService.value.search(searchTerm.value)
      }
      isSearching.value = false
    }, 300) // 300ms debounce
  }
})()

// Select from history
function selectHistory(term) {
  searchTerm.value = term
  handleSearch()
}

// Navigate to question
function selectQuestion(question) {
  saveToHistory(searchTerm.value)
  router.push(`/question/${question.id}`)
}

// Hide history with delay (for click handling)
function delayHideHistory() {
  setTimeout(() => {
    if (searchTerm.value.trim().length > 0) {
      showHistory.value = false
    }
  }, 100)
}

function goBack() {
  router.back()
}

// Initialize
onMounted(async () => {
  loadSearchHistory()

  // Wait for data to load if needed
  if (!dataStore.isLoaded) {
    await dataStore.loadData()
  }

  // Initialize search service with questions
  searchService.value = new SearchService(dataStore.questions)

  console.log('🔍 Search service initialized with', dataStore.questions.length, 'questions')
})
</script>
