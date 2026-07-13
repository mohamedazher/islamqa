<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showOnboarding"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 dark:from-primary-900 dark:via-primary-950 dark:to-accent-900"
      >
        <!-- Onboarding Content -->
        <div class="relative w-full h-full flex flex-col">
          <!-- App Logo -->
          <div class="pt-6 sm:pt-8 flex justify-center">
            <img
              :src="`${publicBase}logo.png`"
              alt="BetterIslam Q&A"
              class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl"
            />
          </div>

          <!-- Slides Container -->
          <div class="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-y-auto">
            <div class="w-full max-w-2xl my-auto">
              <TransitionGroup name="slide-fade">
                <div
                  v-for="(slide, index) in slides"
                  v-show="currentSlide === index"
                  :key="slide.id"
                  class="text-center"
                >
                  <!-- Standard Info Slide -->
                  <template v-if="slide.type === 'info'">
                    <!-- Icon -->
                    <div class="mb-6 sm:mb-8 flex justify-center">
                      <div
                        class="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                        :class="pulseAnimation && currentSlide === index ? 'animate-pulse' : ''"
                      >
                        <Icon
                          :name="slide.icon"
                          class="text-white"
                          :class="slide.icon === 'lightning' || slide.icon === 'fire' ? 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20' : 'w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16'"
                        />
                      </div>
                    </div>

                    <!-- Title -->
                    <h2 class="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-3 sm:mb-4 md:mb-6 px-2">
                      {{ slide.title }}
                    </h2>

                    <!-- Description -->
                    <p class="text-sm sm:text-base md:text-xl text-white/90 leading-relaxed max-w-xl mx-auto px-4 sm:px-6">
                      {{ slide.description }}
                    </p>
                  </template>

                  <!-- Optional Leaderboard Identity -->
                  <template v-else-if="slide.type === 'leaderboard'">
                    <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 max-w-xl mx-auto">
                      <div class="mb-4 flex justify-center">
                        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center">
                          <Icon name="trophy" class="text-white w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                      </div>
                      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">{{ slide.title }}</h2>
                      <p class="text-xs sm:text-sm text-white/90 mb-5">{{ slide.description }}</p>

                      <div class="text-left space-y-2">
                        <label for="onboarding-display-name" class="block text-sm font-semibold text-white">Public display name</label>
                        <input
                          id="onboarding-display-name"
                          v-model="leaderboardName"
                          type="text"
                          maxlength="30"
                          autocomplete="nickname"
                          placeholder="For example: Amina"
                          class="w-full rounded-xl border border-white/30 bg-white px-4 py-3 text-neutral-900 outline-none focus:ring-4 focus:ring-white/30"
                          @input="leaderboardNameError = ''"
                        />
                        <p class="text-xs text-white/70">2–30 characters. Letters in any language, numbers, spaces, dots, underscores and hyphens are supported.</p>
                        <p v-if="leaderboardNameError" class="text-sm font-medium text-red-200">{{ leaderboardNameError }}</p>
                      </div>

                      <div class="mt-5 grid gap-2 sm:grid-cols-2">
                        <button
                          @click="chooseLeaderboard(true)"
                          :class="leaderboardChoice === 'join' ? 'bg-white text-primary-700 ring-4 ring-white/40' : 'bg-white/20 text-white hover:bg-white/30'"
                          class="rounded-xl px-4 py-3 font-semibold transition-all"
                        >
                          Join leaderboard
                        </button>
                        <button
                          @click="chooseLeaderboard(false)"
                          :class="leaderboardChoice === 'later' ? 'bg-white text-primary-700 ring-4 ring-white/40' : 'bg-white/20 text-white hover:bg-white/30'"
                          class="rounded-xl px-4 py-3 font-semibold transition-all"
                        >
                          Not now
                        </button>
                      </div>
                      <p class="mt-3 text-xs text-white/60">You can join, leave or rename yourself later in Settings.</p>
                    </div>
                  </template>

                  <!-- Privacy Consent Slide -->
                  <template v-else-if="slide.type === 'privacy'">
                    <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 max-w-xl mx-auto">
                      <!-- Icon -->
                      <div class="mb-4 sm:mb-6 flex justify-center">
                        <div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/20 flex items-center justify-center">
                          <Icon name="shield" class="text-white w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                        </div>
                      </div>

                      <!-- Title -->
                      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                        {{ slide.title }}
                      </h2>

                      <!-- Privacy Info -->
                      <div class="text-left space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-[40vh] sm:max-h-none overflow-y-auto px-1">
                        <div class="text-white/90 text-xs sm:text-sm md:text-base space-y-1.5 sm:space-y-2">
                          <p class="font-semibold">What we collect (optional):</p>
                          <ul class="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                            <li class="flex items-start gap-2">
                              <span class="text-white/60 flex-shrink-0">•</span>
                              <span>Anonymous usage patterns</span>
                            </li>
                            <li class="flex items-start gap-2">
                              <span class="text-white/60 flex-shrink-0">•</span>
                              <span>Firebase usage analytics</span>
                            </li>
                            <li class="flex items-start gap-2">
                              <span class="text-white/60 flex-shrink-0">•</span>
                              <span>Android interaction analytics through Microsoft Clarity</span>
                            </li>
                          </ul>
                        </div>

                        <div class="text-white/90 text-xs sm:text-sm md:text-base space-y-1.5 sm:space-y-2">
                          <p class="font-semibold">Separate online features:</p>
                          <ul class="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                            <li class="flex items-start gap-2">
                              <span class="text-red-300 flex-shrink-0">✗</span>
                              <span>Ask Islam sends a query only after you enable semantic search</span>
                            </li>
                            <li class="flex items-start gap-2">
                              <span class="text-red-300 flex-shrink-0">✗</span>
                              <span>Prayer location sends coordinates only after you approve place-name lookup</span>
                            </li>
                            <li class="flex items-start gap-2">
                              <span class="text-red-300 flex-shrink-0">✗</span>
                              <span>Leaderboard and feedback clearly disclose their uploads before use</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <!-- Privacy Choice -->
                      <div class="space-y-2 sm:space-y-3">
                        <button
                          @click="handlePrivacyAccept"
                          :class="privacyChoice === 'accept' ? 'bg-white text-primary-700 ring-4 ring-white/50' : 'bg-white/20 text-white hover:bg-white/30'"
                          class="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Icon :name="privacyChoice === 'accept' ? 'check' : 'shield'" size="sm" />
                          Accept Analytics
                        </button>

                        <button
                          @click="handlePrivacyReject"
                          :class="privacyChoice === 'reject' ? 'bg-white text-primary-700 ring-4 ring-white/50' : 'bg-white/20 text-white hover:bg-white/30'"
                          class="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Icon :name="privacyChoice === 'reject' ? 'check' : 'xCircle'" size="sm" />
                          Decline Analytics
                        </button>
                      </div>

                      <p class="text-xs text-white/60 mt-3 sm:mt-4">
                        You can change this anytime in Settings
                      </p>
                    </div>
                  </template>

                  <!-- Data Import Slide -->
                  <template v-else-if="slide.type === 'import'">
                    <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 max-w-xl mx-auto">
                      <!-- Icon -->
                      <div class="mb-4 sm:mb-6 flex justify-center">
                        <div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/20 flex items-center justify-center">
                          <Icon
                            name="download"
                            class="text-white w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                            :class="isImporting ? 'animate-pulse' : ''"
                          />
                        </div>
                      </div>

                      <!-- Title -->
                      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                        {{ importComplete ? 'Setup Complete!' : isImporting ? 'Importing Data...' : slide.title }}
                      </h2>

                      <!-- Import Info (Before Import) -->
                      <div v-if="!isImporting && !importComplete" class="text-white/90 space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <p class="text-xs sm:text-sm md:text-base">
                          {{ slide.description }}
                        </p>
                        <div class="bg-white/10 rounded-lg p-3 sm:p-4 text-xs sm:text-sm space-y-1.5 sm:space-y-2">
                          <div class="flex items-center gap-2">
                            <Icon name="book" size="sm" class="text-white/80 flex-shrink-0" />
                            <span><strong>15000+</strong> Islamic Q&A items</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <Icon name="collection" size="sm" class="text-white/80 flex-shrink-0" />
                            <span><strong>269</strong> Categories</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <Icon name="download" size="sm" class="text-white/80 flex-shrink-0" />
                            <span><strong>~50MB</strong> database size</span>
                          </div>
                        </div>
                      </div>

                      <!-- Import Progress -->
                      <div v-if="isImporting" class="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <p class="text-white/90 text-xs sm:text-sm">{{ importStep }}</p>
                        <div class="bg-white/20 rounded-full h-2.5 sm:h-3 overflow-hidden">
                          <div
                            class="bg-white h-full transition-all duration-300"
                            :style="{ width: importProgress + '%' }"
                          ></div>
                        </div>
                        <p class="text-white/80 text-sm sm:text-base font-semibold">{{ Math.round(importProgress) }}%</p>
                        <p class="text-xs text-white/60">
                          Please don't refresh or close during import
                        </p>
                      </div>

                      <!-- Import Complete -->
                      <div v-if="importComplete" class="text-white/90 space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <div class="flex justify-center mb-3 sm:mb-4">
                          <Icon name="check" class="text-white w-12 h-12 sm:w-16 sm:h-16" />
                        </div>
                        <p class="text-sm sm:text-base md:text-lg">
                          All set! You're ready to explore Islamic knowledge offline.
                        </p>
                      </div>

                      <!-- Error Message -->
                      <div v-if="importError" class="bg-red-500/20 border border-red-300/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                        <p class="text-white text-xs sm:text-sm">{{ importError }}</p>
                      </div>
                    </div>
                  </template>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- Navigation -->
          <div class="pb-6 sm:pb-8 md:pb-12 px-4 sm:px-6">
            <div class="max-w-2xl mx-auto">
              <!-- Progress Dots -->
              <div class="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 md:mb-8 px-2">
                <button
                  v-for="(slide, index) in slides"
                  :key="slide.id"
                  @click="goToSlide(index)"
                  class="transition-all duration-300 flex-shrink-0"
                  :class="[
                    currentSlide === index
                      ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-white rounded-full'
                      : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/60 rounded-full'
                  ]"
                  :aria-label="`Go to slide ${index + 1}`"
                />
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-between gap-2 sm:gap-4">
                <!-- Previous Button -->
                <button
                  v-if="currentSlide > 0 && !isImporting"
                  @click="previousSlide"
                  class="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-white/90 hover:text-white font-medium transition-colors text-sm sm:text-base"
                >
                  <Icon name="arrowLeft" size="sm" />
                  <span class="hidden sm:inline">Previous</span>
                </button>
                <div v-else class="w-10 sm:w-20"></div>

                <!-- Next/Action Button -->
                <button
                  v-if="currentSlideData.type !== 'import' || importComplete"
                  @click="handleNextAction"
                  :disabled="(currentSlideData.type === 'privacy' && !privacyChoice) || (currentSlideData.type === 'leaderboard' && !leaderboardChoice)"
                  class="flex items-center gap-1.5 sm:gap-2 px-5 sm:px-8 py-3 sm:py-4 bg-white text-primary-700 dark:text-primary-800 rounded-xl font-bold text-base sm:text-lg hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{{ getButtonText() }}</span>
                  <Icon :name="isLastSlide && importComplete ? 'check' : 'arrowRight'" size="md" />
                </button>

                <!-- Import Button (on import slide before starting) -->
                <button
                  v-if="currentSlideData.type === 'import' && !isImporting && !importComplete"
                  @click="startImport"
                  class="flex items-center gap-1.5 sm:gap-2 px-5 sm:px-8 py-3 sm:py-4 bg-white text-primary-700 dark:text-primary-800 rounded-xl font-bold text-base sm:text-lg hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <span>Start Import</span>
                  <Icon name="download" size="md" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Decorative Elements -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <!-- Gradient Orbs -->
          <div class="absolute top-1/4 -left-32 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl"></div>
          <div class="absolute bottom-1/4 -right-32 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Icon from './Icon.vue'
