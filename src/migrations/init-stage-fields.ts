/**
 * Migration: Initialize Stage Fields for Existing Applicants
 * 
 * This script updates existing applicants with the new stage management fields
 * while preserving their current stage data.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { ApplicantStage, ApplicantStatus } from '../types/applicant';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = resolve(__dirname, '../../service-account.json');

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  initializeApp({
    credential: cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();

/**
 * Map legacy stage values to new enum values
 */
const STAGE_MAP: Record<string, ApplicantStage> = {
  'registration': ApplicantStage.REGISTRATION,
  'interview': ApplicantStage.INTERVIEW,
  'medical': ApplicantStage.MEDICAL,
  'transfer': ApplicantStage.TRANSFER,
  'processing': ApplicantStage.PROCESSING,
  'deployment': ApplicantStage.DEPLOYMENT,
  'deployed': ApplicantStage.DEPLOYED
};

/**
 * Map legacy status to new status enum
 */
const STATUS_MAP: Record<string, ApplicantStatus> = {
  'active': ApplicantStatus.ACTIVE,
  'inactive': ApplicantStatus.WITHDRAWN,
  'deployed': ApplicantStatus.DEPLOYED
};

async function initializeStageFields() {
  console.log('\n📋 Starting migration: Initialize Stage Fields');
  console.log('==========================================\n');
  
  try {
    // Get all applicants
    const applicantsRef = db.collection('applicants');
    const snapshot = await applicantsRef.get();
    
    if (snapshot.empty) {
      console.log('ℹ️  No applicants found in the database');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} applicant(s) to migrate\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: { id: string; error: string }[] = [];
    
    // Process each applicant
    for (const doc of snapshot.docs) {
      const applicant = doc.data();
      const applicantId = doc.id;
      
      try {
        // Determine current stage enum value
        const currentStage = applicant.currentStage?.toLowerCase() || 'registration';
        const currentStageEnum = STAGE_MAP[currentStage] || ApplicantStage.REGISTRATION;
        
        // Determine current status
        const legacyStatus = applicant.status?.toLowerCase() || 'active';
        let currentStatus = STATUS_MAP[legacyStatus] || ApplicantStatus.ACTIVE;
        
        // If already deployed, set status to DEPLOYED
        if (currentStageEnum === ApplicantStage.DEPLOYED) {
          currentStatus = ApplicantStatus.DEPLOYED;
        }
        
        // Prepare update data
        const updateData: any = {
          currentStageEnum: currentStageEnum,
          currentStatus: currentStatus,
          stageEnteredAt: applicant.updatedAt || applicant.createdAt || Timestamp.now(),
          stageCompletedAt: null,
          requiresApproval: false,
          approvedBy: null,
          approvedAt: null,
          rejectionReason: null,
          commissionMedicalTriggered: false,
          commissionMedicalTriggeredAt: null,
          commissionDeploymentTriggered: false,
          commissionDeploymentTriggeredAt: null,
          updatedAt: Timestamp.now()
        };
        
        // Check if applicant was already deployed - mark commissions as triggered
        if (currentStageEnum === ApplicantStage.DEPLOYED) {
          updateData.commissionMedicalTriggered = true;
          updateData.commissionMedicalTriggeredAt = applicant.createdAt || Timestamp.now();
          updateData.commissionDeploymentTriggered = true;
          updateData.commissionDeploymentTriggeredAt = applicant.updatedAt || applicant.createdAt || Timestamp.now();
        }
        
        // Update applicant
        await applicantsRef.doc(applicantId).update(updateData);
        
        successCount++;
        console.log(`✅ [${successCount}/${snapshot.size}] Updated: ${applicant.fullName || applicantId} (${currentStage} → ${currentStageEnum})`);
        
      } catch (error: any) {
        errorCount++;
        const errorMsg = error.message || 'Unknown error';
        errors.push({ id: applicantId, error: errorMsg });
        console.error(`❌ [${successCount + errorCount}/${snapshot.size}] Failed: ${applicant.fullName || applicantId} - ${errorMsg}`);
      }
    }
    
    // Summary
    console.log('\n==========================================');
    console.log('📊 Migration Summary');
    console.log('==========================================');
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📋 Total processed: ${snapshot.size}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(({ id, error }) => {
        console.log(`   - ${id}: ${error}`);
      });
    }
    
    console.log('\n✅ Migration completed successfully!\n');
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Create initial stage history records for existing applicants
 */
async function createInitialStageHistory() {
  console.log('\n📋 Creating initial stage history records');
  console.log('==========================================\n');
  
  try {
    const applicantsRef = db.collection('applicants');
    const snapshot = await applicantsRef.get();
    
    if (snapshot.empty) {
      console.log('ℹ️  No applicants found');
      return;
    }
    
    console.log(`📊 Creating history for ${snapshot.size} applicant(s)\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Get admin user (first admin in the system)
    const usersRef = db.collection('users');
    const adminQuery = await usersRef.where('role', '==', 'admin').limit(1).get();
    const adminUserId = adminQuery.empty ? 'system' : adminQuery.docs[0].id;
    
    for (const doc of snapshot.docs) {
      const applicant = doc.data();
      const applicantId = doc.id;
      
      try {
        // Create initial stage history record
        await db.collection('stage_history').add({
          applicantId: applicantId,
          fromStage: null,
          toStage: applicant.currentStageEnum || ApplicantStage.REGISTRATION,
          changedBy: adminUserId,
          changedAt: applicant.createdAt || Timestamp.now(),
          approvalRequired: false,
          approvedBy: adminUserId,
          approvedAt: applicant.createdAt || Timestamp.now(),
          status: 'approved',
          rejectionReason: null,
          notes: 'Initial migration - created from existing data'
        });
        
        successCount++;
        console.log(`✅ [${successCount}/${snapshot.size}] Created history for: ${applicant.fullName || applicantId}`);
        
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Failed to create history for: ${applicant.fullName || applicantId}`);
      }
    }
    
    console.log(`\n✅ Created ${successCount} stage history records`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount}`);
    }
    
  } catch (error: any) {
    console.error('\n❌ Failed to create stage history:', error);
  }
}

// Run migration
(async () => {
  try {
    console.log('\n🚀 Starting Stage Management Migration');
    console.log('==========================================\n');
    
    // Step 1: Initialize stage fields
    await initializeStageFields();
    
    // Step 2: Create initial stage history (optional - comment out if not needed)
    await createInitialStageHistory();
    
    console.log('\n🎉 All migration tasks completed successfully!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Migration failed with error:', error);
    process.exit(1);
  }
})();

