import { auth, db } from './setup-admin-sdk';

async function rollbackMigration() {
  try {
    console.log('Starting rollback process...');
    
    // Step 1: Clear all custom claims
    console.log('\nStep 1: Clearing custom claims');
    const { users } = await auth.listUsers();
    
    for (const user of users) {
      try {
        await auth.setCustomUserClaims(user.uid, null);
        console.log(`✓ Cleared claims for user ${user.email}`);
      } catch (error) {
        console.error(`✗ Failed to clear claims for user ${user.email}:`, error);
      }
    }
    
    // Step 2: Restore original rules
    console.log('\nStep 2: To restore original rules, run:');
    console.log('copy backup\\firestore.rules.bak firestore.rules');
    console.log('copy backup\\storage.rules.bak storage.rules');
    console.log('firebase deploy --only firestore:rules,storage:rules');
    
    // Step 3: Instructions for data restore if needed
    console.log('\nStep 3: To restore data backup (if needed), run:');
    console.log('firebase firestore:import ./backup/firestore');
    
    console.log('\nRollback completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
}

rollbackMigration();
