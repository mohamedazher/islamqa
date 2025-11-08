# Leaderboard Setup Guide

This guide walks you through setting up the Firebase-based leaderboard system for BetterIslam Q&A.

## Prerequisites

- Node.js and Yarn installed
- Firebase account (free tier is sufficient)
- Basic understanding of Firebase Console

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `betterislamqa` (or your preferred name)
4. (Optional) Disable Google Analytics if you don't need it
5. Click "Create project" and wait for setup to complete

## Step 2: Register Your App with Firebase

### For Web App:
1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Register app with nickname: "BetterIslam Q&A Web"
3. Copy the Firebase configuration object (you'll need this in Step 4)

### For Android App (Optional):
1. Click the **Android icon** to add an Android app
2. Enter package name: `com.dkurve.betterislamqa`
3. Download `google-services.json` and place it in `platforms/android/app/`

### For iOS App (Optional):
1. Click the **iOS icon** to add an iOS app
2. Enter bundle ID: `com.dkurve.betterislamqa`
3. Download `GoogleService-Info.plist` and add it to your Xcode project

## Step 3: Enable Firebase Services

### Enable Authentication:
1. In Firebase Console, go to **Build → Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Anonymous** authentication
5. Click "Save"

### Create Firestore Database:
1. Go to **Build → Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode**
4. Select a location close to your users (e.g., `us-central1`)
5. Click "Enable"

### Set Up Security Rules:
1. In Firestore Database, go to **Rules** tab
2. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - users can only write their own data
    match /users/{userId} {
      allow read: if true; // Anyone can read (for leaderboards)
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && (
                      // Only allow updating username and lastActive
                      !request.resource.data.diff(resource.data).affectedKeys()
                        .hasAny(['totalScore', 'quizzesTaken', 'level'])
                    );
    }

    // Leaderboards - read only for all, write only for authenticated users
    match /leaderboards/{type}/{period}/{userId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.data.score >= 0
                   && request.resource.data.score <= 500; // Max possible score
    }
  }
}
```

3. Click "Publish"

## Step 4: Configure Your App

### Create Environment File:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase credentials from Step 2:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

### Important Security Notes:
- **Never commit `.env` to version control** (it's already in `.gitignore`)
- The Firebase API key is safe to expose in client-side code
- Security is enforced by Firestore Security Rules (Step 3)
- For production, consider using Firebase App Check for additional security

## Step 5: Install Dependencies

Dependencies are already installed in your project. If you need to reinstall:

```bash
yarn install
```

Firebase v11.0.2 is already included in `package.json`.

## Step 6: Test the Leaderboard

### Run Development Server:
```bash
yarn dev
```

### Test Flow:
1. Navigate to `/quiz` in your browser
2. Complete a quiz
3. Check browser console for: `✅ Score submitted to leaderboard`
4. Navigate to `/leaderboard`
5. Verify your score appears in the leaderboard

### Verify in Firebase Console:
1. Go to **Firestore Database** in Firebase Console
2. Check for these collections:
   - `users` - Should contain your user profile
   - `leaderboards/daily/{date}` - Today's scores
   - `leaderboards/weekly/{weekId}` - This week's scores

## Step 7: Build for Production

### Build for Web:
```bash
yarn build:web
```

### Build for Cordova (Android/iOS):
```bash
# Android
yarn cordova:build:android

# iOS (macOS only)
yarn cordova:build:ios
```

## Troubleshooting

### Issue: "Authentication failed" in console
**Solution**: Ensure Anonymous authentication is enabled in Firebase Console → Authentication → Sign-in method

### Issue: "Permission denied" when submitting scores
**Solution**:
1. Check that Firestore Security Rules are published correctly
2. Verify you're authenticated (check console for authentication logs)
3. Ensure score values are within allowed range (0-500)

### Issue: Leaderboard shows no scores
**Solution**:
1. Complete at least one quiz first
2. Check browser console for submission errors
3. Verify Firebase configuration in `.env` is correct
4. Check Network tab in DevTools for failed requests

### Issue: ".env file not found" error
**Solution**: Make sure you created `.env` file by copying `.env.example` and filled in your credentials

## Firebase Costs (Free Tier Limits)

The Spark (free) plan includes:
- **Firestore**: 50K reads/day, 20K writes/day, 1GB storage
- **Authentication**: Unlimited anonymous auth

**Usage Estimates:**
- 100 daily active users: ~3,000 writes/month, ~9,000 reads/month ✅ Well within limits
- 1,000 daily active users: ~30,000 writes/month, ~90,000 reads/month ✅ Still within limits

You can monitor usage in Firebase Console → Usage and billing

## Security Best Practices

1. **Enable App Check** (recommended for production):
   - Go to Firebase Console → Build → App Check
   - Register your web app with reCAPTCHA v3
   - Enforce App Check in Firestore

2. **Rate Limiting**:
   - Consider implementing Cloud Functions to validate quiz submissions
   - Prevent spam by limiting submissions per user per day

3. **Data Validation**:
   - Security rules already validate score ranges (0-500)
   - Consider adding more granular validation in Cloud Functions

4. **Monitor Abuse**:
   - Check Firebase Console regularly for unusual activity
   - Set up budget alerts in Google Cloud Console

## Next Steps

- ✅ Leaderboard is now fully functional!
- Consider adding achievements tied to leaderboard ranks
- Implement weekly/monthly prizes or recognition
- Add social sharing for leaderboard positions
- Create challenges with specific leaderboard categories

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Vue.js + Firebase Guide](https://firebase.google.com/docs/web/setup)

---

**Questions or Issues?** Open an issue on the GitHub repository.
