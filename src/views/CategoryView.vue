<template>
  <div class="category-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 text-2xl hover:opacity-80 transition-opacity">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex-1">
        <h1 class="text-xl font-bold">{{ currentCategory?.category_links || 'Category' }}</h1>
        <p class="text-primary-100 dark:text-primary-200 text-sm">{{ currentCategory ? getContentSummary(currentCategory.element) : '' }}</p>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading State -->
      <div v-if="dataStore.isLoading" class="flex items-center justify-center h-64">
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
              <h4 class="font-semibold text-neutral-900 dark:text-neutral-100">{{ subcat.category_links }}</h4>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{{ getContentSummary(subcat.element) }}</p>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/data'
import Icon from '@/components/common/Icon.vue'
import QuestionListItem from '@/components/browse/QuestionListItem.vue'

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()

const currentCategory = ref(null)

const subcategories = computed(() => {
  if (!currentCategory.value) return []
  // Use element field, not id, for subcategories
  return dataStore.getCategoriesByParent(currentCategory.value.element)
})

const categoryQuestions = computed(() => {
  if (!currentCategory.value) return []
  // Use element field, not id, for questions
  return dataStore.getQuestionsByCategory(currentCategory.value.element)
})

// Function to load category by ID
const loadCategory = async () => {
  const categoryId = route.params.id

  // Load data if not loaded yet
  if (!dataStore.isLoaded) {
    await dataStore.loadData()
  }

  currentCategory.value = dataStore.getCategory(categoryId)

  // Debug logging
  console.log('Category ID:', categoryId)
  console.log('Current Category:', currentCategory.value)
  console.log('Subcategories:', subcategories.value)
  console.log('Questions:', categoryQuestions.value)
}

onMounted(loadCategory)

// Watch for route changes to reload category when navigating between categories
watch(() => route.params.id, loadCategory)

function goBack() {
  router.back()
}

function selectCategory(category) {
  router.push(`/category/${category.id}`)
}

function selectQuestion(question) {
  router.push(`/question/${question.id}`)
}

function getQuestionCount(categoryElement) {
  return dataStore.getQuestionsByCategory(categoryElement).length
}

function getContentSummary(categoryElement) {
  const subCategories = dataStore.getCategoriesByParent(categoryElement)
  const questions = dataStore.getQuestionsByCategory(categoryElement)

  // If there are subcategories, show both counts
  if (subCategories.length > 0) {
    return `${subCategories.length} subcategories • ${questions.length} questions`
  }

  // Otherwise, show only questions
  return `${questions.length} questions`
}
</script>
