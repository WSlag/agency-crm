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
  Query,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import {
  Commission,
  CommissionType,
  CommissionStatus,
  COMMISSION_CONFIG,
} from '../types/commission';

interface CommissionFilter {
  agentId?: string;
  applicantId?: string;
  branchId?: string;
  commissionType?: CommissionType;
  status?: CommissionStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface CommissionSort {
  field: keyof Commission;
  direction: 'asc' | 'desc';
}

interface CommissionPagination {
  page: number;
  limit: number;
  total: number;
}

interface CommissionVerification {
  commissionId: string;
  verifiedBy: string;
  status: 'verified' | 'rejected';
  notes: string;
  checklistItems?: {
    id: string;
    name: string;
    checked: boolean;
    notes?: string;
  }[];
}

interface CommissionApproval {
  commissionId: string;
  approvedBy: string;
  status: 'approved' | 'rejected';
  notes: string;
  conditions?: {
    name: string;
    value: any;
  }[];
}

interface CommissionPayment {
  commissionId: string;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check';
  paymentReference?: string;
  paidBy: string;
  notes?: string;
}

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
  recordPartialPayment: (
    commissionId: string,
    amount: number,
    paidBy: string,
    paymentReference?: string,
    notes?: string
  ) => Promise<void>;

  // Commission Calculation
  calculateCommission: (
    commissionType: CommissionType,
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
    calculationDetails: {
      baseRate: number;
      multipliers?: Array<{
        name: string;
        value: number;
      }>;
      deductions?: Array<{
        name: string;
        value: number;
      }>;
      bonusRate?: number;
    };
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

      let q: Query<DocumentData> | CollectionReference<DocumentData> = collection(firestore, 'commissions');

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
      if (filter.dateRange) {
        q = query(
          q,
          where('createdAt', '>=', filter.dateRange.start),
          where('createdAt', '<=', filter.dateRange.end)
        );
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
      const commissions = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Log any commissions with missing required fields
        if (!data.commissionType || !data.status || data.amount === undefined) {
          console.warn('Commission with missing fields:', {
            id: doc.id,
            commissionType: data.commissionType,
            status: data.status,
            amount: data.amount,
            allData: data
          });
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : null,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : null,
        };
      }) as Commission[];

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
      const docRef = doc(firestore, 'commissions', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          selectedCommission: {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : null,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : null,
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
      const docRef = doc(collection(firestore, 'commissions'));
      const timestamp = serverTimestamp();

      const commissionData = {
        ...data,
        status: 'pending' as CommissionStatus,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await setDoc(docRef, commissionData);

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
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
      const docRef = doc(firestore, 'commissions', id);
      const timestamp = serverTimestamp();

      await updateDoc(docRef, {
        ...data,
        updatedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
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
      await deleteDoc(doc(firestore, 'commissions', id));

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
      await updateDoc(doc(firestore, 'commissions', verification.commissionId), {
        status: verification.status,
        verifiedBy: verification.verifiedBy,
        verifiedAt: timestamp,
        updatedAt: timestamp,
      });

      // Create verification record
      await setDoc(doc(collection(firestore, 'commission_verifications')), {
        ...verification,
        verifiedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
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

      // Get commission data first
      const commissionDoc = await getDoc(doc(firestore, 'commissions', commissionId));
      const commissionData = commissionDoc.data();

      await updateDoc(doc(firestore, 'commissions', commissionId), {
        status: 'rejected' as CommissionStatus,
        notes: reason,
        updatedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: 'commission_rejected',
        entityId: commissionId,
        entityType: 'commission',
        performedBy: 'system',
        performedAt: timestamp,
        details: {
          reason,
        },
      });

      // Send notifications
      if (commissionData) {
        try {
          const notificationsRef = collection(firestore, 'notifications');
          const recipients: string[] = [];

          // Notify the agent
          if (commissionData.agentId) {
            // Get agent's user ID (agents collection has userId field)
            const agentDoc = await getDoc(doc(firestore, 'agents', commissionData.agentId));
            if (agentDoc.exists()) {
              const agentData = agentDoc.data();
              // Try to find user by email
              const userQuery = query(
                collection(firestore, 'users'),
                where('email', '==', agentData.email)
              );
              const userSnapshot = await getDocs(userQuery);
              userSnapshot.docs.forEach(doc => recipients.push(doc.id));
            }
          }

          // Notify all admins
          const adminQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'admin')
          );
          const adminSnapshot = await getDocs(adminQuery);
          adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Notify branch manager if branchId exists
          if (commissionData.branchId) {
            const managerQuery = query(
              collection(firestore, 'users'),
              where('role', '==', 'branch_manager'),
              where('branchId', '==', commissionData.branchId)
            );
            const managerSnapshot = await getDocs(managerQuery);
            managerSnapshot.docs.forEach(doc => recipients.push(doc.id));
          }

          // Get applicant name
          let applicantName = 'Unknown Applicant';
          if (commissionData.applicantId) {
            const applicantDoc = await getDoc(doc(firestore, 'applicants', commissionData.applicantId));
            if (applicantDoc.exists()) {
              applicantName = applicantDoc.data().fullName || applicantName;
            }
          }

          // Create notifications
          const uniqueRecipients = [...new Set(recipients)];
          for (const recipientId of uniqueRecipients) {
            await addDoc(notificationsRef, {
              type: 'commission_rejected',
              title: 'Commission Rejected',
              body: `Commission for ${applicantName} has been rejected. Reason: ${reason}`,
              priority: 'high',
              status: 'unread',
              recipientId: recipientId,
              recipientEmail: '',
              icon: '❌',
              metadata: {
                commissionId,
                applicantName,
                amount: commissionData.amount,
                reason,
                commissionType: commissionData.commissionType,
              },
              createdAt: Timestamp.now(),
            });
          }

          console.log(`✅ Sent ${uniqueRecipients.length} notifications for commission rejection`);
        } catch (notifError) {
          console.error('Error sending commission rejection notifications:', notifError);
        }
      }
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

      // Get commission data first
      const commissionDoc = await getDoc(doc(firestore, 'commissions', approval.commissionId));
      const commissionData = commissionDoc.data();

      // Update commission status
      await updateDoc(doc(firestore, 'commissions', approval.commissionId), {
        status: approval.status,
        approvedBy: approval.approvedBy,
        approvedAt: timestamp,
        updatedAt: timestamp,
      });

      // Create approval record
      await setDoc(doc(collection(firestore, 'commission_approvals')), {
        ...approval,
        approvedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: 'commission_approved',
        entityId: approval.commissionId,
        entityType: 'commission',
        performedBy: approval.approvedBy,
        performedAt: timestamp,
        details: approval,
      });

      // Send notifications
      if (commissionData) {
        try {
          const notificationsRef = collection(firestore, 'notifications');
          const recipients: string[] = [];

          // Notify the agent
          if (commissionData.agentId) {
            const agentDoc = await getDoc(doc(firestore, 'agents', commissionData.agentId));
            if (agentDoc.exists()) {
              const agentData = agentDoc.data();
              const userQuery = query(
                collection(firestore, 'users'),
                where('email', '==', agentData.email)
              );
              const userSnapshot = await getDocs(userQuery);
              userSnapshot.docs.forEach(doc => recipients.push(doc.id));
            }
          }

          // Notify HO Accountant
          const accountantQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'ho_accountant')
          );
          const accountantSnapshot = await getDocs(accountantQuery);
          accountantSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Notify all admins
          const adminQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'admin')
          );
          const adminSnapshot = await getDocs(adminQuery);
          adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Get applicant name
          let applicantName = 'Unknown Applicant';
          if (commissionData.applicantId) {
            const applicantDoc = await getDoc(doc(firestore, 'applicants', commissionData.applicantId));
            if (applicantDoc.exists()) {
              applicantName = applicantDoc.data().fullName || applicantName;
            }
          }

          // Create notifications
          const uniqueRecipients = [...new Set(recipients)];
          for (const recipientId of uniqueRecipients) {
            await addDoc(notificationsRef, {
              type: 'commission_approved',
              title: 'Commission Approved',
              body: `Commission of ₱${commissionData.amount?.toLocaleString() || '0'} has been approved for ${applicantName}`,
              priority: 'high',
              status: 'unread',
              recipientId: recipientId,
              recipientEmail: '',
              icon: '✅',
              metadata: {
                commissionId: approval.commissionId,
                applicantName,
                amount: commissionData.amount,
                commissionType: commissionData.commissionType,
                approvedBy: approval.approvedBy,
              },
              createdAt: Timestamp.now(),
            });
          }

          console.log(`✅ Sent ${uniqueRecipients.length} notifications for commission approval`);
        } catch (notifError) {
          console.error('Error sending commission approval notifications:', notifError);
        }
      }
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

      // Get commission data first
      const commissionDoc = await getDoc(doc(firestore, 'commissions', payment.commissionId));
      const commissionData = commissionDoc.data();

      // Update commission status
      await updateDoc(doc(firestore, 'commissions', payment.commissionId), {
        status: 'paid' as CommissionStatus,
        paidBy: payment.paidBy,
        paidAt: timestamp,
        updatedAt: timestamp,
        paymentType: 'full',
        amountPaid: payment.amount,
        amountRemaining: 0,
        lastPaymentDate: timestamp,
      });

      // Create payment record
      await setDoc(doc(collection(firestore, 'commission_payments')), {
        ...payment,
        paidAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: 'commission_paid',
        entityId: payment.commissionId,
        entityType: 'commission',
        performedBy: payment.paidBy,
        performedAt: timestamp,
        details: payment,
      });

      // Send notifications
      if (commissionData) {
        try {
          const notificationsRef = collection(firestore, 'notifications');
          const recipients: string[] = [];

          // Notify the agent
          if (commissionData.agentId) {
            const agentDoc = await getDoc(doc(firestore, 'agents', commissionData.agentId));
            if (agentDoc.exists()) {
              const agentData = agentDoc.data();
              const userQuery = query(
                collection(firestore, 'users'),
                where('email', '==', agentData.email)
              );
              const userSnapshot = await getDocs(userQuery);
              userSnapshot.docs.forEach(doc => recipients.push(doc.id));
            }
          }

          // Notify HO Accountant
          const accountantQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'ho_accountant')
          );
          const accountantSnapshot = await getDocs(accountantQuery);
          accountantSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Notify all admins
          const adminQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'admin')
          );
          const adminSnapshot = await getDocs(adminQuery);
          adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Get applicant name
          let applicantName = 'Unknown Applicant';
          if (commissionData.applicantId) {
            const applicantDoc = await getDoc(doc(firestore, 'applicants', commissionData.applicantId));
            if (applicantDoc.exists()) {
              applicantName = applicantDoc.data().fullName || applicantName;
            }
          }

          // Create notifications
          const uniqueRecipients = [...new Set(recipients)];
          for (const recipientId of uniqueRecipients) {
            await addDoc(notificationsRef, {
              type: 'commission_paid',
              title: 'Commission Payment Processed',
              body: `Full payment of ₱${payment.amount?.toLocaleString() || '0'} has been processed for ${applicantName}`,
              priority: 'high',
              status: 'unread',
              recipientId: recipientId,
              recipientEmail: '',
              icon: '💰',
              metadata: {
                commissionId: payment.commissionId,
                applicantName,
                amount: payment.amount,
                paymentType: 'full',
                paymentReference: payment.paymentReference,
                paidBy: payment.paidBy,
              },
              createdAt: Timestamp.now(),
            });
          }

          console.log(`✅ Sent ${uniqueRecipients.length} notifications for commission payment`);
        } catch (notifError) {
          console.error('Error sending commission payment notifications:', notifError);
        }
      }
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

  recordPartialPayment: async (commissionId, amount, paidBy, paymentReference, notes) => {
    try {
      set({ loading: true, error: null });
      
      // Use Timestamp.now() for document updates (serverTimestamp for top-level fields only)
      const now = Timestamp.now();
      const timestamp = serverTimestamp();

      // Get current commission to calculate new balances
      const commissionRef = doc(firestore, 'commissions', commissionId);
      const commissionSnap = await getDoc(commissionRef);
      
      if (!commissionSnap.exists()) {
        throw new Error('Commission not found');
      }

      const commissionData = commissionSnap.data();
      const originalAmount = commissionData.amount;
      const currentPaid = commissionData.amountPaid || 0;
      const newTotalPaid = currentPaid + amount;
      const newRemaining = originalAmount - newTotalPaid;

      // Validate payment amount
      if (amount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }
      if (newTotalPaid > originalAmount) {
        throw new Error(`Payment amount exceeds remaining balance. Remaining: ${originalAmount - currentPaid}`);
      }

      // Get existing installments or initialize
      const existingInstallments = commissionData.installments || [];
      const installmentNumber = existingInstallments.length + 1;

      // Create new installment record (use Timestamp.now() for array fields)
      const newInstallment = {
        installmentNumber,
        amount,
        paidDate: now, // ✅ Fixed: Use Timestamp.now() instead of serverTimestamp()
        paidBy,
        paymentReference: paymentReference || `PAY-${installmentNumber}-${Date.now()}`,
        notes: notes || '',
      };

      // Determine new status
      const newStatus: CommissionStatus = newRemaining === 0 ? 'paid' : 'partially_paid';
      
      // Auto-approve if commission is still pending (for system-triggered commissions)
      const needsAutoApproval = commissionData.status === 'pending';

      // Update commission with partial payment
      await updateDoc(commissionRef, {
        status: newStatus,
        paymentType: 'partial',
        amountPaid: newTotalPaid,
        amountRemaining: newRemaining,
        lastPaymentDate: timestamp,
        installments: [...existingInstallments, newInstallment],
        updatedAt: timestamp,
        ...(newStatus === 'paid' ? { paidAt: timestamp, paidBy } : {}),
        // Auto-approve if pending
        ...(needsAutoApproval ? { 
          approvedBy: paidBy, 
          approvedAt: timestamp,
          approvalNotes: 'Auto-approved on first payment' 
        } : {}),
      });

      // Create payment record
      await setDoc(doc(collection(firestore, 'commission_payments')), {
        commissionId,
        amount,
        installmentNumber,
        paidBy,
        paymentReference: newInstallment.paymentReference,
        notes: notes || '',
        paidAt: timestamp,
        totalPaid: newTotalPaid,
        remaining: newRemaining,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: newStatus === 'paid' ? 'commission_paid_full' : 'commission_partial_payment',
        entityId: commissionId,
        entityType: 'commission',
        performedBy: paidBy,
        performedAt: timestamp,
        details: {
          installmentNumber,
          amount,
          totalPaid: newTotalPaid,
          remaining: newRemaining,
          paymentReference: newInstallment.paymentReference,
          notes,
          autoApproved: needsAutoApproval,
        },
      });

      // Refresh commissions after payment
      await get().fetchCommissions();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to record partial payment',
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
    const calculationDetails = {
      baseRate: config.baseRate,
      multipliers: [] as Array<{ name: string; value: number }>,
      deductions: [] as Array<{ name: string; value: number }>,
    };

    // Calculate base commission
    let totalAmount = baseAmount * config.baseRate;

    // Apply rules based on commission type
    for (const rule of config.rules) {
      if (
        (rule.stage === 'medical' && metadata.applicantCount && metadata.applicantCount >= 1) ||
        (rule.stage === 'deployed' && metadata.placementDays && metadata.placementDays <= 30)
      ) {
        const ruleAmount = (baseAmount * rule.percentage) / 100;
        totalAmount += ruleAmount;
        calculationDetails.multipliers.push({
          name: `${rule.stage} bonus`,
          value: rule.percentage / 100,
        });
      }
    }

    // Apply minimum amount if configured
    if (config.minAmount && totalAmount < config.minAmount) {
      totalAmount = config.minAmount;
      calculationDetails.multipliers.push({
        name: 'Minimum amount adjustment',
        value: config.minAmount / baseAmount,
      });
    }

    // Apply maximum amount if configured
    if (config.maxAmount && totalAmount > config.maxAmount) {
      const deduction = totalAmount - config.maxAmount;
      totalAmount = config.maxAmount;
      calculationDetails.deductions.push({
        name: 'Maximum amount cap',
        value: deduction,
      });
    }

    return {
      baseAmount: baseAmount * config.baseRate,
      bonusAmount,
      totalAmount,
      calculationDetails,
    };
  },
}));