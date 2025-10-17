/**
 * Sync Custom Claims Script
 * 
 * This script reads user roles from Firestore and sets them as 
 * Firebase Auth custom claims so they can be accessed via getIdTokenResult()
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load service account
const serviceAccountPath = join(process.cwd(), 'service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount as ServiceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

async function syncCustomClaims() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 SYNCING CUSTOM CLAIMS FROM FIRESTORE TO FIREBASE AUTH');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`\n📋 Found ${usersSnapshot.size} users in Firestore\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const uid = doc.id;
      
      try {
        // Get the user from Firebase Auth
        const userRecord = await auth.getUser(uid);
        
        // Prepare custom claims
        const customClaims = {
          role: userData.role,
          branchId: userData.branchId || null
        };
        
        // Set custom claims
        await auth.setCustomUserClaims(uid, customClaims);
        
        console.log(`✅ ${userRecord.email || uid}`);
        console.log(`   Role: ${userData.role}${userData.branchId ? ` | Branch: ${userData.branchId}` : ''}`);
        
        successCount++;
      } catch (error: any) {
        console.error(`❌ Failed to set claims for user ${uid}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully synced: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (successCount > 0) {
      console.log('⚠️  IMPORTANT: Users must log out and log back in for changes to take effect!\n');
    }
    
  } catch (error) {
    console.error('❌ Error syncing custom claims:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the script
syncCustomClaims();

