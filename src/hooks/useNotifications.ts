import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '../services/NotificationService';
import { useNotificationStore } from '../stores/notificationStore';

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(userId: string): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscribeToNotifications = useNotificationStore(state => state.subscribeToNotifications);
  const storeNotifications = useNotificationStore(state => state.notifications);
  const storeLoading = useNotificationStore(state => state.loading);
  const storeError = useNotificationStore(state => state.error);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const unreadNotifications = await notificationService.getUnreadNotifications(userId);
      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Set up real-time listener on mount
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId);

    // Cleanup: unsubscribe when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, subscribeToNotifications]);

  // Sync with store state
  useEffect(() => {
    setNotifications(storeNotifications);
    setUnreadCount(storeNotifications.filter(n => n.status === 'unread').length);
    setLoading(storeLoading);
    if (storeError) {
      setError(storeError);
    }
  }, [storeNotifications, storeLoading, storeError]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
}
