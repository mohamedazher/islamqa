# Firebase Analytics Setup Guide

> **📋 Note**: Setup is already complete for this project!
> For usage, quick start, and API reference, see **[docs/FIREBASE_README.md](./docs/FIREBASE_README.md)**
> This guide documents the initial setup process for reference.

---

This guide documents how to set up Firebase Analytics for the BetterIslam Q&A app across Web, iOS, and Android platforms.

## Overview

The app uses a unified analytics wrapper (`src/services/analytics.js`) that automatically detects the platform and uses:
- **Firebase JS SDK** for web builds
- **cordova-plugin-firebase-analytics** for iOS and Android builds

All three platforms report to the **same Firebase project**, giving you unified analytics in one dashboard.

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (or select existing project)
3. Enter project name (e.g., "BetterIslam QA")
4. Follow the setup wizard (Google Analytics is optional but recommended)

---

## Step 2: Configure Web Platform

### 2.1 Register Web App in Firebase

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web icon (</>)** to add a web app
4. Enter nickname: "BetterIslam Web"
5. ✅ Check "Also set up Firebase Hosting" (optional)
6. Click **"Register app"**

### 2.2 Copy Web Configuration

You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

### 2.3 Update Analytics Service

Open `src/services/analytics.js` and replace the `firebaseConfig` object (around line 15) with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
}
```

---

## Step 3: Configure Android Platform

### 3.1 Register Android App in Firebase

1. In Firebase Console, go to **Project Settings**
2. Click the **Android icon** to add an Android app
3. Enter Android package name: `com.dkurve.betterislamqa`
4. Enter app nickname: "BetterIslam Android"
5. Click **"Register app"**

### 3.2 Download google-services.json

1. Download the `google-services.json` file
2. Place it in your project root: `/google-services.json`
3. The Cordova plugin will automatically copy it during build

**Important**: The file will be copied to `platforms/android/app/google-services.json` during `cordova prepare android`

---

## Step 4: Configure iOS Platform

### 4.1 Register iOS App in Firebase

1. In Firebase Console, go to **Project Settings**
2. Click the **iOS icon** to add an iOS app
3. Enter iOS bundle ID: `com.dkurve.betterislamqa`
4. Enter app nickname: "BetterIslam iOS"
5. Click **"Register app"**

### 4.2 Download GoogleService-Info.plist

1. Download the `GoogleService-Info.plist` file
2. Place it in your project root: `/GoogleService-Info.plist`
3. The Cordova plugin will automatically copy it during build

**Important**: The file will be copied to `platforms/ios/BetterIslam Q&A/GoogleService-Info.plist` during `cordova prepare ios`

---

## Step 5: Install Dependencies

### 5.1 Install npm packages

```bash
# Install Firebase JS SDK (for web)
yarn install

# This will install firebase@^11.0.2 from package.json
```

### 5.2 Install Cordova Plugin

```bash
# Install Firebase Analytics Cordova plugin (for iOS/Android)
cordova plugin add cordova-plugin-firebase-analytics

# Verify installation
cordova plugin list | grep firebase
# Should show: cordova-plugin-firebase-analytics
```

---

## Step 6: Build and Test

### 6.1 Test Web Build

```bash
# Development server
yarn dev

# Open browser console and look for:
# [Analytics] ✅ Firebase Web SDK initialized
# [Analytics] 📊 Screen view: home

# Production build
yarn build:web
```

### 6.2 Test Android Build

```bash
# Make sure google-services.json is in project root
# Build Android app
yarn cordova:build:android

# Run on device/emulator
cordova run android

# Check logs:
adb logcat | grep -i firebase
# Should see Firebase initialization messages
```

### 6.3 Test iOS Build

```bash
# Make sure GoogleService-Info.plist is in project root
# Build iOS app
yarn cordova:build:ios

