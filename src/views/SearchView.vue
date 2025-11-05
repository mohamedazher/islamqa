<template>
  <div class="search-view h-full flex flex-col bg-gray-50">
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 text-2xl">←</button>
      <h1 class="text-xl font-bold">Search</h1>
    </header>

    <div class="flex-1 overflow-y-auto p-4">
      <p class="text-gray-600">Search functionality coming soon</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>
