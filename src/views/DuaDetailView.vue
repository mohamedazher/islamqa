<template>
  <div class="dua-detail min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
    <!-- Header with nav -->
    <div class="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-700 dark:via-cyan-700 dark:to-blue-700 text-white px-4 py-4 sticky top-0 z-10">
      <div class="flex items-center justify-between mb-4">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <div class="text-center">
          <h1 class="text-sm font-semibold">{{ duaStore.currentCategory?.title }}</h1>
          <p class="text-xs text-white/70">{{ duaStore.progress }}</p>
        </div>
        <button @click="toggleFavorite" class="p-2 -mr-2 rounded-lg hover:bg-white/10">
          <Icon
            :name="isFavorited ? 'heartFilled' : 'heart'"
            size="md"
            :class="isFavorited ? 'text-white' : 'text-white/70'"
          />
        </button>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex gap-2">
        <button
          @click="previousDua"
          :disabled="!duaStore.hasPrevious"
          class="flex-1 py-2 px-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition"
        >
          <Icon name="arrowLeft" size="sm" class="inline mr-1" />
          Prev
        </button>
        <button
          @click="nextDua"
          :disabled="!duaStore.hasNext"
          class="flex-1 py-2 px-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition"
        >
          Next
          <Icon name="arrowRight" size="sm" class="inline ml-1" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="duaStore.isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-neutral-600 dark:text-neutral-400">Loading dua...</p>
      </div>
    </div>

    <!-- Dua Content -->
    <div v-else-if="currentDua" class="flex-1 overflow-y-auto p-4 space-y-6 pb-8">
      <!-- Title -->
      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">{{ currentDua.title }}</h2>
        <p v-if="currentDua.title_ar" class="text-right text-lg text-neutral-600 dark:text-neutral-400" dir="rtl">
          {{ currentDua.title_ar }}
        </p>
      </div>

      <!-- Arabic Text -->
      <div class="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <p
          class="text-center leading-relaxed text-neutral-900 dark:text-white"
          dir="rtl"
          :style="{ fontSize: duaStore.settings.arabic_font_size + 'px' }"
        >
          {{ currentDua.arabic }}
        </p>
      </div>

      <!-- Transliteration -->
      <div v-if="duaStore.settings.show_transliteration && currentDua.transliteration" class="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 italic">
        <p
          class="text-neutral-700 dark:text-neutral-300 leading-relaxed text-center"
          :style="{ fontSize: duaStore.settings.transliteration_font_size + 'px' }"
        >
          {{ currentDua.transliteration }}
        </p>
      </div>

      <!-- Translation -->
      <div v-if="duaStore.settings.show_translation && currentDua.translation" class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
        <p
          class="text-neutral-700 dark:text-neutral-300 leading-relaxed"
          :style="{ fontSize: duaStore.settings.translation_font_size + 'px' }"
        >
          {{ currentDua.translation }}
        </p>
      </div>

      <!-- Virtue/Benefit -->
      <div v-if="duaStore.settings.show_virtue && currentDua.virtue" class="bg-emerald-50 dark:bg-emerald-950 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
        <h4 class="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Virtue & Benefit</h4>
        <div
          class="text-emerald-800 dark:text-emerald-200 text-sm leading-relaxed markdown-content"
          v-html="renderedVirtue"
        />
      </div>

      <!-- Reference -->
      <div v-if="duaStore.settings.show_reference && currentDua.reference" class="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Reference</h4>
        <p class="text-blue-800 dark:text-blue-200 text-sm">
          {{ currentDua.reference }}
        </p>
      </div>

      <!-- Repetitions -->
      <div v-if="currentDua.repetitions && currentDua.repetitions > 1" class="flex items-center justify-center">
        <DuaCounter :repetitions="currentDua.repetitions" />
      </div>

      <!-- Tags -->
      <div v-if="currentDua.tags && currentDua.tags.length > 0" class="flex flex-wrap gap-2 justify-center">
        <span
          v-for="tag in currentDua.tags"
          :key="tag"
          class="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <Icon name="book" size="xl" class="text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
        <p class="text-neutral-500 dark:text-neutral-400">No dua found</p>
      </div>
    </div>

    <!-- Quick Settings Floating Button -->
    <button
      @click="showSettings = true"
      class="fixed bottom-8 right-4 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110"
    >
      <Icon name="settings" size="lg" />
    </button>

    <!-- Settings Modal -->
    <DuaQuickSettings
      v-if="showSettings"
      @close="showSettings = false"
      @update="updateSettings"
    />
  </div>
</template>

<style scoped>
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(h1) { font-size: 1.5rem; }
.markdown-content :deep(h2) { font-size: 1.25rem; }
.markdown-content :deep(h3) { font-size: 1.1rem; }

.markdown-content :deep(p) {
  margin-bottom: 0.75rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.dark .markdown-content :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid currentColor;
  padding-left: 1rem;
  margin-left: 0;
  margin-bottom: 0.75rem;
  opacity: 0.8;
}

.markdown-content :deep(a) {
  color: inherit;
  text-decoration: underline;
  opacity: 0.9;
}

.markdown-content :deep(a:hover) {
  opacity: 1;
}
</style>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDuaStore } from '@/stores/dua'
import { renderMarkdown } from '@/utils/markdownRenderer'
import Icon from '@/components/common/Icon.vue'
import DuaCounter from '@/components/dua/DuaCounter.vue'
import DuaQuickSettings from '@/components/dua/DuaQuickSettings.vue'

const route = useRoute()
const duaStore = useDuaStore()

const showSettings = ref(false)
const isFavorited = ref(false)
const renderedVirtue = ref('')

const currentDua = computed(() => duaStore.currentDua)

const updateRenderedVirtue = () => {
  if (currentDua.value && currentDua.value.virtue) {
    renderedVirtue.value = renderMarkdown(currentDua.value.virtue)
  } else {
    renderedVirtue.value = ''
  }
}

watch(currentDua, () => {
  updateRenderedVirtue()
}, { immediate: true })

function nextDua() {
  if (duaStore.hasNext) {
    duaStore.nextDua()
    updateRenderedVirtue()
  }
}

function previousDua() {
  if (duaStore.hasPrevious) {
    duaStore.previousDua()
    updateRenderedVirtue()
  }
}

async function toggleFavorite() {
  isFavorited.value = await duaStore.toggleFavorite(currentDua.value.id)
}

function updateSettings(newSettings) {
  duaStore.updateSettings(newSettings)
}

onMounted(async () => {
  const { categoryId, duaIndex } = route.params

  // Load category if not already loaded
  if (duaStore.currentCategory?.id !== categoryId) {
    await duaStore.loadCategory(categoryId)
  }

  // Load specific dua
  await duaStore.loadDuaByIndex(parseInt(duaIndex))

  // Check if currently displayed dua is favorited
  if (currentDua.value) {
    isFavorited.value = await duaStore.isFavorite(currentDua.value.id)
  }
})
</script>
