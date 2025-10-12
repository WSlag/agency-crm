import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { environment, isProduction } from './environment';

const firebaseConfig = environment.firebase;

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Configure Firestore with persistence before initializing
let firestore: ReturnType<typeof getFirestore>;

// Initialize Firestore with persistence
const initializeFirestore = async () => {
  if (!isProduction) {
    try {
      // Enable persistence before getting Firestore instance
      await enableIndexedDbPersistence(getFirestore(app));
      console.log('Firestore persistence enabled successfully');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      } else {
        console.error('Error enabling persistence:', err);
      }
    }
  }
  
  // Get Firestore instance after persistence setup attempt
  firestore = getFirestore(app);
};

// Initialize Firestore
initializeFirestore();

export { firestore };
export const storage = getStorage(app);

// Initialize Analytics only in production
export const analytics = isProduction ? getAnalytics(app) : null;

// Export a function to get the current Firebase instance
export const getFirebaseInstance = () => {
  return {
    app,
    auth,
    firestore,
    storage,
    analytics,
  };
};