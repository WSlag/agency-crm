/**
 * Clear and Reinitialize Database Script
 * 
 * This script will:
 * 1. Keep the admin user (admin@agency.com)
 * 2. Delete all other data from Firestore
 * 3. Create fresh sample data
 * 
 * ⚠️ WARNING: This is DESTRUCTIVE! Use only in development!
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { environment } from './scriptEnvironment';

const app = initializeApp(environment.firebase);
const db = getFirestore(app);
const auth = getAuth(app);

// Admin email to preserve
const ADMIN_EMAIL = 'admin@agency.com';

/**
 * Delete all documents from a collection except specified IDs
 */
const clearCollection = async (collectionName: string, preserveIds: string[] = []) => {
  try {
    console.log(`🗑️  Clearing collection: ${collectionName}...`);
    const snapshot = await getDocs(collection(db, collectionName));
    
    let deletedCount = 0;
    let preservedCount = 0;

    for (const docSnapshot of snapshot.docs) {
      if (preserveIds.includes(docSnapshot.id)) {
        console.log(`   ✅ Preserved: ${docSnapshot.id}`);
        preservedCount++;
        continue;
      }
      
      await deleteDoc(doc(db, collectionName, docSnapshot.id));
      deletedCount++;
    }

    console.log(`   ✓ Deleted ${deletedCount} documents, preserved ${preservedCount}`);
  } catch (error) {
    console.error(`   ✗ Error clearing ${collectionName}:`, error);
  }
};

/**
 * Clear all subcollections for applicants
 */
const clearApplicantSubcollections = async () => {
  try {
    console.log(`🗑️  Clearing applicant subcollections...`);
    const applicantsSnapshot = await getDocs(collection(db, 'applicants'));
    
    for (const applicantDoc of applicantsSnapshot.docs) {
      // Clear documents subcollection
      const docsSnapshot = await getDocs(
        collection(db, `applicants/${applicantDoc.id}/documents`)
      );
      for (const docSnapshot of docsSnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }

      // Clear expenses subcollection
      const expensesSnapshot = await getDocs(
        collection(db, `applicants/${applicantDoc.id}/expenses`)
      );
      for (const expenseSnapshot of expensesSnapshot.docs) {
        await deleteDoc(expenseSnapshot.ref);
      }
    }
    
    console.log(`   ✓ Cleared subcollections`);
  } catch (error) {
    console.error(`   ✗ Error clearing subcollections:`, error);
  }
};

/**
 * Get admin user ID to preserve
 */
const getAdminUserId = async (): Promise<string | null> => {
  try {
    const usersSnapshot = await getDocs(
      query(collection(db, 'users'), where('email', '==', ADMIN_EMAIL))
    );
    
    if (!usersSnapshot.empty) {
      return usersSnapshot.docs[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error getting admin user ID:', error);
    return null;
  }
};

/**
 * Main clear function
 */
const clearDatabase = async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  CLEARING DATABASE (PRESERVING ADMIN USER)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`⚠️  This will DELETE all data except admin user: ${ADMIN_EMAIL}`);
  console.log('');

  try {
    // Get admin user ID to preserve
    const adminUserId = await getAdminUserId();
    console.log(`✅ Found admin user ID: ${adminUserId || 'NOT FOUND'}`);
    console.log('');

    // Clear subcollections first
    await clearApplicantSubcollections();
    console.log('');

    // Clear main collections
    const collections = [
      'applicants',
      'agents',
      'branches',
      'communications',
      'budgets',
      'budget_alerts',
      'report_shares',
      'jobs',
      'job_assignments',
      'transfers',
      'notifications',
      'audit_logs',
      'documents',
      'officers',
      'commissions',
      'reports',
    ];

    for (const collectionName of collections) {
      await clearCollection(collectionName);
    }

    // Clear users collection but preserve admin
    if (adminUserId) {
      await clearCollection('users', [adminUserId]);
    } else {
      console.log('⚠️  Admin user not found - clearing all users');
      await clearCollection('users');
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE CLEARED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Run initialization script to create fresh data');
    console.log('   2. Login with: admin@agency.com (password from ADMIN_PASSWORD env var)');
    console.log('');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// Export for use in combined script
export { clearDatabase };

