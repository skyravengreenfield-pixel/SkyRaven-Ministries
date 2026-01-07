/**
 * Firebase Configuration
 * Initialize and configure Firebase services
 */

import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { logger } from '../utils/logger';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

/**
 * Initialize Firebase
 */
export function initializeFirebase(): void {
  try {
    console.log('Initializing Firebase with config:', {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ present' : '✗ missing',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    });

    if (!firebaseConfig.apiKey) {
      logger.warn('Firebase configuration missing - running without Firebase');
      console.error('Firebase API key is missing! Check your .env.local file.');
      return;
    }

    if (!app) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
      }

      console.log('✓ Firebase initialized successfully');
      logger.info('Firebase initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    logger.error('Failed to initialize Firebase', { error });
    throw error;
  }
}

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return auth;
}

/**
 * Get Firestore instance
 */
export function getFirebaseFirestore(): Firestore {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
}

/**
 * Get Firebase Storage instance
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return storage;
}

/**
 * Get Firebase Analytics instance
 */
export function getFirebaseAnalytics(): Analytics | null {
  return analytics;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return app !== null;
}
