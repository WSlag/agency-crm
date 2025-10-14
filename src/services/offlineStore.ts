import { enableIndexedDbPersistence } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export class OfflineStore {
  private static instance: OfflineStore;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): OfflineStore {
    if (!OfflineStore.instance) {
      OfflineStore.instance = new OfflineStore();
    }
    return OfflineStore.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Use the singleton firestore instance
      await enableIndexedDbPersistence(firestore);
      this.isInitialized = true;
      console.log('Offline persistence enabled');
    } catch (error: any) {
      if (error.code === 'failed-precondition') {
        console.warn(
          'Multiple tabs open, persistence can only be enabled in one tab at a time.'
        );
      } else if (error.code === 'unimplemented') {
        console.warn(
          'The current browser does not support offline persistence'
        );
      }
      throw error;
    }
  }

  getFirestore() {
    // Return the singleton firestore instance, not a new one
    return firestore;
  }

  isOfflinePersistenceEnabled(): boolean {
    return this.isInitialized;
  }
}
