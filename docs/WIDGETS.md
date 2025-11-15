# Prayer Time Widgets

Complete guide for implementing, building, and deploying native home screen widgets for prayer times on Android and iOS.

---

## 📱 Overview

The IslamQA app includes native home screen widgets that display:
- 🕌 All 5 daily prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha)
- ⏱️ Live countdown timer for next/current prayer
- 🎯 Highlighted current/next prayer row
- 🎨 Beautiful teal/cyan gradient matching app theme
- 👆 Tap-to-open functionality

**Supported Platforms:**
- Android 5.0+ (API 21+)
- iOS 14.0+ (WidgetKit)

---

## 🚀 Quick Start

### Installation

```bash
# Install the plugin
cordova plugin add ./cordova-plugin-prayer-widget

# Validate setup
yarn validate:widget

# Build for Android
yarn cordova:build:android

# Prepare for iOS (requires Xcode)
cordova prepare ios
open platforms/ios/*.xcworkspace
```

### JavaScript API

```javascript
// Update widget with all prayer times
PrayerWidget.updateWidget({
  // All 5 prayer times
  fajr: "5:30 AM",
  dhuhr: "12:15 PM",
  asr: "3:45 PM",
  maghrib: "6:45 PM",
  isha: "8:15 PM",

  // Current/Next prayer info
  nextPrayer: "Maghrib",
  nextPrayerTime: "6:45 PM",
  timeRemaining: "3h 20m",
  currentPrayer: "Asr",        // Optional
  currentPrayerEnd: "6:45 PM"  // Optional
}, successCallback, errorCallback);

// Check if installed
PrayerWidget.isWidgetInstalled((installed) => {
  console.log('Widget installed:', installed);
}, errorCallback);

// Force update
PrayerWidget.forceUpdate(successCallback, errorCallback);
```

---

## 🤖 Android Setup

### Automatic Configuration

The Android widget is automatically configured when you build the app. No additional setup required!

```bash
cordova build android
```

### Adding Widget to Home Screen

1. **Install the APK** on your Android device
2. **Long-press** on empty area of home screen
3. Tap **"Widgets"**
4. Find **"BetterIslam Q&A"**
5. **Drag** Prayer Times widget to home screen
6. Done! Widget will automatically show prayer times

### Features

- ✅ Displays all 5 daily prayer times in compact list
- ✅ Highlights current/next prayer with visual indicator
- ✅ Live countdown timer for next/current prayer
- ✅ Updates every minute automatically
- ✅ Tap to open app to prayer times
- ✅ Teal/cyan gradient background matching app theme
- ✅ Works offline (reads from app data)
- ✅ No additional permissions required

---

## 🍎 iOS Setup

### Prerequisites

- macOS with Xcode 14.0+
- iOS 14.0+ deployment target
- CocoaPods installed

### Step-by-Step Setup

#### 1. Prepare iOS Platform

```bash
cordova prepare ios
```

#### 2. Open in Xcode

```bash
open platforms/ios/BetterIslam\ Q\&A.xcworkspace
```

#### 3. Create Widget Extension

1. In Xcode: **File → New → Target**
2. Select **Widget Extension**
3. Configure:
   - **Product Name:** `PrayerTimeWidget`
   - **Team:** Select your team
   - **Include Configuration Intent:** ❌ Uncheck
4. Click **Finish**
5. When prompted "Activate scheme?", click **Cancel**

#### 4. Add Widget Code

1. In Project Navigator, find `PrayerTimeWidget` folder
2. **Delete** the generated `PrayerTimeWidget.swift` file
3. Right-click `PrayerTimeWidget` → **Add Files...**
4. Navigate to: `cordova-plugin-prayer-widget/src/ios/PrayerTimeWidget.swift`
5. Check **"Copy items if needed"**
6. Click **Add**

#### 5. Configure App Groups

**For Main App Target:**
1. Select main app target (**BetterIslam Q&A**)
2. **Signing & Capabilities** tab
3. Click **+ Capability**
4. Add **App Groups**
5. Click **+** and add: `group.com.dkurve.betterislamqa`

**For Widget Target:**
1. Select **PrayerTimeWidget** target
2. **Signing & Capabilities** tab
3. Click **+ Capability**
4. Add **App Groups**
5. Click **+** and add: `group.com.dkurve.betterislamqa`

   ⚠️ **Must be identical to main app!**

#### 6. Build and Run

1. Select device or simulator
2. **Product → Build** (⌘B)
3. Fix any errors if needed
4. **Product → Run** (⌘R)

### Adding Widget to Home Screen (iOS)

