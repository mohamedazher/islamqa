# Leaderboard Implementation Guide

This guide outlines how to add a leaderboard system to the BetterIslam Q&A app using Firebase.

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name: "betterislamqa" or similar
4. Disable Google Analytics (optional)
5. Create project

### 2. Register Web App
1. In project overview, click "Web" icon (</> )
2. Register app: "BetterIslam Q&A Web"
3. Copy Firebase config object (you'll need this)

### 3. Enable Services
- **Authentication** → Enable Anonymous Authentication
- **Firestore Database** → Create database in production mode
- **Security Rules** → Set up rules (see below)

## Installation

```bash
npm install firebase
```

## Firebase Configuration

Create `src/services/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

// Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: Multiple tabs open')
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not available in this browser')
  }
})

// Anonymous authentication on app load
let currentUser = null

async function ensureAuthenticated() {
  if (currentUser) return currentUser

  try {
    const userCredential = await signInAnonymously(auth)
    currentUser = userCredential.user
    console.log('✅ Authenticated anonymously:', currentUser.uid)
    return currentUser
  } catch (error) {
    console.error('❌ Authentication failed:', error)
    throw error
  }
}

// Auto-authenticate on module load
ensureAuthenticated()

export { db, auth, ensureAuthenticated }
```

## Leaderboard Service

Create `src/services/leaderboardService.js`:

```javascript
import { db, ensureAuthenticated } from './firebase'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore'

class LeaderboardService {
  constructor() {
    this.db = db
    this.userId = null
    this.username = null
  }

  /**
   * Initialize user (call on app start)
   */
  async initUser() {
    const user = await ensureAuthenticated()
    this.userId = user.uid

    // Get or create username
    this.username = localStorage.getItem('username')
    if (!this.username) {
      this.username = this.generateUsername()
      localStorage.setItem('username', this.username)
    }

    // Create user profile if doesn't exist
    await this.createUserProfile()

    return { userId: this.userId, username: this.username }
  }

  /**
   * Generate random username
   */
  generateUsername() {
    const adjectives = ['Faithful', 'Seeking', 'Learning', 'Devoted', 'Wise', 'Humble']
    const nouns = ['Scholar', 'Student', 'Seeker', 'Believer', 'Learner']
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num = Math.floor(Math.random() * 1000)
    return `${adj}${noun}${num}`
  }

  /**
   * Create user profile
   */
  async createUserProfile() {
    const userRef = doc(this.db, 'users', this.userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        username: this.username,
        totalScore: 0,
        quizzesTaken: 0,
        level: 1,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      })
    } else {
      // Update last active
      await updateDoc(userRef, {
        lastActive: serverTimestamp()
      })
    }
  }

  /**
   * Update username
   */
  async updateUsername(newUsername) {
    if (!this.userId) await this.initUser()

    this.username = newUsername
    localStorage.setItem('username', newUsername)

    const userRef = doc(this.db, 'users', this.userId)
    await updateDoc(userRef, { username: newUsername })
  }

  /**
   * Submit quiz score to leaderboard
   */
  async submitScore(quizResult) {
    if (!this.userId) await this.initUser()

    const { score, correct, total, quizId, mode, accuracy, timeTaken } = quizResult

    // Get today's date for daily leaderboard
    const today = new Date().toISOString().split('T')[0]

    try {
      // 1. Update daily leaderboard
      const dailyRef = doc(this.db, 'leaderboards', 'daily', today, this.userId)
      await setDoc(dailyRef, {
        userId: this.userId,
        username: this.username,
        score,
        correct,
        total,
        accuracy,
        timeTaken,
        quizId,
        mode,
        timestamp: serverTimestamp()
      })

      // 2. Update all-time stats
      const userRef = doc(this.db, 'users', this.userId)
      await updateDoc(userRef, {
        totalScore: increment(score),
        quizzesTaken: increment(1),
        lastActive: serverTimestamp()
      })

      // 3. Get current week for weekly leaderboard
      const weekId = this.getWeekId(new Date())
      const weeklyRef = doc(this.db, 'leaderboards', 'weekly', weekId, this.userId)
      const weeklyDoc = await getDoc(weeklyRef)

      if (weeklyDoc.exists()) {
        await updateDoc(weeklyRef, {
          totalScore: increment(score),
          quizzesTaken: increment(1),
          bestScore: score > weeklyDoc.data().bestScore ? score : weeklyDoc.data().bestScore,
          timestamp: serverTimestamp()
        })
      } else {
        await setDoc(weeklyRef, {
          userId: this.userId,
          username: this.username,
          totalScore: score,
          quizzesTaken: 1,
          bestScore: score,
          timestamp: serverTimestamp()
        })
      }

      console.log('✅ Score submitted to leaderboard')
      return true
    } catch (error) {
      console.error('❌ Failed to submit score:', error)
      throw error
    }
  }

  /**
   * Get daily leaderboard
   */
  async getDailyLeaderboard(date = new Date(), limitCount = 100) {
    const dateString = date.toISOString().split('T')[0]

    try {
      const leaderboardRef = collection(this.db, 'leaderboards', 'daily', dateString)
      const q = query(leaderboardRef, orderBy('score', 'desc'), limit(limitCount))
      const snapshot = await getDocs(q)

      const leaderboard = []
      snapshot.forEach((doc, index) => {
        leaderboard.push({
          rank: index + 1,
          ...doc.data(),
          isCurrentUser: doc.id === this.userId
        })
      })

      return leaderboard
    } catch (error) {
      console.error('❌ Failed to get daily leaderboard:', error)
      return []
    }
  }

  /**
   * Get weekly leaderboard
   */
  async getWeeklyLeaderboard(limitCount = 100) {
    const weekId = this.getWeekId(new Date())

    try {
      const leaderboardRef = collection(this.db, 'leaderboards', 'weekly', weekId)
      const q = query(leaderboardRef, orderBy('totalScore', 'desc'), limit(limitCount))
      const snapshot = await getDocs(q)

      const leaderboard = []
      snapshot.forEach((doc, index) => {
        leaderboard.push({
          rank: index + 1,
          ...doc.data(),
          isCurrentUser: doc.id === this.userId
        })
      })

      return leaderboard
    } catch (error) {
      console.error('❌ Failed to get weekly leaderboard:', error)
      return []
    }
  }

  /**
   * Get all-time leaderboard
   */
  async getAllTimeLeaderboard(limitCount = 100) {
    try {
      const usersRef = collection(this.db, 'users')
      const q = query(usersRef, orderBy('totalScore', 'desc'), limit(limitCount))
      const snapshot = await getDocs(q)

      const leaderboard = []
      snapshot.forEach((doc, index) => {
        const data = doc.data()
        leaderboard.push({
          rank: index + 1,
          userId: doc.id,
          username: data.username,
          totalScore: data.totalScore,
          quizzesTaken: data.quizzesTaken,
          level: data.level,
          isCurrentUser: doc.id === this.userId
        })
      })

      return leaderboard
    } catch (error) {
      console.error('❌ Failed to get all-time leaderboard:', error)
      return []
    }
  }

  /**
   * Get user rank
   */
  async getUserRank(type = 'allTime') {
    if (!this.userId) return null

    try {
      let leaderboard
      if (type === 'daily') {
        leaderboard = await this.getDailyLeaderboard(new Date(), 10000)
      } else if (type === 'weekly') {
        leaderboard = await this.getWeeklyLeaderboard(10000)
      } else {
        leaderboard = await this.getAllTimeLeaderboard(10000)
      }

      const userEntry = leaderboard.find(entry => entry.userId === this.userId || entry.isCurrentUser)
      return userEntry ? userEntry.rank : null
    } catch (error) {
      console.error('❌ Failed to get user rank:', error)
      return null
    }
  }

  /**
   * Get week ID (format: 2025-W45)
   */
  getWeekId(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000))
    const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7)
    return `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`
  }
}

export default new LeaderboardService()
```

## Firestore Security Rules

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - users can only write their own data
    match /users/{userId} {
      allow read: if true; // Anyone can read (for leaderboards)
      allow write: if request.auth != null && request.auth.uid == userId;

      // Prevent score tampering
      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && (
                      // Only allow updating username and lastActive
                      !request.resource.data.diff(resource.data).affectedKeys().hasAny(['totalScore', 'quizzesTaken', 'level'])
                      // Or use Cloud Functions to update scores (recommended)
                    );
    }

    // Leaderboards - read only for clients
    match /leaderboards/{type}/{period}/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;

      // Prevent tampering - only allow reasonable scores
      allow create, update: if request.auth != null
                           && request.auth.uid == userId
                           && request.resource.data.score >= 0
                           && request.resource.data.score <= 500; // Max possible score
    }
  }
}
```

## Integration with Quiz System

Update `src/views/QuizView.vue` to submit scores:

```javascript
import leaderboardService from '@/services/leaderboardService'

