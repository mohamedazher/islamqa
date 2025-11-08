<template>
  <div class="leaderboard-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 dark:from-amber-500 dark:via-orange-500 dark:to-red-500 text-white p-4 shadow">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="lg:hidden hover:opacity-80 transition-opacity">
          <Icon name="arrowLeft" size="md" />
        </button>
        <div class="flex-1">
          <h1 class="text-lg md:text-xl font-bold">Leaderboard</h1>
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
            <!-- Rank Badge -->
            <div
              class="rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm"
              :class="getRankBadgeClass(entry.rank)"
            >
              {{ entry.rank <= 3 ? getRankEmoji(entry.rank) : `#${entry.rank}` }}
            </div>

            <!-- User Info -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {{ entry.username }}
                <span v-if="entry.isCurrentUser" class="text-xs text-amber-600 dark:text-amber-400 ml-2">(You)</span>
              </div>
              <div v-if="selectedTab === 'allTime'" class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ entry.quizzesTaken }} quizzes • Level {{ entry.level }}
              </div>
              <div v-else-if="selectedTab === 'weekly'" class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ entry.quizzesTaken }} quizzes this week
              </div>
            </div>

            <!-- Score -->
            <div class="text-right">
              <div class="text-xl font-bold text-amber-600 dark:text-amber-400">
                {{ selectedTab === 'daily' ? entry.score : entry.totalScore }}
              </div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400">points</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && leaderboard.length === 0" class="text-center py-12">
        <Icon name="trophy" size="xl" class="text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
        <p class="text-neutral-600 dark:text-neutral-400">No scores yet. Be the first!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import leaderboardService from '@/services/leaderboardService'

const router = useRouter()

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
  await leaderboardService.initUser()
  username.value = leaderboardService.username
  loadLeaderboard()
})

watch(selectedTab, () => {
  loadLeaderboard()
})

async function loadLeaderboard() {
  loading.value = true

  try {
    if (selectedTab.value === 'daily') {
      leaderboard.value = await leaderboardService.getDailyLeaderboard()
    } else if (selectedTab.value === 'weekly') {
      leaderboard.value = await leaderboardService.getWeeklyLeaderboard()
    } else {
      leaderboard.value = await leaderboardService.getAllTimeLeaderboard()
    }

    // Get user rank
    const userEntry = leaderboard.value.find(entry => entry.isCurrentUser)
    if (userEntry) {
      userRank.value = userEntry.rank
      userScore.value = selectedTab.value === 'daily' ? userEntry.score : userEntry.totalScore
    } else {
      userRank.value = null
      userScore.value = 0
    }
  } catch (error) {
    console.error('Failed to load leaderboard:', error)
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

function goBack() {
  router.back()
}
</script>
