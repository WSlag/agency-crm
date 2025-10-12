import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notificationService } from '../NotificationService';
import { mockUser, mockServiceResponse, MockFirestore } from '../../utils/test/mockServices';

describe('NotificationService', () => {
  const mockFirestore = new MockFirestore();
  
  beforeEach(() => {
    mockFirestore.clearData();
    vi.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('creates a notification successfully', async () => {
      const notification = {
        userId: mockUser.uid,
        title: 'Test Notification',
        message: 'Test Message',
        type: 'system' as const,
        priority: 'low' as const,
        channels: ['in-app'] as const[]
      };

      const result = await notificationService.sendNotification(notification);
      expect(result).toBeDefined();
    });

    it('handles notification creation failure', async () => {
      const error = new Error('Failed to create notification');
      vi.spyOn(mockFirestore, 'collection').mockImplementationOnce(() => {
        throw error;
      });

      await expect(
        notificationService.sendNotification({
          userId: mockUser.uid,
          title: 'Test',
          message: 'Test',
          type: 'system',
          priority: 'low',
          channels: ['in-app']
        })
      ).rejects.toThrow(error);
    });
  });

  describe('getUnreadNotifications', () => {
    it('returns unread notifications for user', async () => {
      const notifications = [
        {
          id: 'notification-1',
          userId: mockUser.uid,
          title: 'Test 1',
          message: 'Message 1',
          type: 'system',
          priority: 'low',
          channels: ['in-app'],
          read: false,
          createdAt: new Date()
        },
        {
          id: 'notification-2',
          userId: mockUser.uid,
          title: 'Test 2',
          message: 'Message 2',
          type: 'system',
          priority: 'low',
          channels: ['in-app'],
          read: true,
          createdAt: new Date()
        }
      ];

      for (const notification of notifications) {
        await mockFirestore.collection('notifications').doc(notification.id).set(notification);
      }

      const unread = await notificationService.getUnreadNotifications(mockUser.uid);
      expect(unread).toHaveLength(1);
      expect(unread[0].id).toBe('notification-1');
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      const notification = {
        id: 'notification-1',
        userId: mockUser.uid,
        title: 'Test',
        message: 'Test',
        type: 'system',
        priority: 'low',
        channels: ['in-app'],
        read: false,
        createdAt: new Date()
      };

      await mockFirestore.collection('notifications').doc(notification.id).set(notification);
      await notificationService.markAsRead(notification.id);

      const updated = await mockFirestore.collection('notifications').doc(notification.id).get();
      expect(updated.data().read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read for user', async () => {
      const notifications = [
        {
          id: 'notification-1',
          userId: mockUser.uid,
          read: false
        },
        {
          id: 'notification-2',
          userId: mockUser.uid,
          read: false
        }
      ];

      for (const notification of notifications) {
        await mockFirestore.collection('notifications').doc(notification.id).set(notification);
      }

      await notificationService.markAllAsRead(mockUser.uid);

      const unread = await notificationService.getUnreadNotifications(mockUser.uid);
      expect(unread).toHaveLength(0);
    });
  });
});
