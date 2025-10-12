import { migrateUserClaims, verifyClaims } from './set-custom-claims';

const runMigration = async () => {
  try {
    console.log('Starting migration process...');
    
    // Step 1: Migrate user claims
    console.log('\nStep 1: Migrating user claims');
    await migrateUserClaims();
    
    // Step 2: Verify claims
    console.log('\nStep 2: Verifying claims');
    await verifyClaims();
    
    console.log('\nMigration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
