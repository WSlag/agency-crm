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
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Commission,
  CommissionFilter,
  CommissionSort,
  CommissionPagination,
  CommissionVerification,
  CommissionApproval,
  CommissionPayment,
  COMMISSION_CONFIG,
} from '../types/commission';

interface CommissionState {
  commissions: Commission[];
  selectedCommission: Commission | null;
  loading: boolean;
  error: string | null;
  filter: CommissionFilter;
  sort: CommissionSort;
  pagination: CommissionPagination;

  // Actions
  setFilter: (filter: CommissionFilter) => void;
  setSort: (sort: CommissionSort) => void;
  setPagination: (pagination: CommissionPagination) => void;

  // CRUD Operations
  fetchCommissions: () => Promise<void>;
  fetchCommissionById: (id: string) => Promise<void>;
  createCommission: (data: Omit<Commission, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCommission: (id: string, data: Partial<Commission>) => Promise<void>;
  deleteCommission: (id: string) => Promise<void>;

  // Verification Operations
  verifyCommission: (verification: CommissionVerification) => Promise<void>;
  rejectCommission: (commissionId: string, reason: string) => Promise<void>;

  // Approval Operations
  approveCommission: (approval: CommissionApproval) => Promise<void>;

  // Payment Operations
  recordPayment: (payment: CommissionPayment) => Promise<void>;

  // Commission Calculation
  calculateCommission: (
    commissionType: keyof typeof COMMISSION_CONFIG,
    baseAmount: number,
    metadata: {
      applicantCount?: number;
      placementDays?: number;
      salary?: number;
      retentionMonths?: number;
      referralCount?: number;
    }
  ) => {
    baseAmount: number;
    bonusAmount: number;
    totalAmount: number;
    calculationDetails: Commission['calculationDetails'];
  };
}

export const useCommissionStore = create<CommissionState>((set, get) => ({
  commissions: [],
  selectedCommission: null,
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

  fetchCommissions: async () => {
    try {
      set({ loading: true, error: null });
      const { filter, sort, pagination } = get();

      let q = collection(db, 'commissions');

      // Apply filters
      if (filter.agentId) {
        q = query(q, where('agentId', '==', filter.agentId));
      }
      if (filter.applicantId) {
        q = query(q, where('applicantId', '==', filter.applicantId));
      }
      if (filter.branchId) {
        q = query(q, where('branchId', '==', filter.branchId));
      }
      if (filter.commissionType) {
        q = query(q, where('commissionType', '==', filter.commissionType));
      }
      if (filter.status) {
        q = query(q, where('status', '==', filter.status));
      }
      if (filter.currency) {
        q = query(q, where('currency', '==', filter.currency));
      }

      // Apply sorting
      q = query(q, orderBy(sort.field, sort.direction));

      // Apply pagination
      q = query(q, limit(pagination.limit));
      if (pagination.page > 1 && get().commissions.length > 0) {
        const lastDoc = get().commissions[get().commissions.length - 1];
        q = query(q, startAfter(lastDoc[sort.field]));
      }

      const snapshot = await getDocs(q);
      const commissions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Commission[];

      set({ commissions, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch commissions',
        loading: false,
      });
    }
  },

  fetchCommissionById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(db, 'commissions', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({
          selectedCommission: {
            id: docSnap.id,
            ...docSnap.data(),
          } as Commission,
          loading: false,
        });
      } else {
        set({
          error: 'Commission not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch commission',
        loading: false,
      });
    }
  },

  createCommission: async (data) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(collection(db, 'commissions'));
      const timestamp = serverTimestamp();

      const commissionData = {
        ...data,
        status: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await setDoc(docRef, commissionData);

      // Create audit log
      await setDoc(doc(collection(db, 'audit_logs')), {
        action: 'commission_created',
        entityId: docRef.id,
        entityType: 'commission',
        performedBy: data.requestedBy,
        performedAt: timestamp,
        details: commissionData,
      });

      return docRef.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create commission',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateCommission: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(db, 'commissions', id);
      const timestamp = serverTimestamp();

      await updateDoc(docRef, {
        ...data,
        updatedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(db, 'audit_logs')), {
        action: 'commission_updated',
        entityId: id,
        entityType: 'commission',
        performedBy: 'system',
        performedAt: timestamp,
        details: {
          changes: data,
        },
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update commission',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteCommission: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'commissions', id));

      set({
        commissions: get().commissions.filter((c) => c.id !== id),
        selectedCommission: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete commission',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  verifyCommission: async (verification) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      // Update commission status
      await updateDoc(doc(db, 'commissions', verification.commissionId), {
        status: verification.status,
        verifiedBy: verification.verifiedBy,
        verifiedAt: timestamp,
        updatedAt: timestamp,
      });

      // Create verification record
      await setDoc(doc(collection(db, 'commission_verifications')), {
        ...verification,
        verifiedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(db, 'audit_logs')), {
        action: 'commission_verified',
        entityId: verification.commissionId,
        entityType: 'commission',
        performedBy: verification.verifiedBy,
        performedAt: timestamp,
        details: verification,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to verify commission',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  rejectCommission: async (commissionId, reason) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      await updateDoc(doc(db, 'commissions', commissionId), {
        status: 'rejected',
        notes: reason,
        updatedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(db, 'audit_logs')), {
        action: 'commission_rejected',
        entityId: commissionId,
        entityType: 'commission',
        performedBy: 'system',
        performedAt: timestamp,
        details: {
          reason,
        },
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reject commission',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  approveCommission: async (approval) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      // Update commission status
      await updateDoc(doc(db, 'commissions', approval.commissionId), {
        status: approval.status,
        approvedBy: approval.approvedBy,
        approvedAt: timestamp,
        updatedAt: timestamp,
      });

      // Create approval record
      await setDoc(doc(collection(db, 'commission_approvals')), {
        ...approval,
        approvedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(db, 'audit_logs')), {
        action: 'commission_approved',
        entityId: approval.commissionId,
        entityType: 'commission',
        performedBy: approval.approvedBy,
        performedAt: timestamp,
        details: approval,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to approve commission',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  recordPayment: async (payment) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      // Update commission status
      await updateDoc(doc(db, 'commissions', payment.commissionId), {
        status: 'paid',
        paidBy: payment.paidBy,
        paidAt: timestamp,
        updatedAt: timestamp,
      });

      // Create payment record
      await setDoc(doc(collection(db, 'commission_payments')), {
        ...payment,
        paidAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(db, 'audit_logs')), {
        action: 'commission_paid',
        entityId: payment.commissionId,
        entityType: 'commission',
        performedBy: payment.paidBy,
        performedAt: timestamp,
        details: payment,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to record payment',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  calculateCommission: (commissionType, baseAmount, metadata) => {
    const config = COMMISSION_CONFIG[commissionType];
    let bonusAmount = 0;
    const calculationDetails: Commission['calculationDetails'] = {
      baseRate: config.baseRate,
      multipliers: [],
      deductions: [],
    };

    // Calculate base commission
    let totalAmount = baseAmount * config.baseRate;

    // Apply bonus thresholds if applicable
    if (config.bonusThresholds) {
      for (const threshold of config.bonusThresholds) {
        if (
          (commissionType === 'recruitment' && metadata.applicantCount && metadata.applicantCount >= threshold.threshold) ||
          (commissionType === 'deployment' && metadata.applicantCount && metadata.applicantCount >= threshold.threshold) ||
          (commissionType === 'retention' && metadata.retentionMonths && metadata.retentionMonths >= threshold.threshold)
        ) {
          calculationDetails.bonusRate = threshold.rate;
          bonusAmount = baseAmount * (threshold.rate - config.baseRate);
          break;
        }
      }
    }

    // Apply multipliers if applicable
    if (config.multipliers) {
      for (const multiplier of config.multipliers) {
        if (
          (multiplier.name === 'Urgent Placement' && metadata.placementDays && metadata.placementDays <= 30) ||
          (multiplier.name === 'High Value' && metadata.salary && metadata.salary >= 100000) ||
          (multiplier.name === 'Multiple Referrals' && metadata.referralCount && metadata.referralCount >= 3)
        ) {
          calculationDetails.multipliers?.push({
            name: multiplier.name,
            value: multiplier.value,
          });
          totalAmount *= multiplier.value;
          bonusAmount *= multiplier.value;
        }
      }
    }

    totalAmount += bonusAmount;

    return {
      baseAmount: baseAmount * config.baseRate,
      bonusAmount,
      totalAmount,
      calculationDetails,
    };
  },
}));
