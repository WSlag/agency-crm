import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { environment } from '../config/environment';

export type NotificationType = 'expiry' | 'verification' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high';
export type NotificationChannel = 'email' | 'push' | 'in-app';

export interface NotificationConfig {
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
}

export interface Notification {
  id?: string;
  recipientId: string;
  userId?: string; // Deprecated, use recipientId
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  sentVia?: NotificationChannel[];
  error?: string;
  retryCount?: number; // Track number of retry attempts
}

class NotificationService {
  private static instance: NotificationService;
  private messaging: any;
  private notificationQueue: Map<string, Notification>;
  private processingQueue: boolean;
  private readonly MAX_RETRY_ATTEMPTS = 3; // Maximum retry attempts before giving up

  private constructor() {
    this.notificationQueue = new Map();
    this.processingQueue = false;
    this.initializeMessaging();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeMessaging() {
    try {
      this.messaging = getMessaging();
      
      // Request permission and get token
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: environment.firebase.vapidKey
        });
        console.log('FCM Token:', token);
      }

      // Handle foreground messages
      onMessage(this.messaging, (payload: MessagePayload) => {
        console.log('Received foreground message:', payload);
        this.showNotification(payload);
      });
    } catch (error) {
      console.error('Error initializing messaging:', error);
    }
  }

  private async showNotification(payload: MessagePayload) {
    if (!('Notification' in window)) return;

    try {
      const { title, body, icon } = payload.notification || {};
      await new Notification(title || 'New Notification', {
        body,
        icon: icon || '/logo192.png'
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    try {
      const newNotification: Notification = {
        ...notification,
        createdAt: new Date(),
        sentVia: [],
        read: false,
        retryCount: 0
      };

      // Add to Firestore
      const docRef = await addDoc(collection(firestore, 'notifications'), newNotification);
      
      // Add to queue for processing
      this.notificationQueue.set(docRef.id, { ...newNotification, id: docRef.id });
      
      // Process queue if not already processing
      if (!this.processingQueue) {
        this.processQueue();
      }

      return docRef.id;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  private async processQueue() {
    if (this.notificationQueue.size === 0) {
      this.processingQueue = false;
      return;
    }

    this.processingQueue = true;

    for (const [id, notification] of this.notificationQueue) {
      try {
        // Process each channel
        for (const channel of notification.channels) {
          if (!notification.sentVia?.includes(channel)) {
            await this.sendViaChannel(notification, channel);
            notification.sentVia = [...(notification.sentVia || []), channel];
          }
        }

        // Update Firestore
        const notificationRef = doc(firestore, 'notifications', id);
        await updateDoc(notificationRef, {
          sentVia: notification.sentVia,
          error: null,
          retryCount: 0
        });

        // Remove from queue
        this.notificationQueue.delete(id);
      } catch (error) {
        console.error(`Error processing notification ${id}:`, error);

        // Increment retry count
        const currentRetryCount = notification.retryCount || 0;
        notification.retryCount = currentRetryCount + 1;

        // Check if max retries exceeded
        if (notification.retryCount >= this.MAX_RETRY_ATTEMPTS) {
          console.error(`Max retry attempts (${this.MAX_RETRY_ATTEMPTS}) reached for notification ${id}. Removing from queue.`);

          // Update Firestore with final error status
          const notificationRef = doc(firestore, 'notifications', id);
          await updateDoc(notificationRef, {
            error: `Failed after ${this.MAX_RETRY_ATTEMPTS} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            retryCount: notification.retryCount
          });

          // Remove from queue - stop retrying
          this.notificationQueue.delete(id);
        } else {
          // Update Firestore with error and retry count
          console.warn(`Retry ${notification.retryCount}/${this.MAX_RETRY_ATTEMPTS} for notification ${id}`);

          const notificationRef = doc(firestore, 'notifications', id);
          await updateDoc(notificationRef, {
            error: error instanceof Error ? error.message : 'Unknown error',
            retryCount: notification.retryCount
          });
          // Keep in queue for retry
        }
      }
    }

    // Process any remaining notifications
    if (this.notificationQueue.size > 0) {
      setTimeout(() => this.processQueue(), 5000); // Retry after 5 seconds
    } else {
      this.processingQueue = false;
    }
  }

  private async sendViaChannel(notification: Notification, channel: NotificationChannel) {
    switch (channel) {
      case 'push':
        return this.sendPushNotification(notification);
      case 'email':
        return this.sendEmailNotification(notification);
      case 'in-app':
        return this.sendInAppNotification(notification);
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
  }

  private async sendPushNotification(notification: Notification) {
    // Implementation will depend on your FCM setup
    console.log('Sending push notification:', notification);
  }

  private async sendEmailNotification(notification: Notification) {
    // Implementation will depend on your email service
    console.log('Sending email notification:', notification);
  }

  private async sendInAppNotification(notification: Notification) {
    // Store in Firestore for in-app display
    console.log('Sending in-app notification:', notification);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(firestore, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
  }

  async markAsRead(notificationId: string) {
    const notificationRef = doc(firestore, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  }

  async markAllAsRead(userId: string) {
    const q = query(
      collection(firestore, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);
  }
}

export const notificationService = NotificationService.getInstance();
