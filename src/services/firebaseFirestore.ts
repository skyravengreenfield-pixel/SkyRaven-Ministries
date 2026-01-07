/**
 * Firebase Firestore Service
 * Database operations with Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { logger } from '../utils/logger';

class FirebaseFirestoreService {
  private db = getFirebaseFirestore();

  /**
   * Get document by ID
   */
  async getDocument<T = DocumentData>(collectionName: string, documentId: string): Promise<T | null> {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }

      return null;
    } catch (error) {
      logger.error('Failed to get document', { error, collectionName, documentId });
      throw error;
    }
  }

  /**
   * Get all documents from a collection
   */
  async getDocuments<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      const collectionRef = collection(this.db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      logger.error('Failed to get documents', { error, collectionName });
      throw error;
    }
  }

  /**
   * Add a new document
   */
  async addDocument<T = DocumentData>(collectionName: string, data: Partial<T>): Promise<string> {
    try {
      const collectionRef = collection(this.db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      logger.info('Document added successfully', { collectionName, id: docRef.id });
      return docRef.id;
    } catch (error) {
      logger.error('Failed to add document', { error, collectionName });
      throw error;
    }
  }

  /**
   * Update a document
   */
  async updateDocument<T = DocumentData>(
    collectionName: string,
    documentId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });

      logger.info('Document updated successfully', { collectionName, documentId });
    } catch (error) {
      logger.error('Failed to update document', { error, collectionName, documentId });
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      await deleteDoc(docRef);

      logger.info('Document deleted successfully', { collectionName, documentId });
    } catch (error) {
      logger.error('Failed to delete document', { error, collectionName, documentId });
      throw error;
    }
  }

  /**
   * Query documents with conditions
   */
  async queryDocuments<T = DocumentData>(
    collectionName: string,
    conditions: { field: string; operator: any; value: any }[],
    orderByField?: string,
    limitCount?: number
  ): Promise<T[]> {
    try {
      const constraints: QueryConstraint[] = conditions.map((condition) =>
        where(condition.field, condition.operator, condition.value)
      );

      if (orderByField) {
        constraints.push(orderBy(orderByField));
      }

      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      return this.getDocuments<T>(collectionName, constraints);
    } catch (error) {
      logger.error('Failed to query documents', { error, collectionName });
      throw error;
    }
  }

  /**
   * Collection names
   */
  static COLLECTIONS = {
    USERS: 'users',
    PROJECTS: 'projects',
    DONATIONS: 'donations',
    EXPENSES: 'expenses',
    MINISTRY_GOALS: 'ministry_goals',
    DOCUMENTS: 'documents',
  } as const;
}

export const firebaseFirestoreService = new FirebaseFirestoreService();
export const COLLECTIONS = FirebaseFirestoreService.COLLECTIONS;
