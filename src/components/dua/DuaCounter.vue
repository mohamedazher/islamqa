<template>
  <div class="flex flex-col items-center gap-4 py-4">
    <!-- Circle Counter -->
    <div class="relative w-32 h-32">
      <!-- Background circle -->
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          stroke-width="8"
          class="text-neutral-200 dark:text-neutral-700"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          stroke-width="8"
          class="text-primary-500 transition-all duration-300"
          :style="{ strokeDasharray: `${circumference}px`, strokeDashoffset: `${offset}px` }"
          stroke-linecap="round"
        />
      </svg>

      <!-- Center text -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-3xl font-bold text-primary-500">{{ remaining }}</span>
        <span class="text-xs text-neutral-500 dark:text-neutral-400">remaining</span>
      </div>
    </div>

    <!-- Control Buttons -->
    <div class="flex gap-3">
      <button
        @click="decrement"
        :disabled="remaining === repetitions"
        class="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 dark:text-neutral-300 font-bold text-lg transition"
      >
        −
      </button>
      <button
        @click="reset"
        class="px-4 py-2 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold text-sm hover:bg-primary-200 dark:hover:bg-primary-800 transition"
      >
        Reset
      </button>
      <button
        @click="increment"
        :disabled="remaining === 0"
        class="w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition"
      >
        +
      </button>
    </div>

    <!-- Progress Text -->
    <p class="text-sm text-neutral-600 dark:text-neutral-400">
      Say this dua <span class="font-bold text-primary-500">{{ repetitions }}</span> time{{ repetitions !== 1 ? 's' : '' }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  repetitions: {
    type: Number,
    default: 1
  }
})

const remaining = ref(props.repetitions)
const circumference = 2 * Math.PI * 54

const offset = computed(() => {
  const progress = (props.repetitions - remaining.value) / props.repetitions
  return circumference * (1 - progress)
})

function increment() {
  if (remaining.value > 0) {
    remaining.value--
  }
}

function decrement() {
  if (remaining.value < props.repetitions) {
    remaining.value++
  }
}

function reset() {
  remaining.value = props.repetitions
}
</script>
