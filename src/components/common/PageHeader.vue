<template>
  <div class="bg-white border-b border-neutral-200 lg:bg-transparent lg:border-0">
    <!-- Mobile Header -->
    <div class="lg:hidden px-4 py-3">
      <div class="flex items-center gap-3">
        <button
          v-if="showBack"
          @click="$emit('back')"
          class="p-2 -ml-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-neutral-900 truncate">{{ title }}</h1>
          <p v-if="subtitle" class="text-sm text-neutral-600 truncate">{{ subtitle }}</p>
        </div>

        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="hidden lg:block px-6 xl:px-8 py-6 mb-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-neutral-900">{{ title }}</h1>
            <p v-if="subtitle" class="mt-1 text-base text-neutral-600">{{ subtitle }}</p>
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
