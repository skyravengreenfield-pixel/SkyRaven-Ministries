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
} from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebase';
import { logger } from '../utils/logger';
import { User } from '../types';

class FirebaseAuthService {
  private auth = getFirebaseAuth();
  private googleProvider = new GoogleAuthProvider();

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      logger.info('User signed in successfully', { uid: userCredential.user.uid });
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      logger.error('Sign in failed', { error });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });
      
      logger.info('User signed up successfully', { uid: userCredential.user.uid });
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
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
      'auth/operation-not-allowed': 'Operation not allowed.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };

    return new Error(errorMessages[errorCode] || 'Authentication failed. Please try again.');
  }
}

export const firebaseAuthService = new FirebaseAuthService();
