export type JobStatus = 'open' | 'closed' | 'filled' | 'cancelled';
export type JobType = 'full-time' | 'part-time' | 'contract';
export type ApplicationStatus = 'applied' | 'interview' | 'offered' | 'accepted' | 'rejected';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface Job {
  id: string;
  jobTitle: string;
  employerName: string;
  country: string;
  location: string;
  salaryRange: SalaryRange;
  jobType: JobType;
  requirements: string[];
  description: string;
  requiredSkills: string[];
  requiredCertifications: string[];
  status: JobStatus;
  openings: number;
  filled: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
}

export interface JobAssignment {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  assignedBy: string;
  assignedDate: Date;
  applicationStatus: ApplicationStatus;
  notes: string;
}

export interface CreateJobData {
  jobTitle: string;
  employerName: string;
  country: string;
  location: string;
  salaryRange: SalaryRange;
  jobType: JobType;
  requirements: string[];
  description: string;
  requiredSkills: string[];
  requiredCertifications: string[];
  openings: number;
  deadline?: Date;
}

export interface JobFilters {
  search: string;
  status: 'all' | JobStatus;
  country: string;
  jobType: 'all' | JobType;
}

export interface JobAnalytics {
  jobId: string;
  totalApplications: number;
  interviewCount: number;
  offeredCount: number;
  acceptedCount: number;
  rejectedCount: number;
  fillRate: number; // percentage
  averageTimeToFill?: number; // days
}

