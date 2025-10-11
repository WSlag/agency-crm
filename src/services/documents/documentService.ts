import { storage, firestore } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Document } from '../../types/entities/document';

export interface DocumentMetadata {
  type: Document['type'];
  applicantId: string;
  expiryDate?: Date;
  metadata?: Record<string, any>;
}

export interface DocumentHistory {
  document: Document;
  verificationHistory: VerificationEvent[];
  uploadHistory: UploadEvent[];
}

interface VerificationEvent {
  status: Document['verificationStatus'];
  verifiedBy: string;
  verifiedAt: Date;
  comments: string;
}

interface UploadEvent {
  uploadedBy: string;
  uploadedAt: Date;
  fileUrl: string;
  metadata: Record<string, any>;
}

export class DocumentService {
  async uploadDocument(file: File, metadata: DocumentMetadata): Promise<string> {
    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `documents/${metadata.applicantId}/${metadata.type}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // Create document record in Firestore
      const documentRef = doc(firestore, 'documents', `${metadata.applicantId}_${metadata.type}`);
      const document: Document = {
        id: documentRef.id,
        type: metadata.type,
        applicantId: metadata.applicantId,
        fileUrl: downloadUrl,
        verificationStatus: 'pending',
        expiryDate: metadata.expiryDate,
        metadata: {
          ...metadata.metadata,
          fileSize: file.size,
          mimeType: file.type,
          originalName: file.name,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      };

      await setDoc(documentRef, document);

      return documentRef.id;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }

  async verifyDocument(docId: string, result: VerificationEvent): Promise<void> {
    try {
      const documentRef = doc(firestore, 'documents', docId);
      const documentSnap = await getDoc(documentRef);

      if (!documentSnap.exists()) {
        throw new Error('Document not found');
      }

      await updateDoc(documentRef, {
        verificationStatus: result.status,
        verifiedBy: result.verifiedBy,
        verifiedAt: result.verifiedAt,
        updatedAt: new Date(),
      });

      // Add verification event to history
      const historyRef = doc(firestore, 'documents', docId, 'history', 'verification');
      await setDoc(historyRef, {
        events: firestore.FieldValue.arrayUnion(result),
      }, { merge: true });
    } catch (error) {
      console.error('Error verifying document:', error);
      throw new Error('Failed to verify document');
    }
  }

  async trackDocument(docId: string): Promise<DocumentHistory> {
    try {
      const documentRef = doc(firestore, 'documents', docId);
      const documentSnap = await getDoc(documentRef);

      if (!documentSnap.exists()) {
        throw new Error('Document not found');
      }

      const document = documentSnap.data() as Document;

      // Get verification history
      const historyRef = doc(firestore, 'documents', docId, 'history', 'verification');
      const historySnap = await getDoc(historyRef);
      const verificationHistory = historySnap.exists() ? historySnap.data().events : [];

      // Get upload history
      const uploadsRef = doc(firestore, 'documents', docId, 'history', 'uploads');
      const uploadsSnap = await getDoc(uploadsRef);
      const uploadHistory = uploadsSnap.exists() ? uploadsSnap.data().events : [];

      return {
        document,
        verificationHistory,
        uploadHistory,
      };
    } catch (error) {
      console.error('Error tracking document:', error);
      throw new Error('Failed to track document');
    }
  }
}