# Open in Xcode and run on simulator/device
# Check Xcode console for Firebase initialization
```

---

## Step 7: Verify Analytics

### 7.1 Firebase Console DebugView

1. Go to Firebase Console → **Analytics** → **DebugView**
2. Enable debug mode:
   - **Web**: Add `?analytics_debug=true` to URL
   - **Android**: Run `adb shell setprop debug.firebase.analytics.app com.dkurve.betterislamqa`
   - **iOS**: Edit scheme in Xcode, add `-FIRDebugEnabled` to launch arguments

3. Use the app and watch events appear in real-time

### 7.2 Check Events Dashboard

1. Go to Firebase Console → **Analytics** → **Events**
2. Wait 24-48 hours for data to appear (DebugView is instant)
3. You should see:
   - `screen_view` - Automatic page tracking
   - `question_viewed` - Custom event when viewing questions
   - `search` - Custom event when searching
   - Other custom events

---

## File Structure

After setup, your project should have:

```
islamqa/
├── google-services.json          # Android config (gitignored)
├── GoogleService-Info.plist      # iOS config (gitignored)
├── src/
│   ├── services/
│   │   └── analytics.js          # Analytics service (config updated)
│   ├── router/
│   │   └── index.js              # Router with auto-tracking
│   └── examples/
│       └── AnalyticsExample.vue  # Usage examples
└── package.json                  # Updated with Firebase deps
```

---

## Important Notes

### Security

⚠️ **Add to .gitignore**:

```gitignore
# Firebase config files (contain sensitive keys)
google-services.json
GoogleService-Info.plist
```

These files contain API keys and should NOT be committed to version control.

### Content Security Policy

The web app's CSP (in `index.html`) needs to allow Firebase domains. Update if needed:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self' data: https://ssl.gstatic.com https://*.firebaseio.com https://*.googleapis.com 'unsafe-eval' 'unsafe-inline';
  ...
">
```

### Data Collection Consent

Consider adding user consent for analytics collection:

```javascript
import { useAnalytics } from '@/services/analytics'

const { setEnabled } = useAnalytics()

// Disable if user opts out
function handlePrivacySettings(userConsent) {
  setEnabled(userConsent)
}
```

---

## Usage Examples

### Automatic Screen Tracking

Screen views are tracked automatically via the router (`src/router/index.js`). No additional code needed!

### Track Custom Events in Components

```vue
<script setup>
import { useAnalytics } from '@/services/analytics'

const { logQuestionView, logSearch, logEvent } = useAnalytics()

// Track question view
const viewQuestion = (id, category) => {
  logQuestionView(id, category)
}

// Track search
const performSearch = (query, results) => {
  logSearch(query, results.length)
}

// Track custom event
const customAction = () => {
  logEvent('custom_event', {
    property1: 'value1',
    property2: 'value2'
  })
}
</script>
```

See `src/examples/AnalyticsExample.vue` for more patterns.

---

## Troubleshooting

### Web: "Firebase not initialized"

- Check that `firebaseConfig` in `src/services/analytics.js` has your actual values
- Check browser console for errors
- Verify Firebase SDK is loaded (check Network tab)

### Android: Plugin not found

```bash
# Reinstall plugin
cordova plugin remove cordova-plugin-firebase-analytics
cordova plugin add cordova-plugin-firebase-analytics

# Ensure google-services.json is in root
ls -la google-services.json

# Clean and rebuild
cordova clean android
cordova prepare android
cordova build android
```

### iOS: Build errors

```bash
# Clean iOS build
cordova clean ios
rm -rf platforms/ios

# Re-add platform
cordova platform add ios

# Ensure GoogleService-Info.plist is in root
ls -la GoogleService-Info.plist

# Rebuild
cordova prepare ios
cordova build ios
```

### Events not showing in Firebase

- **DebugView**: Use debug mode (see Step 7.1) for real-time testing
- **Production**: Wait 24-48 hours for data to appear in main dashboard
- **Check quotas**: Free tier has 500 distinct events limit
- **Verify initialization**: Check console logs for "✅ Firebase initialized"

---

## What Gets Tracked

### Automatic Tracking

- ✅ Screen views (all page navigations)
- ✅ User engagement (session duration, user retention)
- ✅ Device info (OS, device model, app version)
- ✅ Geographic data (country, city)

### Custom Events Available

See `src/services/analytics.js` for all available methods:

- `logQuestionView(questionId, category)` - Track question views
- `logSearch(searchTerm, resultCount)` - Track searches
- `logCategoryView(categoryName, categoryId)` - Track category browsing
- `logFolderAction(action, folderName)` - Track folder operations
- `logShare(contentType, contentId)` - Track sharing
- `logQuizEvent(action, params)` - Track quiz interactions
- `logEvent(eventName, params)` - Track any custom event

---

## Privacy Considerations

Firebase Analytics is GDPR compliant when configured properly:

1. **User Consent**: Disable analytics until user consents
2. **IP Anonymization**: Enabled by default in Firebase
3. **Data Retention**: Configure in Firebase Console (default: 14 months)
4. **Privacy Policy**: Update your privacy policy to mention Firebase Analytics

See: https://firebase.google.com/support/privacy

---

## Additional Resources

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Cordova Firebase Plugin](https://github.com/dpa99c/cordova-plugin-firebasex)
- [Firebase Console](https://console.firebase.google.com/)
- [Analytics Events Reference](https://support.google.com/firebase/answer/9267735)

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Verify all config files are in place
3. Check console logs for error messages
4. Review Firebase Console for any setup warnings
