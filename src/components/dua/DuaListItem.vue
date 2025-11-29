<template>
  <div
    @click="$emit('click')"
    class="relative p-4 rounded-xl border-2 transition-all cursor-pointer"
    :class="
      isActive
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 shadow-md'
        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-primary-300 dark:hover:border-primary-700'
    "
  >
    <!-- Number Badge -->
    <div class="absolute -top-3 -left-3 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow">
      {{ index + 1 }}
    </div>

    <!-- Content -->
    <div class="pl-2">
      <!-- Title -->
      <h3 class="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-2">
        {{ dua.title }}
      </h3>

      <!-- Arabic -->
      <div class="mb-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded text-right">
        <p class="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed" dir="rtl">
          {{ dua.arabic }}
        </p>
      </div>

      <!-- Transliteration (optional) -->
      <p v-if="dua.transliteration" class="text-xs text-neutral-500 dark:text-neutral-400 italic mb-2 line-clamp-2">
        {{ dua.transliteration }}
      </p>

      <!-- Tags -->
      <div v-if="dua.tags && dua.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
        <span
          v-for="tag in dua.tags.slice(0, 2)"
          :key="tag"
          class="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <div class="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span v-if="dua.repetitions" class="flex items-center gap-1">
            <Icon name="repeat" size="sm" />
            {{ dua.repetitions }}x
          </span>
          <span v-if="dua.reference" class="flex items-center gap-1 truncate">
            <Icon name="book" size="sm" />
            {{ dua.reference }}
          </span>
        </div>
        <button
          @click.stop="toggleFavorite"
          class="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <Icon
            :name="isFav ? 'heartFilled' : 'heart'"
            size="sm"
            :class="isFav ? 'text-rose-500' : 'text-neutral-400'"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  dua: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click', 'favorite'])

const duaStore = useDuaStore()
const isFav = ref(false)

async function checkFavorite() {
  isFav.value = await duaStore.isFavorite(props.dua.id)
}

async function toggleFavorite() {
  isFav.value = await duaStore.toggleFavorite(props.dua.id)
}

onMounted(() => {
  checkFavorite()
})
</script>
