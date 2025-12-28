<template>
  <div class="dua-home min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <div class="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-700 dark:via-cyan-700 dark:to-blue-700 text-white px-4 pt-4 pb-4">
      <div class="flex items-center justify-between mb-4">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <h1 class="text-xl font-bold">Dua & Adhkar</h1>
        <button @click="$router.push('/dua/favorites')" class="p-2 -mr-2 rounded-lg hover:bg-white/10">
          <Icon name="heart" size="md" class="text-white" />
        </button>
      </div>

      <!-- Scrollable Tab Bar -->
      <div class="relative -mx-4 px-4">
        <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mb-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-shrink-0 py-2 px-4 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
            :class="activeTab === tab.id
              ? 'bg-white text-teal-600 shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30'"
          >
            <span class="mr-1.5">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
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
      <!-- Tab description -->
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        {{ currentTabDescription }}
      </p>

      <div class="grid grid-cols-2 gap-3">
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

    <!-- Migration Notice (shown after update) -->
    <MigrationNotice />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'
import DuaCategoryCard from '@/components/dua/DuaCategoryCard.vue'
import MigrationNotice from '@/components/dua/MigrationNotice.vue'

const router = useRouter()
const duaStore = useDuaStore()

const tabs = [
  { id: 'daily', label: 'Daily', icon: '🌅', description: 'Morning, evening, sleep, eating & daily routines' },
  { id: 'salah', label: 'Salah', icon: '🤲', description: 'Mosque, prayer positions, witr & istikhara' },
  { id: 'protection', label: 'Protection', icon: '🛡️', description: 'Anxiety, fear, refuge & forgiveness' },
  { id: 'social', label: 'Social', icon: '👥', description: 'Travel, weather, greetings & gatherings' },
  { id: 'life', label: 'Life Events', icon: '💫', description: 'Marriage, birth, sickness, death & Hajj' },
]

const activeTab = ref('daily')

const displayedCategories = computed(() => {
  switch (activeTab.value) {
    case 'daily':
      return duaStore.dailyCategories
    case 'salah':
      return duaStore.salahCategories
    case 'protection':
      return duaStore.protectionCategories
    case 'social':
      return duaStore.socialCategories
    case 'life':
      return duaStore.lifeCategories
    default:
      return duaStore.dailyCategories
  }
})

const currentTabDescription = computed(() => {
  const tab = tabs.find(t => t.id === activeTab.value)
  return tab ? tab.description : ''
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

<style scoped>
/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
