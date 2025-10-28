export interface PublicResume {
  id: string;
  fullName: string;
  age: number; // Age only, not birthdate for privacy
  nationality: string;
  gender: 'male' | 'female' | 'other';
  civilStatus: 'single' | 'married' | 'widowed' | 'divorced';

  // Job preferences
  positionApplied?: string;
  countryDestination?: string;
  preferredCountries: string[];
  preferredPositions: string[];
  // Removed: expectedSalary - protects negotiating position

  // Education
  education: Array<{
    level: string;
    course: string;
    school: string;
    yearCompleted: number;
  }>;

  // Work experience
  workExperience: Array<{
    company: string;
    position: string;
    location: string;
    startDate: Date;
    endDate: Date | null;
    isOverseas: boolean;
  }>;

  // Skills and qualifications
  skills: string[];
  certifications: string[];
  languages: Array<{
    language: string;
    proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
  }>;

  // Documents - Only professional ID photo
  photoUrl?: string; // 2x2 ID photo only
  // Removed: email - use inquiry form instead
  // Removed: fullBodyPhotoUrl - not necessary, privacy concern
  // Removed: passportCopyUrl - CRITICAL: never expose passport documents

  // Medical status - Generic only
  medicalResult: 'passed'; // Only status, no dates or details
  // Removed: medicalExaminationDate - sensitive health information

  // Metadata
  createdAt: Date;
  resumeVisible: boolean;
}

export interface AgencyInfo {
  id: string;
  agencyName: string;
  logoUrl: string;
  tagline?: string;
  about: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  licenseNumber?: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface EmployerInquiry {
  id: string;
  applicantId: string;
  applicantName: string;
  inquiryType: 'shortlist' | 'contact';

  // Employer details
  employerName: string;
  companyName: string;
  email: string;
  phone: string;
  country?: string;
  message?: string;

  // Metadata
  status: 'new' | 'contacted' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

export interface ResumeFilters {
  search?: string;
  countries?: string[];
  positions?: string[];
  skills?: string[];
  minAge?: number;
  maxAge?: number;
  gender?: 'male' | 'female' | 'other';
  civilStatus?: ('single' | 'married' | 'widowed' | 'divorced')[];
  experienceYears?: number;
  languages?: string[];
}

export interface GeneratedResume {
  applicant: PublicResume;
  agency: AgencyInfo;
  generatedAt: Date;
  sections: {
    personalInfo: boolean;
    education: boolean;
    experience: boolean;
    skills: boolean;
    languages: boolean;
    certifications: boolean;
  };
}
