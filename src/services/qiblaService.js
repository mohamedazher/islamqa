/**
 * Qibla Service
 * Provides Qibla direction calculation and compass functionality
 * Uses the adhan library for Qibla calculation and cordova-plugin-device-orientation for compass
 */

import { Qibla, Coordinates } from 'adhan'
import prayerTimesService from './prayerTimesService'

// Kaaba coordinates for distance calculation
const KAABA_LAT = 21.4225
const KAABA_LON = 39.8262

class QiblaService {
  constructor() {
    this.watchId = null
    this.isCordova = !!window.cordova
    this.compassAvailable = false
    this.lastHeading = null
    this.calibrationNeeded = false
  }

  /**
   * Check if compass is available on the device
   * @returns {Promise<boolean>}
   */
  async isCompassAvailable() {
    if (!this.isCordova) {
      // Check for Web Compass API (DeviceOrientationEvent)
      if (typeof DeviceOrientationEvent !== 'undefined') {
        // iOS 13+ requires permission
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          try {
            const permission = await DeviceOrientationEvent.requestPermission()
            this.compassAvailable = permission === 'granted'
            return this.compassAvailable
          } catch (e) {
            console.warn('[QiblaService] DeviceOrientation permission denied:', e)
            this.compassAvailable = false
            return false
          }
        }
        // Non-iOS or older iOS
        this.compassAvailable = true
        return true
      }
      this.compassAvailable = false
      return false
    }

