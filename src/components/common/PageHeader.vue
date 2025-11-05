<template>
  <div class="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 lg:bg-transparent lg:dark:bg-transparent lg:border-0 transition-colors">
    <!-- Mobile Header -->
    <div class="lg:hidden px-4 py-3">
      <div class="flex items-center gap-3">
        <button
          v-if="showBack"
          @click="$emit('back')"
          class="p-2 -ml-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <Icon name="chevronLeft" size="md" />
        </button>

        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">{{ title }}</h1>
          <p v-if="subtitle" class="text-sm text-neutral-600 dark:text-neutral-400 truncate">{{ subtitle }}</p>
        </div>

        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="hidden lg:block px-6 xl:px-8 py-6 mb-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{{ title }}</h1>
            <p v-if="subtitle" class="mt-1 text-base text-neutral-600 dark:text-neutral-400">{{ subtitle }}</p>
          </div>
          <div class="flex items-center gap-3">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from './Icon.vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  }
})

defineEmits(['back'])
</script>
