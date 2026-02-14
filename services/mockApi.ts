import { User, Event, Guest, Wish, RSVPStatus, AuthResponse } from '../types';

// Helper to simulate UUID generation
const generateUUID = () => crypto.randomUUID();
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// LocalStorage Keys
const DB_KEY = 'invitation_app_db';

interface DB {
  users: User[];
  events: Event[];
  guests: Guest[];
  wishes: Wish[];
}

const getDB = (): DB => {
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) {
    const initial: DB = { users: [], events: [], guests: [], wishes: [] };
    localStorage.setItem(DB_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

const saveDB = (db: DB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const api = {
  auth: {
    register: async (email: string, password: string): Promise<AuthResponse> => {
      await delay(500);
      const db = getDB();
      if (db.users.find((u) => u.email === email)) {
        throw new Error('User already exists');
      }
      const newUser: User = { id: generateUUID(), email };
      db.users.push(newUser);
      saveDB(db);
      return { token: 'mock-jwt-token', user: newUser };
    },
    login: async (email: string, password: string): Promise<AuthResponse> => {
      await delay(500);
      const db = getDB();
      const user = db.users.find((u) => u.email === email);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      return { token: 'mock-jwt-token', user };
    },
  },
  events: {
    create: async (userId: string, data: Omit<Event, 'id' | 'user_id'>): Promise<Event> => {
      await delay(300);
      const db = getDB();
      const newEvent: Event = { ...data, id: generateUUID(), user_id: userId };
      db.events.push(newEvent);
      saveDB(db);
      return newEvent;
    },
    listByUser: async (userId: string): Promise<Event[]> => {
      await delay(300);
      const db = getDB();
      return db.events.filter((e) => e.user_id === userId);
    },
    getById: async (id: string): Promise<Event | undefined> => {
      const db = getDB();
      const event = db.events.find((e) => e.id === id);
      if (event) {
        // SISIPKAN DATA REKENING MANUAL DI SINI
        return {
          ...event,
          bri_account_number: event.bri_account_number || '1234567890', // Ganti dengan nomor BRI Anda
          bri_account_name: event.bri_account_name || 'Nama Anda (BRI)', // Ganti dengan nama Anda
          shopeepay_number: event.shopeepay_number || '081234567890',  // Ganti dengan nomor ShopeePay
          shopeepay_name: event.shopeepay_name || 'Nama Anda (SP)',     // Ganti dengan nama ShopeePay Anda
        };
      }
      return undefined;
    },
    update: async (id: string, data: Partial<Omit<Event, 'id' | 'user_id'>>): Promise<Event> => {
      await delay(300);
      const db = getDB();
      const eventIndex = db.events.findIndex((e) => e.id === id);
      if (eventIndex === -1) throw new Error('Event not found');

      db.events[eventIndex] = { ...db.events[eventIndex], ...data };
      saveDB(db);
      return db.events[eventIndex];
    },
    delete: async (id: string): Promise<void> => {
      await delay(300);
      const db = getDB();
      db.events = db.events.filter((e) => e.id !== id);
      // Also delete related guests and wishes
      const guestIds = db.guests.filter((g) => g.event_id === id).map((g) => g.id);
      db.guests = db.guests.filter((g) => g.event_id !== id);
      db.wishes = db.wishes.filter((w) => !guestIds.includes(w.guest_id));
      saveDB(db);
    }
  },
  guests: {
    create: async (eventId: string, guestName: string, phoneNumber?: string, instagram?: string): Promise<Guest> => {
      await delay(300);
      const db = getDB();
      // Simple slug generation: name-random
      const slug = `${guestName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
      const newGuest: Guest = {
        id: generateUUID(),
        event_id: eventId,
        guest_name: guestName,
        unique_slug: slug,
        status_rsvp: RSVPStatus.PENDING,
        phone_number: phoneNumber,
        instagram: instagram,
      };
      db.guests.push(newGuest);
      saveDB(db);
      return newGuest;
    },
    listByEvent: async (eventId: string): Promise<Guest[]> => {
      await delay(300);
      const db = getDB();
      return db.guests.filter((g) => g.event_id === eventId);
    },
    getBySlug: async (slug: string): Promise<{ event: Event; guest: Guest } | null> => {
      await delay(500);
      const db = getDB();
      const guest = db.guests.find((g) => g.unique_slug === slug);
      if (!guest) return null;
      let event = db.events.find((e) => e.id === guest.event_id);
      if (!event) return null;

      // SISIPKAN DATA REKENING MANUAL DI SINI (Untuk tampilan tamu)
      event = {
        ...event,
        bri_account_number: event.bri_account_number || '1234567890',
        bri_account_name: event.bri_account_name || 'Nama Anda (BRI)',
        shopeepay_number: event.shopeepay_number || '081234567890',
        shopeepay_name: event.shopeepay_name || 'Nama Anda (SP)',
      };

      return { event, guest };
    },
    updateRSVP: async (slug: string, status: RSVPStatus): Promise<Guest> => {
      await delay(300);
      const db = getDB();
      const guestIndex = db.guests.findIndex((g) => g.unique_slug === slug);
      if (guestIndex === -1) throw new Error('Guest not found');

      db.guests[guestIndex].status_rsvp = status;
      saveDB(db);
      return db.guests[guestIndex];
    },
    delete: async (guestId: string): Promise<void> => {
      await delay(300);
      const db = getDB();
      // Remove guest
      db.guests = db.guests.filter((g) => g.id !== guestId);
      // Remove wishes from this guest
      db.wishes = db.wishes.filter((w) => w.guest_id !== guestId);
      saveDB(db);
    }
  },
  wishes: {
    create: async (guestId: string, message: string): Promise<Wish> => {
      await delay(300);
      const db = getDB();
      const newWish: Wish = {
        id: generateUUID(),
        guest_id: guestId,
        message,
        created_at: new Date().toISOString(),
      };
      db.wishes.push(newWish);
      saveDB(db);
      return newWish;
    },
    listByEvent: async (eventId: string): Promise<Wish[]> => {
      await delay(300);
      const db = getDB();
      // Get all guests for this event
      const eventGuests = db.guests.filter(g => g.event_id === eventId).map(g => g.id);
      // Get wishes from those guests
      const wishes = db.wishes.filter(w => eventGuests.includes(w.guest_id));
      // Enrich with guest name
      return wishes.map(w => {
        const guest = db.guests.find(g => g.id === w.guest_id);
        return { ...w, guest_name: guest?.guest_name || 'Unknown' };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }
};