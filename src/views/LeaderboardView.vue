<template>
  <div class="leaderboard-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 dark:from-amber-500 dark:via-orange-500 dark:to-red-500 text-white p-3 sm:p-4 shadow">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="lg:hidden hover:opacity-80 transition-opacity">
          <Icon name="arrowLeft" size="md" />
        </button>
        <div class="flex-1">
          <h1 class="text-base sm:text-lg font-bold">Leaderboard</h1>
          <p class="text-sm text-white/90">Compete with fellow learners</p>
        </div>
        <Icon name="trophy" size="lg" />
      </div>
    </header>

    <!-- Tab Selector -->
    <div class="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 pt-4">
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="selectedTab = tab.id"
          class="px-4 py-2 rounded-t-lg font-medium transition-colors"
          :class="selectedTab === tab.id
            ? 'bg-gradient-to-br from-amber-400 to-orange-400 text-white'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Leaderboard Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-neutral-600 dark:text-neutral-400">Loading leaderboard...</p>
        </div>
      </div>

      <!-- Your Rank Card -->
      <div v-else-if="userRank" class="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div class="flex items-center gap-4">
          <div class="bg-gradient-to-br from-amber-400 to-orange-400 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
            #{{ userRank }}
          </div>
          <div class="flex-1">
            <div class="font-semibold text-neutral-900 dark:text-neutral-100">Your Rank</div>
            <div class="text-sm text-neutral-600 dark:text-neutral-400">{{ username }}</div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ userScore }}</div>
            <div class="text-xs text-neutral-600 dark:text-neutral-400">points</div>
          </div>
        </div>
      </div>

      <!-- Leaderboard List -->
      <div class="space-y-2">
        <div
          v-for="entry in leaderboard"
          :key="entry.userId"
          class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 transition-all"
          :class="entry.isCurrentUser ? 'ring-2 ring-amber-400 dark:ring-amber-600' : ''"
        >
          <div class="flex items-center gap-4">
            <!-- Avatar or Rank Badge -->
            <div class="relative">
              <!-- Top 3 ranks: Show medals -->
              <div
                v-if="entry.rank <= 3"
                class="rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm"
                :class="getRankBadgeClass(entry.rank)"
              >
                {{ getRankEmoji(entry.rank) }}
              </div>
              <!-- Other ranks: Show avatar with rank badge -->
              <div v-else class="relative">
                <img
                  :src="getAvatarUrl(entry.userId, entry.username)"
                  :alt="entry.username"
                  class="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800"
                />
                <!-- Small rank badge overlay -->
                <div class="absolute -bottom-1 -right-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-neutral-900">
                  {{ entry.rank }}
                </div>
              </div>
            </div>

            <!-- User Info -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {{ entry.username }}
                <span v-if="entry.isCurrentUser" class="text-xs text-amber-600 dark:text-amber-400 ml-2">(You)</span>
              </div>
              <div v-if="selectedTab === 'allTime'" class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ entry.quizzesTaken || 0 }} quizzes • Level {{ entry.level || 1 }}
              </div>
              <div v-else-if="selectedTab === 'weekly'" class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ entry.quizzesTaken || 0 }} quizzes this week
              </div>
            </div>

            <!-- Score -->
            <div class="text-right">
              <div class="text-xl font-bold text-amber-600 dark:text-amber-400">
                {{ selectedTab === 'daily' ? (entry.score || 0) : (entry.totalScore || 0) }}
              </div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400">points</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && leaderboard.length === 0" class="text-center py-12 px-4">
        <Icon name="trophy" size="xl" class="text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
        <p class="text-neutral-600 dark:text-neutral-400 font-medium mb-2">
          {{ getEmptyStateMessage() }}
        </p>
        <p class="text-sm text-neutral-500 dark:text-neutral-500">
          Complete quizzes to appear on the leaderboard!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import leaderboardService from '@/services/leaderboardService'

const router = useRouter()
const route = useRoute()

const tabs = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'This Week' },
  { id: 'allTime', label: 'All Time' }
]

const selectedTab = ref('daily')
const leaderboard = ref([])
const loading = ref(false)
const userRank = ref(null)
const userScore = ref(0)
const username = ref('')

onMounted(async () => {
  await initializeLeaderboard()
})

// Reload when navigating back to the page
onActivated(async () => {
  await loadLeaderboard()
})

// Watch for route changes to reload when clicking "Board" tab
watch(() => route.path, async (newPath) => {
  // Reload if we're navigating to the leaderboard page
  if (newPath === '/leaderboard') {
    // Reset to Today tab and reload
    selectedTab.value = 'daily'
    await loadLeaderboard()
  }
}, { flush: 'post' })

watch(selectedTab, () => {
  loadLeaderboard()
})

// Get avatar URL using DiceBear API (identicon style)
function getAvatarUrl(userId, username) {
  // Use username or userId as seed for consistent avatars
  const seed = username || userId || 'default'
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`
}

async function initializeLeaderboard() {
  loading.value = true // Show loading immediately
  try {
    await leaderboardService.initUser()
    username.value = leaderboardService.username
    await loadLeaderboard()
  } catch (error) {
    console.error('Failed to initialize leaderboard:', error)
    loading.value = false
  }
}

async function loadLeaderboard() {
  loading.value = true

  try {
    console.log(`📊 Loading ${selectedTab.value} leaderboard...`)

    if (selectedTab.value === 'daily') {
      leaderboard.value = await leaderboardService.getDailyLeaderboard()
    } else if (selectedTab.value === 'weekly') {
      leaderboard.value = await leaderboardService.getWeeklyLeaderboard()
    } else {
      leaderboard.value = await leaderboardService.getAllTimeLeaderboard()
    }

    console.log(`✅ Loaded ${leaderboard.value.length} entries`)

    // Get user rank
    const userEntry = leaderboard.value.find(entry => entry.isCurrentUser)
    if (userEntry) {
      userRank.value = userEntry.rank
      userScore.value = selectedTab.value === 'daily' ? (userEntry.score || 0) : (userEntry.totalScore || 0)
      console.log(`👤 User rank: ${userRank.value}, score: ${userScore.value}`)
    } else {
      userRank.value = null
      userScore.value = 0
      console.log('👤 User not found in leaderboard')
    }
  } catch (error) {
    console.error('❌ Failed to load leaderboard:', error)
    leaderboard.value = []
    userRank.value = null
    userScore.value = 0
  } finally {
    loading.value = false
  }
}

function getRankBadgeClass(rank) {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white'
  if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
  if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
  return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
}

function getRankEmoji(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

function getEmptyStateMessage() {
  if (selectedTab.value === 'daily') {
    return 'No scores today yet'
  } else if (selectedTab.value === 'weekly') {
    return 'No scores this week yet'
  } else {
    return 'No scores yet. Be the first!'
  }
}

function goBack() {
  router.back()
}
</script>
