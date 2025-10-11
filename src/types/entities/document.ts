import { BaseEntity } from '../common';

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

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface Document extends BaseEntity {
  type: DocumentType;
  applicantId: string;
  fileUrl: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  expiryDate?: Date;
  metadata?: {
    fileSize: number;
    mimeType: string;
    originalName: string;
    [key: string]: any;
  };
}
