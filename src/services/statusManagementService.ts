import { doc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { ApplicantStatus, StatusChangeLog } from '../types/applicant';
import { notificationService } from './NotificationService';

export interface UserWithRole {
  uid: string;
  email: string | null;
  role: string;
  branchId?: string;
}

/**
 * Status Management Service
 * Handles direct workflow status changes (On Hold, Withdrawn, Resume)
 * Separate from stage-based workflow in stageService.ts
 */
export class StatusManagementService {
  /**
   * Put an applicant on hold
   * Updates currentStatus to 'on_hold' and logs the change
   */
  static async setApplicantOnHold(
    applicantId: string,
    reason: string,
    user: UserWithRole
  ): Promise<void> {
    if (!reason || reason.trim().length === 0) {
      throw new Error('Reason is required to put applicant on hold');
    }

    try {
      const applicantRef = doc(firestore, 'applicants', applicantId);

      // Update applicant currentStatus
      await updateDoc(applicantRef, {
        currentStatus: ApplicantStatus.ON_HOLD,
        updatedAt: Timestamp.now(),
      });

      // Log the status change
      await this.logStatusChange({
        applicantId,
        fromStatus: ApplicantStatus.ACTIVE, // Assuming from active
        toStatus: ApplicantStatus.ON_HOLD,
        reason,
        changedBy: user.uid,
        statusType: 'workflow',
      });

      // Create notification
      await notificationService.sendNotification({
        type: 'system',
        priority: 'medium',
        channels: ['in-app'],
        title: 'Applicant Put On Hold',
        message: `Applicant has been put on hold. Reason: ${reason}`,
        recipientId: user.uid,
        read: false,
        data: {
          applicantId,
          action: 'on_hold',
          actionUrl: `/applicants/${applicantId}`,
        },
      });

      console.log(`Applicant ${applicantId} put on hold by ${user.email}`);
    } catch (error) {
      console.error('Error setting applicant on hold:', error);
      throw new Error('Failed to put applicant on hold');
    }
  }

  /**
   * Mark an applicant as withdrawn
   * Updates currentStatus to 'withdrawn' (terminal state) and logs the change
   */
  static async markApplicantWithdrawn(
    applicantId: string,
    reason: string,
    user: UserWithRole
  ): Promise<void> {
    if (!reason || reason.trim().length === 0) {
      throw new Error('Reason is required to mark applicant as withdrawn');
    }

    try {
      const applicantRef = doc(firestore, 'applicants', applicantId);

      // Update applicant currentStatus
      await updateDoc(applicantRef, {
        currentStatus: ApplicantStatus.WITHDRAWN,
        updatedAt: Timestamp.now(),
      });

      // Log the status change
      await this.logStatusChange({
        applicantId,
        fromStatus: ApplicantStatus.ACTIVE, // Assuming from active
        toStatus: ApplicantStatus.WITHDRAWN,
        reason,
        changedBy: user.uid,
        statusType: 'workflow',
      });

      // Create notification
      await notificationService.sendNotification({
        type: 'system',
        priority: 'high',
        channels: ['in-app'],
        title: 'Applicant Withdrawn',
        message: `Applicant has been marked as withdrawn. Reason: ${reason}`,
        recipientId: user.uid,
        read: false,
        data: {
          applicantId,
          action: 'withdrawn',
          actionUrl: `/applicants/${applicantId}`,
        },
      });

      console.log(`Applicant ${applicantId} marked as withdrawn by ${user.email}`);
    } catch (error) {
      console.error('Error marking applicant as withdrawn:', error);
      throw new Error('Failed to mark applicant as withdrawn');
    }
  }

  /**
   * Resume an applicant from on-hold status
   * Updates currentStatus back to 'active' and logs the change
   */
  static async resumeApplicant(
    applicantId: string,
    user: UserWithRole
  ): Promise<void> {
    try {
      const applicantRef = doc(firestore, 'applicants', applicantId);

      // Update applicant currentStatus back to active
      await updateDoc(applicantRef, {
        currentStatus: ApplicantStatus.ACTIVE,
        updatedAt: Timestamp.now(),
      });

      // Log the status change
      await this.logStatusChange({
        applicantId,
        fromStatus: ApplicantStatus.ON_HOLD,
        toStatus: ApplicantStatus.ACTIVE,
        reason: 'Resumed processing',
        changedBy: user.uid,
        statusType: 'workflow',
      });

      // Create notification
      await notificationService.sendNotification({
        type: 'system',
        priority: 'medium',
        channels: ['in-app'],
        title: 'Applicant Resumed',
        message: `Applicant processing has been resumed`,
        recipientId: user.uid,
        read: false,
        data: {
          applicantId,
          action: 'resumed',
          actionUrl: `/applicants/${applicantId}`,
        },
      });

      console.log(`Applicant ${applicantId} resumed by ${user.email}`);
    } catch (error) {
      console.error('Error resuming applicant:', error);
      throw new Error('Failed to resume applicant');
    }
  }

  /**
   * Log a status change to the status_change_logs collection
   * Creates an audit trail for all manual status changes
   */
  private static async logStatusChange(log: Omit<StatusChangeLog, 'id' | 'changedAt'>): Promise<void> {
    try {
      const statusChangeLogsRef = collection(firestore, 'status_change_logs');

      await addDoc(statusChangeLogsRef, {
        ...log,
        changedAt: Timestamp.now(),
      });

      console.log('Status change logged:', log);
    } catch (error) {
      console.error('Error logging status change:', error);
      // Don't throw - logging failure shouldn't block the status change
    }
  }
}