1. **Long-press** on home screen
2. Tap **"+"** button (top-left)
3. Search **"Prayer Times"**
4. Select **Small** or **Medium** size
5. Tap **"Add Widget"**
6. Widget appears with prayer countdown!

### Features

- ✅ Native SwiftUI design
- ✅ Small and Medium widget sizes
- ✅ Automatic updates every minute
- ✅ App Groups for data sharing
- ✅ Dark Mode support
- ✅ Tap to open app

---

## 🔧 Build Requirements

### General

- **Node.js:** 18.x or higher
- **Cordova:** 12.x or higher
- **Yarn:** Latest (recommended)

### Android

- **Android Studio:** Latest stable
- **Android SDK:** API 35 (target)
- **Gradle:** 8.x (auto-managed)
- **Java:** JDK 17+

### iOS

- **macOS:** Monterey (12.0)+
- **Xcode:** 14.0+
- **iOS SDK:** 14.0+
- **CocoaPods:** Latest

### Check Versions

```bash
node --version    # >= 18.0.0
cordova --version # >= 12.0.0
java --version    # >= 17
xcodebuild -version # >= 14.0 (macOS only)
```

---

## 🔑 Permissions

### Android

**No additional permissions required!**

Already configured:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

Widget uses:
- ✅ SharedPreferences (no permission needed)
- ✅ Widget receiver is exported (auto-configured)

### iOS

**Already configured:**
```xml
<edit-config target="NSLocationWhenInUseUsageDescription">
  <string>We need your location for prayer times</string>
</edit-config>
```

**Manual setup required:**
- ✅ App Groups capability (see iOS setup above)
- ✅ WidgetKit framework (auto-linked)

---

## 🔄 How Widget Updates Work

### Data Flow

```
App (every 60 seconds)
    ↓
prayerTimesService.updateWidget()
    ↓
Cordova Plugin (PrayerWidget)
    ↓
SharedPreferences (Android) / UserDefaults (iOS)
    ↓
Widget Provider reads data
    ↓
Widget UI updates on home screen
```

### Update Frequency

- **App Open:** Immediate update on launch
- **While Active:** Every 60 seconds
- **Widget Refresh:** System-managed (every few minutes)

### Battery Optimization

- Widget updates are throttled to 60-second intervals
- No background services running
- Platform-managed refresh schedules
- Efficient data storage (SharedPreferences/UserDefaults)

---

## 🧪 Testing & Validation

### Pre-Build Validation

```bash
# Run validation script
yarn validate:widget

# Checks:
# ✓ Node.js version
# ✓ Plugin files exist
# ✓ Integration in services/views
# ✓ Platform requirements
```

### Testing Checklist

**Android:**
- [ ] Widget appears in widget picker
- [ ] Widget displays on home screen
- [ ] Widget shows correct prayer data
- [ ] Widget updates every minute
- [ ] Tap opens app to prayer times
- [ ] Works after app restart
- [ ] Works after device restart

**iOS:**
- [ ] Widget appears in widget gallery
- [ ] Small size displays correctly
- [ ] Medium size displays correctly
- [ ] Widget updates from app
- [ ] App Groups configured correctly
- [ ] Tap opens app
- [ ] Works in Dark Mode

### Debug Logs

**Android:**
```bash
adb logcat | grep PrayerWidget

# Expected output:
# PrayerWidget: Widget data saved: {...}
# PrayerTimeWidget: onUpdate called for X widgets
# PrayerWidget: Widget updated successfully
```

**iOS:**
```bash
# In Xcode Console:
# PrayerWidget: Widget data updated and timelines reloaded
```

---

## 🐛 Troubleshooting

### Android

#### Widget not in picker
```bash
cordova plugin remove cordova-plugin-prayer-widget
cordova plugin add ./cordova-plugin-prayer-widget
cordova prepare android
```

#### Widget shows blank screen
```bash
# Rebuild platform
cordova platform remove android
cordova platform add android
cordova plugin add ./cordova-plugin-prayer-widget
```

#### Widget shows "--:--"
1. Open main app
2. Ensure location is set
3. Wait 1-2 minutes for data sync
4. Force update from app

### iOS

#### Build errors in Xcode
1. Clean build folder: **Shift+Cmd+K**
2. Delete Derived Data
3. Rebuild project

#### Widget not updating
1. Verify App Group IDs match exactly
2. Check entitlements for both targets
3. Reinstall app completely
4. Check Console for errors

#### Widget shows placeholder
1. Open main app
2. Set location in settings
3. Wait for data sync
4. Force-close widget gallery
5. Re-add widget

