<template>
  <div class="category-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 text-2xl hover:opacity-80 transition-opacity flex-shrink-0">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-lg md:text-xl font-bold line-clamp-2 break-words">{{ currentCategory?.category_links || 'Category' }}</h1>
        <p class="text-primary-100 dark:text-primary-200 text-xs md:text-sm truncate">{{ currentCategorySummary }}</p>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p class="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Subcategories Section -->
        <div v-if="subcategories.length > 0">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <Icon name="folder" size="md" class="text-primary-600 dark:text-primary-400" />
            Subcategories
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div
              v-for="(subcat, index) in subcategories"
              :key="subcat.id"
              @click="selectCategory(subcat)"
              class="group relative overflow-hidden bg-gradient-to-br rounded-xl shadow-md hover:shadow-xl dark:shadow-neutral-900/50 p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              :class="getCategoryGradient(index)"
            >
              <!-- Decorative Circle -->
              <div class="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-white"></div>

              <div class="relative">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon name="folder" size="lg" class="text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-white line-clamp-2 break-words mb-2 leading-snug">{{ subcat.category_links }}</h4>
                    <p class="text-xs text-white/90 flex items-center gap-2">
                      <span class="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">{{ subcategorySummaries[subcat.element] || 'Loading...' }}</span>
                    </p>
                  </div>
                  <Icon name="chevronRight" size="md" class="text-white/70 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Section -->
        <div v-if="categoryQuestions.length > 0">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <Icon name="document" size="md" />
            Questions
          </h3>
          <div class="grid grid-cols-1 gap-3">
            <QuestionListItem
              v-for="question in categoryQuestions"
              :key="question.id"
              :question="question"
              @click="selectQuestion(question)"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="subcategories.length === 0 && categoryQuestions.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="collection" size="xl" class="text-neutral-400 dark:text-neutral-600" />
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Content</h3>
          <p class="text-neutral-600 dark:text-neutral-400">This category has no subcategories or questions yet</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, reactive, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/data'
import Icon from '@/components/common/Icon.vue'
import QuestionListItem from '@/components/browse/QuestionListItem.vue'

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()

const currentCategory = ref(null)
const subcategories = ref([])
const categoryQuestions = ref([])
const isLoading = ref(true)
const currentCategorySummary = ref('')
const subcategorySummaries = reactive({})

// Helper function to generate summary text
function generateSummary(subcatsCount, questionsCount) {
  if (subcatsCount > 0) {
    return `${subcatsCount} subcategories • ${questionsCount} questions`
  }
  return `${questionsCount} questions`
}

// Function to load category by ID
const loadCategory = async () => {
  try {
    isLoading.value = true
    const categoryId = route.params.id

    // Load category
    currentCategory.value = await dataStore.getCategory(categoryId)

    if (currentCategory.value) {
      // Load subcategories and questions
      const [subcats, questions] = await Promise.all([
        dataStore.getCategoriesByParent(currentCategory.value.element),
        dataStore.getQuestionsByCategory(currentCategory.value.element)
      ])

      subcategories.value = subcats
      categoryQuestions.value = questions

      // Calculate current category summary
      currentCategorySummary.value = generateSummary(subcats.length, questions.length)

      // Load and cache summaries for all subcategories
      for (const subcat of subcats) {
        try {
          const [subSubcats, subQuestions] = await Promise.all([
            dataStore.getCategoriesByParent(subcat.element),
            dataStore.getQuestionsByCategory(subcat.element)
          ])
          subcategorySummaries[subcat.element] = generateSummary(subSubcats.length, subQuestions.length)
        } catch (error) {
          console.error(`Error loading summary for subcategory ${subcat.element}:`, error)
          subcategorySummaries[subcat.element] = 'Error loading'
        }
      }

      // Debug logging
      console.log('Category ID:', categoryId)
      console.log('Current Category:', currentCategory.value)
      console.log('Subcategories:', subcategories.value)
      console.log('Questions:', categoryQuestions.value)
    }
  } catch (error) {
    console.error('Error loading category:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadCategory)

// Watch for route changes to reload category when navigating between categories
watch(() => route.params.id, loadCategory)

// Get gradient color for category card (pastel colors)
function getCategoryGradient(index) {
  const gradients = [
    // Emerald to Teal
    'from-emerald-400 via-teal-400 to-cyan-500 dark:from-emerald-500 dark:via-teal-500 dark:to-cyan-600',
    // Yellow to Orange
    'from-yellow-400 via-orange-400 to-red-400 dark:from-yellow-500 dark:via-orange-500 dark:to-red-500',
    // Lime to Green
    'from-lime-400 via-green-400 to-emerald-500 dark:from-lime-500 dark:via-green-500 dark:to-emerald-600',
    // Pink to Purple
    'from-pink-400 via-purple-400 to-indigo-500 dark:from-pink-500 dark:via-purple-500 dark:to-indigo-600',
    // Blue to Cyan
    'from-blue-400 via-cyan-400 to-teal-500 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-600',
    // Orange to Pink
    'from-orange-400 via-rose-400 to-pink-500 dark:from-orange-500 dark:via-rose-500 dark:to-pink-600',
    // Purple to Blue
    'from-purple-400 via-blue-400 to-cyan-500 dark:from-purple-500 dark:via-blue-500 dark:to-cyan-600',
    // Green to Yellow
    'from-green-400 via-lime-400 to-yellow-400 dark:from-green-500 dark:via-lime-500 dark:to-yellow-500',
  ]
  return gradients[index % gradients.length]
}

function goBack() {
  router.back()
}

function selectCategory(category) {
  // Use element (actual category ID) not id (row number)
  router.push(`/category/${category.element}`)
}

function selectQuestion(question) {
  router.push(`/question/${question.id}`)
}

</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
