<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <Icon :name="isDark ? 'sun' : 'moon'" size="md" />
  </button>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import Icon from './Icon.vue'

const { isDark, toggleTheme } = useTheme()
</script>
