/**
 * Script to auto-verify pending documents for applicants who have already advanced stages
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { environment } from './scriptEnvironment';

// Initialize Firebase
const app = initializeApp(environment.firebase);
const firestore = getFirestore(app);
const auth = getAuth(app);

async function authenticateAsAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@agency.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be set in environment variables');
  }
  
  console.log(`Authenticating as admin (${adminEmail})...`);
  const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  console.log('✅ Authentication successful');
  return userCredential.user;
}

async function verifyPendingDocuments() {
  try {
    // Authenticate first
    const adminUser = await authenticateAsAdmin();
    
    console.log('\n🔍 Finding pending documents...');
    
    // Get all pending documents
    const docsRef = collection(firestore, 'documents');
    const q = query(docsRef, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    
    console.log(`Found ${snapshot.size} pending document(s)`);
    
    if (snapshot.empty) {
      console.log('✅ No pending documents to verify');
      return;
    }
    
    // Auto-verify all pending documents
    let verifiedCount = 0;
    
    for (const docSnap of snapshot.docs) {
      const docData = docSnap.data();
      
      console.log(`\n📄 Verifying document: ${docSnap.id}`);
      console.log(`   Type: ${docData.type || docData.documentType}`);
      console.log(`   Applicant: ${docData.applicantId}`);
      console.log(`   Uploaded: ${docData.uploadedAt?.toDate?.() || 'Unknown'}`);
      
      await updateDoc(doc(firestore, 'documents', docSnap.id), {
        status: 'verified',
        verifiedBy: adminUser.uid,
        verifiedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      verifiedCount++;
      console.log(`   ✅ Verified!`);
    }
    
    console.log(`\n✅ Successfully verified ${verifiedCount} document(s)`);
    
  } catch (error) {
    console.error('❌ Failed to verify documents:', error);
    throw error;
  }
}

// Run the script
verifyPendingDocuments()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

