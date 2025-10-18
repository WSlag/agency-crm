import {onRequest} from 'firebase-functions/v2/https';
import {onDocumentCreated, onDocumentUpdated} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Auto-sync custom claims when a new user document is created in Firestore
 * This eliminates the need to manually run sync-custom-claims script
 */
export const setCustomClaimsOnCreate = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    try {
      const userId = event.params.userId;
      const userData = event.data?.data();

      if (!userData) {
        console.warn(`⚠️  User data is empty for ${userId}`);
        return;
      }

      console.log(`🔄 New user document created: ${userData.email} (${userId})`);

      // Set custom claims
      const customClaims = {
        role: userData.role || null,
        branchId: userData.branchId || null,
      };

      await admin.auth().setCustomUserClaims(userId, customClaims);

      console.log(`✅ Custom claims set for ${userData.email}:`, customClaims);

      // Update user document to indicate claims are set
      await admin.firestore().collection('users').doc(userId).update({
        customClaimsSet: true,
        customClaimsSetAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error(`❌ Error setting custom claims:`, error);
    }
  }
);

/**
 * Update custom claims when user document is updated
 * This ensures claims stay in sync if role or branchId changes
 */
export const syncCustomClaimsOnUpdate = onDocumentUpdated(
  'users/{userId}',
  async (event) => {
    try {
      const userId = event.params.userId;
      const beforeData = event.data?.before.data();
      const afterData = event.data?.after.data();

      if (!beforeData || !afterData) {
        return;
      }

      // Check if role or branchId changed
      const roleChanged = beforeData.role !== afterData.role;
      const branchChanged = beforeData.branchId !== afterData.branchId;

      if (!roleChanged && !branchChanged) {
        // No changes to sync
        return;
      }

      console.log(`🔄 User data updated for ${userId}, syncing claims...`);

      // Set updated custom claims
      const customClaims = {
        role: afterData.role || null,
        branchId: afterData.branchId || null,
      };

      await admin.auth().setCustomUserClaims(userId, customClaims);

      console.log(`✅ Custom claims updated for user ${userId}:`, customClaims);

      // Update timestamp
      await admin.firestore().collection('users').doc(userId).update({
        customClaimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error(`❌ Error syncing custom claims:`, error);
    }
  }
);

/**
 * Send password reset email (HTTP callable function)
 * This provides better error handling and logging
 */
export const sendPasswordResetEmailFunc = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const {email} = req.body;

    if (!email) {
      res.status(400).json({error: 'Email is required'});
      return;
    }

    console.log(`📧 Password reset requested for: ${email}`);

    // Generate password reset link
    const link = await admin.auth().generatePasswordResetLink(email);

    console.log(`✅ Password reset link generated for ${email}`);
    console.log(`🔗 Reset link: ${link}`);

    res.json({
      success: true,
      message: 'Password reset link generated.',
      link: process.env.NODE_ENV === 'development' ? link : undefined,
    });
  } catch (error: any) {
    console.error(`❌ Error generating password reset link:`, error);
    res.status(500).json({
      error: error.message || 'Failed to generate password reset link',
    });
  }
});

