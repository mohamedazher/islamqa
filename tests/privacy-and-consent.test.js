import { beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const firebaseMocks = vi.hoisted(() => ({
  initializeApp: vi.fn(() => ({ name: 'app' })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({ name: 'app' })),
  getAuth: vi.fn(() => ({ currentUser: null })),
  signInAnonymously: vi.fn(async () => ({ user: { uid: 'anonymous-user' } })),
  signOut: vi.fn(async () => {}),
  getFirestore: vi.fn(() => ({ name: 'firestore' })),
  enableIndexedDbPersistence: vi.fn(async () => {})
}))

vi.mock('firebase/app', () => ({
  initializeApp: firebaseMocks.initializeApp,
  getApps: firebaseMocks.getApps,
  getApp: firebaseMocks.getApp
}))

vi.mock('firebase/auth', () => ({
  getAuth: firebaseMocks.getAuth,
  signInAnonymously: firebaseMocks.signInAnonymously,
  signOut: firebaseMocks.signOut
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: firebaseMocks.getFirestore,
  enableIndexedDbPersistence: firebaseMocks.enableIndexedDbPersistence
}))

class MemoryStorage {
  constructor() { this.values = new Map() }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
  clear() { this.values.clear() }
}

class TestCustomEvent extends Event {
  constructor(type, options = {}) {
    super(type)
    this.detail = options.detail
  }
}

const storage = new MemoryStorage()
const eventTarget = new EventTarget()

beforeEach(() => {
  storage.clear()
  vi.clearAllMocks()
  globalThis.localStorage = storage
  globalThis.CustomEvent = TestCustomEvent
  globalThis.window = Object.assign(eventTarget, {
    screen: { width: 390, height: 844, colorDepth: 24 },
    devicePixelRatio: 3
  })
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    userAgent: 'test-agent',
    maxTouchPoints: 1,
    language: 'en-US',
    languages: ['en-US'],
    cookieEnabled: true,
    onLine: true,
    hardwareConcurrency: 8
  } })
  globalThis.document = { querySelector: vi.fn(() => null) }
  globalThis.fetch = vi.fn()
})

describe('privacy consent state', () => {
  it('defaults every external flow to off and emits explicit updates', async () => {
    const privacy = await import('../src/services/privacyConsent.js')
    expect(privacy.getConsentPreferences()).toMatchObject({
      analytics: false,
      clarity: false,
      leaderboard: false,
      onlineSearch: false,
      locationServices: false,
      askedUser: false
    })

    const listener = vi.fn()
    window.addEventListener('consent-changed', listener, { once: true })
    privacy.updateConsent('onlineSearch', true)
    expect(privacy.isOnlineSearchEnabled()).toBe(true)
    expect(listener).toHaveBeenCalledOnce()
  })
})

describe('lazy leaderboard Firebase', () => {
  it('does not initialize Firebase or authenticate merely by importing the module', async () => {
    vi.resetModules()
    await import('../src/services/firebase.js')
    expect(firebaseMocks.initializeApp).not.toHaveBeenCalled()
    expect(firebaseMocks.getFirestore).not.toHaveBeenCalled()
    expect(firebaseMocks.signInAnonymously).not.toHaveBeenCalled()
  })

  it('initializes and authenticates only after leaderboard consent', async () => {
    vi.resetModules()
    const privacy = await import('../src/services/privacyConsent.js')
    const firebase = await import('../src/services/firebase.js')

    expect(await firebase.ensureAuthenticated()).toBeNull()
    expect(firebaseMocks.initializeApp).not.toHaveBeenCalled()

    privacy.updateConsent('leaderboard', true)
    await expect(firebase.ensureAuthenticated()).resolves.toMatchObject({ uid: 'anonymous-user' })
    expect(firebaseMocks.initializeApp).toHaveBeenCalledOnce()
    expect(firebaseMocks.getFirestore).toHaveBeenCalledOnce()
    expect(firebaseMocks.signInAnonymously).toHaveBeenCalledOnce()
  })

  it('shares concurrent authentication and preserves the anonymous identity across opt-out', async () => {
    vi.resetModules()
    const privacy = await import('../src/services/privacyConsent.js')
    const firebase = await import('../src/services/firebase.js')
    privacy.updateConsent('leaderboard', true)

    const [first, second] = await Promise.all([
      firebase.ensureAuthenticated(),
      firebase.ensureAuthenticated()
    ])
    expect(first.uid).toBe('anonymous-user')
    expect(second.uid).toBe('anonymous-user')
    expect(firebaseMocks.signInAnonymously).toHaveBeenCalledOnce()

    privacy.updateConsent('leaderboard', false)
    await firebase.disableFirebaseParticipation()
    expect(firebaseMocks.signOut).not.toHaveBeenCalled()

    privacy.updateConsent('leaderboard', true)
    await expect(firebase.ensureAuthenticated()).resolves.toMatchObject({ uid: 'anonymous-user' })
    expect(firebaseMocks.signInAnonymously).toHaveBeenCalledOnce()
  })
})

