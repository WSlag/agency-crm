import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Document, DocumentType, DocumentUploadResponse } from '../types/document';
import { fileValidation } from '../utils/fileValidation';
import { imageOptimization } from '../utils/imageOptimization';

export class DocumentService {
  private static COLLECTION = 'documents';
  private static STORAGE_PATH = 'documents';

  /**
   * Upload document
   */
  static async uploadDocument(
    file: File,
    applicantId: string,
    type: DocumentType,
    metadata: Record<string, any> = {}
  ): Promise<DocumentUploadResponse> {
    // Validate file
    const validation = fileValidation.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // Generate safe filename
      const safeFilename = fileValidation.getSafeFilename(file);
      const path = `${this.STORAGE_PATH}/${applicantId}/${type}/${safeFilename}`;

      // Upload file
      let fileUrl: string;
      if (file.type.startsWith('image/')) {
        // Optimize and upload image
        fileUrl = await imageOptimization.uploadOptimizedImage(file, path);
      } else {
        // Upload regular file
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      }

      // Create document record
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        applicantId,
        type,
        fileName: safeFilename,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: metadata.uploadedBy || '',
        uploadedAt: Timestamp.now(),
        status: 'pending',
        metadata
      });

      return {
        documentId: docRef.id,
        fileUrl,
        fileName: safeFilename
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  static async getDocument(documentId: string): Promise<Document | null> {
    try {
      const docRef = doc(db, this.COLLECTION, documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Document;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  /**
   * Get applicant documents
   */
  static async getApplicantDocuments(applicantId: string): Promise<Document[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('applicantId', '==', applicantId),
        orderBy('uploadedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
    } catch (error) {
      console.error('Error getting applicant documents:', error);
      throw error;
    }
  }

  /**
   * Verify document
   */
  static async verifyDocument(
    documentId: string,
    verifiedBy: string,
    status: 'verified' | 'rejected'
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, documentId);
      await updateDoc(docRef, {
        status,
        verifiedBy,
        verifiedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  }

  /**
   * Update document metadata
   */
  static async updateMetadata(
    documentId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, documentId);
      await updateDoc(docRef, { metadata });
    } catch (error) {
      console.error('Error updating document metadata:', error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      // Get document data
      const document = await this.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Delete file from storage
      const storageRef = ref(storage, document.fileUrl);
      await deleteObject(storageRef);

      // Delete document record
      const docRef = doc(db, this.COLLECTION, documentId);
      await updateDoc(docRef, {
        status: 'deleted',
        deletedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}
