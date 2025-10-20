/**
 * Migration Script: Add branchId to stage_history records
 * 
 * This script updates all existing stage_history records to include
 * the branchId field from their associated applicant.
 * 
 * This is needed for branch-specific filtering in the Priority Alerts widget.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

// Firebase configuration (replace with your config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addBranchIdToStageHistory() {
  console.log('Starting migration: Add branchId to stage_history records...');
  
  try {
    // Get all stage_history records
    const stageHistoryRef = collection(db, 'stage_history');
    const stageHistorySnapshot = await getDocs(stageHistoryRef);
    
    console.log(`Found ${stageHistorySnapshot.size} stage_history records to process`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    // Process each stage history record
    for (const historyDoc of stageHistorySnapshot.docs) {
      const historyData = historyDoc.data();
      
      // Skip if branchId already exists
      if (historyData.branchId) {
        skipped++;
        continue;
      }
      
      try {
        // Get the applicant document to fetch branchId
        const applicantRef = doc(db, 'applicants', historyData.applicantId);
        const applicantSnapshot = await getDoc(applicantRef);
        
        if (!applicantSnapshot.exists()) {
          console.warn(`Applicant ${historyData.applicantId} not found for stage_history ${historyDoc.id}`);
          errors++;
          continue;
        }
        
        const applicantData = applicantSnapshot.data();
        
        if (!applicantData.branchId) {
          console.warn(`Applicant ${historyData.applicantId} has no branchId for stage_history ${historyDoc.id}`);
          errors++;
          continue;
        }
        
        // Update stage_history with branchId
        await updateDoc(doc(db, 'stage_history', historyDoc.id), {
          branchId: applicantData.branchId
        });
        
        updated++;
        
        if (updated % 10 === 0) {
          console.log(`Progress: ${updated} records updated...`);
        }
        
      } catch (error) {
        console.error(`Error processing stage_history ${historyDoc.id}:`, error);
        errors++;
      }
    }
    
    console.log('\n=== Migration Complete ===');
    console.log(`Total records: ${stageHistorySnapshot.size}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped (already had branchId): ${skipped}`);
    console.log(`Errors: ${errors}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration
addBranchIdToStageHistory()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

