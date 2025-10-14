import { create } from 'zustand';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type { Agent, CreateAgentData, AgentPerformance } from '../types/agent';

interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  loading: boolean;
  error: string | null;
  
  // Fetch operations
  fetchAllAgents: () => Promise<Agent[]>;
  fetchActiveAgents: () => Promise<Agent[]>;
  fetchAgentById: (id: string) => Promise<void>;
  fetchAgentsByBranch: (branchId: string) => Promise<Agent[]>;
  
  // CRUD operations
  createAgent: (data: CreateAgentData) => Promise<string>;
  updateAgent: (id: string, data: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  
  // Performance & Analytics
  fetchAgentPerformance: (agentId: string) => Promise<AgentPerformance>;
  
  // State setters
  setSelectedAgent: (agent: Agent | null) => void;
  clearError: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  selectedAgent: null,
  loading: false,
  error: null,

  fetchAllAgents: async () => {
    try {
      set({ loading: true, error: null });
      const agentsRef = collection(firestore, 'agents');
      const q = query(agentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const agents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          agentName: data.agentName || data.name || '',
          email: data.email || '',
          contactNumber: data.contactNumber || data.phone || '',
          address: data.address || '',
          branchId: data.branchId || '',
          commissionRate: data.commissionRate || 0,
          licenseNumber: data.licenseNumber || '',
          licenseExpiry: data.licenseExpiry?.toDate(),
          status: data.status || 'active',
          totalApplicants: data.totalApplicants || data.applicantsCount || 0,
          deployedApplicants: data.deployedApplicants || 0,
          totalCommissions: data.totalCommissions || data.totalCommission || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Agent;
      });
      
      set({ agents, loading: false });
      return agents;
    } catch (error) {
      console.error('Error fetching agents:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
        loading: false,
        agents: []
      });
      return [];
    }
  },

  fetchActiveAgents: async () => {
    try {
      set({ loading: true, error: null });
      const agentsRef = collection(firestore, 'agents');
      const q = query(agentsRef, where('status', '==', 'active'), orderBy('agentName'));
      const snapshot = await getDocs(q);
      
      const agents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          agentName: data.agentName || data.name || '',
          email: data.email || '',
          contactNumber: data.contactNumber || data.phone || '',
          address: data.address || '',
          branchId: data.branchId || '',
          commissionRate: data.commissionRate || 0,
          licenseNumber: data.licenseNumber || '',
          licenseExpiry: data.licenseExpiry?.toDate(),
          status: data.status || 'active',
          totalApplicants: data.totalApplicants || data.applicantsCount || 0,
          deployedApplicants: data.deployedApplicants || 0,
          totalCommissions: data.totalCommissions || data.totalCommission || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Agent;
      });
      
      set({ agents, loading: false });
      return agents;
    } catch (error) {
      console.error('Error fetching active agents:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch active agents',
        loading: false,
        agents: []
      });
      return [];
    }
  },

  fetchAgentById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const agentRef = doc(firestore, 'agents', id);
      const agentSnap = await getDoc(agentRef);
      
      if (!agentSnap.exists()) {
        throw new Error('Agent not found');
      }
      
      const data = agentSnap.data();
      const agent: Agent = {
        id: agentSnap.id,
        agentName: data.agentName || data.name || '',
        email: data.email || '',
        contactNumber: data.contactNumber || data.phone || '',
        address: data.address || '',
        branchId: data.branchId || '',
        commissionRate: data.commissionRate || 0,
        licenseNumber: data.licenseNumber || '',
        licenseExpiry: data.licenseExpiry?.toDate(),
        status: data.status || 'active',
        totalApplicants: data.totalApplicants || data.applicantsCount || 0,
        deployedApplicants: data.deployedApplicants || 0,
        totalCommissions: data.totalCommissions || data.totalCommission || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
      
      set({ selectedAgent: agent, loading: false });
    } catch (error) {
      console.error('Error fetching agent:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch agent',
        loading: false,
      });
    }
  },

  fetchAgentsByBranch: async (branchId: string) => {
    try {
      set({ loading: true, error: null });
      const agentsRef = collection(firestore, 'agents');
      const q = query(agentsRef, where('branchId', '==', branchId), orderBy('agentName'));
      const snapshot = await getDocs(q);
      
      const agents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          agentName: data.agentName || data.name || '',
          email: data.email || '',
          contactNumber: data.contactNumber || data.phone || '',
          address: data.address || '',
          branchId: data.branchId || '',
          commissionRate: data.commissionRate || 0,
          licenseNumber: data.licenseNumber || '',
          licenseExpiry: data.licenseExpiry?.toDate(),
          status: data.status || 'active',
          totalApplicants: data.totalApplicants || data.applicantsCount || 0,
          deployedApplicants: data.deployedApplicants || 0,
          totalCommissions: data.totalCommissions || data.totalCommission || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Agent;
      });
      
      set({ agents, loading: false });
      return agents;
    } catch (error) {
      console.error('Error fetching agents by branch:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
        loading: false,
        agents: []
      });
      return [];
    }
  },

  createAgent: async (data: CreateAgentData) => {
    try {
      set({ loading: true, error: null });
      
      const agentRef = doc(collection(firestore, 'agents'));
      const agentData = {
        agentName: data.agentName,
        email: data.email,
        contactNumber: data.contactNumber,
        address: data.address,
        branchId: data.branchId,
        commissionRate: data.commissionRate,
        licenseNumber: data.licenseNumber || '',
        licenseExpiry: data.licenseExpiry ? Timestamp.fromDate(data.licenseExpiry) : null,
        status: data.status || 'active',
        totalApplicants: 0,
        deployedApplicants: 0,
        totalCommissions: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(agentRef, agentData);
      
      // Refresh agents list
      await get().fetchAllAgents();
      
      set({ loading: false });
      return agentRef.id;
    } catch (error) {
      console.error('Error creating agent:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create agent',
        loading: false,
      });
      throw error;
    }
  },

  updateAgent: async (id: string, data: Partial<Agent>) => {
    try {
      set({ loading: true, error: null });
      
      const agentRef = doc(firestore, 'agents', id);
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      // Convert Date objects to Timestamps
      if (data.licenseExpiry) {
        updateData.licenseExpiry = Timestamp.fromDate(data.licenseExpiry);
      }
      
      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.createdAt;
      
      await updateDoc(agentRef, updateData);
      
      // Refresh agents list
      await get().fetchAllAgents();
      
      // Update selected agent if it's the one being updated
      if (get().selectedAgent?.id === id) {
        await get().fetchAgentById(id);
      }
      
      set({ loading: false });
    } catch (error) {
      console.error('Error updating agent:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update agent',
        loading: false,
      });
      throw error;
    }
  },

  deleteAgent: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const agentRef = doc(firestore, 'agents', id);
      await deleteDoc(agentRef);
      
      // Refresh agents list
      await get().fetchAllAgents();
      
      // Clear selected agent if it's the one being deleted
      if (get().selectedAgent?.id === id) {
        set({ selectedAgent: null });
      }
      
      set({ loading: false });
    } catch (error) {
      console.error('Error deleting agent:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete agent',
        loading: false,
      });
      throw error;
    }
  },

  fetchAgentPerformance: async (agentId: string) => {
    try {
      set({ loading: true, error: null });
      
      // Fetch applicants for this agent
      const applicantsRef = collection(firestore, 'applicants');
      const q = query(applicantsRef, where('agentId', '==', agentId));
      const applicantsSnap = await getDocs(q);
      
      const totalApplicants = applicantsSnap.size;
      const deployedApplicants = applicantsSnap.docs.filter(
        doc => doc.data().currentStage === 'deployed'
      ).length;
      
      // Fetch commissions for this agent
      const commissionsRef = collection(firestore, 'commissions');
      const commQuery = query(commissionsRef, where('agentId', '==', agentId));
      const commissionsSnap = await getDocs(commQuery);
      
      let totalCommissionsEarned = 0;
      let pendingCommissions = 0;
      let paidCommissions = 0;
      
      commissionsSnap.docs.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        totalCommissionsEarned += amount;
        
        if (data.status === 'pending') {
          pendingCommissions += amount;
        } else if (data.status === 'paid') {
          paidCommissions += amount;
        }
      });
      
      const successRate = totalApplicants > 0 
        ? (deployedApplicants / totalApplicants) * 100 
        : 0;
      
      const performance: AgentPerformance = {
        agentId,
        totalApplicants,
        activeApplicants: totalApplicants - deployedApplicants,
        deployedApplicants,
        totalCommissionsEarned,
        pendingCommissions,
        paidCommissions,
        averageProcessingDays: 0, // TODO: Calculate from pipeline data
        successRate,
        monthlyStats: [], // TODO: Implement monthly aggregation
      };
      
      set({ loading: false });
      return performance;
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch agent performance',
        loading: false,
      });
      throw error;
    }
  },

  setSelectedAgent: (agent: Agent | null) => {
    set({ selectedAgent: agent });
  },

  clearError: () => {
    set({ error: null });
  },
}));
