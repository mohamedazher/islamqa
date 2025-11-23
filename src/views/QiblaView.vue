<template>
  <div class="qibla-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 text-white p-3 sm:p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 hover:opacity-80 transition-opacity">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <Icon name="compass" size="lg" class="flex-shrink-0" />
        <div class="min-w-0">
          <h1 class="text-base sm:text-lg font-bold truncate">Qibla Compass</h1>
          <p v-if="qiblaInfo.locationName" class="text-white/80 text-xs md:text-sm truncate">
            {{ qiblaInfo.locationName }}
          </p>
        </div>
      </div>
      <!-- Accuracy Indicator -->
      <div
        v-if="compassActive && !compassError"
        class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        :class="calibrationNeeded
          ? 'bg-amber-500/20 text-amber-100'
          : 'bg-emerald-500/20 text-emerald-100'"
      >
        <div
          class="w-2 h-2 rounded-full"
          :class="calibrationNeeded ? 'bg-amber-400' : 'bg-emerald-400'"
        ></div>
        {{ calibrationNeeded ? 'Low' : 'Good' }}
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center p-4">
      <div class="animate-pulse text-center">
        <Icon name="compass" size="xl" class="text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
        <p class="text-neutral-600 dark:text-neutral-400">Initializing compass...</p>
      </div>
    </div>

    <!-- Location Not Set -->
    <div v-else-if="!qiblaInfo.hasLocation" class="flex-1 flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="globe" size="xl" class="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">Location Required</h2>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6">
          Please set your location to calculate the Qibla direction for your area.
        </p>
        <button
          @click="goToSettings"
          class="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors font-medium"
        >
          Set Location
        </button>
      </div>
    </div>

    <!-- At Kaaba State -->
    <div v-else-if="qiblaInfo.isAtKaaba" class="flex-1 flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <div class="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" class="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="currentColor">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">MashaAllah!</h2>
        <p class="text-neutral-600 dark:text-neutral-400">
          You are at or near the Holy Kaaba. May Allah accept your prayers and Ibadah.
        </p>
      </div>
    </div>

    <!-- Main Compass View -->
    <div v-else class="flex-1 overflow-y-auto flex flex-col">
      <!-- Compass Section -->
      <div class="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
        <!-- Compass Error State -->
        <div v-if="compassError" class="text-center max-w-sm">
          <div class="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="exclamation" size="xl" class="text-amber-600 dark:text-amber-400" />
          </div>
          <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Compass Unavailable</h3>
          <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {{ compassError }}
          </p>

          <!-- Static direction display as fallback -->
          <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-800">
            <div class="text-center">
              <div class="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {{ Math.round(qiblaInfo.qiblaDirection) }}°
              </div>
              <div class="text-neutral-600 dark:text-neutral-400">
                {{ qiblaInfo.cardinalDirection }} from North
              </div>
            </div>
          </div>
        </div>

        <!-- Active Compass -->
        <template v-else>
          <QiblaCompass
            :qibla-direction="qiblaInfo.qiblaDirection"
            :device-heading="deviceHeading"
            :cardinal-direction="qiblaInfo.cardinalDirection"
            :size="compassSize"
          />

          <!-- Calibration Warning Banner -->
          <button
            v-if="calibrationNeeded"
            @click="showCalibrationGuide = true"
            class="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
          >
            <Icon name="exclamation" size="sm" />
            <span class="text-sm font-medium">Calibration needed - Tap for help</span>
          </button>
        </template>
      </div>

      <!-- Info Section -->
      <div class="p-4 pb-20 lg:pb-4 space-y-3">
        <!-- Distance to Kaaba -->
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor">
                  <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z" />
                </svg>
              </div>
              <div>
                <div class="text-sm text-neutral-600 dark:text-neutral-400">Distance to Mecca</div>
                <div class="font-bold text-neutral-900 dark:text-neutral-100">
                  {{ formattedDistance }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-neutral-600 dark:text-neutral-400">Direction</div>
              <div class="font-bold text-emerald-600 dark:text-emerald-400">
                {{ Math.round(qiblaInfo.qiblaDirection) }}° {{ qiblaInfo.cardinalDirection }}
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions Card -->
        <div class="bg-neutral-100 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
          <div class="flex items-start gap-3">
            <Icon name="info" size="md" class="text-neutral-500 dark:text-neutral-400 mt-0.5 flex-shrink-0" />
            <div class="text-sm text-neutral-600 dark:text-neutral-400">
              <p class="mb-2">Hold your phone flat and point the top of your phone in the direction of the green arrow to face the Qibla.</p>
              <p>For best accuracy, use the compass outdoors and away from metal objects or electronic devices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calibration Guide Modal -->
    <CalibrationGuide
      :show="showCalibrationGuide"
      @dismiss="showCalibrationGuide = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import QiblaCompass from '@/components/qibla/QiblaCompass.vue'
import CalibrationGuide from '@/components/qibla/CalibrationGuide.vue'
import qiblaService from '@/services/qiblaService'
import prayerTimesService from '@/services/prayerTimesService'

const router = useRouter()

// State
const isLoading = ref(true)
const hasLocation = ref(false)
const qiblaInfo = ref({
  hasLocation: false,
  qiblaDirection: 0,
  distanceToKaaba: null,
  cardinalDirection: '',
  locationName: null,
  isAtKaaba: false
})
const deviceHeading = ref(0)
const compassActive = ref(false)
const compassError = ref(null)
const calibrationNeeded = ref(false)
const showCalibrationGuide = ref(false)

// Compass cleanup function
let stopCompass = null

// Compute compass size based on screen
const compassSize = computed(() => {
  // Smaller on very small screens
  if (typeof window !== 'undefined' && window.innerWidth < 360) {
    return 240
  }
  return 280
})

// Formatted distance
const formattedDistance = computed(() => {
  return qiblaService.formatDistance(qiblaInfo.value.distanceToKaaba)
})

// Initialize
onMounted(async () => {
  try {
    isLoading.value = true

    // Reload settings from localStorage to ensure we have the latest values
    prayerTimesService.reloadSettings()

    // Check location directly like PrayerTimesView does
    hasLocation.value = prayerTimesService.hasLocation()

    if (!hasLocation.value) {
      qiblaInfo.value.hasLocation = false
      isLoading.value = false
      return
    }

    // Get location from prayerTimesService directly
    const settings = prayerTimesService.getSettings()
    const latitude = settings.location.latitude
    const longitude = settings.location.longitude
    const locationName = settings.locationName

    // Calculate Qibla direction
    const qiblaDirection = qiblaService.calculateQiblaDirection(latitude, longitude)
    const distanceToKaaba = qiblaService.calculateDistanceToKaaba(latitude, longitude)
    const cardinalDirection = qiblaService.getCardinalDirection(qiblaDirection)
    const isAtKaaba = distanceToKaaba < 1

    qiblaInfo.value = {
      hasLocation: true,
      qiblaDirection: Math.round(qiblaDirection * 10) / 10,
      distanceToKaaba,
      cardinalDirection,
      locationName,
      isAtKaaba,
      latitude,
      longitude
    }

    if (qiblaInfo.value.isAtKaaba) {
      isLoading.value = false
      return
    }

    // Check compass availability
    const hasCompass = await qiblaService.isCompassAvailable()

    if (!hasCompass) {
      compassError.value = 'Your device does not have a compass sensor, or compass access was denied. The Qibla direction is shown below based on your location.'
      isLoading.value = false
      return
    }

    // Start compass
    startCompassWatch()
  } catch (e) {
    console.error('Error initializing Qibla:', e)
    compassError.value = 'Failed to initialize compass. Please try again.'
  } finally {
    isLoading.value = false
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (stopCompass) {
    stopCompass()
    stopCompass = null
  }
})

// Start watching compass
const startCompassWatch = () => {
  stopCompass = qiblaService.startCompass(
    (heading) => {
      compassActive.value = true
      deviceHeading.value = heading.magneticHeading
      calibrationNeeded.value = heading.calibrationNeeded

      // Show calibration guide on first detection of low accuracy
      if (heading.calibrationNeeded && !showCalibrationGuide.value && calibrationNeeded.value === false) {
        // First time detecting calibration needed
        showCalibrationGuide.value = true
      }
    },
    (error) => {
      console.error('Compass error:', error)
      compassError.value = 'Compass error occurred. The static Qibla direction is shown below.'
      compassActive.value = false
    },
    { frequency: 100 }
  )
}

// Navigation
const goBack = () => {
  router.back()
}

const goToSettings = () => {
  router.push('/settings')
}
</script>
