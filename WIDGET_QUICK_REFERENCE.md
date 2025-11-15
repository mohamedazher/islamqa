# Prayer Widget - Quick Reference Card

## 🚀 Quick Start

### Install Plugin
```bash
cordova plugin add ./cordova-plugin-prayer-widget
```

### Build
```bash
# Android
yarn cordova:build:android

# iOS (requires Xcode setup)
cordova prepare ios
open platforms/ios/*.xcworkspace
```

### Validate Before Building
```bash
./scripts/validate-widget-build.sh
```

---

## 📱 Using the Widget

### JavaScript API

```javascript
// Update widget
PrayerWidget.updateWidget({
  nextPrayer: "Maghrib",
  nextPrayerTime: "6:45 PM",
  timeRemaining: "3h 20m",
  currentPrayer: "Asr",  // Optional
  currentPrayerEnd: "6:45 PM"  // Optional
}, successCallback, errorCallback);

// Check if installed
PrayerWidget.isWidgetInstalled(
  (installed) => console.log('Installed:', installed),
  (error) => console.error(error)
);

// Force update
PrayerWidget.forceUpdate(
  () => console.log('Updated'),
  (error) => console.error(error)
);
```

### Automatic Updates

Widget updates every 60 seconds when:
- `PrayerTimesCard.vue` is mounted
- `PrayerTimesView.vue` is mounted

See: `src/services/prayerTimesService.js:updateWidget()`

---

## 🤖 Android

### Adding Widget to Home Screen
1. Long-press on home screen
2. Tap **"Widgets"**
3. Find **"BetterIslam Q&A"**
4. Drag **Prayer Times** widget
5. Done!

### Troubleshooting

**Widget not in picker:**
```bash
# Reinstall plugin
cordova plugin remove cordova-plugin-prayer-widget
cordova plugin add ./cordova-plugin-prayer-widget
cordova prepare android
```

**Widget shows blank screen:**
```bash
# Check logcat
adb logcat | grep PrayerWidget
```

---

## 🍎 iOS

### Setup Required (One-Time)

1. **Create Widget Extension:**
   ```bash
   cordova prepare ios
   open platforms/ios/*.xcworkspace
   ```

2. **In Xcode:**
   - File → New → Target
   - Select "Widget Extension"
   - Name: "PrayerTimeWidget"
   - Uncheck "Include Configuration Intent"

3. **Add Widget Code:**
   - Delete generated `PrayerTimeWidget.swift`
   - Add: `cordova-plugin-prayer-widget/src/ios/PrayerTimeWidget.swift`

4. **Configure App Groups:**
   - Main app: Signing & Capabilities → + → App Groups
   - Add: `group.com.dkurve.betterislamqa`
   - Repeat for Widget Extension target

5. **Build and run**

### Adding Widget to Home Screen
1. Long-press on home screen
2. Tap **"+"** button (top-left)
3. Search **"Prayer Times"**
4. Select size → **Add Widget**
5. Done!

### Troubleshooting

**Widget not updating:**
- Verify App Group ID matches in both targets
- Check: Main app entitlements
- Check: Widget Extension entitlements

**Build fails:**
```bash
# Clean and rebuild
# In Xcode: Product → Clean Build Folder (Shift+Cmd+K)
# Then: Product → Build (Cmd+B)
```

---

## 📊 Widget Data Flow

```
App runs every 60s
    ↓
prayerTimesService.updateWidget()
    ↓
PrayerWidget Cordova Plugin
    ↓
SharedPreferences (Android) / UserDefaults (iOS)
    ↓
Native Widget Provider reads data
    ↓
Widget UI updates on home screen
```

---

## 🔧 Common Commands

```bash
# Validate setup
./scripts/validate-widget-build.sh

# Install plugin
cordova plugin add ./cordova-plugin-prayer-widget

# Remove plugin
cordova plugin remove cordova-plugin-prayer-widget

# List installed plugins
cordova plugin ls

# Prepare platforms
cordova prepare android
cordova prepare ios

# Build debug
cordova build android
cordova build ios

# Build release
cordova build android --release
# iOS: Use Xcode → Product → Archive

# Run on device
cordova run android --device
# iOS: Use Xcode → Run

# Check logs (Android)
adb logcat | grep PrayerWidget

# Check logs (iOS)
# In Xcode: View → Debug Area → Activate Console
```

---

## 📝 Permissions

### Android
- ✅ Location (already configured)
- ✅ Widget receiver (auto-configured by plugin)
- ✅ No additional permissions needed

### iOS
- ✅ Location when in use (already configured)
- ✅ App Groups (manual setup in Xcode)
- ✅ No additional permissions needed

---

## 🐛 Known Issues

| Issue | Platform | Solution |
|-------|----------|----------|
| Widget not in picker | Android | Reinstall plugin, rebuild |
| Widget blank screen | Android | Check resources copied |
| Widget not updating | iOS | Verify App Groups match |
| Build fails with Swift error | iOS | Update to Cordova iOS 7+ |
| Widget shows "--:--" | Both | Open app, set location |

---

## 📚 Documentation

- **Setup:** [WIDGET_INSTALLATION.md](WIDGET_INSTALLATION.md)
- **Build Requirements:** [WIDGET_BUILD_REQUIREMENTS.md](WIDGET_BUILD_REQUIREMENTS.md)
- **Plugin README:** [cordova-plugin-prayer-widget/README.md](cordova-plugin-prayer-widget/README.md)

---

## 🎯 Quick Checklist

### Before First Build
- [ ] Run `./scripts/validate-widget-build.sh`
- [ ] Install plugin: `cordova plugin add ./cordova-plugin-prayer-widget`
- [ ] Prepare platform: `cordova prepare android` (or ios)

### Before Release
- [ ] Test widget on physical device
- [ ] Verify widget updates every minute
- [ ] Test tap-to-open functionality
- [ ] Update version numbers
- [ ] Add widget screenshots to store listing

### iOS Additional Steps
- [ ] Create Widget Extension in Xcode
- [ ] Add PrayerTimeWidget.swift file
- [ ] Configure App Groups (both targets)
- [ ] Test on iOS 14+ device

---

## ⚡ Quick Fixes

### Widget stopped updating
```javascript
// In browser console or app
PrayerWidget.forceUpdate(
  () => console.log('OK'),
  (e) => console.error(e)
);
```

### Reset plugin
```bash
cordova plugin remove cordova-plugin-prayer-widget
rm -rf platforms/android platforms/ios
cordova platform add android ios
cordova plugin add ./cordova-plugin-prayer-widget
```

### Check if working
```bash
# Android
adb logcat -c && adb logcat | grep PrayerWidget

# Should see:
# PrayerWidget: Widget updated successfully
```

---

**Version:** 1.0.0
**Last Updated:** November 15, 2025
**Support:** [GitHub Issues](https://github.com/mohamedazher/islamqa/issues)
