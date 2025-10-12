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
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
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
      console.log('Starting to fetch applicants...');
      set({ loading: true, error: null });
      const { filter, sort, pagination } = get();

      const applicantsRef = collection(firestore, 'applicants');
      let queryConstraints: any[] = [];

      // Always add the sort field first
      queryConstraints.push(orderBy(sort.field, sort.direction));

      // Apply filters
      if (filter.searchTerm) {
        queryConstraints.unshift(where('fullName', '>=', filter.searchTerm));
        queryConstraints.unshift(where('fullName', '<=', filter.searchTerm + '\uf8ff'));
      }
      if (filter.branchId) {
        queryConstraints.unshift(where('branchId', '==', filter.branchId));
      }
      if (filter.agentId) {
        queryConstraints.unshift(where('agentId', '==', filter.agentId));
      }
      if (filter.assignedOfficerId) {
        queryConstraints.unshift(where('assignedRecruitmentOfficerId', '==', filter.assignedOfficerId));
      }
      if (filter.stage) {
        queryConstraints.unshift(where('currentStage', '==', filter.stage));
      }
      if (filter.status) {
        queryConstraints.unshift(where('status', '==', filter.status));
      }
      if (filter.transferredToHO !== undefined) {
        // Add this filter before the orderBy
        queryConstraints.unshift(where('transferredToHO', '==', filter.transferredToHO));
      }
      if (filter.dateRange?.start) {
        queryConstraints.unshift(where('createdAt', '>=', Timestamp.fromDate(filter.dateRange.start)));
      }
      if (filter.dateRange?.end) {
        queryConstraints.unshift(where('createdAt', '<=', Timestamp.fromDate(filter.dateRange.end)));
      }

      // Apply pagination
      queryConstraints.push(limit(pagination.limit));
      if (pagination.page > 1 && get().applicants.length > 0) {
        const lastDoc = get().applicants[get().applicants.length - 1];
        queryConstraints.push(startAfter(lastDoc[sort.field]));
      }

      console.log('Query constraints:', queryConstraints);
      const q = query(applicantsRef, ...queryConstraints);

      try {
        const snapshot = await getDocs(q);
        console.log('Snapshot received:', snapshot.size, 'documents');

        const applicants = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            transferredDate: data.transferredDate?.toDate(),
            dateOfBirth: data.dateOfBirth?.toDate(),
          } as Applicant;
        });

        console.log('Applicants processed:', applicants);
        set({ 
          applicants, 
          loading: false,
          pagination: {
            ...get().pagination,
            total: snapshot.size,
          }
        });
      } catch (error: any) {
        if (error.code === 'failed-precondition') {
          // This is the error we get when an index is needed
          const indexNeeded = error.message.includes('https://console.firebase.google.com');
          if (indexNeeded) {
            const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s"]*/)?.[0];
            set({
              error: `The query requires an index. You can create it here: ${indexUrl}`,
              loading: false,
              applicants: [],
            });
            return;
          }
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in fetchApplicants:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch applicants',
        loading: false,
        applicants: [], // Set empty array on error
      });
    }
  },

  // ... rest of the store implementation remains the same ...

}));