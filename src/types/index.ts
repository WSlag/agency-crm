export type UserRole = 'admin' | 'president' | 'ho_recruitment_officer' | 'ho_accountant' | 'branch_manager';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  branchId: string | null;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  branchName: string;
  branchCode: string;
  address: string;
  contactInfo: string;
  isHeadOffice: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Agent {
  id: string;
  agentName: string;
  contactInfo: string;
  branchId: string;
  commissionAmount: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Applicant {
  id: string;
  fullName: string;
  contactInfo: string;
  email: string;
  agentId: string | null;
  branchId: string;
  assignedRecruitmentOfficerId: string | null;
  applicationType: 'with_agent' | 'direct_hire';
  currentStage: 'interview' | 'medical' | 'processing' | 'deployment' | 'deployed';
  transferredToHO: boolean;
  transferredDate: Date | null;
  status: 'active' | 'inactive';
  createdAt: Date;
}
