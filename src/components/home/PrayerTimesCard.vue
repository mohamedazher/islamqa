<template>
  <div class="prayer-times-card">
    <!-- Loading State -->
    <Card v-if="isLoading" padding="lg" class="relative overflow-hidden">
      <div class="animate-pulse">
        <div class="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-4"></div>
        <div class="space-y-3">
          <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    </Card>

    <!-- Location Not Set -->
    <Card v-else-if="!hasLocation" padding="lg" class="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800/30">
      <div class="text-center">
        <div class="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="globe" size="xl" class="text-teal-600 dark:text-teal-400" />
        </div>
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Set Your Location</h3>
        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Enable location access to see accurate prayer times for your area
        </p>
        <Button variant="primary" size="md" @click="detectLocation" :disabled="detectingLocation">
          <template #icon>
            <Icon name="globe" size="md" />
          </template>
          {{ detectingLocation ? 'Detecting...' : 'Detect Location' }}
        </Button>
        <div class="mt-3">
          <button
            @click="$emit('openSettings')"
            class="text-sm text-teal-600 dark:text-teal-400 hover:underline"
          >
            Or set location manually
          </button>
        </div>
      </div>
    </Card>

    <!-- Prayer Times Display -->
    <Card v-else padding="none" class="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all" @click="openDetailedView">
      <!-- Header Section with Current Prayer Window - Dynamic gradient based on time of day -->
      <div
        class="bg-gradient-to-r text-white px-5 py-4 transition-all duration-1000"
        :class="timePeriodGradient ? `${timePeriodGradient.from} ${timePeriodGradient.via} ${timePeriodGradient.to}` : 'from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600'"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Icon :name="timePeriodIcon" size="md" />
            <span class="text-sm font-medium">{{ locationName }}</span>
          </div>
          <button
            @click.stop="$emit('openSettings')"
            class="text-white/80 hover:text-white transition-colors"
            title="Prayer Settings"
          >
            <Icon name="cog" size="sm" />
          </button>
        </div>

        <!-- Current Prayer Window or Next Prayer -->
        <div
          v-if="currentPrayerWindow"
          class="rounded-lg px-4 py-3 transition-all duration-500"
          :class="currentPrayerWindow.hours === 0 && currentPrayerWindow.minutes < 10
            ? 'bg-red-500/20 backdrop-blur-sm border-2 border-red-400/50 shadow-lg shadow-red-500/20'
            : 'bg-white/10 backdrop-blur-sm'"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs text-white/80">Current Prayer Time</div>
            <!-- Urgent indicator when <10 min -->
            <div
              v-if="currentPrayerWindow.hours === 0 && currentPrayerWindow.minutes < 10"
              class="flex items-center gap-1 text-xs font-bold text-red-200 animate-pulse"
            >
              <Icon name="exclamation" size="xs" />
              <span>Time running out!</span>
            </div>
          </div>
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <div class="text-2xl font-bold">{{ currentPrayerWindow.prayer }} Time</div>
              <div class="text-xs text-white/80 mt-1">{{ currentPrayerWindow.startFormatted }} - {{ currentPrayerWindow.endTime }}</div>
            </div>
            <div
              :class="currentPrayerWindow.hours === 0 && currentPrayerWindow.minutes < 10 ? 'animate-pulse' : ''"
            >
              <CircularCountdown
                :hours="currentPrayerWindow.hours"
                :minutes="currentPrayerWindow.minutes"
                :seconds="currentPrayerWindow.seconds"
                :total-seconds="currentPrayerWindow.hours * 3600 + currentPrayerWindow.minutes * 60 + currentPrayerWindow.seconds"
                :max-duration="currentPrayerWindow.maxDuration"
                :size="80"
                :stroke-width="6"
                :progress-color="currentPrayerWindow.hours === 0 && currentPrayerWindow.minutes < 10 ? '#ef4444' : 'white'"
                bg-color="rgba(255, 255, 255, 0.2)"
                label="remaining"
                format="auto"
              />
            </div>
          </div>
        </div>
        <div v-else-if="nextPrayerInfo" class="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
          <div class="text-xs text-white/80 mb-2">Next Prayer</div>
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <div class="text-2xl font-bold">{{ nextPrayerInfo.prayer }}</div>
              <div class="text-xs text-white/80 mt-1">{{ nextPrayerTime }}</div>
            </div>
            <div>
              <CircularCountdown
                :hours="nextPrayerInfo.hours"
                :minutes="nextPrayerInfo.minutes"
                :seconds="nextPrayerInfo.seconds"
                :total-seconds="nextPrayerInfo.totalSeconds"
                :size="80"
                :stroke-width="6"
                progress-color="white"
                bg-color="rgba(255, 255, 255, 0.2)"
                label="until start"
                format="auto"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 7-Day Prayer Times Carousel -->
      <div class="border-t border-neutral-200 dark:border-neutral-800">
        <!-- Date Header - Changes based on scroll position -->
        <div class="px-5 py-3 bg-neutral-50 dark:bg-neutral-900/30">
          <div class="text-center">
            <div class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {{ currentCarouselDate }}
            </div>
            <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              {{ currentCarouselDayName }}
            </div>
          </div>
        </div>

        <!-- Scrollable Prayer Times Container -->
        <div
          ref="carouselContainer"
          class="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
          @scroll="handleCarouselScroll"
        >
          <!-- Prayer Times for Each Day (Next 7 Days) -->
          <div
            v-for="(dayData, index) in weekPrayerTimes"
            :key="index"
            class="flex-shrink-0 w-full snap-center px-5 py-4 space-y-2"
          >
            <div
              v-for="prayer in dayData.prayers"
              :key="prayer.name"
              class="flex items-center justify-between py-2.5 px-3 rounded-lg transition-all bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  <Icon :name="getPrayerIcon(prayer.name)" size="md" />
                </div>
                <div>
                  <div class="font-semibold text-neutral-900 dark:text-neutral-100">
                    {{ prayer.name }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                  {{ prayer.time }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Carousel Dots Indicator -->
        <div class="flex items-center justify-center gap-1.5 px-5 py-3 bg-neutral-50 dark:bg-neutral-900/30">
          <button
            v-for="(day, index) in weekPrayerTimes"
            :key="index"
            @click="scrollToDay(index)"
            class="transition-all duration-300"
            :class="currentDayIndex === index ? 'w-6 h-2 bg-teal-600 dark:bg-teal-500 rounded-full' : 'w-2 h-2 bg-neutral-300 dark:bg-neutral-700 rounded-full hover:bg-neutral-400 dark:hover:bg-neutral-600'"
            :aria-label="`View ${day.shortDate}`"
          ></button>
        </div>
      </div>

      <!-- Footer with Date and Calculation Method -->
      <div class="px-5 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <div class="flex items-center gap-1">
            <Icon name="info" size="xs" />
            <span>{{ calculationMethodName }}</span>
          </div>
          <div>{{ currentDate }}</div>
        </div>
      </div>
    </Card>

    <!-- Error State -->
    <Card v-if="error" padding="md" class="mt-3 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30">
      <div class="flex items-start gap-3">
        <Icon name="exclamation" size="md" class="text-red-600 dark:text-red-400 flex-shrink-0" />
        <div class="flex-1">
          <p class="text-sm text-red-900 dark:text-red-100">{{ error }}</p>
          <button
            v-if="error.includes('permission') || error.includes('settings')"
            @click="$emit('openSettings')"
            class="mt-2 text-sm text-red-700 dark:text-red-300 hover:underline font-medium flex items-center gap-1"
          >
            <Icon name="cog" size="sm" />
            Go to Settings
          </button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Icon from '@/components/common/Icon.vue'
import CircularCountdown from '@/components/common/CircularCountdown.vue'
import prayerTimesService from '@/services/prayerTimesService'

const router = useRouter()
const emit = defineEmits(['openSettings'])

// State
const isLoading = ref(true)
const hasLocation = ref(false)
const detectingLocation = ref(false)
const prayerTimes = ref(null)
const locationName = ref('')
const calculationMethodName = ref('')
const currentPrayer = ref(null)
const currentPrayerWindow = ref(null)
const nextPrayerInfo = ref(null)
const error = ref(null)
const currentTime = ref(new Date())

// Carousel state
const carouselContainer = ref(null)
const weekPrayerTimes = ref([])
const currentDayIndex = ref(0)

// Dynamic styling based on time of day
const timePeriodGradient = ref(null)
const timePeriodIcon = ref('sun')

// Update current time every second
let intervalId = null
let widgetUpdateCounter = 0

onMounted(() => {
  loadPrayerTimes()

  // Update time every second for countdown
  intervalId = setInterval(() => {
    currentTime.value = new Date()
    updatePrayerInfo()

    // Update widget every 60 seconds
    widgetUpdateCounter++
    if (widgetUpdateCounter >= 60) {
      prayerTimesService.updateWidget()
      widgetUpdateCounter = 0

      // Also refresh gradient every minute in case time period changed
      if (hasLocation.value) {
        timePeriodGradient.value = prayerTimesService.getTimePeriodGradient()
        timePeriodIcon.value = prayerTimesService.getTimePeriodIcon()
      }
    }
  }, 1000)

  // Initial widget update
  setTimeout(() => prayerTimesService.updateWidget(), 1000)
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

    // Reload settings from localStorage to get latest values
    prayerTimesService.reloadSettings()

    hasLocation.value = prayerTimesService.hasLocation()

    if (hasLocation.value) {
      const settings = prayerTimesService.getSettings()
      locationName.value = settings.locationName
      calculationMethodName.value = settings.calculationMethodName

      prayerTimes.value = prayerTimesService.getFormattedPrayerTimes()
      currentPrayer.value = prayerTimesService.getCurrentPrayerName()

      // Load dynamic styling
      timePeriodGradient.value = prayerTimesService.getTimePeriodGradient()
      timePeriodIcon.value = prayerTimesService.getTimePeriodIcon()

      updatePrayerInfo()

      // Generate 7 days of prayer times for carousel
      generateWeekPrayerTimes()
    }
  } catch (e) {
    console.error('Failed to load prayer times:', e)
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

// Update prayer info (current window and next prayer)
const updatePrayerInfo = () => {
  try {
    // Get current prayer window
    const currentWindow = prayerTimesService.getCurrentPrayerWindow()
    if (currentWindow) {
      const timeRemaining = prayerTimesService.getTimeRemainingInCurrentPrayer()

      // Calculate total window duration (in seconds) for progress calculation
      const windowDurationMs = currentWindow.end - currentWindow.start
      const windowDurationSeconds = Math.floor(windowDurationMs / 1000)

      currentPrayerWindow.value = {
        prayer: currentWindow.name,
        startFormatted: currentWindow.startFormatted,
        endTime: timeRemaining?.endTime || currentWindow.endFormatted,
        hours: timeRemaining?.hours || 0,
        minutes: timeRemaining?.minutes || 0,
        seconds: timeRemaining?.seconds || 0,
        maxDuration: windowDurationSeconds // Total duration for progress circle
      }
    } else {
      currentPrayerWindow.value = null
    }

    // Get next prayer info
    nextPrayerInfo.value = prayerTimesService.getTimeUntilNextPrayer()
  } catch (e) {
    console.error('Failed to update prayer info:', e)
  }
}

// Detect location
const detectLocation = async () => {
  try {
    detectingLocation.value = true
    error.value = null

    await prayerTimesService.detectLocation()
    loadPrayerTimes()
  } catch (e) {
    console.error('Failed to detect location:', e)
    error.value = e.message

    // If permission was denied, show option to go to settings
    if (e.permissionDenied && e.shouldShowSettings) {
      setTimeout(() => {
        const confirmed = confirm(
          e.message + '\n\nWould you like to go to Settings to enable location access?'
        )
        if (confirmed) {
          router.push('/settings')
        }
      }, 100)
    }
  } finally {
    detectingLocation.value = false
  }
}

// Prayer times list
const prayersList = computed(() => {
  if (!prayerTimes.value) return []

  return [
    { name: 'Fajr', time: prayerTimes.value.fajr },
    { name: 'Sunrise', time: prayerTimes.value.sunrise },
    { name: 'Dhuhr', time: prayerTimes.value.dhuhr },
    { name: 'Asr', time: prayerTimes.value.asr },
    { name: 'Maghrib', time: prayerTimes.value.maghrib },
    { name: 'Isha', time: prayerTimes.value.isha }
  ]
})

// Get next prayer time formatted
const nextPrayerTime = computed(() => {
  if (!prayerTimes.value || !nextPrayerInfo.value) return ''

  const prayerName = nextPrayerInfo.value.prayer
  const prayer = prayersList.value.find(p => p.name === prayerName)

  return prayer ? prayer.time : ''
})

// Current date display
const currentDate = computed(() => {
  return currentTime.value.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
})

// Current carousel date (based on scroll position)
const currentCarouselDate = computed(() => {
  if (weekPrayerTimes.value.length === 0 || currentDayIndex.value >= weekPrayerTimes.value.length) {
    return ''
  }
  return weekPrayerTimes.value[currentDayIndex.value]?.fullDate || ''
})

// Current carousel day name
const currentCarouselDayName = computed(() => {
  if (weekPrayerTimes.value.length === 0 || currentDayIndex.value >= weekPrayerTimes.value.length) {
    return ''
  }
  const dayData = weekPrayerTimes.value[currentDayIndex.value]
  if (!dayData) return ''

  // Add helpful labels for today/tomorrow
  if (currentDayIndex.value === 0) {
    return `${dayData.dayName} (Today)`
  } else if (currentDayIndex.value === 1) {
    return `${dayData.dayName} (Tomorrow)`
  }
  return dayData.dayName
})

// Prayer item styling
const getPrayerItemClass = (prayerName) => {
  if (currentPrayer.value === prayerName) {
    return 'bg-teal-50 dark:bg-teal-950/30 border-2 border-teal-200 dark:border-teal-800'
  }
  return 'bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
}

// Prayer icon styling
const getPrayerIconClass = (prayerName) => {
  if (currentPrayer.value === prayerName) {
    return 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400'
  }
  return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
}

// Get icon for each prayer
const getPrayerIcon = (prayerName) => {
  const icons = {
    'Fajr': 'sun',
    'Sunrise': 'sun',
    'Dhuhr': 'sun',
    'Asr': 'sun',
    'Maghrib': 'moon',
    'Isha': 'moon'
  }
  return icons[prayerName] || 'sun'
}

// Generate 7 days of prayer times
const generateWeekPrayerTimes = () => {
  if (!hasLocation.value) {
    weekPrayerTimes.value = []
    return
  }

  try {
    const times = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Get prayer times for this date (prayerTimesService.getFormattedPrayerTimes accepts a date parameter)
      const dayTimes = prayerTimesService.getFormattedPrayerTimes(date)

      times.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }),
        prayers: [
          { name: 'Fajr', time: dayTimes.fajr },
          { name: 'Sunrise', time: dayTimes.sunrise },
          { name: 'Dhuhr', time: dayTimes.dhuhr },
          { name: 'Asr', time: dayTimes.asr },
          { name: 'Maghrib', time: dayTimes.maghrib },
          { name: 'Isha', time: dayTimes.isha }
        ]
      })
    }

    weekPrayerTimes.value = times
  } catch (e) {
    console.error('Failed to generate week prayer times:', e)
    weekPrayerTimes.value = []
  }
}

// Handle carousel scroll to update current day index
const handleCarouselScroll = () => {
  if (!carouselContainer.value || weekPrayerTimes.value.length === 0) return

  const container = carouselContainer.value
  const scrollLeft = container.scrollLeft
  const cardWidth = container.offsetWidth
  const newIndex = Math.round(scrollLeft / cardWidth)

  if (newIndex !== currentDayIndex.value && newIndex >= 0 && newIndex < weekPrayerTimes.value.length) {
    currentDayIndex.value = newIndex
  }
}

// Scroll to specific day (when dot is clicked)
const scrollToDay = (index) => {
  if (!carouselContainer.value || index < 0 || index >= weekPrayerTimes.value.length) return

  const container = carouselContainer.value
  const cardWidth = container.offsetWidth
  const scrollPosition = index * cardWidth

  container.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  })

  currentDayIndex.value = index
}

// Navigate to detailed prayer times view
const openDetailedView = () => {
  router.push('/prayer-times')
}
</script>
