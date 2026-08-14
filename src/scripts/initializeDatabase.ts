import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { randomBytes } from 'node:crypto';
import { environment } from './scriptEnvironment';

const app = initializeApp(environment.firebase);
const db = getFirestore(app);
const auth = getAuth(app);

// SECURITY: Never hardcode passwords. Use DEFAULT_USER_PASSWORD from the
// environment, or generate a strong random password at runtime.
const defaultPassword =
  process.env.DEFAULT_USER_PASSWORD || randomBytes(12).toString('base64url');

// Helper function to authenticate as admin
const authenticateAsAdmin = async () => {
  try {
    // SECURITY: Get credentials from environment variables
    // DO NOT hardcode credentials!
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminDisplayName = process.env.ADMIN_DISPLAY_NAME || 'Super Admin';
    
    if (!adminEmail || !adminPassword) {
      throw new Error(
        'ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables. ' +
        'Please create a .env.local file with these values.'
      );
    }

    // Validate password strength (relaxed for existing passwords)
    if (adminPassword.length < 8) {
      console.warn('⚠️  WARNING: Admin password is shorter than recommended 12 characters.');
      console.warn('⚠️  Please change password after first login for better security.');
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: adminEmail,
        displayName: adminDisplayName,
        role: 'admin',
        permissions: ['read', 'write', 'verify', 'approve', 'transfer', 'manage_users', 'manage_branches'],
        verificationAccess: 'full',
        preferences: { theme: 'light', notifications: true, language: 'en' },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Admin user created successfully');
      console.warn('⚠️  IMPORTANT: Please change your admin password immediately after first login!');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️  Admin user already exists, signing in...');
      } else {
        throw error;
      }
    }

    // Sign in as admin
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('✅ Authenticated as admin');
  } catch (error) {
    console.error('❌ Error authenticating as admin:', error);
    throw error;
  }
};

// Helper function to generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random status
const randomStatus = <T extends string>(statuses: T[]): T => {
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Initialize admin users
const initializeUsers = async () => {
  // SECURITY WARNING: These are test/demo users with temporary passwords
  // In production, you should:
  // 1. Use environment variables for all passwords
  // 2. Force password change on first login
  // 3. Enable multi-factor authentication (MFA)
  // 4. Use Firebase Admin SDK with service accounts instead
  
  if (!process.env.DEFAULT_USER_PASSWORD) {
    console.warn('⚠️  DEFAULT_USER_PASSWORD not set. Using generated temporary password.');
    console.warn('⚠️  IMPORTANT: Change all user passwords after initialization!');
  }

  const users = [
    {
      email: 'admin@agency.com',
      password: process.env.ADMIN_PASSWORD || defaultPassword,
      data: {
        displayName: 'Super Admin',
        role: 'admin',
        permissions: ['read', 'write', 'verify', 'approve', 'transfer', 'manage_users', 'manage_branches'],
        verificationAccess: 'full',
        preferences: { theme: 'light', notifications: true, language: 'en' }
      }
    },
    {
      email: 'president@agency.com',
      password: defaultPassword,
      data: {
        displayName: 'Agency President',
        role: 'president',
        permissions: ['read', 'write', 'verify', 'approve'],
        verificationAccess: 'full',
        preferences: { theme: 'light', notifications: true, language: 'en' }
      }
    },
    {
      email: 'recruitment1@agency.com',
      password: defaultPassword,
      data: {
        displayName: 'HO Recruitment Officer 1',
        role: 'ho_recruitment_officer',
        permissions: ['read', 'write', 'verify'],
        verificationAccess: 'advanced',
        preferences: { theme: 'light', notifications: true, language: 'en' }
      }
    },
    {
      email: 'recruitment2@agency.com',
      password: defaultPassword,
      data: {
        displayName: 'HO Recruitment Officer 2',
        role: 'ho_recruitment_officer',
        permissions: ['read', 'write', 'verify'],
        verificationAccess: 'advanced',
        preferences: { theme: 'light', notifications: true, language: 'en' }
      }
    },
    {
      email: 'accountant@agency.com',
      password: defaultPassword,
      data: {
        displayName: 'HO Accountant',
        role: 'ho_accountant',
        permissions: ['read', 'write', 'approve'],
        verificationAccess: 'basic',
        preferences: { theme: 'light', notifications: true, language: 'en' }
      }
    }
  ];

  for (const user of users) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...user.data,
        email: user.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`Created user: ${user.email}`);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
};

