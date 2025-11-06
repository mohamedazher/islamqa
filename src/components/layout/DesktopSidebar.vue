<template>
  <aside class="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-colors">
    <!-- Logo/Brand -->
    <div class="flex h-16 shrink-0 items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800">
      <router-link to="/" class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-soft">
          ☪
        </div>
        <div>
          <h1 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">IslamQA</h1>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">Islamic Knowledge</p>
        </div>
      </router-link>

      <!-- Theme Toggle -->
      <ThemeToggle />
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-1">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        class="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all"
        :class="isActive(item.to)
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'"
      >
        <Icon
          :name="item.icon"
          size="md"
          :class="isActive(item.to) ? '' : 'group-hover:scale-110 transition-transform'"
        />
        <span>{{ item.name }}</span>
        <span
          v-if="item.badge"
          class="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full"
          :class="item.badge === 'NEW'
            ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400'
            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'"
        >
          {{ item.badge }}
        </span>
      </router-link>
    </nav>

    <!-- Stats Footer -->
    <div class="shrink-0 border-t border-neutral-200 dark:border-neutral-800 p-4">
      <div class="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-4 border border-primary-100 dark:border-primary-800/30">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Your Progress</span>
          <span class="text-xs text-neutral-600 dark:text-neutral-400">Level {{ gamificationStore.currentLevel }}</span>
        </div>
        <div class="w-full bg-white dark:bg-neutral-800 rounded-full h-2 mb-2">
          <div
            class="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 h-2 rounded-full transition-all duration-500"
            :style="{ width: gamificationStore.levelProgress + '%' }"
          ></div>
        </div>
        <div class="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <span>{{ gamificationStore.points }} pts</span>
          <span>{{ gamificationStore.pointsToNextLevel }} to next</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGamificationStore } from '@/stores/gamification'
import Icon from '@/components/common/Icon.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const route = useRoute()
const gamificationStore = useGamificationStore()

const navigation = [
  { name: 'Home', to: '/', icon: 'home' },
  { name: 'Browse', to: '/browse', icon: 'book' },
  { name: 'Search', to: '/search', icon: 'search' },
  { name: 'Quiz', to: '/quiz', icon: 'lightning', badge: 'NEW' },
  { name: 'My Folders', to: '/folders', icon: 'folder' },
  { name: 'Settings', to: '/settings', icon: 'cog' },
]

const isActive = (to) => {
  if (to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(to)
}
</script>
