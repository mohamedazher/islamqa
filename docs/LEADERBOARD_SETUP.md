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

## Future Enhancements

The leaderboard system is fully functional, but here are ideas for future enhancements to make it even more engaging:

### 🎯 Tier 1: User Experience Improvements

**Username Customization**
- Allow users to change their auto-generated username
- Add profile page with username editing
- Username validation (no profanity, unique names)
- Display username history for moderation

**Profile System**
- User avatar/badge system based on achievements
- Display user statistics (total quizzes, accuracy %, favorite categories)
- Show recent activity timeline
- Add bio/introduction section

**Leaderboard Filters**
- Filter by category (e.g., "Top in Prayer Questions")
- Filter by difficulty level
- Filter by quiz mode (Daily, Rapid Fire, Challenge)
- Search for specific users

### 🏆 Tier 2: Social & Competition Features

**Friend System**
- Add friends by username or code
- Private leaderboard with just your friends
- Challenge friends to specific quizzes
- Friend activity feed

**Achievements & Badges**
- **Leaderboard-Specific Achievements:**
  - 🥇 "Champion" - Reach #1 on daily leaderboard
  - 🔥 "Consistent" - Top 10 for 7 days straight
  - ⭐ "Rising Star" - Climb 50 ranks in one day
  - 👑 "Legend" - Stay #1 on all-time leaderboard for 30 days
- Display badge collection on profile
- Share achievements on social media

**Clans/Groups**
- Create or join study groups/clans
- Group leaderboards (total points of all members)
- Group challenges and competitions
- Private group chat for Islamic discussions

### 📊 Tier 3: Advanced Competition

**Weekly Challenges**
- Special themed quizzes each week (e.g., "Ramadan Week", "Hajj Challenge")
- Extra points or special badges for participation
- Separate challenge leaderboard
- Time-limited exclusive questions

**Tournaments**
- Bracket-style competitions
- Entry requirements (e.g., Level 10+)
- Special rewards for winners
- Live leaderboard during tournament

**Streak Competitions**
- Separate leaderboard for longest daily quiz streaks
- Bonus multipliers for maintaining streaks
- "Comeback" achievements for rebuilding streaks
- Monthly streak champions

### 🔔 Tier 4: Engagement & Notifications

**Rank Change Notifications**
- Alert when you're overtaken
- Celebrate when you reach new ranks
- Weekly summary emails
- Push notifications for mobile app

**Leaderboard Analytics**
- Personal performance graphs (rank over time)
- Category strength analysis
- Best time of day for quiz performance
- Accuracy trends

**Social Sharing**
- Share leaderboard position on social media
- Generate rank cards with beautiful graphics
- Share personal bests
- Celebrate milestones (Top 100, Top 10, #1)

### 💎 Tier 5: Gamification & Rewards

**Virtual Rewards**
- Unlock special quiz categories at certain ranks
- Exclusive themes/color schemes for top players
- Special username badges (🥇🥈🥉)
- Access to "Expert Mode" quizzes

**Real-World Integration** (Optional)
- Partner with Islamic organizations for prizes
- Monthly scholarship donations in top player's name
- Recognition in app credits
- Certificate of achievement for sustained performance

**Seasons & Resets**
- Quarterly seasons with fresh start
- Season-end rewards for top performers
- Seasonal themes (Ramadan, Hajj season, etc.)
- Lifetime achievement tracking across seasons

### 🛡️ Tier 6: Moderation & Anti-Cheat

**Enhanced Security**
- Cloud Functions to verify quiz answers server-side
- Rate limiting per user (max quizzes per day)
- Anomaly detection (impossible accuracy/speed)
- Automatic flagging of suspicious scores

**Moderation Tools**
- Report users for inappropriate usernames
- Admin dashboard for score verification
- Ability to reset/ban users if needed
- Appeal system for false flags

**Fair Play Features**
- Question randomization to prevent memorization
- Time-based scoring (faster = more points)
- Prevent quiz sharing (unique question sets per user)
- IP-based duplicate account detection

## Implementation Priorities

Recommended order of implementation:

1. **Phase 1** (Quick Wins - 1 week):
   - Username customization
   - Leaderboard filters by category
   - Basic profile page

2. **Phase 2** (Social - 2 weeks):
   - Friend system
   - Leaderboard-specific achievements
   - Social sharing

3. **Phase 3** (Competition - 3 weeks):
   - Weekly challenges
   - Clans/groups
   - Tournaments

4. **Phase 4** (Engagement - 2 weeks):
   - Rank notifications
   - Analytics dashboard
   - Streak competitions

5. **Phase 5** (Advanced - 4 weeks):
   - Seasons & resets
   - Virtual rewards
   - Enhanced anti-cheat

## Technical Considerations

**Performance**
- Use Firestore composite indexes for complex queries
- Implement pagination for large leaderboards
- Cache leaderboard data client-side (5-minute TTL)
- Use Cloud Functions for heavy computations

**Scalability**
- Current architecture supports 10K+ daily active users on free tier
- For larger scale, implement:
  - Firestore indexes for all query patterns
  - Scheduled Cloud Functions for leaderboard calculations
  - CDN caching for static leaderboard data
  - Consider Cloud Firestore bundles for initial load

**Cost Management**
- Monitor Firestore usage in Firebase Console
- Set up billing alerts at $5, $10, $20 thresholds
- Optimize read operations with client-side caching
- Batch writes where possible

## Need Help?

**Documentation:**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Vue.js + Firebase Guide](https://firebase.google.com/docs/web/setup)

**Community:**
- GitHub Issues: Report bugs or request features
- Firebase Community: https://firebase.google.com/community

**Support:**
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: Tag questions with `firebase` and `firestore`

---

**Questions or Issues?** Open an issue on the GitHub repository.

**Ready to Enhance?** Pick a tier and start building! The foundation is solid and ready for expansion. 🚀
