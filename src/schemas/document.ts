import { z } from 'zod';
import { DocumentType, DocumentStatus, DOCUMENT_CONFIG } from '../types/document';

// Helper function to validate file size
const validateFileSize = (file: File, maxSize: number) => {
  return file.size <= maxSize;
};

// Helper function to validate file type
const validateFileType = (file: File, allowedTypes: string[]) => {
  return allowedTypes.includes(file.type);
};

// Document upload schema
export const documentUploadSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  documentType: z.string(),
  file: z.instanceof(File).optional(),
  expiryDate: z.union([z.date(), z.string()]).optional().nullable(),
  metadata: z.object({
    issuedBy: z.string().min(1, 'Issued by is required'),
    issuedAt: z.string().min(1, 'Issue date is required'),
    documentNumber: z.string().min(1, 'Document number is required'),
  }).passthrough(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  notes: z.string().optional(),
});

// Document verification schema
export const documentVerificationSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  status: z.enum(['verified', 'rejected'] as const),
  notes: z.string().optional(),
  checklistItems: z.array(
    z.object({
      id: z.string(),
      checked: z.boolean(),
      notes: z.string().optional(),
    })
  ),
});

// Document template schema
export const documentTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters'),
  description: z.string().optional(),
  documentType: z.enum(Object.keys(DOCUMENT_CONFIG) as [DocumentType, ...DocumentType[]]),
  isActive: z.boolean(),
  requiredFields: z.array(
    z.object({
      name: z.string().min(1, 'Field name is required'),
      type: z.enum(['text', 'date', 'number', 'select']),
      options: z.array(z.string()).optional(),
      required: z.boolean(),
      defaultValue: z.any().optional(),
    })
  ),
});

// Document filter schema
export const documentFilterSchema = z.object({
  applicantId: z.string().optional(),
  documentType: z
    .enum(Object.keys(DOCUMENT_CONFIG) as [DocumentType, ...DocumentType[]])
    .optional(),
  status: z.enum(['pending', 'verified', 'rejected', 'expired'] as const).optional(),
  verifiedBy: z.string().optional(),
  uploadDateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
  expiryDateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
});

// Document update schema
export const documentUpdateSchema = z.object({
  expiryDate: z.date().optional().nullable(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'verified', 'rejected', 'expired'] as const).optional(),
});

// Document template field schema
export const documentTemplateFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['text', 'date', 'number', 'select', 'checkbox']),
  label: z.string().min(1, 'Field label is required'),
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      required: z.boolean().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
});
