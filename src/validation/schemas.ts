import { z } from 'zod';
import { DocumentType, VerificationStatus } from '../types/entities/document';
import { BranchType } from '../types/entities/branch';

export const userSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2),
  role: z.enum(['admin', 'president', 'ho_recruitment_officer', 'ho_accountant', 'branch_manager']),
  branchId: z.string().optional(),
  permissions: z.array(z.string())
});

export const branchSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['HEAD_OFFICE', 'BRANCH']),
  managers: z.array(z.string()),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string()
  }),
  metrics: z.object({
    applicantCount: z.number(),
    activeTransfers: z.number(),
    pendingDocuments: z.number(),
    completedPlacements: z.number(),
    revenue: z.number()
  })
});

export const documentSchema = z.object({
  type: z.enum([
    'passport',
    'nbi_clearance',
    'barangay_cert',
    'medical_cert',
    'tesda_cert',
    'owwa',
    'employment_contract',
    'pdos',
    'plane_ticket'
  ]),
  applicantId: z.string(),
  fileUrl: z.string().url(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected', 'expired']),
  verifiedBy: z.string().optional(),
  verifiedAt: z.date().optional(),
  expiryDate: z.date().optional(),
  metadata: z.object({
    fileSize: z.number(),
    mimeType: z.string(),
    originalName: z.string()
  }).optional()
});
