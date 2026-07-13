import { ref } from 'vue'
import prayerTimesService from '../services/prayerTimesService'
import { isLocationServicesEnabled } from '../services/privacyConsent'

const THROTTLE_KEY = 'location_auto_detect_last'
const THROTTLE_MS = 30 * 60 * 1000 // 30 minutes
const DISTANCE_THRESHOLD_KM = 50

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useLocationAutoDetect() {
  const locationChanged = ref(false)
  const oldCity = ref('')
  const newCity = ref('')

  async function checkLocationChange() {
    try {
      if (!isLocationServicesEnabled()) return null
      // Only run if location was previously set
      const storedLocation = localStorage.getItem('prayer_location')
      if (!storedLocation) return null

      // Throttle: don't check more than once per 30 minutes
      const lastCheck = localStorage.getItem(THROTTLE_KEY)
      if (lastCheck && Date.now() - Number(lastCheck) < THROTTLE_MS) return null

      const stored = JSON.parse(storedLocation)
      if (!Number.isFinite(stored.latitude) || !Number.isFinite(stored.longitude)) return null
      const storedName = localStorage.getItem('prayer_location_name') || 'Unknown'

      // Acquire first without mutating the saved prayer location. The movement
      // threshold decides whether the new position is persisted.
      const result = await prayerTimesService.acquireLocation(true)
      if (!result || result.permissionDenied) return null

      const distance = haversineKm(
        stored.latitude, stored.longitude,
        result.latitude, result.longitude
      )

      if (distance >= DISTANCE_THRESHOLD_KM) {
        const locationName = await prayerTimesService.describeLocation(result.latitude, result.longitude)
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        prayerTimesService.saveLocation(result.latitude, result.longitude, locationName, timeZone)
        oldCity.value = storedName
        newCity.value = locationName
        locationChanged.value = true

        localStorage.setItem(THROTTLE_KEY, String(Date.now()))

        return { changed: true, oldCity: oldCity.value, newCity: newCity.value }
      }

      localStorage.setItem(THROTTLE_KEY, String(Date.now()))
      return { changed: false }
    } catch (err) {
      console.warn('Location auto-detect failed:', err)
      return null
    }
  }

  return { locationChanged, oldCity, newCity, checkLocationChange }
}
