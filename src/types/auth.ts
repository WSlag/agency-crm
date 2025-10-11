import { BaseEntity } from './common';

export type UserRole = 'admin' | 'president' | 'ho_recruitment_officer' | 'ho_accountant' | 'branch_manager';
export type VerificationLevel = 'none' | 'basic' | 'advanced' | 'full';
export type Permission = 'read' | 'write' | 'verify' | 'approve' | 'transfer' | 'manage_users' | 'manage_branches';

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

export interface UserProfile extends BaseEntity {
  email: string;
  displayName: string;
  role: UserRole;
  branchId?: string;
  permissions: Permission[];
  verificationAccess: VerificationLevel;
  preferences: UserPreferences;
}
