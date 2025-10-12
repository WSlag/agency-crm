import { BaseEntity } from '../common';

export type BranchType = 'HEAD_OFFICE' | 'BRANCH';

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface BranchMetrics {
  applicantCount: number;
  activeTransfers: number;
  pendingDocuments: number;
  completedPlacements: number;
  revenue: number;
}

export interface Branch extends BaseEntity {
  name: string;
  type: BranchType;
  managers: string[];
  location: Location;
  metrics: BranchMetrics;
  active: boolean;
}
