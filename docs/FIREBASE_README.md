# Firebase Analytics Documentation

Complete documentation for Firebase Analytics integration in BetterIslam Q&A app.

---

## 📋 Current Status

✅ **Setup Complete** - Firebase Analytics is fully configured and ready to use

### Configuration Details
- **Project ID**: `betterislamqa`
- **Project Number**: `1062208000513`
- **Platforms**: Web ✅ | Android ✅ | iOS ✅

### What's Working
- ✅ Web build with Firebase JS SDK v11.0.2
- ✅ Android config (`google-services.json` in place)
- ✅ iOS config (`GoogleService-Info.plist` in place)
- ✅ Cordova plugin v7.0.5 installed
- ✅ Auto-tracking enabled (screen views on every navigation)
- ✅ Analytics service with helper methods

### Files
```
islamqa/
├── google-services.json              # Android (gitignored)
├── GoogleService-Info.plist          # iOS (gitignored)
├── src/services/analytics.js         # Main analytics service
├── src/router/index.js               # Auto-tracking integration
├── src/main.js                       # Initialization
└── src/examples/AnalyticsExample.vue # Usage examples
```

---

## 🚀 Quick Start

### Test It Now

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Check browser console for:
# [Analytics] ✅ Firebase Web SDK initialized
# [Analytics] 📊 Screen view: home
```

### Use in Components

```vue
<script setup>
import { useAnalytics } from '@/services/analytics'

const { logQuestionView, logSearch, logEvent } = useAnalytics()

// Track question views
function viewQuestion(id, category) {
  logQuestionView(id, category)
}

// Track searches
function performSearch(query, results) {
  logSearch(query, results.length)
}

// Track custom events
function customAction() {
  logEvent('button_click', { button_name: 'share' })
}
</script>
```

### View Analytics

**Firebase Console**: https://console.firebase.google.com/project/betterislamqa/analytics

**DebugView** (real-time testing):
- **Web**: Add `?analytics_debug=true` to URL
- **Android**: `adb shell setprop debug.firebase.analytics.app com.dkurve.betterislamqa`
- **iOS**: Add `-FIRDebugEnabled` to Xcode launch arguments

---

## 📖 Documentation

### For Developers (Usage)
📘 **[Quick Reference](./ANALYTICS_QUICK_REFERENCE.md)** - API methods, code examples, common patterns

### For Setup/Configuration
📗 **[Setup Guide](../FIREBASE_ANALYTICS_SETUP.md)** - Complete Firebase setup instructions

### Examples
💻 **[Code Examples](../src/examples/AnalyticsExample.vue)** - Copy-paste ready examples

---

## 🎯 What Gets Tracked

### Automatic Tracking
- ✅ **Screen views** - Every page navigation
- ✅ **User engagement** - Session duration, retention
- ✅ **Device info** - OS, browser, device model
- ✅ **Geographic data** - Country, city

### Available Custom Events

| Method | Purpose | Example |
|--------|---------|---------|
| `logQuestionView()` | Track question views | `logQuestionView(123, 'Fiqh')` |
| `logSearch()` | Track search queries | `logSearch('prayer', 42)` |
| `logCategoryView()` | Track category browsing | `logCategoryView('Fiqh', 5)` |
| `logFolderAction()` | Track folder operations | `logFolderAction('create', 'Favorites')` |
| `logShare()` | Track social sharing | `logShare('question', 123)` |
| `logQuizEvent()` | Track quiz interactions | `logQuizEvent('complete', {...})` |
| `logEvent()` | Track any custom event | `logEvent('custom', {...})` |

See [Quick Reference](./ANALYTICS_QUICK_REFERENCE.md) for complete API documentation.

---

## 🏗️ Architecture

### Platform Detection
```javascript
// Automatically detects environment
if (window.cordova) {
  // Use Cordova plugin (iOS/Android)
  window.FirebasePlugin.logEvent(...)
} else {
  // Use Firebase JS SDK (Web)
  firebase.analytics().logEvent(...)
}
```

### Unified API
All platforms use the same API through `useAnalytics()` composable:
```javascript
const { logScreen, logEvent } = useAnalytics()
// Works on Web, iOS, and Android without changes
```

### Router Integration
Screen views are tracked automatically in `src/router/index.js`:
```javascript
router.afterEach((to) => {
  const { logScreen } = useAnalytics()
  logScreen(to.name, { page_path: to.path })
})
```

---

## 🔧 Build & Deploy

### Web
```bash
npm run build:web     # Build for production
npm run deploy        # Deploy to GitHub Pages
```

### Android
```bash
npm run cordova:build:android         # Debug build
npm run cordova:build:android --release  # Release APK
```

### iOS
```bash
npm run cordova:build:ios             # Debug build
npm run cordova:build:ios --release   # Release build
```

**Note**: Config files are automatically copied during Cordova builds.

---

## 🐛 Troubleshooting

### Web: Firebase not initializing
```bash
# Check config
cat src/services/analytics.js | grep -A 8 "firebaseConfig"

