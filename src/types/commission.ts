export type CommissionStatus = 
  | 'pending'
  | 'verified'
  | 'approved'
  | 'rejected'
  | 'paid';

export type CommissionType = 'standard' | 'medical' | 'deployed';

export interface Commission {
  id: string;
  agentId: string;
  applicantId: string;
  branchId: string;
  commissionType: CommissionType;
  amount: number;
  currency: string;
  status: CommissionStatus;
  requestedBy: string;
  requestedAt: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  paidAt?: Date;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionRule {
  stage: string;
  percentage: number;
  fixedAmount?: number;
  currency: string;
}

export interface CommissionConfig {
  name: string;
  baseRate: number;
  description: string;
  minAmount?: number;
  maxAmount?: number;
  rules: CommissionRule[];
}

export const COMMISSION_RULES: Record<string, CommissionRule> = {
  medical: {
    stage: 'medical',
    percentage: 20,
    currency: 'PHP'
  },
  deployed: {
    stage: 'deployed',
    percentage: 80,
    currency: 'PHP'
  }
};

export const COMMISSION_CONFIG: Record<CommissionType, CommissionConfig> = {
  standard: {
    name: 'Standard Commission',
    baseRate: 0.05,
    description: 'Basic commission rate for standard placements',
    rules: [
      {
        stage: 'processing',
        percentage: 30,
        currency: 'PHP'
      },
      {
        stage: 'deployed',
        percentage: 70,
        currency: 'PHP'
      }
    ]
  },
  medical: {
    name: 'Medical Placement',
    baseRate: 0.07,
    description: 'Enhanced rate for medical professional placements',
    minAmount: 5000,
    rules: [
      {
        stage: 'medical',
        percentage: 20,
        currency: 'PHP'
      },
      {
        stage: 'deployed',
        percentage: 80,
        currency: 'PHP'
      }
    ]
  },
  deployed: {
    name: 'Deployment Success',
    baseRate: 0.10,
    description: 'Full commission rate for successful deployments',
    rules: [
      {
        stage: 'deployed',
        percentage: 100,
        currency: 'PHP'
      }
    ]
  }
};