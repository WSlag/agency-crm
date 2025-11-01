// Applicant Stage Enum - Recruitment Pipeline Flow
export enum ApplicantStage {
  REGISTRATION = 'registration',
  INTERVIEW = 'interview',
  MEDICAL = 'medical',
  TRANSFER = 'transfer',
  PROCESSING = 'processing',
  SELECTED = 'selected',
  DEPLOYED = 'deployed'
}

// Applicant Status Enum - Current State
export enum ApplicantStatus {
  ACTIVE = 'active',                    // Currently progressing
  PENDING_APPROVAL = 'pending_approval', // Waiting for stage approval
  APPROVED = 'approved',                 // Stage advancement approved
  REJECTED = 'rejected',                 // Stage advancement rejected (terminal)
  WITHDRAWN = 'withdrawn',               // Applicant withdrew (terminal)
  ON_HOLD = 'on_hold',                  // Temporarily paused
  DEPLOYED = 'deployed'                  // Successfully deployed (terminal)
}

// Legacy type alias for backward compatibility
export type ApplicantStageLegacy = 'interview' | 'medical' | 'processing' | 'selected' | 'deployed';
export type ApplicationType = 'with_agent' | 'direct_hire';

// Document Type Enum
export enum DocumentType {
  PASSPORT = 'passport',
  NBI_CLEARANCE = 'nbi_clearance',
  BARANGAY_CERT = 'barangay_cert',
  MEDICAL_CERT = 'medical_cert',
  TESDA_CERT = 'tesda_cert',
  OWWA = 'owwa',
  EMPLOYMENT_CONTRACT = 'employment_contract',
  PDOS = 'pdos',
  PLANE_TICKET = 'plane_ticket'
}

export interface ApplicantDocument {
  id: string;
  applicantId: string;
  documentType: 'passport' | 'nbi_clearance' | 'barangay_cert' | 'medical_cert' | 'tesda_cert' | 'owwa' | 'employment_contract' | 'pdos' | 'plane_ticket';
  documentStage: ApplicantStageLegacy;
  fileUrl: string;
  uploadDate: Date;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  status: 'pending' | 'verified' | 'rejected';
}

export interface ApplicantPipeline {
  id: string;
  applicantId: string;
  stage: ApplicantStageLegacy;
  enteredDate: Date;
  completedDate: Date | null;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface ApplicantTransfer {
  id: string;
  applicantId: string;
  fromBranchId: string;
  toBranchId: string;
  requestedBy: string;
  approvedBy: string | null;
  assignedOfficerId: string | null;
  transferReason: string;
  transferStatus: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedDate: Date;
  approvedDate: Date | null;
  completedDate: Date | null;
  notes: string;
  rejectionReason?: string;
}

export interface Applicant {
  id: string;
  fullName: string;
  contactInfo: string;
  email: string;
  agentId: string | null;
  branchId: string;
  assignedRecruitmentOfficerId: string | null;
  applicationType: ApplicationType;
  currentStage: ApplicantStageLegacy;
  transferredToHO: boolean;
  transferredDate: Date | null;
  status: 'active' | 'inactive' | 'pending' | 'archived' | 'blacklisted';
  createdAt: Date;
  updatedAt: Date;
  
  // New stage management fields
  currentStageEnum?: ApplicantStage; // New enum-based stage field
  currentStatus?: ApplicantStatus; // New status field
  stageEnteredAt?: Date;
  stageCompletedAt?: Date | null;
  requiresApproval?: boolean;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  rejectionReason?: string;
  
  // Commission tracking
  commissionMedicalTriggered?: boolean;
  commissionMedicalTriggeredAt?: Date | null;
  commissionDeploymentTriggered?: boolean;
  commissionDeploymentTriggeredAt?: Date | null;
  
  // Personal Information
  dateOfBirth: Date;
  placeOfBirth: string;
  nationality: string;
  civilStatus: 'single' | 'married' | 'widowed' | 'divorced';
  gender: 'male' | 'female' | 'other';
  positionApplied?: string;
  countryDestination?: string;
  address: {
    present: string;
    permanent: string;
  };
  
  // Job Preferences
  preferredCountries: string[];
  preferredPositions: string[];
  expectedSalary: {
    amount: number;
    currency: string;
  };
  
  // Skills and Qualifications
  education: {
    level: string;
    course: string;
    school: string;
    yearCompleted: number;
  }[];
  workExperience: {
    company: string;
    position: string;
    location: string;
    startDate: Date;
    endDate: Date | null;
    isOverseas: boolean;
  }[];
  skills: string[];
  certifications: string[];
  languages: {
    language: string;
    proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
  }[];
  
