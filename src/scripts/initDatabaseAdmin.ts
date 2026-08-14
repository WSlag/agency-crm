/**
 * Database Initialization Script using Firebase Admin SDK
 * This script bypasses Firestore security rules to initialize the database
 * Use this ONLY for initial setup after deleting the database
 */

import admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Helper function to generate random dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function initializeDatabase() {
  console.log('🚀 Starting database initialization with Admin SDK...\n');

  try {
    // Step 1: Create admin user
    console.log('📝 Step 1: Creating admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@agency.com';
    const adminPassword = process.env.ADMIN_PASSWORD || randomBytes(12).toString('base64url');
    const adminDisplayName = process.env.ADMIN_DISPLAY_NAME || 'Super Admin';

    let adminUid: string;
    try {
      const adminUser = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: adminDisplayName,
        emailVerified: true
      });
      adminUid = adminUser.uid;
      console.log(`✅ Admin user created: ${adminEmail}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists' || error.errorInfo?.code === 'auth/email-already-exists') {
        const existingUser = await auth.getUserByEmail(adminEmail);
        adminUid = existingUser.uid;
        console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
      } else {
        throw error;
      }
    }

    // Set custom claims for admin
    await auth.setCustomUserClaims(adminUid, {
      role: 'admin',
      branchId: null
    });
    console.log('✅ Admin custom claims set');

    // Create admin user document
    await db.collection('users').doc(adminUid).set({
      email: adminEmail,
      displayName: adminDisplayName,
      role: 'admin',
      status: 'active',
      branchId: null,
      permissions: ['read', 'write', 'verify', 'approve', 'transfer', 'manage_users', 'manage_branches'],
      verificationAccess: 'full',
      preferences: { theme: 'light', notifications: true, language: 'en' },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ Admin user document created\n');

    // Step 2: Create additional users
    console.log('📝 Step 2: Creating additional users...');
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD || randomBytes(12).toString('base64url');

    const users = [
      {
        email: 'president@agency.com',
        displayName: 'Company President',
        role: 'president',
        branchId: null
      },
      {
        email: 'recruitment1@agency.com',
        displayName: 'HO Recruitment Officer 1',
        role: 'ho_recruitment_officer',
        branchId: null
      },
      {
        email: 'recruitment2@agency.com',
        displayName: 'HO Recruitment Officer 2',
        role: 'ho_recruitment_officer',
        branchId: null
      },
      {
        email: 'accountant@agency.com',
        displayName: 'HO Accountant',
        role: 'ho_accountant',
        branchId: null
      }
    ];

    for (const userData of users) {
      try {
        let userUid: string;
        try {
          const userRecord = await auth.createUser({
            email: userData.email,
            password: defaultPassword,
            displayName: userData.displayName,
            emailVerified: true
          });
          userUid = userRecord.uid;
          console.log(`✅ Created user: ${userData.email}`);
        } catch (error: any) {
          if (error.code === 'auth/email-already-exists' || error.errorInfo?.code === 'auth/email-already-exists') {
            const existingUser = await auth.getUserByEmail(userData.email);
            userUid = existingUser.uid;
            console.log(`ℹ️  User already exists: ${userData.email}`);
          } else {
            throw error;
          }
        }

        // Set custom claims
        await auth.setCustomUserClaims(userUid, {
          role: userData.role,
          branchId: userData.branchId
        });

        // Create user document
        await db.collection('users').doc(userUid).set({
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
          status: 'active',
          branchId: userData.branchId,
          permissions: ['read'],
          verificationAccess: 'none',
          preferences: { theme: 'light', notifications: true, language: 'en' },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }
    console.log('✅ Additional users created\n');

    // Step 3: Create branches
    console.log('📝 Step 3: Creating branches...');
    const branches = [
      {
        id: 'head-office',
        name: 'Head Office',
        code: 'HO',
        location: 'Manila, Philippines',
        managerEmail: null,
        status: 'active'
      },
      {
        id: 'north-branch',
        name: 'North Branch',
        code: 'NB',
        location: 'Quezon City, Philippines',
        managerEmail: null,
        status: 'active'
      },
      {
        id: 'south-branch',
        name: 'South Branch',
        code: 'SB',
        location: 'Makati, Philippines',
        managerEmail: null,
        status: 'active'
      },
      {
        id: 'east-branch',
        name: 'East Branch',
        code: 'EB',
        location: 'Pasig, Philippines',
        managerEmail: null,
        status: 'active'
      }
    ];

    for (const branch of branches) {
      try {
        await db.collection('branches').doc(branch.id).set({
          ...branch,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        console.log(`✅ Created branch: ${branch.name}`);
      } catch (error) {
        console.error(`❌ Error creating branch ${branch.name}:`, error);
      }
    }
    console.log('✅ Branches created\n');

    // Step 4: Create sample agents
    console.log('📝 Step 4: Creating sample agents...');
    const agentStatuses = ['active', 'inactive', 'suspended'];
    
    for (let i = 1; i <= 5; i++) {
      try {
        await db.collection('agents').add({
          agentName: `Agent ${i}`,
          email: `agent${i}@example.com`,
          phone: `+63${900000000 + i}`,
          status: agentStatuses[i % agentStatuses.length],
          branchId: branches[i % branches.length].id,
          commissionRate: 10 + (i * 2),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        console.log(`✅ Created agent: Agent ${i}`);
      } catch (error) {
        console.error(`❌ Error creating agent ${i}:`, error);
      }
    }
    console.log('✅ Agents created\n');

    // Step 5: Create sample applicants
    console.log('📝 Step 5: Creating sample applicants...');
    const stages = ['initial', 'document_verification', 'interview', 'approved', 'rejected'];
    const countries = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Oman'];
    
    for (let i = 1; i <= 10; i++) {
      const stage = stages[i % stages.length];
      try {
        await db.collection('applicants').add({
          name: `Applicant ${i}`,
          email: `applicant${i}@example.com`,
          phone: `+63${900000000 + i}`,
          country: countries[i % countries.length],
          position: 'General Worker',
          stage: stage,
          status: stage === 'rejected' ? 'rejected' : 'active',
          branchId: branches[i % branches.length].id,
          createdAt: Timestamp.fromDate(randomDate(new Date(2024, 0, 1), new Date())),
          updatedAt: Timestamp.now()
        });
        console.log(`✅ Created applicant: Applicant ${i}`);
      } catch (error) {
        console.error(`❌ Error creating applicant ${i}:`, error);
      }
    }
    console.log('✅ Applicants created\n');

    // Step 6: Create sample notifications
    console.log('📝 Step 6: Creating sample notifications...');
    
    // Get all created user UIDs for notifications
    const usersSnapshot = await auth.listUsers();
    const usersByEmail: Record<string, string> = {};
    usersSnapshot.users.forEach(user => {
      if (user.email) {
        usersByEmail[user.email] = user.uid;
      }
    });

    const notificationTypes = [
      {
        type: 'transfer_request',
        title: 'New Transfer Request',
        body: 'A new transfer request has been submitted for Applicant 1 from North Branch.',
        priority: 'normal' as const,
        recipientEmails: ['president@agency.com', adminEmail],
      },
      {
        type: 'expense_approved',
        title: 'Expense Approved',
        body: 'An expense of PHP 5,000 has been approved.',
        priority: 'normal' as const,
        recipientEmails: ['accountant@agency.com', adminEmail],
      },
      {
        type: 'commission_verified',
        title: 'Commission Verified',
        body: 'A commission of PHP 15,000 has been verified and is pending approval.',
        priority: 'normal' as const,
        recipientEmails: ['president@agency.com', 'accountant@agency.com'],
      },
      {
        type: 'document_expiring',
        title: 'Document Expiring Soon',
        body: 'Passport for Applicant 3 will expire in 25 days.',
        priority: 'high' as const,
        recipientEmails: ['recruitment1@agency.com', adminEmail],
      },
      {
        type: 'officer_assigned',
        title: 'New Applicant Assigned',
        body: 'You have been assigned to handle Applicant 5\'s application.',
        priority: 'normal' as const,
        recipientEmails: ['recruitment1@agency.com'],
      },
      {
        type: 'stage_change',
        title: 'Applicant Stage Updated',
        body: 'Applicant 2 has been moved to Interview stage.',
        priority: 'normal' as const,
        recipientEmails: ['recruitment2@agency.com', adminEmail],
      },
      {
        type: 'document_verified',
        title: 'Document Verified',
        body: 'The passport for Applicant 6 has been verified successfully.',
        priority: 'normal' as const,
        recipientEmails: ['recruitment2@agency.com'],
      },
      {
        type: 'transfer_approved',
        title: 'Transfer Request Approved',
        body: 'The transfer request for Applicant 1 has been approved.',
        priority: 'normal' as const,
        recipientEmails: [adminEmail, 'recruitment1@agency.com'],
      },
      {
        type: 'expense_verified',
        title: 'Expense Requires Approval',
        body: 'An expense of PHP 12,500 has been verified and awaiting your approval.',
        priority: 'normal' as const,
        recipientEmails: ['president@agency.com'],
      },
      {
        type: 'commission_approved',
        title: 'Commission Payment Approved',
        body: 'A commission payment of PHP 20,000 has been approved for disbursement.',
        priority: 'normal' as const,
        recipientEmails: ['accountant@agency.com', adminEmail],
      },
      {
        type: 'document_rejected',
        title: 'Document Needs Revision',
        body: 'The birth certificate for Applicant 7 has been rejected. Please upload a clearer copy.',
        priority: 'high' as const,
        recipientEmails: ['recruitment1@agency.com'],
      },
      {
        type: 'task_assigned',
        title: 'New Task Assigned',
        body: 'You have been assigned a new task: Review documents for Applicant 8.',
        priority: 'normal' as const,
        recipientEmails: ['recruitment2@agency.com'],
      },
    ];

    let notificationCount = 0;
    for (const notification of notificationTypes) {
      for (const email of notification.recipientEmails) {
        const recipientUid = usersByEmail[email];
        if (recipientUid) {
          try {
            // Create some as read, some as unread
            const isRead = Math.random() > 0.6; // 40% will be unread
            const createdDate = Timestamp.fromDate(
              randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()) // Last 7 days
            );

            await db.collection('notifications').add({
              type: notification.type,
              title: notification.title,
              body: notification.body,
              priority: notification.priority,
              status: isRead ? 'read' : 'unread',
              recipientId: recipientUid,
              recipientEmail: email,
              icon: '🔔',
              createdAt: createdDate,
              ...(isRead && { readAt: Timestamp.now() }),
            });
            notificationCount++;
          } catch (error) {
            console.error(`❌ Error creating notification for ${email}:`, error);
          }
        }
      }
    }
    console.log(`✅ Created ${notificationCount} sample notifications\n`);

    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Login with: ' + adminEmail);
    console.log('2. Change your password immediately');
    console.log('3. Create branch managers and assign them to branches');
    console.log('4. Update default passwords for all users');
    console.log('\n⚠️  SECURITY WARNING: Change all default passwords immediately!\n');

  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('✅ Initialization complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  });

