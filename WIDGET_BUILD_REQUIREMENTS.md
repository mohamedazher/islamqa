# Prayer Widget - Build Requirements & Permissions

This document outlines all requirements, permissions, and considerations for building and releasing the app with prayer time widgets.

## 📋 Build Requirements

### General Requirements

- **Node.js**: 18.x or higher
- **Cordova CLI**: 12.x or higher
- **Yarn**: Latest version (recommended)

```bash
# Check versions
node --version  # Should be >= 18.0.0
cordova --version  # Should be >= 12.0.0
yarn --version
```

### Android Requirements

- **Android Studio**: Latest stable version
- **Android SDK**: API Level 35 (Android 15)
- **Gradle**: 8.x (automatically managed by Cordova)
- **Java**: JDK 17 or higher

```bash
# Check Java version
java --version  # Should be >= 17
```

### iOS Requirements

- **macOS**: Monterey (12.0) or higher
- **Xcode**: 14.0 or higher
- **iOS SDK**: iOS 14.0+ (for WidgetKit support)
- **CocoaPods**: Latest version

```bash
# Check Xcode version
xcodebuild -version  # Should be >= 14.0

# Install CocoaPods if needed
sudo gem install cocoapods
```

---

## 🔑 Required Permissions

### Android Permissions

The widget itself doesn't require additional permissions beyond what's already in `config.xml`:

**Already Configured:**
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

**Additional Permissions Added by Plugin:**
- **None** - Widget uses existing app permissions
- Widget reads from SharedPreferences (no special permission needed)
- Widget receiver is exported (already configured in plugin.xml)

**Android 12+ Considerations:**
- Widget receiver must have `android:exported="true"` ✅ (Already set)
- Targeting SDK 35 ✅ (Already set in config.xml)

### iOS Permissions

**Already Configured:**
```xml
<edit-config file="*-Info.plist" mode="merge" target="NSLocationWhenInUseUsageDescription">
    <string>We need your location to calculate accurate prayer times for your area.</string>
</edit-config>
```

**Additional Requirements for Widget:**
- **App Groups Capability** - Must be manually configured in Xcode
- **WidgetKit Framework** - Automatically linked (iOS 14+)
- **Background App Refresh** - Optional but recommended for better widget updates

**iOS Widget Entitlements (Manual Setup Required):**

1. **App Groups Entitlement** (`*.entitlements` file):
```xml
<key>com.apple.security.application-groups</key>
<array>
    <string>group.com.dkurve.betterislamqa</string>
</array>
```

2. **Must be configured for BOTH:**
   - Main app target
   - Widget Extension target

---

## 🔧 Plugin Installation Issues & Solutions

### Issue 1: Swift Support

**Problem:** Older Cordova versions may not support Swift files automatically.

**Solution:**
- Cordova iOS 7.x+ has built-in Swift support ✅
- No additional plugins needed
- Our config.xml specifies: `<engine name="ios" spec="^7.0.0" />`

### Issue 2: Duplicate Resource IDs (Android)

**Problem:** Widget resource IDs might conflict with app resources.

**Solution:**
```xml
<!-- In plugin.xml, we use unique filenames -->
<resource-file
    src="src/android/res/values/strings.xml"
    target="res/values/widget_strings.xml" />
```

### Issue 3: iOS App Groups Not Applied

**Problem:** App Groups can't be set via plist files alone.

**Solution:**
- Removed automatic App Groups configuration from plugin.xml
- **Manual setup required in Xcode** (documented in WIDGET_INSTALLATION.md)
- This is a limitation of Cordova - entitlements must be set in Xcode

---

## 🏗️ Build Process

### Android Build

#### Development Build

```bash
# Install plugin
cordova plugin add ./cordova-plugin-prayer-widget

# Prepare platform
cordova prepare android

# Build debug APK
cordova build android

# Or use yarn script
yarn cordova:build:android
```

#### Release Build

```bash
# Build release APK (unsigned)
cordova build android --release

# Sign APK (requires keystore)
jarsigner -verbose -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
  alias_name

# Align APK
zipalign -v 4 \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
  BetterIslamQA.apk
```

**Or use Gradle signing:**

Create `platforms/android/release-signing.properties`:
```properties
storeFile=/path/to/keystore.jks
storePassword=***
keyAlias=alias_name
keyPassword=***
```

Then build:
```bash
cordova build android --release
```

### iOS Build

#### Development Build

