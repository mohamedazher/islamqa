/**
 * Prayer Times Service
 * High-precision Islamic prayer times calculation using the adhan library
 * Supports multiple calculation methods, location detection, and user preferences
 */

import { Coordinates, CalculationMethod, PrayerTimes, Prayer, Qibla, Madhab, HighLatitudeRule } from 'adhan'
import locationPermission from './locationPermission'

// Storage keys
const STORAGE_KEYS = {
  LOCATION: 'prayer_location',
  CALCULATION_METHOD: 'prayer_calculation_method',
  MADHAB: 'prayer_madhab',
  LOCATION_NAME: 'prayer_location_name',
  HIGH_LATITUDE_RULE: 'prayer_high_latitude_rule'
}

// Calculation methods with metadata
export const CALCULATION_METHODS = {
  MUSLIM_WORLD_LEAGUE: {
    key: 'MUSLIM_WORLD_LEAGUE',
    name: 'Muslim World League',
    description: 'Standard Fajr (18°) and Isha (17°)',
    regions: ['Europe', 'Far East', 'Parts of America']
  },
  EGYPTIAN: {
    key: 'EGYPTIAN',
    name: 'Egyptian General Authority',
    description: 'Early Fajr (19.5°) and Isha (17.5°)',
    regions: ['Africa', 'Syria', 'Lebanon', 'Malaysia']
  },
  KARACHI: {
    key: 'KARACHI',
    name: 'University of Islamic Sciences, Karachi',
    description: 'Standard angles (18°)',
    regions: ['Pakistan', 'Bangladesh', 'India', 'Afghanistan']
  },
  UMM_AL_QURA: {
    key: 'UMM_AL_QURA',
    name: 'Umm Al-Qura University, Makkah',
    description: 'Fajr (18.5°), Isha 90 min after Maghrib',
    regions: ['Saudi Arabia'],
    note: 'Add 30 min to Isha during Ramadan'
  },
  DUBAI: {
    key: 'DUBAI',
    name: 'Dubai',
    description: 'Fajr (18.2°) with offsets',
    regions: ['United Arab Emirates']
  },
  QATAR: {
    key: 'QATAR',
    name: 'Qatar',
    description: 'Isha 90 min after Maghrib',
    regions: ['Qatar']
  },
  KUWAIT: {
    key: 'KUWAIT',
    name: 'Kuwait',
    description: 'Fajr (18°), Isha (17.5°)',
    regions: ['Kuwait']
  },
  MOONSIGHTING_COMMITTEE: {
    key: 'MOONSIGHTING_COMMITTEE',
    name: 'Moonsighting Committee',
    description: 'Standard angles with seasonal adjustments',
    regions: ['North America', 'United Kingdom']
  },
  SINGAPORE: {
    key: 'SINGAPORE',
    name: 'Singapore',
    description: 'Early Fajr (20°), standard Isha (18°)',
    regions: ['Singapore', 'Malaysia', 'Indonesia']
  },
  TURKEY: {
    key: 'TURKEY',
    name: 'Turkey (Diyanet)',
    description: 'Approximation of Diyanet method',
    regions: ['Turkey']
  },
  TEHRAN: {
    key: 'TEHRAN',
    name: 'Institute of Geophysics, Tehran',
    description: 'Fajr (17.7°), Isha (14°)',
    regions: ['Iran']
  },
  NORTH_AMERICA: {
    key: 'NORTH_AMERICA',
    name: 'ISNA (North America)',
    description: 'Later Fajr (15°) and early Isha (15°)',
    regions: ['United States', 'Canada']
  },
  KUWAIT_CUSTOM: {
    key: 'KUWAIT_CUSTOM',
    name: 'Kuwait (Custom)',
    description: 'Custom Kuwait calculation',
    regions: ['Kuwait']
  }
}

