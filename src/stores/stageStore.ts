/**
 * Stage Store
 * 
 * Zustand store for managing applicant stage state and operations
 */

import { create } from 'zustand';
import { stageService } from '../services/stageService';
import { 
  ApplicantStage, 
  ApplicantStatus,
  StageTransition, 
  StageApproval,
  StageHistory 
} from '../types/applicant';
import { User } from '../types';

interface DocumentCheckResult {
  complete: boolean;
  missing: string[];
}

interface StageStore {
  // State
  pendingApprovals: any[];
  stageHistory: Record<string, StageHistory[]>; // applicantId -> history
  documentChecks: Record<string, DocumentCheckResult>; // applicantId:stage -> check result
  loading: boolean;
  error: string | null;
  
  // Actions
  requestStageAdvancement: (transition: StageTransition, user: User) => Promise<void>;
  approveStage: (approval: StageApproval, user: User) => Promise<void>;
  fetchPendingApprovals: (user: User) => Promise<void>;
  checkDocumentRequirements: (applicantId: string, stage: ApplicantStage) => Promise<DocumentCheckResult>;
  fetchStageHistory: (applicantId: string) => Promise<void>;
  clearError: () => void;
}

export const useStageStore = create<StageStore>((set, get) => ({
  // Initial state
  pendingApprovals: [],
  stageHistory: {},
  documentChecks: {},
  loading: false,
  error: null,
  
  /**
   * Request stage advancement
   */
  requestStageAdvancement: async (transition: StageTransition, user: User) => {
    set({ loading: true, error: null });
    try {
      await stageService.requestStageAdvancement(transition, user);
      
      // Refresh pending approvals if user can approve stages
      if (['admin', 'president', 'branch_manager', 'ho_recruitment_officer'].includes(user.role)) {
        await get().fetchPendingApprovals(user);
      }
      
      set({ loading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to request stage advancement';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },
  
  /**
   * Approve or reject stage advancement
   */
  approveStage: async (approval: StageApproval, user: User) => {
    set({ loading: true, error: null });
    try {
      await stageService.approveStageAdvancement(approval, user);
      
      // Refresh pending approvals
      await get().fetchPendingApprovals(user);
      
      // Refresh stage history for this applicant
      await get().fetchStageHistory(approval.applicantId);
      
      set({ loading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to approve stage';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },
  
  /**
   * Fetch pending approvals for current user
   */
  fetchPendingApprovals: async (user: User) => {
    set({ loading: true, error: null });
    try {
      const approvals = await stageService.getPendingApprovals(user);
      set({ pendingApprovals: approvals, loading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch pending approvals';
      set({ loading: false, error: errorMessage });
    }
  },
  
  /**
   * Check document requirements for a stage
   */
  checkDocumentRequirements: async (
    applicantId: string, 
    stage: ApplicantStage
  ): Promise<DocumentCheckResult> => {
    try {
      const result = await stageService.areDocumentsComplete(applicantId, stage);
      
      // Cache the result
      const key = `${applicantId}:${stage}`;
      set(state => ({
        documentChecks: {
          ...state.documentChecks,
          [key]: result
        }
      }));
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to check document requirements';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  /**
   * Fetch stage history for an applicant
   */
  fetchStageHistory: async (applicantId: string) => {
    try {
      const history = await stageService.getStageHistory(applicantId);
      
      set(state => ({
        stageHistory: {
          ...state.stageHistory,
          [applicantId]: history
        }
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch stage history';
      set({ error: errorMessage });
    }
  },
  
  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  }
}));

// Selectors
export const selectPendingApprovals = (state: StageStore) => state.pendingApprovals;
export const selectStageHistory = (applicantId: string) => (state: StageStore) => 
  state.stageHistory[applicantId] || [];
export const selectDocumentCheck = (applicantId: string, stage: ApplicantStage) => (state: StageStore) => 
  state.documentChecks[`${applicantId}:${stage}`];
export const selectLoading = (state: StageStore) => state.loading;
export const selectError = (state: StageStore) => state.error;

