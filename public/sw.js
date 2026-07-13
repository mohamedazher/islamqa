const CACHE_NAME = 'betterislam-shell-v1'

function isCacheable(request, url) {
  if (request.method !== 'GET' || url.origin !== self.location.origin) return false
  if (url.pathname.includes('/data/')) return false

  return request.mode === 'navigate' ||
    ['script', 'style', 'image', 'font'].includes(request.destination)
}

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('betterislam-shell-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (!isCacheable(event.request, url)) return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)

    try {
      const response = await fetch(event.request)
      if (response.ok) await cache.put(event.request, response.clone())
      return response
    } catch (error) {
      const cached = await cache.match(event.request)
      if (cached) return cached

      if (event.request.mode === 'navigate') {
        const basePath = new URL(self.registration.scope).pathname
        const shell = await cache.match(basePath)
        if (shell) return shell
      }

      throw error
    }
  })())
})
