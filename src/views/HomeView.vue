<template>
  <div class="home-view min-h-screen">
    <!-- Hero Section - Desktop only -->
    <div class="hidden lg:block bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-700 dark:via-primary-800 dark:to-primary-900 text-white">
      <div class="max-w-7xl mx-auto px-6 xl:px-8 py-12">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl xl:text-5xl font-bold mb-3">As-salamu alaykum</h1>
            <p class="text-xl text-primary-100 dark:text-primary-200">Explore authentic Islamic knowledge from trusted sources</p>
          </div>
          <div class="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-6 min-w-[200px]">
            <div class="text-center">
              <div class="text-sm text-primary-100 dark:text-primary-200 mb-1">Your Level</div>
              <div class="text-4xl font-bold mb-2">{{ gamification.currentLevel }}</div>
              <div class="text-xs text-primary-100 dark:text-primary-200">{{ gamification.points }} points</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 py-6 lg:py-8">
      <!-- Mobile Header -->
      <div class="lg:hidden mb-6">
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">Welcome back</h2>
        <p class="text-neutral-600 dark:text-neutral-400">Continue your Islamic learning journey</p>
      </div>

      <!-- Import Banner -->
      <div v-if="!dataStore.isReady" class="mb-6 animate-slide-up">
        <Card padding="md" class="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/30">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-amber-100 dark:bg-amber-800/30 rounded-lg flex items-center justify-center">
              <Icon name="download" size="lg" class="text-amber-700 dark:text-amber-400" />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-amber-900 dark:text-amber-100 mb-1">Welcome! Let's Get Started</h3>
              <p class="text-sm text-amber-800 dark:text-amber-300 mb-3">
                Import the Islamic Q&A database to access thousands of answers from authentic sources.
              </p>
              <Button variant="primary" size="md" @click="startImport">
                <template #icon>
                  <Icon name="download" size="md" />
                </template>
                Start Import
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Quick Actions Grid -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 px-1">Quick Access</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card
            v-for="action in quickActions"
            :key="action.name"
            clickable
            padding="md"
            @click="navigate(action.to)"
            class="group relative overflow-hidden"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-neutral-50 dark:to-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 lg:w-12 lg:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon :name="action.icon" size="lg" class="text-primary-700 dark:text-primary-400" />
                </div>
                <span
                  v-if="action.badge"
                  class="px-2 py-0.5 text-2xs font-bold rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 animate-pulse"
                >
                  {{ action.badge }}
                </span>
              </div>
              <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{{ action.name }}</h4>
              <p class="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">{{ action.description }}</p>
            </div>
          </Card>
        </div>
      </div>

      <!-- Stats & Progress Section -->
      <div v-if="dataStore.isReady" class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <!-- Gamification Progress Card -->
        <Card padding="lg" class="lg:col-span-2 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-900/20 dark:via-neutral-900 dark:to-accent-900/20">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Your Progress</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Keep learning to level up!</p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ gamification.currentLevel }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400">Level</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ gamification.points }} points</span>
              <span class="text-neutral-600 dark:text-neutral-400">{{ gamification.pointsToNextLevel }} to next level</span>
            </div>
            <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
              <div
                class="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 h-3 rounded-full transition-all duration-700 ease-out"
                :style="{ width: gamification.levelProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Streak -->
          <div v-if="gamification.streak > 0" class="flex items-center gap-2 text-sm">
            <Icon name="fire" size="lg" class="text-orange-500 dark:text-orange-400" />
            <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ gamification.streak }} day streak!</span>
            <span class="text-neutral-600 dark:text-neutral-400">Keep it up!</span>
          </div>
        </Card>

        <!-- Tier Card -->
        <Card padding="lg" v-if="gamification.currentTier">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Your Tier</h3>
            <span class="text-3xl">{{ gamification.currentTier.icon }}</span>
          </div>
          <div class="flex items-center gap-3 mb-4">
            <div class="text-2xl font-bold" :style="{ color: gamification.currentTier.color }">
              {{ gamification.currentTier.name }}
            </div>
            <div class="text-sm text-neutral-600 dark:text-neutral-400">
              {{ gamification.currentTier.benefits }}
            </div>
          </div>
          <div v-if="gamification.nextTier">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="text-neutral-600 dark:text-neutral-400">Next: {{ gamification.nextTier.name }}</span>
              <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ gamification.tierProgress }}%</span>
            </div>
            <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-700"
                :style="{ width: gamification.tierProgress + '%', backgroundColor: gamification.nextTier.color }"
              ></div>
            </div>
          </div>
          <div v-else class="text-sm text-primary-600 dark:text-primary-400 font-medium">
            🎉 Maximum tier achieved!
          </div>
        </Card>

        <!-- Stats Card -->
        <Card padding="lg">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Your Stats</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="document" size="md" class="text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ gamification.stats.questionsRead }}</div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">Questions Read</div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="bookmark" size="md" class="text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ gamification.stats.bookmarksCreated }}</div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">Bookmarks Created</div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="lightning" size="md" class="text-purple-700 dark:text-purple-400" />
                </div>
                <div>
                  <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ gamification.stats.quizzesCompleted }}</div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">Quizzes Completed</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Achievements -->
      <div v-if="dataStore.isReady && recentAchievements.length > 0" class="mb-8">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 px-1">Recent Achievements</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            padding="md"
            class="bg-gradient-to-br from-white to-accent-50 dark:from-neutral-900 dark:to-accent-900/20 border-accent-200 dark:border-accent-800/30"
          >
            <div class="flex items-center gap-3">
              <div class="text-4xl">{{ achievement.icon }}</div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{{ achievement.title }}</h4>
                <p class="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">{{ achievement.description }}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- CTA Section - Desktop only -->
      <div class="hidden lg:block">
        <Card padding="lg" class="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white border-0">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold mb-2">Ready to test your knowledge?</h3>
              <p class="text-primary-100 dark:text-primary-200">Take a quiz and earn points while learning</p>
            </div>
            <Button variant="secondary" size="lg" @click="navigate('/quiz')">
              Start Quiz
              <template #icon>
                <Icon name="lightning" size="md" />
              </template>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useGamificationStore } from '@/stores/gamification'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Icon from '@/components/common/Icon.vue'

const router = useRouter()
const dataStore = useDataStore()
const gamification = useGamificationStore()

const stats = ref({
  categories: 0,
  bookmarks: 0
})

const quickActions = [
  {
    name: 'Browse',
    icon: 'book',
    description: 'Explore categories',
    to: '/browse'
  },
  {
    name: 'Search',
    icon: 'search',
    description: 'Find answers',
    to: '/search'
  },
  {
    name: 'Quiz',
    icon: 'lightning',
    description: 'Test knowledge',
    to: '/quiz',
    badge: 'NEW'
  },
  {
    name: 'Bookmarks',
    icon: 'bookmark',
    description: 'Saved items',
    to: '/bookmarks'
  }
]

const recentAchievements = computed(() => {
  return gamification.achievements
    .filter(a => a.unlocked)
    .slice(-3)
    .reverse()
})

onMounted(async () => {
  try {
    // Initialize gamification
    gamification.initializeFromStorage()

    // Load database stats if data is ready
    if (dataStore.isReady) {
      const dbStats = await dataStore.getStats()
      stats.value.categories = dbStats.categories

      const bookmarked = JSON.parse(localStorage.getItem('bookmarkedQuestions') || '[]')
      stats.value.bookmarks = bookmarked.length
    }
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
})

function navigate(path) {
  router.push(path)
}

function startImport() {
  router.push('/import')
}
</script>
