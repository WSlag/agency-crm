import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Initialize Firebase Admin
const serviceAccountPath = resolve(process.cwd(), 'service-account.json');

if (!existsSync(serviceAccountPath)) {
  console.error('❌ service-account.json not found!');
  console.error('   Please download your Firebase service account key and save it as service-account.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Map of legacy stages to new enum stages
const STAGE_MAPPING: Record<string, string> = {
  'registration': 'registration',
  'interview': 'interview',
  'medical': 'transfer', // medical was combined with transfer to HO
  'processing': 'processing',
  'deployment': 'deployment',
  'deployed': 'deployed',
  'transfer': 'transfer',
  'transfer_to_ho': 'transfer',
};

/**
 * Fix applicants with missing or invalid currentStage/currentStageEnum fields
 */
async function fixApplicantStage() {
  console.log('🔍 Starting to fix applicant stage fields...\n');

  try {
    // Get all applicants
    const applicantsRef = db.collection('applicants');
    const snapshot = await applicantsRef.get();
    
    console.log(`📊 Found ${snapshot.size} total applicants\n`);

    const batch = db.batch();
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let batchCount = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const updates: any = {};
      let needsUpdate = false;

      // Check if currentStage is missing or needs normalization
      if (!data.currentStage || typeof data.currentStage !== 'string') {
        updates.currentStage = 'registration';
        needsUpdate = true;
        console.log(`✏️  Setting currentStage for applicant: ${data.fullName || docSnap.id}`);
        console.log(`   New stage: registration`);
      } else {
        // Normalize the stage name
        const normalizedStage = STAGE_MAPPING[data.currentStage.toLowerCase()] || 'registration';
        if (data.currentStage !== normalizedStage) {
          updates.currentStage = normalizedStage;
          needsUpdate = true;
          console.log(`✏️  Normalizing currentStage for applicant: ${data.fullName || docSnap.id}`);
          console.log(`   Old stage: ${data.currentStage} → New stage: ${normalizedStage}`);
        }
      }

      // Set currentStageEnum to match currentStage if missing
      if (!data.currentStageEnum) {
        updates.currentStageEnum = updates.currentStage || data.currentStage || 'registration';
        needsUpdate = true;
        console.log(`✏️  Setting currentStageEnum for applicant: ${data.fullName || docSnap.id}`);
      }

      if (needsUpdate) {
        const docRef = db.collection('applicants').doc(docSnap.id);
        batch.update(docRef, updates);
        fixedCount++;
        batchCount++;

        // Commit batch every 500 updates (Firestore limit)
        if (batchCount >= 500) {
          console.log(`\n💾 Committing batch of ${batchCount} updates...`);
          await batch.commit();
          console.log('✅ Batch committed!\n');
          // Create new batch for remaining updates
          batchCount = 0;
        }
      } else {
        alreadyCorrectCount++;
      }
    }

    // Commit remaining updates
    if (batchCount > 0) {
      console.log(`\n💾 Committing final batch of ${batchCount} updates...`);
      await batch.commit();
      console.log('✅ Final batch committed!\n');
    }

    // Summary
    console.log('📈 Summary:');
    console.log(`   ✅ Already correct: ${alreadyCorrectCount}`);
    console.log(`   🔧 Fixed: ${fixedCount}`);
    console.log(`   📊 Total: ${snapshot.size}\n`);
    
    console.log('✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing applicant stages:', error);
    throw error;
  }
}

// Run the script
fixApplicantStage()
  .then(() => {
    console.log('\n🎉 Script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

