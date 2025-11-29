<template>
  <div class="dua-favorites min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <div class="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-500 dark:from-rose-700 dark:via-pink-700 dark:to-rose-700 text-white px-4 pt-4 pb-6 sticky top-0 z-10">
      <div class="flex items-center justify-between mb-4">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <h1 class="text-xl font-bold">Favorite Duas</h1>
        <div class="w-10"></div>
      </div>

      <!-- Stats -->
      <div class="text-sm text-white/80">
        {{ favorites.length }} favor{{ favorites.length !== 1 ? 'ites' : 'ite' }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-neutral-600 dark:text-neutral-400">Loading favorites...</p>
      </div>
    </div>

    <!-- Favorites List -->
    <div v-else class="p-4 space-y-3 pb-8">
      <div
        v-for="(fav, index) in favorites"
        :key="fav.id"
        @click="openDua(fav)"
        class="relative p-4 rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-white dark:bg-neutral-900 hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer"
      >
        <!-- Number Badge -->
        <div class="absolute -top-3 -left-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow">
          {{ index + 1 }}
        </div>

        <!-- Content -->
        <div class="pl-2">
          <!-- Title -->
          <h3 class="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-2">
            {{ fav.title }}
          </h3>

          <!-- Arabic -->
          <div class="mb-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded text-right">
            <p class="text-neutral-700 dark:text-neutral-300 text-sm line-clamp-2 leading-relaxed" dir="rtl">
              {{ fav.arabic }}
            </p>
          </div>

          <!-- Category -->
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-500 dark:text-neutral-400">
              From: <span class="font-semibold">{{ fav.category_title }}</span>
            </span>
            <button
              @click.stop="removeFavorite(fav.id)"
              class="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <Icon name="heartFilled" size="sm" class="text-rose-500" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="favorites.length === 0" class="text-center py-12">
        <Icon name="heart" size="xl" class="text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
        <p class="text-neutral-500 dark:text-neutral-400 mb-4">No favorites yet</p>
        <button
          @click="$router.push('/dua')"
          class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition"
        >
          Browse Duas
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'

const router = useRouter()
const duaStore = useDuaStore()

const favorites = ref([])
const isLoading = ref(false)

async function loadFavorites() {
  isLoading.value = true
  try {
    await duaStore.loadFavorites()
    favorites.value = duaStore.favorites
  } catch (error) {
    console.error('Error loading favorites:', error)
  } finally {
    isLoading.value = false
  }
}

async function removeFavorite(duaId) {
  await duaStore.toggleFavorite(duaId)
  await loadFavorites()
}

function openDua(fav) {
  // Navigate to the dua detail view
  // We need to find the index of this dua in its category
  const categoryId = fav.category_id
  router.push({
    name: 'dua-detail',
    params: {
      categoryId: categoryId,
      duaIndex: fav.index_in_category || 0
    }
  })
}

onMounted(async () => {
  await loadFavorites()
})
</script>
