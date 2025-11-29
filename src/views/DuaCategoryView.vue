<template>
  <div class="dua-category min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <div class="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-700 dark:via-cyan-700 dark:to-blue-700 text-white px-4 pt-4 pb-6 sticky top-0 z-10">
      <div class="flex items-center justify-between mb-4">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <h1 class="text-xl font-bold">{{ category?.title }}</h1>
        <button @click="toggleSettings" class="p-2 -mr-2 rounded-lg hover:bg-white/10">
          <Icon name="settings" size="md" class="text-white" />
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="space-y-2">
        <div class="flex justify-between text-xs text-white/80">
          <span>Progress</span>
          <span>{{ duaStore.progress }}</span>
        </div>
        <div class="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full bg-white transition-all duration-300"
            :style="{ width: `${duaStore.progressPercent}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="duaStore.isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-neutral-600 dark:text-neutral-400">Loading duas...</p>
      </div>
    </div>

    <!-- Duas List -->
    <div v-else class="p-4 space-y-3 pb-8">
      <DuaListItem
        v-for="(dua, index) in duaStore.currentDuas"
        :key="dua.id"
        :dua="dua"
        :index="index"
        :is-active="duaStore.currentDuaIndex === index"
        @click="selectDua(index)"
      />

      <!-- Empty State -->
      <div v-if="duaStore.currentDuas.length === 0" class="text-center py-12">
        <Icon name="book" size="xl" class="text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
        <p class="text-neutral-500 dark:text-neutral-400">No duas found</p>
      </div>
    </div>

    <!-- Settings Modal -->
    <DuaQuickSettings
      v-if="showSettings"
      @close="showSettings = false"
      @update="updateSettings"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'
import DuaListItem from '@/components/dua/DuaListItem.vue'
import DuaQuickSettings from '@/components/dua/DuaQuickSettings.vue'

const route = useRoute()
const router = useRouter()
const duaStore = useDuaStore()

const showSettings = ref(false)
const category = computed(() => duaStore.currentCategory)

function toggleSettings() {
  showSettings.value = !showSettings.value
}

function selectDua(index) {
  duaStore.loadDuaByIndex(index)
  // Navigate to detail view
  const categoryId = route.params.id
  router.push({
    name: 'dua-detail',
    params: {
      categoryId: categoryId,
      duaIndex: index
    }
  })
}

function updateSettings(newSettings) {
  duaStore.updateSettings(newSettings)
}

onMounted(async () => {
  const categoryId = route.params.id
  if (duaStore.currentCategory?.id !== categoryId) {
    await duaStore.loadCategory(categoryId)
  }
})
</script>