// Madhab options for Asr calculation
export const MADHAB_OPTIONS = {
  SHAFI: {
    key: 'SHAFI',
    name: 'Shafi, Maliki, Hanbali',
    description: 'Earlier Asr (shadow length = object + shadow)'
  },
  HANAFI: {
    key: 'HANAFI',
    name: 'Hanafi',
    description: 'Later Asr (shadow length = 2x object + shadow)'
  }
}

// High latitude rules for polar regions
export const HIGH_LATITUDE_RULES = {
  MIDDLE_OF_NIGHT: {
    key: 'MIDDLE_OF_NIGHT',
    name: 'Middle of the Night',
    description: 'Fajr/Isha calculated from middle of night'
  },
  SEVENTH_OF_NIGHT: {
    key: 'SEVENTH_OF_NIGHT',
    name: 'Seventh of the Night',
    description: 'Fajr/Isha calculated from 1/7 of night'
  },
  TWILIGHT_ANGLE: {
    key: 'TWILIGHT_ANGLE',
    name: 'Twilight Angle',
    description: 'Use twilight angle (default)'
  }
}

class PrayerTimesService {
  constructor() {
    this.location = this.loadLocation()
    this.calculationMethod = this.loadCalculationMethod()
    this.madhab = this.loadMadhab()
    this.locationName = this.loadLocationName()
    this.highLatitudeRule = this.loadHighLatitudeRule()
  }

  /**
   * Load saved location from localStorage
   */
  loadLocation() {
    const stored = localStorage.getItem(STORAGE_KEYS.LOCATION)
    if (stored) {
      try {
        const { latitude, longitude } = JSON.parse(stored)
        return { latitude, longitude }
      } catch (e) {
        console.error('Failed to parse stored location:', e)
      }
    }
    return null
  }

