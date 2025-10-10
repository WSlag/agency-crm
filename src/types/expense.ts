export type ExpenseType =
  | 'passport'
  | 'travel'
  | 'allowance'
  | 'office'
  | 'medical'
  | 'training'
  | 'documentation'
  | 'other';

export type ExpenseStatus = 'pending' | 'verified' | 'approved' | 'rejected' | 'paid';

export type Currency = 'PHP' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD' | 'AED';

export interface Expense {
  id: string;
  applicantId: string | null;
  branchId: string;
  expenseType: ExpenseType;
  amount: number;
  currency: Currency;
  exchangeRate?: number;
  description: string;
  receiptUrl?: string;
  receiptNumber?: string;
  expenseDate: Date;
  enteredBy: string;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  paidBy: string | null;
  paidAt: Date | null;
  status: ExpenseStatus;
  notes: string;
  tags: string[];
  metadata: {
    category?: string;
    department?: string;
    project?: string;
    costCenter?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseVerification {
  id: string;
  expenseId: string;
  verifiedBy: string;
  verifiedAt: Date;
  status: 'verified' | 'rejected';
  notes: string;
  checklistItems: {
    id: string;
    name: string;
    checked: boolean;
    notes?: string;
  }[];
}

export interface ExpenseApproval {
  id: string;
  expenseId: string;
  approvedBy: string;
  approvedAt: Date;
  status: 'approved' | 'rejected';
  notes: string;
  conditions?: {
    name: string;
    value: any;
  }[];
}

export interface ExpensePayment {
  id: string;
  expenseId: string;
  amount: number;
  currency: Currency;
  exchangeRate?: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'credit_card';
  paymentReference?: string;
  paidBy: string;
  paidAt: Date;
  notes: string;
}

export interface ExpenseFilter {
  applicantId?: string;
  branchId?: string;
  expenseType?: ExpenseType;
  status?: ExpenseStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  currency?: Currency;
  tags?: string[];
}

export interface ExpenseSort {
  field: keyof Expense;
  direction: 'asc' | 'desc';
}

export interface ExpensePagination {
  page: number;
  limit: number;
  total: number;
}

export const EXPENSE_CONFIG: { [key in ExpenseType]: {
  name: string;
  requiresReceipt: boolean;
  requiresApplicant: boolean;
  maxAmount?: number;
  allowedCurrencies: Currency[];
  verificationChecklist: string[];
}} = {
  passport: {
    name: 'Passport Fees',
    requiresReceipt: true,
    requiresApplicant: true,
    maxAmount: 10000,
    allowedCurrencies: ['PHP'],
    verificationChecklist: [
      'Valid receipt attached',
      'Amount matches receipt',
      'Applicant details correct',
      'Receipt date valid',
    ],
  },
  travel: {
    name: 'Travel Expenses',
    requiresReceipt: true,
    requiresApplicant: false,
    allowedCurrencies: ['PHP', 'USD'],
    verificationChecklist: [
      'Valid receipt attached',
      'Amount matches receipt',
      'Travel dates valid',
      'Purpose specified',
    ],
  },
  allowance: {
    name: 'Staff Allowance',
    requiresReceipt: false,
    requiresApplicant: false,
    allowedCurrencies: ['PHP'],
    verificationChecklist: [
      'Staff details correct',
      'Allowance period specified',
      'Amount within policy',
    ],
  },
  office: {
    name: 'Office Expenses',
    requiresReceipt: true,
    requiresApplicant: false,
    allowedCurrencies: ['PHP'],
    verificationChecklist: [
      'Valid receipt attached',
      'Amount matches receipt',
      'Expense category specified',
      'Business purpose clear',
    ],
  },
  medical: {
    name: 'Medical Expenses',
    requiresReceipt: true,
    requiresApplicant: true,
    allowedCurrencies: ['PHP'],
    verificationChecklist: [
      'Valid medical receipt',
      'Amount matches receipt',
      'Medical facility details',
      'Treatment details provided',
    ],
  },
  training: {
    name: 'Training Expenses',
    requiresReceipt: true,
    requiresApplicant: true,
    allowedCurrencies: ['PHP', 'USD'],
    verificationChecklist: [
      'Valid receipt attached',
      'Training details provided',
      'Duration specified',
      'Provider information complete',
    ],
  },
  documentation: {
    name: 'Documentation Expenses',
    requiresReceipt: true,
    requiresApplicant: true,
    allowedCurrencies: ['PHP'],
    verificationChecklist: [
      'Valid receipt attached',
      'Document type specified',
      'Issuing authority noted',
      'Purpose clear',
    ],
  },
  other: {
    name: 'Other Expenses',
    requiresReceipt: true,
    requiresApplicant: false,
    allowedCurrencies: ['PHP', 'USD'],
    verificationChecklist: [
      'Valid receipt attached',
      'Purpose clearly specified',
      'Business justification',
      'Approval requirements met',
    ],
  },
};
