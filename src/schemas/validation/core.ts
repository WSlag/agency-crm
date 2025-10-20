import { z } from 'zod';

// Shared validation patterns
const patterns = {
  phone: /^(\+?\d{1,4})?[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
};

// Shared validation messages
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  password: 'Password must contain at least 8 characters, one uppercase, one lowercase and one number',
  min: (field: string, length: number) => `${field} must be at least ${length} characters`,
  max: (field: string, length: number) => `${field} must not exceed ${length} characters`,
};

// Base schemas for reuse
export const baseSchemas = {
  id: z.string().min(1, messages.required),
  email: z.string().email(messages.email),
  phone: z.string().regex(patterns.phone, messages.phone),
  password: z.string().regex(patterns.password, messages.password),
  name: z.string().min(2, messages.min('Name', 2)).max(50, messages.max('Name', 50)),
  date: z.date(),
  status: z.enum(['active', 'inactive', 'pending', 'blocked']),
};

// User validation schema
export const userSchema = z.object({
  email: baseSchemas.email,
  password: baseSchemas.password,
  name: baseSchemas.name,
  role: z.enum(['admin', 'president', 'ho_recruitment_officer', 'ho_accountant', 'branch_manager']),
  branchId: z.string().optional(),
  status: baseSchemas.status,
});

// Branch validation schema
export const branchSchema = z.object({
  name: z.string().min(2, messages.min('Branch name', 2)).max(100, messages.max('Branch name', 100)),
  address: z.string().min(5, messages.min('Address', 5)).max(200, messages.max('Address', 200)),
  phone: baseSchemas.phone,
  isHeadOffice: z.boolean(),
  status: baseSchemas.status,
});

// Basic applicant validation schema
export const applicantSchema = z.object({
  fullName: baseSchemas.name,
  email: baseSchemas.email,
  phone: baseSchemas.phone,
  currentStage: z.enum(['interview', 'medical', 'processing', 'selected', 'deployed']),
  branchId: z.string(),
  agentId: z.string().optional(),
  status: baseSchemas.status,
});

// Expense validation schema
export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
  description: z.string().min(5, messages.min('Description', 5)).max(500, messages.max('Description', 500)),
  type: z.enum(['passport', 'travel', 'allowance', 'office', 'other']),
  applicantId: z.string().optional(),
  branchId: z.string(),
  receiptUrl: z.string().url().optional(),
});

// Commission validation schema
export const commissionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
  agentId: z.string(),
  applicantId: z.string(),
  branchId: z.string(),
  status: z.enum(['pending', 'verified', 'approved', 'rejected', 'paid']),
});
