import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'
import { initializeAnalytics, setEnabled } from './services/analytics'
import { isAnalyticsEnabled, isClarityEnabled } from './services/privacyConsent'
import { registerServiceWorker } from './services/serviceWorker'

let clarityInitialized = false
let lifecycleListenersInstalled = false

// Wait for Cordova to be ready
const initApp = async () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  app.mount('#app')

  console.log('✅ Vue app initialized')
  void registerServiceWorker()

  initializeAnalytics()
  await applyPrivacyServices()
  window.addEventListener('consent-changed', applyPrivacyServices)
  installLifecycleListeners()
  void router.isReady().then(consumeNativeLaunchAction)
}

function installLifecycleListeners() {
  if (lifecycleListenersInstalled) return
  lifecycleListenersInstalled = true

  const notifyForeground = () => {
    window.dispatchEvent(new CustomEvent('app-foreground', {
      detail: { timestamp: Date.now() }
    }))
    consumeNativeLaunchAction()
  }

  document.addEventListener('resume', notifyForeground, false)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') notifyForeground()
  })
}

function consumeNativeLaunchAction() {
  if (!window.PrayerWidget?.consumeLaunchAction) return
  window.PrayerWidget.consumeLaunchAction(
    action => {
      if (action === 'prayer-times' && router.currentRoute.value.path !== '/prayer-times') {
        router.push('/prayer-times').catch(error => console.warn('Could not open prayer times:', error))
      }
    },
    error => console.warn('Could not read widget launch action:', error)
  )
}

async function applyPrivacyServices() {
  const analyticsConsent = isAnalyticsEnabled()
  setEnabled(analyticsConsent)

  applyClarityConsent(isClarityEnabled() && analyticsConsent)
}

function applyClarityConsent(enabled) {
  if (!window.cordova || window.device?.platform === 'iOS' || !window.ClarityPlugin) return

  const success = () => {}
  const failure = (message) => console.error('Microsoft Clarity consent update failed:', message)
  if (!enabled) {
    if (clarityInitialized) window.ClarityPlugin.pause(success, failure)
    return
  }

  if (clarityInitialized) {
    window.ClarityPlugin.resume(success, failure)
    return
  }

  const clarityConfig = {
    logLevel: window.ClarityPlugin.LogLevel.None,
    allowMeteredNetworkUsage: true
  }
  window.ClarityPlugin.initialize('u73c1nlpij', () => {
    clarityInitialized = true
  }, failure, clarityConfig)
}

// Check if we're in Cordova environment
if (window.cordova) {
  document.addEventListener('deviceready', () => {
    console.log('📱 Cordova device ready')

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
