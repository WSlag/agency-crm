import { z } from 'zod';
import { EXPENSE_CONFIG } from '../types/expense';
import { COMMISSION_CONFIG } from '../types/commission';

// Helper function to validate currency amount
const validateAmount = (amount: number) => amount > 0;

// Helper function to validate exchange rate
const validateExchangeRate = (rate: number | undefined) => {
  if (rate === undefined) return true;
  return rate > 0;
};

// Expense Schemas
export const expenseSchema = z.object({
  applicantId: z.string().nullable(),
  branchId: z.string(),
  expenseType: z.enum(Object.keys(EXPENSE_CONFIG) as [keyof typeof EXPENSE_CONFIG, ...Array<keyof typeof EXPENSE_CONFIG>]),
  amount: z.number().refine(validateAmount, 'Amount must be greater than 0'),
  currency: z.enum(['PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']),
  exchangeRate: z.number().optional().refine(validateExchangeRate, 'Exchange rate must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  receiptUrl: z.string().url().optional(),
  receiptNumber: z.string().optional(),
  expenseDate: z.date(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const expenseVerificationSchema = z.object({
  expenseId: z.string(),
  status: z.enum(['verified', 'rejected']),
  notes: z.string().optional(),
  checklistItems: z.array(
    z.object({
      id: z.string(),
      checked: z.boolean(),
      notes: z.string().optional(),
    })
  ),
});

export const expenseApprovalSchema = z.object({
  expenseId: z.string(),
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
  conditions: z
    .array(
      z.object({
        name: z.string(),
        value: z.any(),
      })
    )
    .optional(),
});

export const expensePaymentSchema = z.object({
  expenseId: z.string(),
  amount: z.number().refine(validateAmount, 'Amount must be greater than 0'),
  currency: z.enum(['PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']),
  exchangeRate: z.number().optional().refine(validateExchangeRate, 'Exchange rate must be greater than 0'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'check', 'credit_card']),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

// Commission Schemas
export const commissionSchema = z.object({
  agentId: z.string(),
  applicantId: z.string(),
  branchId: z.string(),
  commissionType: z.enum(Object.keys(COMMISSION_CONFIG) as [keyof typeof COMMISSION_CONFIG, ...Array<keyof typeof COMMISSION_CONFIG>]),
  baseAmount: z.number().refine(validateAmount, 'Base amount must be greater than 0'),
  bonusAmount: z.number().optional(),
  totalAmount: z.number().refine(validateAmount, 'Total amount must be greater than 0'),
  currency: z.enum(['PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']),
  exchangeRate: z.number().optional().refine(validateExchangeRate, 'Exchange rate must be greater than 0'),
  calculationDetails: z.object({
    baseRate: z.number(),
    bonusRate: z.number().optional(),
    multipliers: z
      .array(
        z.object({
          name: z.string(),
          value: z.number(),
        })
      )
      .optional(),
    deductions: z
      .array(
        z.object({
          name: z.string(),
          amount: z.number(),
        })
      )
      .optional(),
  }),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const commissionVerificationSchema = z.object({
  commissionId: z.string(),
  status: z.enum(['verified', 'rejected']),
  notes: z.string().optional(),
  checklistItems: z.array(
    z.object({
      id: z.string(),
      checked: z.boolean(),
      notes: z.string().optional(),
    })
  ),
});

export const commissionApprovalSchema = z.object({
  commissionId: z.string(),
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
  adjustments: z
    .array(
      z.object({
        name: z.string(),
        amount: z.number(),
        reason: z.string(),
      })
    )
    .optional(),
});

export const commissionPaymentSchema = z.object({
  commissionId: z.string(),
  amount: z.number().refine(validateAmount, 'Amount must be greater than 0'),
  currency: z.enum(['PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']),
  exchangeRate: z.number().optional().refine(validateExchangeRate, 'Exchange rate must be greater than 0'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'check']),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

// Filter Schemas
export const expenseFilterSchema = z.object({
  applicantId: z.string().optional(),
  branchId: z.string().optional(),
  expenseType: z.enum(Object.keys(EXPENSE_CONFIG) as [keyof typeof EXPENSE_CONFIG, ...Array<keyof typeof EXPENSE_CONFIG>]).optional(),
  status: z.enum(['pending', 'verified', 'approved', 'rejected', 'paid']).optional(),
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
  amountRange: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  currency: z.enum(['PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']).optional(),
  tags: z.array(z.string()).optional(),
});

export const commissionFilterSchema = z.object({
  agentId: z.string().optional(),
  applicantId: z.string().optional(),
  branchId: z.string().optional(),
  commissionType: z.enum(Object.keys(COMMISSION_CONFIG) as [keyof typeof COMMISSION_CONFIG, ...Array<keyof typeof COMMISSION_CONFIG>]).optional(),
  status: z.enum(['pending', 'verified', 'approved', 'rejected', 'paid']).optional(),
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
  amountRange: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  currency: z.enum(['PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']).optional(),
});