// Initialize branches
const initializeBranches = async () => {
  const branches = [
    {
      id: 'ho-branch',
      name: 'Head Office',
      code: 'HO',
      address: '123 Main Street, City',
      phone: '+1234567890',
      email: 'ho@agency.com',
      status: 'active'
    },
    {
      id: 'north-branch',
      name: 'North Branch',
      code: 'NB',
      address: '456 North Ave, City',
      phone: '+1234567891',
      email: 'north@agency.com',
      status: 'active'
    },
    {
      id: 'south-branch',
      name: 'South Branch',
      code: 'SB',
      address: '789 South St, City',
      phone: '+1234567892',
      email: 'south@agency.com',
      status: 'active'
    },
    {
      id: 'east-branch',
      name: 'East Branch',
      code: 'EB',
      address: '321 East Rd, City',
      phone: '+1234567893',
      email: 'east@agency.com',
      status: 'active'
    }
  ];

  for (const branch of branches) {
    try {
      await setDoc(doc(db, 'branches', branch.id), {
        ...branch,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`Created branch: ${branch.name}`);

      // Create branch manager for each branch
      const manager = {
        email: `manager.${branch.code.toLowerCase()}@agency.com`,
        password: defaultPassword,
        data: {
          displayName: `${branch.name} Manager`,
          role: 'branch_manager',
          branchId: branch.id,
          permissions: ['read', 'write', 'verify'],
          verificationAccess: 'advanced',
          preferences: { theme: 'light', notifications: true, language: 'en' }
        }
      };

      const userCredential = await createUserWithEmailAndPassword(auth, manager.email, manager.password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...manager.data,
        email: manager.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`Created branch manager: ${manager.email}`);
    } catch (error) {
      console.error(`Error creating branch ${branch.name}:`, error);
    }
  }
};

// Initialize agents
const initializeAgents = async () => {
  const branches = ['ho-branch', 'north-branch', 'south-branch', 'east-branch'];
  const statuses = ['active', 'inactive'];

  for (const branchId of branches) {
    const numAgents = Math.floor(Math.random() * 2) + 3; // 3-4 agents per branch
    
    for (let i = 0; i < numAgents; i++) {
      const agentId = `${branchId}-agent-${i + 1}`;
      const agent = {
        name: `Agent ${i + 1}`,
        email: `agent${i + 1}.${branchId}@agency.com`,
        phone: `+1234567${Math.floor(Math.random() * 1000)}`,
        branchId,
        status: randomStatus(statuses),
        commissionAmount: (Math.floor(Math.random() * 5) + 5) * 1000, // 5000-10000 PHP
        totalCommission: 0,
        applicantsCount: 0
      };

      try {
        await setDoc(doc(db, 'agents', agentId), {
          ...agent,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        console.log(`Created agent: ${agent.name} in ${branchId}`);
      } catch (error) {
        console.error(`Error creating agent ${agent.name}:`, error);
      }
    }
  }
};

// Initialize applicants with documents and expenses
const initializeApplicants = async () => {
  const branches = ['ho-branch', 'north-branch', 'south-branch', 'east-branch'];
  const statuses = ['initial', 'document_verification', 'interview', 'approved', 'rejected'];
  const documentTypes = ['passport', 'resume', 'certificates', 'medical', 'police_clearance'];
  const expenseTypes = ['medical', 'training', 'visa', 'travel'];

  for (const status of statuses) {
    for (let i = 0; i < 4; i++) {
      const branchId = branches[Math.floor(Math.random() * branches.length)];
      const applicantId = `applicant-${status}-${i + 1}`;
      
      const applicant = {
        name: `Applicant ${status.charAt(0).toUpperCase() + status.slice(1)} ${i + 1}`,
        email: `applicant${i + 1}.${status}@example.com`,
        phone: `+1234567${Math.floor(Math.random() * 1000)}`,
        branchId,
        status,
        assignedRecruitmentOfficerId: null,
        totalExpenses: 0,
        documentsCount: 0,
        notes: `Test applicant in ${status} stage`
      };

      try {
        // Create applicant
        await setDoc(doc(db, 'applicants', applicantId), {
          ...applicant,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        // Add documents
        const numDocs = Math.floor(Math.random() * 3) + 2; // 2-4 documents
        for (let j = 0; j < numDocs; j++) {
          const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
          await setDoc(doc(db, 'applicants', applicantId, 'documents', `${docType}-${j + 1}`), {
            type: docType,
            status: 'submitted',
            verificationStatus: 'pending',
            uploadedAt: Timestamp.fromDate(randomDate(new Date(2023, 0, 1), new Date())),
            verifiedAt: null,
            notes: `Test ${docType} document`
          });
        }

        // Add expenses
        const numExpenses = Math.floor(Math.random() * 3) + 1; // 1-3 expenses
        for (let k = 0; k < numExpenses; k++) {
          const expenseType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
          await setDoc(doc(db, 'applicants', applicantId, 'expenses', `${expenseType}-${k + 1}`), {
            type: expenseType,
            amount: Math.floor(Math.random() * 1000) + 500,
            status: 'pending',
            date: Timestamp.fromDate(randomDate(new Date(2023, 0, 1), new Date())),
            notes: `Test ${expenseType} expense`
          });
        }

        console.log(`Created applicant: ${applicant.name} with documents and expenses`);
      } catch (error) {
        console.error(`Error creating applicant ${applicant.name}:`, error);
      }
    }
  }
};

// Initialize the database
const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // First authenticate as admin
    await authenticateAsAdmin();
    
    // Then create other users
    await initializeUsers();
    console.log('Users initialized');
    
    await initializeBranches();
    console.log('Branches initialized');
    
    await initializeAgents();
    console.log('Agents initialized');
    
    await initializeApplicants();
    console.log('Applicants initialized');
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Export the initialization function
export { initializeDatabase };
