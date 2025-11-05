<template>
  <div class="category-view h-full flex flex-col bg-gray-50">
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 text-2xl">←</button>
      <div>
        <h1 class="text-xl font-bold">{{ currentCategory?.category_links || 'Category' }}</h1>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4">
      <p class="text-gray-600">Questions will appear here</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useQuestionsStore } from '@/stores/questions'

const router = useRouter()
const route = useRoute()
const questionsStore = useQuestionsStore()
const currentCategory = ref(null)

onMounted(async () => {
  const categoryId = route.params.id
  currentCategory.value = await questionsStore.loadCategory(categoryId)
})

function goBack() {
  router.back()
}
</script>
