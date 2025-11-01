import { Applicant } from '../types/applicant';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

/**
 * Check if an applicant is ready for portal visibility
 * Requirements:
 * - Medical status is 'passed'
 * - All 3 photos are uploaded (2x2, full body, passport)
 * - Status is 'active'
 */
export const isApplicantReadyForPortal = (applicant: Applicant): boolean => {
  const hasMedicalPassed = applicant.medicalStatus?.examination?.result === 'passed';
  const hasAllPhotos = Boolean(
    applicant.photoUrl &&
    applicant.fullBodyPhotoUrl &&
    applicant.passportCopyUrl
  );
  const isActive = applicant.status === 'active';

  return hasMedicalPassed && hasAllPhotos && isActive;
};

/**
 * Check which photos are missing for an applicant
 */
export const getMissingPhotos = (applicant: Applicant): string[] => {
  const missing: string[] = [];

  if (!applicant.photoUrl) missing.push('2x2 ID Photo');
  if (!applicant.fullBodyPhotoUrl) missing.push('Full Body Photo');
  if (!applicant.passportCopyUrl) missing.push('Passport Copy');

  return missing;
};

/**
 * Check if applicant passed medical but is missing photos
 */
export const needsPhotoUpload = (applicant: Applicant): boolean => {
  const hasMedicalPassed = applicant.medicalStatus?.examination?.result === 'passed';
  const missingPhotos = getMissingPhotos(applicant);

  return hasMedicalPassed && missingPhotos.length > 0;
};

/**
 * Send notification to admins when applicant is ready for approval
 */
export const notifyReadyForApproval = async (applicant: Applicant): Promise<void> => {
  try {
    const notificationsRef = collection(firestore, 'notifications');
    const recipients: string[] = [];

    // Get all admin users
    const adminQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'admin')
    );
    const adminSnapshot = await getDocs(adminQuery);
    adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

    // Get all president users
    const presidentQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'president')
    );
    const presidentSnapshot = await getDocs(presidentQuery);
    presidentSnapshot.docs.forEach(doc => recipients.push(doc.id));

    // Create notifications for all recipients
    for (const recipientId of recipients) {
      await addDoc(notificationsRef, {
        type: 'resume_pending_approval',
        title: 'Resume Ready for Approval',
        body: `${applicant.fullName} has passed medical and uploaded all photos. Ready for portal approval.`,
        priority: 'medium',
        status: 'unread',
        recipientId: recipientId,
        recipientEmail: '',
        icon: '✅',
        metadata: {
          applicantId: applicant.id,
          applicantName: applicant.fullName,
          applicantEmail: applicant.email,
          position: applicant.positionApplied,
          country: applicant.countryDestination,
        },
        createdAt: Timestamp.now(),
      });
    }

    console.log(`✅ Sent ${recipients.length} notifications for resume approval: ${applicant.fullName}`);
  } catch (error) {
    console.error('Error sending ready-for-approval notifications:', error);
    // Don't throw - notification failures shouldn't block the main operation
  }
};

/**
 * Send notification to admins when applicant needs photos
 */
export const notifyMissingPhotos = async (applicant: Applicant): Promise<void> => {
  try {
    const notificationsRef = collection(firestore, 'notifications');
    const recipients: string[] = [];
    const missingPhotos = getMissingPhotos(applicant);

    // Get all admin users
    const adminQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'admin')
    );
    const adminSnapshot = await getDocs(adminQuery);
    adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

    // Get all president users
    const presidentQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'president')
    );
    const presidentSnapshot = await getDocs(presidentQuery);
    presidentSnapshot.docs.forEach(doc => recipients.push(doc.id));

    // Create notifications for all recipients
    for (const recipientId of recipients) {
      await addDoc(notificationsRef, {
        type: 'resume_missing_photos',
        title: 'Action Required: Missing Photos',
        body: `${applicant.fullName} passed medical but is missing: ${missingPhotos.join(', ')}`,
        priority: 'high',
        status: 'unread',
        recipientId: recipientId,
        recipientEmail: '',
        icon: '⚠️',
        metadata: {
          applicantId: applicant.id,
          applicantName: applicant.fullName,
          applicantEmail: applicant.email,
          missingPhotos: missingPhotos,
        },
        createdAt: Timestamp.now(),
      });
    }

    console.log(`⚠️ Sent ${recipients.length} notifications for missing photos: ${applicant.fullName}`);
  } catch (error) {
    console.error('Error sending missing-photos notifications:', error);
    // Don't throw - notification failures shouldn't block the main operation
  }
};

/**
 * Send notification to admins when applicant is approved for portal
 */
export const notifyResumeApproved = async (applicant: Applicant, approvedBy: string): Promise<void> => {
  try {
    const notificationsRef = collection(firestore, 'notifications');
    const recipients: string[] = [];

    // Get all admin users
    const adminQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'admin')
    );
    const adminSnapshot = await getDocs(adminQuery);
    adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

    // Get all president users
    const presidentQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'president')
    );
    const presidentSnapshot = await getDocs(presidentQuery);
    presidentSnapshot.docs.forEach(doc => recipients.push(doc.id));

    // Create notifications for all recipients
    for (const recipientId of recipients) {
      await addDoc(notificationsRef, {
        type: 'resume_approved',
        title: 'Resume Approved',
        body: `${applicant.fullName} has been approved and is now visible on the employer portal.`,
        priority: 'low',
        status: 'unread',
        recipientId: recipientId,
        recipientEmail: '',
        icon: '🎉',
        metadata: {
          applicantId: applicant.id,
          applicantName: applicant.fullName,
          approvedBy: approvedBy,
        },
        createdAt: Timestamp.now(),
      });
    }

    console.log(`🎉 Sent ${recipients.length} notifications for resume approval: ${applicant.fullName}`);
  } catch (error) {
    console.error('Error sending approval notifications:', error);
  }
};

/**
 * Send notification to admins when applicant is rejected
 */
export const notifyResumeRejected = async (
  applicant: Applicant,
  rejectedBy: string,
  reason: string
): Promise<void> => {
  try {
    const notificationsRef = collection(firestore, 'notifications');
    const recipients: string[] = [];

    // Get all admin users
    const adminQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'admin')
    );
    const adminSnapshot = await getDocs(adminQuery);
    adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

    // Get all president users
    const presidentQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'president')
    );
    const presidentSnapshot = await getDocs(presidentQuery);
    presidentSnapshot.docs.forEach(doc => recipients.push(doc.id));

    // Create notifications for all recipients
    for (const recipientId of recipients) {
      await addDoc(notificationsRef, {
        type: 'resume_rejected',
        title: 'Resume Rejected',
        body: `${applicant.fullName}'s portal visibility was rejected. Reason: ${reason}`,
        priority: 'medium',
        status: 'unread',
        recipientId: recipientId,
        recipientEmail: '',
        icon: '❌',
        metadata: {
          applicantId: applicant.id,
          applicantName: applicant.fullName,
          rejectedBy: rejectedBy,
          reason: reason,
        },
        createdAt: Timestamp.now(),
      });
    }

    console.log(`❌ Sent ${recipients.length} notifications for resume rejection: ${applicant.fullName}`);
  } catch (error) {
    console.error('Error sending rejection notifications:', error);
  }
};
