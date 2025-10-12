import { openDB, IDBPDatabase } from 'idb';
import { performanceMonitor } from '../utils/performanceMonitoring';

interface SyncItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

interface SyncStatus {
  pending: number;
  failed: number;
  completed: number;
  lastSync?: Date;
}

class OfflineService {
  private static instance: OfflineService;
  private db: IDBPDatabase | null = null;
  private readonly DB_NAME = 'agency_offline_db';
  private readonly DB_VERSION = 1;
  private readonly MAX_RETRIES = 3;
  private syncInProgress = false;

  private constructor() {}

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async init(): Promise<void> {
    try {
      this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Create stores
          if (!db.objectStoreNames.contains('sync_queue')) {
            db.createObjectStore('sync_queue', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('templates')) {
            db.createObjectStore('templates', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('notifications')) {
            db.createObjectStore('notifications', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('documents')) {
            db.createObjectStore('documents', { keyPath: 'id' });
          }
        }
      });

      // Register sync event if service worker is available
      if ('serviceWorker' in navigator && 'sync' in window.registration) {
        try {
          await window.registration.sync.register('sync-data');
        } catch (error) {
          console.warn('Background sync registration failed:', error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
      throw error;
    }
  }

  async addToSyncQueue(item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const syncItem: SyncItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      ...item
    };

    await this.db.add('sync_queue', syncItem);
    return syncItem.id;
  }

  async processSyncQueue(): Promise<void> {
    if (!this.db || this.syncInProgress) return;

    const startTime = performance.now();
    this.syncInProgress = true;

    try {
      const tx = this.db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const pendingItems = await store.index('status').getAll('pending');

      for (const item of pendingItems) {
        try {
          await this.processSyncItem(item);
          item.status = 'completed';
        } catch (error) {
          item.retryCount++;
          item.status = item.retryCount >= this.MAX_RETRIES ? 'failed' : 'pending';
          item.error = error instanceof Error ? error.message : 'Sync failed';
        }
        await store.put(item);
      }

      await tx.done;
    } finally {
      this.syncInProgress = false;
      performanceMonitor.measureRender('SyncQueue', startTime);
    }
  }

  private async processSyncItem(item: SyncItem): Promise<void> {
    // Implementation depends on the operation and collection
    switch (item.collection) {
      case 'templates':
        await this.syncTemplate(item);
        break;
      case 'notifications':
        await this.syncNotification(item);
        break;
      case 'documents':
        await this.syncDocument(item);
        break;
      default:
        throw new Error(`Unsupported collection: ${item.collection}`);
    }
  }

  private async syncTemplate(item: SyncItem): Promise<void> {
    // Template sync logic
  }

  private async syncNotification(item: SyncItem): Promise<void> {
    // Notification sync logic
  }

  private async syncDocument(item: SyncItem): Promise<void> {
    // Document sync logic
  }

  async getSyncStatus(): Promise<SyncStatus> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    
    const [pending, failed, completed] = await Promise.all([
      store.index('status').count('pending'),
      store.index('status').count('failed'),
      store.index('status').count('completed')
    ]);

    return {
      pending,
      failed,
      completed,
      lastSync: new Date()
    };
  }

  async retryFailedItems(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const failedItems = await store.index('status').getAll('failed');

    for (const item of failedItems) {
      item.status = 'pending';
      item.retryCount = 0;
      item.error = undefined;
      await store.put(item);
    }

    await tx.done;
    await this.processSyncQueue();
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    await store.clear();
    await tx.done;
  }

  // Template offline storage
  async saveTemplateOffline(template: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('templates', template);
    await this.addToSyncQueue({
      operation: 'create',
      collection: 'templates',
      data: template
    });
  }

  async getOfflineTemplate(id: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get('templates', id);
  }

  // Notification offline storage
  async saveNotificationOffline(notification: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('notifications', notification);
    await this.addToSyncQueue({
      operation: 'create',
      collection: 'notifications',
      data: notification
    });
  }

  async getOfflineNotifications(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAll('notifications');
  }

  // Document offline storage
  async saveDocumentOffline(document: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('documents', document);
    await this.addToSyncQueue({
      operation: 'create',
      collection: 'documents',
      data: document
    });
  }

  async getOfflineDocuments(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAll('documents');
  }
}

export const offlineService = OfflineService.getInstance();