// In onMounted
onMounted(async () => {
  // ... existing code ...

  // Initialize leaderboard
  try {
    await leaderboardService.initUser()
  } catch (error) {
    console.error('Failed to init leaderboard:', error)
  }
})

// After quiz completion
async function finishQuiz() {
  // ... existing code to calculate results ...

  quizCompleted.value = true

  // Submit to leaderboard
  try {
    await leaderboardService.submitScore({
      score: quizResults.value.score,
      correct: quizResults.value.correct,
      total: quizResults.value.total,
      accuracy: quizResults.value.accuracy,
      quizId: currentQuiz.value.id,
      mode: currentQuiz.value.mode,
      timeTaken: timeSpent.value
    })

    console.log('✅ Score submitted to leaderboard')
  } catch (error) {
    console.error('Failed to submit score:', error)
    // Don't block user if leaderboard fails
  }

  // ... existing code ...
}
```

## Create Leaderboard View

Create `src/views/LeaderboardView.vue`:

```vue
<template>
  <div class="leaderboard-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 dark:from-amber-500 dark:via-orange-500 dark:to-red-500 text-white p-4 shadow">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="lg:hidden hover:opacity-80 transition-opacity">
          <Icon name="arrowLeft" size="md" />
        </button>
        <div class="flex-1">
          <h1 class="text-lg md:text-xl font-bold">Leaderboard</h1>
          <p class="text-sm text-white/90">Compete with fellow learners</p>
        </div>
        <Icon name="trophy" size="lg" />
      </div>
    </header>

    <!-- Tab Selector -->
    <div class="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 pt-4">
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="selectedTab = tab.id"
          class="px-4 py-2 rounded-t-lg font-medium transition-colors"
          :class="selectedTab === tab.id
            ? 'bg-gradient-to-br from-amber-400 to-orange-400 text-white'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Leaderboard Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-neutral-600 dark:text-neutral-400">Loading leaderboard...</p>
        </div>
      </div>

      <!-- Your Rank Card -->
      <div v-else-if="userRank" class="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div class="flex items-center gap-4">
          <div class="bg-gradient-to-br from-amber-400 to-orange-400 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
            #{{ userRank }}
          </div>
          <div class="flex-1">
            <div class="font-semibold text-neutral-900 dark:text-neutral-100">Your Rank</div>
            <div class="text-sm text-neutral-600 dark:text-neutral-400">{{ username }}</div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ userScore }}</div>
            <div class="text-xs text-neutral-600 dark:text-neutral-400">points</div>
          </div>
        </div>
      </div>

      <!-- Leaderboard List -->
      <div class="space-y-2">
        <div
          v-for="entry in leaderboard"
          :key="entry.userId"
          class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 transition-all"
          :class="entry.isCurrentUser ? 'ring-2 ring-amber-400 dark:ring-amber-600' : ''"
        >
          <div class="flex items-center gap-4">
            <!-- Rank Badge -->
            <div
              class="rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm"
              :class="getRankBadgeClass(entry.rank)"
            >
              {{ entry.rank <= 3 ? getRankEmoji(entry.rank) : `#${entry.rank}` }}
            </div>

            <!-- User Info -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {{ entry.username }}
                <span v-if="entry.isCurrentUser" class="text-xs text-amber-600 dark:text-amber-400 ml-2">(You)</span>
              </div>
              <div v-if="selectedTab === 'allTime'" class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ entry.quizzesTaken }} quizzes • Level {{ entry.level }}
              </div>
              <div v-else-if="selectedTab === 'weekly'" class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ entry.quizzesTaken }} quizzes this week
              </div>
            </div>

            <!-- Score -->
            <div class="text-right">
              <div class="text-xl font-bold text-amber-600 dark:text-amber-400">
                {{ selectedTab === 'daily' ? entry.score : entry.totalScore }}
              </div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400">points</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && leaderboard.length === 0" class="text-center py-12">
        <Icon name="trophy" size="xl" class="text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
        <p class="text-neutral-600 dark:text-neutral-400">No scores yet. Be the first!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import leaderboardService from '@/services/leaderboardService'

