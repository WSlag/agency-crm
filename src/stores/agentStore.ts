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

interface Agent {
  id: string;
  agentName: string;
  contactInfo: string;
  email: string;
  branchId: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAgents: () => Promise<void>;
  fetchActiveAgents: () => Promise<Agent[]>;
  fetchAgentById: (id: string) => Promise<void>;
  createAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAgent: (id: string, data: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  selectedAgent: null,
  loading: false,
  error: null,

  fetchAgents: async () => {
    try {
      console.log('Fetching agents...');
      set({ loading: true, error: null });
      const agentsRef = collection(firestore, 'agents');
      const q = query(agentsRef);
      const snapshot = await getDocs(q);
      const agents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Agent[];
      console.log('Agents fetched:', agents.length);
      set({ agents, loading: false });
    } catch (error) {
      console.error('Error fetching agents:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
        loading: false,
      });
    }
  },

  fetchActiveAgents: async () => {
    try {
      console.log('Fetching active agents...');
      const agentsRef = collection(firestore, 'agents');
      const q = query(agentsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const agents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Agent[];
      console.log('Active agents fetched:', agents.length);
      return agents;
    } catch (error) {
      console.error('Error fetching active agents:', error);
      throw error;
    }
  },

  fetchAgentById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'agents', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        set({
          selectedAgent: {
            id: docSnap.id,
            ...docSnap.data(),
          } as Agent,
          loading: false,
        });
      } else {
        set({
          error: 'Agent not found',
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch agent',
        loading: false,
      });
    }
  },

  createAgent: async (agent) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(collection(firestore, 'agents'));
      const timestamp = serverTimestamp();
      await setDoc(docRef, {
        ...agent,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating agent:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create agent',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateAgent: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'agents', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update agent',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteAgent: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(firestore, 'agents', id));
      set({
        agents: get().agents.filter(a => a.id !== id),
        selectedAgent: null,
      });
    } catch (error) {
      console.error('Error deleting agent:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete agent',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
