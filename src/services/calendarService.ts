import { ref, push, get, update, remove, set, onValue, off } from "firebase/database";
import { db } from "@/lib/firebase";
import { CalendarEvent } from "@/types";

export const calendarService = {
  async createEvent(userId: string, eventData: Omit<CalendarEvent, "id" | "userId" | "createdAt" | "updatedAt">) {
    const eventsRef = ref(db, "calendarEvents");
    const newEventRef = push(eventsRef);
    const eventId = newEventRef.key;

    const now = new Date().toISOString();
    await set(newEventRef, {
      ...eventData,
      id: eventId,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    return eventId;
  },

  async getAllEvents(): Promise<CalendarEvent[]> {
    const eventsRef = ref(db, "calendarEvents");

    const snapshot = await get(eventsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const events = Object.keys(data)
        .map(key => ({
          id: key,
          ...data[key],
        }))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      return events as CalendarEvent[];
    }
    return [];
  },

  async getEventsInDateRange(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const events = await this.getUserEvents(userId);
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
      return eventStart <= endDate && eventEnd >= startDate;
    });
  },

  async updateEvent(eventId: string, updates: Partial<Omit<CalendarEvent, "id" | "userId" | "createdAt">>) {
    const eventRef = ref(db, `calendarEvents/${eventId}`);
    const snapshot = await get(eventRef);

    if (!snapshot.exists()) {
      throw new Error("Event not found");
    }

    await update(eventRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteEvent(eventId: string) {
    const eventRef = ref(db, `calendarEvents/${eventId}`);
    const snapshot = await get(eventRef);

    if (!snapshot.exists()) {
      throw new Error("Event not found");
    }

    await remove(eventRef);
  },

  // Real-time listener for all events
  subscribeToAllEvents(callback: (events: CalendarEvent[]) => void) {
    const eventsRef = ref(db, "calendarEvents");

    const listener = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const events = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        callback(events as CalendarEvent[]);
      } else {
        callback([]);
      }
    });

    // Return unsubscribe function
    return () => off(eventsRef, 'value', listener);
  },

  // Conflict resolution: check if event was modified since last fetch
  async updateEventWithConflictCheck(
    eventId: string,
    updates: Partial<Omit<CalendarEvent, "id" | "userId" | "createdAt">>,
    lastUpdatedAt: string
  ) {
    const eventRef = ref(db, `calendarEvents/${eventId}`);
    const snapshot = await get(eventRef);

    if (!snapshot.exists()) {
      throw new Error("Event not found");
    }

    const eventData = snapshot.val();

    // Check for conflicts
    if (eventData.updatedAt !== lastUpdatedAt) {
      throw new Error("Event was modified by another user. Please refresh and try again.");
    }

    await update(eventRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
};