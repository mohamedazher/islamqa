<template>
  <div class="browse-view h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 text-2xl">←</button>
      <div>
        <h1 class="text-xl font-bold">Browse Categories</h1>
        <p class="text-blue-100 text-sm">Explore Islamic Q&A by topic</p>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading State -->
      <div v-if="dataStore.isLoading" class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>

      <!-- Categories Grid -->
      <div v-else class="grid grid-cols-1 gap-3">
        <CategoryCard
          v-for="category in rootCategories"
          :key="category.id"
          :category="category"
          @click="selectCategory(category)"
        />
      </div>

      <!-- Empty State -->
      <div v-if="!dataStore.isLoading && rootCategories.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📚</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No Categories Yet</h3>
        <p class="text-gray-600">Import data to see categories</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import CategoryCard from '@/components/browse/CategoryCard.vue'

const router = useRouter()
const dataStore = useDataStore()

const rootCategories = computed(() => dataStore.getCategoriesByParent(0))

onMounted(async () => {
  if (!dataStore.isLoaded) {
    await dataStore.loadData()
  }
})

function goBack() {
  router.back()
}

function selectCategory(category) {
  router.push(`/category/${category.id}`)
}
</script>
