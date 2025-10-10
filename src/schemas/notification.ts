import { z } from 'zod';
import { NOTIFICATION_TEMPLATES } from '../types/notification';

export const notificationActionSchema = z.object({
  action: z.string(),
  title: z.string(),
  url: z.string().url().optional(),
});

export const notificationSchema = z.object({
  type: z.enum(Object.keys(NOTIFICATION_TEMPLATES) as [keyof typeof NOTIFICATION_TEMPLATES, ...Array<keyof typeof NOTIFICATION_TEMPLATES>]),
  title: z.string(),
  body: z.string(),
  priority: z.enum(['low', 'normal', 'high']),
  status: z.enum(['unread', 'read', 'archived']),
  recipientId: z.string(),
  senderId: z.string().optional(),
  entityId: z.string().optional(),
  entityType: z.string().optional(),
  actions: z.array(notificationActionSchema).optional(),
  data: z.record(z.any()).optional(),
  icon: z.string().url().optional(),
  image: z.string().url().optional(),
  expiresAt: z.date().optional(),
});

export const pushSubscriptionSchema = z.object({
  userId: z.string(),
  endpoint: z.string().url(),
  auth: z.string(),
  p256dh: z.string(),
  userAgent: z.string(),
});

export const notificationPreferencesSchema = z.object({
  userId: z.string(),
  channels: z.object({
    push: z.boolean(),
    email: z.boolean(),
    inApp: z.boolean(),
  }),
  types: z.record(
    z.object({
      enabled: z.boolean(),
      push: z.boolean().optional(),
      email: z.boolean().optional(),
      inApp: z.boolean().optional(),
    })
  ),
  quiet_hours: z
    .object({
      enabled: z.boolean(),
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      timezone: z.string(),
    })
    .optional(),
});

export const notificationTemplateSchema = z.object({
  type: z.enum(Object.keys(NOTIFICATION_TEMPLATES) as [keyof typeof NOTIFICATION_TEMPLATES, ...Array<keyof typeof NOTIFICATION_TEMPLATES>]),
  title: z.string(),
  body: z.string(),
  priority: z.enum(['low', 'normal', 'high']),
  actions: z.array(notificationActionSchema).optional(),
  icon: z.string().url().optional(),
  data: z.record(z.any()).optional(),
});

export const emailTemplateSchema = z.object({
  type: z.enum(Object.keys(NOTIFICATION_TEMPLATES) as [keyof typeof NOTIFICATION_TEMPLATES, ...Array<keyof typeof NOTIFICATION_TEMPLATES>]),
  subject: z.string(),
  html: z.string(),
  text: z.string(),
  data: z.record(z.any()).optional(),
});

export const notificationBatchSchema = z.object({
  type: z.enum(Object.keys(NOTIFICATION_TEMPLATES) as [keyof typeof NOTIFICATION_TEMPLATES, ...Array<keyof typeof NOTIFICATION_TEMPLATES>]),
  recipients: z.array(z.string()),
  title: z.string(),
  body: z.string(),
  priority: z.enum(['low', 'normal', 'high']),
  actions: z.array(notificationActionSchema).optional(),
  data: z.record(z.any()).optional(),
  icon: z.string().url().optional(),
  image: z.string().url().optional(),
  scheduledFor: z.date().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  result: z
    .object({
      total: z.number(),
      successful: z.number(),
      failed: z.number(),
      errors: z.record(z.string()).optional(),
    })
    .optional(),
});

export const notificationChannelSchema = z.object({
  type: z.enum(['push', 'email', 'inApp']),
  enabled: z.boolean(),
  provider: z.string(),
  config: z.record(z.any()),
  templates: z
    .record(z.union([notificationTemplateSchema, emailTemplateSchema]))
    .optional(),
});

export const notificationFilterSchema = z.object({
  type: z
    .enum(Object.keys(NOTIFICATION_TEMPLATES) as [keyof typeof NOTIFICATION_TEMPLATES, ...Array<keyof typeof NOTIFICATION_TEMPLATES>])
    .optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  status: z.enum(['unread', 'read', 'archived']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  recipientId: z.string().optional(),
  senderId: z.string().optional(),
  entityId: z.string().optional(),
  entityType: z.string().optional(),
});
