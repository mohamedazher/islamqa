<template>
  <!-- Mobile Bottom Navigation -->
  <nav class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 safe-area-bottom transition-colors">
    <div class="grid grid-cols-5 h-16">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        class="flex flex-col items-center justify-center gap-1 transition-colors relative"
        :class="isActive(item.to)
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-neutral-500 dark:text-neutral-400 active:bg-neutral-50 dark:active:bg-neutral-800'"
      >
        <div class="relative">
          <Icon :name="item.icon" size="lg" />
          <span
            v-if="item.badge"
            class="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 dark:bg-accent-400 rounded-full"
          ></span>
        </div>
        <span class="text-2xs font-medium">{{ item.name }}</span>
        <div
          v-if="isActive(item.to)"
          class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-600 dark:bg-primary-400 rounded-b-full"
        ></div>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Icon from '@/components/common/Icon.vue'

const route = useRoute()

const navigation = [
  { name: 'Home', to: '/', icon: 'home' },
  { name: 'Browse', to: '/browse', icon: 'book' },
  { name: 'Search', to: '/search', icon: 'search' },
  { name: 'Bookmarks', to: '/bookmarks', icon: 'bookmark' },
  { name: 'Settings', to: '/settings', icon: 'cog' },
]

const isActive = (to) => {
  if (to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(to)
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
