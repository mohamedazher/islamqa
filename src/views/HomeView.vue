<template>
  <div class="home-view min-h-screen">
    <!-- Hero Section - Desktop only -->
    <div class="hidden lg:block bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
      <div class="max-w-7xl mx-auto px-6 xl:px-8 py-12">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl xl:text-5xl font-bold mb-3">As-salamu alaykum</h1>
            <p class="text-xl text-primary-100">Explore authentic Islamic knowledge from trusted sources</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[200px]">
            <div class="text-center">
              <div class="text-sm text-primary-100 mb-1">Your Level</div>
              <div class="text-4xl font-bold mb-2">{{ gamification.currentLevel }}</div>
              <div class="text-xs text-primary-100">{{ gamification.points }} points</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 py-6 lg:py-8">
      <!-- Mobile Header -->
      <div class="lg:hidden mb-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-1">Welcome back</h2>
        <p class="text-neutral-600">Continue your Islamic learning journey</p>
      </div>

      <!-- Import Banner -->
      <div v-if="!dataStore.isLoaded" class="mb-6 animate-slide-up">
        <Card padding="md" class="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <div class="flex items-start gap-4">
            <div class="text-4xl">📥</div>
            <div class="flex-1">
              <h3 class="font-semibold text-amber-900 mb-1">Welcome! Let's Get Started</h3>
              <p class="text-sm text-amber-800 mb-3">
                Import the Islamic Q&A database to access thousands of answers from authentic sources.
              </p>
              <Button variant="primary" size="md" @click="startImport">
                <template #icon>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </template>
                Start Import
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Quick Actions Grid -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-neutral-900 mb-4 px-1">Quick Access</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card
            v-for="action in quickActions"
            :key="action.name"
            clickable
            padding="md"
            @click="navigate(action.to)"
            class="group relative overflow-hidden"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-3">
                <div class="text-3xl lg:text-4xl group-hover:scale-110 transition-transform">
                  {{ action.icon }}
                </div>
                <span
                  v-if="action.badge"
                  class="px-2 py-0.5 text-2xs font-bold rounded-full bg-accent-100 text-accent-700 animate-pulse"
                >
                  {{ action.badge }}
                </span>
              </div>
              <h4 class="font-semibold text-neutral-900 mb-1">{{ action.name }}</h4>
              <p class="text-xs lg:text-sm text-neutral-600">{{ action.description }}</p>
            </div>
          </Card>
        </div>
      </div>

      <!-- Stats & Progress Section -->
      <div v-if="dataStore.isLoaded" class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <!-- Gamification Progress Card -->
        <Card padding="lg" class="lg:col-span-2 bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 mb-1">Your Progress</h3>
              <p class="text-sm text-neutral-600">Keep learning to level up!</p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-primary-600">{{ gamification.currentLevel }}</div>
              <div class="text-xs text-neutral-600">Level</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="font-medium text-neutral-700">{{ gamification.points }} points</span>
              <span class="text-neutral-600">{{ gamification.pointsToNextLevel }} to next level</span>
            </div>
            <div class="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
              <div
                class="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-700 ease-out"
                :style="{ width: gamification.levelProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Streak -->
          <div v-if="gamification.streak > 0" class="flex items-center gap-2 text-sm">
            <span class="text-2xl">🔥</span>
            <span class="font-semibold text-neutral-900">{{ gamification.streak }} day streak!</span>
            <span class="text-neutral-600">Keep it up!</span>
          </div>
        </Card>

        <!-- Stats Card -->
        <Card padding="lg">
          <h3 class="text-lg font-semibold text-neutral-900 mb-4">Your Stats</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                  📚
                </div>
                <div>
                  <div class="text-2xl font-bold text-neutral-900">{{ dataStore.categories.length }}</div>
                  <div class="text-xs text-neutral-600">Categories</div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                  📂
                </div>
                <div>
                  <div class="text-2xl font-bold text-neutral-900">{{ stats.bookmarks }}</div>
                  <div class="text-xs text-neutral-600">Bookmarks</div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                  🎯
                </div>
                <div>
                  <div class="text-2xl font-bold text-neutral-900">{{ gamification.stats.quizzesCompleted }}</div>
                  <div class="text-xs text-neutral-600">Quizzes Completed</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Achievements -->
      <div v-if="dataStore.isLoaded && recentAchievements.length > 0" class="mb-8">
        <h3 class="text-lg font-semibold text-neutral-900 mb-4 px-1">Recent Achievements</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            padding="md"
            class="bg-gradient-to-br from-white to-accent-50 border-accent-200"
          >
            <div class="flex items-center gap-3">
              <div class="text-4xl">{{ achievement.icon }}</div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-neutral-900 truncate">{{ achievement.title }}</h4>
                <p class="text-xs text-neutral-600 line-clamp-2">{{ achievement.description }}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- CTA Section - Desktop only -->
      <div class="hidden lg:block">
        <Card padding="lg" class="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold mb-2">Ready to test your knowledge?</h3>
              <p class="text-primary-100">Take a quiz and earn points while learning</p>
            </div>
            <Button variant="secondary" size="lg" @click="navigate('/quiz')">
              Start Quiz
              <template #icon>
                <span class="text-xl">🎯</span>
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

const router = useRouter()
const dataStore = useDataStore()
const gamification = useGamificationStore()

const stats = ref({
  bookmarks: 0
})

const quickActions = [
  {
    name: 'Browse',
    icon: '📚',
    description: 'Explore categories',
    to: '/browse'
  },
  {
    name: 'Search',
    icon: '🔍',
    description: 'Find answers',
    to: '/search'
  },
  {
    name: 'Quiz',
    icon: '🎯',
    description: 'Test knowledge',
    to: '/quiz',
    badge: 'NEW'
  },
  {
    name: 'Folders',
    icon: '📂',
    description: 'Saved items',
    to: '/folders'
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

    // Load bookmarks from localStorage if data is already loaded
    if (dataStore.isLoaded) {
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
