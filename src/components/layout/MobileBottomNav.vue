<template>
  <!-- Mobile Bottom Navigation -->
  <nav class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-neutral-200 safe-area-bottom">
    <div class="grid grid-cols-5 h-16">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        class="flex flex-col items-center justify-center gap-1 transition-colors relative"
        :class="isActive(item.to)
          ? 'text-primary-600'
          : 'text-neutral-500 active:bg-neutral-50'"
      >
        <div class="relative">
          <span class="text-2xl">{{ item.icon }}</span>
          <span
            v-if="item.badge"
            class="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full"
          ></span>
        </div>
        <span class="text-2xs font-medium">{{ item.name }}</span>
        <div
          v-if="isActive(item.to)"
          class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-b-full"
        ></div>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navigation = [
  { name: 'Home', to: '/', icon: '🏠' },
  { name: 'Browse', to: '/browse', icon: '📚' },
  { name: 'Search', to: '/search', icon: '🔍' },
  { name: 'Quiz', to: '/quiz', icon: '🎯', badge: true },
  { name: 'Folders', to: '/folders', icon: '📂' },
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