import { getOnboardingSlides, completeOnboarding, skipOnboarding } from '@/services/onboarding'
import { usePrivacyConsent, updateConsent } from '@/services/privacyConsent'
import { saveChosenDisplayName } from '@/services/leaderboardService'
import dataLoader from '@/services/dataLoader'
import { useDataStore } from '@/stores/data'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const publicBase = import.meta.env.BASE_URL

const emit = defineEmits(['update:modelValue', 'complete', 'skip'])

const showOnboarding = ref(props.modelValue)
const currentSlide = ref(0)
const pulseAnimation = ref(true)
const slides = getOnboardingSlides()

// Privacy consent
const { acceptAll, rejectAll } = usePrivacyConsent()
const privacyChoice = ref(null)
const leaderboardChoice = ref(null)
const leaderboardName = ref(localStorage.getItem('username') || '')
const leaderboardNameError = ref('')

// Data import
const dataStore = useDataStore()
const isImporting = ref(false)
const importProgress = ref(0)
const importStep = ref('')
const importError = ref('')
const importComplete = ref(false)

const isLastSlide = computed(() => currentSlide.value === slides.length - 1)
const currentSlideData = computed(() => slides[currentSlide.value])

// Watch for prop changes from parent
watch(() => props.modelValue, (newValue) => {
  showOnboarding.value = newValue
  // Reset to first slide when reopening
  if (newValue) {
    currentSlide.value = 0
  }
})

