import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { Commission, CommissionRule, COMMISSION_RULES } from '../types/commission';

export class CommissionService {
  private static COLLECTION = 'commissions';

  /**
   * Calculate commission amount
   */
  static calculateCommission(
    baseAmount: number,
    stage: string,
    currency: string = 'PHP'
  ): number {
    const rule = COMMISSION_RULES[stage];
    if (!rule) {
      throw new Error(`No commission rule found for stage: ${stage}`);
    }

    if (rule.fixedAmount) {
      return rule.fixedAmount;
    }

    return (baseAmount * rule.percentage) / 100;
  }

  /**
   * Request commission
   */
  static async requestCommission(
    agentId: string,
    applicantId: string,
    branchId: string,
    amount: number,
    requestedBy: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, this.COLLECTION), {
        agentId,
        applicantId,
        branchId,
        amount,
        currency: 'PHP', // Default currency
        status: 'pending',
        requestedBy,
        requestedAt: Timestamp.now(),
        metadata
      });

      return docRef.id;
    } catch (error) {
      console.error('Error requesting commission:', error);
      throw error;
    }
  }

  /**
   * Get commission by ID
   */
  static async getCommission(commissionId: string): Promise<Commission | null> {
    try {
      const docRef = doc(firestore, this.COLLECTION, commissionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : null,
        requestedAt: data.requestedAt?.toDate ? data.requestedAt.toDate() : data.requestedAt ? new Date(data.requestedAt) : null,
        verifiedAt: data.verifiedAt?.toDate ? data.verifiedAt.toDate() : data.verifiedAt ? new Date(data.verifiedAt) : null,
        approvedAt: data.approvedAt?.toDate ? data.approvedAt.toDate() : data.approvedAt ? new Date(data.approvedAt) : null,
        paidAt: data.paidAt?.toDate ? data.paidAt.toDate() : data.paidAt ? new Date(data.paidAt) : null,
        lastPaymentDate: data.lastPaymentDate?.toDate ? data.lastPaymentDate.toDate() : data.lastPaymentDate ? new Date(data.lastPaymentDate) : null,
      } as Commission;
    } catch (error) {
      console.error('Error getting commission:', error);
      throw error;
    }
  }

  /**
   * Get agent commissions
   */
  static async getAgentCommissions(agentId: string): Promise<Commission[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('agentId', '==', agentId),
        orderBy('requestedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Commission[];
    } catch (error) {
      console.error('Error getting agent commissions:', error);
      throw error;
    }
  }

  /**
   * Get branch commissions
   */
  static async getBranchCommissions(branchId: string): Promise<Commission[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('branchId', '==', branchId),
        orderBy('requestedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Commission[];
    } catch (error) {
      console.error('Error getting branch commissions:', error);
      throw error;
    }
  }

  /**
   * Verify commission
   */
  static async verifyCommission(
    commissionId: string,
    verifiedBy: string,
    status: 'verified' | 'rejected',
    notes?: string
  ): Promise<void> {
    try {
      const docRef = doc(firestore, this.COLLECTION, commissionId);
      const updateData: any = {
        status,
        verifiedBy,
        verifiedAt: Timestamp.now(),
      };
      
      // Only include notes if provided
      if (notes !== undefined && notes !== null && notes !== '') {
        updateData.notes = notes;
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error verifying commission:', error);
      throw error;
    }
  }

  /**
   * Approve commission
   */
  static async approveCommission(
    commissionId: string,
    approvedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      const docRef = doc(firestore, this.COLLECTION, commissionId);
      const updateData: any = {
        status: 'approved',
        approvedBy,
        approvedAt: Timestamp.now(),
      };
      
      // Only include notes if provided
      if (notes !== undefined && notes !== null && notes !== '') {
        updateData.notes = notes;
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error approving commission:', error);
      throw error;
    }
  }

  /**
   * Mark commission as paid
   */
  static async markAsPaid(commissionId: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.COLLECTION, commissionId);
      await updateDoc(docRef, {
        status: 'paid',
        paidAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking commission as paid:', error);
      throw error;
    }
  }
}
