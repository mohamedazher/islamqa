import { isLeaderboardEnabled } from './privacyConsent'

const firebaseConfig = {
  apiKey: 'AIzaSyAOc2d3NPbuWzF5rWE3Fx8Ij7EGm4dFNT8',
  authDomain: 'betterislamqa.firebaseapp.com',
  projectId: 'betterislamqa',
  storageBucket: 'betterislamqa.firebasestorage.app',
  messagingSenderId: '1062208000513',
  appId: '1:1062208000513:web:d7c0b7697df2ab88d12600',
  measurementId: 'G-99MZ5VYR07'
}

// Leaderboard Firebase stays completely lazy until the user opts in. These
// promises also prevent duplicate app/auth initialization when several score
// events arrive at once on startup.
let app = null
let auth = null
let db = null
let firebaseInitialized = false
let currentUser = null
let authApi = null
let initializationPromise = null
let authenticationPromise = null

export async function initializeFirebase() {
  if (!isLeaderboardEnabled()) return false
  if (firebaseInitialized) return true
  if (initializationPromise) return initializationPromise

  initializationPromise = (async () => {
    try {
      const [appApi, loadedAuthApi, firestoreApi] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore')
      ])
      if (!isLeaderboardEnabled()) return false

      authApi = loadedAuthApi
      app = appApi.getApps().length === 0 ? appApi.initializeApp(firebaseConfig) : appApi.getApp()
      auth = authApi.getAuth(app)

      // Firebase v12's cache API replaces enableIndexedDbPersistence. If
      // another module already initialized Firestore, getFirestore safely
      // returns that instance instead.
      if ('initializeFirestore' in firestoreApi && 'persistentLocalCache' in firestoreApi) {
        try {
          db = firestoreApi.initializeFirestore(app, {
            localCache: firestoreApi.persistentLocalCache({
              tabManager: firestoreApi.persistentMultipleTabManager?.()
            })
          })
        } catch (error) {
          if (error?.code !== 'failed-precondition') throw error
          db = firestoreApi.getFirestore(app)
        }
      } else {
        db = firestoreApi.getFirestore(app)
      }

      currentUser = auth.currentUser || null
      firebaseInitialized = true
      return true
    } catch (error) {
      console.warn('Firebase leaderboard initialization failed:', error.message)
      firebaseInitialized = false
      return false
    } finally {
      initializationPromise = null
    }
  })()

  return initializationPromise
}

export async function ensureAuthenticated() {
  if (!isLeaderboardEnabled()) return null
  if (!await initializeFirebase()) return null
  if (currentUser) return currentUser
  if (authenticationPromise) return authenticationPromise

  authenticationPromise = Promise.resolve()
    .then(() => auth.authStateReady?.())
    .then(() => auth.currentUser ? { user: auth.currentUser } : authApi.signInAnonymously(auth))
    .then(({ user }) => {
      currentUser = user
      return user
    })
    .catch(error => {
      console.error('Anonymous leaderboard authentication failed:', error)
      return null
    })
    .finally(() => {
      authenticationPromise = null
    })

  return authenticationPromise
}

// Revoking consent stops all leaderboard work but deliberately does not sign
// out. Anonymous Firebase accounts are not recoverable after sign-out; keeping
// the local auth session preserves the same UID if the user opts in again.
export async function disableFirebaseParticipation() {
  return true
}

export function getFirebaseState() {
  return { app, auth, db, firebaseInitialized }
}

export { app, db, auth, firebaseInitialized }
