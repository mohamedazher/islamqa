<template>
  <div class="prayer-times-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-700 dark:to-cyan-700 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 hover:opacity-80 transition-opacity">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <Icon name="sun" size="lg" class="flex-shrink-0" />
        <div class="min-w-0">
          <h1 class="text-lg md:text-xl font-bold truncate">Prayer Times</h1>
          <p v-if="locationName" class="text-teal-100 dark:text-teal-200 text-xs md:text-sm truncate">{{ locationName }}</p>
        </div>
      </div>
      <button
        @click="openSettings"
        class="text-white/80 hover:text-white transition-colors ml-2"
        title="Prayer Settings"
      >
        <Icon name="cog" size="md" />
      </button>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center p-4">
      <div class="animate-pulse text-center">
        <Icon name="sun" size="xl" class="text-teal-600 dark:text-teal-400 mx-auto mb-2" />
        <p class="text-neutral-600 dark:text-neutral-400">Loading prayer times...</p>
      </div>
    </div>

    <!-- Location Not Set -->
    <div v-else-if="!hasLocation" class="flex-1 flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <div class="w-20 h-20 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="globe" size="xl" class="text-teal-600 dark:text-teal-400" />
        </div>
        <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Location Required</h2>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6">
          Please set your location to view accurate prayer times for your area.
        </p>
        <button
          @click="openSettings"
          class="px-6 py-3 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors font-medium"
        >
          Set Location
        </button>
      </div>
    </div>

    <!-- Prayer Times Content -->
    <div v-else class="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4 space-y-4">
      <!-- Current Time & Date -->
      <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {{ currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}
          </div>
          <div class="text-sm text-neutral-600 dark:text-neutral-400">
            {{ currentDate }}
          </div>
        </div>
      </div>

      <!-- Current Prayer Highlight -->
      <div v-if="currentPrayerWindow" class="bg-gradient-to-br from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600 text-white rounded-lg shadow-lg p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Icon :name="getPrayerIcon(currentPrayerWindow.name)" size="lg" />
            </div>
            <div>
              <div class="text-xs text-white/80 uppercase tracking-wide">Current Prayer</div>
              <div class="text-2xl font-bold">{{ currentPrayerWindow.name }} Time</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-white/80 mb-1">Ends in</div>
            <div class="text-3xl font-mono font-bold">{{ formatCountdown(currentPrayerWindow.countdown) }}</div>
          </div>
        </div>
        <div class="flex items-center justify-between text-sm bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
          <span>{{ currentPrayerWindow.startFormatted }}</span>
          <span>—</span>
          <span>{{ currentPrayerWindow.endFormatted }}</span>
        </div>
      </div>

      <!-- All Prayer Times -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 px-1">Today's Prayer Times</h3>

        <div
          v-for="prayer in prayerStatuses"
          :key="prayer.name"
          class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden transition-all"
          :class="getPrayerCardClass(prayer)"
        >
          <div class="p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center"
                  :class="getPrayerIconClass(prayer)"
                >
                  <Icon :name="getPrayerIcon(prayer.name)" size="lg" />
                </div>
                <div>
                  <div class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {{ prayer.name }}
                  </div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">
                    {{ prayer.startFormatted }} - {{ prayer.endFormatted }}
                  </div>
                </div>
              </div>

              <!-- Status Badge & Countdown -->
              <div class="text-right">
                <div
                  v-if="prayer.status === 'current'"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-semibold rounded-full mb-1"
                >
                  <div class="w-2 h-2 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse"></div>
                  Now
                </div>
                <div
                  v-else-if="prayer.status === 'past'"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium rounded-full mb-1"
                >
                  <Icon name="check" size="xs" />
                  Passed
                </div>

                <!-- Countdown -->
                <div v-if="prayer.countdown" class="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  <div class="text-xl">{{ formatCountdown(prayer.countdown) }}</div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400 font-normal">
                    {{ prayer.countdown.type === 'starts' ? 'until start' : 'until end' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress Bar for Current Prayer -->
            <div v-if="prayer.status === 'current'" class="mt-3">
              <div class="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600 transition-all duration-1000"
                  :style="{ width: getProgressPercentage(prayer) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calculation Method Info -->
      <div class="bg-neutral-100 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
        <div class="flex items-start gap-3">
          <Icon name="info" size="md" class="text-neutral-600 dark:text-neutral-400 mt-0.5" />
          <div class="flex-1 text-sm">
            <div class="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
              Calculation Method
            </div>
            <div class="text-neutral-600 dark:text-neutral-400">
              {{ calculationMethodName }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="fixed bottom-20 lg:bottom-4 left-4 right-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-lg shadow-lg p-4">
      <div class="flex items-start gap-3">
        <Icon name="exclamation" size="md" class="text-red-600 dark:text-red-400 flex-shrink-0" />
        <div class="flex-1">
          <p class="text-sm text-red-900 dark:text-red-100">{{ error }}</p>
        </div>
        <button @click="error = null" class="text-red-600 dark:text-red-400">
          <Icon name="close" size="sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import prayerTimesService from '@/services/prayerTimesService'

const router = useRouter()

// State
const isLoading = ref(true)
const hasLocation = ref(false)
const prayerStatuses = ref([])
const locationName = ref('')
const calculationMethodName = ref('')
const currentPrayerWindow = ref(null)
const error = ref(null)
const currentTime = ref(new Date())

// Update current time every second
let intervalId = null

onMounted(() => {
  loadPrayerTimes()

  // Update time every second
  intervalId = setInterval(() => {
    currentTime.value = new Date()
    updatePrayerStatuses()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Load prayer times
const loadPrayerTimes = () => {
  try {
    isLoading.value = true
    error.value = null

    hasLocation.value = prayerTimesService.hasLocation()

    if (hasLocation.value) {
      const settings = prayerTimesService.getSettings()
      locationName.value = settings.locationName
      calculationMethodName.value = settings.calculationMethodName

      updatePrayerStatuses()
    }
  } catch (e) {
    console.error('Failed to load prayer times:', e)
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

// Update prayer statuses
const updatePrayerStatuses = () => {
  try {
    prayerStatuses.value = prayerTimesService.getPrayerStatuses()
    currentPrayerWindow.value = prayerStatuses.value.find(p => p.status === 'current') || null
  } catch (e) {
    console.error('Failed to update prayer statuses:', e)
  }
}

// Current date display
const currentDate = computed(() => {
  return currentTime.value.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

// Format countdown
const formatCountdown = (countdown) => {
  if (!countdown) return '--:--'

  const { hours, minutes, seconds } = countdown

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

// Get prayer card styling
const getPrayerCardClass = (prayer) => {
  if (prayer.status === 'current') {
    return 'border-2 border-teal-500 dark:border-teal-600'
  }
  return ''
}

// Get prayer icon class
const getPrayerIconClass = (prayer) => {
  if (prayer.status === 'current') {
    return 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400'
  } else if (prayer.status === 'past') {
    return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-600'
  } else {
    return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  }
}

// Get icon for each prayer
const getPrayerIcon = (prayerName) => {
  const icons = {
    'Fajr': 'sun',
    'Dhuhr': 'sun',
    'Asr': 'sun',
    'Maghrib': 'moon',
    'Isha': 'moon'
  }
  return icons[prayerName] || 'sun'
}

// Calculate progress percentage for current prayer
const getProgressPercentage = (prayer) => {
  if (prayer.status !== 'current' || !prayer.countdown) return 0

  const totalDuration = prayer.end - prayer.start
  const elapsed = Date.now() - prayer.start
  const percentage = (elapsed / totalDuration) * 100

  return Math.min(Math.max(percentage, 0), 100)
}

// Navigation
const goBack = () => {
  router.back()
}

const openSettings = () => {
  router.push('/settings')
}
</script>