```bash
# Install plugin
cordova plugin add ./cordova-plugin-prayer-widget

# Prepare platform
cordova prepare ios

# Open in Xcode
open platforms/ios/BetterIslam\ Q\&A.xcworkspace
```

**In Xcode:**
1. Add Widget Extension (see WIDGET_INSTALLATION.md)
2. Configure App Groups for both targets
3. Build and run on device/simulator

#### Release Build

**In Xcode:**
1. Select "Any iOS Device" or connected device
2. Product → Archive
3. Distribute App → App Store Connect
4. Follow App Store submission wizard

**Important:** Ensure Widget Extension is included in archive!

---

## ⚠️ Known Issues & Workarounds

### Issue 1: Widget Not Appearing in Picker (Android)

**Symptoms:**
- Widget doesn't show in home screen widget picker
- No errors during build

**Causes:**
- Widget receiver not registered in AndroidManifest
- Missing widget info XML

**Solution:**
```bash
# Verify widget is registered
cd platforms/android
grep -r "PrayerTimeWidgetProvider" app/src/main/AndroidManifest.xml

# Should output the receiver registration
# If not, remove and re-add plugin
cordova plugin remove cordova-plugin-prayer-widget
cordova plugin add ./cordova-plugin-prayer-widget
cordova prepare android
```

### Issue 2: Widget Shows Blank/White Screen (Android)

**Symptoms:**
- Widget appears but shows blank screen
- Logcat shows resource not found errors

**Causes:**
- Resource files not copied correctly
- Namespace conflicts

**Solution:**
```bash
# Check if resources exist
ls platforms/android/app/src/main/res/layout/widget_prayer_time.xml
ls platforms/android/app/src/main/res/xml/prayer_time_widget_info.xml

# If missing, rebuild platform
cordova platform remove android
cordova platform add android
cordova plugin add ./cordova-plugin-prayer-widget
```

### Issue 3: iOS Widget Not Updating

**Symptoms:**
- Widget shows placeholder data
- Data doesn't update from app

**Causes:**
- App Groups not configured correctly
- Widget Extension not using same App Group

**Solution:**
1. Verify App Group ID is identical in both targets
2. Check entitlements file contains App Group
3. Clean build folder in Xcode (Shift+Cmd+K)
4. Rebuild and reinstall app

### Issue 4: Build Fails with "Swift not supported"

**Symptoms:**
- iOS build fails with Swift-related errors
- Missing Swift files

**Causes:**
- Using Cordova iOS < 6.0
- Incorrect plugin installation

**Solution:**
```bash
# Update Cordova iOS
cordova platform remove ios
cordova platform add ios@latest

# Re-add plugin
cordova plugin add ./cordova-plugin-prayer-widget
```

---

## 📦 Google Play Store Requirements

### Widget-Specific Requirements

1. **App Privacy Policy**
   - Disclose that location data is used for prayer time calculations
   - Already required for existing location permission

2. **Widget Preview Screenshot**
   - Include widget screenshot in Play Store listing
   - Show widget in use on home screen

3. **App Description**
   - Mention home screen widget feature
   - Explain widget functionality

4. **Target API Level**
   - Target API 35 (Android 15) ✅ Already configured
   - `android-targetSdkVersion` set to 35 in config.xml

5. **64-bit Support**
   - Required for Play Store
   - Automatically handled by Cordova Android 14.x

### Checklist Before Release

- [ ] Test widget on multiple Android versions (5.0 - 15.0)
- [ ] Test widget on different screen sizes
- [ ] Verify widget updates correctly
- [ ] Test widget tap-to-open functionality
- [ ] Include widget screenshots in store listing
- [ ] Update app description to mention widget
- [ ] Test on devices with different DPIs (ldpi, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)

---

## 🍎 Apple App Store Requirements

### Widget-Specific Requirements

1. **WidgetKit Framework**
   - Requires iOS 14.0+
   - Set minimum deployment target to iOS 14.0

2. **App Privacy Nutrition Label**
   - Location data usage already declared
   - Widget doesn't collect additional data

3. **App Preview Video**
   - Recommended to show widget in action
   - Show adding widget to home screen

4. **App Description**
   - Mention widget support
   - List widget sizes (Small, Medium)

5. **Widget Extension Bundle**
   - Must be included in app archive
   - Xcode automatically includes when archiving

### Checklist Before Release

