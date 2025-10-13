import { create } from 'zustand';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../config/firebase';

interface Officer {
  id: string;
  displayName: string;
  email: string;
  role: 'recruitment_officer' | 'admin';
  status: 'active' | 'inactive';
  branchId: string;
}

interface OfficerState {
  officers: Officer[];
  loading: boolean;
  error: string | null;
  fetchActiveOfficers: () => Promise<Officer[]>;
}

export const useOfficerStore = create<OfficerState>((set) => ({
  officers: [],
  loading: false,
  error: null,

  fetchActiveOfficers: async () => {
    try {
      set({ loading: true, error: null });
      const officersRef = collection(firestore, 'users');
      const q = query(
        officersRef,
        where('role', '==', 'recruitment_officer'),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      const officers = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw officer data:', { id: doc.id, data });
        return {
          id: doc.id,
          displayName: data.displayName || data.name || data.fullName || data.email || `Officer ${doc.id.substring(0, 8)}`,
          email: data.email,
          role: data.role,
          status: data.status,
          branchId: data.branchId,
        };
      });
      console.log('Fetched officers:', officers);
      set({ officers, loading: false });
      return officers;
    } catch (error) {
      console.error('Error fetching officers:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch officers',
        loading: false,
        officers: [] // Set empty array on error
      });
      return [];
    }
  },
}));
