export class OfflineStorage {
  private static instance: OfflineStorage;
  private db: IDBDatabase | null = null;
  private dbName = 'agency-crm';
  private version = 1;

  private constructor() {}

  public static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  public async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await this.openDatabase();
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      throw error;
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expenseStore.createIndex('status', 'status');
          expenseStore.createIndex('branchId', 'branchId');
          expenseStore.createIndex('applicantId', 'applicantId');
        }

        if (!db.objectStoreNames.contains('commissions')) {
          const commissionStore = db.createObjectStore('commissions', { keyPath: 'id' });
          commissionStore.createIndex('status', 'status');
          commissionStore.createIndex('agentId', 'agentId');
          commissionStore.createIndex('applicantId', 'applicantId');
        }

        if (!db.objectStoreNames.contains('applicants')) {
          const applicantStore = db.createObjectStore('applicants', { keyPath: 'id' });
          applicantStore.createIndex('status', 'status');
          applicantStore.createIndex('branchId', 'branchId');
          applicantStore.createIndex('currentStage', 'currentStage');
        }

        if (!db.objectStoreNames.contains('documents')) {
          const documentStore = db.createObjectStore('documents', { keyPath: 'id' });
          documentStore.createIndex('applicantId', 'applicantId');
          documentStore.createIndex('type', 'type');
          documentStore.createIndex('status', 'status');
        }

        if (!db.objectStoreNames.contains('notifications')) {
          const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notificationStore.createIndex('status', 'status');
          notificationStore.createIndex('recipientId', 'recipientId');
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncQueueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncQueueStore.createIndex('type', 'type');
          syncQueueStore.createIndex('status', 'status');
        }
      };
    });
  }

  public async add<T extends { id: string }>(
    storeName: string,
    data: T
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(data.id);
    });
  }

  public async get<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  public async update<T extends { id: string }>(
    storeName: string,
    data: T
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  public async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  public async clear(storeName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  public async query<T>(
    storeName: string,
    indexName: string,
    query: IDBValidKey | IDBKeyRange
  ): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(query);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  public async addToSyncQueue(
    type: string,
    data: any,
    operation: 'create' | 'update' | 'delete'
  ): Promise<void> {
    const syncItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      operation,
      status: 'pending',
      createdAt: new Date(),
      attempts: 0,
    };

    await this.add('sync_queue', syncItem);
  }

  public async getPendingSyncItems(): Promise<any[]> {
    return this.query('sync_queue', 'status', 'pending');
  }

  public async updateSyncItem(id: string, status: string): Promise<void> {
    const item = await this.get('sync_queue', id);
    if (item) {
      item.status = status;
      item.attempts += 1;
      item.lastAttempt = new Date();
      await this.update('sync_queue', item);
    }
  }

  public async deleteSyncItem(id: string): Promise<void> {
    await this.delete('sync_queue', id);
  }
}
