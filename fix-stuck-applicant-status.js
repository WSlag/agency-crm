/**
 * Fix Script: Reset Stuck Applicant Status
 * 
 * This script resets an applicant stuck in "pending_approval" status
 * when there's no corresponding stage_history record
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Your Firebase config (from src/config/firebase.ts)
const firebaseConfig = {
  // Copy your config here
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function fixApplicantStatus() {
  const applicantId = 'csCXHNPxb98e4YgoPiyn'; // Jasmin Atamol
  
  console.log('Checking for existing pending approvals...');
  
  // Check if there's a pending stage_history record
  const historyQuery = query(
    collection(firestore, 'stage_history'),
    where('applicantId', '==', applicantId),
    where('status', '==', 'pending')
  );
  
  const historySnapshot = await getDocs(historyQuery);
  
  if (historySnapshot.empty) {
    console.log('✅ No pending approval found in database');
    console.log('Resetting applicant status...');
    
    // Reset the applicant status
    const applicantRef = doc(firestore, 'applicants', applicantId);
    await updateDoc(applicantRef, {
      currentStatus: 'active',
      requiresApproval: false,
      rejectionReason: null,
      approvedBy: null,
      approvedAt: null
    });
    
    console.log('✅ Applicant status reset successfully!');
    console.log('Branch Manager can now click "Advance to Transfer" button');
  } else {
    console.log('⚠️  Pending approval exists in database!');
    console.log('Records found:', historySnapshot.size);
    historySnapshot.forEach(doc => {
      console.log('Approval:', doc.id, doc.data());
    });
  }
}

fixApplicantStatus().catch(console.error);

