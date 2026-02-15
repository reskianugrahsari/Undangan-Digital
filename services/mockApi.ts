import { supabase } from './supabase';
import { User, Event, Guest, Wish, RSVPStatus, AuthResponse } from '../types';

// Helper to simulate delay if wanted, but Supabase is real
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  auth: {
    register: async (email: string, password: string): Promise<AuthResponse> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error('Pendaftaran gagal. Silakan coba lagi.');

      // If session is null, it means email verification is likely required
      if (!data.session) {
        throw new Error('Pendaftaran berhasil! Silakan cek email Anda untuk memverifikasi akun sebelum masuk.');
      }

      const newUser: User = { id: data.user.id, email: data.user.email! };
      return { token: data.session.access_token, user: newUser };
    },
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user || !data.session) throw new Error('Login gagal. Silakan periksa kredensial Anda.');

      const newUser: User = { id: data.user.id, email: data.user.email! };
      return { token: data.session.access_token, user: newUser };
    },
    signOut: async () => {
      await supabase.auth.signOut();
    }
  },
  events: {
    create: async (userId: string, data: Omit<Event, 'id' | 'user_id'>): Promise<Event> => {
      const { data: newEvent, error } = await supabase
        .from('events')
        .insert([{ ...data, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return newEvent;
    },
    listByUser: async (userId: string): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    getById: async (id: string): Promise<Event | undefined> => {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return undefined;

      if (event) {
        // SISIPKAN DATA REKENING MANUAL DI SINI (Karena UI setting sudah dihapus)
        return {
          ...event,
          bri_account_number: event.bri_account_number || '1234567890',
          bri_account_name: event.bri_account_name || 'Nama Anda (BRI)',
          shopeepay_number: event.shopeepay_number || '081234567890',
          shopeepay_name: event.shopeepay_name || 'Nama Anda (SP)',
        };
      }
      return undefined;
    },
    update: async (id: string, data: Partial<Omit<Event, 'id' | 'user_id'>>): Promise<Event> => {
      const { data: updatedEvent, error } = await supabase
        .from('events')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedEvent;
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  },
  guests: {
    create: async (eventId: string, guestName: string, phoneNumber?: string, instagram?: string): Promise<Guest> => {
      const slug = `${guestName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
      const { data, error } = await supabase
        .from('guests')
        .insert([{
          event_id: eventId,
          guest_name: guestName,
          unique_slug: slug,
          status_rsvp: RSVPStatus.PENDING,
          phone_number: phoneNumber,
          instagram: instagram,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    listByEvent: async (eventId: string): Promise<Guest[]> => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('event_id', eventId)
        .order('guest_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    getBySlug: async (slug: string): Promise<{ event: Event; guest: Guest } | null> => {
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('unique_slug', slug)
        .single();

      if (guestError || !guest) return null;

      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', guest.event_id)
        .single();

      if (eventError || !event) return null;

      // SISIPKAN DATA REKENING MANUAL DI SINI
      const enrichedEvent = {
        ...event,
        bri_account_number: event.bri_account_number || '1234567890',
        bri_account_name: event.bri_account_name || 'Nama Anda (BRI)',
        shopeepay_number: event.shopeepay_number || '081234567890',
        shopeepay_name: event.shopeepay_name || 'Nama Anda (SP)',
      };

      return { event: enrichedEvent, guest };
    },
    updateRSVP: async (slug: string, status: RSVPStatus): Promise<Guest> => {
      const { data, error } = await supabase
        .from('guests')
        .update({ status_rsvp: status })
        .eq('unique_slug', slug)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    delete: async (guestId: string): Promise<void> => {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestId);

      if (error) throw error;
    }
  },
  invitations: {
    getBySlug: async (slug: string): Promise<{ event: Event; guest: Guest }> => {
      const result = await api.guests.getBySlug(slug);
      if (!result) throw new Error('Undangan tidak ditemukan');
      return result;
    }
  },
  wishes: {
    create: async (eventId: string, name: string, message: string): Promise<Wish> => {
      const { data, error } = await supabase
        .from('wishes')
        .insert([{
          event_id: eventId,
          name: name,
          message: message,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    listByEvent: async (eventId: string): Promise<Wish[]> => {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  }
};