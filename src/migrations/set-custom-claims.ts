import { db, auth } from './setup-admin-sdk';

async function migrateUserClaims() {
  try {
    console.log('Starting user claims migration...');
    
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users to migrate`);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      try {
        await auth.setCustomUserClaims(userDoc.id, {
          role: userData.role,
          branchId: userData.branchId || null
        });
        
        console.log(`✓ Set claims for user ${userDoc.id} (${userData.email}): role=${userData.role}`);
      } catch (error) {
        console.error(`✗ Failed to set claims for user ${userDoc.id}:`, error);
      }
    }

    console.log('User claims migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function verifyClaims() {
  try {
    console.log('Verifying user claims...');
    
    const { users } = await auth.listUsers();
    
    for (const user of users) {
      console.log(`User ${user.email}:`, {
        uid: user.uid,
        claims: user.customClaims
      });
    }
    
    console.log('Claims verification completed');
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

// Export functions
export { migrateUserClaims, verifyClaims };
