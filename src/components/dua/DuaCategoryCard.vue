<template>
  <!-- Card matching question CategoryCard mobile style -->
  <div
    @click="$emit('click')"
    class="group relative overflow-hidden bg-gradient-to-br rounded-xl shadow-md hover:shadow-xl dark:shadow-neutral-900/50 p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
    :class="gradientClass"
  >
    <!-- Decorative Circle -->
    <div class="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-white"></div>

    <div class="relative">
      <div class="flex items-start gap-3">
        <!-- Icon Container -->
        <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
          <span class="text-2xl">{{ category.icon || '📿' }}</span>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-white line-clamp-2 break-words mb-2 leading-snug">
            {{ category.title }}
          </h4>
          <p class="text-xs text-white/90 flex items-center gap-2">
            <span class="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {{ category.dua_count }} duas
            </span>
          </p>
        </div>

        <!-- Arrow -->
        <svg class="w-5 h-5 text-white/70 group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

// Beautiful gradient classes with dark mode support
const gradients = [
  // Yellow to Orange (warm)
  'from-yellow-400 via-orange-400 to-red-400 dark:from-yellow-500 dark:via-orange-500 dark:to-red-500',
  // Orange to Pink (sunset)
  'from-orange-400 via-rose-400 to-pink-500 dark:from-orange-500 dark:via-rose-500 dark:to-pink-600',
  // Pink to Purple (vibrant)
  'from-pink-400 via-purple-400 to-indigo-500 dark:from-pink-500 dark:via-purple-500 dark:to-indigo-600',
  // Purple to Blue (royal)
  'from-purple-400 via-blue-400 to-indigo-500 dark:from-purple-500 dark:via-blue-500 dark:to-indigo-600',
  // Blue to Cyan (ocean)
  'from-blue-400 via-cyan-400 to-teal-500 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-600',
  // Cyan to Green (fresh)
  'from-cyan-400 via-teal-400 to-green-500 dark:from-cyan-500 dark:via-teal-500 dark:to-green-600',
  // Green to Lime (nature)
  'from-green-400 via-lime-400 to-yellow-400 dark:from-green-500 dark:via-lime-500 dark:to-yellow-500',
  // Amber to Gold (warm gold)
  'from-amber-400 via-yellow-400 to-orange-400 dark:from-amber-500 dark:via-yellow-500 dark:to-orange-500',
  // Rose to Red (passionate)
  'from-rose-400 via-red-400 to-orange-500 dark:from-rose-500 dark:via-red-500 dark:to-orange-600',
  // Violet to Purple (royal)
  'from-violet-400 via-purple-400 to-fuchsia-500 dark:from-violet-500 dark:via-purple-500 dark:to-fuchsia-600',
  // Emerald to Teal (calm)
  'from-emerald-400 via-teal-400 to-cyan-500 dark:from-emerald-500 dark:via-teal-500 dark:to-cyan-600',
  // Fuchsia to Pink (bright)
  'from-fuchsia-400 via-pink-400 to-rose-500 dark:from-fuchsia-500 dark:via-pink-500 dark:to-rose-600',
  // Sky to Blue (serene)
  'from-sky-400 via-blue-400 to-indigo-500 dark:from-sky-500 dark:via-blue-500 dark:to-indigo-600',
  // Lime to Green (fresh)
  'from-lime-400 via-green-400 to-emerald-500 dark:from-lime-500 dark:via-green-500 dark:to-emerald-600',
  // Indigo to Violet (deep)
  'from-indigo-400 via-violet-400 to-purple-500 dark:from-indigo-500 dark:via-violet-500 dark:to-purple-600',
  // Teal to Cyan (cool)
  'from-teal-400 via-cyan-400 to-sky-500 dark:from-teal-500 dark:via-cyan-500 dark:to-sky-600',
]

// Simple hash function for consistent color assignment
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

const gradientClass = computed(() => {
  // Use numeric_id for consistent color per chapter
  const index = props.category.numeric_id
    ? props.category.numeric_id % gradients.length
    : hashString(props.category.title || '') % gradients.length
  return gradients[index]
})
</script>
