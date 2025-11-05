<template>
  <div class="home-view h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
      <h1 class="text-2xl font-bold">BetterIslam Q&A</h1>
      <p class="text-blue-100 text-sm mt-1">Islamic knowledge at your fingertips</p>
    </header>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Import Notice (if needed) -->
      <div v-if="questionsStore.needsImport" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
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

      <!-- Stats Section -->
      <div v-if="!questionsStore.needsImport" class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold text-gray-900 mb-3">📊 Your Stats</h3>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.categories }}</div>
            <div class="text-xs text-gray-600">Categories</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ stats.bookmarks }}</div>
            <div class="text-xs text-gray-600">Bookmarks</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600">{{ stats.questionsRead }}</div>
            <div class="text-xs text-gray-600">Read</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionsStore } from '@/stores/questions'

const router = useRouter()
const questionsStore = useQuestionsStore()

const stats = ref({
  categories: 0,
  bookmarks: 0,
  questionsRead: 0
})

onMounted(async () => {
  try {
    await questionsStore.initialize()

    if (!questionsStore.needsImport) {
      // Load stats
      stats.value.categories = questionsStore.categories.length
      // TODO: Load actual bookmarks and read counts from localStorage
      stats.value.bookmarks = parseInt(localStorage.getItem('bookmarkCount') || '0')
      stats.value.questionsRead = parseInt(localStorage.getItem('questionsRead') || '0')
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
