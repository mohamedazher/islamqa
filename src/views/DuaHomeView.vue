<template>
  <div class="dua-home min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <div class="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-700 dark:via-cyan-700 dark:to-blue-700 text-white px-4 pt-4 pb-6">
      <div class="flex items-center justify-between mb-4">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <h1 class="text-xl font-bold">Dua & Adhkar</h1>
        <button @click="$router.push('/dua/favorites')" class="p-2 -mr-2 rounded-lg hover:bg-white/10">
          <Icon name="heart" size="md" class="text-white" />
        </button>
      </div>

      <!-- Tab Toggle -->
      <div class="flex bg-white/20 rounded-full p-1">
        <button
          @click="activeTab = 'main'"
          class="flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all"
          :class="activeTab === 'main' ? 'bg-white text-teal-600' : 'text-white'"
        >
          Main
        </button>
        <button
          @click="activeTab = 'other'"
          class="flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all"
          :class="activeTab === 'other' ? 'bg-white text-teal-600' : 'text-white'"
        >
          Other
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="duaStore.isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-neutral-600 dark:text-neutral-400">{{ duaStore.importStatus || 'Loading...' }}</p>
        <div v-if="duaStore.importProgress > 0" class="mt-2 w-48 mx-auto">
          <div class="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 transition-all duration-300"
              :style="{ width: `${duaStore.importProgress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Grid -->
    <div v-else class="p-4">
      <div class="grid grid-cols-2 gap-4">
        <DuaCategoryCard
          v-for="category in displayedCategories"
          :key="category.id"
          :category="category"
          @click="openCategory(category.id)"
        />
      </div>

      <!-- Empty State -->
      <div v-if="displayedCategories.length === 0" class="text-center py-12">
        <Icon name="book" size="xl" class="text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
        <p class="text-neutral-500 dark:text-neutral-400">No categories found</p>
      </div>
    </div>

    <!-- Attribution Footer -->
    <div class="px-4 pb-8 text-center">
      <p class="text-xs text-neutral-400 dark:text-neutral-500">
        Content sourced from
        <a href="https://lifewithallah.com/dhikr-dua/" target="_blank" class="text-primary-500 hover:underline">
          LifeWithAllah.com
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'
import DuaCategoryCard from '@/components/dua/DuaCategoryCard.vue'

const router = useRouter()
const duaStore = useDuaStore()

const activeTab = ref('main')

const displayedCategories = computed(() => {
  return activeTab.value === 'main'
    ? duaStore.mainCategories
    : duaStore.otherCategories
})

function openCategory(categoryId) {
  router.push(`/dua/category/${categoryId}`)
}

onMounted(async () => {
  if (!duaStore.isImported) {
    await duaStore.initialize()
  } else if (duaStore.categories.length === 0) {
    await duaStore.loadCategories()
  }
})
</script>
