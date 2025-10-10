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
import { db } from '../config/firebase';
import {
  Applicant,
  ApplicantFilter,
  ApplicantSort,
  ApplicantPagination,
  ApplicantTransfer,
  ApplicantDocument,
  ApplicantPipeline,
} from '../types/applicant';

interface ApplicantState {
  applicants: Applicant[];
  selectedApplicant: Applicant | null;
  loading: boolean;
  error: string | null;
  filter: ApplicantFilter;
  sort: ApplicantSort;
  pagination: ApplicantPagination;
  
  // Actions
  setFilter: (filter: ApplicantFilter) => void;
  setSort: (sort: ApplicantSort) => void;
  setPagination: (pagination: ApplicantPagination) => void;
  
  // CRUD Operations
  fetchApplicants: () => Promise<void>;
  fetchApplicantById: (id: string) => Promise<void>;
  createApplicant: (applicant: Omit<Applicant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateApplicant: (id: string, data: Partial<Applicant>) => Promise<void>;
  deleteApplicant: (id: string) => Promise<void>;
  
  // Pipeline Operations
  updatePipeline: (applicantId: string, pipeline: Partial<ApplicantPipeline>) => Promise<void>;
  
  // Transfer Operations
  requestTransfer: (transfer: Omit<ApplicantTransfer, 'id' | 'requestedDate' | 'transferStatus'>) => Promise<void>;
  approveTransfer: (transferId: string, assignedOfficerId: string) => Promise<void>;
  rejectTransfer: (transferId: string, reason: string) => Promise<void>;
  
  // Document Operations
  uploadDocument: (document: Omit<ApplicantDocument, 'id' | 'uploadDate'>) => Promise<void>;
  verifyDocument: (documentId: string, verifiedBy: string) => Promise<void>;
}

export const useApplicantStore = create<ApplicantState>((set, get) => ({
  applicants: [],
  selectedApplicant: null,
  loading: false,
  error: null,
  filter: {},
  sort: {
    field: 'createdAt',
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

  fetchApplicants: async () => {
    try {
      set({ loading: true, error: null });
      const { filter, sort, pagination } = get();

      let q = collection(db, 'applicants');

      // Apply filters
      if (filter.branchId) {
        q = query(q, where('branchId', '==', filter.branchId));
      }
      if (filter.stage) {
        q = query(q, where('currentStage', '==', filter.stage));
      }
      if (filter.status) {
        q = query(q, where('status', '==', filter.status));
      }
      if (filter.transferredToHO !== undefined) {
        q = query(q, where('transferredToHO', '==', filter.transferredToHO));
      }

      // Apply sorting
      q = query(q, orderBy(sort.field, sort.direction));

      // Apply pagination
      q = query(q, limit(pagination.limit));
      if (pagination.page > 1 && get().applicants.length > 0) {
        const lastDoc = get().applicants[get().applicants.length - 1];
        q = query(q, startAfter(lastDoc[sort.field]));
      }

      const snapshot = await getDocs(q);
      const applicants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Applicant));

      set({ applicants, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch applicants',
        loading: false,
      });
    }
  },

  fetchApplicantById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(db, 'applicants', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({
          selectedApplicant: {
            id: docSnap.id,
            ...docSnap.data(),
          } as Applicant,
          loading: false,
        });
      } else {
        set({
          error: 'Applicant not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch applicant',
        loading: false,
      });
    }
  },

  createApplicant: async (applicant) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(collection(db, 'applicants'));
      const timestamp = serverTimestamp();
      
      await setDoc(docRef, {
        ...applicant,
        createdAt: timestamp,
        updatedAt: timestamp,
        currentStage: 'interview',
        transferredToHO: false,
        transferredDate: null,
        status: 'active',
      });

      return docRef.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create applicant',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateApplicant: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(db, 'applicants', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update applicant',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteApplicant: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'applicants', id));
      set({
        applicants: get().applicants.filter(a => a.id !== id),
        selectedApplicant: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete applicant',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updatePipeline: async (applicantId, pipeline) => {
    try {
      set({ loading: true, error: null });
      const pipelineRef = doc(collection(db, `applicants/${applicantId}/pipeline`));
      await setDoc(pipelineRef, {
        ...pipeline,
        enteredDate: serverTimestamp(),
        status: 'pending',
      });

      // Update applicant's current stage
      await updateDoc(doc(db, 'applicants', applicantId), {
        currentStage: pipeline.stage,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update pipeline',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  requestTransfer: async (transfer) => {
    try {
      set({ loading: true, error: null });
      const transferRef = doc(collection(db, 'transfers'));
      await setDoc(transferRef, {
        ...transfer,
        requestedDate: serverTimestamp(),
        transferStatus: 'pending',
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to request transfer',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  approveTransfer: async (transferId, assignedOfficerId) => {
    try {
      set({ loading: true, error: null });
      const transferRef = doc(db, 'transfers', transferId);
      const transferDoc = await getDoc(transferRef);

      if (!transferDoc.exists()) {
        throw new Error('Transfer request not found');
      }

      const transfer = transferDoc.data() as ApplicantTransfer;

      // Update transfer status
      await updateDoc(transferRef, {
        transferStatus: 'approved',
        approvedDate: serverTimestamp(),
        assignedOfficerId,
      });

      // Update applicant
      await updateDoc(doc(db, 'applicants', transfer.applicantId), {
        transferredToHO: true,
        transferredDate: serverTimestamp(),
        assignedRecruitmentOfficerId: assignedOfficerId,
        branchId: transfer.toBranchId,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to approve transfer',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  rejectTransfer: async (transferId, reason) => {
    try {
      set({ loading: true, error: null });
      await updateDoc(doc(db, 'transfers', transferId), {
        transferStatus: 'rejected',
        notes: reason,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reject transfer',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  uploadDocument: async (document) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(collection(db, `applicants/${document.applicantId}/documents`));
      await setDoc(docRef, {
        ...document,
        uploadDate: serverTimestamp(),
        status: 'pending',
      });
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

  verifyDocument: async (documentId, verifiedBy) => {
    try {
      set({ loading: true, error: null });
      await updateDoc(doc(db, 'documents', documentId), {
        status: 'verified',
        verifiedBy,
        verifiedAt: serverTimestamp(),
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
}));
