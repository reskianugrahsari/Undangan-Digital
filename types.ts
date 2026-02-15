export enum RSVPStatus {
  PENDING = 'Pending',
  HADIR = 'Hadir',
  TIDAK_HADIR = 'Tidak Hadir',
}

export interface User {
  id: string;
  email: string;
}

export interface Event {
  id: string;
  user_id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  location_name: string;
  google_maps_url: string;
  event_type: 'wedding' | 'birthday' | 'graduation' | 'party';
  theme_slug: 'modern' | 'classic' | 'romantic' | 'luxury' | 'nature' | 'vintage' | 'minimalist' | 'royal' | 'ethereal';
  hero_image?: string;
  gallery_images?: string[];
  gallery_layout: 'masonry' | 'grid' | 'carousel' | 'stack';
  // Gift/Payment accounts
  bri_account_number?: string;
  bri_account_name?: string;
  shopeepay_number?: string;
  shopeepay_name?: string;
}

export interface Guest {
  id: string;
  event_id: string;
  guest_name: string;
  unique_slug: string;
  status_rsvp: RSVPStatus;
  phone_number?: string;
  instagram?: string;
}

export interface Wish {
  id: string;
  event_id: string;
  guest_id?: string;
  name: string;
  message: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}