  // Medical Information
  medicalStatus: {
    examination: {
      date: Date | null;
      result: 'pending' | 'passed' | 'failed' | null;
      facility: string;
    };
    conditions: string[];
    allergies: string[];
    vaccinations: {
      name: string;
      date: Date;
    }[];
  };
  
  // Deployment Information
  deployment: {
    employer: string | null;
    position: string | null;
    country: string | null;
    contractPeriod: number | null; // in months
    salary: {
      amount: number | null;
      currency: string | null;
    };
    startDate: Date | null;
    endDate: Date | null;
    status: 'pending' | 'processing' | 'deployed' | 'completed' | 'cancelled' | null;
  };
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    contactNumber: string;
    address: string;
  };
  
  // Employer Details (Selected Stage) - Visible only to assigned HO Officer, Admin, President
  employerDetails?: {
    fraName: string | null;           // Foreign Recruitment Agency
    employerName: string | null;
    employerAddress: string | null;
    employerContactNumber: string | null;
    addedBy: string | null;           // User ID who added these details
    addedAt: Date | null;
  };

  // Resume Visibility (Public Employer Portal)
  resumeVisible?: boolean;           // If true, resume is visible on public employer portal
  photoUrl?: string;                 // 2x2 ID photo URL
  fullBodyPhotoUrl?: string;         // Full body photo URL
  passportCopyUrl?: string;          // Passport copy document URL
}

export interface ApplicantFilter {
  searchTerm?: string;
  currentStage?: ApplicantStageLegacy;  // Changed from stage to match Applicant interface
  branchId?: string;
  agentId?: string;
  assignedOfficerId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: 'active' | 'inactive' | 'pending' | 'archived' | 'blacklisted' | 'pending_approval' | 'approved' | 'rejected' | 'withdrawn' | 'on_hold' | 'deployed';
  transferredToHO?: boolean;
  currentStatus?: ApplicantStatus; // New filter for current status
  requiresApproval?: boolean; // Filter for pending approvals
  statusFilterId?: string; // Status filter option ID from statusConfig
}

export interface ApplicantSort {
  field: keyof Applicant;
  direction: 'asc' | 'desc';
}

export interface ApplicantPagination {
  page: number;
  limit: number;
  total: number;
}

// ==================== Stage Management Types ====================

/**
 * Document requirement for a specific stage
 */
export interface DocumentRequirement {
  type: DocumentType;
  required: boolean;
  alternatives?: DocumentType[]; // e.g., Passport OR NBI OR Barangay
  description: string;
}

/**
 * Stage configuration including document requirements and approvers
 */
export interface StageRequirement {
  stage: ApplicantStage;
  documents: DocumentRequirement[];
  approvers: string[]; // User roles that can approve this stage
  commissionTrigger?: 'medical' | 'deployed';
  autoAdvance: boolean; // If true, advances automatically when docs verified
}

/**
 * Stage transition request
 */
export interface StageTransition {
  applicantId: string;
  fromStage: ApplicantStage;
  toStage: ApplicantStage;
  initiatedBy: string; // user_id
  requiresApproval: boolean;
  notes?: string;
}

/**
 * Stage approval/rejection
 */
export interface StageApproval {
  applicantId: string;
  stage: ApplicantStage;
  approvedBy: string; // user_id
  approved: boolean;
  rejectionReason?: string;
  assignedOfficerId?: string; // For transfer stage - HO officer assignment
}

/**
 * Stage history record
 */
export interface StageHistory {
  id: string;
  applicantId: string;
  branchId: string;
  fromStage: ApplicantStage | null;
  toStage: ApplicantStage;
  changedBy: string;
  changedAt: Date;
  approvalRequired: boolean;
  approvedBy: string | null;
  approvedAt: Date | null;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  notes?: string;
}

/**
 * Status change log record
 */
export interface StatusChangeLog {
  id: string;
  applicantId: string;
  fromStatus: ApplicantStatus | string;
  toStatus: ApplicantStatus | string;
  reason: string;
  changedBy: string;
  changedAt: Date;
  statusType: 'profile' | 'workflow'; // Distinguishes between status and currentStatus fields
}

// Registration form data type - omits server-generated fields
export type ApplicantRegistrationData = Omit<
  Applicant,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'currentStageEnum'
  | 'currentStatus'
  | 'stageEnteredAt'
  | 'stageCompletedAt'
  | 'requiresApproval'
  | 'approvedBy'
  | 'approvedAt'
  | 'rejectionReason'
  | 'commissionMedicalTriggered'
  | 'commissionMedicalTriggeredAt'
  | 'commissionDeploymentTriggered'
  | 'commissionDeploymentTriggeredAt'
>;
