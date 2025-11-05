<template>
  <div id="app" class="h-screen w-screen overflow-hidden flex flex-col">
    <!-- Status Bar Spacer (for iOS notch) -->
    <div class="status-bar-spacer bg-gray-900" :style="{ height: statusBarHeight + 'px' }"></div>

    <!-- App Content -->
    <div class="flex-1 overflow-hidden">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(0)

onMounted(() => {
  // Detect status bar height for iOS
  if (window.cordova && window.device && window.device.platform === 'iOS') {
    // iOS safe area
    statusBarHeight.value = 20
  }

  // Handle Android back button
  if (window.cordova && window.device && window.device.platform === 'Android') {
    document.addEventListener('backbutton', handleBackButton, false)
  }
})

const handleBackButton = (e) => {
  e.preventDefault()
  // Will be handled by router
  window.history.back()
}
</script>

<style scoped>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.status-bar-spacer {
  flex-shrink: 0;
}
</style>