const router = useRouter()

const tabs = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'This Week' },
  { id: 'allTime', label: 'All Time' }
]

const selectedTab = ref('daily')
const leaderboard = ref([])
const loading = ref(false)
const userRank = ref(null)
const userScore = ref(0)
const username = ref('')

onMounted(async () => {
  await leaderboardService.initUser()
  username.value = leaderboardService.username
  loadLeaderboard()
})

watch(selectedTab, () => {
  loadLeaderboard()
})

async function loadLeaderboard() {
  loading.value = true

  try {
    if (selectedTab.value === 'daily') {
      leaderboard.value = await leaderboardService.getDailyLeaderboard()
    } else if (selectedTab.value === 'weekly') {
      leaderboard.value = await leaderboardService.getWeeklyLeaderboard()
    } else {
      leaderboard.value = await leaderboardService.getAllTimeLeaderboard()
    }

    // Get user rank
    const userEntry = leaderboard.value.find(entry => entry.isCurrentUser)
    if (userEntry) {
      userRank.value = userEntry.rank
      userScore.value = selectedTab.value === 'daily' ? userEntry.score : userEntry.totalScore
    } else {
      userRank.value = null
      userScore.value = 0
    }
  } catch (error) {
    console.error('Failed to load leaderboard:', error)
  } finally {
    loading.value = false
  }
}

