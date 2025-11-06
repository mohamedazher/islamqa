import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'

// Wait for Cordova to be ready
const initApp = () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  app.mount('#app')

  console.log('✅ Vue app initialized')
}

// Check if we're in Cordova environment
if (window.cordova) {
  document.addEventListener('deviceready', () => {
    console.log('📱 Cordova device ready')
    initApp()
  }, false)
} else {
  // Browser development mode
  console.log('🌐 Running in browser mode')
  initApp()
}
