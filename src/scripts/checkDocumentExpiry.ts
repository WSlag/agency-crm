/**
 * Script to check document expiry and send notifications
 * 
 * Run this script daily via cron job or Cloud Functions scheduler
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { environment } from './scriptEnvironment';
import { documentExpiryService } from '../services/documentExpiryService';

// Initialize Firebase
const app = initializeApp(environment.firebase);
const auth = getAuth(app);

async function authenticateAsAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@agency.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be set in environment variables');
  }
  
  console.log(`Authenticating as admin (${adminEmail})...`);
  await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  console.log('✅ Authentication successful');
}

async function checkDocumentExpiry() {
  try {
    // Authenticate first
    await authenticateAsAdmin();
    
    console.log('\n📅 Running document expiry check...\n');
    
    // Run the daily expiry check
    await documentExpiryService.runDailyExpiryCheck();
    
    console.log('\n✅ Document expiry check completed successfully');
    
  } catch (error) {
    console.error('❌ Failed to check document expiry:', error);
    throw error;
  }
}

// Run the script
checkDocumentExpiry()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

