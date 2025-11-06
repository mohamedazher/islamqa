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
        <div class="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center text-2xl lg:text-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-200">
          {{ categoryIcon }}
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-base lg:text-lg mb-1 line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
          {{ category.category_links }}
        </h3>
        <div class="flex items-center gap-3 text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">
          <span v-if="subcategoryCount > 0" class="flex items-center gap-1">
            <Icon name="folder" size="sm" />
            {{ subcategoryCount }}
          </span>
          <span class="flex items-center gap-1">
            <Icon name="document" size="sm" />
            {{ questionCount }}
          </span>
        </div>
      </div>

      <!-- Arrow -->
      <div class="flex-shrink-0">
        <div class="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 flex items-center justify-center text-neutral-400 dark:text-neutral-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all group-hover:translate-x-1">
          <Icon name="chevronRight" size="md" />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import Card from '@/components/common/Card.vue'
import Icon from '@/components/common/Icon.vue'

const dataStore = useDataStore()

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const subcategoryCount = ref(0)
const questionCount = ref(0)

onMounted(async () => {
  try {
    const [subcats, questions] = await Promise.all([
      dataStore.getCategoriesByParent(props.category.element),
      dataStore.getQuestionsByCategory(props.category.element)
    ])
    subcategoryCount.value = subcats.length
    questionCount.value = questions.length
  } catch (error) {
    console.error('Error loading category counts:', error)
  }
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
