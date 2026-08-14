/**
 * Complete Database Reset Script
 * 
 * This script will:
 * 1. Clear all existing data (except admin user)
 * 2. Reinitialize with fresh sample data
 * 3. Preserve admin@agency.com with password from ADMIN_PASSWORD env var
 * 
 * ⚠️ WARNING: This is DESTRUCTIVE! Use only in development!
 */

import { clearDatabase } from './clearAndReinitialize';
import { initializeDatabase } from './initializeDatabase';
import { randomBytes } from 'node:crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@agency.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || randomBytes(12).toString('base64url');
const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || randomBytes(12).toString('base64url');

const runCompleteReset = async () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  COMPLETE DATABASE RESET AND REINITIALIZATION             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('This script will:');
  console.log('  1. ✅ Preserve admin user: admin@agency.com');
  console.log('  2. 🗑️  Delete all other existing data');
  console.log('  3. 🆕 Create fresh sample data');
  console.log('');
  console.log('⚠️  WARNING: This action cannot be undone!');
  console.log('');
  console.log('Starting in 3 seconds...');
  console.log('');

  // Give user time to cancel if needed
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // Step 1: Clear existing data (except admin)
    console.log('STEP 1: Clearing existing data...');
    console.log('─────────────────────────────────────────────────────────');
    await clearDatabase();
    console.log('');

    // Step 2: Reinitialize with fresh data
    console.log('STEP 2: Creating fresh data...');
    console.log('─────────────────────────────────────────────────────────');
    
    // Set environment variables for initialization
    process.env.ADMIN_EMAIL = ADMIN_EMAIL;
    process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
    process.env.DEFAULT_USER_PASSWORD = DEFAULT_USER_PASSWORD;
    
    await initializeDatabase();
    console.log('');

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  ✅ COMPLETE RESET SUCCESSFUL                             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ Admin user preserved: admin@agency.com');
    console.log('   ✅ All other data deleted');
    console.log('   ✅ Fresh sample data created');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Email:    admin@agency.com');
    console.log('   Password: (from ADMIN_PASSWORD env var - see .env.development)');
    console.log('');
    console.log('👥 Additional Users Created:');
    console.log('   - President: president@agency.com');
    console.log('   - HO Officer 1: recruitment1@agency.com');
    console.log('   - HO Officer 2: recruitment2@agency.com');
    console.log('   - Accountant: accountant@agency.com');
    console.log('   - Branch Managers: manager.ho@agency.com, manager.nb@agency.com, etc.');
    console.log('');
    console.log('⚠️  IMPORTANT: Set DEFAULT_USER_PASSWORD in your environment and change passwords after first login!');
    console.log('');
    console.log('📊 Data Created:');
    console.log('   - 4 Branches (HO, North, South, East)');
    console.log('   - 4 Branch Managers');
    console.log('   - ~14 Agents');
    console.log('   - ~20 Applicants with documents and expenses');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('╔═══════════════════════════════════════════════════════════╗');
    console.error('║  ❌ RESET FAILED                                          ║');
    console.error('╚═══════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Error:', error);
    console.error('');
    console.error('💡 Your data may be in an incomplete state.');
    console.error('   Please check Firebase Console and run again if needed.');
    console.error('');
    throw error;
  }
};

// Run the complete reset
runCompleteReset()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

