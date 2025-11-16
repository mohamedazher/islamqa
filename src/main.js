import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'
import { initializeAnalytics } from './services/analytics'

// Wait for Cordova to be ready
const initApp = () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  app.mount('#app')

  console.log('✅ Vue app initialized')

  // Initialize Firebase Analytics
  initializeAnalytics()
}

// Check if we're in Cordova environment
if (window.cordova) {
  document.addEventListener('deviceready', () => {
    console.log('📱 Cordova device ready')

    // Initialize Microsoft Clarity
    if (window.ClarityPlugin) {
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

    initApp()
  }, false)
} else {
  // Browser development mode
  console.log('🌐 Running in browser mode')
  initApp()
}
