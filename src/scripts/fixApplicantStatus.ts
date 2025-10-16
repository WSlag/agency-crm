import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
// Import the existing Firebase configuration
import { firestore } from '../config/firebase';

const db = firestore;

/**
 * Fix applicants with missing status or currentStage fields
 */
async function fixApplicantStatus() {
  console.log('🔍 Starting to fix applicant status and stage fields...\n');

  try {
    // Get all applicants
    const applicantsRef = collection(db, 'applicants');
    const snapshot = await getDocs(applicantsRef);
    
    console.log(`📊 Found ${snapshot.size} total applicants\n`);

    const batch = writeBatch(db);
    let fixedCount = 0;
    let alreadyCorrectCount = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const updates: any = {};
      let needsUpdate = false;

      // Check if status field is missing or invalid
      if (!data.status || (data.status !== 'active' && data.status !== 'inactive')) {
        updates.status = 'active'; // Default to active
        needsUpdate = true;
        console.log(`✏️  Fixing status for applicant: ${data.fullName || docSnap.id}`);
        console.log(`   Old status: ${data.status || 'undefined'} → New status: active`);
      }

      // Check if currentStage field is missing
      if (!data.currentStage) {
        updates.currentStage = 'registration'; // Default to registration
        needsUpdate = true;
        console.log(`✏️  Fixing currentStage for applicant: ${data.fullName || docSnap.id}`);
        console.log(`   Old stage: undefined → New stage: registration`);
      }

      if (needsUpdate) {
        const docRef = doc(db, 'applicants', docSnap.id);
        batch.update(docRef, updates);
        fixedCount++;
      } else {
        alreadyCorrectCount++;
      }
    }

    // Commit the batch update
    if (fixedCount > 0) {
      console.log(`\n💾 Committing batch update for ${fixedCount} applicants...`);
      await batch.commit();
      console.log('✅ Batch update completed successfully!\n');
    }

    // Summary
    console.log('📈 Summary:');
    console.log(`   ✅ Already correct: ${alreadyCorrectCount}`);
    console.log(`   🔧 Fixed: ${fixedCount}`);
    console.log(`   📊 Total: ${snapshot.size}\n`);
    
    console.log('✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing applicant status:', error);
    throw error;
  }
}

// Run the script
fixApplicantStatus()
  .then(() => {
    console.log('\n🎉 Script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

