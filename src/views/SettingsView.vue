<template>
  <div class="settings-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 hover:opacity-80 transition-opacity lg:hidden">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <Icon name="cog" size="lg" class="flex-shrink-0" />
        <div class="min-w-0">
          <h1 class="text-lg md:text-xl font-bold truncate">Settings</h1>
          <p class="text-primary-100 dark:text-primary-200 text-xs md:text-sm truncate">Customize your experience</p>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4 space-y-4">
      <!-- Appearance Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="sun" size="md" class="text-primary-600 dark:text-primary-400" />
            Appearance
          </h2>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-neutral-900 dark:text-neutral-100">Theme</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                {{ isDark ? 'Dark mode' : 'Light mode' }} enabled
              </p>
            </div>
            <button
              @click="toggleTheme"
              class="relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
              :class="isDark ? 'bg-primary-600 dark:bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-700'"
            >
              <span
                class="inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform"
                :class="isDark ? 'translate-x-8' : 'translate-x-1'"
              >
                <Icon :name="isDark ? 'moon' : 'sun'" size="sm" class="text-neutral-700" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="document" size="md" class="text-primary-600 dark:text-primary-400" />
            About
          </h2>
        </div>
        <div class="p-4 space-y-4">
          <!-- App Logo/Icon -->
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              ☪
            </div>
            <div>
              <h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">{{ appName }}</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Version {{ appVersion }}</p>
            </div>
          </div>

          <p class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Access authentic Islamic Q&A content offline. Browse 8000+ questions and answers across 269 categories, all sourced from IslamQA.info.
          </p>

          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-3 pt-2">
            <div class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ stats.questions > 0 ? stats.questions : '8000+' }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Questions</div>
            </div>
            <div class="bg-accent-50 dark:bg-accent-950/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-accent-600 dark:text-accent-400">{{ stats.categories > 0 ? stats.categories : '269' }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Categories</div>
            </div>
            <div class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">100%</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Offline</div>
            </div>
          </div>

          <!-- Share App Button -->
          <button
            @click="handleShareApp"
            class="w-full mt-4 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-700 dark:to-accent-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-accent-700 dark:hover:from-primary-600 dark:hover:to-accent-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Icon name="share" size="md" />
            Share App with Friends
          </button>
        </div>
      </section>

      <!-- Links Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="link" size="md" class="text-primary-600 dark:text-primary-400" />
            Links
          </h2>
        </div>
        <div class="divide-y divide-neutral-200 dark:divide-neutral-800">
          <a
            href="https://islamqa.info"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <Icon name="globe" size="md" class="text-neutral-600 dark:text-neutral-400" />
              <div>
                <div class="font-medium text-neutral-900 dark:text-neutral-100">IslamQA.info</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400">Original source</div>
              </div>
            </div>
            <Icon name="chevronRight" size="sm" class="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
          </a>

          <a
            href="https://github.com/mohamedazher/islamqa"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <Icon name="code" size="md" class="text-neutral-600 dark:text-neutral-400" />
              <div>
                <div class="font-medium text-neutral-900 dark:text-neutral-100">Source Code</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400">View on GitHub</div>
              </div>
            </div>
            <Icon name="chevronRight" size="sm" class="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
          </a>

          <a
            href="https://github.com/mohamedazher/islamqa/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <Icon name="exclamation" size="md" class="text-neutral-600 dark:text-neutral-400" />
              <div>
                <div class="font-medium text-neutral-900 dark:text-neutral-100">Report Issue</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400">Bug reports & feedback</div>
              </div>
            </div>
            <Icon name="chevronRight" size="sm" class="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
          </a>
        </div>
      </section>

      <!-- Privacy Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="shield" size="md" class="text-primary-600 dark:text-primary-400" />
            Privacy & Data
          </h2>
        </div>
        <div class="p-4 space-y-4">
          <!-- Analytics Toggle -->
          <div class="flex items-start justify-between">
            <div class="flex-1 pr-4">
              <h3 class="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                Analytics
                <span v-if="!analyticsEnabled" class="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded">Disabled</span>
              </h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                Help improve the app by sharing anonymous usage data. No personal information is collected.
              </p>
            </div>
            <button
              @click="toggleAnalytics"
              class="relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 flex-shrink-0"
              :class="analyticsEnabled ? 'bg-primary-600 dark:bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-700'"
            >
              <span
                class="inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform"
                :class="analyticsEnabled ? 'translate-x-8' : 'translate-x-1'"
              >
                <Icon :name="analyticsEnabled ? 'check' : 'close'" size="sm" class="text-neutral-700" />
              </span>
            </button>
          </div>

          <!-- Privacy Info Link -->
          <button
            @click="showPrivacyInfo"
            class="w-full flex items-center justify-between px-4 py-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/50 transition-colors group"
          >
            <div class="flex items-center gap-3 text-left">
              <Icon name="document" size="md" class="text-primary-600 dark:text-primary-400" />
              <div>
                <div class="font-medium text-primary-900 dark:text-primary-100">Privacy Information</div>
                <div class="text-xs text-primary-700 dark:text-primary-300">What data we collect and why</div>
              </div>
            </div>
            <Icon name="chevronRight" size="sm" class="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <!-- Current Status -->
          <div class="bg-neutral-50 dark:bg-neutral-950/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800">
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong class="text-neutral-900 dark:text-neutral-100">Status:</strong>
              Analytics collection is currently <strong>{{ analyticsEnabled ? 'enabled' : 'disabled' }}</strong>.
              {{ analyticsEnabled
                ? 'Anonymous usage data is being collected to improve the app.'
                : 'No analytics data is being collected.' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Data Management Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="database" size="md" class="text-primary-600 dark:text-primary-400" />
            Data Management
          </h2>
        </div>
        <div class="p-4">
          <div class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex items-start gap-3 mb-3">
              <Icon name="exclamation" size="md" class="text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 class="font-semibold text-red-900 dark:text-red-100 mb-1">Clear All Data</h3>
                <p class="text-sm text-red-800 dark:text-red-300 mb-3">
                  This will delete all imported questions, answers, categories, and your bookmarks. You'll need to re-import the data to use the app.
                </p>
                <button
                  @click="confirmClearData"
                  :disabled="isClearing"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isClearing ? 'Clearing...' : 'Clear All Data' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Legal Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="shield" size="md" class="text-primary-600 dark:text-primary-400" />
            Legal
          </h2>
        </div>
        <div class="p-4 space-y-3">
          <div>
            <h3 class="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Content Source</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              All Islamic content is sourced from <a href="https://islamqa.info" target="_blank" class="text-primary-600 dark:text-primary-400 hover:underline">IslamQA.info</a> and is used with respect to their terms of use.
            </p>
          </div>
          <div>
            <h3 class="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Disclaimer</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              This is an unofficial app created to provide offline access to Islamic Q&A content. For the most up-to-date content, please visit the official website.
            </p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <div class="text-center py-6">
        <p class="text-sm text-neutral-500 dark:text-neutral-500">
          Made with ❤️ for the Muslim community
        </p>
        <p class="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
          © {{ currentYear }} IslamQA App
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useDataStore } from '@/stores/data'
import dexieDb from '@/services/dexieDatabase'
import Icon from '@/components/common/Icon.vue'
import { shareApp } from '@/utils/sharing'
import { usePrivacyConsent } from '@/services/privacyConsent'
import { useAnalytics } from '@/services/analytics'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const dataStore = useDataStore()
const { isAnalyticsEnabled, updateConsent } = usePrivacyConsent()
const { setEnabled } = useAnalytics()

const appName = 'BetterIslam Q&A'
const appVersion = __APP_VERSION__ // Injected by Vite from package.json
const currentYear = new Date().getFullYear()

const stats = ref({
  categories: 0,
  questions: 0,
  answers: 0
})

const isClearing = ref(false)
const analyticsEnabled = ref(isAnalyticsEnabled)

onMounted(async () => {
  try {
    if (dataStore.isReady) {
      stats.value = await dataStore.getStats()
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
})

function goBack() {
  router.back()
}

async function handleShareApp() {
  try {
    const result = await shareApp()

    if (result.success && result.platform === 'clipboard') {
      alert(result.message || 'App link copied to clipboard!')
    }
  } catch (error) {
    console.error('Error sharing app:', error)
    if (!error.cancelled) {
      alert('Failed to share app. Please try again.')
    }
  }
}

function toggleAnalytics() {
  analyticsEnabled.value = !analyticsEnabled.value
  updateConsent('analytics', analyticsEnabled.value)
  setEnabled(analyticsEnabled.value)

  console.log('[Settings] Analytics', analyticsEnabled.value ? 'enabled' : 'disabled')
}

function showPrivacyInfo() {
  router.push('/privacy')
}

async function confirmClearData() {
  const confirmed = confirm(
    'Are you sure you want to clear all data?\n\n' +
    'This will delete:\n' +
    '• All imported questions and answers\n' +
    '• All categories\n' +
    '• All bookmarks and folders\n\n' +
    'You will need to re-import the data to use the app again.'
  )

  if (!confirmed) return

  try {
    isClearing.value = true
    console.log('🗑️  Clearing all data...')

    // Clear the database
    await dexieDb.clearAllData()

    // Clear local storage items
    localStorage.removeItem('bookmarks')
    localStorage.removeItem('bookmarkedQuestions')
    localStorage.removeItem('bookmarkCount')

    // Reset data store state
    dataStore.isReady = false

    console.log('✅ All data cleared')

    alert('All data has been cleared successfully. Redirecting to import page...')

    // Redirect to import page
    router.push('/import')
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    alert('Failed to clear data. Please try again.')
  } finally {
    isClearing.value = false
  }
}
</script>
