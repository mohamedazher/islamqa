<template>
  <div class="import-view h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
      <h1 class="text-2xl font-bold">Database Setup</h1>
      <p class="text-blue-100 text-sm mt-1">Importing Islamic Q&A data</p>
    </header>

    <!-- Content -->
    <div class="flex-1 flex flex-col items-center justify-center p-6">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <!-- Icon -->
        <div class="text-6xl text-center mb-6">
          <span v-if="!isImporting">📚</span>
          <span v-else class="inline-block animate-spin">⚙️</span>
        </div>

        <!-- Status -->
        <h2 class="text-2xl font-bold text-gray-900 text-center mb-2">
          {{ isImporting ? 'Importing...' : 'Ready to Import' }}
        </h2>

        <!-- Current Step -->
        <p v-if="isImporting" class="text-center text-gray-600 mb-6">
          {{ currentStep }}
        </p>

        <p v-else class="text-center text-gray-600 mb-6">
          This will import 8000+ Islamic Q&A items into your device. This takes a few minutes.
        </p>

        <!-- Progress Bar -->
        <div v-if="isImporting" class="mb-6">
          <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              class="bg-blue-600 h-full transition-all duration-300"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
          <p class="text-center text-sm text-gray-600 mt-2">{{ Math.round(progress) }}%</p>
        </div>

        <!-- Data Info -->
        <div v-if="!isImporting" class="bg-blue-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
          <p class="mb-2">📖 <strong>8000+</strong> Islamic Q&A items</p>
          <p class="mb-2">📁 <strong>269</strong> Categories</p>
          <p>💾 <strong>~50MB</strong> database (offline)</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-800 text-sm font-semibold">⚠️ Import Error</p>
          <p class="text-red-700 text-sm mt-1">{{ error }}</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            v-if="!isImporting"
            @click="goBack"
            class="flex-1 bg-gray-300 text-gray-900 px-4 py-3 rounded-lg font-medium hover:bg-gray-400 transition disabled:opacity-50"
            :disabled="isImporting"
          >
            Back
          </button>

          <button
            v-if="!isImporting"
            @click="startImport"
            class="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            :disabled="isImporting"
          >
            Start Import
          </button>

          <button
            v-else-if="progress === 100"
            @click="goHome"
            class="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Done!
          </button>
        </div>

        <!-- Details -->
        <p v-if="isImporting" class="text-center text-xs text-gray-500 mt-6">
          Do not close or refresh the app during import
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import db from '@/services/database'

const router = useRouter()
const dataStore = useDataStore()

const isImporting = ref(false)
const progress = ref(0)
const currentStep = ref('')
const error = ref('')

onMounted(async () => {
  // Ensure database is initialized
  await db.initialize()
})

async function startImport() {
  isImporting.value = true
  error.value = ''
  progress.value = 0

  try {
    // Simulate import progress
    const steps = [
      { step: 'Loading categories...', progress: 10 },
      { step: 'Loading questions part 1...', progress: 20 },
      { step: 'Loading questions part 2...', progress: 30 },
      { step: 'Loading questions part 3...', progress: 40 },
      { step: 'Loading questions part 4...', progress: 50 },
      { step: 'Loading answers part 1...', progress: 60 },
      { step: 'Loading answers part 2...', progress: 70 },
      { step: 'Loading answers part 3...', progress: 80 },
      { step: 'Loading answers part 4...', progress: 90 },
      { step: 'Finalizing...', progress: 95 }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 200))
      currentStep.value = step.step
      progress.value = step.progress
    }

    // Actually load the data
    console.log('📥 Starting data load...')
    await dataStore.loadData()

    progress.value = 100
    currentStep.value = 'Import complete!'
    console.log('✅ Import finished')
  } catch (err) {
    console.error('Import failed:', err)
    error.value = err.message || 'Import failed. Please try again.'
    isImporting.value = false
  }
}

function goBack() {
  router.back()
}

function goHome() {
  router.push('/')
}
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
