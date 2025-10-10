import { useState, useEffect, useCallback } from 'react';
import { OfflineStorage } from '../services/offlineStorage';

interface UseOfflineStorageResult {
  initialized: boolean;
  error: string | null;
  add: <T extends { id: string }>(storeName: string, data: T) => Promise<string>;
  get: <T>(storeName: string, id: string) => Promise<T | null>;
  getAll: <T>(storeName: string) => Promise<T[]>;
  update: <T extends { id: string }>(storeName: string, data: T) => Promise<void>;
  delete: (storeName: string, id: string) => Promise<void>;
  clear: (storeName: string) => Promise<void>;
  query: <T>(
    storeName: string,
    indexName: string,
    query: IDBValidKey | IDBKeyRange
  ) => Promise<T[]>;
  addToSyncQueue: (
    type: string,
    data: any,
    operation: 'create' | 'update' | 'delete'
  ) => Promise<void>;
  getPendingSyncItems: () => Promise<any[]>;
  updateSyncItem: (id: string, status: string) => Promise<void>;
  deleteSyncItem: (id: string) => Promise<void>;
}

export const useOfflineStorage = (): UseOfflineStorageResult => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storage = OfflineStorage.getInstance();

  useEffect(() => {
    const init = async () => {
      try {
        await storage.init();
        setInitialized(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize offline storage');
        setInitialized(false);
      }
    };

    init();
  }, []);

  const add = useCallback(
    async <T extends { id: string }>(storeName: string, data: T): Promise<string> => {
      try {
        return await storage.add(storeName, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add item');
        throw err;
      }
    },
    []
  );

  const get = useCallback(
    async <T>(storeName: string, id: string): Promise<T | null> => {
      try {
        return await storage.get<T>(storeName, id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get item');
        throw err;
      }
    },
    []
  );

  const getAll = useCallback(
    async <T>(storeName: string): Promise<T[]> => {
      try {
        return await storage.getAll<T>(storeName);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get items');
        throw err;
      }
    },
    []
  );

  const update = useCallback(
    async <T extends { id: string }>(storeName: string, data: T): Promise<void> => {
      try {
        await storage.update(storeName, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update item');
        throw err;
      }
    },
    []
  );

  const deleteItem = useCallback(
    async (storeName: string, id: string): Promise<void> => {
      try {
        await storage.delete(storeName, id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete item');
        throw err;
      }
    },
    []
  );

  const clear = useCallback(
    async (storeName: string): Promise<void> => {
      try {
        await storage.clear(storeName);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to clear store');
        throw err;
      }
    },
    []
  );

  const query = useCallback(
    async <T>(
      storeName: string,
      indexName: string,
      query: IDBValidKey | IDBKeyRange
    ): Promise<T[]> => {
      try {
        return await storage.query<T>(storeName, indexName, query);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to query items');
        throw err;
      }
    },
    []
  );

  const addToSyncQueue = useCallback(
    async (
      type: string,
      data: any,
      operation: 'create' | 'update' | 'delete'
    ): Promise<void> => {
      try {
        await storage.addToSyncQueue(type, data, operation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add to sync queue');
        throw err;
      }
    },
    []
  );

  const getPendingSyncItems = useCallback(async (): Promise<any[]> => {
    try {
      return await storage.getPendingSyncItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get pending sync items');
      throw err;
    }
  }, []);

  const updateSyncItem = useCallback(
    async (id: string, status: string): Promise<void> => {
      try {
        await storage.updateSyncItem(id, status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update sync item');
        throw err;
      }
    },
    []
  );

  const deleteSyncItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        await storage.deleteSyncItem(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete sync item');
        throw err;
      }
    },
    []
  );

  return {
    initialized,
    error,
    add,
    get,
    getAll,
    update,
    delete: deleteItem,
    clear,
    query,
    addToSyncQueue,
    getPendingSyncItems,
    updateSyncItem,
    deleteSyncItem,
  };
};
