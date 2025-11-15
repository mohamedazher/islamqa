<template>
  <!-- Desktop Card (Google I/O Style) -->
  <div
    @click="$emit('click')"
    class="hidden md:block cursor-pointer border border-neutral-200 dark:border-neutral-700/50 rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group islamic-hero-pattern"
    :class="gradientClass"
  >
    <div class="flex flex-col h-full">
      <!-- Gradient Icon Section -->
      <div class="flex min-h-[180px] h-[180px] items-center justify-center p-8 relative overflow-hidden z-10">
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
          <!-- UPDATED: Changed category_links to title (new data structure) -->
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 text-center line-clamp-2 h-[54px] flex items-center justify-center">
            {{ category.title || category.category_links }}
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
          class="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl relative overflow-hidden islamic-hero-pattern"
          :class="gradientClass"
        >
          <div class="absolute inset-0 opacity-20 bg-white/20"></div>
          <span class="relative z-10">{{ categoryIcon }}</span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- UPDATED: Changed category_links to title (new data structure) -->
        <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-base mb-1 line-clamp-2">
          {{ category.title || category.category_links }}
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
    // UPDATED: Changed to use reference instead of element
    const [subcats, questions] = await Promise.all([
      dataStore.getCategoriesByParent(props.category.reference),
      dataStore.getQuestionsByCategory(props.category.reference)
    ])
    subcategoryCount.value = subcats.length
    questionCount.value = questions.length
  } catch (error) {
    console.error('Error loading category counts:', error)
  }
})

const categoryIcon = computed(() => {
  // UPDATED: Changed category_links to title (new data structure)
  // Map categories to icons for better visual hierarchy
  const name = (props.category.title || props.category.category_links || '').toLowerCase()

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

// Beautiful pastel gradient classes (Islamic architecture inspired)
const gradientClass = computed(() => {
  const gradients = [
    // Golden to Olive (primary brand colors - mosque domes)
    'bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 dark:from-primary-600 dark:via-accent-600 dark:to-accent-700',
    // Persian Blue (inspired by Persian tiles)
    'bg-gradient-to-br from-persian-400 via-persian-500 to-persian-600 dark:from-persian-600 dark:via-persian-700 dark:to-persian-800',
    // Turquoise (Moroccan zellige)
    'bg-gradient-to-br from-turquoise-400 via-turquoise-500 to-turquoise-600 dark:from-turquoise-600 dark:via-turquoise-700 dark:to-turquoise-800',
    // Burgundy to Rose (Ottoman palaces)
    'bg-gradient-to-br from-burgundy-400 via-burgundy-500 to-rose-500 dark:from-burgundy-600 dark:via-burgundy-700 dark:to-rose-700',
    // Amber to Gold (warm gold - Islamic calligraphy)
    'bg-gradient-to-br from-amber-400 via-primary-400 to-primary-500 dark:from-amber-600 dark:via-primary-600 dark:to-primary-700',
    // Turquoise to Teal (Turkish ceramics)
    'bg-gradient-to-br from-turquoise-400 via-teal-400 to-persian-500 dark:from-turquoise-600 dark:via-teal-600 dark:to-persian-700',
    // Persian Blue to Purple (royal)
    'bg-gradient-to-br from-persian-400 via-purple-400 to-indigo-500 dark:from-persian-500 dark:via-purple-600 dark:to-indigo-700',
    // Olive to Emerald (nature - Islamic gardens)
    'bg-gradient-to-br from-accent-400 via-emerald-400 to-teal-500 dark:from-accent-600 dark:via-emerald-600 dark:to-teal-700',
  ]

  // UPDATED: Changed to use reference instead of element
  // Use category ID to consistently assign same gradient
  const index = props.category.reference % gradients.length
  return gradients[index]
})
</script>
