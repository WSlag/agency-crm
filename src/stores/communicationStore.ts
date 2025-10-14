import { create } from 'zustand';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { canCreateCommunication, PermissionDeniedError } from '../utils/permissions';
import type { User } from '../types/auth';
import type {
  Communication,
  CreateCommunicationData,
  CommunicationFilter,
  CommunicationStats,
  CommunicationStatus,
} from '../types/communication';

interface CommunicationState {
  communications: Communication[];
  selectedCommunication: Communication | null;
  loading: boolean;
  error: string | null;
  stats: CommunicationStats | null;

  // Actions
  fetchCommunications: (applicantId: string) => Promise<void>;
  fetchCommunicationById: (id: string) => Promise<void>;
  createCommunication: (data: CreateCommunicationData, user: User) => Promise<string>;
  updateCommunicationStatus: (id: string, status: CommunicationStatus) => Promise<void>;
  deleteCommunication: (id: string) => Promise<void>;
  fetchCommunicationStats: (applicantId: string) => Promise<void>;
  clearError: () => void;
}

const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
  communications: [],
  selectedCommunication: null,
  loading: false,
  error: null,
  stats: null,

  fetchCommunications: async (applicantId: string) => {
    try {
      set({ loading: true, error: null });
      const q = query(
        collection(firestore, 'communications'),
        where('applicantId', '==', applicantId),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const communications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          metadata: {
            ...data.metadata,
            deliveredAt: data.metadata?.deliveredAt ? convertTimestamp(data.metadata.deliveredAt) : undefined,
            readAt: data.metadata?.readAt ? convertTimestamp(data.metadata.readAt) : undefined,
          },
        } as Communication;
      });

      set({ communications, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch communications',
        loading: false,
      });
    }
  },

  fetchCommunicationById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'communications', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          selectedCommunication: {
            id: docSnap.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            metadata: {
              ...data.metadata,
              deliveredAt: data.metadata?.deliveredAt ? convertTimestamp(data.metadata.deliveredAt) : undefined,
              readAt: data.metadata?.readAt ? convertTimestamp(data.metadata.readAt) : undefined,
            },
          } as Communication,
          loading: false,
        });
      } else {
        set({
          error: 'Communication not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch communication',
        loading: false,
      });
    }
  },

  createCommunication: async (data: CreateCommunicationData, user: User) => {
    try {
      set({ loading: true, error: null });

      // SECURITY: Check permission before creating
      const hasPermission = await canCreateCommunication(data.applicantId, user);
      if (!hasPermission) {
        throw new PermissionDeniedError('create communication for', 'this applicant');
      }

      const timestamp = serverTimestamp();

      const communicationData = {
        ...data,
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        status: data.type === 'note' ? 'sent' : 'draft',
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: {
          ...data.metadata,
        },
      };

      const docRef = await addDoc(collection(firestore, 'communications'), communicationData);

      // Create audit log
      await addDoc(collection(firestore, 'audit_logs'), {
        action: 'communication_created',
        entityId: docRef.id,
        entityType: 'communication',
        performedBy: user.uid,
        performedAt: timestamp,
        details: {
          applicantId: data.applicantId,
          type: data.type,
          direction: data.direction,
        },
      });

      set({ loading: false });
      return docRef.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create communication',
        loading: false,
      });
      throw error;
    }
  },

  updateCommunicationStatus: async (id: string, status: CommunicationStatus) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'communications', id);
      const timestamp = serverTimestamp();

      const updateData: any = {
        status,
        updatedAt: timestamp,
      };

      // Add metadata for status changes
      if (status === 'delivered') {
        updateData['metadata.deliveredAt'] = timestamp;
      } else if (status === 'read') {
        updateData['metadata.readAt'] = timestamp;
      }

      await updateDoc(docRef, updateData);

      // Update local state
      const { communications } = get();
      set({
        communications: communications.map(comm =>
          comm.id === id ? { ...comm, status, updatedAt: new Date() } : comm
        ),
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update communication status',
        loading: false,
      });
      throw error;
    }
  },

  deleteCommunication: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(firestore, 'communications', id));

      // Update local state
      const { communications } = get();
      set({
        communications: communications.filter(comm => comm.id !== id),
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete communication',
        loading: false,
      });
      throw error;
    }
  },

  fetchCommunicationStats: async (applicantId: string) => {
    try {
      const q = query(
        collection(firestore, 'communications'),
        where('applicantId', '==', applicantId)
      );

      const snapshot = await getDocs(q);
      const communications = snapshot.docs.map(doc => doc.data());

      const byType: any = {
        email: 0,
        sms: 0,
        call: 0,
        note: 0,
        'in-app': 0,
        meeting: 0,
      };

      const byStatus: any = {
        draft: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        read: 0,
      };

      let lastCommunication: Communication | undefined;
      let lastDate = new Date(0);

      communications.forEach((comm: any) => {
        byType[comm.type] = (byType[comm.type] || 0) + 1;
        byStatus[comm.status] = (byStatus[comm.status] || 0) + 1;

        const commDate = convertTimestamp(comm.createdAt);
        if (commDate > lastDate) {
          lastDate = commDate;
          lastCommunication = {
            ...comm,
            createdAt: commDate,
            updatedAt: convertTimestamp(comm.updatedAt),
          } as Communication;
        }
      });

      set({
        stats: {
          total: communications.length,
          byType,
          byStatus,
          lastCommunication,
        },
      });
    } catch (error) {
      console.error('Failed to fetch communication stats:', error);
    }
  },

  clearError: () => set({ error: null }),
}));