    // Cordova - check for compass plugin
    return new Promise((resolve) => {
      if (navigator.compass) {
        navigator.compass.getCurrentHeading(
          () => {
            this.compassAvailable = true
            resolve(true)
          },
          (error) => {
            console.warn('[QiblaService] Compass not available:', error)
            this.compassAvailable = false
            resolve(false)
          }
        )
      } else {
        this.compassAvailable = false
        resolve(false)
      }
    })
  }

  /**
   * Get user's current location from prayer times service or detect new
   * @returns {Object|null} { latitude, longitude } or null
   */
  getLocation() {
    if (prayerTimesService.hasLocation()) {
      const settings = prayerTimesService.getSettings()
      return {
        latitude: settings.latitude,
        longitude: settings.longitude,
        locationName: settings.locationName
      }
    }
    return null
  }

  /**
   * Calculate Qibla direction from a given location
   * @param {number} latitude
   * @param {number} longitude
   * @returns {number} Qibla bearing in degrees from North (0-360)
   */
  calculateQiblaDirection(latitude, longitude) {
    const coordinates = new Coordinates(latitude, longitude)
    return Qibla.qibla(coordinates)
  }

  /**
   * Get Qibla direction from stored location
   * @returns {number|null} Qibla bearing or null if no location
   */
  getQiblaDirection() {
    const location = this.getLocation()
    if (!location) return null
    return this.calculateQiblaDirection(location.latitude, location.longitude)
  }

  /**
   * Calculate distance to Kaaba in kilometers
   * @param {number} latitude
   * @param {number} longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistanceToKaaba(latitude, longitude) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRad(KAABA_LAT - latitude)
    const dLon = this.toRad(KAABA_LON - longitude)
    const lat1 = this.toRad(latitude)
    const lat2 = this.toRad(KAABA_LAT)

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c)
  }

  /**
   * Get distance to Kaaba from stored location
   * @returns {number|null} Distance in km or null
   */
  getDistanceToKaaba() {
    const location = this.getLocation()
    if (!location) return null
    return this.calculateDistanceToKaaba(location.latitude, location.longitude)
  }

  /**
   * Convert degrees to radians
   */
  toRad(deg) {
    return deg * (Math.PI / 180)
  }

  /**
   * Get cardinal direction name from bearing
   * @param {number} bearing - Degrees from North (0-360)
   * @returns {string} Cardinal direction (N, NE, E, etc.)
   */
  getCardinalDirection(bearing) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N']
    const index = Math.round(bearing / 45)
    return directions[index]
  }

  /**
   * Start watching compass heading
   * @param {Function} onHeading - Callback with heading data { magneticHeading, trueHeading, accuracy }
   * @param {Function} onError - Error callback
   * @param {Object} options - { frequency: ms }
   * @returns {Function} Stop function
   */
  startCompass(onHeading, onError, options = { frequency: 100 }) {
    if (this.watchId) {
      this.stopCompass()
    }

    if (this.isCordova && navigator.compass) {
      // Cordova compass
      this.watchId = navigator.compass.watchHeading(
        (heading) => {
          this.lastHeading = heading
          // Check if calibration is needed (accuracy > 3 means low accuracy)
          this.calibrationNeeded = heading.headingAccuracy > 25 || heading.headingAccuracy < 0

          onHeading({
            magneticHeading: heading.magneticHeading,
            trueHeading: heading.trueHeading || heading.magneticHeading,
            accuracy: heading.headingAccuracy,
            calibrationNeeded: this.calibrationNeeded,
            timestamp: heading.timestamp
          })
        },
        (error) => {
          console.error('[QiblaService] Compass error:', error)
          if (onError) onError(error)
        },
        options
      )

      return () => this.stopCompass()
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      // Web fallback using DeviceOrientationEvent
      const handleOrientation = (event) => {
        // webkitCompassHeading is iOS Safari specific
        // alpha is the compass direction for Android/other browsers
        let heading = event.webkitCompassHeading || (360 - event.alpha)

        if (heading !== null && heading !== undefined) {
          this.lastHeading = { magneticHeading: heading }
          onHeading({
            magneticHeading: heading,
            trueHeading: heading,
            accuracy: event.webkitCompassAccuracy || 0,
            calibrationNeeded: event.webkitCompassAccuracy > 25,
            timestamp: Date.now()
          })
        }
      }

      window.addEventListener('deviceorientation', handleOrientation, true)
      this.watchId = handleOrientation // Store for cleanup

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation, true)
        this.watchId = null
      }
    }

    // No compass available
    if (onError) {
      onError({ code: 20, message: 'Compass not available on this device' })
    }
    return () => {}
  }

  /**
   * Stop watching compass
   */
  stopCompass() {
    if (this.watchId) {
      if (this.isCordova && navigator.compass) {
        navigator.compass.clearWatch(this.watchId)
      } else if (typeof this.watchId === 'function') {
        window.removeEventListener('deviceorientation', this.watchId, true)
      }
      this.watchId = null
    }
  }

  /**
   * Get current compass heading (one-time)
   * @returns {Promise<Object>} Heading data
   */
  getCurrentHeading() {
    return new Promise((resolve, reject) => {
      if (this.isCordova && navigator.compass) {
        navigator.compass.getCurrentHeading(
          (heading) => {
            resolve({
              magneticHeading: heading.magneticHeading,
              trueHeading: heading.trueHeading || heading.magneticHeading,
              accuracy: heading.headingAccuracy,
              calibrationNeeded: heading.headingAccuracy > 25
            })
          },
          (error) => {
            reject(error)
          }
        )
      } else {
        reject({ code: 20, message: 'Compass not available' })
      }
    })
  }

  /**
   * Calculate Qibla direction relative to device heading
   * @param {number} deviceHeading - Current device heading from compass (0-360)
   * @returns {number} Qibla direction relative to device (0-360)
   */
  getQiblaRelativeToDevice(deviceHeading) {
    const qiblaFromNorth = this.getQiblaDirection()
    if (qiblaFromNorth === null) return null

    // Calculate relative direction
    let relative = (qiblaFromNorth - deviceHeading + 360) % 360
    return relative
  }

  /**
   * Check if device is pointing towards Qibla (within tolerance)
   * @param {number} deviceHeading - Current device heading
   * @param {number} tolerance - Degrees of tolerance (default 5)
   * @returns {boolean}
   */
  isPointingToQibla(deviceHeading, tolerance = 5) {
    const relative = this.getQiblaRelativeToDevice(deviceHeading)
    if (relative === null) return false

    // Check if within tolerance of 0 (pointing at Qibla)
    return relative <= tolerance || relative >= (360 - tolerance)
  }

  /**
   * Check if user is at or very near the Kaaba
   * @returns {boolean}
   */
  isAtKaaba() {
    const distance = this.getDistanceToKaaba()
    return distance !== null && distance < 1 // Within 1km
  }

  /**
   * Get comprehensive Qibla info
   * @returns {Object} All Qibla-related information
   */
  getQiblaInfo() {
    const location = this.getLocation()

    if (!location) {
      return {
        hasLocation: false,
        qiblaDirection: null,
        distanceToKaaba: null,
        cardinalDirection: null,
        locationName: null,
        isAtKaaba: false
      }
    }

    const qiblaDirection = this.calculateQiblaDirection(location.latitude, location.longitude)
    const distanceToKaaba = this.calculateDistanceToKaaba(location.latitude, location.longitude)

    return {
      hasLocation: true,
      qiblaDirection: Math.round(qiblaDirection * 10) / 10, // Round to 1 decimal
      distanceToKaaba,
      cardinalDirection: this.getCardinalDirection(qiblaDirection),
      locationName: location.locationName,
      isAtKaaba: distanceToKaaba < 1,
      latitude: location.latitude,
      longitude: location.longitude
    }
  }

  /**
   * Format distance for display
   * @param {number} km - Distance in kilometers
   * @returns {string} Formatted distance
   */
  formatDistance(km) {
    if (km === null) return ''
    if (km < 1) return `${Math.round(km * 1000)} m`
    if (km < 10) return `${km.toFixed(1)} km`
    return `${Math.round(km).toLocaleString()} km`
  }
}

// Export singleton instance
export default new QiblaService()