describe('external payload controls', () => {
  it('omits feedback device diagnostics unless the user selects them', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    const { sendFeedback } = await import('../src/services/contactUsService.js')

    await sendFeedback('reader@example.com', 'A useful message', 'general', false)
    const firstPayload = JSON.parse(fetch.mock.calls[0][1].body)
    expect(firstPayload).not.toHaveProperty('device')
    expect(firstPayload).not.toHaveProperty('user_agent')

    await sendFeedback('reader@example.com', 'A useful message', 'general', true)
    const secondPayload = JSON.parse(fetch.mock.calls[1][1].body)
    expect(secondPayload.device).toBeTruthy()
    expect(secondPayload.user_agent).toBe('test-agent')
  })

  it('does not call Nominatim when online location lookup is disabled', async () => {
    const { default: prayerTimesService } = await import('../src/services/prayerTimesService.js')
    await expect(prayerTimesService.reverseGeocode(21.4225, 39.8262))
      .rejects.toThrow('Online place-name lookup is disabled')
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('iOS analytics privacy configuration', () => {
  it('does not ship ATT or the IDFA plugin, and starts Firebase collection disabled', () => {
    const here = path.dirname(fileURLToPath(import.meta.url))
    const config = fs.readFileSync(path.join(here, '..', 'config.xml'), 'utf8')
    const packageJson = fs.readFileSync(path.join(here, '..', 'package.json'), 'utf8')
    expect(config).not.toContain('NSUserTrackingUsageDescription')
    expect(config).toContain('name="ANALYTICS_COLLECTION_ENABLED" value="false"')
    expect(config).toContain('name="AUTOMATIC_SCREEN_REPORTING_ENABLED" value="false"')
    expect(packageJson).not.toContain('cordova-plugin-idfa')
  })

  it('ships only the in-use location purpose required for prayer times and Qibla', () => {
    const here = path.dirname(fileURLToPath(import.meta.url))
    const config = fs.readFileSync(path.join(here, '..', 'config.xml'), 'utf8')
    const unusedPurposeKeys = [
      'NSLocationAlwaysAndWhenInUseUsageDescription',
      'NSLocationAlwaysUsageDescription',
      'NSBluetoothPeripheralUsageDescription',
      'NSBluetoothAlwaysUsageDescription',
      'NSLocalNetworkUsageDescription',
      'NSBonjourServices',
      'NSCameraUsageDescription',
      'NSPhotoLibraryUsageDescription',
      'NSMicrophoneUsageDescription',
      'NSContactsUsageDescription',
      'NSCalendarsUsageDescription',
      'NSRemindersUsageDescription',
      'NSMotionUsageDescription'
    ]

    const packageJson = fs.readFileSync(path.join(here, '..', 'package.json'), 'utf8')
    const iosPreparation = fs.readFileSync(path.join(here, '..', 'scripts', 'cordova', 'prepare-ios.js'), 'utf8')
    expect(config).toContain('We need your location to calculate accurate prayer times and Qibla direction for your area.')
    expect(config).toContain('name="deployment-target" value="15.0"')
    expect(packageJson).not.toContain('cordova.plugins.diagnostic')
    expect(iosPreparation).toContain('requestWhenInUseAuthorization')
    expect(iosPreparation).toContain('requestAlwaysAuthorization')
    for (const key of unusedPurposeKeys) {
      expect(config).not.toContain(key)
    }
  })
})
