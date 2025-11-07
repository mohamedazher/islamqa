# Firebase Analytics - Quick Reference

## Setup Checklist

- [ ] Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Add Web app, copy config to `src/services/analytics.js`
- [ ] Add Android app, download `google-services.json` to project root
- [ ] Add iOS app, download `GoogleService-Info.plist` to project root
- [ ] Run `yarn install` to get Firebase JS SDK
- [ ] Run `cordova plugin add cordova-plugin-firebase-analytics`
- [ ] Add Firebase config files to `.gitignore` ✅ (already done)
- [ ] Test on web, Android, and iOS

---

## Usage in Vue Components

```vue
<script setup>
import { useAnalytics } from '@/services/analytics'

const {
  logScreen,
  logEvent,
  logQuestionView,
  logSearch,
  logCategoryView,
  logFolderAction,
  logShare,
  logQuizEvent,
  setUserProperties,
  setUserId
} = useAnalytics()
</script>
```

---

## Common Tracking Patterns

### Screen Views (Automatic)
Already tracked via router. No code needed! ✅

### Question Viewed
```javascript
logQuestionView(questionId, categoryName)
// Example: logQuestionView(12345, 'Fiqh')
```

### Search
```javascript
logSearch(searchQuery, numberOfResults)
// Example: logSearch('prayer times', 42)
```

### Category Browsed
```javascript
logCategoryView(categoryName, categoryId)
// Example: logCategoryView('Fiqh', 5)
```

### Folder Actions
```javascript
logFolderAction(action, folderName)
// Actions: 'create', 'add_question', 'remove_question', 'delete'
// Example: logFolderAction('create', 'My Favorites')
```

### Share
```javascript
logShare(contentType, contentId)
// Example: logShare('question', 12345)
```

### Quiz Events
```javascript
logQuizEvent('start', { category: 'Fiqh' })
logQuizEvent('complete', { score: 85, total_questions: 10 })
logQuizEvent('answer', { correct: true, question_id: 123 })
```

### Custom Events
```javascript
logEvent('custom_event_name', {
  param1: 'value1',
  param2: 'value2'
})
```

### User Properties
```javascript
setUserProperties({
  theme: 'dark',
  language: 'en',
  premium_user: 'false'
})
```

---

## Testing

### Web (Instant)
```bash
yarn dev
# Open http://localhost:5173?analytics_debug=true
# Check browser console for analytics logs
```

### Android Debug
```bash
adb shell setprop debug.firebase.analytics.app com.dkurve.betterislamqa
cordova run android
# Check Firebase Console → Analytics → DebugView
```

### iOS Debug
```
1. Open in Xcode
2. Edit Scheme → Arguments → Add: -FIRDebugEnabled
3. Run on simulator/device
4. Check Firebase Console → Analytics → DebugView
```

---

## Event Naming Best Practices

✅ **Good**
- Use snake_case: `question_viewed`, `folder_created`
- Be specific: `quiz_completed` not `quiz`
- Use verbs: `search_performed`, `category_selected`

❌ **Avoid**
- Spaces: `question viewed`
- Special chars: `question-viewed`, `question.viewed`
- Too generic: `click`, `action`
- PII data: Don't log user emails, names, etc.

---

## Parameter Guidelines

- Max 25 parameters per event
- Parameter names: max 40 characters
- Parameter values: max 100 characters (strings)
- Use consistent naming across events

---

## Where Analytics Are Already Integrated

✅ **Router** (`src/router/index.js`)
- Automatic screen view tracking on every navigation

🔨 **TODO: Add to these views**
- [ ] `QuestionView.vue` - Track question views
- [ ] `SearchView.vue` - Track searches
- [ ] `CategoryView.vue` - Track category browsing
- [ ] `FoldersView.vue` - Track folder operations
- [ ] `QuizView.vue` - Track quiz interactions
- [ ] Share buttons - Track social shares

---

## Firebase Console

### View Analytics
1. [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Analytics** in sidebar

### Key Reports
- **Dashboard** - Overview of users and events
- **Events** - All tracked events (24-48h delay)
- **DebugView** - Real-time event testing
- **Realtime** - Current active users
- **Users** - User demographics and behavior

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Not initialized" in console | Check `firebaseConfig` in `src/services/analytics.js` |
| No events in Firebase | Wait 24-48h or use DebugView for instant results |
| Android build fails | Ensure `google-services.json` is in project root |
| iOS build fails | Ensure `GoogleService-Info.plist` is in project root |
| Plugin not found | Run `cordova plugin add cordova-plugin-firebase-analytics` |

---

## Files Modified

- ✅ `src/services/analytics.js` - Main analytics service
- ✅ `src/main.js` - Initialize analytics on app start
- ✅ `src/router/index.js` - Auto-track screen views
- ✅ `package.json` - Added Firebase dependencies
- ✅ `.gitignore` - Ignore Firebase config files
- ✅ `src/examples/AnalyticsExample.vue` - Usage examples

---

## Resources

- 📖 [Full Setup Guide](../FIREBASE_ANALYTICS_SETUP.md)
- 📖 [Firebase Docs](https://firebase.google.com/docs/analytics)
- 📖 [Plugin Docs](https://github.com/dpa99c/cordova-plugin-firebasex)
- 📊 [Your Firebase Console](https://console.firebase.google.com)

---

## Need Help?

1. Check [FIREBASE_ANALYTICS_SETUP.md](../FIREBASE_ANALYTICS_SETUP.md) for detailed setup
2. Check [src/examples/AnalyticsExample.vue](../src/examples/AnalyticsExample.vue) for code examples
3. Check Firebase Console for configuration issues
4. Check browser/device console for error messages
