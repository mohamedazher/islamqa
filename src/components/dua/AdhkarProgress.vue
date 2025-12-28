<template>
  <div class="adhkar-progress bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Today's Adhkar</h3>
      <div v-if="bothStreak > 0" class="flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
        <span>{{ bothStreak }}</span>
        <span>day streak</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <!-- Morning Adhkar -->
      <div
        @click="goToMorning"
        class="relative overflow-hidden rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.02]"
        :class="morningProgress.isComplete
          ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40'
          : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30'"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <span class="text-lg">{{ morningProgress.isComplete ? '✅' : '🌅' }}</span>
            <span class="text-sm font-medium text-neutral-800 dark:text-neutral-200">Morning</span>
          </div>
          <span v-if="morningStreak > 0" class="text-xs text-orange-600 dark:text-orange-400">
            {{ morningStreak }}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-1.5">
          <div
            class="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
            :style="{ width: `${morningProgress.percent}%` }"
          ></div>
        </div>

        <p class="text-xs text-neutral-600 dark:text-neutral-400">
          {{ morningProgress.completed }}/{{ morningProgress.total }} duas
        </p>
      </div>

      <!-- Evening Adhkar -->
      <div
        @click="goToEvening"
        class="relative overflow-hidden rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.02]"
        :class="eveningProgress.isComplete
          ? 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40'
          : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30'"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <span class="text-lg">{{ eveningProgress.isComplete ? '✅' : '🌙' }}</span>
            <span class="text-sm font-medium text-neutral-800 dark:text-neutral-200">Evening</span>
          </div>
          <span v-if="eveningStreak > 0" class="text-xs text-purple-600 dark:text-purple-400">
            {{ eveningStreak }}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-1.5">
          <div
            class="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
            :style="{ width: `${eveningProgress.percent}%` }"
          ></div>
        </div>

        <p class="text-xs text-neutral-600 dark:text-neutral-400">
          {{ eveningProgress.completed }}/{{ eveningProgress.total }} duas
        </p>
      </div>
    </div>

    <!-- Completion Message -->
    <div v-if="morningProgress.isComplete && eveningProgress.isComplete" class="mt-3 text-center">
      <p class="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
        Masha'Allah! Both adhkar complete today
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGamificationStore } from '@/stores/gamification'

const router = useRouter()
const gamificationStore = useGamificationStore()

const morningProgress = computed(() => gamificationStore.getMorningProgress())
const eveningProgress = computed(() => gamificationStore.getEveningProgress())
const morningStreak = computed(() => gamificationStore.morningStreak)
const eveningStreak = computed(() => gamificationStore.eveningStreak)
const bothStreak = computed(() => gamificationStore.bothStreak)

function goToMorning() {
  router.push('/dua/category/chapter_27_morning')
}

function goToEvening() {
  router.push('/dua/category/chapter_27_evening')
}
</script>