function nextSlide() {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
    resetPulse()
  }
}

function previousSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
    resetPulse()
  }
}

function goToSlide(index) {
  currentSlide.value = index
  resetPulse()
}

function resetPulse() {
  pulseAnimation.value = false
  setTimeout(() => {
    pulseAnimation.value = true
  }, 50)
}

function getButtonText() {
  if (currentSlideData.value.type === 'privacy') {
    return privacyChoice.value ? 'Continue' : 'Choose One'
  }
  if (currentSlideData.value.type === 'leaderboard') {
    return leaderboardChoice.value ? 'Continue' : 'Choose One'
  }
  if (isLastSlide.value && importComplete.value) {
    return 'Get Started'
  }
  return 'Next'
}

function chooseLeaderboard(join) {
  if (join) {
    try {
      leaderboardName.value = saveChosenDisplayName(leaderboardName.value)
      updateConsent('leaderboard', true)
      leaderboardChoice.value = 'join'
      leaderboardNameError.value = ''
    } catch (error) {
      leaderboardChoice.value = null
      leaderboardNameError.value = error.message
    }
  } else {
    updateConsent('leaderboard', false)
    leaderboardChoice.value = 'later'
    leaderboardNameError.value = ''
  }
}

function handleNextAction() {
  if (isLastSlide.value && importComplete.value) {
    handleComplete()
  } else {
    nextSlide()
  }
}

