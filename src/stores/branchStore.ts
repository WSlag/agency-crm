import { create } from 'zustand';
import {
  collection,
  doc,
  query,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { Branch } from '../types/entities/branch';

interface BranchState {
  branches: Branch[];
  selectedBranch: Branch | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchBranches: () => Promise<void>;
  fetchActiveBranches: () => Promise<Branch[]>;
  fetchBranchById: (id: string) => Promise<void>;
  createBranch: (branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBranch: (id: string, data: Partial<Branch>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
}

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [],
  selectedBranch: null,
  loading: false,
  error: null,

  fetchBranches: async () => {
    try {
      console.log('Fetching branches...');
      set({ loading: true, error: null });
      const branchesRef = collection(firestore, 'branches');
      const q = query(branchesRef);
      const snapshot = await getDocs(q);
      const branches = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : new Date(),
        };
      }) as Branch[];
      console.log('Branches fetched:', branches.length);
      set({ branches, loading: false });
    } catch (error) {
      console.error('Error fetching branches:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch branches',
        loading: false,
      });
    }
  },

  fetchActiveBranches: async () => {
    try {
      console.log('Fetching active branches...');
      set({ loading: true, error: null });
      const branchesRef = collection(firestore, 'branches');
      // Fetch all branches and filter in memory to handle both 'status' and 'active' fields
      const q = query(branchesRef);
      const snapshot = await getDocs(q);
      const branches = snapshot.docs
        .map(doc => {
          const data = doc.data();
          console.log('Raw branch data:', { id: doc.id, data });
          return {
            id: doc.id,
            name: data.name || data.branchName || 'Unknown Branch',
            branchName: data.branchName || data.name || 'Unknown Branch',
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : new Date(),
          };
        })
        .filter(branch => {
          // Support both 'status' === 'active' and 'active' === true
          return (branch as any).status === 'active' || (branch as any).active === true;
        }) as Branch[];
      console.log('Active branches fetched:', branches);
      set({ branches, loading: false });
      return branches;
    } catch (error) {
      console.error('Error fetching active branches:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch active branches',
        loading: false,
        branches: []
      });
      return [];
    }
  },

  fetchBranchById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'branches', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          selectedBranch: {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : new Date(),
          } as Branch,
          loading: false,
        });
      } else {
        set({
          error: 'Branch not found',
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching branch:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch branch',
        loading: false,
      });
    }
  },

  createBranch: async (branch) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(collection(firestore, 'branches'));
      const timestamp = serverTimestamp();
      await setDoc(docRef, {
        ...branch,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating branch:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create branch',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateBranch: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'branches', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating branch:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update branch',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteBranch: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(firestore, 'branches', id));
      set({
        branches: get().branches.filter(b => b.id !== id),
        selectedBranch: null,
      });
    } catch (error) {
      console.error('Error deleting branch:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete branch',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));