- [ ] Test widget on iOS 14, 15, 16, 17
- [ ] Test Small and Medium widget sizes
- [ ] Verify App Groups configuration
- [ ] Test widget updates in background
- [ ] Include widget screenshots in App Store listing
- [ ] Update app description to mention widget
- [ ] Test on iPhone and iPad
- [ ] Verify widget displays correctly in Dark Mode

---

## 🧪 Testing Checklist

### Pre-Build Testing

```bash
# Validate plugin.xml
cordova plugin add ./cordova-plugin-prayer-widget --verbose

# Check for errors during installation
# Should see:
# ✓ Installing "cordova-plugin-prayer-widget"
# ✓ Adding cordova-plugin-prayer-widget
```

### Android Testing

```bash
# Build and install on device
cordova run android --device

# Check logcat for widget-related logs
adb logcat | grep PrayerWidget

# Expected output:
# PrayerWidget: Execute action: updateWidget
# PrayerWidget: Widget data saved: {...}
# PrayerTimeWidget: onUpdate called for X widgets
```

### iOS Testing

```bash
# Prepare iOS platform
cordova prepare ios

# In Xcode, check Build Settings for both targets:
# - Swift Language Version should be set
# - App Groups capability should be enabled

# Run on simulator or device
# Check Console for logs:
# PrayerWidget: Widget data updated and timelines reloaded
```

### Widget Functionality Testing

- [ ] Widget appears in widget picker
- [ ] Widget can be added to home screen
- [ ] Widget displays correct data
- [ ] Widget updates every minute
- [ ] Tap on widget opens app
- [ ] Widget shows correct prayer times for user location
- [ ] Widget shows countdown timer
- [ ] Widget works in Dark Mode
- [ ] Widget survives app restart
- [ ] Widget updates when app is in background

---

## 🚀 Production Deployment

### Version Numbers

Update version in THREE places before release:

1. **config.xml**:
```xml
<widget version="2.0.15" android-versionCode="110">
```

2. **package.json**:
```json
"version": "2.0.15"
```

3. **Plugin package.json** (if publishing plugin separately):
```json
"version": "1.0.0"
```

### Build Commands

```bash
# Increment version
yarn version:patch  # or version:minor or version:major

# Run tests
yarn test:all

# Build for web
yarn build:web

# Build Android release
yarn cordova:build:android --release

# Build iOS (in Xcode after cordova prepare ios)
# Product → Archive → Distribute
```

---

## 📝 Release Notes Template

```markdown
## Version 2.0.15

### 🆕 New Features
- **Home Screen Widget**: Add a beautiful widget to your home screen showing next prayer time and countdown
  - Available for Android 5.0+ and iOS 14+
  - Live countdown updates every minute
  - Tap to open app directly to prayer times
  - Matches app theme with teal/cyan gradient

### 🔧 Improvements
- Enhanced prayer time display with circular countdown
- Added seconds to prayer time countdowns
- Improved visual design for prayer times section

### 🐛 Bug Fixes
- [List any bug fixes]

### 📱 Widget Setup
- Android: Long-press home screen → Widgets → BetterIslam Q&A
- iOS: Long-press home screen → + button → Search "Prayer Times"
```

---

## ❓ Troubleshooting Build Issues

### Command Not Found: cordova

```bash
# Install Cordova globally
npm install -g cordova

# Or use npx
npx cordova build android
```

### Gradle Build Failed

```bash
# Clear Gradle cache
cd platforms/android
./gradlew clean

# Or rebuild platform
cd ../..
cordova platform remove android
cordova platform add android
```

### Xcode Build Failed

1. Clean build folder: Shift+Cmd+K
2. Delete Derived Data: Xcode → Preferences → Locations → Derived Data → Delete
3. Quit and restart Xcode
4. Try building again

### Plugin Installation Failed

```bash
# Remove plugin
cordova plugin remove cordova-plugin-prayer-widget

# Clear plugin cache
rm -rf ~/.cordova

# Re-add plugin
cordova plugin add ./cordova-plugin-prayer-widget --force
```

---

## 📞 Support

For build-related issues:
1. Check this document first
2. Review WIDGET_INSTALLATION.md
3. Check console/logcat for specific errors
4. Open GitHub issue with:
   - Platform (Android/iOS)
   - Cordova version
   - Error messages
   - Build logs

---

**Last Updated:** November 15, 2025
**Plugin Version:** 1.0.0
**App Version:** 2.0.14+
