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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
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
