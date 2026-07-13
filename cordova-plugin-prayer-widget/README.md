# Cordova prayer-time widget

This local plugin bridges the app's calculated prayer schedule to native home
screen widgets. Version 2 of the data contract stores absolute prayer instants,
not a frozen countdown. Native code derives the current prayer, next prayer,
formatted times, and remaining duration whenever the widget renders.

## Data contract

```js
window.PrayerWidget.updateWidget({
  schemaVersion: 2,
  timezone: 'Asia/Riyadh',       // IANA timezone of the saved location
  locationName: 'Makkah',
  generatedAtMs: Date.now(),
  prayerTimestamps: {
    fajr: 1783900000000,
    sunrise: 1783904800000,       // ends the Fajr current-prayer window
    dhuhr: 1783920000000,
    asr: 1783934000000,
    maghrib: 1783947000000,
    isha: 1783952000000,
    nextFajr: 1783986400000      // tomorrow, required after Isha
  },
  // Display strings remain for compatibility with an old installed widget.
  fajr: '4:45 AM',
  dhuhr: '12:24 PM',
  asr: '3:44 PM',
  maghrib: '7:09 PM',
  isha: '8:39 PM'
}, success, error)
```

Epoch values must be milliseconds, ordered, and within ten years of the device
clock. Invalid/missing absolute values fall back to legacy display strings and
show no fabricated live state.

Sunrise is required even though it is not rendered as a prayer. It ends the
Fajr window; the widget shows no current prayer between sunrise and Dhuhr.

Android formats the instants in the supplied IANA timezone, performs a
battery-friendly 30-minute fallback refresh, and schedules a one-shot refresh
at the next prayer boundary. iOS creates timeline entries at prayer boundaries
and uses WidgetKit's timer rendering for a live countdown. Neither platform
recalculates astronomical prayer times; the app must refresh and republish the
schedule after location, calculation-method, madhab, timezone, or date changes.

## Android installation and launch contract

Install the local plugin and rebuild the generated platform:

```bash
cordova plugin add ./cordova-plugin-prayer-widget
cordova prepare android
```

The receiver is registered automatically. Tapping the widget launches the app
with an `openPrayerTimes` Intent extra. The native bridge exposes it once as a
route-neutral action:

```js
window.PrayerWidget.consumeLaunchAction(action => {
  if (action === 'prayer-times') router.push('/prayer-times')
}, console.error)
```

Call that method on both `deviceready` and Cordova `resume`. Consumption clears
the extra so unrelated future resumes do not navigate unexpectedly. The plugin
does not import or depend on Vue Router.

`isWidgetInstalled(success, error)` reports whether Android has an instance.
`forceUpdate(success, error)` asks installed widgets to render immediately.

## iOS integration status

The Cordova plugin installs only the main-app bridge (`PrayerWidget.swift`).
Cordova does **not** create or sign a Widget Extension target. Therefore the
provided `src/ios/PrayerTimeWidget.swift` is reference source, not an integrated
iOS widget until the following native work is completed in Xcode:

1. create a Widget Extension target (iOS 14+);
2. add `PrayerTimeWidget.swift` to that extension target only;
3. enable `group.com.dkurve.betterislamqa` for the app and extension targets;
4. configure signing/provisioning for the extension;
5. ensure both target entitlements contain the same App Group;
6. repeat/automate those changes after any destructive Cordova platform rebuild.

Until then, calls from the app can write App Group data but no iOS home-screen
widget is shipped. `isWidgetInstalled` cannot be implemented accurately on iOS
because WidgetKit exposes no installation-query API; its current success value
means only that the bridge is available.

## Verification

Run repository static contract tests with `yarn test:all`. For device QA:

- change location/timezone and verify native formatted times change;
- cross Fajr, Dhuhr, Asr, Maghrib, Isha, and midnight/next-Fajr boundaries;
- force-stop/background the app and verify the widget changes at a boundary;
- tap the Android widget from cold start and resume;
- remove consent/location and ensure the app no longer publishes coordinates or
  new schedules (the widget may display the last locally saved schedule).
