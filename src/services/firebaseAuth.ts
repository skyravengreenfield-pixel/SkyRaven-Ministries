/**
 * Firebase Authentication Service
 * Handles user authentication with Firebase
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  Auth,
} from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebase';
import { logger } from '../utils/logger';
import { User } from '../types';

class FirebaseAuthService {
  private _auth: Auth | null = null;
  private googleProvider = new GoogleAuthProvider();

  /**
   * Get Firebase Auth instance (lazy-loaded)
   */
  private get auth(): Auth {
    if (!this._auth) {
      console.log('Getting Firebase Auth instance...');
      try {
        this._auth = getFirebaseAuth();
        console.log('✓ Firebase Auth instance obtained');
      } catch (error) {
        console.error('Failed to get Firebase Auth:', error);
        throw error;
      }
    }
    return this._auth;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      logger.info('User signed in successfully', { uid: userCredential.user.uid });
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('Sign in error details:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      logger.error('Sign in failed', { error });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    console.log('=== SIGN UP ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password length:', password?.length);
    console.log('Display name:', displayName);
    
    try {
      console.log('Calling createUserWithEmailAndPassword...');
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('✓ User created:', userCredential.user.uid);
      
      // Update profile with display name
      console.log('Updating profile...');
      await updateProfile(userCredential.user, { displayName });
      console.log('✓ Profile updated');
      
      logger.info('User signed up successfully', { uid: userCredential.user.uid });
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('=== SIGN UP ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Error name:', error?.name);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      console.error('Error stack:', error?.stack);
      
      logger.error('Sign up failed', { error });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      logger.info('User signed in with Google', { uid: result.user.uid });
      return this.mapFirebaseUser(result.user);
    } catch (error: any) {
      logger.error('Google sign in failed', { error });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Sign out failed', { error });
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      logger.info('Password reset email sent', { email });
    } catch (error: any) {
      logger.error('Password reset failed', { error });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, (firebaseUser) => {
      const user = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
      callback(user);
    });
  }

  /**
   * Get user token
   */
  async getUserToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) return null;
    return user.getIdToken();
  }

  /**
   * Map Firebase user to app user
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'User',
      role: 'supporter', // Default role, can be customized
      photoURL: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
    };
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): Error {
    const errorCode = error.code;
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Email/Password authentication is not enabled. Please contact the administrator.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };

    const message = errorMessages[errorCode] || `Authentication failed: ${error.message || errorCode || 'Unknown error'}`;
    console.error('Auth error handled:', { errorCode, errorMessage: error.message, message });
    logger.error('Auth error handled', { errorCode, message });
    return new Error(message);
  }
}

export const firebaseAuthService = new FirebaseAuthService();
