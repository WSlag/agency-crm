/**
 * Quick script to fix applicant with stuck rejection data
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { environment } from './scriptEnvironment';

// Initialize Firebase for script context
const app = initializeApp(environment.firebase);
const firestore = getFirestore(app);
const auth = getAuth(app);

// Define ApplicantStatus enum locally
enum ApplicantStatus {
  ACTIVE = 'active',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  ON_HOLD = 'on_hold',
  DEPLOYED = 'deployed'
}

async function authenticateAsAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@agency.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be set in environment variables');
  }
  
  console.log(`Authenticating as admin (${adminEmail})...`);
  await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  console.log('✅ Authentication successful');
}

async function fixApplicantRejection() {
  const applicantId = 'applicant-initial-1'; // The affected applicant
  
  try {
    console.log(`\nFixing applicant ${applicantId}...`);
    
    const applicantRef = doc(firestore, 'applicants', applicantId);
    
    // Clear rejection data and reset to active status
    await updateDoc(applicantRef, {
      currentStatus: ApplicantStatus.ACTIVE,
      rejectionReason: null,
      requiresApproval: false,
      approvedBy: null,
      approvedAt: null,
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Successfully fixed applicant - cleared rejection data');
    console.log('The applicant is now in ACTIVE status and can submit new stage advancement requests');
    
  } catch (error) {
    console.error('❌ Failed to fix applicant:', error);
    throw error;
  }
}

// Run the script
authenticateAsAdmin()
  .then(() => fixApplicantRejection())
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

