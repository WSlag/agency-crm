export type CommissionStatus = 
  | 'pending'
  | 'verified'
  | 'approved'
  | 'rejected'
  | 'paid';

export interface Commission {
  id: string;
  agentId: string;
  applicantId: string;
  branchId: string;
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
}

export interface CommissionRule {
  stage: string;
  percentage: number;
  fixedAmount?: number;
  currency: string;
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