import { useState, useEffect, useCallback } from 'react';
import { BackgroundSync } from '../services/backgroundSync';

interface UseBackgroundSyncResult {
  isSupported: boolean;
  syncStatus: {
    pending: number;
    failed: number;
    completed: number;
  } | null;
  syncInProgress: boolean;
  error: string | null;
  registerSync: (tag: string) => Promise<void>;
  syncData: () => Promise<void>;
  retryFailedItems: () => Promise<void>;
  cleanupSyncQueue: () => Promise<void>;
}

export const useBackgroundSync = (): UseBackgroundSyncResult => {
  const [isSupported, setIsSupported] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    pending: number;
    failed: number;
    completed: number;
  } | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = BackgroundSync.getInstance();

  useEffect(() => {
    // Check if background sync is supported
    setIsSupported('serviceWorker' in navigator && 'SyncManager' in window);

    // Get initial sync status
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      sync
        .getSyncStatus()
        .then(setSyncStatus)
        .catch((err) =>
          setError(err instanceof Error ? err.message : 'Failed to get sync status')
        );
    }
  }, []);

  const registerSync = useCallback(
    async (tag: string) => {
      try {
        setError(null);
        await sync.registerSyncEvent(tag);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to register sync');
        throw err;
      }
    },
    []
  );

  const syncData = useCallback(async () => {
    try {
      setError(null);
      setSyncInProgress(true);
      await sync.syncData();
      const status = await sync.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');
      throw err;
    } finally {
      setSyncInProgress(false);
    }
  }, []);

  const retryFailedItems = useCallback(async () => {
    try {
      setError(null);
      await sync.retryFailedItems();
      const status = await sync.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry failed items');
      throw err;
    }
  }, []);

  const cleanupSyncQueue = useCallback(async () => {
    try {
      setError(null);
      await sync.cleanupSyncQueue();
      const status = await sync.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cleanup sync queue');
      throw err;
    }
  }, []);

  // Set up periodic sync status update
  useEffect(() => {
    if (!isSupported) return;

    const updateStatus = async () => {
      try {
        const status = await sync.getSyncStatus();
        setSyncStatus(status);
      } catch (err) {
        console.error('Failed to update sync status:', err);
      }
    };

    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isSupported]);

  // Listen for sync events from service worker
  useEffect(() => {
    if (!isSupported) return;

    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'sync_complete') {
        const status = await sync.getSyncStatus();
        setSyncStatus(status);
        setSyncInProgress(false);
      } else if (event.data.type === 'sync_error') {
        setError(event.data.error);
        setSyncInProgress(false);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [isSupported]);

  return {
    isSupported,
    syncStatus,
    syncInProgress,
    error,
    registerSync,
    syncData,
    retryFailedItems,
    cleanupSyncQueue,
  };
};
