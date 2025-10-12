import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

// Initialize the admin SDK
const serviceAccount = JSON.parse(readFileSync('service-account.json', 'utf-8'));

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://crm-agency-22f30.firebaseio.com`
});

export const db = getFirestore();
export const auth = getAuth();
