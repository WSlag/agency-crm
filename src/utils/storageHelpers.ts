import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { fileValidation, FILE_CONSTRAINTS } from './fileValidation';

export type StorageFolder = 'applicants' | 'expenses' | 'profiles' | 'temp' | 'public';

interface UploadOptions {
  folder: StorageFolder;
  id: string; // applicantId, expenseId, userId, etc.
  metadata?: {
    branchId?: string;
    contentType?: string;
    customMetadata?: Record<string, string>;
  };
}

export const storageHelpers = {
  /**
   * Uploads a file to Firebase Storage with proper security rules
   */
  uploadFile: async (file: File, options: UploadOptions): Promise<string> => {
    // Validate file first
    const validation = fileValidation.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    // Generate safe filename
    const safeFilename = fileValidation.getSafeFilename(file.name);
    
    // Create storage reference
    const storagePath = `${options.folder}/${options.id}/${safeFilename}`;
    const storageRef = ref(storage, storagePath);

    // Prepare metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        ...options.metadata?.customMetadata,
      },
      ...options.metadata,
    };

    try {
      // Upload file
      await uploadBytes(storageRef, file, metadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  },

  /**
   * Uploads multiple files
   */
  uploadFiles: async (files: FileList, options: UploadOptions): Promise<string[]> => {
    // Validate files first
    const validation = fileValidation.validateFiles(files);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const uploadPromises = Array.from(files).map(file => 
      storageHelpers.uploadFile(file, options)
    );

    return Promise.all(uploadPromises);
  },

  /**
   * Deletes a file from storage
   */
  deleteFile: async (downloadURL: string): Promise<void> => {
    try {
      const storageRef = ref(storage, downloadURL);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  },

  /**
   * Gets storage folder path based on file type and context
   */
  getStoragePath: (folder: StorageFolder, id: string, filename: string): string => {
    return `${folder}/${id}/${filename}`;
  },

  /**
   * Validates storage path
   */
  validateStoragePath: (path: string): boolean => {
    // Check if path starts with valid folder
    const validFolders: StorageFolder[] = ['applicants', 'expenses', 'profiles', 'temp', 'public'];
    const folder = path.split('/')[0];
    return validFolders.includes(folder as StorageFolder);
  },

  /**
   * Gets file metadata
   */
  getFileMetadata: (file: File, branchId?: string): Record<string, string> => {
    return {
      originalName: file.name,
      size: file.size.toString(),
      type: file.type,
      uploadedAt: new Date().toISOString(),
      ...(branchId ? { branchId } : {}),
    };
  },

  /**
   * Constants
   */
  STORAGE_CONSTRAINTS: {
    MAX_FILE_SIZE: FILE_CONSTRAINTS.MAX_FILE_SIZE,
    ALLOWED_TYPES: FILE_CONSTRAINTS.ALLOWED_FILE_TYPES,
    FOLDERS: ['applicants', 'expenses', 'profiles', 'temp', 'public'] as StorageFolder[],
  },
};
