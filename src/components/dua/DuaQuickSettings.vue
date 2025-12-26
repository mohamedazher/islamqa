<template>
  <!-- Backdrop -->
  <div
    @click="$emit('close')"
    class="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
  ></div>

  <!-- Modal -->
  <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 rounded-t-3xl p-6 space-y-6 z-50 max-h-96 overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-neutral-900 dark:text-white">Text Settings</h2>
      <button
        @click="$emit('close')"
        class="p-2 -mr-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Icon name="close" size="md" />
      </button>
    </div>

    <!-- Arabic Font Size -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Arabic Size</label>
        <span class="text-lg font-bold text-primary-500">{{ localSettings.arabic_font_size }}px</span>
      </div>
      <input
        v-model.number="localSettings.arabic_font_size"
        type="range"
        min="20"
        max="40"
        class="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer"
      />
      <div class="text-center text-neutral-600 dark:text-neutral-400 text-sm">
        <p dir="rtl" :style="{ fontSize: localSettings.arabic_font_size + 'px' }">بسم الله الرحمن الرحيم</p>
      </div>
    </div>

    <!-- Transliteration Font Size -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Transliteration Size</label>
        <span class="text-lg font-bold text-primary-500">{{ localSettings.transliteration_font_size }}px</span>
      </div>
      <input
        v-model.number="localSettings.transliteration_font_size"
        type="range"
        min="12"
        max="24"
        class="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer"
      />
      <div class="text-center text-neutral-600 dark:text-neutral-400 text-sm">
        <p :style="{ fontSize: localSettings.transliteration_font_size + 'px' }">Bismillāh ar-raḥmān ar-raḥīm</p>
      </div>
    </div>

    <!-- Translation Font Size -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Translation Size</label>
        <span class="text-lg font-bold text-primary-500">{{ localSettings.translation_font_size }}px</span>
      </div>
      <input
        v-model.number="localSettings.translation_font_size"
        type="range"
        min="12"
        max="20"
        class="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer"
      />
      <div class="text-center text-neutral-600 dark:text-neutral-400 text-sm">
        <p :style="{ fontSize: localSettings.translation_font_size + 'px' }">In the name of Allah, the Most Gracious, the Most Merciful</p>
      </div>
    </div>

    <!-- Visibility Toggles -->
    <div class="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          v-model="localSettings.show_transliteration"
          type="checkbox"
          class="w-4 h-4 text-primary-500 rounded"
        />
        <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Show Transliteration</span>
      </label>

      <label class="flex items-center gap-3 cursor-pointer">
        <input
          v-model="localSettings.show_translation"
          type="checkbox"
          class="w-4 h-4 text-primary-500 rounded"
        />
        <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Show Translation</span>
      </label>

      <label class="flex items-center gap-3 cursor-pointer">
        <input
          v-model="localSettings.show_reference"
          type="checkbox"
          class="w-4 h-4 text-primary-500 rounded"
        />
        <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Show Reference</span>
      </label>

    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 pt-4">
      <button
        @click="$emit('close')"
        class="flex-1 py-3 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
      >
        Cancel
      </button>
      <button
        @click="save"
        class="flex-1 py-3 px-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'

defineEmits(['close', 'update'])

const duaStore = useDuaStore()
const localSettings = ref({
  arabic_font_size: 28,
  transliteration_font_size: 16,
  translation_font_size: 14,
  show_transliteration: true,
  show_translation: true,
  show_reference: true
})

onMounted(() => {
  localSettings.value = { ...duaStore.settings }
})

function save() {
  duaStore.updateSettings(localSettings.value)
  // Emit the updated settings
  window.dispatchEvent(new CustomEvent('duaSettingsUpdated', { detail: localSettings.value }))
}
</script>
