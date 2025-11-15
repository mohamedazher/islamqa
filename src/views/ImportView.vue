<template>
  <div class="import-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-3 sm:p-4 shadow flex items-center gap-3">
      <Icon name="download" size="md" />
      <div class="flex-1 min-w-0">
        <h1 class="text-base sm:text-lg font-bold">Database Setup</h1>
        <p class="text-primary-100 dark:text-primary-200 text-xs md:text-sm truncate">Importing Islamic Q&A data</p>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 flex flex-col items-center justify-center p-6">
      <div class="max-w-md w-full bg-white dark:bg-neutral-900 rounded-lg shadow-lg dark:shadow-neutral-800/50 p-8">
        <!-- Icon -->
        <div class="flex justify-center mb-6">
          <Icon
            v-if="!isImporting"
            name="book"
            size="xl"
            class="w-16 h-16 text-primary-600 dark:text-primary-400"
          />
          <Icon
            v-else
            name="download"
            size="xl"
            class="w-16 h-16 text-primary-600 dark:text-primary-400 animate-pulse"
          />
        </div>

        <!-- Status -->
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-2">
          {{ isImporting ? 'Importing...' : 'Ready to Import' }}
        </h2>

        <!-- Current Step -->
        <p v-if="isImporting" class="text-center text-neutral-600 dark:text-neutral-400 mb-6">
          {{ currentStep }}
        </p>

        <p v-else class="text-center text-neutral-600 dark:text-neutral-400 mb-6">
          This will import 8000+ Islamic Q&A items into your device. This takes a few minutes.
        </p>

        <!-- Progress Bar -->
        <div v-if="isImporting" class="mb-6">
          <div class="bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
            <div
              class="bg-primary-600 dark:bg-primary-500 h-full transition-all duration-300"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
          <p class="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-2">{{ Math.round(progress) }}%</p>
        </div>

        <!-- Data Info -->
        <div v-if="!isImporting" class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-4 mb-6 text-sm text-neutral-700 dark:text-neutral-300">
          <div class="flex items-center gap-2 mb-2">
            <Icon name="book" size="sm" class="text-primary-600 dark:text-primary-400" />
            <p><strong>8000+</strong> Islamic Q&A items</p>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <Icon name="collection" size="sm" class="text-primary-600 dark:text-primary-400" />
            <p><strong>269</strong> Categories</p>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="download" size="sm" class="text-primary-600 dark:text-primary-400" />
            <p><strong>~50MB</strong> database (offline)</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="xCircle" size="sm" class="text-red-600 dark:text-red-400" />
            <p class="text-red-800 dark:text-red-200 text-sm font-semibold">Import Error</p>
          </div>
          <p class="text-red-700 dark:text-red-300 text-sm mt-1">{{ error }}</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            v-if="!isImporting"
            @click="goBack"
            class="flex-1 bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-4 py-3 rounded-lg font-medium hover:bg-neutral-400 dark:hover:bg-neutral-600 transition disabled:opacity-50"
            :disabled="isImporting"
          >
            Back
          </button>

          <button
            v-if="!isImporting"
            @click="startImport"
            class="flex-1 bg-primary-600 dark:bg-primary-700 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition disabled:opacity-50"
            :disabled="isImporting"
          >
            Start Import
          </button>

          <button
            v-else-if="progress === 100"
            @click="goHome"
            class="flex-1 bg-accent-600 dark:bg-accent-700 text-white px-4 py-3 rounded-lg font-medium hover:bg-accent-700 dark:hover:bg-accent-600 transition"
          >
            Done!
          </button>
        </div>

        <!-- Details -->
        <p v-if="isImporting" class="text-center text-xs text-neutral-500 dark:text-neutral-500 mt-6">
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
import dataLoader from '@/services/dataLoader'
import Icon from '@/components/common/Icon.vue'

const router = useRouter()
const dataStore = useDataStore()

const isImporting = ref(false)
const progress = ref(0)
const currentStep = ref('')
const error = ref('')

onMounted(async () => {
  // Check if data is already imported
  const isImported = await dataLoader.isDataImported()
  if (isImported) {
    console.log('✅ Data already imported, redirecting to home...')
    router.push('/')
  }
})

async function startImport() {
  isImporting.value = true
  error.value = ''
  progress.value = 0

  try {
    console.log('📥 Starting data import...')

    // Import data with progress tracking
    await dataLoader.loadAndImport((progressInfo) => {
      currentStep.value = progressInfo.step
      progress.value = progressInfo.progress
    })

    progress.value = 100
    currentStep.value = 'Import complete!'
    console.log('✅ Import finished')

    // Initialize data store after import
    await dataStore.initialize()
    console.log('✅ Data store initialized')

    // Wait a moment before redirecting
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (err) {
    console.error('❌ Import failed:', err)
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
