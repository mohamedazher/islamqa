<template>
  <div id="app" class="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-200">
    <!-- Desktop Sidebar Navigation -->
    <DesktopSidebar />

    <!-- Main Content Area -->
    <div class="lg:pl-72">
      <!-- Mobile Bottom Navigation -->
      <MobileBottomNav />

      <!-- Page Content -->
      <main class="min-h-screen pb-16 lg:pb-0">
        <router-view v-slot="{ Component, route }">
          <transition :name="route.meta.transition || 'fade'" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useDataStore } from '@/stores/data'
import DesktopSidebar from '@/components/layout/DesktopSidebar.vue'
import MobileBottomNav from '@/components/layout/MobileBottomNav.vue'

const router = useRouter()
const { initTheme } = useTheme()
const dataStore = useDataStore()

onMounted(async () => {
  // Initialize theme
  initTheme()

  console.log('🌐 Running in browser mode')

  // Check if data is imported
  try {
    const isImported = await dataStore.isDataImported()
    const currentPath = router.currentRoute.value.path

    if (!isImported && currentPath !== '/import') {
      console.log('⚠️  Data not imported, redirecting to import page')
      router.push('/import')
    } else if (isImported) {
      // Initialize data store
      await dataStore.initialize()
    }
  } catch (error) {
    console.error('Error checking import status:', error)
  }

  // Handle Android back button
  if (window.cordova && window.device && window.device.platform === 'Android') {
    document.addEventListener('backbutton', handleBackButton, false)
  }

  console.log('✅ App mounted successfully')
})

const handleBackButton = (e) => {
  e.preventDefault()

  // Check if we can go back in history
  if (window.history.length > 1 && router.currentRoute.value.path !== '/') {
    router.back()
  } else {
    // If on home or can't go back, exit app (on mobile)
    if (window.navigator.app) {
      window.navigator.app.exitApp()
    }
  }
}
</script>

<style scoped>
/* Smooth page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
