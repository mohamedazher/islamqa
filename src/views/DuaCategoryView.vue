<template>
  <div class="dua-reader min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
    <!-- Header with Progress -->
    <div
      class="text-white px-4 pt-4 pb-3 sticky top-0 z-10"
      :class="headerGradient"
    >
      <div class="flex items-center justify-between mb-3">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <div class="text-center flex-1 mx-4">
          <h1 class="text-base font-semibold truncate">{{ category?.title }}</h1>
        </div>
        <div class="flex items-center gap-1">
          <button @click="handleShareDua" class="p-2 rounded-lg hover:bg-white/10">
            <Icon name="share" size="md" class="text-white" />
          </button>
          <button @click="showSettings = true" class="p-2 -mr-2 rounded-lg hover:bg-white/10">
            <Icon name="settings" size="md" class="text-white" />
          </button>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <div class="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              class="h-full bg-white transition-all duration-300 ease-out"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>
        <span class="text-sm font-medium whitespace-nowrap">{{ currentScrollIndex + 1 }}/{{ totalDuas }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="duaStore.isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-neutral-600 dark:text-neutral-400">Loading duas...</p>
      </div>
    </div>

    <!-- Completion Screen -->
    <div v-else-if="showCompletion" class="flex-1 flex items-center justify-center p-6">
      <div class="text-center max-w-sm">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Masha'Allah!</h2>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6">
          You've completed all {{ totalDuas }} duas in {{ category?.title }}
        </p>
        <div class="space-y-3">
          <button
            @click="restartFromBeginning"
            class="w-full py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition"
          >
            Start Again
          </button>
          <button
            @click="$router.back()"
            class="w-full py-3 px-6 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl transition"
          >
            Back to Categories
          </button>
        </div>
      </div>
    </div>

    <!-- Swipeable Dua Cards -->
    <div
      v-else-if="allDuas.length > 0"
      ref="cardsContainer"
      @scroll="handleScroll"
      class="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
      style="scroll-behavior: smooth"
    >
      <div class="flex h-full">
        <div
          v-for="(dua, index) in allDuas"
          :key="dua.id"
          class="flex-shrink-0 w-full snap-center px-3 py-4 overflow-y-auto"
        >
          <div class="max-w-2xl mx-auto space-y-4 pb-6">
            <!-- Title -->
            <div class="text-center">
              <h2 class="text-lg font-bold text-neutral-900 dark:text-white">{{ dua.title }}</h2>
              <p v-if="dua.title_ar" class="text-sm text-neutral-500 dark:text-neutral-400 mt-1" dir="rtl">
                {{ dua.title_ar }}
              </p>
            </div>

            <!-- Arabic Text Card with Counter & Reference -->
            <div class="relative bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 shadow-lg">
              <!-- Arabic Text -->
              <p
                class="text-center leading-loose text-neutral-900 dark:text-white font-arabic whitespace-pre-wrap break-words"
                dir="rtl"
                :style="{ fontSize: duaStore.settings.arabic_font_size + 'px', lineHeight: '2' }"
              >
                {{ dua.arabic }}
              </p>

              <!-- Reference & Counter Footer -->
              <div class="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <!-- Reference -->
                <div
                  v-if="dua.reference"
                  class="flex items-start gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 flex-1 min-w-0"
                >
                  <Icon name="book" size="sm" class="flex-shrink-0 mt-0.5" />
                  <span class="break-words">{{ dua.reference }}</span>
                </div>
                <div v-else class="flex-1"></div>

                <!-- Repetition Badge -->
                <div class="bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  {{ dua.repetitions || 1 }}×
                </div>
              </div>
            </div>

            <!-- Transliteration -->
            <div v-if="duaStore.settings.show_transliteration && dua.transliteration" class="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Transliteration</span>
              </div>
              <p
                class="text-neutral-700 dark:text-neutral-300 leading-relaxed text-center italic"
                :style="{ fontSize: duaStore.settings.transliteration_font_size + 'px' }"
              >
                {{ dua.transliteration }}
              </p>
            </div>

            <!-- Translation -->
            <div v-if="duaStore.settings.show_translation && dua.translation" class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700 shadow-sm">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Translation</span>
              </div>
              <p
                class="text-neutral-700 dark:text-neutral-300 leading-relaxed"
                :style="{ fontSize: duaStore.settings.translation_font_size + 'px' }"
              >
                {{ dua.translation }}
              </p>
            </div>

            <!-- Virtue/Benefit (Hidden for now) -->
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <Icon name="book" size="xl" class="text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
        <p class="text-neutral-500 dark:text-neutral-400">No duas found</p>
      </div>
    </div>

    <!-- Settings Modal -->
    <DuaQuickSettings
      v-if="showSettings"
      @close="showSettings = false"
      @update="updateSettings"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDuaStore } from '@/stores/dua'
