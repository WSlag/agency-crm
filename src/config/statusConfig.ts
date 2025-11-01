import { ApplicantStatus } from '../types/applicant';

/**
 * Status filter configuration
 * Maps UI filter options to the correct Firestore field and value
 */

export type StatusFilterField = 'status' | 'currentStatus';

export interface StatusFilterOption {
  id: string;
  label: string;
  field: StatusFilterField | null; // null for "All Status"
  value: string | null; // null for "All Status"
}

/**
 * All available status filter options
 * Each option specifies which field to query and what value to match
 */
export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  {
    id: 'all',
    label: 'All Status',
    field: null,
    value: null,
  },
  // Profile Status options (query 'status' field)
  {
    id: 'active',
    label: 'Active',
    field: 'status',
    value: 'active',
  },
  {
    id: 'inactive',
    label: 'Inactive',
    field: 'status',
    value: 'inactive',
  },
  {
    id: 'pending',
    label: 'Pending',
    field: 'status',
    value: 'pending',
  },
  {
    id: 'archived',
    label: 'Archived',
    field: 'status',
    value: 'archived',
  },
  {
    id: 'blacklisted',
    label: 'Blacklisted',
    field: 'status',
    value: 'blacklisted',
  },
  // Workflow Status options (query 'currentStatus' field)
  {
    id: 'pending_approval',
    label: 'Pending Approval',
    field: 'currentStatus',
    value: ApplicantStatus.PENDING_APPROVAL,
  },
  {
    id: 'approved',
    label: 'Approved',
    field: 'currentStatus',
    value: ApplicantStatus.APPROVED,
  },
  {
    id: 'rejected',
    label: 'Rejected',
    field: 'currentStatus',
    value: ApplicantStatus.REJECTED,
  },
  {
    id: 'withdrawn',
    label: 'Withdrawn',
    field: 'currentStatus',
    value: ApplicantStatus.WITHDRAWN,
  },
  {
    id: 'on_hold',
    label: 'On Hold',
    field: 'currentStatus',
    value: ApplicantStatus.ON_HOLD,
  },
  {
    id: 'deployed',
    label: 'Deployed',
    field: 'currentStatus',
    value: ApplicantStatus.DEPLOYED,
  },
];

/**
 * Get status filter option by ID
 */
export const getStatusFilterOption = (id: string): StatusFilterOption | undefined => {
  return STATUS_FILTER_OPTIONS.find(option => option.id === id);
};

/**
 * Get all status filter options
 */
export const getAllStatusFilterOptions = (): StatusFilterOption[] => {
  return STATUS_FILTER_OPTIONS;
};
