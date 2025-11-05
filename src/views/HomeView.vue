<template>
  <div class="home-view h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-lg">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h1 class="text-2xl font-bold">BetterIslam Q&A</h1>
          <p class="text-blue-100 text-sm mt-1">Islamic knowledge at your fingertips</p>
        </div>
        <button
          @click="navigate('/search')"
          class="text-3xl hover:text-blue-100 transition"
        >
          🔍
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Import Notice (if needed) -->
      <div v-if="!dataStore.isLoaded" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 class="font-semibold text-yellow-900">📥 First Time Setup</h3>
        <p class="text-sm text-yellow-800 mt-1">Database needs to be imported. This will take a few minutes.</p>
        <button
          @click="startImport"
          class="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition"
        >
          Start Import
        </button>
      </div>

      <!-- Main Navigation Cards -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <NavCard
          title="Browse"
          icon="📚"
          description="Explore categories"
          @click="navigate('/browse')"
        />
        <NavCard
          title="Search"
          icon="🔍"
          description="Find questions"
          @click="navigate('/search')"
        />
        <NavCard
          title="My Folders"
          icon="📂"
          description="Saved questions"
          @click="navigate('/folders')"
        />
        <NavCard
          title="Quiz"
          icon="🎯"
          description="Test your knowledge"
          @click="navigate('/quiz')"
          badge="NEW"
        />
      </div>

      <!-- Gamification Stats Section -->
      <div v-if="dataStore.isLoaded" class="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow p-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-lg">🎮 Level {{ gamification.currentLevel }}</h3>
          <div class="text-3xl font-bold">{{ gamification.points }}</div>
        </div>
        <div class="bg-white/20 rounded-full h-2 mb-2">
          <div
            class="bg-white h-2 rounded-full transition-all"
            :style="{ width: ((gamification.points % 500) / 500) * 100 + '%' }"
          ></div>
        </div>
        <div class="text-xs text-purple-100">{{ gamification.pointsToNextLevel }} points to next level</div>
        <div class="text-xs text-purple-100 mt-1" v-if="gamification.streak > 0">
          🔥 {{ gamification.streak }} day streak!
        </div>
      </div>

      <!-- Regular Stats Section -->
      <div v-if="dataStore.isLoaded" class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold text-gray-900 mb-3">📊 Your Content</h3>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ dataStore.categories.length }}</div>
            <div class="text-xs text-gray-600">Categories</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ stats.bookmarks }}</div>
            <div class="text-xs text-gray-600">Bookmarks</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600">{{ gamification.stats.quizzesCompleted }}</div>
            <div class="text-xs text-gray-600">Quizzes</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useGamificationStore } from '@/stores/gamification'
import NavCard from '@/components/common/NavCard.vue'

const router = useRouter()
const dataStore = useDataStore()
const gamification = useGamificationStore()

const stats = ref({
  bookmarks: 0
})

onMounted(async () => {
  try {
    // Initialize gamification
    gamification.initializeFromStorage()

    // Load bookmarks from localStorage if data is already loaded
    if (dataStore.isLoaded) {
      stats.value.bookmarks = parseInt(localStorage.getItem('bookmarkCount') || '0')
    }
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
})

function navigate(path) {
  router.push(path)
}

async function startImport() {
  router.push('/import')
}
</script>

<style scoped>
/* Component scoped styles */
</style>