// Privacy handlers
function handlePrivacyAccept() {
  privacyChoice.value = 'accept'
  acceptAll()
  if (leaderboardChoice.value === 'join') updateConsent('leaderboard', true)
  console.log('[Onboarding] User accepted analytics')
}

function handlePrivacyReject() {
  privacyChoice.value = 'reject'
  rejectAll()
  if (leaderboardChoice.value === 'join') updateConsent('leaderboard', true)
  console.log('[Onboarding] User declined analytics')
}

// Data import handler
async function startImport() {
  isImporting.value = true
  importError.value = ''
  importProgress.value = 0

  try {
    console.log('📥 Starting data import from onboarding...')

    // Check if already imported
    const alreadyImported = await dataLoader.isDataImported()
    if (alreadyImported) {
      console.log('✅ Data already imported, skipping...')
      importProgress.value = 100
      importComplete.value = true
      return
    }

    // Import data with progress tracking
    await dataLoader.loadAndImport((progressInfo) => {
      importStep.value = progressInfo.step
      importProgress.value = progressInfo.progress
    })

    importProgress.value = 100
    importStep.value = 'Import complete!'
    importComplete.value = true
    console.log('✅ Import finished from onboarding')

    // Initialize data store after import
    await dataStore.initialize()
    console.log('✅ Data store initialized')
  } catch (err) {
    console.error('❌ Import failed:', err)
    importError.value = err.message || 'Import failed. Please try again.'
    isImporting.value = false
  }
}

function handleComplete() {
  completeOnboarding()
  emit('complete')
  close()
}

function handleSkip() {
  skipOnboarding()
  emit('skip')
  close()
}

function close() {
  showOnboarding.value = false
  emit('update:modelValue', false)
}

// Prevent page refresh/close during import
function handleBeforeUnload(e) {
  if (isImporting.value) {
    e.preventDefault()
    e.returnValue = 'Import is in progress. Are you sure you want to leave? Your data will be lost.'
    return 'Import is in progress. Are you sure you want to leave? Your data will be lost.'
  }
}

// Keyboard navigation
function handleKeydown(e) {
  if (!showOnboarding.value) return

  if (e.key === 'ArrowRight') {
    nextSlide()
  } else if (e.key === 'ArrowLeft') {
    previousSlide()
  } else if (e.key === 'Enter' && isLastSlide.value && importComplete.value) {
    handleComplete()
  }
  // Escape key skip removed - onboarding is mandatory
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  // Ensure import flag is reset
  isImporting.value = false
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Touch-friendly buttons on mobile */
@media (max-width: 640px) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>
