<template>
  <header class="lg:hidden sticky top-0 z-40 bg-white border-b border-neutral-200 safe-area-top">
    <div class="flex items-center h-14 px-4">
      <!-- Back Button (conditional) -->
      <button
        v-if="showBack"
        @click="handleBack"
        class="mr-2 p-2 -ml-2 text-neutral-700 hover:text-neutral-900 active:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Go back"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Logo/Title -->
      <div v-if="!showBack" class="flex items-center gap-2 flex-1">
        <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-base font-bold shadow-soft">
          ☪
        </div>
        <div>
          <h1 class="text-sm font-bold text-neutral-900">IslamQA</h1>
        </div>
      </div>

      <div v-else class="flex-1">
        <h1 class="text-base font-semibold text-neutral-900 truncate">{{ title }}</h1>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-1">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  backTo: {
    type: String,
    default: null
  }
})

const router = useRouter()
const route = useRoute()

const showBack = computed(() => {
  return route.path !== '/' || props.backTo !== null
})

const handleBack = () => {
  if (props.backTo) {
    router.push(props.backTo)
  } else {
    router.back()
  }
}
</script>

<style scoped>
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}
</style>
