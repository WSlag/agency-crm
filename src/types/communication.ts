export type CommunicationType = 'email' | 'sms' | 'call' | 'note' | 'in-app' | 'meeting';
export type CommunicationDirection = 'inbound' | 'outbound';
export type CommunicationStatus = 'draft' | 'sent' | 'delivered' | 'failed' | 'read';

export interface Communication {
  id: string;
  applicantId: string;
  type: CommunicationType;
  subject?: string;
  content: string;
  direction: CommunicationDirection;
  status: CommunicationStatus;
  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    recipient?: string;
    sender?: string;
    phoneNumber?: string;
    emailAddress?: string;
    attachments?: string[];
    duration?: number; // For calls (in minutes)
    location?: string; // For meetings
    participants?: string[]; // For meetings
    deliveredAt?: Date;
    readAt?: Date;
  };
}

export interface CreateCommunicationData {
  applicantId: string;
  type: CommunicationType;
  subject?: string;
  content: string;
  direction: CommunicationDirection;
  metadata?: Partial<Communication['metadata']>;
}

export interface CommunicationFilter {
  applicantId?: string;
  type?: CommunicationType;
  direction?: CommunicationDirection;
  status?: CommunicationStatus;
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CommunicationStats {
  total: number;
  byType: Record<CommunicationType, number>;
  byStatus: Record<CommunicationStatus, number>;
  lastCommunication?: Communication;
}

