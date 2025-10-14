import type { Currency } from './expense';

export type BudgetCategory = 'branch' | 'department' | 'project' | 'applicant' | 'general';
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly';
export type BudgetStatus = 'active' | 'depleted' | 'expired' | 'suspended';

export interface Budget {
  id: string;
  name: string;
  description?: string;
  branchId: string;
  branchName?: string;
  category: BudgetCategory;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  currency: Currency;
  status: BudgetStatus;
  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    department?: string;
    project?: string;
    applicantId?: string;
    notes?: string;
  };
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  threshold: number; // percentage (e.g., 75, 90, 100)
  triggered: boolean;
  triggeredAt?: Date;
  notifiedAt?: Date;
  recipients: string[]; // user IDs
}

export interface CreateBudgetData {
  name: string;
  description?: string;
  branchId: string;
  category: BudgetCategory;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  allocatedAmount: number;
  currency: Currency;
  metadata?: Budget['metadata'];
  alerts?: {
    threshold: number;
    recipients: string[];
  }[];
}

export interface BudgetFilter {
  branchId?: string;
  category?: BudgetCategory;
  status?: BudgetStatus;
  period?: BudgetPeriod;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface BudgetStats {
  total: number;
  active: number;
  depleted: number;
  expired: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  byCategory: Record<BudgetCategory, {
    count: number;
    allocated: number;
    spent: number;
    remaining: number;
  }>;
  byBranch: Record<string, {
    count: number;
    allocated: number;
    spent: number;
    remaining: number;
  }>;
}

export interface BudgetExpense {
  budgetId: string;
  expenseId: string;
  amount: number;
  date: Date;
}

