import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

vi.mock('../src/services/privacyConsent.js', () => ({
  isLocationServicesEnabled: () => true
}))

class MemoryStorage {
  constructor() { this.values = new Map() }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
  clear() { this.values.clear() }
}

const storage = new MemoryStorage()
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

beforeEach(() => {
  storage.clear()
  globalThis.localStorage = storage
  globalThis.window = { cordova: null }
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { geolocation: null }
  })
  vi.useRealTimers()
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

async function freshService() {
  vi.resetModules()
  return (await import('../src/services/prayerTimesService.js')).default
}

describe('persisted prayer settings', () => {
  it('rejects invalid coordinates and safely migrates invalid saved values', async () => {
    localStorage.setItem('prayer_location', JSON.stringify({ latitude: 120, longitude: 999 }))
    localStorage.setItem('prayer_calculation_method', 'KUWAIT_CUSTOM')
    localStorage.setItem('prayer_madhab', 'INVALID')
    localStorage.setItem('prayer_high_latitude_rule', 'INVALID')
    localStorage.setItem('prayer_time_zone', 'Mars/Olympus')

    const service = await freshService()
    expect(service.hasLocation()).toBe(false)
    expect(service.getSettings()).toMatchObject({
      calculationMethod: 'UMM_AL_QURA',
      madhab: 'SHAFI',
      highLatitudeRule: 'MIDDLE_OF_NIGHT'
    })
    expect(() => service.saveLocation(Number.NaN, 10)).toThrow('Invalid location coordinates')
    expect(() => service.saveHighLatitudeRule('INVALID')).toThrow('Invalid high latitude rule')
  })

  it('formats prayer instants in the stored IANA timezone', async () => {
    const service = await freshService()
    service.saveLocation(21.4225, 39.8262, 'Makkah', 'Asia/Riyadh')
    const instant = new Date('2026-01-15T12:30:00Z')
    expect(service.formatTime(instant)).toBe('3:30 PM')
    service.saveTimeZone('America/New_York')
    expect(service.formatTime(instant)).toBe('7:30 AM')
  })
})

describe('prayer-day boundaries', () => {
  it('uses yesterday Isha before Fajr and tomorrow Fajr after Isha', async () => {
    const service = await freshService()
    service.saveLocation(21.4225, 39.8262, 'Makkah', 'Asia/Riyadh')
    const seed = new Date('2026-07-13T09:00:00Z')
    const today = service.getPrayerTimes(seed)

    vi.useFakeTimers()
    vi.setSystemTime(new Date(today.fajr.getTime() - 30 * 60 * 1000))
    expect(service.getCurrentPrayerWindow()?.name).toBe('Isha')

    vi.setSystemTime(new Date(today.isha.getTime() + 30 * 60 * 1000))
    const next = service.getTimeUntilNextPrayer()
    expect(next?.prayer).toBe('Fajr')
    expect(next.totalSeconds).toBeGreaterThan(0)
  })
})

describe('automatic movement detection', () => {
  it('does not overwrite a saved location below 50 km, but persists a real move', async () => {
    const service = await freshService()
    service.saveLocation(21.4225, 39.8262, 'Makkah', 'Asia/Riyadh')
    vi.spyOn(service, 'acquireLocation').mockResolvedValueOnce({ latitude: 21.5, longitude: 39.9 })
    vi.spyOn(service, 'describeLocation').mockResolvedValue('Madinah')

    const { useLocationAutoDetect } = await import('../src/composables/useLocationAutoDetect.js')
    const detector = useLocationAutoDetect()
    await expect(detector.checkLocationChange()).resolves.toEqual({ changed: false })
    expect(service.getSettings().location).toEqual({ latitude: 21.4225, longitude: 39.8262 })

    localStorage.removeItem('location_auto_detect_last')
    service.acquireLocation.mockResolvedValueOnce({ latitude: 24.4672, longitude: 39.6111 })
    await expect(detector.checkLocationChange()).resolves.toMatchObject({ changed: true, newCity: 'Madinah' })
    expect(service.getSettings().location).toEqual({ latitude: 24.4672, longitude: 39.6111 })
  })

  it('does not consume the throttle when GPS acquisition fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const service = await freshService()
    service.saveLocation(21.4225, 39.8262, 'Makkah')
    vi.spyOn(service, 'acquireLocation').mockRejectedValue(new Error('GPS unavailable'))
    const { useLocationAutoDetect } = await import('../src/composables/useLocationAutoDetect.js')
    await useLocationAutoDetect().checkLocationChange()
    expect(localStorage.getItem('location_auto_detect_last')).toBeNull()
  })
})

describe('reverse geocoding', () => {
  it('aborts a stalled place-name request', async () => {
    vi.useFakeTimers()
    globalThis.fetch = vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))
    }))
    const service = await freshService()
    const request = service.reverseGeocode(21.4225, 39.8262)
    const assertion = expect(request).rejects.toThrow('Place-name lookup timed out')
    await vi.advanceTimersByTimeAsync(8000)
    await assertion
  })
})

describe('home prayer location CTA', () => {
  it('requests consent and detects directly instead of routing through app settings', () => {
    const component = fs.readFileSync(
      path.join(root, 'src/components/home/PrayerTimesCard.vue'),
      'utf8'
    )
    const detectionFlow = component.slice(
      component.indexOf('const detectLocation = async'),
      component.indexOf('const handleLocationErrorAction')
    )

    expect(detectionFlow).toContain("updateConsent('locationServices', true)")
    expect(detectionFlow).toContain('await prayerTimesService.detectLocation()')
    expect(detectionFlow).not.toContain("emit('openSettings')")
    expect(detectionFlow).not.toContain("router.push('/settings')")
    expect(component).toContain("prayerTimesService.openLocationSettings()")
    expect(component).toContain("locationErrorAction.value = 'manual'")
  })
})