import { shareDua } from '@/utils/sharing'
import confetti from 'canvas-confetti'
import Icon from '@/components/common/Icon.vue'
import DuaQuickSettings from '@/components/dua/DuaQuickSettings.vue'

const route = useRoute()
const duaStore = useDuaStore()

const showSettings = ref(false)
const showCompletion = ref(false)
const cardsContainer = ref(null)
const currentScrollIndex = ref(0)
const hasTriggeredConfetti = ref(false)

const category = computed(() => duaStore.currentCategory)
const allDuas = computed(() => duaStore.currentDuas)
const totalDuas = computed(() => allDuas.value.length)
const progressPercent = computed(() => {
  if (totalDuas.value === 0) return 0
  return ((currentScrollIndex.value + 1) / totalDuas.value) * 100
})

const headerGradient = computed(() => {
  if (category.value?.color) {
    return `bg-gradient-to-br ${category.value.color}`
  }
  return 'bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500'
})

// Confetti celebration function - subtle and brief
function triggerConfetti() {
  const colors = ['#10b981', '#14b8a6', '#06b6d4']

  // Single burst from center-top
  confetti({
    particleCount: 30,
    angle: 90,
    spread: 45,
    origin: { x: 0.5, y: 0.3 },
    colors: colors,
    ticks: 100,
    gravity: 1.2,
    scalar: 0.8
  })
}

// Watch for reaching the last card
watch(currentScrollIndex, (newIndex) => {
  if (newIndex === totalDuas.value - 1 && !hasTriggeredConfetti.value && totalDuas.value > 0) {
    hasTriggeredConfetti.value = true
    triggerConfetti()
  }
})

// Handle scroll to track current dua and snap to exact position
let scrollTimeout = null
let lastScrollLeft = 0
let lastScrollTime = 0
function handleScroll(e) {
  const container = e.target
  const scrollLeft = container.scrollLeft
  const cardWidth = container.offsetWidth
  const newIndex = Math.round(scrollLeft / cardWidth)

  if (newIndex !== currentScrollIndex.value && newIndex < totalDuas.value) {
    currentScrollIndex.value = newIndex
  }

  // Track scroll velocity to detect momentum end
  const now = Date.now()
  const timeDelta = now - lastScrollTime
  const scrollDelta = Math.abs(scrollLeft - lastScrollLeft)
  const velocity = scrollDelta / Math.max(timeDelta, 1)

  lastScrollLeft = scrollLeft
  lastScrollTime = now

  // Snap to exact position when scroll ends (use longer timeout for momentum)
  clearTimeout(scrollTimeout)
  const timeoutDuration = velocity > 0.05 ? 400 : 200
  scrollTimeout = setTimeout(() => {
    const snappedPosition = currentScrollIndex.value * cardWidth
    if (Math.abs(container.scrollLeft - snappedPosition) > 1) {
      container.scrollTo({
        left: snappedPosition,
        behavior: 'smooth'
      })
    }

    // Reset vertical scroll of all card containers to top
    const cardContainers = container.querySelectorAll('.overflow-y-auto')
    cardContainers.forEach(card => {
      card.scrollTop = 0
    })

    // Check if scrolled to last card (show completion)
    if (currentScrollIndex.value >= totalDuas.value - 1) {
      const isAtEnd = snappedPosition + cardWidth >= container.scrollWidth - 10
      if (isAtEnd && currentScrollIndex.value === totalDuas.value - 1) {
        // User is at the last card, confetti already triggered by watcher
      }
    }
  }, timeoutDuration)
}

// Scroll to specific index
function scrollToIndex(index) {
  if (cardsContainer.value) {
    const cardWidth = cardsContainer.value.offsetWidth
    cardsContainer.value.scrollLeft = index * cardWidth
    currentScrollIndex.value = index
  }
}

function restartFromBeginning() {
  showCompletion.value = false
  hasTriggeredConfetti.value = false
  scrollToIndex(0)
}

function updateSettings(newSettings) {
  duaStore.updateSettings(newSettings)
}

// Share current dua
async function handleShareDua() {
  const currentDuaData = allDuas.value[currentScrollIndex.value]
  if (currentDuaData) {
    try {
      await shareDua(currentDuaData)
    } catch (error) {
      console.error('Error sharing dua:', error)
    }
  }
}

onMounted(async () => {
  const categoryId = route.params.id
  if (duaStore.currentCategory?.id !== categoryId) {
    await duaStore.loadCategory(categoryId)
  }

  // Scroll to first card after data loads
  await nextTick()
  scrollToIndex(0)
  hasTriggeredConfetti.value = false
})
</script>

<style scoped>
.font-arabic {
  font-family: 'Amiri Quran', 'Scheherazade New', 'Traditional Arabic', 'Amiri', serif;
}

/* Hide scrollbar for swipeable cards */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Ensure smooth scroll snapping */
.snap-x {
  scroll-snap-type: x mandatory;
}

.snap-center {
  scroll-snap-align: center;
  scroll-snap-stop: always;
}

</style>
