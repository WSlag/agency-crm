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
  addDoc,
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
    limit: 50, // PERFORMANCE: Increased from 10 to 50 for better UX
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

      // Add filters in the correct order
      if (filter.branchId) {
        queryConstraints.push(where('branchId', '==', filter.branchId));
      }
      if (filter.agentId) {
        queryConstraints.push(where('agentId', '==', filter.agentId));
      }
      if (filter.assignedOfficerId) {
        // Check both fields for backward compatibility
        queryConstraints.push(where('assignedRecruitmentOfficerId', '==', filter.assignedOfficerId));
      }
      if (filter.currentStage) {
        // Check both fields for backward compatibility
        queryConstraints.push(where('currentStage', '==', filter.currentStage));
      }
      if (filter.status) {
        queryConstraints.push(where('status', '==', filter.status));
      }
      if (filter.transferredToHO !== undefined) {
        queryConstraints.push(where('transferredToHO', '==', Boolean(filter.transferredToHO)));
      }
      if (filter.dateRange?.start) {
        const startDate = new Date(filter.dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        queryConstraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
      }
      if (filter.dateRange?.end) {
        const endDate = new Date(filter.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        queryConstraints.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
      }
      
      // Log the filters being applied
      console.log('Applying filters:', {
        filter,
        queryConstraints: queryConstraints.map(c => ({ 
          field: c.field?.toString(),
          op: c.op?.toString(),
          value: c.value
        }))
      });

      // Add the sort field after the filters
      queryConstraints.push(orderBy(sort.field, sort.direction));

      // Handle search term separately as it requires special indexing
      if (filter.searchTerm) {
        queryConstraints = [
          where('fullName', '>=', filter.searchTerm),
          where('fullName', '<=', filter.searchTerm + '\uf8ff'),
          ...queryConstraints
        ];
      }

      // PERFORMANCE: Apply pagination with limit (default 50, max 100)
      const pageLimit = Math.min(pagination.limit || 50, 100);
      queryConstraints.push(limit(pageLimit));
      
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
          console.log('Raw document data:', { id: doc.id, ...data });
          
          // Convert Firestore timestamps to dates and map fields correctly
          const processedData = {
            id: doc.id,
            fullName: data.name || data.fullName || 'No Name', // Handle both name fields
            contactInfo: data.phone || data.contactInfo || '',
            email: data.email || '',
            agentId: data.agentId || null,
            branchId: data.branchId || '',
            assignedRecruitmentOfficerId: data.assignedRecruitmentOfficerId || data.officerId || null,
            applicationType: data.applicationType || 'direct_hire',
            currentStage: data.currentStage || data.stage || 'interview',
            transferredToHO: Boolean(data.transferredToHO),
            status: data.status || 'active',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            transferredDate: data.transferredDate?.toDate() || null,
            dateOfBirth: data.dateOfBirth?.toDate() || null,
            
            // Add required fields with defaults
            placeOfBirth: data.placeOfBirth || '',
            nationality: data.nationality || '',
            civilStatus: data.civilStatus || 'single',
            gender: data.gender || 'other',
            address: {
              present: data.address?.present || data.presentAddress || '',
              permanent: data.address?.permanent || data.permanentAddress || ''
            },
            preferredCountries: data.preferredCountries || [],
            preferredPositions: data.preferredPositions || [],
            expectedSalary: {
              amount: data.expectedSalary?.amount || 0,
              currency: data.expectedSalary?.currency || 'PHP'
            },
            education: data.education || [],
            workExperience: data.workExperience || [],
            skills: data.skills || [],
            certifications: data.certifications || [],
            languages: data.languages || [],
            medicalStatus: {
              examination: {
                date: data.medicalStatus?.examination?.date?.toDate() || null,
                result: data.medicalStatus?.examination?.result || 'pending',
                facility: data.medicalStatus?.examination?.facility || ''
              },
              conditions: data.medicalStatus?.conditions || [],
              allergies: data.medicalStatus?.allergies || [],
              vaccinations: data.medicalStatus?.vaccinations || []
            },
            deployment: {
              employer: data.deployment?.employer || null,
              position: data.deployment?.position || null,
              country: data.deployment?.country || null,
              contractPeriod: data.deployment?.contractPeriod || null,
              salary: {
                amount: data.deployment?.salary?.amount || null,
                currency: data.deployment?.salary?.currency || null
              },
              startDate: data.deployment?.startDate?.toDate() || null,
              endDate: data.deployment?.endDate?.toDate() || null,
              status: data.deployment?.status || null
            },
            emergencyContact: {
              name: data.emergencyContact?.name || '',
              relationship: data.emergencyContact?.relationship || '',
              contactNumber: data.emergencyContact?.contactNumber || '',
              address: data.emergencyContact?.address || ''
            }
          };
          
          console.log('Processed applicant data:', processedData);
          return processedData as Applicant;
        });

        console.log('=== Setting applicants in store ===');
        console.log('Applicants count:', applicants.length);
        console.log('Sample applicant:', applicants[0]);
        
        set({ 
          applicants, 
          loading: false,
          pagination: {
            ...get().pagination,
            total: snapshot.size,
          }
        });
        
        console.log('Store updated. Current state:', {
          applicantsCount: get().applicants.length,
          loading: get().loading,
          error: get().error
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

  fetchApplicantById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'applicants', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const applicant = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          transferredDate: data.transferredDate?.toDate(),
          dateOfBirth: data.dateOfBirth?.toDate(),
        } as Applicant;
        
        set({ selectedApplicant: applicant, loading: false });
      } else {
        set({ error: 'Applicant not found', loading: false });
      }
    } catch (error) {
      console.error('Error fetching applicant:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch applicant',
        loading: false
      });
    }
  },

  createApplicant: async (applicant) => {
    try {
      const docRef = doc(collection(firestore, 'applicants'));
      await setDoc(docRef, {
        ...applicant,
        // Ensure status defaults to 'active' if not provided
        status: applicant.status || 'active',
        // Set initial stage if not provided
        currentStage: applicant.currentStage || 'registration',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating applicant:', error);
      throw error;
    }
  },

  updateApplicant: async (id, data) => {
    try {
      const docRef = doc(firestore, 'applicants', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating applicant:', error);
      throw error;
    }
  },

  deleteApplicant: async (id) => {
    try {
      const docRef = doc(firestore, 'applicants', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting applicant:', error);
      throw error;
    }
  },

  updatePipeline: async (applicantId, pipeline) => {
    try {
      const docRef = doc(firestore, 'applicants', applicantId);
      const applicantSnap = await getDoc(docRef);
      
      if (!applicantSnap.exists()) {
        throw new Error('Applicant not found');
      }
      
      const applicantData = applicantSnap.data();
      const oldStage = applicantData.currentStage;
      const newStage = pipeline.stage;
      
      // Update applicant stage
      await updateDoc(docRef, {
        currentStage: newStage,
        updatedAt: serverTimestamp(),
      });
      
      // Create pipeline history entry
      await addDoc(collection(firestore, `applicants/${applicantId}/pipeline`), {
        stage: newStage,
        enteredDate: serverTimestamp(),
        notes: pipeline.notes || `Stage changed from ${oldStage} to ${newStage}`,
        status: 'completed',
      });
      
      // Create audit log
      await addDoc(collection(firestore, 'audit_logs'), {
        action: 'pipeline_stage_updated',
        entityId: applicantId,
        entityType: 'applicant',
        performedBy: 'system', // Should be replaced with actual user ID
        performedAt: serverTimestamp(),
        details: {
          applicantName: applicantData.fullName,
          oldStage,
          newStage,
          notes: pipeline.notes,
        },
      });
      
      // Send notifications to relevant parties
      const notificationsToSend = [];
      
      // Notify assigned recruitment officer (if exists)
      if (applicantData.assignedRecruitmentOfficerId) {
        notificationsToSend.push({
          type: 'stage_change',
          recipientId: applicantData.assignedRecruitmentOfficerId,
          title: 'Applicant Stage Updated',
          body: `${applicantData.fullName} has progressed to ${newStage} stage`,
          metadata: {
            applicantId,
            applicantName: applicantData.fullName,
            oldStage,
            newStage,
          },
          channels: ['in-app', 'push'],
          read: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active',
        });
      }
      
      // Notify branch manager
      if (applicantData.branchId) {
        // Query branch manager
        const branchUsersQuery = query(
          collection(firestore, 'users'),
          where('branchId', '==', applicantData.branchId),
          where('role', '==', 'branch_manager')
        );
        const branchUsersSnap = await getDocs(branchUsersQuery);
        
        branchUsersSnap.forEach((userDoc) => {
          notificationsToSend.push({
            type: 'stage_change',
            recipientId: userDoc.id,
            title: 'Applicant Stage Updated',
            body: `${applicantData.fullName} has progressed to ${newStage} stage`,
            metadata: {
              applicantId,
              applicantName: applicantData.fullName,
              oldStage,
              newStage,
            },
            channels: ['in-app', 'push'],
            read: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'active',
          });
        });
      }
      
      // Send all notifications
      for (const notification of notificationsToSend) {
        await addDoc(collection(firestore, 'notifications'), notification);
      }
    } catch (error) {
      console.error('Error updating pipeline:', error);
      throw error;
    }
  },

  requestTransfer: async (transfer) => {
    try {
      const docRef = doc(collection(firestore, 'transfers'));
      await setDoc(docRef, {
        ...transfer,
        requestedDate: serverTimestamp(),
        transferStatus: 'pending',
      });
    } catch (error) {
      console.error('Error requesting transfer:', error);
      throw error;
    }
  },

  approveTransfer: async (transferId, assignedOfficerId) => {
    try {
      const docRef = doc(firestore, 'transfers', transferId);
      const transferSnap = await getDoc(docRef);
      
      if (!transferSnap.exists()) {
        throw new Error('Transfer not found');
      }
      
      const transferData = transferSnap.data();
      
      // Update transfer status
      await updateDoc(docRef, {
        assignedOfficerId,
        transferStatus: 'approved',
        approvedDate: serverTimestamp(),
      });
      
      // Update applicant with assigned officer and transfer flag
      const applicantRef = doc(firestore, 'applicants', transferData.applicantId);
      await updateDoc(applicantRef, {
        assignedRecruitmentOfficerId: assignedOfficerId,
        transferredToHO: true,
        transferredDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Get applicant and officer details for notifications
      const applicantSnap = await getDoc(applicantRef);
      const applicantData = applicantSnap.data();
      
      // Create audit log
      await addDoc(collection(firestore, 'audit_logs'), {
        action: 'transfer_approved',
        entityId: transferId,
        entityType: 'transfer',
        performedBy: 'system', // Should be replaced with actual user ID
        performedAt: serverTimestamp(),
        details: {
          applicantId: transferData.applicantId,
          applicantName: applicantData?.fullName,
          fromBranchId: transferData.fromBranchId,
          toBranchId: transferData.toBranchId,
          assignedOfficerId,
        },
      });
      
      // Send notification to assigned HO Recruitment Officer
      await addDoc(collection(firestore, 'notifications'), {
        type: 'applicant_assignment',
        recipientId: assignedOfficerId,
        title: 'New Applicant Assigned',
        body: `You have been assigned to manage ${applicantData?.fullName || 'an applicant'} transferred from branch office`,
        metadata: {
          transferId,
          applicantId: transferData.applicantId,
          applicantName: applicantData?.fullName,
          fromBranchId: transferData.fromBranchId,
        },
        channels: ['in-app', 'push', 'email'],
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
      });
      
      // Send notification to requesting branch manager
      if (transferData.requestedBy) {
        await addDoc(collection(firestore, 'notifications'), {
          type: 'transfer_approved',
          recipientId: transferData.requestedBy,
          title: 'Transfer Request Approved',
          body: `Transfer request for ${applicantData?.fullName || 'applicant'} has been approved`,
          metadata: {
            transferId,
            applicantId: transferData.applicantId,
            applicantName: applicantData?.fullName,
            assignedOfficerId,
          },
          channels: ['in-app', 'push'],
          read: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Error approving transfer:', error);
      throw error;
    }
  },

  rejectTransfer: async (transferId, reason) => {
    try {
      const docRef = doc(firestore, 'transfers', transferId);
      await updateDoc(docRef, {
        transferStatus: 'rejected',
        rejectionReason: reason,
        rejectedDate: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      throw error;
    }
  },

  uploadDocument: async (document) => {
    try {
      const docRef = doc(collection(firestore, 'documents'));
      await setDoc(docRef, {
        ...document,
        uploadDate: serverTimestamp(),
        status: 'pending',
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  verifyDocument: async (documentId, verifiedBy) => {
    try {
      const docRef = doc(firestore, 'documents', documentId);
      await updateDoc(docRef, {
        verifiedBy,
        verifiedAt: serverTimestamp(),
        status: 'verified',
      });
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  },
}));