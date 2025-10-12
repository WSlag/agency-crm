export type UserRole = 'admin' | 'president' | 'ho_recruitment_officer' | 'ho_accountant' | 'branch_manager';

export interface CustomClaims {
  role: UserRole;
  branchId?: string | null;
}