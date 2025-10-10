import { OfflineStorage } from './offlineStorage';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

export class BackgroundSync {
  private static instance: BackgroundSync;
  private storage: OfflineStorage;
  private syncInProgress: boolean = false;

  private constructor() {
    this.storage = OfflineStorage.getInstance();
  }

  public static getInstance(): BackgroundSync {
    if (!BackgroundSync.instance) {
      BackgroundSync.instance = new BackgroundSync();
    }
    return BackgroundSync.instance;
  }

  public async registerSyncEvent(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
      } catch (error) {
        console.error('Failed to register sync event:', error);
        throw error;
      }
    } else {
      console.warn('Background sync not supported');
    }
  }

  public async syncData(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }

    this.syncInProgress = true;

    try {
      const pendingItems = await this.storage.getPendingSyncItems();
      console.log('Pending sync items:', pendingItems.length);

      for (const item of pendingItems) {
        try {
          await this.processSyncItem(item);
          await this.storage.deleteSyncItem(item.id);
        } catch (error) {
          console.error('Failed to process sync item:', error);
          await this.storage.updateSyncItem(item.id, 'failed');
        }
      }
    } catch (error) {
      console.error('Failed to sync data:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processSyncItem(item: any): Promise<void> {
    const timestamp = serverTimestamp();

    switch (item.operation) {
      case 'create':
        await this.handleCreate(item.type, item.data, timestamp);
        break;
      case 'update':
        await this.handleUpdate(item.type, item.data, timestamp);
        break;
      case 'delete':
        await this.handleDelete(item.type, item.data.id);
        break;
      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  private async handleCreate(
    type: string,
    data: any,
    timestamp: any
  ): Promise<void> {
    const docRef = doc(collection(db, type));
    await setDoc(docRef, {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Create audit log
    await setDoc(doc(collection(db, 'audit_logs')), {
      action: `${type}_created`,
      entityId: docRef.id,
      entityType: type,
      performedBy: data.createdBy || 'system',
      performedAt: timestamp,
      details: data,
      syncedFromOffline: true,
    });
  }

  private async handleUpdate(
    type: string,
    data: any,
    timestamp: any
  ): Promise<void> {
    const docRef = doc(db, type, data.id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: timestamp,
    });

    // Create audit log
    await setDoc(doc(collection(db, 'audit_logs')), {
      action: `${type}_updated`,
      entityId: data.id,
      entityType: type,
      performedBy: data.updatedBy || 'system',
      performedAt: timestamp,
      details: {
        changes: data,
      },
      syncedFromOffline: true,
    });
  }

  private async handleDelete(type: string, id: string): Promise<void> {
    const docRef = doc(db, type, id);
    await deleteDoc(docRef);

    // Create audit log
    await setDoc(doc(collection(db, 'audit_logs')), {
      action: `${type}_deleted`,
      entityId: id,
      entityType: type,
      performedBy: 'system',
      performedAt: serverTimestamp(),
      details: {
        id,
      },
      syncedFromOffline: true,
    });
  }

  public async retryFailedItems(): Promise<void> {
    try {
      const failedItems = await this.storage.query(
        'sync_queue',
        'status',
        'failed'
      );

      for (const item of failedItems) {
        if (item.attempts < 3) {
          // Reset status to pending for retry
          await this.storage.updateSyncItem(item.id, 'pending');
        }
      }

      // Trigger sync
      await this.registerSyncEvent('sync-data');
    } catch (error) {
      console.error('Failed to retry failed items:', error);
      throw error;
    }
  }

  public async cleanupSyncQueue(): Promise<void> {
    try {
      const failedItems = await this.storage.query(
        'sync_queue',
        'status',
        'failed'
      );

      // Remove items that have failed more than 3 times
      for (const item of failedItems) {
        if (item.attempts >= 3) {
          await this.storage.deleteSyncItem(item.id);
        }
      }

      // Remove successful items older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const successfulItems = await this.storage.query(
        'sync_queue',
        'status',
        'completed'
      );

      for (const item of successfulItems) {
        if (new Date(item.createdAt) < sevenDaysAgo) {
          await this.storage.deleteSyncItem(item.id);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup sync queue:', error);
      throw error;
    }
  }

  public async getSyncStatus(): Promise<{
    pending: number;
    failed: number;
    completed: number;
  }> {
    try {
      const [pending, failed, completed] = await Promise.all([
        this.storage.query('sync_queue', 'status', 'pending'),
        this.storage.query('sync_queue', 'status', 'failed'),
        this.storage.query('sync_queue', 'status', 'completed'),
      ]);

      return {
        pending: pending.length,
        failed: failed.length,
        completed: completed.length,
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      throw error;
    }
  }
}
