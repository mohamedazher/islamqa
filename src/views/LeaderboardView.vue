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

    <div v-if="!leaderboardEnabled" class="m-4 rounded-xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
      <h2 class="font-semibold text-neutral-900 dark:text-neutral-100">Leaderboard is optional</h2>
      <p class="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
        Enabling it creates an anonymous Firebase account and uploads your chosen display name, quiz scores,
        reading/bookmark/dua activity and timestamps. Offline learning and local progress work without it.
      </p>
      <button @click="enableLeaderboard" class="mt-4 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700">
        Enable Leaderboard
      </button>
    </div>

    <!-- Tab Selector -->
    <div v-if="leaderboardEnabled" class="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 pt-4">
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
    <div v-if="leaderboardEnabled" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="showNamePrompt" class="rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-950/30">
        <h2 class="font-semibold text-neutral-900 dark:text-neutral-100">Choose how you appear</h2>
        <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Your current name was generated automatically. Choose a display name so you can recognize your place on the leaderboard.
        </p>
        <div class="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            v-model="displayName"
            maxlength="30"
            autocomplete="nickname"
            placeholder="Your display name"
            class="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            @keyup.enter="saveDisplayName"
          />
          <button :disabled="savingName" @click="saveDisplayName" class="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50">
            {{ savingName ? 'Saving…' : 'Save name' }}
          </button>
          <button @click="showNamePrompt = false" class="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-white/60 dark:text-neutral-300 dark:hover:bg-neutral-900/50">Later</button>
        </div>
        <p v-if="nameError" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ nameError }}</p>
      </div>

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

      <div v-if="!loading && loadError" class="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
        <div class="flex items-start gap-3">
          <Icon name="exclamation" size="md" class="mt-0.5 text-red-600 dark:text-red-400" />
          <div class="flex-1">
            <p class="font-medium text-red-900 dark:text-red-100">Leaderboard could not be loaded</p>
            <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ loadError }}</p>
            <button @click="loadLeaderboard" class="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Retry</button>
          </div>
        </div>
      </div>

      <!-- Leaderboard List -->
      <div v-if="!loadError" class="space-y-2">
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
                <div
                  class="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 flex items-center justify-center font-semibold"
                  :aria-label="`${entry.username} avatar`"
                >
                  {{ getInitials(entry.username) }}
                </div>
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
      <div v-if="!loading && !loadError && leaderboard.length === 0" class="text-center py-12 px-4">
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
import { isLeaderboardEnabled, updateConsent } from '@/services/privacyConsent'

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
const leaderboardEnabled = ref(isLeaderboardEnabled())
const loadError = ref(null)
const showNamePrompt = ref(false)
const displayName = ref('')
const savingName = ref(false)
const nameError = ref('')
let loadRequestId = 0

async function enableLeaderboard() {
  updateConsent('leaderboard', true)
  leaderboardEnabled.value = true
  await initializeLeaderboard()
}

onMounted(async () => {
  if (leaderboardEnabled.value) await initializeLeaderboard()
})

// Reload when navigating back to the page
onActivated(async () => {
  if (leaderboardEnabled.value) await loadLeaderboard()
})

// Watch for route changes to reload when clicking "Board" tab
watch(() => route.path, async (newPath) => {
  // Reload if we're navigating to the leaderboard page
  if (newPath === '/leaderboard') {
    // Reset to Today tab and reload
    selectedTab.value = 'daily'
    if (leaderboardEnabled.value) await loadLeaderboard()
  }
}, { flush: 'post' })

watch(selectedTab, () => {
  if (leaderboardEnabled.value) loadLeaderboard()
})

function getInitials(username) {
  const normalized = String(username || '?').trim()
  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length > 1) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  return normalized.slice(0, 2).toUpperCase()
}

async function initializeLeaderboard() {
  loading.value = true // Show loading immediately
  try {
    console.log('🎯 Initializing leaderboard view...')
    const user = await leaderboardService.initUser()
    if (!user?.userId) throw new Error('Authentication is unavailable. Check your connection and try again.')
    username.value = leaderboardService.username
    displayName.value = user.username || ''
    showNamePrompt.value = user.needsUsername === true
    console.log(`✅ Leaderboard user initialized: ${username.value}`)
    await loadLeaderboard()
  } catch (error) {
    console.error('❌ Failed to initialize leaderboard:', error)
    loadError.value = error.message || 'Leaderboard initialization failed.'
    loading.value = false
  }
}

async function saveDisplayName() {
  savingName.value = true
  nameError.value = ''
  try {
    const result = await leaderboardService.updateUsername(displayName.value)
    if (!result?.ok) throw new Error(result?.message || 'Display name could not be updated')
    username.value = result.username
    displayName.value = result.username
    showNamePrompt.value = false
    await loadLeaderboard()
  } catch (error) {
    nameError.value = error.message || 'Display name could not be updated'
  } finally {
    savingName.value = false
  }
}

async function loadLeaderboard() {
  if (!leaderboardEnabled.value) return
  const requestId = ++loadRequestId
  const requestedTab = selectedTab.value
  loading.value = true
  loadError.value = null

  try {
    console.log(`📊 Loading ${requestedTab} leaderboard...`)

    let entries
    if (requestedTab === 'daily') {
      entries = await leaderboardService.getDailyLeaderboard()
    } else if (requestedTab === 'weekly') {
      entries = await leaderboardService.getWeeklyLeaderboard()
    } else {
      entries = await leaderboardService.getAllTimeLeaderboard()
    }
    if (requestId !== loadRequestId) return
    leaderboard.value = entries

    console.log(`✅ Loaded ${leaderboard.value.length} entries`)

    // Get user rank
    const userEntry = leaderboard.value.find(entry => entry.isCurrentUser)
    if (userEntry) {
      userRank.value = userEntry.rank
      userScore.value = requestedTab === 'daily' ? (userEntry.score || 0) : (userEntry.totalScore || 0)
      console.log(`👤 User rank: ${userRank.value}, score: ${userScore.value}`)
    } else {
      const standing = await leaderboardService.getUserRank(requestedTab)
      if (requestId !== loadRequestId) return
      userRank.value = standing?.rank ?? null
      userScore.value = standing?.score ?? 0
      console.log(userRank.value ? `👤 User rank: ${userRank.value}, score: ${userScore.value}` : '👤 User has no score in this period')
    }
  } catch (error) {
    if (requestId !== loadRequestId) return
    console.error('❌ Failed to load leaderboard:', error)
    leaderboard.value = []
    userRank.value = null
    userScore.value = 0
    loadError.value = error.message || 'Check your connection and try again.'
  } finally {
    if (requestId === loadRequestId) loading.value = false
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
