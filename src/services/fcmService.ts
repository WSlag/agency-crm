import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../config/firebase';
import { useNotificationStore } from '../stores/notificationStore';
import type { Notification } from '../types/notification';

export class FCMService {
  private static instance: FCMService;
  private messaging: any;
  private vapidKey: string;

  private constructor() {
    this.messaging = getMessaging(app);
    this.vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY || '';
  }

  public static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  public async init(): Promise<void> {
    try {
      if (!('Notification' in window)) {
        throw new Error('This browser does not support desktop notification');
      }

      if (Notification.permission === 'denied') {
        throw new Error('User has blocked notifications');
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission not granted for Notification');
      }

      // Get FCM token
      const token = await this.getToken();
      if (!token) {
        throw new Error('No registration token available');
      }

      // Save token to database
      await this.saveToken(token);

      // Set up message handler
      this.onMessage();
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
      throw error;
    }
  }

  private async getToken(): Promise<string> {
    try {
      const currentToken = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
      });

      if (!currentToken) {
        throw new Error('No registration token available');
      }

      return currentToken;
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      throw error;
    }
  }

  private async saveToken(token: string): Promise<void> {
    try {
      const subscription = {
        endpoint: token,
        auth: '', // Not needed for FCM
        p256dh: '', // Not needed for FCM
        userAgent: navigator.userAgent,
      };

      await useNotificationStore.getState().updateSubscription(subscription as any);
    } catch (error) {
      console.error('Failed to save token:', error);
      throw error;
    }
  }

  private onMessage(): void {
    onMessage(this.messaging, (payload) => {
      console.log('Message received:', payload);

      // Convert FCM payload to notification format
      const notification: Notification = {
        id: payload.messageId || Date.now().toString(),
        type: payload.data?.type || 'message_received',
        title: payload.notification?.title || '',
        body: payload.notification?.body || '',
        priority: payload.data?.priority || 'normal',
        status: 'unread',
        recipientId: payload.data?.recipientId || '',
        senderId: payload.data?.senderId,
        entityId: payload.data?.entityId,
        entityType: payload.data?.entityType,
        actions: payload.data?.actions ? JSON.parse(payload.data.actions) : undefined,
        data: payload.data,
        icon: payload.notification?.icon,
        image: payload.notification?.image,
        createdAt: new Date(),
      };

      // Show browser notification
      this.showNotification(notification);

      // Update notification store
      this.updateNotificationStore(notification);
    });
  }

  private showNotification(notification: Notification): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon,
      image: notification.image,
      badge: '/badge-icon.png',
      tag: notification.id,
      renotify: true,
      requireInteraction: true,
      actions: notification.actions?.map((action) => ({
        action: action.action,
        title: action.title,
      })),
      data: {
        url: notification.actions?.[0]?.url,
        ...notification.data,
      },
    };

    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(notification.title, options);
    });
  }

  private async updateNotificationStore(notification: Notification): Promise<void> {
    try {
      const { notifications } = useNotificationStore.getState();
      useNotificationStore.setState({
        notifications: [notification, ...notifications],
      });
    } catch (error) {
      console.error('Failed to update notification store:', error);
    }
  }

  public async subscribeToTopic(topic: string): Promise<void> {
    try {
      const token = await this.getToken();
      // Call your backend API to subscribe to topic
      await fetch('/api/fcm/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          topic,
        }),
      });
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      throw error;
    }
  }

  public async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      const token = await this.getToken();
      // Call your backend API to unsubscribe from topic
      await fetch('/api/fcm/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          topic,
        }),
      });
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error);
      throw error;
    }
  }

  public async deleteToken(): Promise<void> {
    try {
      await this.messaging.deleteToken();
      await useNotificationStore.getState().deleteSubscription();
    } catch (error) {
      console.error('Failed to delete token:', error);
      throw error;
    }
  }
}
