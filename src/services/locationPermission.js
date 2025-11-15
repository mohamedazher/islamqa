/**
 * Location Permission Service
 *
 * Handles location permission checking and requesting for both web and Cordova
 * Uses cordova.plugins.diagnostic for native permission management
 */

class LocationPermissionService {
  constructor() {
    this.isCordova = !!window.cordova
    this.diagnostic = this.isCordova ? window.cordova?.plugins?.diagnostic : null
  }

  /**
   * Check if location permission is granted
   * @returns {Promise<boolean>}
   */
  async isLocationAuthorized() {
    if (!this.isCordova) {
      // For web, we can't check permission status directly
      // We'll rely on the geolocation API error handling
      return true
    }

    return new Promise((resolve) => {
      if (!this.diagnostic) {
        console.warn('Diagnostic plugin not available')
        resolve(false)
        return
      }

      this.diagnostic.getLocationAuthorizationStatus(
        (status) => {
          const authorized =
            status === this.diagnostic.permissionStatus.GRANTED ||
            status === this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE

          console.log('[LocationPermission] Authorization status:', status, 'Authorized:', authorized)
          resolve(authorized)
        },
        (error) => {
          console.error('[LocationPermission] Error checking authorization:', error)
          resolve(false)
        }
      )
    })
  }

  /**
   * Get detailed permission status
   * @returns {Promise<Object>} Permission status details
   */
  async getPermissionStatus() {
    if (!this.isCordova || !this.diagnostic) {
      return {
        status: 'unknown',
        canRequest: true,
        shouldShowSettings: false
      }
    }

    return new Promise((resolve) => {
      this.diagnostic.getLocationAuthorizationStatus(
        (status) => {
          const permissionStatus = this.diagnostic.permissionStatus

          const result = {
            status: status,
            canRequest: status === permissionStatus.NOT_REQUESTED || status === permissionStatus.DENIED_ONCE,
            shouldShowSettings: status === permissionStatus.DENIED_ALWAYS,
            isGranted: status === permissionStatus.GRANTED || status === permissionStatus.GRANTED_WHEN_IN_USE,
            statusText: this.getStatusText(status)
          }

          console.log('[LocationPermission] Permission status:', result)
          resolve(result)
        },
        (error) => {
          console.error('[LocationPermission] Error getting permission status:', error)
          resolve({
            status: 'error',
            canRequest: false,
            shouldShowSettings: false,
            isGranted: false,
            statusText: 'Error checking permission'
          })
        }
      )
    })
  }

  /**
   * Request location permission
   * @returns {Promise<boolean>} True if granted
   */
  async requestPermission() {
    if (!this.isCordova || !this.diagnostic) {
      console.log('[LocationPermission] Not Cordova or no diagnostic plugin, skipping request')
      return true
    }

    return new Promise((resolve) => {
      this.diagnostic.requestLocationAuthorization(
        (status) => {
          const permissionStatus = this.diagnostic.permissionStatus
          const granted =
            status === permissionStatus.GRANTED ||
            status === permissionStatus.GRANTED_WHEN_IN_USE

          console.log('[LocationPermission] Permission request result:', status, 'Granted:', granted)
          resolve(granted)
        },
        (error) => {
          console.error('[LocationPermission] Error requesting permission:', error)
          resolve(false)
        }
      )
    })
  }

  /**
   * Check if location services are enabled on the device
   * @returns {Promise<boolean>}
   */
  async isLocationEnabled() {
    if (!this.isCordova || !this.diagnostic) {
      return true
    }

    return new Promise((resolve) => {
      this.diagnostic.isLocationEnabled(
        (enabled) => {
          console.log('[LocationPermission] Location services enabled:', enabled)
          resolve(enabled)
        },
        (error) => {
          console.error('[LocationPermission] Error checking location services:', error)
          resolve(false)
        }
      )
    })
  }

  /**
   * Open device settings page for the app
   * Allows users to manually enable location permissions
   */
  openDeviceSettings() {
    if (!this.isCordova || !this.diagnostic) {
      console.warn('[LocationPermission] Cannot open settings (not Cordova or no diagnostic plugin)')
      return
    }

    this.diagnostic.switchToSettings(
      () => {
        console.log('[LocationPermission] Opened device settings')
      },
      (error) => {
        console.error('[LocationPermission] Error opening settings:', error)
      }
    )
  }

  /**
   * Get human-readable status text
   * @param {string} status - Permission status from diagnostic plugin
   * @returns {string}
   */
  getStatusText(status) {
    if (!this.diagnostic) return 'Unknown'

    const permissionStatus = this.diagnostic.permissionStatus

    switch (status) {
      case permissionStatus.GRANTED:
      case permissionStatus.GRANTED_WHEN_IN_USE:
        return 'Granted'
      case permissionStatus.NOT_REQUESTED:
        return 'Not Requested'
      case permissionStatus.DENIED_ONCE:
        return 'Denied'
      case permissionStatus.DENIED_ALWAYS:
        return 'Permanently Denied'
      case permissionStatus.RESTRICTED:
        return 'Restricted'
      default:
        return 'Unknown'
    }
  }

  /**
   * Check permission and get user-friendly error message if denied
   * @returns {Promise<Object>} { hasPermission: boolean, message: string }
   */
  async checkPermissionWithMessage() {
    const permStatus = await this.getPermissionStatus()

    if (permStatus.isGranted) {
      return {
        hasPermission: true,
        message: 'Location permission granted'
      }
    }

    // Check if location services are disabled
    const locationEnabled = await this.isLocationEnabled()
    if (!locationEnabled) {
      return {
        hasPermission: false,
        canRequest: false,
        shouldShowSettings: true,
        message: 'Location services are disabled on your device. Please enable location services in your device settings.'
      }
    }

    // Permission specific messages
    if (permStatus.shouldShowSettings) {
      return {
        hasPermission: false,
        canRequest: false,
        shouldShowSettings: true,
        message: 'Location permission was permanently denied. Please enable it in your device settings.'
      }
    }

    if (permStatus.canRequest) {
      return {
        hasPermission: false,
        canRequest: true,
        shouldShowSettings: false,
        message: 'Location permission is required to calculate accurate prayer times.'
      }
    }

    return {
      hasPermission: false,
      canRequest: false,
      shouldShowSettings: false,
      message: 'Location permission is not available.'
    }
  }
}

// Export singleton instance
export default new LocationPermissionService()
