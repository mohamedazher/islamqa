import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'
import { initializeAnalytics, setEnabled, setPlatformTrackingAllowed } from './services/analytics'
import { isAnalyticsEnabled, isClarityEnabled } from './services/privacyConsent'
import { registerServiceWorker } from './services/serviceWorker'

let clarityInitialized = false
let attRequest = null
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

  const isIOS = window.cordova && window.device?.platform === 'iOS'
  initializeAnalytics({ platformTrackingAllowed: !isIOS })
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
  const isIOS = window.cordova && window.device?.platform === 'iOS'

  if (isIOS) {
    if (analyticsConsent) {
      attRequest ||= requestTrackingPermission().finally(() => { attRequest = null })
      setPlatformTrackingAllowed(await attRequest)
    } else {
      setPlatformTrackingAllowed(false)
    }
  } else {
    setPlatformTrackingAllowed(true)
    setEnabled(analyticsConsent)
  }

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
