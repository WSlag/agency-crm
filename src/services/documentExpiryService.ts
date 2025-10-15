/**
 * Document Expiry Service
 * 
 * Handles document expiry checking and notification sending
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  addDoc 
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

interface ExpiringDocument {
  id: string;
  applicantId: string;
  type: string;
  fileName: string;
  expiryDate: Date;
  daysUntilExpiry: number;
}

class DocumentExpiryService {
  
  /**
   * Check for documents expiring in the next 30 days
   */
  async checkExpiringDocuments(): Promise<ExpiringDocument[]> {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    console.log('[DocumentExpiry] Checking for documents expiring before:', thirtyDaysFromNow);
    
    // Query documents with expiry dates in the next 30 days
    const docsRef = collection(firestore, 'documents');
    const q = query(
      docsRef,
      where('expiryDate', '>=', Timestamp.fromDate(today)),
      where('expiryDate', '<=', Timestamp.fromDate(thirtyDaysFromNow)),
      where('status', '==', 'verified') // Only check verified documents
    );
    
    const snapshot = await getDocs(q);
    
    const expiringDocs: ExpiringDocument[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const expiryDate = data.expiryDate?.toDate();
      
      if (expiryDate) {
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        expiringDocs.push({
          id: doc.id,
          applicantId: data.applicantId,
          type: data.type,
          fileName: data.fileName,
          expiryDate,
          daysUntilExpiry
        });
      }
    });
    
    console.log(`[DocumentExpiry] Found ${expiringDocs.length} expiring document(s)`);
    
    return expiringDocs;
  }
  
  /**
   * Send expiry notifications to relevant users
   */
  async sendExpiryNotifications(expiringDocs: ExpiringDocument[]): Promise<void> {
    const notificationsRef = collection(firestore, 'notifications');
    
    for (const doc of expiringDocs) {
      console.log(`[DocumentExpiry] Sending notification for document: ${doc.type} (expires in ${doc.daysUntilExpiry} days)`);
      
      // Create notification
      await addDoc(notificationsRef, {
        type: 'document_expiry',
        title: 'Document Expiring Soon',
        message: `${doc.type} for applicant will expire in ${doc.daysUntilExpiry} day(s) on ${doc.expiryDate.toLocaleDateString()}`,
        priority: doc.daysUntilExpiry <= 7 ? 'high' : 'medium',
        status: 'unread',
        data: {
          documentId: doc.id,
          applicantId: doc.applicantId,
          documentType: doc.type,
          expiryDate: doc.expiryDate,
          daysUntilExpiry: doc.daysUntilExpiry
        },
        recipients: ['admin'], // Send to all admins
        createdAt: Timestamp.now()
      });
    }
    
    console.log(`[DocumentExpiry] Sent ${expiringDocs.length} notification(s)`);
  }
  
  /**
   * Mark expired documents
   */
  async markExpiredDocuments(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('[DocumentExpiry] Checking for expired documents...');
    
    const docsRef = collection(firestore, 'documents');
    const q = query(
      docsRef,
      where('expiryDate', '<', Timestamp.fromDate(today)),
      where('status', '!=', 'expired')
    );
    
    const snapshot = await getDocs(q);
    
    console.log(`[DocumentExpiry] Found ${snapshot.size} expired document(s)`);
    
    // Update expired documents
    const updates = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      console.log(`[DocumentExpiry] Marking as expired: ${data.type} (expired on ${data.expiryDate?.toDate()?.toLocaleDateString()})`);
      
      // Update document status
      await import('firebase/firestore').then(({ doc, updateDoc }) => 
        updateDoc(doc(firestore, 'documents', docSnap.id), {
          status: 'expired',
          updatedAt: Timestamp.now()
        })
      );
      
      // Create notification about expired document
      await addDoc(collection(firestore, 'notifications'), {
        type: 'document_expired',
        title: 'Document Expired',
        message: `${data.type} for applicant has expired and needs renewal`,
        priority: 'high',
        status: 'unread',
        data: {
          documentId: docSnap.id,
          applicantId: data.applicantId,
          documentType: data.type,
          expiryDate: data.expiryDate?.toDate()
        },
        recipients: ['admin'],
        createdAt: Timestamp.now()
      });
    });
    
    await Promise.all(updates);
    
    console.log(`[DocumentExpiry] Marked ${updates.length} document(s) as expired`);
  }
  
  /**
   * Run daily expiry check (call this from a scheduled job/cron)
   */
  async runDailyExpiryCheck(): Promise<void> {
    try {
      console.log('[DocumentExpiry] Starting daily expiry check...');
      
      // Check and send notifications for expiring documents
      const expiringDocs = await this.checkExpiringDocuments();
      if (expiringDocs.length > 0) {
        await this.sendExpiryNotifications(expiringDocs);
      }
      
      // Mark expired documents
      await this.markExpiredDocuments();
      
      console.log('[DocumentExpiry] Daily expiry check completed');
    } catch (error) {
      console.error('[DocumentExpiry] Failed to run daily expiry check:', error);
      throw error;
    }
  }
}

export const documentExpiryService = new DocumentExpiryService();