---

## 📦 Production Deployment

### Google Play Store

**Requirements:**
- [ ] Target API 35 (Android 15) ✅
- [ ] 64-bit support ✅
- [ ] Widget screenshots in listing
- [ ] App description mentions widget
- [ ] Privacy policy updated (location usage)

**Build Command:**
```bash
yarn cordova:build:android --release
```

### Apple App Store

**Requirements:**
- [ ] iOS 14.0+ deployment target ✅
- [ ] Widget Extension included in archive ✅
- [ ] App Groups configured ✅
- [ ] Widget screenshots in listing
- [ ] App description mentions widget

**Build Process:**
1. Open in Xcode
2. **Product → Archive**
3. **Distribute App → App Store Connect**
4. Verify Widget Extension is included
5. Submit for review

### Version Numbers

Update in 3 places:

1. **config.xml:**
   ```xml
   <widget version="2.0.15" android-versionCode="110">
   ```

2. **package.json:**
   ```json
   "version": "2.0.15"
   ```

3. **Run:**
   ```bash
   yarn version:patch  # Auto-updates both
   ```

---

## 📁 Plugin Structure

```
cordova-plugin-prayer-widget/
├── plugin.xml                      # Cordova configuration
├── package.json                    # Plugin metadata
├── README.md                       # Plugin documentation
├── www/
│   └── PrayerWidget.js            # JavaScript API
├── src/
│   ├── android/
│   │   ├── PrayerWidget.java      # Plugin bridge
│   │   ├── PrayerTimeWidgetProvider.java  # Widget provider
│   │   └── res/
│   │       ├── layout/widget_prayer_time.xml
│   │       ├── xml/prayer_time_widget_info.xml
│   │       ├── drawable/widget_background.xml
│   │       └── values/strings.xml
│   └── ios/
│       ├── PrayerWidget.swift     # Plugin bridge
│       └── PrayerTimeWidget.swift # Widget implementation
```

---

## 🔧 Customization

### Change Widget Appearance

**Android:**
Edit `src/android/res/layout/widget_prayer_time.xml`

**iOS:**
Edit `src/ios/PrayerTimeWidget.swift` in Xcode

### Change Update Frequency

In `src/components/home/PrayerTimesCard.vue` and `src/views/PrayerTimesView.vue`:

```javascript
// Change from 60 to desired interval (seconds)
if (widgetUpdateCounter >= 60) {
  prayerTimesService.updateWidget()
  widgetUpdateCounter = 0
}
```

⚠️ **Warning:** Lower values increase battery usage!

### Change Background Color

**Android:**
Edit `src/android/res/drawable/widget_background.xml`:
```xml
<gradient
    android:startColor="#YOUR_COLOR"
    android:endColor="#YOUR_COLOR" />
```

**iOS:**
Edit `src/ios/PrayerTimeWidget.swift`:
```swift
LinearGradient(colors: [
    Color(red: 0.08, green: 0.72, blue: 0.65),  // Your color
    Color(red: 0.03, green: 0.54, blue: 0.70)   // Your color
])
```

---

## 🆘 Support

### Getting Help

1. **Check this documentation first**
2. **Run validation:** `yarn validate:widget`
3. **Check console logs** for specific errors
4. **Review troubleshooting section** above

### Common Commands

```bash
# Validate setup
yarn validate:widget

# Install plugin
cordova plugin add ./cordova-plugin-prayer-widget

# List plugins
cordova plugin ls

# Remove plugin
cordova plugin remove cordova-plugin-prayer-widget

# Build Android
yarn cordova:build:android

# Prepare iOS
cordova prepare ios

# Check logs (Android)
adb logcat | grep PrayerWidget
```

### Resources

- [Android App Widgets](https://developer.android.com/guide/topics/appwidgets)
- [iOS WidgetKit](https://developer.apple.com/documentation/widgetkit)
- [Cordova Plugins](https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/)

---

## ✅ Quick Reference

| Task | Command |
|------|---------|
| Validate setup | `yarn validate:widget` |
| Install plugin | `cordova plugin add ./cordova-plugin-prayer-widget` |
| Build Android | `yarn cordova:build:android` |
| Prepare iOS | `cordova prepare ios` |
| Check logs (Android) | `adb logcat \| grep PrayerWidget` |
| Force update widget | `PrayerWidget.forceUpdate()` |
| Check if installed | `PrayerWidget.isWidgetInstalled()` |

---

**Plugin Version:** 1.0.0
**Last Updated:** November 15, 2025
**Platforms:** Android 5.0+, iOS 14.0+
