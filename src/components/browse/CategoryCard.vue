<template>
  <!-- Desktop Card (Google I/O Style) -->
  <div
    @click="$emit('click')"
    class="hidden md:block cursor-pointer border border-neutral-200 dark:border-neutral-700/50 rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group"
    :class="gradientClass"
  >
    <div class="flex flex-col h-full">
      <!-- Gradient Icon Section -->
      <div class="flex min-h-[180px] h-[180px] items-center justify-center p-8 relative overflow-hidden">
        <!-- Decorative Elements -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div class="text-7xl relative z-10 group-hover:scale-110 transition-transform duration-300">
          {{ categoryIcon }}
        </div>
      </div>

      <!-- White Content Section -->
      <div class="p-1 w-full">
        <div class="bg-white dark:bg-neutral-900 rounded-b-[20px] px-6 py-5 min-h-[120px] flex flex-col justify-between">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 text-center line-clamp-2 h-[54px] flex items-center justify-center">
            {{ category.category_links }}
          </h3>
          <div class="flex items-center justify-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
            <span v-if="subcategoryCount > 0" class="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full">
              <Icon name="folder" size="xs" />
              <span class="font-medium">{{ subcategoryCount }}</span>
            </span>
            <span class="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full">
              <Icon name="document" size="xs" />
              <span class="font-medium">{{ questionCount }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Card (Compact Version) -->
  <div
    @click="$emit('click')"
    class="md:hidden cursor-pointer border border-neutral-200 dark:border-neutral-700/50 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 p-4 backdrop-blur-md transition-all duration-300 hover:shadow-xl active:scale-95"
  >
    <div class="flex items-center gap-4">
      <!-- Icon with Gradient -->
      <div class="flex-shrink-0">
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl relative overflow-hidden"
          :class="gradientClass"
        >
          <div class="absolute inset-0 opacity-20 bg-white/20"></div>
          <span class="relative z-10">{{ categoryIcon }}</span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-base mb-1 line-clamp-2">
          {{ category.category_links }}
        </h3>
        <div class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span v-if="subcategoryCount > 0" class="flex items-center gap-1">
            <Icon name="folder" size="xs" />
            {{ subcategoryCount }}
          </span>
          <span class="flex items-center gap-1">
            <Icon name="document" size="xs" />
            {{ questionCount }}
          </span>
        </div>
      </div>

      <!-- Arrow -->
      <div class="flex-shrink-0">
        <Icon name="chevronRight" size="md" class="text-neutral-400" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
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

  // Specific category matches
  if (name.includes('basic tenets') || name.includes('belief') || name.includes('faith')) return '✨'
  if (name.includes('principles of fiqh')) return '⚖️'
  if (name.includes('quran') || name.includes('qur')) return '📖'
  if (name.includes('knowledge') && name.includes('propagation')) return '💡'
  if (name.includes('hadith') || name.includes('hadeeth')) return '📜'
  if (name.includes('jihaad') || name.includes('jihad')) return '🛡️'
  if (name.includes('family')) return '👨‍👩‍👧‍👦'
  if (name.includes('history') || name.includes('biography')) return '📜'
  if (name.includes('enjoining') || name.includes('forbidding')) return '✋'
  if (name.includes('pedagogy') || name.includes('education') || name.includes('upbringing')) return '🎓'
  if (name.includes('psychological') || name.includes('social problem')) return '💭'
  if (name.includes('politics') || name.includes('political')) return '🏛️'
  if (name.includes('etiquette') || name.includes('moral') || name.includes('heart-softener')) return '💝'

  // General category patterns
  if (name.includes('prayer') || name.includes('salah')) return '🤲'
  if (name.includes('fasting') || name.includes('ramadan')) return '🌙'
  if (name.includes('hajj') || name.includes('pilgrimage')) return '🕋'
  if (name.includes('zakat') || name.includes('charity')) return '💰'
  if (name.includes('marriage')) return '💑'
  if (name.includes('law') || name.includes('ruling')) return '⚖️'
  if (name.includes('business') || name.includes('transaction')) return '💼'

  return '📚'
})

// Beautiful pastel gradient classes (Google I/O inspired)
const gradientClass = computed(() => {
  const gradients = [
    // Emerald to Teal (primary colors)
    'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 dark:from-emerald-500 dark:via-teal-500 dark:to-cyan-600',
    // Yellow to Orange (warm)
    'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 dark:from-yellow-500 dark:via-orange-500 dark:to-red-500',
    // Lime to Green (fresh)
    'bg-gradient-to-br from-lime-400 via-green-400 to-emerald-500 dark:from-lime-500 dark:via-green-500 dark:to-emerald-600',
    // Pink to Purple (vibrant)
    'bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 dark:from-pink-500 dark:via-purple-500 dark:to-indigo-600',
    // Blue to Cyan (cool)
    'bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-600',
    // Orange to Pink (sunset)
    'bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 dark:from-orange-500 dark:via-rose-500 dark:to-pink-600',
    // Purple to Blue (royal)
    'bg-gradient-to-br from-purple-400 via-blue-400 to-cyan-500 dark:from-purple-500 dark:via-blue-500 dark:to-cyan-600',
    // Green to Yellow (nature)
    'bg-gradient-to-br from-green-400 via-lime-400 to-yellow-400 dark:from-green-500 dark:via-lime-500 dark:to-yellow-500',
  ]

  // Use category ID to consistently assign same gradient
  const index = props.category.element % gradients.length
  return gradients[index]
})
</script>
