import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
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
