import { firestore } from '../../config/firebase';
import { collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { BaseEntity } from '../../types/common';

export type NotificationType = 
  | 'document_verification'
  | 'transfer_request'
  | 'transfer_approval'
  | 'expense_approval'
  | 'commission_approval'
  | 'document_expiry'
  | 'system_alert';

export type NotificationChannel = 'email' | 'push' | 'in-app';

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  body: string;
  channels: NotificationChannel[];
  variables: string[];
}

export interface UserNotificationPreferences {
  channels: {
    [K in NotificationChannel]: boolean;
  };
  types: {
    [K in NotificationType]: {
      enabled: boolean;
      channels: NotificationChannel[];
    };
  };
}

export interface Notification extends BaseEntity {
  type: NotificationType;
  title: string;
  body: string;
  recipientId: string;
  read: boolean;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  sentVia?: NotificationChannel[];
}

export class NotificationService {
  private readonly notificationsRef = collection(firestore, 'notifications');
  private readonly templatesRef = collection(firestore, 'notification_templates');
  private readonly preferencesRef = collection(firestore, 'notification_preferences');

  async sendNotification(
    type: NotificationType,
    recipientId: string,
    data: Record<string, any>,
    channels?: NotificationChannel[]
  ): Promise<string> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(recipientId);
      
      // Get notification template
      const template = await this.getTemplate(type);
      
      // Check if user wants this notification
      if (!preferences.types[type]?.enabled) {
        return '';
      }

      // Determine channels
      const activeChannels = channels || preferences.types[type]?.channels || ['in-app'];

      // Create notification
      const notificationRef = doc(this.notificationsRef);
      const notification: Notification = {
        id: notificationRef.id,
        type,
        title: this.interpolateTemplate(template.title, data),
        body: this.interpolateTemplate(template.body, data),
        recipientId,
        read: false,
        channels: activeChannels,
        metadata: data,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      };

      await setDoc(notificationRef, notification);

      // Send through each channel
      await Promise.all(
        activeChannels.map(channel => this.sendThroughChannel(channel, notification))
      );

      return notificationRef.id;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error('Failed to send notification');
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(this.notificationsRef, notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        this.notificationsRef,
        where('recipientId', '==', userId),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Notification);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get user notifications');
    }
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserNotificationPreferences>
  ): Promise<void> {
    try {
      const preferencesRef = doc(this.preferencesRef, userId);
      const currentPrefs = await this.getUserPreferences(userId);

      await setDoc(preferencesRef, {
        ...currentPrefs,
        ...preferences,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('Failed to update notification preferences');
    }
  }

  private async getUserPreferences(userId: string): Promise<UserNotificationPreferences> {
    try {
      const preferencesRef = doc(this.preferencesRef, userId);
      const preferencesDoc = await getDoc(preferencesRef);

      if (!preferencesDoc.exists()) {
        // Create default preferences
        const defaultPreferences: UserNotificationPreferences = {
          channels: {
            email: true,
            push: true,
            'in-app': true,
          },
          types: {
            document_verification: { enabled: true, channels: ['in-app', 'email'] },
            transfer_request: { enabled: true, channels: ['in-app', 'email', 'push'] },
            transfer_approval: { enabled: true, channels: ['in-app', 'email', 'push'] },
            expense_approval: { enabled: true, channels: ['in-app', 'email'] },
            commission_approval: { enabled: true, channels: ['in-app', 'email'] },
            document_expiry: { enabled: true, channels: ['in-app', 'email'] },
            system_alert: { enabled: true, channels: ['in-app'] },
          },
        };

        await setDoc(preferencesRef, defaultPreferences);
        return defaultPreferences;
      }

      return preferencesDoc.data() as UserNotificationPreferences;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw new Error('Failed to get notification preferences');
    }
  }

  private async getTemplate(type: NotificationType): Promise<NotificationTemplate> {
    try {
      const templateRef = doc(this.templatesRef, type);
      const templateDoc = await getDoc(templateRef);

      if (!templateDoc.exists()) {
        throw new Error(`Template not found for type: ${type}`);
      }

      return templateDoc.data() as NotificationTemplate;
    } catch (error) {
      console.error('Error getting notification template:', error);
      throw new Error('Failed to get notification template');
    }
  }

  private interpolateTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\${(\w+)}/g, (match, key) => data[key] || match);
  }

  private async sendThroughChannel(
    channel: NotificationChannel,
    notification: Notification
  ): Promise<void> {
    switch (channel) {
      case 'email':
        // Implement email sending
        break;
      case 'push':
        // Implement push notification
        break;
      case 'in-app':
        // In-app notifications are handled by storing in Firestore
        break;
    }
  }
}
