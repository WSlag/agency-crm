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