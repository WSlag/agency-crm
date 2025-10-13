import { create } from 'zustand';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../config/firebase';

interface Agent {
  id: string;
  agentName: string;
  status: 'active' | 'inactive';
  email: string;
  contactNumber: string;
  address: string;
  licenseNumber: string;
  licenseExpiry: Date;
}

interface AgentState {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  fetchActiveAgents: () => Promise<Agent[]>;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  loading: false,
  error: null,

  fetchActiveAgents: async () => {
    try {
      set({ loading: true, error: null });
      const agentsRef = collection(firestore, 'agents');
      const q = query(agentsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const agents = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw agent data:', { id: doc.id, data });
        return {
          id: doc.id,
          agentName: data.agentName || data.name || data.fullName || data.displayName || `Agent ${doc.id.substring(0, 8)}`,
          status: data.status,
          email: data.email,
          contactNumber: data.contactNumber,
          address: data.address,
          licenseNumber: data.licenseNumber,
          licenseExpiry: data.licenseExpiry?.toDate(),
        };
      });
      console.log('Fetched agents:', agents);
      set({ agents, loading: false });
      return agents;
    } catch (error) {
      console.error('Error fetching agents:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
        loading: false,
        agents: [] // Set empty array on error
      });
      return [];
    }
  },
}));