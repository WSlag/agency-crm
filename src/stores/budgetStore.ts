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
import type {
  Budget,
  CreateBudgetData,
  BudgetFilter,
  BudgetStats,
  BudgetStatus,
  BudgetAlert,
} from '../types/budget';

interface BudgetState {
  budgets: Budget[];
  selectedBudget: Budget | null;
  loading: boolean;
  error: string | null;
  stats: BudgetStats | null;
  alerts: BudgetAlert[];

  // Actions
  fetchBudgets: (filter?: BudgetFilter) => Promise<void>;
  fetchBudgetById: (id: string) => Promise<void>;
  createBudget: (data: CreateBudgetData, userId: string, userName: string) => Promise<string>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  updateBudgetSpent: (budgetId: string, amount: number) => Promise<void>;
  fetchBudgetStats: () => Promise<void>;
  fetchBudgetAlerts: () => Promise<void>;
  checkBudgetThresholds: (budgetId: string) => Promise<void>;
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

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  selectedBudget: null,
  loading: false,
  error: null,
  stats: null,
  alerts: [],

  fetchBudgets: async (filter?: BudgetFilter) => {
    try {
      set({ loading: true, error: null });
      let q = query(collection(firestore, 'budgets'), orderBy('createdAt', 'desc'));

      if (filter?.branchId) {
        q = query(q, where('branchId', '==', filter.branchId));
      }
      if (filter?.category) {
        q = query(q, where('category', '==', filter.category));
      }
      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }

      const snapshot = await getDocs(q);
      const budgets = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: convertTimestamp(data.startDate),
          endDate: convertTimestamp(data.endDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          remainingAmount: data.allocatedAmount - data.spentAmount,
        } as Budget;
      });

      set({ budgets, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch budgets',
        loading: false,
      });
    }
  },

  fetchBudgetById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'budgets', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          selectedBudget: {
            id: docSnap.id,
            ...data,
            startDate: convertTimestamp(data.startDate),
            endDate: convertTimestamp(data.endDate),
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            remainingAmount: data.allocatedAmount - data.spentAmount,
          } as Budget,
          loading: false,
        });
      } else {
        set({
          error: 'Budget not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch budget',
        loading: false,
      });
    }
  },

  createBudget: async (data: CreateBudgetData, userId: string, userName: string) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      const budgetData = {
        ...data,
        spentAmount: 0,
        remainingAmount: data.allocatedAmount,
        status: 'active' as BudgetStatus,
        createdBy: userId,
        createdByName: userName,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const docRef = await addDoc(collection(firestore, 'budgets'), budgetData);

      // Create alerts if provided
      if (data.alerts && data.alerts.length > 0) {
        const alertsPromises = data.alerts.map(alert =>
          addDoc(collection(firestore, 'budget_alerts'), {
            budgetId: docRef.id,
            threshold: alert.threshold,
            triggered: false,
            recipients: alert.recipients,
          })
        );
        await Promise.all(alertsPromises);
      }

      // Create audit log
      await addDoc(collection(firestore, 'audit_logs'), {
        action: 'budget_created',
        entityId: docRef.id,
        entityType: 'budget',
        performedBy: userId,
        performedAt: timestamp,
        details: {
          name: data.name,
          branchId: data.branchId,
          allocatedAmount: data.allocatedAmount,
          category: data.category,
        },
      });

      set({ loading: false });
      return docRef.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create budget',
        loading: false,
      });
      throw error;
    }
  },

  updateBudget: async (id: string, data: Partial<Budget>) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'budgets', id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      // Recalculate remaining amount if allocated or spent changed
      if (data.allocatedAmount !== undefined || data.spentAmount !== undefined) {
        const budget = get().budgets.find(b => b.id === id);
        if (budget) {
          const allocated = data.allocatedAmount ?? budget.allocatedAmount;
          const spent = data.spentAmount ?? budget.spentAmount;
          updateData.remainingAmount = allocated - spent;
        }
      }

      await updateDoc(docRef, updateData);

      // Update local state
      const { budgets } = get();
      set({
        budgets: budgets.map(budget =>
          budget.id === id ? { ...budget, ...data, updatedAt: new Date() } : budget
        ),
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update budget',
        loading: false,
      });
      throw error;
    }
  },

  deleteBudget: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(firestore, 'budgets', id));

      // Delete associated alerts
      const alertsQuery = query(
        collection(firestore, 'budget_alerts'),
        where('budgetId', '==', id)
      );
      const alertsSnapshot = await getDocs(alertsQuery);
      const deletePromises = alertsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Update local state
      const { budgets } = get();
      set({
        budgets: budgets.filter(budget => budget.id !== id),
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete budget',
        loading: false,
      });
      throw error;
    }
  },

  updateBudgetSpent: async (budgetId: string, amount: number) => {
    try {
      const budget = get().budgets.find(b => b.id === budgetId);
      if (!budget) {
        throw new Error('Budget not found');
      }

      const newSpentAmount = budget.spentAmount + amount;
      const newRemainingAmount = budget.allocatedAmount - newSpentAmount;

      await updateDoc(doc(firestore, 'budgets', budgetId), {
        spentAmount: newSpentAmount,
        remainingAmount: newRemainingAmount,
        updatedAt: serverTimestamp(),
      });

      // Check thresholds after updating
      await get().checkBudgetThresholds(budgetId);

      // Update local state
      const { budgets } = get();
      set({
        budgets: budgets.map(b =>
          b.id === budgetId
            ? { ...b, spentAmount: newSpentAmount, remainingAmount: newRemainingAmount }
            : b
        ),
      });
    } catch (error) {
      console.error('Failed to update budget spent:', error);
    }
  },

  fetchBudgetStats: async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'budgets'));
      const budgets = snapshot.docs.map(doc => doc.data() as Budget);

      const stats: BudgetStats = {
        total: budgets.length,
        active: budgets.filter(b => b.status === 'active').length,
        depleted: budgets.filter(b => b.status === 'depleted').length,
        expired: budgets.filter(b => b.status === 'expired').length,
        totalAllocated: budgets.reduce((sum, b) => sum + b.allocatedAmount, 0),
        totalSpent: budgets.reduce((sum, b) => sum + b.spentAmount, 0),
        totalRemaining: budgets.reduce((sum, b) => sum + b.remainingAmount, 0),
        byCategory: {} as any,
        byBranch: {} as any,
      };

      // Calculate by category
      ['branch', 'department', 'project', 'applicant', 'general'].forEach(category => {
        const categoryBudgets = budgets.filter(b => b.category === category);
        stats.byCategory[category as any] = {
          count: categoryBudgets.length,
          allocated: categoryBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0),
          spent: categoryBudgets.reduce((sum, b) => sum + b.spentAmount, 0),
          remaining: categoryBudgets.reduce((sum, b) => sum + b.remainingAmount, 0),
        };
      });

      // Calculate by branch
      const branchIds = [...new Set(budgets.map(b => b.branchId))];
      branchIds.forEach(branchId => {
        const branchBudgets = budgets.filter(b => b.branchId === branchId);
        stats.byBranch[branchId] = {
          count: branchBudgets.length,
          allocated: branchBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0),
          spent: branchBudgets.reduce((sum, b) => sum + b.spentAmount, 0),
          remaining: branchBudgets.reduce((sum, b) => sum + b.remainingAmount, 0),
        };
      });

      set({ stats });
    } catch (error) {
      console.error('Failed to fetch budget stats:', error);
    }
  },

  fetchBudgetAlerts: async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'budget_alerts'));
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        triggeredAt: doc.data().triggeredAt ? convertTimestamp(doc.data().triggeredAt) : undefined,
        notifiedAt: doc.data().notifiedAt ? convertTimestamp(doc.data().notifiedAt) : undefined,
      })) as BudgetAlert[];

      set({ alerts });
    } catch (error) {
      console.error('Failed to fetch budget alerts:', error);
    }
  },

  checkBudgetThresholds: async (budgetId: string) => {
    try {
      const budget = get().budgets.find(b => b.id === budgetId);
      if (!budget) return;

      const spentPercentage = (budget.spentAmount / budget.allocatedAmount) * 100;

      // Fetch alerts for this budget
      const alertsQuery = query(
        collection(firestore, 'budget_alerts'),
        where('budgetId', '==', budgetId)
      );
      const alertsSnapshot = await getDocs(alertsQuery);

      // Check each alert
      for (const alertDoc of alertsSnapshot.docs) {
        const alert = alertDoc.data() as BudgetAlert;
        
        if (spentPercentage >= alert.threshold && !alert.triggered) {
          // Trigger alert
          await updateDoc(alertDoc.ref, {
            triggered: true,
            triggeredAt: serverTimestamp(),
          });

          // Create notifications for recipients
          const notificationPromises = alert.recipients.map(recipientId =>
            addDoc(collection(firestore, 'notifications'), {
              type: 'budget_alert',
              recipientId,
              title: 'Budget Alert',
              body: `Budget "${budget.name}" has reached ${alert.threshold}% of allocated amount`,
              metadata: {
                budgetId: budget.id,
                budgetName: budget.name,
                threshold: alert.threshold,
                spentPercentage,
                allocatedAmount: budget.allocatedAmount,
                spentAmount: budget.spentAmount,
                remainingAmount: budget.remainingAmount,
              },
              channels: ['in-app', 'push', 'email'],
              read: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              status: 'active',
            })
          );

          await Promise.all(notificationPromises);
        }
      }
    } catch (error) {
      console.error('Failed to check budget thresholds:', error);
    }
  },

  clearError: () => set({ error: null }),
}));

