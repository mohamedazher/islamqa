import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

// Firebase config - use hardcoded values to match analytics.js
const firebaseConfig = {
  apiKey: "AIzaSyAOc2d3NPbuWzF5rWE3Fx8Ij7EGm4dFNT8",
  authDomain: "betterislamqa.firebaseapp.com",
  projectId: "betterislamqa",
  storageBucket: "betterislamqa.firebasestorage.app",
  messagingSenderId: "1062208000513",
  appId: "1:1062208000513:web:d7c0b7697df2ab88d12600",
  measurementId: "G-99MZ5VYR07"
}

// Initialize Firebase - check if already initialized to prevent duplicate app error
let app = null
let auth = null
let db = null
let firebaseInitialized = false

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  auth = getAuth(app)
  db = getFirestore(app)
  firebaseInitialized = true

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not available in this browser')
    }
  })
} catch (error) {
  console.warn('⚠️ Firebase initialization failed (may be expected on native platforms):', error.message)
  firebaseInitialized = false
}

// Anonymous authentication on app load
let currentUser = null

async function ensureAuthenticated() {
  if (!firebaseInitialized) {
    console.warn('⚠️ Firebase not available, skipping authentication')
    return null
  }

  if (currentUser) return currentUser

  try {
    const userCredential = await signInAnonymously(auth)
    currentUser = userCredential.user
    console.log('✅ Authenticated anonymously:', currentUser.uid)
    return currentUser
  } catch (error) {
    console.error('❌ Authentication failed:', error)
    return null
  }
}

// Auto-authenticate on module load (non-blocking)
if (firebaseInitialized) {
  ensureAuthenticated().catch(err => {
    console.warn('⚠️ Could not authenticate with Firebase:', err.message)
  })
}

export { db, auth, ensureAuthenticated, firebaseInitialized }
