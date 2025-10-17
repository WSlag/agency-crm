/**
 * Script to set a user as admin for testing commission features
 * Run with: npx tsx src/scripts/setUserAsAdmin.ts
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import * as readline from 'readline';

// Initialize Firebase (using your config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function setUserAsAdmin() {
  try {
    console.log('🔧 Set User as Admin for Commission Testing\n');

    // Get user email
    const email = await question('Enter user email: ');
    const password = await question('Enter user password: ');

    console.log('\n🔐 Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log(`✅ Signed in as: ${user.email}`);
    console.log(`📋 User ID: ${user.uid}`);

    // Get current user document
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error('❌ User document not found in Firestore!');
      rl.close();
      return;
    }

    const currentRole = userDoc.data().role;
    console.log(`📊 Current role: ${currentRole}`);

    // Ask for confirmation
    const confirm = await question('\n⚠️  Update role to "admin"? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled.');
      rl.close();
      return;
    }

    // Update role to admin
    console.log('\n🔄 Updating user role...');
    await updateDoc(userDocRef, {
      role: 'admin',
      updatedAt: new Date(),
    });

    console.log('✅ Successfully updated role to admin!');
    console.log('\n📝 Next steps:');
    console.log('1. Refresh your browser (F5)');
    console.log('2. Navigate to the commission detail page');
    console.log('3. You should now see "Approve Commission" button');
    console.log('4. After approving, "Record Payment" button will appear\n');

    rl.close();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    rl.close();
  }
}

setUserAsAdmin();

