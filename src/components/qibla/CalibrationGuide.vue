<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    @click.self="$emit('dismiss')"
  >
    <div class="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
      <!-- Header -->
      <div class="bg-amber-500 dark:bg-amber-600 text-white p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="exclamation" size="lg" />
          </div>
          <div>
            <h3 class="font-bold text-lg">Calibration Needed</h3>
            <p class="text-amber-100 text-sm">Compass accuracy is low</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Figure-8 Animation -->
        <div class="flex justify-center mb-6">
          <div class="relative w-32 h-20">
            <!-- Figure-8 Path -->
            <svg viewBox="0 0 100 60" class="w-full h-full">
              <!-- Figure-8 shape -->
              <path
                d="M 25 30 C 25 10, 50 10, 50 30 C 50 50, 75 50, 75 30 C 75 10, 50 10, 50 30 C 50 50, 25 50, 25 30"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-dasharray="4 2"
                class="text-neutral-300 dark:text-neutral-600"
              />
              <!-- Animated dot -->
              <circle r="6" fill="currentColor" class="text-emerald-500 dark:text-emerald-400">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path="M 25 30 C 25 10, 50 10, 50 30 C 50 50, 75 50, 75 30 C 75 10, 50 10, 50 30 C 50 50, 25 50, 25 30"
                />
              </circle>
            </svg>
            <!-- Phone icon in center -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 24 24" class="w-8 h-8 text-neutral-400 dark:text-neutral-500" fill="currentColor">
                <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="space-y-3 text-center">
          <p class="text-neutral-700 dark:text-neutral-300 font-medium">
            Move your phone in a figure-8 pattern
          </p>
          <p class="text-neutral-500 dark:text-neutral-400 text-sm">
            This helps calibrate the compass sensor for accurate Qibla direction.
          </p>
        </div>

        <!-- Tips -->
        <div class="mt-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
          <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 text-sm mb-2">Tips:</h4>
          <ul class="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-0.5">•</span>
              <span>Move slowly and smoothly</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-0.5">•</span>
              <span>Keep away from metal objects</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-0.5">•</span>
              <span>Try outdoors for best accuracy</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          @click="$emit('dismiss')"
          class="w-full py-3 bg-emerald-500 dark:bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/common/Icon.vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits(['dismiss'])
</script>
