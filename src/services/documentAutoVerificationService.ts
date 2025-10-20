/**
 * Document Auto-Verification Service
 * 
 * Provides utilities to automatically verify pending documents for applicants
 * who have already advanced past the stages requiring those documents.
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { ApplicantStage } from '../types/applicant';
import { STAGE_CONFIGURATION } from '../config/stageConfig';

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
 * Auto-verify pending documents for a single applicant
 * based on their current stage
 */
export async function autoVerifyApplicantDocuments(
  applicantId: string,
  currentStage: string,
  verifiedBy: string
): Promise<{ verified: number; skipped: number }> {
  const currentStageIndex = getStageIndex(currentStage);
  
  // Get all pending documents for this applicant
  const docsQuery = query(
    collection(firestore, 'documents'),
    where('applicantId', '==', applicantId),
    where('status', '==', 'pending')
  );
  
  const docsSnapshot = await getDocs(docsQuery);
  
  let verified = 0;
  let skipped = 0;
  
  // Check each pending document
  for (const docSnapshot of docsSnapshot.docs) {
    const docData = docSnapshot.data();
    const docType = docData.type || docData.documentType;
    
    // Check which stages require this document type
    let shouldVerify = false;
    let matchedStage = '';
    
    // Check all stages up to current stage (including current)
    for (let i = 0; i <= currentStageIndex; i++) {
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
      await updateDoc(doc(firestore, 'documents', docSnapshot.id), {
        status: 'verified',
        verifiedBy,
        verifiedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        metadata: {
          ...docData.metadata,
          autoVerifiedReason: `Applicant at ${currentStage} stage, document required for ${matchedStage}`,
          autoVerifiedAt: new Date().toISOString(),
        }
      });
      
      console.log(`[AutoVerify] Verified ${docType} for ${applicantId} (matched ${matchedStage})`);
      verified++;
    } else {
      skipped++;
    }
  }
  
  return { verified, skipped };
}

/**
 * Bulk auto-verify pending documents for multiple applicants
 */
export async function bulkAutoVerifyDocuments(
  verifiedBy: string
): Promise<{ totalVerified: number; applicantsProcessed: number }> {
  // Get all applicants
  const applicantsSnapshot = await getDocs(collection(firestore, 'applicants'));
  
  let totalVerified = 0;
  let applicantsProcessed = 0;
  
  for (const applicantDoc of applicantsSnapshot.docs) {
    const applicantData = applicantDoc.data();
    const applicantId = applicantDoc.id;
    const currentStage = (applicantData.currentStageEnum || applicantData.currentStage || 'registration') as string;
    
    // Skip if still in registration
    if (currentStage === 'registration') continue;
    
    try {
      const result = await autoVerifyApplicantDocuments(
        applicantId,
        currentStage,
        verifiedBy
      );
      
      if (result.verified > 0) {
        totalVerified += result.verified;
        applicantsProcessed++;
        console.log(`[AutoVerify] Processed ${applicantData.fullName}: ${result.verified} verified, ${result.skipped} skipped`);
      }
    } catch (error) {
      console.error(`[AutoVerify] Error processing ${applicantId}:`, error);
    }
  }
  
  return { totalVerified, applicantsProcessed };
}

