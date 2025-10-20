/**
 * Verify Pending Documents for Advanced Applicants
 * 
 * This script finds applicants who have advanced past stages but still have pending documents,
 * and automatically verifies those documents.
 * 
 * Usage: npx tsx src/scripts/verifyPendingDocumentsForAdvancedApplicants.ts
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { environment } from './scriptEnvironment';
import { ApplicantStage } from '../types/applicant';
import { STAGE_CONFIGURATION } from '../config/stageConfig';

const app = initializeApp(environment.firebase);
const db = getFirestore(app);

// Stage order for comparison
const STAGE_ORDER: ApplicantStage[] = [
  ApplicantStage.REGISTRATION,
  ApplicantStage.INTERVIEW,
  ApplicantStage.MEDICAL,
  ApplicantStage.TRANSFER,
  ApplicantStage.PROCESSING,
  ApplicantStage.SELECTED,
  ApplicantStage.DEPLOYED,
];

/**
 * Get stage index for comparison
 */
function getStageIndex(stage: string): number {
  const index = STAGE_ORDER.findIndex(s => s === stage);
  return index === -1 ? 0 : index;
}

/**
 * Get required document types for a stage
 */
function getRequiredDocTypes(stage: ApplicantStage): string[] {
  const config = STAGE_CONFIGURATION[stage];
  if (!config || !config.documents) return [];
  
  const types: string[] = [];
  for (const req of config.documents) {
    types.push(req.type);
    if (req.alternatives) {
      types.push(...req.alternatives);
    }
  }
  return types;
}

/**
 * Main function to verify pending documents
 */
async function verifyPendingDocuments() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 VERIFYING PENDING DOCUMENTS FOR ADVANCED APPLICANTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  try {
    // Get all applicants
    console.log('📋 Step 1: Fetching all applicants...');
    const applicantsSnapshot = await getDocs(collection(db, 'applicants'));
    console.log(`   ✓ Found ${applicantsSnapshot.docs.length} applicants`);
    console.log('');

    // Get all pending documents
    console.log('📄 Step 2: Fetching all pending documents...');
    const docsQuery = query(
      collection(db, 'documents'),
      where('status', '==', 'pending')
    );
    const docsSnapshot = await getDocs(docsQuery);
    console.log(`   ✓ Found ${docsSnapshot.docs.length} pending documents`);
    console.log('');

    // Process each applicant
    console.log('🔄 Step 3: Processing applicants...');
    let totalVerified = 0;
    let applicantsProcessed = 0;

    for (const applicantDoc of applicantsSnapshot.docs) {
      const applicantData = applicantDoc.data();
      const applicantId = applicantDoc.id;
      const currentStage = (applicantData.currentStageEnum || applicantData.currentStage || 'registration') as string;
      const currentStageIndex = getStageIndex(currentStage);

      // Skip if still in registration
      if (currentStageIndex === 0) continue;

      // Find pending documents for this applicant
      const applicantDocs = docsSnapshot.docs.filter(
        doc => doc.data().applicantId === applicantId
      );

      if (applicantDocs.length === 0) continue;

      console.log(`   📝 Processing: ${applicantData.fullName || 'Unknown'} (${applicantId})`);
      console.log(`      Current Stage: ${currentStage}`);
      console.log(`      Pending Documents: ${applicantDocs.length}`);

      let verifiedCount = 0;

      // Check each pending document
      for (const docSnapshot of applicantDocs) {
        const docData = docSnapshot.data();
        const docType = docData.type || docData.documentType;
        
        // Check which stages require this document type
        let shouldVerify = false;
        let matchedStage = '';

        for (let i = 0; i < currentStageIndex; i++) {
          const stage = STAGE_ORDER[i];
          const requiredTypes = getRequiredDocTypes(stage);
          
          if (requiredTypes.includes(docType)) {
            shouldVerify = true;
            matchedStage = stage;
            break;
          }
        }

        if (shouldVerify) {
          // Verify the document
          await updateDoc(doc(db, 'documents', docSnapshot.id), {
            status: 'verified',
            verifiedBy: 'system_auto_verify',
            verifiedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            metadata: {
              ...docData.metadata,
              autoVerifiedReason: `Applicant advanced past ${matchedStage} stage`,
              autoVerifiedAt: new Date().toISOString(),
            }
          });

          console.log(`      ✅ Verified: ${docType} (matched ${matchedStage} stage)`);
          verifiedCount++;
          totalVerified++;
        } else {
          console.log(`      ⏭️  Skipped: ${docType} (not required for past stages)`);
        }
      }

      if (verifiedCount > 0) {
        applicantsProcessed++;
        console.log(`      ✓ Verified ${verifiedCount} document(s) for this applicant`);
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VERIFICATION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📊 Summary:`);
    console.log(`   - Total applicants checked: ${applicantsSnapshot.docs.length}`);
    console.log(`   - Applicants with verified documents: ${applicantsProcessed}`);
    console.log(`   - Total documents verified: ${totalVerified}`);
    console.log('');
    console.log('💡 You can now refresh the applicant profile pages to see updated document statuses');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
verifyPendingDocuments()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

