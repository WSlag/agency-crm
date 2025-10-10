import { Expense } from './expense';
import { Commission } from './commission';
import { Applicant } from './applicant';
import { Agent } from './agent';
import { Branch } from './branch';

export type ReportType =
  | 'applicant'
  | 'commission'
  | 'expense'
  | 'deployment'
  | 'transfer'
  | 'agent'
  | 'branch'
  | 'officer';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export type ReportFormat = 'pdf' | 'excel' | 'csv';

export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  branchId?: string;
  agentId?: string;
  applicantId?: string;
  officerId?: string;
  status?: string;
  type?: string;
  period?: ReportPeriod;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  filters: ReportFilter;
  columns: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  filters: ReportFilter;
  format: ReportFormat;
  status: ReportStatus;
  fileUrl?: string;
  error?: string;
  generatedBy: string;
  generatedAt: Date;
}

export interface ReportMetric {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'no_change';
  trend?: number[];
}

export interface DashboardMetrics {
  applicants: {
    total: ReportMetric;
    pending: ReportMetric;
    deployed: ReportMetric;
    transferRequests: ReportMetric;
  };
  expenses: {
    total: ReportMetric;
    pending: ReportMetric;
    approved: ReportMetric;
    byType: { [key: string]: ReportMetric };
  };
  commissions: {
    total: ReportMetric;
    pending: ReportMetric;
    paid: ReportMetric;
    byType: { [key: string]: ReportMetric };
  };
  transfers: {
    total: ReportMetric;
    pending: ReportMetric;
    approved: ReportMetric;
    byBranch: { [key: string]: ReportMetric };
  };
  officers: {
    total: ReportMetric;
    activeAssignments: ReportMetric;
    averageWorkload: ReportMetric;
    byPerformance: { [key: string]: ReportMetric };
  };
}

export interface ApplicantReport {
  applicant: Applicant;
  agent?: Agent;
  branch: Branch;
  assignedOfficer?: string;
  expenses: Expense[];
  commissions: Commission[];
  documents: {
    type: string;
    status: string;
    uploadedAt: Date;
    verifiedAt?: Date;
  }[];
  timeline: {
    stage: string;
    enteredAt: Date;
    completedAt?: Date;
    duration: number;
  }[];
  transfer?: {
    requestedAt: Date;
    approvedAt?: Date;
    assignedAt?: Date;
    fromBranch: string;
    toBranch: string;
    assignedOfficer?: string;
  };
}

export interface CommissionReport {
  agent: Agent;
  branch: Branch;
  commissions: Commission[];
  summary: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    byType: { [key: string]: number };
    byMonth: { [key: string]: number };
  };
  performance: {
    applicantCount: number;
    deploymentRate: number;
    averageProcessingTime: number;
  };
}

export interface ExpenseReport {
  branch: Branch;
  expenses: Expense[];
  summary: {
    totalAmount: number;
    approvedAmount: number;
    pendingAmount: number;
    byType: { [key: string]: number };
    byMonth: { [key: string]: number };
  };
  applicantExpenses?: {
    applicantId: string;
    amount: number;
    expenses: Expense[];
  }[];
}

export interface TransferReport {
  branch: Branch;
  transfers: {
    applicantId: string;
    requestedAt: Date;
    approvedAt?: Date;
    assignedAt?: Date;
    assignedOfficer?: string;
    status: string;
    duration: number;
  }[];
  summary: {
    totalTransfers: number;
    approvedTransfers: number;
    pendingTransfers: number;
    averageApprovalTime: number;
    byOfficer: {
      officerId: string;
      assignedCount: number;
      averageProcessingTime: number;
    }[];
  };
}

export interface OfficerReport {
  officerId: string;
  name: string;
  metrics: {
    activeAssignments: number;
    completedAssignments: number;
    averageProcessingTime: number;
    deploymentRate: number;
  };
  applicants: {
    applicantId: string;
    status: string;
    assignedAt: Date;
    currentStage: string;
    duration: number;
  }[];
  performance: {
    byStage: {
      stage: string;
      averageTime: number;
      successRate: number;
    }[];
    byMonth: {
      month: string;
      assignmentCount: number;
      completionRate: number;
    }[];
  };
}

export interface DeploymentReport {
  summary: {
    totalDeployments: number;
    byCountry: { [key: string]: number };
    byEmployer: { [key: string]: number };
    byMonth: { [key: string]: number };
  };
  metrics: {
    averageProcessingTime: number;
    successRate: number;
    returnRate: number;
  };
  deployments: {
    applicantId: string;
    country: string;
    employer: string;
    deployedAt: Date;
    processingTime: number;
    status: string;
  }[];
}

export interface BranchReport {
  branch: Branch;
  metrics: {
    applicants: {
      total: number;
      active: number;
      deployed: number;
      transferred: number;
    };
    agents: {
      total: number;
      active: number;
      topPerformers: {
        agentId: string;
        applicantCount: number;
        commissionAmount: number;
      }[];
    };
    expenses: {
      total: number;
      approved: number;
      pending: number;
      byType: { [key: string]: number };
    };
    commissions: {
      total: number;
      paid: number;
      pending: number;
      byAgent: { [key: string]: number };
    };
    transfers: {
      total: number;
      approved: number;
      pending: number;
      averageTime: number;
    };
  };
  performance: {
    deploymentRate: number;
    processingTime: number;
    documentAccuracy: number;
    applicantSatisfaction: number;
  };
}

export interface ReportSchedule {
  id: string;
  name: string;
  description?: string;
  reportType: ReportType;
  template: ReportTemplate;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRunAt: Date;
  lastRunAt?: Date;
  recipients: string[];
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSchedule: boolean;
  canExport: boolean;
  allowedTypes: ReportType[];
  allowedFormats: ReportFormat[];
}
