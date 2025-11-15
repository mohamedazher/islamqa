# Cordova Plugin Prayer Widget

A Cordova plugin that provides native home screen widgets for prayer times on Android and iOS.

## Features

- ✅ **Android Widget**: Beautiful home screen widget with gradient background
- ✅ **iOS Widget**: Native WidgetKit widget for iOS 14+
- ✅ **Live Updates**: Countdown updates every minute automatically
- ✅ **Current & Next Prayer**: Shows current prayer time or next prayer
- ✅ **Tap to Open**: Tapping widget opens the app
- ✅ **Dark/Light Theme**: Matches app theme with teal/cyan gradient

## Installation

```bash
cordova plugin add /path/to/cordova-plugin-prayer-widget
```

Or from your project root:

```bash
cordova plugin add ./cordova-plugin-prayer-widget
```

## Usage

### Update Widget

Call this method whenever prayer time data changes (recommended: every minute):

```javascript
if (window.PrayerWidget) {
  const prayerData = {
    nextPrayer: "Maghrib",
    nextPrayerTime: "6:45 PM",
    timeRemaining: "3h 20m",
    currentPrayer: "Asr",  // Optional: if currently in prayer window
    currentPrayerEnd: "6:45 PM"  // Optional: when current prayer ends
  };

  PrayerWidget.updateWidget(
    prayerData,
    () => console.log('Widget updated successfully'),
    (error) => console.error('Widget update failed:', error)
  );
}
```

### Check if Widget is Installed

```javascript
PrayerWidget.isWidgetInstalled(
  (installed) => {
    if (installed) {
      console.log('Widget is installed on home screen');
    }
  },
  (error) => console.error(error)
);
```

### Force Widget Update

Useful for testing:

```javascript
PrayerWidget.forceUpdate(
  () => console.log('Widget force updated'),
  (error) => console.error(error)
);
```

## Platform-Specific Setup

### Android

No additional setup required. Widget will appear in the widget picker after app installation.

**Adding the Widget:**
1. Long-press on home screen
2. Tap "Widgets"
3. Find "BetterIslam Q&A"
4. Drag the Prayer Times widget to home screen

### iOS

**Additional Setup Required:**

1. Open your project in Xcode:
   ```bash
   open platforms/ios/BetterIslam\ Q\&A.xcworkspace
   ```

2. Create a Widget Extension:
   - File → New → Target
   - Select "Widget Extension"
   - Name it "PrayerTimeWidget"
   - Uncheck "Include Configuration Intent"

3. Replace the generated widget code with `/src/ios/PrayerTimeWidget.swift`

4. Configure App Groups:
   - Select main app target
   - Signing & Capabilities → + Capability → App Groups
   - Add group: `group.com.dkurve.betterislamqa`
   - Repeat for PrayerTimeWidget target

5. Build and run

**Adding the Widget:**
1. Long-press on home screen
2. Tap "+" in top-left corner
3. Search for "Prayer Times"
4. Select widget size and tap "Add Widget"

## Widget Display

The widget shows:
- 🕌 Mosque icon
- Prayer name (Current or Next)
- Large countdown timer
- Prayer time
- Tap to open hint

## Data Format

```javascript
{
  nextPrayer: string,        // "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"
  nextPrayerTime: string,    // "5:30 AM"
  timeRemaining: string,     // "2h 15m" or "45m" or "30s"
  currentPrayer: string,     // Optional: "Dhuhr" (if currently in prayer window)
  currentPrayerEnd: string   // Optional: "2:30 PM"
}
```

## Requirements

- Cordova >= 9.0.0
- cordova-android >= 9.0.0
- cordova-ios >= 6.0.0
- iOS 14+ (for iOS widgets)
- Android 5.0+ (API 21+)

## License

MIT

## Author

BetterIslam Q&A Team
