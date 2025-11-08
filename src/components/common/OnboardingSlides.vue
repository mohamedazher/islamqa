<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showOnboarding"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 dark:from-primary-900 dark:via-primary-950 dark:to-accent-900"
      >
        <!-- Onboarding Content -->
        <div class="relative w-full h-full flex flex-col">
          <!-- Skip Button -->
          <div class="absolute top-4 right-4 z-10">
            <button
              @click="handleSkip"
              class="px-4 py-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Skip
            </button>
          </div>

          <!-- Slides Container -->
          <div class="flex-1 flex items-center justify-center p-6 md:p-12">
            <div class="w-full max-w-2xl">
              <TransitionGroup name="slide-fade" mode="out-in">
                <div
                  v-for="(slide, index) in slides"
                  v-show="currentSlide === index"
                  :key="slide.id"
                  class="text-center"
                >
                  <!-- Icon -->
                  <div class="mb-8 flex justify-center">
                    <div
                      class="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                      :class="pulseAnimation && currentSlide === index ? 'animate-pulse' : ''"
                    >
                      <Icon
                        :name="slide.icon"
                        class="text-white"
                        :class="slide.icon === 'lightning' || slide.icon === 'fire' ? 'w-16 h-16 md:w-20 md:h-20' : 'w-12 h-12 md:w-16 md:h-16'"
                      />
                    </div>
                  </div>

                  <!-- Title -->
                  <h2 class="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
                    {{ slide.title }}
                  </h2>

                  <!-- Description -->
                  <p class="text-base md:text-xl text-white/90 leading-relaxed max-w-xl mx-auto px-4">
                    {{ slide.description }}
                  </p>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- Navigation -->
          <div class="pb-8 md:pb-12 px-6">
            <div class="max-w-2xl mx-auto">
              <!-- Progress Dots -->
              <div class="flex justify-center gap-2 mb-8">
                <button
                  v-for="(slide, index) in slides"
                  :key="slide.id"
                  @click="goToSlide(index)"
                  class="transition-all duration-300"
                  :class="[
                    currentSlide === index
                      ? 'w-8 h-2 bg-white rounded-full'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/60 rounded-full'
                  ]"
                  :aria-label="`Go to slide ${index + 1}`"
                />
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-between gap-4">
                <!-- Previous Button -->
                <button
                  v-if="currentSlide > 0"
                  @click="previousSlide"
                  class="flex items-center gap-2 px-6 py-3 text-white/90 hover:text-white font-medium transition-colors"
                >
                  <Icon name="arrowLeft" size="sm" />
                  <span class="hidden sm:inline">Previous</span>
                </button>
                <div v-else class="w-20"></div>

                <!-- Next/Get Started Button -->
                <button
                  @click="isLastSlide ? handleComplete() : nextSlide()"
                  class="flex items-center gap-2 px-8 py-4 bg-white text-primary-700 dark:text-primary-800 rounded-xl font-bold text-lg hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <span>{{ isLastSlide ? 'Get Started' : 'Next' }}</span>
                  <Icon :name="isLastSlide ? 'check' : 'arrowRight'" size="md" />
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

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'complete', 'skip'])

const showOnboarding = ref(props.modelValue)
const currentSlide = ref(0)
const pulseAnimation = ref(true)
const slides = getOnboardingSlides()

const isLastSlide = computed(() => currentSlide.value === slides.length - 1)

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

// Keyboard navigation
function handleKeydown(e) {
  if (!showOnboarding.value) return

  if (e.key === 'ArrowRight') {
    nextSlide()
  } else if (e.key === 'ArrowLeft') {
    previousSlide()
  } else if (e.key === 'Escape') {
    handleSkip()
  } else if (e.key === 'Enter' && isLastSlide.value) {
    handleComplete()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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
