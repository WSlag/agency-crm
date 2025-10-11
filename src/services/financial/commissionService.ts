import { firestore } from '../../config/firebase';
import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { BaseEntity } from '../../types/common';

export interface CommissionCalculation {
  applicantId: string;
  agentId: string;
  branchId: string;
  baseAmount: number;
  adjustments: {
    type: string;
    amount: number;
    reason: string;
  }[];
  totalAmount: number;
  currency: string;
}

export interface ApprovalData {
  approverId: string;
  approvedAt: Date;
  notes?: string;
}

export interface Commission extends BaseEntity {
  calculation: CommissionCalculation;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvalData?: ApprovalData;
  paymentData?: {
    paidAt: Date;
    transactionId: string;
    method: string;
  };
}

export interface CommissionHistory {
  agent: {
    id: string;
    totalCommissions: number;
    paidCommissions: number;
    pendingCommissions: number;
  };
  commissions: Commission[];
}

export class CommissionService {
  private readonly commissionsRef = collection(firestore, 'commissions');

  async calculateCommission(applicantId: string): Promise<CommissionCalculation> {
    try {
      // Get applicant details
      const applicantDoc = await getDoc(doc(firestore, 'applicants', applicantId));
      if (!applicantDoc.exists()) {
        throw new Error('Applicant not found');
      }

      const applicant = applicantDoc.data();
      const agentId = applicant.agentId;
      const branchId = applicant.branchId;

      // Get agent commission rate
      const agentDoc = await getDoc(doc(firestore, 'agents', agentId));
      if (!agentDoc.exists()) {
        throw new Error('Agent not found');
      }

      const agent = agentDoc.data();
      const baseRate = agent.commissionRate;

      // Calculate base commission
      const baseAmount = this.calculateBaseCommission(applicant, baseRate);

      // Calculate adjustments
      const adjustments = await this.calculateAdjustments(applicant, baseAmount);

      // Calculate total
      const totalAmount = baseAmount + adjustments.reduce((sum, adj) => sum + adj.amount, 0);

      return {
        applicantId,
        agentId,
        branchId,
        baseAmount,
        adjustments,
        totalAmount,
        currency: 'PHP', // Default currency
      };
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw new Error('Failed to calculate commission');
    }
  }

  async approveCommission(id: string, approverData: ApprovalData): Promise<void> {
    try {
      const commissionRef = doc(this.commissionsRef, id);
      const commissionDoc = await getDoc(commissionRef);

      if (!commissionDoc.exists()) {
        throw new Error('Commission not found');
      }

      const commission = commissionDoc.data() as Commission;
      if (commission.status !== 'pending') {
        throw new Error('Commission is not in pending state');
      }

      await updateDoc(commissionRef, {
        status: 'approved',
        approvalData: approverData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error approving commission:', error);
      throw new Error('Failed to approve commission');
    }
  }

  async trackCommissions(agentId: string): Promise<CommissionHistory> {
    try {
      const commissionsQuery = query(
        this.commissionsRef,
        where('calculation.agentId', '==', agentId)
      );
      const commissionsSnapshot = await getDocs(commissionsQuery);

      const commissions = commissionsSnapshot.docs.map(doc => doc.data() as Commission);
      
      // Calculate totals
      const totals = commissions.reduce(
        (acc, commission) => {
          acc.totalCommissions += commission.calculation.totalAmount;
          if (commission.status === 'paid') {
            acc.paidCommissions += commission.calculation.totalAmount;
          } else if (commission.status === 'pending' || commission.status === 'approved') {
            acc.pendingCommissions += commission.calculation.totalAmount;
          }
          return acc;
        },
        { totalCommissions: 0, paidCommissions: 0, pendingCommissions: 0 }
      );

      return {
        agent: {
          id: agentId,
          ...totals,
        },
        commissions,
      };
    } catch (error) {
      console.error('Error tracking commissions:', error);
      throw new Error('Failed to track commissions');
    }
  }

  private calculateBaseCommission(applicant: any, baseRate: number): number {
    // Implement commission calculation logic based on applicant status and base rate
    const baseSalary = applicant.expectedSalary?.amount || 0;
    return baseSalary * (baseRate / 100);
  }

  private async calculateAdjustments(applicant: any, baseAmount: number): Promise<{ type: string; amount: number; reason: string; }[]> {
    const adjustments = [];

    // Add performance bonus
    if (applicant.currentStage === 'deployed') {
      adjustments.push({
        type: 'performance_bonus',
        amount: baseAmount * 0.1, // 10% bonus for successful deployment
        reason: 'Successful deployment bonus',
      });
    }

    // Add quick placement bonus
    const processingTime = this.calculateProcessingTime(applicant);
    if (processingTime < 30) { // Less than 30 days
      adjustments.push({
        type: 'quick_placement',
        amount: baseAmount * 0.05, // 5% bonus for quick placement
        reason: 'Quick placement bonus',
      });
    }

    return adjustments;
  }

  private calculateProcessingTime(applicant: any): number {
    const startDate = new Date(applicant.createdAt);
    const endDate = applicant.deployedDate ? new Date(applicant.deployedDate) : new Date();
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }
}
