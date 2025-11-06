<template>
  <div class="settings-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow">
      <button @click="goBack" class="hover:opacity-80 transition-opacity mb-3 lg:hidden">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex items-center gap-3">
        <Icon name="cog" size="lg" />
        <div>
          <h1 class="text-xl font-bold">Settings</h1>
          <p class="text-primary-100 text-sm">Customize your experience</p>
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
import Icon from '@/components/common/Icon.vue'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const dataStore = useDataStore()

const appName = 'BetterIslam Q&A'
const appVersion = __APP_VERSION__ // Injected by Vite from package.json
const currentYear = new Date().getFullYear()

const stats = ref({
  categories: 0,
  questions: 0,
  answers: 0
})

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
</script>
