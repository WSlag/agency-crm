import { firestore, storage } from '../../config/firebase';
import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { BaseEntity } from '../../types/common';

export interface ExpenseSubmission {
  applicantId?: string;
  branchId: string;
  type: 'passport' | 'travel' | 'allowance' | 'office' | 'other';
  amount: number;
  currency: string;
  description: string;
  receipt?: File;
  receiptNumber?: string;
  metadata?: Record<string, any>;
}

export interface VerifierData {
  verifierId: string;
  verifiedAt: Date;
  notes?: string;
}

export interface ApprovalData {
  approverId: string;
  approvedAt: Date;
  notes?: string;
}

export interface Expense extends BaseEntity {
  applicantId?: string;
  branchId: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  receiptUrl?: string;
  receiptNumber?: string;
  metadata?: Record<string, any>;
  verificationData?: VerifierData;
  approvalData?: ApprovalData;
  status: 'pending' | 'verified' | 'approved' | 'rejected' | 'paid';
}

export class ExpenseService {
  private readonly expensesRef = collection(firestore, 'expenses');

  async submitExpense(data: ExpenseSubmission): Promise<string> {
    try {
      let receiptUrl: string | undefined;

      // Upload receipt if provided
      if (data.receipt) {
        const receiptRef = ref(storage, `receipts/${data.branchId}/${Date.now()}_${data.receipt.name}`);
        await uploadBytes(receiptRef, data.receipt);
        receiptUrl = await getDownloadURL(receiptRef);
      }

      const expenseRef = doc(this.expensesRef);
      const expense: Expense = {
        id: expenseRef.id,
        ...data,
        receiptUrl,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      };

      await setDoc(expenseRef, expense);

      // Create expense audit trail
      await this.addExpenseEvent(expenseRef.id, {
        type: 'submission',
        userId: 'system', // Should be replaced with actual user ID
        timestamp: new Date(),
        details: {
          type: data.type,
          amount: data.amount,
          currency: data.currency,
        },
      });

      return expenseRef.id;
    } catch (error) {
      console.error('Error submitting expense:', error);
      throw new Error('Failed to submit expense');
    }
  }

  async verifyExpense(id: string, verifierData: VerifierData): Promise<void> {
    try {
      const expenseRef = doc(this.expensesRef, id);
      const expenseDoc = await getDoc(expenseRef);

      if (!expenseDoc.exists()) {
        throw new Error('Expense not found');
      }

      const expense = expenseDoc.data() as Expense;
      if (expense.status !== 'pending') {
        throw new Error('Expense is not in pending state');
      }

      await updateDoc(expenseRef, {
        status: 'verified',
        verificationData: verifierData,
        updatedAt: new Date(),
      });

      await this.addExpenseEvent(id, {
        type: 'verification',
        userId: verifierData.verifierId,
        timestamp: verifierData.verifiedAt,
        details: {
          notes: verifierData.notes,
        },
      });
    } catch (error) {
      console.error('Error verifying expense:', error);
      throw new Error('Failed to verify expense');
    }
  }

  async approveExpense(id: string, approverData: ApprovalData): Promise<void> {
    try {
      const expenseRef = doc(this.expensesRef, id);
      const expenseDoc = await getDoc(expenseRef);

      if (!expenseDoc.exists()) {
        throw new Error('Expense not found');
      }

      const expense = expenseDoc.data() as Expense;
      if (expense.status !== 'verified') {
        throw new Error('Expense is not in verified state');
      }

      await updateDoc(expenseRef, {
        status: 'approved',
        approvalData: approverData,
        updatedAt: new Date(),
      });

      await this.addExpenseEvent(id, {
        type: 'approval',
        userId: approverData.approverId,
        timestamp: approverData.approvedAt,
        details: {
          notes: approverData.notes,
        },
      });
    } catch (error) {
      console.error('Error approving expense:', error);
      throw new Error('Failed to approve expense');
    }
  }

  private async addExpenseEvent(expenseId: string, event: {
    type: string;
    userId: string;
    timestamp: Date;
    details: Record<string, any>;
  }): Promise<void> {
    try {
      const eventRef = doc(collection(firestore, 'expenses', expenseId, 'events'));
      await setDoc(eventRef, event);
    } catch (error) {
      console.error('Error adding expense event:', error);
      throw new Error('Failed to add expense event');
    }
  }
}
