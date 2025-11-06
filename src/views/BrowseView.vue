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
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </template>
          Search
        </Button>
      </template>
    </PageHeader>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 py-6">
      <!-- Loading State -->
      <div v-if="dataStore.isLoading" class="space-y-3">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>

      <!-- Categories Grid -->
      <div v-else-if="rootCategories.length > 0" class="space-y-3">
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
        <div class="text-8xl mb-6">📚</div>
        <h3 class="text-2xl font-bold text-neutral-900 mb-2">No Categories Available</h3>
        <p class="text-neutral-600 mb-6">Import data to explore Islamic Q&A categories</p>
        <Button variant="primary" size="lg" @click="$router.push('/import')">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </template>
          Start Import
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import PageHeader from '@/components/common/PageHeader.vue'
import Button from '@/components/common/Button.vue'
import CategoryCard from '@/components/browse/CategoryCard.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

const router = useRouter()
const dataStore = useDataStore()

const rootCategories = computed(() => dataStore.getCategoriesByParent(0))

onMounted(async () => {
  if (!dataStore.isLoaded) {
    await dataStore.loadData()
  }
})

function selectCategory(category) {
  router.push(`/category/${category.id}`)
}
</script>
