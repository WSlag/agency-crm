import { useState, useEffect } from 'react';
import { OfflineStore } from '../services/offlineStore';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPersistenceEnabled, setPersistenceEnabled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize offline persistence
    const initializeOfflineStore = async () => {
      try {
        const offlineStore = OfflineStore.getInstance();
        await offlineStore.initialize();
        setPersistenceEnabled(true);
      } catch (error) {
        console.error('Failed to initialize offline persistence:', error);
        setPersistenceEnabled(false);
      }
    };

    initializeOfflineStore();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isPersistenceEnabled,
    isOfflineCapable: isPersistenceEnabled,
  };
};
