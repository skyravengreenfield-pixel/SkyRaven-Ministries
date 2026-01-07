/**
 * Firebase Storage Service
 * File upload and management with Firebase Storage
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { getFirebaseStorage } from '../config/firebase';
import { logger } from '../utils/logger';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

class FirebaseStorageService {
  private storage = getFirebaseStorage();

  /**
   * Upload file with progress tracking
   */
  async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            };
            onProgress?.(progress);
          },
          (error) => {
            logger.error('File upload failed', { error, path });
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            logger.info('File uploaded successfully', { path, downloadURL });
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      logger.error('Upload file error', { error, path });
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
      logger.info('File deleted successfully', { path });
    } catch (error) {
      logger.error('Failed to delete file', { error, path });
      throw error;
    }
  }

  /**
   * Get file download URL
   */
  async getFileURL(path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      logger.error('Failed to get file URL', { error, path });
      throw error;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string): Promise<string[]> {
    try {
      const storageRef = ref(this.storage, path);
      const result = await listAll(storageRef);
      
      const urls = await Promise.all(
        result.items.map((itemRef) => getDownloadURL(itemRef))
      );

      return urls;
    } catch (error) {
      logger.error('Failed to list files', { error, path });
      throw error;
    }
  }

  /**
   * Generate storage paths
   */
  generatePath(userId: string, folder: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${folder}/${userId}/${timestamp}_${sanitizedName}`;
  }

  /**
   * Storage folders
   */
  static FOLDERS = {
    DOCUMENTS: 'documents',
    RECEIPTS: 'receipts',
    PROFILE_PHOTOS: 'profile_photos',
    PROJECT_IMAGES: 'project_images',
  } as const;
}

export const firebaseStorageService = new FirebaseStorageService();
export const STORAGE_FOLDERS = FirebaseStorageService.FOLDERS;
