/**
 * Event Management Types
 * Types and interfaces for the calendar/event management system
 */

// Event type/category
export type EventType = 'meeting' | 'interview' | 'deadline' | 'training' | 'review' | 'other';

// Event status
export type EventStatus = 'scheduled' | 'completed' | 'cancelled';

// Recurrence frequency
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

// Main Event interface
export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  status: EventStatus;

  // Date/Time
  startDate: Date;
  endDate: Date;
  allDay: boolean;

  // Location & Participants
  location?: string;
  branchId: string;
  attendees: string[]; // Array of user IDs

  // Related entities
  applicantId?: string | null; // Link to applicant for interviews

  // Reminder settings
  reminder?: {
    enabled: boolean;
    time: number; // minutes before event
  };

  // Recurrence pattern
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval: number; // e.g., every 2 weeks
    endDate?: Date | null;
    daysOfWeek?: number[]; // 0-6 for Sunday-Saturday (for weekly)
  };

  // Audit fields
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event filter interface
export interface EventFilter {
  searchTerm?: string;
  eventType?: EventType;
  status?: EventStatus;
  branchId?: string;
  attendeeId?: string; // Filter events by specific attendee
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Event sort interface
export interface EventSort {
  field: keyof Event;
  direction: 'asc' | 'desc';
}

// Event pagination interface
export interface EventPagination {
  page: number;
  limit: number;
  total: number;
}

// Calendar view type
export type CalendarView = 'month' | 'week' | 'day' | 'list';

// Event form data (for creating new events)
export type EventFormData = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;

// Event type configuration
export interface EventTypeConfig {
  value: EventType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Event status configuration
export interface EventStatusConfig {
  value: EventStatus;
  label: string;
  color: string;
  bgColor: string;
}

// Event type configurations
export const EVENT_TYPE_CONFIG: Record<EventType, EventTypeConfig> = {
  meeting: {
    value: 'meeting',
    label: 'Meeting',
    icon: 'UserGroupIcon',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
  },
  interview: {
    value: 'interview',
    label: 'Interview',
    icon: 'UserIcon',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
  },
  deadline: {
    value: 'deadline',
    label: 'Deadline',
    icon: 'ClockIcon',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
  },
  training: {
    value: 'training',
    label: 'Training',
    icon: 'AcademicCapIcon',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
  },
  review: {
    value: 'review',
    label: 'Review',
    icon: 'DocumentCheckIcon',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
  },
  other: {
    value: 'other',
    label: 'Other',
    icon: 'CalendarIcon',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-500',
  },
};

// Event status configurations
export const EVENT_STATUS_CONFIG: Record<EventStatus, EventStatusConfig> = {
  scheduled: {
    value: 'scheduled',
    label: 'Scheduled',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  cancelled: {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
};

// Helper function to get event type config
export const getEventTypeConfig = (type: EventType): EventTypeConfig => {
  return EVENT_TYPE_CONFIG[type];
};

// Helper function to get event status config
export const getEventStatusConfig = (status: EventStatus): EventStatusConfig => {
  return EVENT_STATUS_CONFIG[status];
};

// Helper function to check if event is today
export const isEventToday = (event: Event): boolean => {
  const today = new Date();
  const eventStart = new Date(event.startDate);

  return (
    eventStart.getFullYear() === today.getFullYear() &&
    eventStart.getMonth() === today.getMonth() &&
    eventStart.getDate() === today.getDate()
  );
};

// Helper function to check if event is in date range
export const isEventInRange = (event: Event, start: Date, end: Date): boolean => {
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);

  return (
    (eventStart >= start && eventStart <= end) ||
    (eventEnd >= start && eventEnd <= end) ||
    (eventStart <= start && eventEnd >= end)
  );
};

// Helper function to format event time
export const formatEventTime = (date: Date, allDay: boolean): string => {
  if (allDay) return 'All Day';

  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Helper function to format event date range
export const formatEventDateRange = (startDate: Date, endDate: Date, allDay: boolean): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (allDay) {
    if (isSameDay) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }

  if (isSameDay) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${formatEventTime(start, false)} - ${formatEventTime(end, false)}`;
  }

  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${formatEventTime(start, false)} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${formatEventTime(end, false)}`;
};
