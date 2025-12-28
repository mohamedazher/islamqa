<template>
  <div class="dua-home min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <div class="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-700 dark:via-cyan-700 dark:to-blue-700 text-white px-4 pt-4 pb-4">
      <div class="flex items-center justify-between mb-3">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <h1 class="text-xl font-bold">Dua & Adhkar</h1>
        <button @click="$router.push('/dua/favorites')" class="p-2 -mr-2 rounded-lg hover:bg-white/10">
          <Icon name="heart" size="md" class="text-white" />
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative mb-3">
        <Icon name="search" size="sm" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search duas..."
          class="w-full pl-10 pr-10 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          @input="handleSearch"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
        >
          <Icon name="x" size="sm" />
        </button>
      </div>

      <!-- Scrollable Tab Bar (hidden during search) -->
      <div v-if="!isSearching" class="relative -mx-4 px-4">
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

    <!-- Search Results -->
    <div v-else-if="isSearching" class="p-4">
      <!-- Search Status -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          <span v-if="isSearchLoading">Searching...</span>
          <span v-else-if="searchResults.length > 0">{{ searchResults.length }} results found</span>
          <span v-else>No results found</span>
        </p>
        <button
          @click="clearSearch"
          class="text-sm text-teal-600 dark:text-teal-400 font-medium"
        >
          Clear
        </button>
      </div>

      <!-- Grouped Results -->
      <div v-if="groupedSearchResults.length > 0" class="space-y-6">
        <div v-for="group in groupedSearchResults" :key="group.tab">
          <!-- Tab Header -->
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">{{ getTabIcon(group.tab) }}</span>
            <h3 class="font-semibold text-neutral-800 dark:text-neutral-200">{{ getTabLabel(group.tab) }}</h3>
            <span class="text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full">
              {{ group.duas.length }}
            </span>
          </div>

          <!-- Category Groups within Tab -->
          <div class="space-y-3">
            <div
              v-for="catGroup in group.categories"
              :key="catGroup.category.id"
              class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <!-- Category Header -->
              <div
                class="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700 cursor-pointer"
                @click="openCategory(catGroup.category.id)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ catGroup.category.icon }}</span>
                    <span class="font-medium text-neutral-800 dark:text-neutral-200 text-sm">{{ catGroup.category.title }}</span>
                  </div>
                  <Icon name="chevronRight" size="sm" class="text-neutral-400" />
                </div>
              </div>

              <!-- Duas in this category -->
              <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
                <div
                  v-for="dua in catGroup.duas"
                  :key="dua.id"
                  class="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
                  @click="openDua(catGroup.category.id, dua)"
                >
                  <p class="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
                    {{ dua.title || dua.translation || dua.arabic }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Search State -->
      <div v-else-if="!isSearchLoading && searchQuery.length >= 2" class="text-center py-12">
        <Icon name="search" size="xl" class="text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
        <p class="text-neutral-500 dark:text-neutral-400">No duas found for "{{ searchQuery }}"</p>
        <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Try a different search term</p>
      </div>
    </div>

    <!-- Categories Grid (Normal View) -->
    <div v-else class="p-4">
      <!-- Tab description card -->
      <div class="mb-4 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <span class="text-xl">{{ currentTab?.icon }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-neutral-800 dark:text-neutral-200">{{ currentTab?.label }}</p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ currentTab?.description }}</p>
        </div>
        <span class="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2 py-1 rounded-full font-medium">
          {{ displayedCategories.length }}
        </span>
      </div>

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
const searchQuery = ref('')
const searchResults = ref([])
const isSearchLoading = ref(false)
let searchTimeout = null

const isSearching = computed(() => searchQuery.value.length >= 2)

const currentTab = computed(() => tabs.find(t => t.id === activeTab.value))

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

// Group search results by tab and category
const groupedSearchResults = computed(() => {
  if (searchResults.value.length === 0) return []

  // First, group by category_id
  const byCategory = {}
  searchResults.value.forEach(dua => {
    const catId = dua.category_id
    if (!byCategory[catId]) {
      byCategory[catId] = []
    }
    byCategory[catId].push(dua)
  })

  // Now group categories by tab
  const byTab = {}
  Object.entries(byCategory).forEach(([catId, duas]) => {
    const category = duaStore.categories.find(c => c.id === catId)
    if (!category) return

    const tab = category.tab || 'daily'
    if (!byTab[tab]) {
      byTab[tab] = []
    }
    byTab[tab].push({ category, duas })
  })

  // Convert to array and sort by tab order
  const tabOrder = ['daily', 'salah', 'protection', 'social', 'life']
  return tabOrder
    .filter(tab => byTab[tab])
    .map(tab => ({
      tab,
      categories: byTab[tab],
      duas: byTab[tab].flatMap(c => c.duas)
    }))
})

function getTabIcon(tabId) {
  const tab = tabs.find(t => t.id === tabId)
  return tab ? tab.icon : '📿'
}

function getTabLabel(tabId) {
  const tab = tabs.find(t => t.id === tabId)
  return tab ? tab.label : tabId
}

async function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  isSearchLoading.value = true

  // Debounce search
  searchTimeout = setTimeout(async () => {
    try {
      searchResults.value = await duaStore.searchDuas(searchQuery.value)
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
    } finally {
      isSearchLoading.value = false
    }
  }, 300)
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

function openCategory(categoryId) {
  router.push(`/dua/category/${categoryId}`)
}

function openDua(categoryId, dua) {
  // Navigate to category and potentially highlight the dua
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
