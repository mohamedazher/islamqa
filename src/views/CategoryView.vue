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
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <Icon name="folder" size="md" />
            Subcategories
          </h3>
          <div class="grid grid-cols-1 gap-3">
            <div
              v-for="subcat in subcategories"
              :key="subcat.id"
              @click="selectCategory(subcat)"
              class="bg-white dark:bg-neutral-800 rounded-lg shadow dark:shadow-neutral-900/50 p-4 cursor-pointer transition-all hover:shadow-md dark:hover:shadow-neutral-900 active:bg-primary-50 dark:active:bg-primary-900/20"
            >
              <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 break-words">{{ subcat.category_links }}</h4>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1 truncate">{{ subcategorySummaries[subcat.element] || 'Loading...' }}</p>
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
