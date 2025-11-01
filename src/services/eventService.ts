/**
 * Event Service
 * Service layer for event-related operations and business logic
 */

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
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type { Event, EventFormData, RecurrenceFrequency } from '../types/event';

export class EventService {
  private static COLLECTION = 'events';

  /**
   * Get event by ID
   */
  static async getEventById(id: string): Promise<Event | null> {
    try {
      const docRef = doc(firestore, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
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
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }

  /**
   * Get events for a specific user (attendee)
   */
  static async getEventsForUser(userId: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
    try {
      const constraints: any[] = [
        where('attendees', 'array-contains', userId),
        orderBy('startDate', 'asc'),
      ];

      if (startDate) {
        constraints.push(where('startDate', '>=', Timestamp.fromDate(startDate)));
      }

      if (endDate) {
        constraints.push(where('startDate', '<=', Timestamp.fromDate(endDate)));
      }

      const q = query(collection(firestore, this.COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
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
    } catch (error) {
      console.error('Error getting events for user:', error);
      throw error;
    }
  }

  /**
   * Get events for a specific branch
   */
  static async getEventsForBranch(branchId: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
    try {
      const constraints: any[] = [
        where('branchId', '==', branchId),
        orderBy('startDate', 'asc'),
      ];

      if (startDate) {
        constraints.push(where('startDate', '>=', Timestamp.fromDate(startDate)));
      }

      if (endDate) {
        constraints.push(where('startDate', '<=', Timestamp.fromDate(endDate)));
      }

      const q = query(collection(firestore, this.COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
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
    } catch (error) {
      console.error('Error getting events for branch:', error);
      throw error;
    }
  }

  /**
   * Create a new event
   */
  static async createEvent(eventData: EventFormData): Promise<string> {
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(firestore, this.COLLECTION), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  static async updateEvent(id: string, data: Partial<Event>): Promise<void> {
    try {
      const docRef = doc(firestore, this.COLLECTION, id);

      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
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
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  static async deleteEvent(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Check if user is attendee of an event
   */
  static isUserAttendee(event: Event, userId: string): boolean {
    return event.attendees.includes(userId);
  }

  /**
   * Check if user is creator of an event
   */
  static isUserCreator(event: Event, userId: string): boolean {
    return event.createdBy === userId;
  }

  /**
   * Generate recurring event instances
   * This generates virtual event instances based on recurrence pattern
   */
  static generateRecurringInstances(
    event: Event,
    viewStart: Date,
    viewEnd: Date
  ): Event[] {
    if (!event.recurrence) {
      return [event];
    }

    const instances: Event[] = [];
    const { frequency, interval, endDate, daysOfWeek } = event.recurrence;

    let currentDate = new Date(event.startDate);
    const recurrenceEnd = endDate || viewEnd;
    const duration = event.endDate.getTime() - event.startDate.getTime();

    while (currentDate <= recurrenceEnd && currentDate <= viewEnd) {
      // Check if this instance falls within the view range
      if (currentDate >= viewStart) {
        // For weekly recurrence with specific days
        if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
          const dayOfWeek = currentDate.getDay();
          if (daysOfWeek.includes(dayOfWeek)) {
            const instanceEnd = new Date(currentDate.getTime() + duration);
            instances.push({
              ...event,
              startDate: new Date(currentDate),
              endDate: instanceEnd,
            });
          }
        } else {
          // For other recurrence patterns
          const instanceEnd = new Date(currentDate.getTime() + duration);
          instances.push({
            ...event,
            startDate: new Date(currentDate),
            endDate: instanceEnd,
          });
        }
      }

      // Calculate next occurrence
      currentDate = this.getNextOccurrence(currentDate, frequency, interval);
    }

    return instances.length > 0 ? instances : [event];
  }

  /**
   * Calculate next occurrence date based on frequency
   */
  private static getNextOccurrence(
    date: Date,
    frequency: RecurrenceFrequency,
    interval: number
  ): Date {
    const nextDate = new Date(date);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7 * interval);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
    }

    return nextDate;
  }

  /**
   * Check if an event is overdue (past end date and still scheduled)
   */
  static isEventOverdue(event: Event): boolean {
    const now = new Date();
    return event.status === 'scheduled' && event.endDate < now;
  }

  /**
   * Check if an event is happening now
   */
  static isEventHappeningNow(event: Event): boolean {
    const now = new Date();
    return event.status === 'scheduled' && event.startDate <= now && event.endDate >= now;
  }

  /**
   * Check if an event is upcoming (starts in the future)
   */
  static isEventUpcoming(event: Event): boolean {
    const now = new Date();
    return event.status === 'scheduled' && event.startDate > now;
  }

  /**
   * Get events happening today for a user
   */
  static async getTodaysEventsForUser(userId: string): Promise<Event[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const q = query(
        collection(firestore, this.COLLECTION),
        where('attendees', 'array-contains', userId),
        where('startDate', '>=', Timestamp.fromDate(startOfDay)),
        where('startDate', '<=', Timestamp.fromDate(endOfDay)),
        where('status', '==', 'scheduled'),
        orderBy('startDate', 'asc')
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
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
    } catch (error) {
      console.error('Error getting todays events:', error);
      return [];
    }
  }

  /**
   * Get upcoming events for a user (next 7 days)
   */
  static async getUpcomingEventsForUser(userId: string, days: number = 7): Promise<Event[]> {
    try {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + days);

      const q = query(
        collection(firestore, this.COLLECTION),
        where('attendees', 'array-contains', userId),
        where('startDate', '>=', Timestamp.fromDate(today)),
        where('startDate', '<=', Timestamp.fromDate(futureDate)),
        where('status', '==', 'scheduled'),
        orderBy('startDate', 'asc')
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
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
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }
}
