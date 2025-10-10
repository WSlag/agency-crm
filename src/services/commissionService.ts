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
import { db } from '../config/firebase';
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
      const docRef = await addDoc(collection(db, this.COLLECTION), {
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
      const docRef = doc(db, this.COLLECTION, commissionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
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
        collection(db, this.COLLECTION),
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
        collection(db, this.COLLECTION),
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
      const docRef = doc(db, this.COLLECTION, commissionId);
      await updateDoc(docRef, {
        status,
        verifiedBy,
        verifiedAt: Timestamp.now(),
        notes
      });
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
      const docRef = doc(db, this.COLLECTION, commissionId);
      await updateDoc(docRef, {
        status: 'approved',
        approvedBy,
        approvedAt: Timestamp.now(),
        notes
      });
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
      const docRef = doc(db, this.COLLECTION, commissionId);
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
