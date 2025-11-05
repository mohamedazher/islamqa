<template>
  <div class="category-view h-full flex flex-col bg-gray-50">
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 text-2xl">←</button>
      <div class="flex-1">
        <h1 class="text-xl font-bold">{{ currentCategory?.category_links || 'Category' }}</h1>
        <p class="text-blue-100 text-sm">{{ currentCategory ? getContentSummary(currentCategory.element) : '' }}</p>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading State -->
      <div v-if="dataStore.isLoading" class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Subcategories Section -->
        <div v-if="subcategories.length > 0">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">📁 Subcategories</h3>
          <div class="grid grid-cols-1 gap-3">
            <div
              v-for="subcat in subcategories"
              :key="subcat.id"
              @click="selectCategory(subcat)"
              class="bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md active:bg-blue-50"
            >
              <h4 class="font-semibold text-gray-900">{{ subcat.category_links }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ getContentSummary(subcat.element) }}</p>
            </div>
          </div>
        </div>

        <!-- Questions Section -->
        <div v-if="categoryQuestions.length > 0">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">❓ Questions</h3>
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
          <div class="text-6xl mb-4">📭</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No Content</h3>
          <p class="text-gray-600">This category has no subcategories or questions yet</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/data'
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
