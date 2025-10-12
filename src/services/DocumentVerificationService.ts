import { collection, doc, getDocs, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { notificationService } from './NotificationService';

export interface Document {
  id: string;
  applicantId: string;
  applicantName: string;
  type: string;
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  branchId: string;
}

class DocumentVerificationService {
  private collection = collection(firestore, 'documents');

  async getPendingDocuments(branchId?: string): Promise<Document[]> {
    let q = query(
      this.collection,
      where('status', '==', 'pending')
    );

    if (branchId) {
      q = query(q, where('branchId', '==', branchId));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt.toDate(),
      verifiedAt: doc.data().verifiedAt?.toDate()
    })) as Document[];
  }

  async verifyDocument(
    documentId: string,
    verifiedBy: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<void> {
    const docRef = doc(this.collection, documentId);
    const now = new Date();

    await updateDoc(docRef, {
      status: approved ? 'verified' : 'rejected',
      verifiedBy,
      verifiedAt: Timestamp.fromDate(now),
      rejectionReason: rejectionReason || null
    });

    // Send notification to applicant
    const document = (await getDocs(query(this.collection, where('id', '==', documentId)))).docs[0];
    if (document) {
      const data = document.data();
      await notificationService.sendNotification({
        userId: data.applicantId,
        title: `Document ${approved ? 'Verified' : 'Rejected'}`,
        message: approved
          ? `Your ${data.type} has been verified successfully.`
          : `Your ${data.type} was rejected. Reason: ${rejectionReason}`,
        type: 'document_verification',
        priority: 'high',
        data: {
          documentId,
          documentType: data.type,
          status: approved ? 'verified' : 'rejected'
        }
      });
    }
  }
}

export const documentVerificationService = new DocumentVerificationService();
