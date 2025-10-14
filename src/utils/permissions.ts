/**
 * Permission Utility Functions
 * 
 * Client-side permission checks to prevent unauthorized Firestore operations
 * These work in conjunction with Firebase Security Rules for defense-in-depth
 */

import { firestore } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '../types/auth';

/**
 * Check if user can create communication for an applicant
 */
export const canCreateCommunication = async (
  applicantId: string,
  user: User
): Promise<boolean> => {
  try {
    // Admins and presidents can access all
    if (['admin', 'president'].includes(user.role)) {
      return true;
    }

    // Get applicant to check ownership
    const applicantDoc = await getDoc(doc(firestore, 'applicants', applicantId));
    if (!applicantDoc.exists()) {
      return false;
    }

    const applicant = applicantDoc.data();

    // HO Recruitment Officers can only access their assigned applicants
    if (user.role === 'ho_recruitment_officer') {
      return applicant.assignedRecruitmentOfficerId === user.uid;
    }

    // Branch Managers can access applicants in their branch
    if (user.role === 'branch_manager') {
      return applicant.branchId === user.branchId;
    }

    return false;
  } catch (error) {
    console.error('Error checking communication permission:', error);
    return false;
  }
};

/**
 * Check if user can create budget
 */
export const canCreateBudget = async (
  branchId: string,
  user: User
): Promise<boolean> => {
  // Only admins and HO accountants can create budgets
  if (['admin', 'ho_accountant'].includes(user.role)) {
    return true;
  }

  return false;
};

/**
 * Check if user can update budget
 */
export const canUpdateBudget = async (
  budgetId: string,
  user: User
): Promise<boolean> => {
  // Admins, presidents, and HO accountants can update budgets
  if (['admin', 'president', 'ho_accountant'].includes(user.role)) {
    return true;
  }

  return false;
};

/**
 * Check if user can read budget
 */
export const canReadBudget = async (
  branchId: string,
  user: User
): Promise<boolean> => {
  // Admins, presidents, and HO accountants can read all budgets
  if (['admin', 'president', 'ho_accountant'].includes(user.role)) {
    return true;
  }

  // Branch managers can read their branch budgets
  if (user.role === 'branch_manager' && user.branchId === branchId) {
    return true;
  }

  return false;
};

/**
 * Check if user can create job
 */
export const canCreateJob = (user: User): boolean => {
  return ['admin', 'president', 'ho_recruitment_officer'].includes(user.role);
};

/**
 * Check if user can update job
 */
export const canUpdateJob = (user: User): boolean => {
  return ['admin', 'president', 'ho_recruitment_officer'].includes(user.role);
};

/**
 * Check if user can create transfer
 */
export const canCreateTransfer = async (
  fromBranchId: string,
  user: User
): Promise<boolean> => {
  // Branch managers can only create transfers from their own branch
  if (user.role === 'branch_manager') {
    return user.branchId === fromBranchId;
  }

  // Admins can create any transfer
  return user.role === 'admin';
};

/**
 * Check if user can approve transfer
 */
export const canApproveTransfer = (user: User): boolean => {
  return ['admin', 'president'].includes(user.role);
};

/**
 * Check if user can read transfer
 */
export const canReadTransfer = async (
  transfer: { fromBranchId: string; toBranchId: string; assignedOfficerId?: string },
  user: User
): Promise<boolean> => {
  // Admins and presidents can read all
  if (['admin', 'president'].includes(user.role)) {
    return true;
  }

  // Branch managers can read transfers involving their branch
  if (user.role === 'branch_manager') {
    return (
      user.branchId === transfer.fromBranchId ||
      user.branchId === transfer.toBranchId
    );
  }

  // HO Recruitment Officers can read transfers they're assigned to
  if (user.role === 'ho_recruitment_officer' && transfer.assignedOfficerId) {
    return transfer.assignedOfficerId === user.uid;
  }

  return false;
};

/**
 * Check if user can create expense
 */
export const canCreateExpense = async (
  applicantId: string,
  user: User
): Promise<boolean> => {
  // Admins and HO accountants can create any expense
  if (['admin', 'ho_accountant'].includes(user.role)) {
    return true;
  }

  // Branch managers can create expenses for applicants in their branch
  if (user.role === 'branch_manager') {
    const applicantDoc = await getDoc(doc(firestore, 'applicants', applicantId));
    if (!applicantDoc.exists()) return false;
    return applicantDoc.data().branchId === user.branchId;
  }

  return false;
};

/**
 * Check if user can update expense
 */
export const canUpdateExpense = (user: User): boolean => {
  return ['admin', 'president', 'ho_accountant'].includes(user.role);
};

/**
 * Check if user can create notification
 */
export const canCreateNotification = (user: User): boolean => {
  // Any authenticated user can create notifications
  // But they should only be able to create for themselves or their subordinates
  return true;
};

/**
 * Check if user can update applicant
 */
export const canUpdateApplicant = async (
  applicantId: string,
  user: User
): Promise<boolean> => {
  // Admins can update any applicant
  if (user.role === 'admin') {
    return true;
  }

  const applicantDoc = await getDoc(doc(firestore, 'applicants', applicantId));
  if (!applicantDoc.exists()) return false;

  const applicant = applicantDoc.data();

  // Branch managers can update applicants in their branch
  if (user.role === 'branch_manager' && applicant.branchId === user.branchId) {
    return true;
  }

  // HO Recruitment Officers can update their assigned applicants
  if (
    user.role === 'ho_recruitment_officer' &&
    applicant.assignedRecruitmentOfficerId === user.uid
  ) {
    return true;
  }

  return false;
};

/**
 * Check if user can create document
 */
export const canCreateDocument = async (
  applicantId: string,
  user: User
): Promise<boolean> => {
  // Admins can create any document
  if (user.role === 'admin') {
    return true;
  }

  const applicantDoc = await getDoc(doc(firestore, 'applicants', applicantId));
  if (!applicantDoc.exists()) return false;

  const applicant = applicantDoc.data();

  // Branch managers can create documents for applicants in their branch
  if (user.role === 'branch_manager' && applicant.branchId === user.branchId) {
    return true;
  }

  // HO Recruitment Officers can create documents for their assigned applicants
  if (
    user.role === 'ho_recruitment_officer' &&
    applicant.assignedRecruitmentOfficerId === user.uid
  ) {
    return true;
  }

  return false;
};

/**
 * Check if user can verify document
 */
export const canVerifyDocument = (user: User): boolean => {
  return ['admin', 'ho_recruitment_officer'].includes(user.role);
};

/**
 * Check if user can create report
 */
export const canCreateReport = (user: User): boolean => {
  // All authenticated users can create reports
  return true;
};

/**
 * Check if user can share report
 */
export const canShareReport = (reportOwnerId: string, user: User): boolean => {
  // Users can share their own reports, or admins can share any report
  return user.uid === reportOwnerId || user.role === 'admin';
};

/**
 * Generic permission error
 */
export class PermissionDeniedError extends Error {
  constructor(action: string, resource: string) {
    super(`Permission denied: Cannot ${action} ${resource}`);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Assert permission or throw error
 */
export const assertPermission = (
  hasPermission: boolean,
  action: string,
  resource: string
): void => {
  if (!hasPermission) {
    throw new PermissionDeniedError(action, resource);
  }
};

