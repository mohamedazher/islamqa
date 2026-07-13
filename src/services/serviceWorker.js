export async function registerServiceWorker() {
  const isCordova = Boolean(window.cordova) || window.location.protocol === 'file:'
  if (isCordova || !('serviceWorker' in navigator) || !import.meta.env.PROD) return null

  try {
    return await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL
    })
  } catch (error) {
    console.warn('Service worker registration failed; continuing online-only:', error)
    return null
  }
}
