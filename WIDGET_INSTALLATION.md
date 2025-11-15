# Prayer Time Widget Installation Guide

This guide explains how to install and configure the native prayer time widget for Android and iOS.

## 📦 Plugin Installation

### Step 1: Install the Plugin

From your project root directory, run:

```bash
cordova plugin add ./cordova-plugin-prayer-widget
```

Or if you prefer, you can install it using npm (after publishing):

```bash
cordova plugin add cordova-plugin-prayer-widget
```

### Step 2: Verify Installation

Check that the plugin was installed successfully:

```bash
cordova plugin ls
```

You should see `cordova-plugin-prayer-widget` in the list.

## 🤖 Android Setup

### Automatic Setup

The Android widget is automatically configured when you build the app!

```bash
yarn cordova:build:android
```

### Adding the Widget to Home Screen

1. **Install the APK** on your Android device
2. **Long-press** on an empty area of your home screen
3. Tap **"Widgets"**
4. Find **"BetterIslam Q&A"** in the widget list
5. **Drag** the "Prayer Times" widget to your home screen
6. The widget will automatically start showing prayer times!

### Widget Features

- ✅ Shows next prayer name and time
- ✅ Live countdown (updates every minute)
- ✅ Teal/cyan gradient background matching app theme
- ✅ Tap to open app directly to prayer times
- ✅ Auto-updates when app updates prayer data

## 🍎 iOS Setup

iOS widgets require additional manual configuration in Xcode.

### Step 1: Build iOS Platform

```bash
cordova prepare ios
```

### Step 2: Open in Xcode

```bash
open platforms/ios/BetterIslam\ Q\&A.xcworkspace
```

### Step 3: Create Widget Extension

1. In Xcode, click **File → New → Target**
2. Select **Widget Extension**
3. Configure:
   - Product Name: `PrayerTimeWidget`
   - Team: Select your development team
   - Include Configuration Intent: **Uncheck**
4. Click **Finish**
5. When prompted "Activate scheme?", click **Cancel**

### Step 4: Replace Widget Code

1. In the Project Navigator, find the `PrayerTimeWidget` folder
2. Delete the generated `PrayerTimeWidget.swift` file
3. Right-click `PrayerTimeWidget` folder → **Add Files to "BetterIslam Q&A"**
4. Navigate to: `cordova-plugin-prayer-widget/src/ios/PrayerTimeWidget.swift`
5. Select the file and click **Add**
6. Make sure **"Copy items if needed"** is checked

### Step 5: Configure App Groups

App Groups allow the widget and main app to share data.

**For Main App Target:**
1. Select the main app target (BetterIslam Q&A)
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **App Groups**
5. Click **+** and add: `group.com.dkurve.betterislamqa`

**For Widget Target:**
1. Select the **PrayerTimeWidget** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **App Groups**
5. Click **+** and add: `group.com.dkurve.betterislamqa` (same as main app)

### Step 6: Build and Run

1. Select your device or simulator
2. Click **Product → Build** (⌘B)
3. Fix any build errors if they appear
4. Click **Product → Run** (⌘R)

### Step 7: Add Widget to Home Screen (iOS 14+)

1. **Long-press** on home screen
2. Tap **"+"** button in top-left corner
3. Search for **"Prayer Times"**
4. Select widget size (Small or Medium)
5. Tap **"Add Widget"**
6. Widget will display prayer countdown!

### iOS Widget Features

- ✅ Native SwiftUI design
- ✅ Small and Medium widget sizes
- ✅ Gradient background matching app theme
- ✅ Updates every minute automatically
- ✅ Shows current/next prayer with countdown
- ✅ Tap to open app

## 🔄 Widget Updates

The widget automatically updates every 60 seconds when:
- The app is open and viewing prayer times
- The system requests a widget refresh

### Manual Widget Update

You can also trigger a manual update from the app:

```javascript
// In your code
if (window.PrayerWidget) {
  PrayerWidget.forceUpdate(
    () => console.log('Widget updated!'),
    (error) => console.error(error)
  );
}
```

## 🐛 Troubleshooting

### Android

**Widget doesn't appear in widget list:**
- Rebuild the app: `yarn cordova:build:android`
- Reinstall the APK on your device
- Restart your device

**Widget shows "--:--":**
- Open the main app
- Make sure location is set
- Wait 1-2 minutes for data to sync

**Widget doesn't update:**
- Check that the app has been opened at least once
- Verify location permissions are granted
- Force update from app settings

### iOS

**Build errors in Xcode:**
- Make sure you've added the widget file correctly
- Verify App Groups are configured for both targets
- Check that both use the same App Group ID

**Widget not in widget gallery:**
- Make sure iOS version is 14.0 or higher
- Rebuild and reinstall the app
- Restart your device

**Widget shows placeholder data:**
- Open the main app
- Set your location
- Wait 1 minute for data to sync
- Force-close and reopen widget gallery

## 📱 Testing

### Test Widget Updates

1. Open the app
2. Go to Prayer Times section
3. Wait 60 seconds
4. Check the widget - it should update
5. Check console logs for "Widget updated successfully"

### Check Widget Installation

```javascript
PrayerWidget.isWidgetInstalled(
  (installed) => {
    if (installed) {
      console.log('✅ Widget is on home screen');
    } else {
      console.log('❌ Widget not added yet');
    }
  },
  (error) => console.error(error)
);
```

## 📊 Widget Data Flow

```
App → prayerTimesService.updateWidget()
  ↓
  → PrayerWidget Cordova Plugin
    ↓
    → SharedPreferences (Android) / UserDefaults (iOS)
      ↓
      → Native Widget reads data
        ↓
        → Widget displays on home screen
```

## 🎨 Customization

### Change Widget Appearance

**Android:**
Edit `cordova-plugin-prayer-widget/src/android/res/layout/widget_prayer_time.xml`

**iOS:**
Edit `cordova-plugin-prayer-widget/src/ios/PrayerTimeWidget.swift`

### Change Update Frequency

Currently updates every 60 seconds. To change:

Edit `src/components/home/PrayerTimesCard.vue` and `src/views/PrayerTimesView.vue`:

```javascript
// Change from 60 to your desired interval (in seconds)
if (widgetUpdateCounter >= 60) {
  prayerTimesService.updateWidget()
  widgetUpdateCounter = 0
}
```

## 🚀 Deployment

### Android Release Build

```bash
yarn cordova:build:android --release
```

Widget will be included in the APK automatically.

### iOS Release Build

1. Complete all iOS setup steps above
2. Archive in Xcode: **Product → Archive**
3. Distribute to App Store

**Important:** Make sure to include the Widget Extension when uploading!

## 📚 Additional Resources

- [Android App Widgets Guide](https://developer.android.com/guide/topics/appwidgets)
- [iOS WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [Cordova Plugin Development](https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/)

## ❓ Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the plugin README: `cordova-plugin-prayer-widget/README.md`
3. Check console logs for errors
4. Open an issue on GitHub

---

**Happy coding! 🕌**
