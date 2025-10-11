import { firestore } from '../../config/firebase';
import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { BaseEntity } from '../../types/common';

export interface TransferRequest extends BaseEntity {
  applicantId: string;
  fromBranchId: string;
  toBranchId: string;
  requestedBy: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  documents: string[];
  approvedBy?: string;
  approvedAt?: Date;
  assignedOfficerId?: string;
  rejectionReason?: string;
}

export interface Transfer extends TransferRequest {
  history: TransferEvent[];
}

interface TransferEvent {
  type: 'request' | 'approve' | 'reject' | 'assign' | 'complete';
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
}

export class TransferService {
  private readonly transfersRef = collection(firestore, 'transfers');

  async initiateTransfer(data: Omit<TransferRequest, keyof BaseEntity | 'status'>): Promise<string> {
    try {
      // Validate branch and applicant existence
      const [fromBranch, toBranch] = await Promise.all([
        getDoc(doc(firestore, 'branches', data.fromBranchId)),
        getDoc(doc(firestore, 'branches', data.toBranchId)),
      ]);

      if (!fromBranch.exists() || !toBranch.exists()) {
        throw new Error('Invalid branch reference');
      }

      const transferRef = doc(this.transfersRef);
      const transfer: TransferRequest = {
        id: transferRef.id,
        ...data,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      };

      await setDoc(transferRef, transfer);

      // Create initial transfer event
      await this.addTransferEvent(transferRef.id, {
        type: 'request',
        userId: data.requestedBy,
        timestamp: new Date(),
        details: {
          reason: data.reason,
          documents: data.documents,
        },
      });

      return transferRef.id;
    } catch (error) {
      console.error('Error initiating transfer:', error);
      throw new Error('Failed to initiate transfer');
    }
  }

  async approveTransfer(id: string, approverId: string): Promise<void> {
    try {
      const transferRef = doc(this.transfersRef, id);
      const transferDoc = await getDoc(transferRef);

      if (!transferDoc.exists()) {
        throw new Error('Transfer not found');
      }

      const transfer = transferDoc.data() as TransferRequest;
      if (transfer.status !== 'pending') {
        throw new Error('Transfer is not in pending state');
      }

      await updateDoc(transferRef, {
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      });

      await this.addTransferEvent(id, {
        type: 'approve',
        userId: approverId,
        timestamp: new Date(),
        details: {},
      });
    } catch (error) {
      console.error('Error approving transfer:', error);
      throw new Error('Failed to approve transfer');
    }
  }

  async rejectTransfer(id: string, reason: string): Promise<void> {
    try {
      const transferRef = doc(this.transfersRef, id);
      const transferDoc = await getDoc(transferRef);

      if (!transferDoc.exists()) {
        throw new Error('Transfer not found');
      }

      const transfer = transferDoc.data() as TransferRequest;
      if (transfer.status !== 'pending') {
        throw new Error('Transfer is not in pending state');
      }

      await updateDoc(transferRef, {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date(),
      });

      await this.addTransferEvent(id, {
        type: 'reject',
        userId: transfer.requestedBy,
        timestamp: new Date(),
        details: { reason },
      });
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      throw new Error('Failed to reject transfer');
    }
  }

  async getTransferHistory(branchId: string): Promise<Transfer[]> {
    try {
      const transfersQuery = query(
        this.transfersRef,
        where('fromBranchId', '==', branchId)
      );
      const transfersSnapshot = await getDocs(transfersQuery);

      const transfers = await Promise.all(
        transfersSnapshot.docs.map(async (doc) => {
          const transfer = doc.data() as TransferRequest;
          const eventsSnapshot = await getDocs(
            collection(doc.ref, 'events')
          );
          const history = eventsSnapshot.docs.map(eventDoc => eventDoc.data() as TransferEvent);
          
          return {
            ...transfer,
            history,
          };
        })
      );

      return transfers;
    } catch (error) {
      console.error('Error getting transfer history:', error);
      throw new Error('Failed to get transfer history');
    }
  }

  private async addTransferEvent(transferId: string, event: TransferEvent): Promise<void> {
    try {
      const eventRef = doc(collection(firestore, 'transfers', transferId, 'events'));
      await setDoc(eventRef, event);
    } catch (error) {
      console.error('Error adding transfer event:', error);
      throw new Error('Failed to add transfer event');
    }
  }
}
