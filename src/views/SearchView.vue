<template>
  <div class="search-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow">
      <button @click="goBack" class="text-2xl mb-3 hover:opacity-80 transition-opacity">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="relative">
        <input
          v-model="searchTerm"
          @input="handleSearch"
          @focus="showHistory = true"
          @blur="delayHideHistory"
          type="text"
          placeholder="Search questions..."
          class="w-full px-4 py-2 pl-10 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-600"
          autofocus
        />
        <span class="absolute left-3 top-2.5 text-neutral-400 dark:text-neutral-500">
          <Icon name="search" size="md" />
        </span>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Search History (when focused, no input) -->
      <div v-if="showHistory && !searchTerm && searchHistory.length > 0" class="mb-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Recent Searches</h3>
        <div class="space-y-2">
          <button
            v-for="(historyItem, idx) in searchHistory"
            :key="idx"
            @click="selectHistory(historyItem)"
            class="w-full text-left bg-white dark:bg-neutral-800 rounded-lg shadow p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
          >
            <span class="text-neutral-700 dark:text-neutral-300">{{ historyItem }}</span>
            <span class="float-right text-neutral-400 dark:text-neutral-500 text-sm">
              <Icon name="chevronRight" size="sm" />
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isSearching" class="flex items-center justify-center h-32">
        <div class="text-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-3"></div>
          <p class="text-neutral-600 dark:text-neutral-400">Searching...</p>
        </div>
      </div>

      <!-- Search Results -->
      <div v-else-if="results.length > 0">
        <div class="mb-3">
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Found <span class="font-semibold text-primary-600 dark:text-primary-400">{{ results.length }}</span> result{{ results.length !== 1 ? 's' : '' }}
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
        <div class="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="search" size="xl" class="text-neutral-400 dark:text-neutral-600" />
        </div>
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No results found</h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-4">Try different keywords or check your spelling</p>
        <p class="text-sm text-neutral-500 dark:text-neutral-500">Fuzzy search enabled: "profet" will find "prophet"</p>
      </div>

      <!-- Initial State -->
      <div v-else-if="!searchTerm && !showHistory" class="text-center py-12">
        <div class="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="search" size="xl" class="text-neutral-400 dark:text-neutral-600" />
        </div>
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Start searching</h3>
        <p class="text-neutral-600 dark:text-neutral-400">Find questions by keyword or topic</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import SearchService from '@/services/searchService'
import Icon from '@/components/common/Icon.vue'
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
