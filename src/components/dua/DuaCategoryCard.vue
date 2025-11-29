<template>
  <div
    @click="$emit('click')"
    class="relative overflow-hidden rounded-2xl h-32 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    :class="gradientClass"
  >
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-20">
      <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white rounded-full"></div>
    </div>

    <!-- Content -->
    <div class="relative p-4 h-full flex flex-col justify-end">
      <div class="mb-1">
        <span class="text-2xl">{{ category.icon }}</span>
      </div>
      <h3 class="text-white font-bold text-lg leading-tight">{{ category.title }}</h3>
      <p class="text-white/70 text-xs mt-1">{{ category.dua_count }} duas</p>
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

const gradientClass = computed(() => {
  const colorMap = {
    'duas-ummah': 'bg-gradient-to-br from-rose-400 to-pink-500',
    'morning': 'bg-gradient-to-br from-amber-400 to-orange-500',
    'evening': 'bg-gradient-to-br from-orange-400 to-rose-500',
    'before-sleep': 'bg-gradient-to-br from-indigo-500 to-purple-600',
    'waking-up': 'bg-gradient-to-br from-sky-400 to-blue-500',
    'nightmares': 'bg-gradient-to-br from-slate-500 to-gray-600',
    'clothes': 'bg-gradient-to-br from-purple-400 to-indigo-500',
    'lavatory-wudu': 'bg-gradient-to-br from-cyan-400 to-blue-500',
    'food-drink': 'bg-gradient-to-br from-emerald-400 to-teal-500',
    'home': 'bg-gradient-to-br from-green-400 to-emerald-500',
    'adhan-masjid': 'bg-gradient-to-br from-rose-400 to-pink-500',
    'istikhara': 'bg-gradient-to-br from-violet-400 to-purple-500',
    'difficulties': 'bg-gradient-to-br from-amber-500 to-orange-600'
  }
  return colorMap[props.category.id] || 'bg-gradient-to-br from-primary-400 to-primary-600'
})
</script>
