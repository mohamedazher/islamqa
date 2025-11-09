<template>
  <div class="browse-view min-h-screen">
    <!-- Page Header -->
    <PageHeader
      title="Browse Categories"
      subtitle="Explore Islamic Q&A organized by topic"
      :show-back="false"
    >
      <template #actions>
        <Button
          variant="ghost"
          size="sm"
          @click="$router.push('/search')"
          class="hidden sm:flex"
        >
          <template #icon>
            <Icon name="search" size="md" />
          </template>
          Search
        </Button>
      </template>
    </PageHeader>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 py-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-3">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>

      <!-- Categories Grid -->
      <div v-else-if="rootCategories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        <transition-group name="slide-up" appear>
          <CategoryCard
            v-for="(category, index) in rootCategories"
            :key="category.id"
            :category="category"
            :style="{ 'animation-delay': `${index * 30}ms` }"
            @click="selectCategory(category)"
          />
        </transition-group>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div class="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="book" size="xl" class="text-neutral-400 dark:text-neutral-600" />
        </div>
        <h3 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">No Categories Available</h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6">Import data to explore Islamic Q&A categories</p>
        <Button variant="primary" size="lg" @click="$router.push('/import')">
          <template #icon>
            <Icon name="download" size="md" />
          </template>
          Start Import
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import PageHeader from '@/components/common/PageHeader.vue'
import Button from '@/components/common/Button.vue'
import Icon from '@/components/common/Icon.vue'
import CategoryCard from '@/components/browse/CategoryCard.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

const router = useRouter()
const dataStore = useDataStore()

const rootCategories = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    isLoading.value = true
    // UPDATED: Pass null instead of 0 for root categories (new data structure)
    rootCategories.value = await dataStore.getCategoriesByParent(null)
  } catch (error) {
    console.error('Error loading categories:', error)
  } finally {
    isLoading.value = false
  }
})

function selectCategory(category) {
  // UPDATED: Use reference (semantic ID from IslamQA) not element
  router.push(`/category/${category.reference}`)
}
</script>
