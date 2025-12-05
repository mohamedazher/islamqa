import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'
import { initializeAnalytics } from './services/analytics'

// Wait for Cordova to be ready
const initApp = async () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  app.mount('#app')

  console.log('✅ Vue app initialized')

  // Request App Tracking Transparency permission on iOS before analytics
  let trackingAllowed = true
  if (window.cordova && window.device && window.device.platform === 'iOS') {
    trackingAllowed = await requestTrackingPermission()
    console.log('📊 Tracking allowed:', trackingAllowed)
  }

  // Initialize Firebase Analytics only if tracking is allowed
  if (trackingAllowed) {
    initializeAnalytics()
  } else {
    console.log('ℹ️ Analytics disabled - tracking not authorized')
  }
}

// Request App Tracking Transparency permission (iOS only)
const requestTrackingPermission = () => {
  return new Promise((resolve) => {
    // Check for IDFA plugin at cordova.plugins.idfa
    if (!window.cordova?.plugins?.idfa) {
      console.warn('⚠️ IDFA plugin not available')
      resolve(false)
      return
    }

    const idfaPlugin = window.cordova.plugins.idfa
    console.log('✅ IDFA plugin found')

    try {
      console.log('🔍 About to call getInfo()')
      console.log('🔍 idfaPlugin.getInfo type:', typeof idfaPlugin.getInfo)

      // First check current permission status - plugin returns Promise!
      idfaPlugin.getInfo()
        .then((info) => {
          console.log('🔍 getInfo Promise resolved!')
          console.log('📊 ATT Status:', info.trackingPermission)

          // Status values: 0 = not determined, 1 = restricted, 2 = denied, 3 = authorized
          if (info.trackingPermission === 3) {
            // Already authorized
            console.log('✅ Tracking already authorized')
            resolve(true)
            return
          }

          if (info.trackingPermission === 1 || info.trackingPermission === 2) {
            // Restricted or denied - don't ask again
            console.log('ℹ️ Tracking restricted or denied')
            resolve(false)
            return
          }

          // Not determined yet - show ATT dialog
          console.log('🚀 Requesting ATT permission...')
          idfaPlugin.requestPermission()
            .then((status) => {
              console.log('✅ Tracking permission granted, status:', status)
              resolve(status === 3)  // Authorized = 3
            })
            .catch((error) => {
              console.log('ℹ️ Tracking permission denied:', error)
              resolve(false)
            })
        })
        .catch((error) => {
          console.error('❌ Failed to get ATT status:', error)
          resolve(false)
        })
    } catch (error) {
      console.error('❌ Exception calling getInfo():', error)
      resolve(false)
    }
  })
}

// Check if we're in Cordova environment
if (window.cordova) {
  document.addEventListener('deviceready', () => {
    console.log('📱 Cordova device ready')

    // Initialize Microsoft Clarity (Android only - not supported on iOS)
    if (window.device && window.device.platform === 'iOS') {
      console.log('ℹ️ Skipping Microsoft Clarity (not supported on iOS)')
    } else if (window.ClarityPlugin) {
      const success = function(message) {
        console.log('✅ Microsoft Clarity initialized:', message)
      }
      const failure = function(message) {
        console.error('❌ Microsoft Clarity failed to initialize:', message)
      }
      const clarityConfig = {
        logLevel: window.ClarityPlugin.LogLevel.None, // Use LogLevel.Verbose for debugging
        allowMeteredNetworkUsage: true
      }

      window.ClarityPlugin.initialize('u73c1nlpij', success, failure, clarityConfig)
    } else {
      console.warn('⚠️ Microsoft Clarity plugin not available')
    }

    // Add small delay to ensure Cordova bridge is fully ready
    setTimeout(() => {
      console.log('🔄 Initializing app after bridge ready')
      initApp()
    }, 100)
  }, false)
} else {
  // Browser development mode
  console.log('🌐 Running in browser mode')
  initApp()
}
