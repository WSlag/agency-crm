export type DocumentType = 
  | 'passport'
  | 'nbi_clearance'
  | 'barangay_cert'
  | 'medical_cert'
  | 'tesda_cert'
  | 'owwa'
  | 'employment_contract'
  | 'pdos'
  | 'plane_ticket';

export type DocumentStatus = 
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'expired';

export interface Document {
  id: string;
  applicantId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
  status: DocumentStatus;
  expiryDate?: Date;
  metadata?: Record<string, any>;
}

export interface DocumentUploadResponse {
  documentId: string;
  fileUrl: string;
  fileName: string;
}

export interface DocumentFilter {
  applicantId?: string;
  documentType?: DocumentType;
  status?: DocumentStatus;
  verifiedBy?: string;
  uploadedBy?: string;
  expiryDateFrom?: Date;
  expiryDateTo?: Date;
}

export interface DocumentSort {
  field: keyof Document;
  direction: 'asc' | 'desc';
}

export interface DocumentPagination {
  page: number;
  limit: number;
  total: number;
}

export interface DocumentVerification {
  documentId: string;
  verified: boolean;
  verifiedBy: string;
  verifiedAt: Date;
  notes?: string;
  rejectionReason?: string;
}

export interface DocumentHistory {
  id: string;
  documentId: string;
  action: 'uploaded' | 'verified' | 'rejected' | 'updated' | 'deleted';
  performedBy: string;
  performedAt: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  documentType: DocumentType;
  isActive: boolean;
  requiredFields: {
    name: string;
    type: 'text' | 'date' | 'number' | 'select';
    options?: string[];
    required: boolean;
    defaultValue?: any;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  passport: 'Passport',
  nbi_clearance: 'NBI Clearance',
  barangay_cert: 'Barangay Certificate',
  medical_cert: 'Medical Certificate',
  tesda_cert: 'TESDA Certificate',
  owwa: 'OWWA Certificate',
  employment_contract: 'Employment Contract',
  pdos: 'PDOS Certificate',
  plane_ticket: 'Plane Ticket'
};

export interface DocumentConfig {
  label: string;
  description: string;
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  expiryEnabled: boolean;
  requiredMetadata?: string[];
}

export const DOCUMENT_CONFIG: Record<DocumentType, DocumentConfig> = {
  passport: {
    label: 'Passport',
    description: 'Valid passport for international travel',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    expiryEnabled: true,
    requiredMetadata: ['passportNumber', 'issueDate', 'expiryDate']
  },
  nbi_clearance: {
    label: 'NBI Clearance',
    description: 'National Bureau of Investigation clearance certificate',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    expiryEnabled: true,
    requiredMetadata: ['clearanceNumber', 'issueDate']
  },
  barangay_cert: {
    label: 'Barangay Certificate',
    description: 'Certificate of residency from barangay',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    expiryEnabled: false,
  },
  medical_cert: {
    label: 'Medical Certificate',
    description: 'Medical examination certificate',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    expiryEnabled: true,
    requiredMetadata: ['facility', 'examinationDate', 'result']
  },
  tesda_cert: {
    label: 'TESDA Certificate',
    description: 'Technical Education and Skills Development Authority certificate',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    expiryEnabled: false,
    requiredMetadata: ['certificateNumber', 'courseCompleted']
  },
  owwa: {
    label: 'OWWA Certificate',
    description: 'Overseas Workers Welfare Administration certificate',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    expiryEnabled: false, // OWWA doesn't expire
    requiredMetadata: ['membershipNumber', 'issueDate']
  },
  employment_contract: {
    label: 'Employment Contract',
    description: 'Signed employment contract',
    maxFileSize: 15 * 1024 * 1024, // 15MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    expiryEnabled: false,
    requiredMetadata: ['employer', 'position', 'contractPeriod']
  },
  pdos: {
    label: 'PDOS Certificate',
    description: 'Pre-Departure Orientation Seminar certificate',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    expiryEnabled: false,
    requiredMetadata: ['certificateNumber', 'attendanceDate']
  },
  plane_ticket: {
    label: 'Plane Ticket',
    description: 'Flight ticket or e-ticket confirmation',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    expiryEnabled: false,
    requiredMetadata: ['flightNumber', 'departureDate', 'destination']
  }
};