function getRankBadgeClass(rank) {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white'
  if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
  if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
  return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
}

function getRankEmoji(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

function goBack() {
  router.back()
}
</script>
```

## Add to Router

Update `src/router/index.js`:

```javascript
{
  path: '/leaderboard',
  name: 'leaderboard',
  component: () => import('../views/LeaderboardView.vue')
}
```

## Add to Navigation

Update navigation components to include leaderboard link with trophy icon.

## Environment Variables

Create `.env` file (add to `.gitignore`):

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Cost Estimation

### Free Tier Usage Projection
- **100 active daily users**:
  - 100 daily score writes = 3,000/month (within 20K/day limit)
  - 100 daily reads × 3 tabs = 9,000/month (within 50K/day limit)

- **1,000 active daily users**:
  - 1,000 daily writes = 30,000/month (still within limits)
  - 1,000 × 3 = 30,000 daily reads (within 50K/day limit)

**Conclusion**: Free tier is sufficient for up to ~10,000 users before needing paid plan.

## Anti-Cheat Measures

1. **Reasonable score limits** in security rules (max 500 points)
2. **Server timestamp** for all submissions (can't fake time)
3. **Cloud Functions** (optional) to validate quiz answers server-side
4. **Rate limiting** to prevent spam submissions

## Next Steps

1. Set up Firebase project
2. Install dependencies and create service files
3. Create leaderboard view
4. Integrate with quiz completion
5. Test with multiple users
6. Deploy security rules
7. Monitor Firebase Console for usage

## Optional Enhancements

- **Weekly challenges** with special prizes
- **Friend system** to compete with specific users
- **Achievements** tied to leaderboard ranks
- **Notifications** for rank changes
- **Clan/Group leaderboards** for community building

---

Let me know if you'd like me to implement this leaderboard system!
