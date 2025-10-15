import { create } from 'zustand';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { firestore, storage } from '../config/firebase';
import {
  Document,
  DocumentFilter,
  DocumentSort,
  DocumentPagination,
  DocumentVerification,
  DocumentHistory,
  DocumentTemplate,
  DOCUMENT_CONFIG,
} from '../types/document';

interface DocumentState {
  documents: Document[];
  selectedDocument: Document | null;
  documentHistory: DocumentHistory[];
  documentTemplates: DocumentTemplate[];
  loading: boolean;
  error: string | null;
  filter: DocumentFilter;
  sort: DocumentSort;
  pagination: DocumentPagination;

  // Actions
  setFilter: (filter: DocumentFilter) => void;
  setSort: (sort: DocumentSort) => void;
  setPagination: (pagination: DocumentPagination) => void;

  // CRUD Operations
  fetchDocuments: () => Promise<void>;
  fetchDocumentById: (id: string) => Promise<void>;
  uploadDocument: (data: {
    applicantId: string;
    documentType: string;
    file: File;
    metadata?: Record<string, any>;
  }) => Promise<string>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Verification Operations
  verifyDocument: (verification: DocumentVerification) => Promise<void>;
  rejectDocument: (documentId: string, reason: string) => Promise<void>;

  // Template Operations
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<DocumentTemplate, 'id'>) => Promise<string>;
  updateTemplate: (id: string, data: Partial<DocumentTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // History Operations
  fetchDocumentHistory: (documentId: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  selectedDocument: null,
  documentHistory: [],
  documentTemplates: [],
  loading: false,
  error: null,
  filter: {},
  sort: {
    field: 'uploadedAt',
    direction: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },

  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
  setPagination: (pagination) => set({ pagination }),

  fetchDocuments: async () => {
    try {
      set({ loading: true, error: null });
      const { filter, sort, pagination } = get();

      let queryConstraints: any[] = [];

      // Apply filters
      if (filter.applicantId) {
        queryConstraints.push(where('applicantId', '==', filter.applicantId));
      }
      if (filter.documentType) {
        queryConstraints.push(where('type', '==', filter.documentType)); // Changed from 'documentType' to 'type'
      }
      if (filter.status) {
        queryConstraints.push(where('status', '==', filter.status));
      }
      if (filter.verifiedBy) {
        queryConstraints.push(where('verifiedBy', '==', filter.verifiedBy));
      }

      // Apply sorting if we have documents or no filters
      if (sort.field && sort.direction) {
        queryConstraints.push(orderBy(sort.field, sort.direction));
      }

      // Apply pagination
      queryConstraints.push(limit(pagination.limit));
      if (pagination.page > 1 && get().documents.length > 0) {
        const lastDoc = get().documents[get().documents.length - 1];
        if (lastDoc[sort.field]) {
          queryConstraints.push(startAfter(lastDoc[sort.field]));
        }
      }

      const q = query(collection(firestore, 'documents'), ...queryConstraints);
      const snapshot = await getDocs(q);
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Document[];

      set({ documents, loading: false });
    } catch (error) {
      console.error('Error fetching documents:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
        loading: false,
      });
    }
  },

  fetchDocumentById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'documents', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({
          selectedDocument: {
            id: docSnap.id,
            ...docSnap.data(),
          } as Document,
          loading: false,
        });
      } else {
        set({
          error: 'Document not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch document',
        loading: false,
      });
    }
  },

  uploadDocument: async ({ applicantId, documentType, file, metadata = {} }) => {
    try {
      set({ loading: true, error: null });

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `documents/${applicantId}/${documentType}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Create document record in Firestore
      const docRef = doc(collection(firestore, 'documents'));
      const timestamp = serverTimestamp();

      const config = DOCUMENT_CONFIG[documentType as keyof typeof DOCUMENT_CONFIG];
      
      const documentData = {
        applicantId,
        type: documentType,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: metadata.uploadedBy || 'system',
        uploadedAt: timestamp,
        status: 'pending' as const,
        expiryDate: config.expiryEnabled ? null : null, // Can be set later
        verifiedBy: null,
        verifiedAt: null,
        metadata: {
          ...metadata,
        },
      };

      await setDoc(docRef, documentData);

      // Refresh documents list
      await get().fetchDocuments();

      return docRef.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload document',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateDocument: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'documents', id);
      const timestamp = serverTimestamp();

      await updateDoc(docRef, {
        ...data,
        updatedAt: timestamp,
      });

      // Create history record
      await setDoc(doc(collection(firestore, 'document_history')), {
        documentId: id,
        action: 'updated',
        performedBy: 'system',
        performedAt: timestamp,
        details: {
          changes: Object.entries(data).map(([field, value]) => ({
            field,
            oldValue: get().selectedDocument?.[field as keyof Document],
            newValue: value,
          })),
        },
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update document',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteDocument: async (id) => {
    try {
      set({ loading: true, error: null });
      const document = get().selectedDocument;

      if (document) {
        // Delete file from storage
        const storageRef = ref(storage, document.fileUrl);
        await deleteObject(storageRef);

        // Delete document from Firestore
        await deleteDoc(doc(firestore, 'documents', id));

        set({
          documents: get().documents.filter((d) => d.id !== id),
          selectedDocument: null,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete document',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  verifyDocument: async (verification) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      // Update document status
      await updateDoc(doc(firestore, 'documents', verification.documentId), {
        status: verification.status,
        verifiedBy: verification.verifiedBy,
        verifiedAt: timestamp,
        updatedAt: timestamp,
      });

      // Create verification record
      await setDoc(doc(collection(firestore, 'document_verifications')), {
        ...verification,
        verifiedAt: timestamp,
      });

      // Create history record
      await setDoc(doc(collection(firestore, 'document_history')), {
        documentId: verification.documentId,
        action: verification.status === 'verified' ? 'verified' : 'rejected',
        performedBy: verification.verifiedBy,
        performedAt: timestamp,
        details: {
          previousStatus: 'pending',
          newStatus: verification.status,
          notes: verification.notes,
        },
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to verify document',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  rejectDocument: async (documentId, reason) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      await updateDoc(doc(firestore, 'documents', documentId), {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: timestamp,
      });

      // Create history record
      await setDoc(doc(collection(firestore, 'document_history')), {
        documentId,
        action: 'rejected',
        performedBy: 'system',
        performedAt: timestamp,
        details: {
          previousStatus: get().selectedDocument?.status,
          newStatus: 'rejected',
          notes: reason,
        },
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reject document',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTemplates: async () => {
    try {
      set({ loading: true, error: null });
      const snapshot = await getDocs(collection(firestore, 'document_templates'));
      const templates = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DocumentTemplate[];
      set({ documentTemplates: templates, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
        loading: false,
      });
    }
  },

  createTemplate: async (template) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(collection(firestore, 'document_templates'));
      const timestamp = serverTimestamp();

      await setDoc(docRef, {
        ...template,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      return docRef.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create template',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTemplate: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'document_templates', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update template',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTemplate: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(firestore, 'document_templates', id));
      set({
        documentTemplates: get().documentTemplates.filter((t) => t.id !== id),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete template',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchDocumentHistory: async (documentId) => {
    try {
      set({ loading: true, error: null });
      const q = query(
        collection(firestore, 'document_history'),
        where('documentId', '==', documentId),
        orderBy('performedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DocumentHistory[];
      set({ documentHistory: history, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch document history',
        loading: false,
      });
    }
  },
}));
