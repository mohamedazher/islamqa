import Foundation
import WidgetKit

/**
 * PrayerWidget Cordova Plugin - iOS Implementation
 * Bridges JavaScript calls to native iOS widget updates
 */
@objc(PrayerWidget)
class PrayerWidget: CDVPlugin {

    private let appGroupName = "group.com.dkurve.betterislamqa"

    /**
     * Update widget with new prayer time data
     */
    @objc(updateWidget:)
    func updateWidget(command: CDVInvokedUrlCommand) {
        var pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR)

        guard let prayerData = command.arguments[0] as? [String: Any] else {
            pluginResult = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs: "Invalid prayer data"
            )
            self.commandDelegate!.send(pluginResult, callbackId: command.callbackId)
            return
        }

        // Save data to App Group shared container
        if let userDefaults = UserDefaults(suiteName: appGroupName) {
            // All 5 prayer times
            userDefaults.set(prayerData["fajr"] as? String ?? "--:--", forKey: "fajr_time")
            userDefaults.set(prayerData["dhuhr"] as? String ?? "--:--", forKey: "dhuhr_time")
            userDefaults.set(prayerData["asr"] as? String ?? "--:--", forKey: "asr_time")
            userDefaults.set(prayerData["maghrib"] as? String ?? "--:--", forKey: "maghrib_time")
            userDefaults.set(prayerData["isha"] as? String ?? "--:--", forKey: "isha_time")

            // Current/Next prayer info
            userDefaults.set(prayerData["nextPrayer"] as? String ?? "Fajr", forKey: "next_prayer")
            userDefaults.set(prayerData["nextPrayerTime"] as? String ?? "--:--", forKey: "next_prayer_time")
            userDefaults.set(prayerData["timeRemaining"] as? String ?? "--:--", forKey: "time_remaining")
            userDefaults.set(prayerData["currentPrayer"] as? String ?? "", forKey: "current_prayer")
            userDefaults.set(prayerData["currentPrayerEnd"] as? String ?? "", forKey: "current_prayer_end")
            userDefaults.set(Date().timeIntervalSince1970, forKey: "last_updated")
            userDefaults.synchronize()

            // Reload all widgets
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
                NSLog("PrayerWidget: Widget data updated and timelines reloaded")
            }

            pluginResult = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAs: "Widget updated successfully"
            )
        } else {
            pluginResult = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs: "Failed to access shared container"
            )
        }

        self.commandDelegate!.send(pluginResult, callbackId: command.callbackId)
    }

    /**
     * Check if widget is installed (always returns true on iOS as there's no way to detect)
     */
    @objc(isWidgetInstalled:)
    func isWidgetInstalled(command: CDVInvokedUrlCommand) {
        // iOS doesn't provide an API to check if a widget is added to home screen
        // We assume widgets might be installed if the app is installed
        let pluginResult = CDVPluginResult(
            status: CDVCommandStatus_OK,
            messageAs: 1
        )
        self.commandDelegate!.send(pluginResult, callbackId: command.callbackId)
    }

    /**
     * Force widget update
     */
    @objc(forceUpdate:)
    func forceUpdate(command: CDVInvokedUrlCommand) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
            NSLog("PrayerWidget: Force update triggered")

            let pluginResult = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAs: "Widget force update triggered"
            )
            self.commandDelegate!.send(pluginResult, callbackId: command.callbackId)
        } else {
            let pluginResult = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs: "WidgetKit not available (iOS 14+ required)"
            )
            self.commandDelegate!.send(pluginResult, callbackId: command.callbackId)
        }
    }
}