# Verify Firebase installed
npm list firebase
```

### Android: Plugin not found
```bash
# Check plugin
npx cordova plugin list

# Reinstall if needed
npx cordova plugin remove cordova-plugin-firebase-analytics
npx cordova plugin add cordova-plugin-firebase-analytics
```

### Events not showing
- Use **DebugView** for instant results (no 24-48h wait)
- Check internet connection
- Verify analytics enabled in Firebase Console
- Check browser/device console for errors

### iOS: Cordova compatibility
Old cordova-ios has ES module issues. Update:
```bash
npx cordova platform remove ios
npx cordova platform add ios@latest
```

---

## 📊 Analytics Dashboard

### Key Reports
- **Dashboard** - Overview, active users
- **Events** - All tracked events (24-48h delay)
- **DebugView** - Real-time testing
- **Realtime** - Current active users
- **User Properties** - User segments
- **Demographics** - Age, gender, location
- **Retention** - User retention over time

### Access
🔗 https://console.firebase.google.com/project/betterislamqa

---

## 🔒 Privacy & Security

### Security
- Config files are **gitignored** (contains API keys)
- API keys are restricted to app domains in Firebase Console
- Data transmission encrypted (HTTPS)

### GDPR Compliance
```javascript
import { useAnalytics } from '@/services/analytics'

// Disable analytics for users who opt out
function handlePrivacySettings(userConsent) {
  const { setEnabled } = useAnalytics()
  setEnabled(userConsent)
}
```

- IP anonymization: Enabled by default
- Data retention: Configurable in Firebase Console
- User deletion: Available via Firebase APIs

---

## 📚 Resources

- 📖 [Firebase Analytics Docs](https://firebase.google.com/docs/analytics)
- 📖 [Cordova Plugin Docs](https://github.com/dpa99c/cordova-plugin-firebasex)
- 📖 [Events Reference](https://support.google.com/firebase/answer/9267735)
- 🔗 [Firebase Console](https://console.firebase.google.com/project/betterislamqa)

---

## 💡 Tips

1. **Use DebugView** for testing - See events instantly without 24h wait
2. **Name events consistently** - Use snake_case, be specific
3. **Limit parameters** - Max 25 params per event
4. **Track user actions** - Not just page views
5. **Set up conversions** - Mark important events in Firebase Console

---

## ✅ Summary

Firebase Analytics is **fully integrated and working**:

- ✅ All platforms configured (Web, iOS, Android)
- ✅ Auto-tracking enabled
- ✅ Helper methods ready to use
- ✅ Web build tested and working
- ✅ Documentation complete

**Start tracking**: Import `useAnalytics()` and start logging events!

**Need help?** Check [Quick Reference](./ANALYTICS_QUICK_REFERENCE.md) or [Setup Guide](../FIREBASE_ANALYTICS_SETUP.md)
