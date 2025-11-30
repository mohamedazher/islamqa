<template>
  <div class="saved-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-3 sm:p-4 shadow flex items-center">
      <button @click="goBack" class="mr-2 sm:mr-3 hover:opacity-80 transition-opacity">
        <Icon name="arrowLeft" size="sm" />
      </button>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <Icon name="bookmark" size="md" />
          <h1 class="text-base sm:text-lg font-bold">Saved Items</h1>
        </div>
        <p class="text-primary-100 text-sm">{{ totalCount }} items saved</p>
      </div>
    </header>

    <!-- Tab Toggle -->
    <div class="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-3 flex gap-2">
      <button
        @click="activeTab = 'questions'"
        class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
        :class="activeTab === 'questions'
          ? 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'"
      >
        <Icon name="book" size="sm" />
        Questions ({{ bookmarkedQuestions.length }})
      </button>
      <button
        @click="activeTab = 'duas'"
        class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
        :class="activeTab === 'duas'
          ? 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'"
      >
        <Icon name="heart" size="sm" />
        Duas ({{ duaFavorites.length }})
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-32">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p class="mt-4 text-neutral-600 dark:text-neutral-400">Loading saved items...</p>
        </div>
      </div>

      <!-- Questions Tab -->
      <div v-else-if="activeTab === 'questions'">
        <div v-if="bookmarkedQuestions.length > 0">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="bookmark" size="md" class="text-primary-600 dark:text-primary-400" />
              <h2 class="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">Bookmarked Questions</h2>
            </div>
            <button
              @click="clearAllQuestions"
              class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              Clear all
            </button>
          </div>
          <div class="grid grid-cols-1 gap-3">
            <div
              v-for="question in bookmarkedQuestions"
              :key="question.reference"
              class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-4"
            >
              <div class="flex items-start justify-between">
                <div
                  @click="selectQuestion(question)"
                  class="flex-1 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">{{ question.title }}</h4>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-1">{{ question.title }}</p>
                  <span class="text-xs text-primary-600 dark:text-primary-400 font-medium">Q#{{ question.reference }}</span>
                </div>
                <button
                  @click="removeBookmark(question.reference)"
                  class="ml-3 hover:text-red-600 dark:hover:text-red-400 transition"
                >
                  <Icon name="xCircle" size="md" class="text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <div class="flex justify-center mb-4">
            <Icon name="bookmark" size="xl" class="text-neutral-300 dark:text-neutral-700 w-16 h-16" />
          </div>
          <h3 class="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No bookmarks yet</h3>
          <p class="text-neutral-600 dark:text-neutral-400 mb-6">Start bookmarking questions to save them for later</p>
          <button
            @click="goToBrowse"
            class="bg-primary-600 dark:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition"
          >
            Browse Questions
          </button>
        </div>
      </div>

      <!-- Duas Tab -->
      <div v-else-if="activeTab === 'duas'">
        <div v-if="duaFavorites.length > 0" class="space-y-3">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="heart" size="md" class="text-rose-600 dark:text-rose-400" />
              <h2 class="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">Favorite Duas</h2>
            </div>
            <button
              @click="clearAllDuas"
              class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              Clear all
            </button>
          </div>
          <div
            v-for="(fav, index) in duaFavorites"
            :key="fav.id"
            @click="openDuaCategory(fav)"
            class="relative p-4 rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-white dark:bg-neutral-900 hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer"
          >
            <!-- Number Badge -->
            <div class="absolute -top-3 -left-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow">
              {{ index + 1 }}
            </div>

            <!-- Content -->
            <div class="pl-2">
              <!-- Title -->
              <h3 class="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-2">
                {{ fav.title }}
              </h3>

              <!-- Arabic -->
              <div class="mb-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded text-right">
                <p class="text-neutral-700 dark:text-neutral-300 text-sm line-clamp-2 leading-relaxed" dir="rtl">
                  {{ fav.arabic }}
                </p>
              </div>

              <!-- Category & Remove -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-neutral-500 dark:text-neutral-400">
                  From: <span class="font-semibold">{{ fav.category_title }}</span>
                </span>
                <button
                  @click.stop="removeDuaFavorite(fav.id)"
                  class="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  <Icon name="heartFilled" size="sm" class="text-rose-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <Icon name="heart" size="xl" class="text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <p class="text-neutral-500 dark:text-neutral-400 mb-4">No favorite duas yet</p>
          <button
            @click="$router.push('/dua')"
            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition"
          >
            Browse Duas
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
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'

const router = useRouter()
const dataStore = useDataStore()
const duaStore = useDuaStore()

// Tab state
const activeTab = ref('questions')

// Questions/Bookmarks
const bookmarkIds = ref([])
const bookmarkedQuestions = ref([])

// Duas/Favorites
const duaFavorites = ref([])

const isLoading = ref(true)

// Computed total count
const totalCount = computed(() => bookmarkedQuestions.value.length + duaFavorites.value.length)

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
    const questions = await Promise.all(
      bookmarkIds.value.map(id => dataStore.getQuestion(id))
    )
    bookmarkedQuestions.value = questions.filter(q => q !== null && q !== undefined)
  } catch (error) {
    console.error('Error loading bookmarked questions:', error)
    bookmarkedQuestions.value = []
  }
}

// Load dua favorites
async function loadDuaFavorites() {
  try {
    await duaStore.loadFavorites()
    duaFavorites.value = duaStore.favorites
  } catch (error) {
    console.error('Error loading dua favorites:', error)
    duaFavorites.value = []
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

// Clear all question bookmarks
async function clearAllQuestions() {
  if (confirm('Are you sure you want to clear all bookmarked questions?')) {
    bookmarkIds.value = []
    saveBookmarks()
    await loadBookmarkedQuestions()
  }
}

// Remove dua favorite
async function removeDuaFavorite(duaId) {
  await duaStore.toggleFavorite(duaId)
  await loadDuaFavorites()
}

// Clear all dua favorites
async function clearAllDuas() {
  if (confirm('Are you sure you want to clear all favorite duas?')) {
    for (const fav of duaFavorites.value) {
      await duaStore.toggleFavorite(fav.id)
    }
    await loadDuaFavorites()
  }
}

// Navigate to question
function selectQuestion(question) {
  router.push(`/question/${question.reference}`)
}

// Navigate to dua category
function openDuaCategory(fav) {
  router.push(`/dua/category/${fav.category_id}`)
}

function goBack() {
  router.back()
}

function goToBrowse() {
  router.push('/browse')
}

// Initialize
onMounted(async () => {
  try {
    isLoading.value = true
    loadBookmarks()
    await loadBookmarkedQuestions()
    await loadDuaFavorites()
    console.log('✅ Saved items view loaded:', bookmarkedQuestions.value.length, 'questions,', duaFavorites.value.length, 'duas')
  } catch (error) {
    console.error('Error loading saved items:', error)
  } finally {
    isLoading.value = false
  }
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