  /**
   * Save location to localStorage
   */
  saveLocation(latitude, longitude, locationName = null) {
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify({ latitude, longitude }))
    if (locationName) {
      localStorage.setItem(STORAGE_KEYS.LOCATION_NAME, locationName)
      this.locationName = locationName
    }
    this.location = { latitude, longitude }
  }

  /**
   * Get location name
   */
  loadLocationName() {
    return localStorage.getItem(STORAGE_KEYS.LOCATION_NAME) || 'Unknown Location'
  }

  /**
   * Load calculation method from localStorage
   */
  loadCalculationMethod() {
    const stored = localStorage.getItem(STORAGE_KEYS.CALCULATION_METHOD)
    return stored || 'UMM_AL_QURA' // Default to Saudi Arabia
  }

  /**
   * Save calculation method to localStorage
   */
  saveCalculationMethod(method) {
    localStorage.setItem(STORAGE_KEYS.CALCULATION_METHOD, method)
    this.calculationMethod = method
  }

  /**
   * Load madhab from localStorage
   */
  loadMadhab() {
    const stored = localStorage.getItem(STORAGE_KEYS.MADHAB)
    return stored || 'HANAFI' // Default to Hanafi madhab
  }

  /**
   * Save madhab to localStorage
   */
  saveMadhab(madhab) {
    localStorage.setItem(STORAGE_KEYS.MADHAB, madhab)
    this.madhab = madhab
  }

  /**
   * Load high latitude rule from localStorage
   */
  loadHighLatitudeRule() {
    const stored = localStorage.getItem(STORAGE_KEYS.HIGH_LATITUDE_RULE)
    return stored || 'MIDDLE_OF_NIGHT'
  }

  /**
   * Save high latitude rule to localStorage
   */
  saveHighLatitudeRule(rule) {
    localStorage.setItem(STORAGE_KEYS.HIGH_LATITUDE_RULE, rule)
    this.highLatitudeRule = rule
  }

  /**
   * Get user's location using browser/Cordova geolocation API
   * @param {boolean} skipPermissionCheck - Skip permission check (for retry after settings)
   * @returns {Promise<Object>} { latitude, longitude, locationName, permissionDenied }
   */
  async detectLocation(skipPermissionCheck = false) {
    // Check permission status first (for Cordova apps)
    if (!skipPermissionCheck && window.cordova) {
      const permissionCheck = await locationPermission.checkPermissionWithMessage()

      if (!permissionCheck.hasPermission) {
        // Request permission if we can
        if (permissionCheck.canRequest) {
          const granted = await locationPermission.requestPermission()
          if (!granted) {
            const error = new Error(permissionCheck.message)
            error.permissionDenied = true
            error.shouldShowSettings = false
            throw error
          }
        } else {
          // Permission permanently denied or location services disabled
          const error = new Error(permissionCheck.message)
          error.permissionDenied = true
          error.shouldShowSettings = permissionCheck.shouldShowSettings
          throw error
        }
      }
    }

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your device'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          // Try to get location name using reverse geocoding
          // Note: We use .then() instead of async/await because iOS Cordova
          // doesn't accept async functions for geolocation callbacks
          this.reverseGeocode(latitude, longitude)
            .then((locationName) => {
              this.saveLocation(latitude, longitude, locationName)
              resolve({
                latitude,
                longitude,
                locationName,
                permissionDenied: false
              })
            })
            .catch((e) => {
              console.warn('Could not get location name:', e)
              // Still save location even if reverse geocoding fails
              const locationName = 'Current Location'
              this.saveLocation(latitude, longitude, locationName)
              resolve({
                latitude,
                longitude,
                locationName,
                permissionDenied: false
              })
            })
        },
        (error) => {
          // Provide more helpful error messages
          let errorMessage = 'Location detection failed'
          let permissionDenied = false
          let shouldShowSettings = false

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your device settings.'
              permissionDenied = true
              shouldShowSettings = true
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your device settings.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.'
              break
            default:
              errorMessage = `Location detection failed: ${error.message}`
          }

          const err = new Error(errorMessage)
          err.permissionDenied = permissionDenied
          err.shouldShowSettings = shouldShowSettings
          reject(err)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  /**
   * Check if location permission is granted
   * @returns {Promise<boolean>}
   */
  async hasLocationPermission() {
    return await locationPermission.isLocationAuthorized()
  }

  /**
   * Get location permission status with details
   * @returns {Promise<Object>}
   */
  async getPermissionStatus() {
    return await locationPermission.getPermissionStatus()
  }

  /**
   * Open device settings to allow user to enable location permission
   */
  openLocationSettings() {
    locationPermission.openDeviceSettings()
  }

  /**
   * Reverse geocode coordinates to get location name
   * Uses OpenStreetMap Nominatim API (free, no API key required)
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
        {
          headers: {
            'User-Agent': 'IslamQA App'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding failed')
      }

      const data = await response.json()

      // Extract city/town/village name
      const address = data.address || {}
      const locationName =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        address.state ||
        address.country ||
        'Unknown Location'

      return locationName
    } catch (e) {
      console.error('Reverse geocoding error:', e)
      throw e
    }
  }

  /**
   * Get calculation parameters based on selected method
   */
  getCalculationParams() {
    const method = this.calculationMethod
    let params

    // Map calculation method to adhan method
    switch (method) {
      case 'MUSLIM_WORLD_LEAGUE':
        params = CalculationMethod.MuslimWorldLeague()
        break
      case 'EGYPTIAN':
        params = CalculationMethod.Egyptian()
        break
      case 'KARACHI':
        params = CalculationMethod.Karachi()
        break
      case 'UMM_AL_QURA':
        params = CalculationMethod.UmmAlQura()
        break
      case 'DUBAI':
        params = CalculationMethod.Dubai()
        break
      case 'QATAR':
        params = CalculationMethod.Qatar()
        break
      case 'KUWAIT':
        params = CalculationMethod.Kuwait()
        break
      case 'MOONSIGHTING_COMMITTEE':
        params = CalculationMethod.MoonsightingCommittee()
        break
      case 'SINGAPORE':
        params = CalculationMethod.Singapore()
        break
      case 'TURKEY':
        params = CalculationMethod.Turkey()
        break
      case 'TEHRAN':
        params = CalculationMethod.Tehran()
        break
      case 'NORTH_AMERICA':
        params = CalculationMethod.NorthAmerica()
        break
      default:
        params = CalculationMethod.MuslimWorldLeague()
    }

    // Set madhab
    if (this.madhab === 'HANAFI') {
      params.madhab = Madhab.Hanafi
    } else {
      params.madhab = Madhab.Shafi
    }

    // Set high latitude rule
    switch (this.highLatitudeRule) {
      case 'MIDDLE_OF_NIGHT':
        params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight
        break
      case 'SEVENTH_OF_NIGHT':
        params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight
        break
      case 'TWILIGHT_ANGLE':
        params.highLatitudeRule = HighLatitudeRule.TwilightAngle
        break
      default:
        params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight
    }

    return params
  }

  /**
   * Calculate prayer times for a specific date
   */
  getPrayerTimes(date = new Date()) {
    if (!this.location) {
      throw new Error('Location not set. Please set location first.')
    }

    const coordinates = new Coordinates(
      this.location.latitude,
      this.location.longitude
    )

    const params = this.getCalculationParams()
    const prayerTimes = new PrayerTimes(coordinates, date, params)

    return {
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
      // Additional info
      currentPrayer: prayerTimes.currentPrayer(),
      nextPrayer: prayerTimes.nextPrayer(),
      timeForPrayer: (prayer) => prayerTimes.timeForPrayer(prayer)
    }
  }

  /**
   * Get formatted prayer times (12-hour format)
   */
  getFormattedPrayerTimes(date = new Date()) {
    const times = this.getPrayerTimes(date)

    return {
      fajr: this.formatTime(times.fajr),
      sunrise: this.formatTime(times.sunrise),
      dhuhr: this.formatTime(times.dhuhr),
      asr: this.formatTime(times.asr),
      maghrib: this.formatTime(times.maghrib),
      isha: this.formatTime(times.isha),
      currentPrayer: times.currentPrayer,
      nextPrayer: times.nextPrayer
    }
  }

  /**
   * Format time to 12-hour format with AM/PM
   */
  formatTime(date) {
    if (!date) return '--:--'

    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')

    return `${displayHours}:${displayMinutes} ${ampm}`
  }

  /**
   * Get time remaining until next prayer
   */
  getTimeUntilNextPrayer() {
    if (!this.location) return null

    const times = this.getPrayerTimes()
    const nextPrayer = times.nextPrayer

    if (!nextPrayer) return null

    const nextPrayerTime = times.timeForPrayer(nextPrayer)
    const now = new Date()
    const diff = nextPrayerTime - now

    if (diff <= 0) return null

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return {
      prayer: this.getPrayerName(nextPrayer),
      hours,
      minutes,
      seconds,
      totalSeconds: Math.floor(diff / 1000)
    }
  }

  /**
   * Get current prayer name
   */
  getCurrentPrayerName() {
    if (!this.location) return null

    const times = this.getPrayerTimes()
    const currentPrayer = times.currentPrayer

    return currentPrayer ? this.getPrayerName(currentPrayer) : null
  }

  /**
   * Get prayer name from Prayer enum
   */
  getPrayerName(prayer) {
    const names = {
      [Prayer.Fajr]: 'Fajr',
      [Prayer.Sunrise]: 'Sunrise',
      [Prayer.Dhuhr]: 'Dhuhr',
      [Prayer.Asr]: 'Asr',
      [Prayer.Maghrib]: 'Maghrib',
      [Prayer.Isha]: 'Isha',
      [Prayer.None]: 'None'
    }
    return names[prayer] || 'Unknown'
  }

  /**
   * Get all prayer windows (start and end times for each prayer)
   * Prayer windows:
   * - Fajr: Fajr time → Sunrise
   * - Dhuhr: Dhuhr time → Asr time
   * - Asr: Asr time → Maghrib time
   * - Maghrib: Maghrib time → Isha time
   * - Isha: Isha time → Fajr time (next day)
   */
  getPrayerWindows(date = new Date()) {
    if (!this.location) {
      throw new Error('Location not set. Please set location first.')
    }

    const times = this.getPrayerTimes(date)

    // Get tomorrow's Fajr for Isha end time
    const tomorrow = new Date(date)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowTimes = this.getPrayerTimes(tomorrow)

    return [
      {
        name: 'Fajr',
        prayer: Prayer.Fajr,
        start: times.fajr,
        end: times.sunrise,
        startFormatted: this.formatTime(times.fajr),
        endFormatted: this.formatTime(times.sunrise)
      },
      {
        name: 'Dhuhr',
        prayer: Prayer.Dhuhr,
        start: times.dhuhr,
        end: times.asr,
        startFormatted: this.formatTime(times.dhuhr),
        endFormatted: this.formatTime(times.asr)
      },
      {
        name: 'Asr',
        prayer: Prayer.Asr,
        start: times.asr,
        end: times.maghrib,
        startFormatted: this.formatTime(times.asr),
        endFormatted: this.formatTime(times.maghrib)
      },
      {
        name: 'Maghrib',
        prayer: Prayer.Maghrib,
        start: times.maghrib,
        end: times.isha,
        startFormatted: this.formatTime(times.maghrib),
        endFormatted: this.formatTime(times.isha)
      },
      {
        name: 'Isha',
        prayer: Prayer.Isha,
        start: times.isha,
        end: tomorrowTimes.fajr,
        startFormatted: this.formatTime(times.isha),
        endFormatted: this.formatTime(tomorrowTimes.fajr)
      }
    ]
  }

  /**
   * Get current prayer window (which prayer time we're in)
   */
  getCurrentPrayerWindow() {
    if (!this.location) return null

    const windows = this.getPrayerWindows()
    const now = new Date()

    for (const window of windows) {
      if (now >= window.start && now < window.end) {
        return window
      }
    }

    return null
  }

  /**
   * Get time remaining in current prayer window
   */
  getTimeRemainingInCurrentPrayer() {
    const currentWindow = this.getCurrentPrayerWindow()
    if (!currentWindow) return null

    const now = new Date()
    const diff = currentWindow.end - now

    if (diff <= 0) return null

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return {
      prayer: currentWindow.name,
      hours,
      minutes,
      seconds,
      totalSeconds: Math.floor(diff / 1000),
      endTime: this.formatTime(currentWindow.end)
    }
  }

  /**
   * Get time until a specific prayer starts
   */
  getTimeUntilPrayerStarts(prayerWindow) {
    const now = new Date()
    const diff = prayerWindow.start - now

    if (diff <= 0) return null

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return {
      hours,
      minutes,
      seconds,
      totalSeconds: Math.floor(diff / 1000)
    }
  }

  /**
   * Get status for each prayer (upcoming, current, or past)
   */
  getPrayerStatuses() {
    if (!this.location) return []

    const windows = this.getPrayerWindows()
    const now = new Date()

    return windows.map(window => {
      const isCurrent = now >= window.start && now < window.end
      const isPast = now >= window.end
      const isUpcoming = now < window.start

      let countdown = null
      let status = 'upcoming'

      if (isCurrent) {
        status = 'current'
        const diff = window.end - now
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        countdown = {
          type: 'ends',
          hours,
          minutes,
          seconds,
          totalSeconds: Math.floor(diff / 1000)
        }
      } else if (isUpcoming) {
        status = 'upcoming'
        const diff = window.start - now
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        countdown = {
          type: 'starts',
          hours,
          minutes,
          seconds,
          totalSeconds: Math.floor(diff / 1000)
        }
      } else {
        status = 'past'
      }

      return {
        ...window,
        status,
        countdown,
        isCurrent,
        isPast,
        isUpcoming
      }
    })
  }

  /**
   * Calculate Qibla direction from current location
   */
  getQiblaDirection() {
    if (!this.location) {
      throw new Error('Location not set. Please set location first.')
    }

    const coordinates = new Coordinates(
      this.location.latitude,
      this.location.longitude
    )

    const qiblaDirection = Qibla(coordinates)
    return Math.round(qiblaDirection)
  }

  /**
   * Check if location is set
   */
  hasLocation() {
    return this.location !== null
  }

  /**
   * Get current time period for dynamic styling
   * @returns {Object} { period: 'fajr'|'day'|'maghrib'|'night', prayer: 'Fajr'|'Dhuhr'|'Asr'|'Maghrib'|'Isha' }
   */
  getTimePeriod() {
    if (!this.location) {
      return { period: 'day', prayer: null }
    }

    try {
      const times = this.getPrayerTimes()
      const now = new Date()

      // Determine time period based on prayer times
      if (now >= times.fajr && now < times.sunrise) {
        return { period: 'fajr', prayer: 'Fajr' }
      } else if (now >= times.sunrise && now < times.maghrib) {
        // Daytime (between sunrise and maghrib)
        return { period: 'day', prayer: now >= times.dhuhr ? (now >= times.asr ? 'Asr' : 'Dhuhr') : 'Sunrise' }
      } else if (now >= times.maghrib && now < times.isha) {
        return { period: 'maghrib', prayer: 'Maghrib' }
      } else {
        // Night time (after Isha or before Fajr)
        return { period: 'night', prayer: 'Isha' }
      }
    } catch (e) {
      console.error('Failed to get time period:', e)
      return { period: 'day', prayer: null }
    }
  }

  /**
   * Get gradient colors for current time period
   * @returns {Object} { from: string, to: string, via: string }
   */
  getTimePeriodGradient() {
    const { period } = this.getTimePeriod()

    const gradients = {
      fajr: {
        // Dawn - purple to orange/pink
        from: 'from-purple-600 dark:from-purple-700',
        via: 'via-pink-500 dark:via-pink-600',
        to: 'to-orange-500 dark:to-orange-600'
      },
      day: {
        // Daytime - blue to cyan
        from: 'from-sky-500 dark:from-sky-600',
        via: 'via-cyan-500 dark:via-cyan-600',
        to: 'to-teal-500 dark:to-teal-600'
      },
      maghrib: {
        // Sunset - orange to red/purple
        from: 'from-orange-500 dark:from-orange-600',
        via: 'via-red-500 dark:via-red-600',
        to: 'to-purple-600 dark:to-purple-700'
      },
      night: {
        // Night - dark blue to purple
        from: 'from-indigo-800 dark:from-indigo-900',
        via: 'via-purple-800 dark:via-purple-900',
        to: 'to-slate-900 dark:to-black'
      }
    }

    return gradients[period] || gradients.day
  }

  /**
   * Get icon name for current time period
   * @returns {string}
   */
  getTimePeriodIcon() {
    const { period } = this.getTimePeriod()

    const icons = {
      fajr: 'sun',      // Dawn/sunrise
      day: 'sun',       // Bright sun
      maghrib: 'moon',  // Sunset/dusk
      night: 'moon'     // Night moon
    }

    return icons[period] || 'sun'
  }

  /**
   * Reload all settings from localStorage
   * This ensures the service instance has the latest saved values
   */
  reloadSettings() {
    this.location = this.loadLocation()
    this.locationName = this.loadLocationName()
    this.calculationMethod = this.loadCalculationMethod()
    this.madhab = this.loadMadhab()
    this.highLatitudeRule = this.loadHighLatitudeRule()
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      location: this.location,
      locationName: this.locationName,
      calculationMethod: this.calculationMethod,
      calculationMethodName: CALCULATION_METHODS[this.calculationMethod]?.name || 'Unknown',
      madhab: this.madhab,
      madhabName: MADHAB_OPTIONS[this.madhab]?.name || 'Unknown',
      highLatitudeRule: this.highLatitudeRule,
      highLatitudeRuleName: HIGH_LATITUDE_RULES[this.highLatitudeRule]?.name || 'Unknown'
    }
  }

  /**
   * Update native widget with current prayer data
   * Call this whenever prayer data changes (recommended: every minute)
   */
  updateWidget() {
    // Check if widget plugin is available
    if (!window.PrayerWidget) {
      console.log('PrayerWidget plugin not available')
      return
    }

    if (!this.location) {
      console.log('Location not set, skipping widget update')
      return
    }

    try {
      const nextPrayer = this.getTimeUntilNextPrayer()
      const currentWindow = this.getCurrentPrayerWindow()
      const times = this.getPrayerTimes()
      const formattedTimes = this.getFormattedPrayerTimes()

      // Prepare widget data with all 5 prayer times
      const widgetData = {
        // All prayer times (excluding Sunrise as it's not a prayer)
        fajr: formattedTimes.fajr,
        dhuhr: formattedTimes.dhuhr,
        asr: formattedTimes.asr,
        maghrib: formattedTimes.maghrib,
        isha: formattedTimes.isha,

        // Current/Next prayer info
        nextPrayer: nextPrayer?.prayer || 'Fajr',
        nextPrayerTime: nextPrayer ? this.formatTime(times.timeForPrayer(
          this.getPrayerEnumFromName(nextPrayer.prayer)
        )) : '--:--',
        timeRemaining: this.formatWidgetTime(nextPrayer),
        currentPrayer: currentWindow?.name || '',
        currentPrayerEnd: currentWindow ? this.formatTime(currentWindow.end) : ''
      }

      // Update widget
      window.PrayerWidget.updateWidget(
        widgetData,
        () => console.log('Widget updated successfully:', widgetData),
        (error) => console.error('Widget update failed:', error)
      )
    } catch (error) {
      console.error('Error updating widget:', error)
    }
  }

  /**
   * Format time for widget display
   * Returns formatted string like "2h 15m" or "45m" or "30s"
   */
  formatWidgetTime(timeData) {
    if (!timeData) return '--:--'

    const { hours, minutes, seconds } = timeData

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m`
    } else {
      return `${seconds}s`
    }
  }

  /**
   * Get Prayer enum from prayer name string
   */
  getPrayerEnumFromName(name) {
    const map = {
      'Fajr': Prayer.Fajr,
      'Sunrise': Prayer.Sunrise,
      'Dhuhr': Prayer.Dhuhr,
      'Asr': Prayer.Asr,
      'Maghrib': Prayer.Maghrib,
      'Isha': Prayer.Isha
    }
    return map[name] || Prayer.Fajr
  }

  /**
   * Check if widget is installed
   */
  isWidgetInstalled(callback) {
    if (!window.PrayerWidget) {
      callback(false)
      return
    }

    window.PrayerWidget.isWidgetInstalled(
      (installed) => callback(installed === 1),
      () => callback(false)
    )
  }

  /**
   * Clear all settings
   */
  clearSettings() {
    localStorage.removeItem(STORAGE_KEYS.LOCATION)
    localStorage.removeItem(STORAGE_KEYS.LOCATION_NAME)
    localStorage.removeItem(STORAGE_KEYS.CALCULATION_METHOD)
    localStorage.removeItem(STORAGE_KEYS.MADHAB)
    localStorage.removeItem(STORAGE_KEYS.HIGH_LATITUDE_RULE)

    this.location = null
    this.locationName = 'Unknown Location'
    this.calculationMethod = 'MUSLIM_WORLD_LEAGUE'
    this.madhab = 'SHAFI'
    this.highLatitudeRule = 'MIDDLE_OF_NIGHT'
  }
}

// Export singleton instance
const prayerTimesService = new PrayerTimesService()
export default prayerTimesService
