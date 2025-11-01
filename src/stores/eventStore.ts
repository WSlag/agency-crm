/**
 * Event Store
 * Zustand store for managing event state and Firebase operations
 */

import { create } from 'zustand';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type {
  Event,
  EventFilter,
  EventSort,
  EventFormData,
  CalendarView,
} from '../types/event';

interface EventStoreState {
  // State
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  error: string | null;
  filter: EventFilter;
  sort: EventSort;
  view: CalendarView;

  // Actions
  setFilter: (filter: Partial<EventFilter>) => void;
  setSort: (sort: EventSort) => void;
  setView: (view: CalendarView) => void;
  fetchEvents: (filter?: EventFilter) => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  fetchEventsByDateRange: (start: Date, end: Date, attendeeId?: string) => Promise<void>;
  fetchTodaysEvents: (userId: string) => Promise<Event[]>;
  createEvent: (event: EventFormData) => Promise<string>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  markEventAsCompleted: (id: string) => Promise<void>;
  markEventAsCancelled: (id: string) => Promise<void>;
  clearError: () => void;
  clearSelectedEvent: () => void;
}

const COLLECTION_NAME = 'events';

export const useEventStore = create<EventStoreState>((set, get) => ({
  // Initial state
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  filter: {},
  sort: {
    field: 'startDate',
    direction: 'asc',
  },
  view: 'month',

  // Set filter
  setFilter: (newFilter) => {
    set((state) => ({
      filter: { ...state.filter, ...newFilter },
    }));
  },

  // Set sort
  setSort: (sort) => {
    set({ sort });
  },

  // Set calendar view
  setView: (view) => {
    set({ view });
  },

  // Fetch all events with optional filters
  fetchEvents: async (filterOverride?: EventFilter) => {
    set({ loading: true, error: null });

    try {
      const currentFilter = filterOverride || get().filter;
      const currentSort = get().sort;

      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (currentFilter.eventType) {
        constraints.push(where('eventType', '==', currentFilter.eventType));
      }

      if (currentFilter.status) {
        constraints.push(where('status', '==', currentFilter.status));
      }

      if (currentFilter.branchId) {
        constraints.push(where('branchId', '==', currentFilter.branchId));
      }

      if (currentFilter.attendeeId) {
        constraints.push(where('attendees', 'array-contains', currentFilter.attendeeId));
      }

      if (currentFilter.dateRange) {
        constraints.push(where('startDate', '>=', Timestamp.fromDate(currentFilter.dateRange.start)));
        constraints.push(where('startDate', '<=', Timestamp.fromDate(currentFilter.dateRange.end)));
      }

      // Apply sorting
      constraints.push(orderBy(currentSort.field, currentSort.direction));

      const q = query(collection(firestore, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      const events: Event[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          recurrence: data.recurrence
            ? {
                ...data.recurrence,
                endDate: data.recurrence.endDate?.toDate() || null,
              }
            : undefined,
        } as Event;
      });

      set({ events, loading: false });
    } catch (error: any) {
      console.error('Error fetching events:', error);
      set({
        error: error.message || 'Failed to fetch events',
        loading: false,
      });
    }
  },

  // Fetch event by ID
  fetchEventById: async (id: string) => {
    set({ loading: true, error: null });

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        set({
          error: 'Event not found',
          loading: false,
          selectedEvent: null,
        });
        return;
      }

      const data = docSnap.data();
      const event: Event = {
        id: docSnap.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        recurrence: data.recurrence
          ? {
              ...data.recurrence,
              endDate: data.recurrence.endDate?.toDate() || null,
            }
          : undefined,
      } as Event;

      set({ selectedEvent: event, loading: false });
    } catch (error: any) {
      console.error('Error fetching event:', error);
      set({
        error: error.message || 'Failed to fetch event',
        loading: false,
      });
    }
  },

  // Fetch events by date range (for calendar views)
  fetchEventsByDateRange: async (start: Date, end: Date, attendeeId?: string) => {
    set({ loading: true, error: null });

    try {
      const constraints: QueryConstraint[] = [
        where('startDate', '>=', Timestamp.fromDate(start)),
        where('startDate', '<=', Timestamp.fromDate(end)),
        orderBy('startDate', 'asc'),
      ];

      if (attendeeId) {
        constraints.splice(0, 0, where('attendees', 'array-contains', attendeeId));
      }

      const q = query(collection(firestore, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      const events: Event[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          recurrence: data.recurrence
            ? {
                ...data.recurrence,
                endDate: data.recurrence.endDate?.toDate() || null,
              }
            : undefined,
        } as Event;
      });

      set({ events, loading: false });
    } catch (error: any) {
      console.error('Error fetching events by date range:', error);
      set({
        error: error.message || 'Failed to fetch events',
        loading: false,
      });
    }
  },

  // Fetch today's events for a specific user
  fetchTodaysEvents: async (userId: string): Promise<Event[]> => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const constraints: QueryConstraint[] = [
        where('attendees', 'array-contains', userId),
        where('startDate', '>=', Timestamp.fromDate(startOfDay)),
        where('startDate', '<=', Timestamp.fromDate(endOfDay)),
        where('status', '==', 'scheduled'),
        orderBy('startDate', 'asc'),
      ];

      const q = query(collection(firestore, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      const events: Event[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          recurrence: data.recurrence
            ? {
                ...data.recurrence,
                endDate: data.recurrence.endDate?.toDate() || null,
              }
            : undefined,
        } as Event;
      });

      return events;
    } catch (error: any) {
      console.error('Error fetching todays events:', error);
      return [];
    }
  },

  // Create new event
  createEvent: async (eventData: EventFormData) => {
    set({ loading: true, error: null });

    try {
      const docData = {
        ...eventData,
        startDate: Timestamp.fromDate(eventData.startDate),
        endDate: Timestamp.fromDate(eventData.endDate),
        recurrence: eventData.recurrence
          ? {
              ...eventData.recurrence,
              endDate: eventData.recurrence.endDate
                ? Timestamp.fromDate(eventData.recurrence.endDate)
                : null,
            }
          : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestore, COLLECTION_NAME), docData);

      set({ loading: false });
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating event:', error);
      set({
        error: error.message || 'Failed to create event',
        loading: false,
      });
      throw error;
    }
  },

  // Update event
  updateEvent: async (id: string, data: Partial<Event>) => {
    set({ loading: true, error: null });

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id);

      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      // Convert Date fields to Timestamps
      if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = Timestamp.fromDate(data.endDate);
      }
      if (data.recurrence?.endDate) {
        updateData.recurrence = {
          ...data.recurrence,
          endDate: Timestamp.fromDate(data.recurrence.endDate),
        };
      }

      await updateDoc(docRef, updateData);

      // Update local state
      if (get().selectedEvent?.id === id) {
        set((state) => ({
          selectedEvent: state.selectedEvent
            ? { ...state.selectedEvent, ...data }
            : null,
        }));
      }

      set({ loading: false });
    } catch (error: any) {
      console.error('Error updating event:', error);
      set({
        error: error.message || 'Failed to update event',
        loading: false,
      });
      throw error;
    }
  },

  // Delete event
  deleteEvent: async (id: string) => {
    set({ loading: true, error: null });

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id);
      await deleteDoc(docRef);

      // Update local state
      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
        selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error deleting event:', error);
      set({
        error: error.message || 'Failed to delete event',
        loading: false,
      });
      throw error;
    }
  },

  // Mark event as completed
  markEventAsCompleted: async (id: string) => {
    await get().updateEvent(id, { status: 'completed' });
  },

  // Mark event as cancelled
  markEventAsCancelled: async (id: string) => {
    await get().updateEvent(id, { status: 'cancelled' });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear selected event
  clearSelectedEvent: () => {
    set({ selectedEvent: null });
  },
}));
