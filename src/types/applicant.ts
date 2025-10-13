export type ApplicantStage = 'interview' | 'medical' | 'processing' | 'deployment' | 'deployed';
export type ApplicationType = 'with_agent' | 'direct_hire';

export interface ApplicantDocument {
  id: string;
  applicantId: string;
  documentType: 'passport' | 'nbi_clearance' | 'barangay_cert' | 'medical_cert' | 'tesda_cert' | 'owwa' | 'employment_contract' | 'pdos' | 'plane_ticket';
  documentStage: ApplicantStage;
  fileUrl: string;
  uploadDate: Date;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  status: 'pending' | 'verified' | 'rejected';
}

export interface ApplicantPipeline {
  id: string;
  applicantId: string;
  stage: ApplicantStage;
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
  currentStage: ApplicantStage;
  transferredToHO: boolean;
  transferredDate: Date | null;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  
  // Personal Information
  dateOfBirth: Date;
  placeOfBirth: string;
  nationality: string;
  civilStatus: 'single' | 'married' | 'widowed' | 'divorced';
  gender: 'male' | 'female' | 'other';
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
}

export interface ApplicantFilter {
  searchTerm?: string;
  currentStage?: ApplicantStage;  // Changed from stage to match Applicant interface
  branchId?: string;
  agentId?: string;
  assignedOfficerId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: 'active' | 'inactive';
  transferredToHO?: boolean;
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
