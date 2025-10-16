import { create } from 'zustand';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type {
  Notification,
  NotificationFilter,
  NotificationSort,
  NotificationPagination,
  NotificationPreferences,
  NotificationStats,
  PushSubscription,
} from '../types/notification';
import { useAuthStore } from './authStore';

interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  subscription: PushSubscription | null;
  stats: NotificationStats | null;
  selectedNotification: Notification | null;
  loading: boolean;
  error: string | null;
  filter: NotificationFilter;
  sort: NotificationSort;
  pagination: NotificationPagination;

  // Actions
  setFilter: (filter: NotificationFilter) => void;
  setSort: (sort: NotificationSort) => void;
  setPagination: (pagination: NotificationPagination) => void;

  // Notification Operations
  fetchNotifications: () => Promise<void>;
  fetchNotificationById: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Preferences Operations
  fetchPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;

  // Push Subscription Operations
  fetchSubscription: () => Promise<void>;
  updateSubscription: (subscription: PushSubscription) => Promise<void>;
  deleteSubscription: () => Promise<void>;

  // Stats Operations
  fetchStats: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  preferences: null,
  subscription: null,
  stats: null,
  selectedNotification: null,
  loading: false,
  error: null,
  filter: {},
  sort: {
    field: 'createdAt',
    direction: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },

  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
  setPagination: (pagination) => set({ pagination }),

  fetchNotifications: async () => {
    try {
      set({ loading: true, error: null });
      const { filter, sort, pagination } = get();
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      let q = collection(firestore, 'notifications');

      // Apply filters
      q = query(q, where('recipientId', '==', user.uid));

      if (filter.type) {
        q = query(q, where('type', '==', filter.type));
      }
      if (filter.priority) {
        q = query(q, where('priority', '==', filter.priority));
      }
      if (filter.status) {
        q = query(q, where('status', '==', filter.status));
      }
      if (filter.startDate) {
        q = query(q, where('createdAt', '>=', filter.startDate));
      }
      if (filter.endDate) {
        q = query(q, where('createdAt', '<=', filter.endDate));
      }

      // Apply sorting
      q = query(q, orderBy(sort.field, sort.direction));

      // Apply pagination
      q = query(q, limit(pagination.limit));
      if (pagination.page > 1 && get().notifications.length > 0) {
        const lastDoc = get().notifications[get().notifications.length - 1];
        q = query(q, startAfter(lastDoc[sort.field]));
      }

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : new Date(),
          readAt: data.readAt?.toDate ? data.readAt.toDate() : data.readAt ? new Date(data.readAt) : undefined,
        };
      }) as Notification[];

      set({ notifications, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        loading: false,
      });
    }
  },

  fetchNotificationById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'notifications', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          selectedNotification: {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : new Date(),
            readAt: data.readAt?.toDate ? data.readAt.toDate() : data.readAt ? new Date(data.readAt) : undefined,
          } as Notification,
          loading: false,
        });
      } else {
        set({
          error: 'Notification not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notification',
        loading: false,
      });
    }
  },

  markAsRead: async (id) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      await updateDoc(doc(firestore, 'notifications', id), {
        status: 'read',
        readAt: timestamp,
      });

      // Update local state
      const notifications = get().notifications.map((n) =>
        n.id === id ? { ...n, status: 'read', readAt: new Date() } : n
      );
      set({ notifications });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark notification as read',
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  markAllAsRead: async () => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const batch = firestore.batch();
      const timestamp = serverTimestamp();

      // Update all unread notifications
      const unreadNotifications = get().notifications.filter(
        (n) => n.status === 'unread'
      );

      unreadNotifications.forEach((notification) => {
        const docRef = doc(firestore, 'notifications', notification.id);
        batch.update(docRef, {
          status: 'read',
          readAt: timestamp,
        });
      });

      await batch.commit();

      // Update local state
      const notifications = get().notifications.map((n) =>
        n.status === 'unread' ? { ...n, status: 'read', readAt: new Date() } : n
      );
      set({ notifications });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  archiveNotification: async (id) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      await updateDoc(doc(firestore, 'notifications', id), {
        status: 'archived',
        updatedAt: timestamp,
      });

      // Update local state
      const notifications = get().notifications.filter((n) => n.id !== id);
      set({ notifications });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to archive notification',
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  deleteNotification: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(firestore, 'notifications', id));

      // Update local state
      const notifications = get().notifications.filter((n) => n.id !== id);
      set({ notifications });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete notification',
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchPreferences: async () => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const docRef = doc(firestore, 'notification_preferences', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({
          preferences: docSnap.data() as NotificationPreferences,
          loading: false,
        });
      } else {
        // Create default preferences
        const defaultPreferences: NotificationPreferences = {
          userId: user.uid,
          channels: {
            push: true,
            email: true,
            inApp: true,
          },
          types: Object.keys(NOTIFICATION_TEMPLATES).reduce(
            (acc, type) => ({
              ...acc,
              [type]: {
                enabled: true,
                push: true,
                email: true,
                inApp: true,
              },
            }),
            {}
          ),
          updatedAt: new Date(),
        };

        await setDoc(docRef, defaultPreferences);
        set({ preferences: defaultPreferences, loading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch preferences',
        loading: false,
      });
    }
  },

  updatePreferences: async (preferences) => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const timestamp = serverTimestamp();
      const docRef = doc(firestore, 'notification_preferences', user.uid);

      await updateDoc(docRef, {
        ...preferences,
        updatedAt: timestamp,
      });

      // Update local state
      const currentPreferences = get().preferences;
      set({
        preferences: currentPreferences
          ? { ...currentPreferences, ...preferences, updatedAt: new Date() }
          : null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update preferences',
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchSubscription: async () => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const docRef = doc(firestore, 'push_subscriptions', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({
          subscription: docSnap.data() as PushSubscription,
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch subscription',
        loading: false,
      });
    }
  },

  updateSubscription: async (subscription) => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const timestamp = serverTimestamp();
      const docRef = doc(firestore, 'push_subscriptions', user.uid);

      await setDoc(docRef, {
        ...subscription,
        updatedAt: timestamp,
      });

      set({ subscription, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update subscription',
        loading: false,
      });
    }
  },

  deleteSubscription: async () => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      await deleteDoc(doc(firestore, 'push_subscriptions', user.uid));
      set({ subscription: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete subscription',
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get notification counts
      const q = query(
        collection(firestore, 'notifications'),
        where('recipientId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map((doc) => doc.data() as Notification);

      // Calculate stats
      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter((n) => n.status === 'unread').length,
        byType: {},
        byPriority: {
          low: 0,
          normal: 0,
          high: 0,
        },
        byStatus: {
          unread: 0,
          read: 0,
          archived: 0,
        },
      };

      notifications.forEach((notification) => {
        // Count by type
        stats.byType[notification.type] =
          (stats.byType[notification.type] || 0) + 1;

        // Count by priority
        stats.byPriority[notification.priority]++;

        // Count by status
        stats.byStatus[notification.status]++;
      });

      set({ stats, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        loading: false,
      });
    }
  },
}));
