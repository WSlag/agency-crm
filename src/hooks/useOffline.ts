import { useState, useEffect, useCallback } from 'react';
import { offlineService } from '../services/OfflineService';

interface UseOfflineResult {
  isOnline: boolean;
  isInitialized: boolean;
  syncStatus: {
    pending: number;
    failed: number;
    completed: number;
    lastSync?: Date;
  } | null;
  error: string | null;
  saveOffline: <T extends { id: string }>(
    collection: string,
    data: T
  ) => Promise<void>;
  getOfflineData: (collection: string) => Promise<any[]>;
  syncData: () => Promise<void>;
  retryFailedSync: () => Promise<void>;
}

export function useOffline(): UseOfflineResult {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize offline service
  useEffect(() => {
    const initOffline = async () => {
      try {
        await offlineService.init();
        setIsInitialized(true);
        updateSyncStatus();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize offline mode');
      }
    };

    initOffline();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update sync status
  const updateSyncStatus = async () => {
    try {
      const status = await offlineService.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get sync status');
    }
  };

  // Save data offline
  const saveOffline = useCallback(async <T extends { id: string }>(
    collection: string,
    data: T
  ): Promise<void> => {
    try {
      setError(null);
      switch (collection) {
        case 'templates':
          await offlineService.saveTemplateOffline(data);
          break;
        case 'notifications':
          await offlineService.saveNotificationOffline(data);
          break;
        case 'documents':
          await offlineService.saveDocumentOffline(data);
          break;
        default:
          throw new Error(`Unsupported collection: ${collection}`);
      }
      await updateSyncStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save offline data');
      throw err;
    }
  }, []);

  // Get offline data
  const getOfflineData = useCallback(async (collection: string): Promise<any[]> => {
    try {
      setError(null);
      switch (collection) {
        case 'templates':
          return offlineService.getOfflineTemplate(collection);
        case 'notifications':
          return offlineService.getOfflineNotifications();
        case 'documents':
          return offlineService.getOfflineDocuments();
        default:
          throw new Error(`Unsupported collection: ${collection}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get offline data');
      throw err;
    }
  }, []);

  // Sync data
  const syncData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await offlineService.processSyncQueue();
      await updateSyncStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');
      throw err;
    }
  }, []);

  // Retry failed sync
  const retryFailedSync = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await offlineService.retryFailedItems();
      await updateSyncStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry sync');
      throw err;
    }
  }, []);

  return {
    isOnline,
    isInitialized,
    syncStatus,
    error,
    saveOffline,
    getOfflineData,
    syncData,
    retryFailedSync
  };
}