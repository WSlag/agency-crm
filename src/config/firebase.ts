import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { environment, isProduction } from './environment';

const firebaseConfig = environment.firebase;

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only in production
export const analytics = isProduction ? getAnalytics(app) : null;

// Configure Firestore settings
if (!isProduction) {
  // Enable Firestore offline persistence for development and staging
  firestore.enablePersistence({
    synchronizeTabs: true,
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
}

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