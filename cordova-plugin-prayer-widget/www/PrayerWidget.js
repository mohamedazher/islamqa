/**
 * PrayerWidget Cordova Plugin
 * JavaScript interface for updating native prayer time widgets on Android and iOS
 */

var exec = require('cordova/exec');

var PrayerWidget = {
  /**
   * Update widget with current prayer time data
   * @param {Object} prayerData - Prayer time information
   * @param {string} prayerData.nextPrayer - Name of next prayer (e.g., "Fajr", "Dhuhr")
   * @param {string} prayerData.nextPrayerTime - Time of next prayer (e.g., "5:30 AM")
   * @param {string} prayerData.timeRemaining - Time until next prayer (e.g., "2h 15m")
   * @param {string} prayerData.currentPrayer - Name of current prayer (optional)
   * @param {string} prayerData.currentPrayerEnd - End time of current prayer (optional)
   * @param {Function} success - Success callback
   * @param {Function} error - Error callback
   */
  updateWidget: function(prayerData, success, error) {
    exec(success, error, 'PrayerWidget', 'updateWidget', [prayerData]);
  },

  /**
   * Check if widget is currently installed/added to home screen
   * @param {Function} success - Success callback, receives boolean (true if installed)
   * @param {Function} error - Error callback
   */
  isWidgetInstalled: function(success, error) {
    exec(success, error, 'PrayerWidget', 'isWidgetInstalled', []);
  },

  /**
   * Manually force widget update (useful for testing)
   * @param {Function} success - Success callback
   * @param {Function} error - Error callback
   */
  forceUpdate: function(success, error) {
    exec(success, error, 'PrayerWidget', 'forceUpdate', []);
  }
};

module.exports = PrayerWidget;
