import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { notificationService } from './NotificationService';

export interface ExpiryDocument {
  id: string;
  applicantId: string;
  applicantName: string;
  type: string;
  expiryDate: Date;
  status: 'active' | 'expired';
  branchId: string;
  notificationSent: boolean;
  lastNotificationDate?: Date;
}

class ExpiryService {
  private collection = collection(firestore, 'documents');

  async getExpiringDocuments(daysThreshold: number = 30): Promise<ExpiryDocument[]> {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + daysThreshold);

    const q = query(
      this.collection,
      where('expiryDate', '>=', Timestamp.fromDate(now)),
      where('expiryDate', '<=', Timestamp.fromDate(thresholdDate))
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate.toDate()
    })) as ExpiryDocument[];
  }

  async getExpiredDocuments(): Promise<ExpiryDocument[]> {
    const now = new Date();
    const q = query(
      this.collection,
      where('expiryDate', '<', Timestamp.fromDate(now))
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate.toDate()
    })) as ExpiryDocument[];
  }

  async sendExpiryNotification(document: ExpiryDocument): Promise<void> {
    const daysUntilExpiry = Math.ceil(
      (document.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    await notificationService.sendNotification({
      userId: document.applicantId,
      title: 'Document Expiry Notice',
      message: `Your ${document.type} will expire in ${daysUntilExpiry} days. Please take necessary action.`,
      type: 'expiry',
      priority: 'high',
      data: {
        documentId: document.id,
        documentType: document.type,
        expiryDate: document.expiryDate.toISOString()
      }
    });
  }
}

export const expiryService = new ExpiryService();
