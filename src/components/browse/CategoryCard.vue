<template>
  <Card
    clickable
    padding="md"
    class="group"
    @click="$emit('click')"
  >
    <div class="flex items-center gap-4">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <div class="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-2xl lg:text-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-200">
          {{ categoryIcon }}
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-neutral-900 text-base lg:text-lg mb-1 line-clamp-2 group-hover:text-primary-700 transition-colors">
          {{ category.category_links }}
        </h3>
        <div class="flex items-center gap-3 text-xs lg:text-sm text-neutral-600">
          <span v-if="subcategoryCount > 0" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {{ subcategoryCount }}
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ questionCount }}
          </span>
        </div>
      </div>

      <!-- Arrow -->
      <div class="flex-shrink-0">
        <div class="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-primary-100 flex items-center justify-center text-neutral-400 group-hover:text-primary-600 transition-all group-hover:translate-x-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'
import Card from '@/components/common/Card.vue'

const dataStore = useDataStore()

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const subcategoryCount = computed(() => {
  return dataStore.getCategoriesByParent(props.category.element).length
})

const questionCount = computed(() => {
  return dataStore.getQuestionsByCategory(props.category.element).length
})

const categoryIcon = computed(() => {
  // Map categories to icons for better visual hierarchy
  const name = props.category.category_links.toLowerCase()
  if (name.includes('prayer') || name.includes('salah')) return '🤲'
  if (name.includes('fasting') || name.includes('ramadan')) return '🌙'
  if (name.includes('hajj') || name.includes('pilgrimage')) return '🕋'
  if (name.includes('zakat') || name.includes('charity')) return '💰'
  if (name.includes('marriage') || name.includes('family')) return '💑'
  if (name.includes('quran') || name.includes('qur')) return '📖'
  if (name.includes('hadith') || name.includes('hadeeth')) return '📜'
  if (name.includes('belief') || name.includes('faith')) return '✨'
  if (name.includes('law') || name.includes('ruling')) return '⚖️'
  if (name.includes('business') || name.includes('transaction')) return '💼'
  return '📚'
})
</script>
