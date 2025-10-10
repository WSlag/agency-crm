import { useState, useEffect, useCallback } from 'react';
import { FCMService } from '../services/fcmService';

interface UseFCMResult {
  initialized: boolean;
  error: string | null;
  subscribeToTopic: (topic: string) => Promise<void>;
  unsubscribeFromTopic: (topic: string) => Promise<void>;
  deleteToken: () => Promise<void>;
}

export const useFCM = (): UseFCMResult => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initFCM = async () => {
      try {
        const fcm = FCMService.getInstance();
        await fcm.init();
        setInitialized(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize FCM');
        setInitialized(false);
      }
    };

    initFCM();
  }, []);

  const subscribeToTopic = useCallback(async (topic: string) => {
    try {
      const fcm = FCMService.getInstance();
      await fcm.subscribeToTopic(topic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to topic');
      throw err;
    }
  }, []);

  const unsubscribeFromTopic = useCallback(async (topic: string) => {
    try {
      const fcm = FCMService.getInstance();
      await fcm.unsubscribeFromTopic(topic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe from topic');
      throw err;
    }
  }, []);

  const deleteToken = useCallback(async () => {
    try {
      const fcm = FCMService.getInstance();
      await fcm.deleteToken();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete token');
      throw err;
    }
  }, []);

  return {
    initialized,
    error,
    subscribeToTopic,
    unsubscribeFromTopic,
    deleteToken,
  };
};
