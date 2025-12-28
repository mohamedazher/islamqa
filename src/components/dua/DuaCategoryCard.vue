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
      <div class="mb-1 text-white/80">
        <Icon :name="category.icon || 'book'" size="lg" />
      </div>
      <h3 class="text-white font-bold text-lg leading-tight">{{ category.title }}</h3>
      <p class="text-white/70 text-xs mt-1">{{ category.dua_count }} duas</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const gradientClass = computed(() => {
  // Use color from category data if available
  if (props.category.color) {
    return `bg-gradient-to-br ${props.category.color}`
  }

  // Fallback color map for categories without color field
  const colorMap = {
    'morning': 'bg-gradient-to-br from-amber-400 to-orange-500',
    'evening': 'bg-gradient-to-br from-orange-400 to-rose-500',
    'before-sleep': 'bg-gradient-to-br from-indigo-500 to-purple-600',
    'salah': 'bg-gradient-to-br from-green-400 to-emerald-500',
    'after-salah': 'bg-gradient-to-br from-teal-400 to-cyan-500',
    'ruqyah-illness': 'bg-gradient-to-br from-lime-400 to-green-500',
    'praises-allah': 'bg-gradient-to-br from-yellow-400 to-amber-500',
    'salawat': 'bg-gradient-to-br from-rose-400 to-pink-500',
    'quranic-duas': 'bg-gradient-to-br from-blue-400 to-indigo-500',
    'sunnah-duas': 'bg-gradient-to-br from-purple-400 to-violet-500',
    'names-allah': 'bg-gradient-to-br from-fuchsia-400 to-rose-500',
    'dhikr-all-times': 'bg-gradient-to-br from-sky-400 to-blue-500',
    'istighfar': 'bg-gradient-to-br from-orange-400 to-red-500',
    'waking-up': 'bg-gradient-to-br from-sky-400 to-blue-500',
    'nightmares': 'bg-gradient-to-br from-slate-500 to-gray-600',
    'clothes': 'bg-gradient-to-br from-purple-400 to-indigo-500',
    'lavatory-wudu': 'bg-gradient-to-br from-cyan-400 to-blue-500',
    'home': 'bg-gradient-to-br from-green-400 to-emerald-500',
    'adhan-masjid': 'bg-gradient-to-br from-rose-400 to-pink-500',
    'istikhara': 'bg-gradient-to-br from-violet-400 to-purple-500',
    'gatherings': 'bg-gradient-to-br from-pink-400 to-rose-500',
    'food-drink': 'bg-gradient-to-br from-emerald-400 to-teal-500',
    'travel': 'bg-gradient-to-br from-blue-400 to-cyan-500',
    'death': 'bg-gradient-to-br from-gray-500 to-slate-600',
    'nature': 'bg-gradient-to-br from-green-500 to-emerald-600',
    'social-interactions': 'bg-gradient-to-br from-orange-400 to-amber-500',
    'protection-iman': 'bg-gradient-to-br from-red-400 to-rose-500',
    'difficulties-happiness': 'bg-gradient-to-br from-amber-500 to-orange-600',
    'hajj-umrah': 'bg-gradient-to-br from-green-500 to-teal-600',
    'money-shopping': 'bg-gradient-to-br from-yellow-500 to-amber-600',
    'marriage-children': 'bg-gradient-to-br from-red-400 to-pink-500'
  }
  return colorMap[props.category.id] || 'bg-gradient-to-br from-teal-400 to-cyan-500'
})
</script>
