export type NotificationType =
  | 'transfer_request'
  | 'transfer_approved'
  | 'transfer_rejected'
  | 'officer_assigned'
  | 'expense_verified'
  | 'expense_approved'
  | 'expense_rejected'
  | 'commission_verified'
  | 'commission_approved'
  | 'commission_rejected'
  | 'document_verified'
  | 'document_rejected'
  | 'document_expiring'
  | 'stage_change'
  | 'task_assigned'
  | 'message_received';

export type NotificationPriority = 'low' | 'normal' | 'high';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface NotificationAction {
  action: string;
  title: string;
  url?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  recipientId: string;
  senderId?: string;
  entityId?: string;
  entityType?: string;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  icon?: string;
  image?: string;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
  types: {
    [key in NotificationType]: {
      enabled: boolean;
      push?: boolean;
      email?: boolean;
      inApp?: boolean;
    };
  };
  quiet_hours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
  };
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  actions?: NotificationAction[];
  icon?: string;
  data?: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  type: NotificationType;
  subject: string;
  html: string;
  text: string;
  data?: Record<string, any>;
}

export interface NotificationBatch {
  id: string;
  type: NotificationType;
  recipients: string[];
  title: string;
  body: string;
  priority: NotificationPriority;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  icon?: string;
  image?: string;
  createdAt: Date;
  scheduledFor?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    total: number;
    successful: number;
    failed: number;
    errors?: Record<string, string>;
  };
}

export interface NotificationChannel {
  type: 'push' | 'email' | 'inApp';
  enabled: boolean;
  provider: string;
  config: Record<string, any>;
  templates?: {
    [key in NotificationType]?: NotificationTemplate | EmailTemplate;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    [key in NotificationType]: number;
  };
  byPriority: {
    [key in NotificationPriority]: number;
  };
  byStatus: {
    [key in NotificationStatus]: number;
  };
}

export interface NotificationFilter {
  type?: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  startDate?: Date;
  endDate?: Date;
  recipientId?: string;
  senderId?: string;
  entityId?: string;
  entityType?: string;
}

export interface NotificationSort {
  field: keyof Notification;
  direction: 'asc' | 'desc';
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
}

export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  transfer_request: {
    id: 'transfer_request',
    type: 'transfer_request',
    title: 'New Transfer Request',
    body: 'A new transfer request has been submitted for {{applicantName}} from {{branchName}}.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Request',
        url: '/transfers/{{transferId}}',
      },
    ],
  },
  transfer_approved: {
    id: 'transfer_approved',
    type: 'transfer_approved',
    title: 'Transfer Request Approved',
    body: 'The transfer request for {{applicantName}} has been approved.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Details',
        url: '/transfers/{{transferId}}',
      },
    ],
  },
  transfer_rejected: {
    id: 'transfer_rejected',
    type: 'transfer_rejected',
    title: 'Transfer Request Rejected',
    body: 'The transfer request for {{applicantName}} has been rejected.',
    priority: 'high',
    actions: [
      {
        action: 'view',
        title: 'View Details',
        url: '/transfers/{{transferId}}',
      },
    ],
  },
  officer_assigned: {
    id: 'officer_assigned',
    type: 'officer_assigned',
    title: 'New Applicant Assigned',
    body: 'You have been assigned to handle {{applicantName}}\'s application.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Applicant',
        url: '/applicants/{{applicantId}}',
      },
    ],
  },
  expense_verified: {
    id: 'expense_verified',
    type: 'expense_verified',
    title: 'Expense Verified',
    body: 'An expense of {{amount}} has been verified.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Expense',
        url: '/expenses/{{expenseId}}',
      },
    ],
  },
  expense_approved: {
    id: 'expense_approved',
    type: 'expense_approved',
    title: 'Expense Approved',
    body: 'An expense of {{amount}} has been approved.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Expense',
        url: '/expenses/{{expenseId}}',
      },
    ],
  },
  expense_rejected: {
    id: 'expense_rejected',
    type: 'expense_rejected',
    title: 'Expense Rejected',
    body: 'An expense of {{amount}} has been rejected.',
    priority: 'high',
    actions: [
      {
        action: 'view',
        title: 'View Expense',
        url: '/expenses/{{expenseId}}',
      },
    ],
  },
  commission_verified: {
    id: 'commission_verified',
    type: 'commission_verified',
    title: 'Commission Verified',
    body: 'A commission of {{amount}} has been verified.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Commission',
        url: '/commissions/{{commissionId}}',
      },
    ],
  },
  commission_approved: {
    id: 'commission_approved',
    type: 'commission_approved',
    title: 'Commission Approved',
    body: 'A commission of {{amount}} has been approved.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Commission',
        url: '/commissions/{{commissionId}}',
      },
    ],
  },
  commission_rejected: {
    id: 'commission_rejected',
    type: 'commission_rejected',
    title: 'Commission Rejected',
    body: 'A commission of {{amount}} has been rejected.',
    priority: 'high',
    actions: [
      {
        action: 'view',
        title: 'View Commission',
        url: '/commissions/{{commissionId}}',
      },
    ],
  },
  document_verified: {
    id: 'document_verified',
    type: 'document_verified',
    title: 'Document Verified',
    body: 'The document {{documentType}} has been verified.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Document',
        url: '/documents/{{documentId}}',
      },
    ],
  },
  document_rejected: {
    id: 'document_rejected',
    type: 'document_rejected',
    title: 'Document Rejected',
    body: 'The document {{documentType}} has been rejected.',
    priority: 'high',
    actions: [
      {
        action: 'view',
        title: 'View Document',
        url: '/documents/{{documentId}}',
      },
    ],
  },
  document_expiring: {
    id: 'document_expiring',
    type: 'document_expiring',
    title: 'Document Expiring Soon',
    body: 'The document {{documentType}} will expire in {{daysUntilExpiry}} days.',
    priority: 'high',
    actions: [
      {
        action: 'view',
        title: 'View Document',
        url: '/documents/{{documentId}}',
      },
    ],
  },
  stage_change: {
    id: 'stage_change',
    type: 'stage_change',
    title: 'Stage Changed',
    body: 'The applicant {{applicantName}} has moved to {{stageName}} stage.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Applicant',
        url: '/applicants/{{applicantId}}',
      },
    ],
  },
  task_assigned: {
    id: 'task_assigned',
    type: 'task_assigned',
    title: 'New Task Assigned',
    body: 'You have been assigned a new task: {{taskName}}.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Task',
        url: '/tasks/{{taskId}}',
      },
    ],
  },
  message_received: {
    id: 'message_received',
    type: 'message_received',
    title: 'New Message',
    body: 'You have received a new message from {{senderName}}.',
    priority: 'normal',
    actions: [
      {
        action: 'view',
        title: 'View Message',
        url: '/messages/{{messageId}}',
      },
    ],
  },
};
