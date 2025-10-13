import { create } from 'zustand';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type { ApplicantTransfer } from '../types/applicant';

interface TransferState {
  transfers: ApplicantTransfer[];
  selectedTransfer: ApplicantTransfer | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAllTransfers: (status?: string) => Promise<void>;
  fetchTransfersByBranch: (branchId: string) => Promise<void>;
  fetchPendingTransfers: () => Promise<void>;
  fetchTransferById: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTransferStore = create<TransferState>((set) => ({
  transfers: [],
  selectedTransfer: null,
  loading: false,
  error: null,

  fetchAllTransfers: async (status) => {
    try {
      set({ loading: true, error: null });
      let q = query(
        collection(firestore, 'transfers'),
        orderBy('requestedDate', 'desc')
      );

      if (status) {
        q = query(
          collection(firestore, 'transfers'),
          where('transferStatus', '==', status),
          orderBy('requestedDate', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const transfers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          applicantId: data.applicantId,
          fromBranchId: data.fromBranchId,
          toBranchId: data.toBranchId,
          requestedBy: data.requestedBy,
          approvedBy: data.approvedBy || null,
          assignedOfficerId: data.assignedOfficerId || null,
          transferReason: data.transferReason,
          transferStatus: data.transferStatus,
          requestedDate: data.requestedDate?.toDate ? data.requestedDate.toDate() : new Date(data.requestedDate),
          approvedDate: data.approvedDate?.toDate ? data.approvedDate.toDate() : data.approvedDate ? new Date(data.approvedDate) : null,
          completedDate: data.completedDate?.toDate ? data.completedDate.toDate() : data.completedDate ? new Date(data.completedDate) : null,
          notes: data.notes || ''
        };
      }) as ApplicantTransfer[];

      set({ transfers, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch transfers',
        loading: false
      });
    }
  },

  fetchTransfersByBranch: async (branchId) => {
    try {
      set({ loading: true, error: null });
      const q = query(
        collection(firestore, 'transfers'),
        where('fromBranchId', '==', branchId),
        orderBy('requestedDate', 'desc')
      );

      const snapshot = await getDocs(q);
      const transfers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          applicantId: data.applicantId,
          fromBranchId: data.fromBranchId,
          toBranchId: data.toBranchId,
          requestedBy: data.requestedBy,
          approvedBy: data.approvedBy || null,
          assignedOfficerId: data.assignedOfficerId || null,
          transferReason: data.transferReason,
          transferStatus: data.transferStatus,
          requestedDate: data.requestedDate?.toDate ? data.requestedDate.toDate() : new Date(data.requestedDate),
          approvedDate: data.approvedDate?.toDate ? data.approvedDate.toDate() : data.approvedDate ? new Date(data.approvedDate) : null,
          completedDate: data.completedDate?.toDate ? data.completedDate.toDate() : data.completedDate ? new Date(data.completedDate) : null,
          notes: data.notes || ''
        };
      }) as ApplicantTransfer[];

      set({ transfers, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch branch transfers',
        loading: false
      });
    }
  },

  fetchPendingTransfers: async () => {
    try {
      set({ loading: true, error: null });
      const q = query(
        collection(firestore, 'transfers'),
        where('transferStatus', '==', 'pending'),
        orderBy('requestedDate', 'asc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const transfers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          applicantId: data.applicantId,
          fromBranchId: data.fromBranchId,
          toBranchId: data.toBranchId,
          requestedBy: data.requestedBy,
          approvedBy: data.approvedBy || null,
          assignedOfficerId: data.assignedOfficerId || null,
          transferReason: data.transferReason,
          transferStatus: data.transferStatus,
          requestedDate: data.requestedDate?.toDate ? data.requestedDate.toDate() : new Date(data.requestedDate),
          approvedDate: data.approvedDate?.toDate ? data.approvedDate.toDate() : data.approvedDate ? new Date(data.approvedDate) : null,
          completedDate: data.completedDate?.toDate ? data.completedDate.toDate() : data.completedDate ? new Date(data.completedDate) : null,
          notes: data.notes || ''
        };
      }) as ApplicantTransfer[];

      set({ transfers, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch pending transfers',
        loading: false
      });
    }
  },

  fetchTransferById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'transfers', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          selectedTransfer: {
            id: docSnap.id,
            applicantId: data.applicantId,
            fromBranchId: data.fromBranchId,
            toBranchId: data.toBranchId,
            requestedBy: data.requestedBy,
            approvedBy: data.approvedBy || null,
            assignedOfficerId: data.assignedOfficerId || null,
            transferReason: data.transferReason,
            transferStatus: data.transferStatus,
            requestedDate: data.requestedDate?.toDate ? data.requestedDate.toDate() : new Date(data.requestedDate),
            approvedDate: data.approvedDate?.toDate ? data.approvedDate.toDate() : data.approvedDate ? new Date(data.approvedDate) : null,
            completedDate: data.completedDate?.toDate ? data.completedDate.toDate() : data.completedDate ? new Date(data.completedDate) : null,
            notes: data.notes || ''
          } as ApplicantTransfer,
          loading: false
        });
      } else {
        set({ error: 'Transfer not found', loading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch transfer',
        loading: false
      });
    }
  },

  clearError: () => set({ error: null })
}));

