export interface Agent {
  id: string;
  agentName: string;
  email: string;
  contactNumber: string;
  address: string;
  branchId: string;
  commissionRate: number; // percentage
  licenseNumber?: string;
  licenseExpiry?: Date;
  status: 'active' | 'inactive' | 'suspended';
  totalApplicants?: number;
  deployedApplicants?: number;
  totalCommissions?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentPerformance {
  agentId: string;
  totalApplicants: number;
  activeApplicants: number;
  deployedApplicants: number;
  totalCommissionsEarned: number;
  pendingCommissions: number;
  paidCommissions: number;
  averageProcessingDays: number;
  successRate: number; // percentage
  monthlyStats: MonthlyAgentStats[];
}

export interface MonthlyAgentStats {
  month: string;
  year: number;
  applicants: number;
  deployed: number;
  commissionsEarned: number;
}

export interface CreateAgentData {
  agentName: string;
  email: string;
  contactNumber: string;
  address: string;
  branchId: string;
  commissionRate: number;
  licenseNumber?: string;
  licenseExpiry?: Date;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface AgentFilters {
  search: string;
  branchId: string;
  status: 'all' | 'active' | 'inactive' | 'suspended';
}

