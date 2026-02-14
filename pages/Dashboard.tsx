import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { Event } from '../types';
import { Plus, Calendar, MapPin, Loader2, ExternalLink, CheckCircle, Upload, X, ImageIcon, Trash2, Edit } from 'lucide-react';

const THEMES = [
  { id: 'modern', name: 'Modern Blue', desc: 'Clean, professional & corporate', color: 'bg-blue-500', icon: '✨' },
  { id: 'classic', name: 'Classic Gold', desc: 'Traditional & elegant', color: 'bg-amber-400', icon: '🏛️' },
  { id: 'romantic', name: 'Romantic Pink', desc: 'Sweet & full of love', color: 'bg-pink-400', icon: '🌸' },
  { id: 'luxury', name: 'Luxury Black', desc: 'Premium dark & gold', color: 'bg-slate-900', icon: '💎' },
  { id: 'nature', name: 'Nature Green', desc: 'Fresh & botanical', color: 'bg-emerald-500', icon: '🍃' },
  { id: 'vintage', name: 'Vintage Sepia', desc: 'Classic document style', color: 'bg-[#8b4513]', icon: '📜' },
  { id: 'minimalist', name: 'Minimal White', desc: 'Pure & simple design', color: 'bg-zinc-200', icon: '⚪' },
  { id: 'royal', name: 'Royal Purple', desc: 'Majestic & noble', color: 'bg-purple-600', icon: '👑' },
  { id: 'ethereal', name: 'Ethereal Palace', desc: 'Heavenly & grandiose', color: 'bg-[#fdfcfb]', icon: '🕌' },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Create Form State
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    event_date: '',
    event_time: '',
    location_name: '',
    google_maps_url: '',
    theme_slug: 'modern' as const,
    event_type: 'wedding' as const,
    hero_image: '',
    gallery_images: [] as string[],
    gallery_layout: 'masonry' as const,
  });

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;
    try {
      const data = await api.events.listByUser(user.id);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await api.events.create(user.id, newEvent);
      setShowCreateModal(false);
      await loadEvents();
      // Reset form
      setNewEvent({
        event_name: '',
        event_date: '',
        event_time: '',
        location_name: '',
        google_maps_url: '',
        theme_slug: 'modern',
        event_type: 'wedding',
        hero_image: '',
        gallery_images: [],
        gallery_layout: 'masonry',
      });
    } catch (error: any) {
      console.error(error);
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
        alert('❌ Penyimpanan penuh!\n\n' +
          'Foto yang diupload terlalu besar.\n\n' +
          'Solusi:\n' +
          '1. Kompres foto sebelum upload (max 500KB)\n' +
          '2. Kurangi jumlah foto di galeri (max 10)\n' +
          '3. Hapus beberapa event lama\n' +
          '4. Gunakan foto yang lebih kecil');
      } else {
        alert('Gagal membuat event. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setLoading(true);
    try {
      await api.events.update(editingEvent.id, newEvent);
      setEditingEvent(null);
      setShowCreateModal(false);
      await loadEvents();
      setNewEvent({
        event_name: '',
        event_date: '',
        location_name: '',
        google_maps_url: '',
        theme_slug: 'modern',
        event_type: 'wedding',
        hero_image: '',
        gallery_images: [],
        gallery_layout: 'masonry',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini? Semua data tamu dan ucapan akan ikut terhapus.')) return;
    setLoading(true);
    try {
      await api.events.delete(eventId);
      await loadEvents();
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus event');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      event_name: event.event_name,
      event_date: event.event_date,
      event_time: event.event_time,
      location_name: event.location_name,
      google_maps_url: event.google_maps_url,
      theme_slug: event.theme_slug,
      event_type: event.event_type,
      hero_image: event.hero_image || '',
      gallery_images: event.gallery_images || [],
      gallery_layout: event.gallery_layout,
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    setNewEvent({
      event_name: '',
      event_date: '',
      event_time: '',
      location_name: '',
      google_maps_url: '',
      theme_slug: 'modern',
      event_type: 'wedding',
      hero_image: '',
      gallery_images: [],
      gallery_layout: 'masonry',
    });
  };

  if (loading && !events.length && !showCreateModal) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Your Events</h1>
          <p className="text-gray-500 mt-1">Manage your upcoming celebrations.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          New Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.theme_slug === 'modern' ? 'bg-blue-100 text-blue-800' :
                    event.theme_slug === 'classic' ? 'bg-amber-100 text-amber-800' :
                      event.theme_slug === 'romantic' ? 'bg-pink-100 text-pink-800' :
                        event.theme_slug === 'luxury' ? 'bg-slate-800 text-amber-400' :
                          event.theme_slug === 'nature' ? 'bg-emerald-100 text-emerald-800' :
                            event.theme_slug === 'vintage' ? 'bg-orange-100 text-orange-800' :
                              event.theme_slug === 'royal' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                    }`}>
                    {event.theme_slug.charAt(0).toUpperCase() + event.theme_slug.slice(1)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {(event.event_type || 'wedding').charAt(0).toUpperCase() + (event.event_type || 'wedding').slice(1)}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 truncate mb-2">
                  {event.event_name}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span>{new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span className="truncate">{event.location_name}</span>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex gap-2">
                <Link
                  to={`/events/${event.id}`}
                  className="flex-1 text-center py-2 px-3 border border-indigo-600 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Kelola Tamu
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); openEditModal(event); }}
                  className="py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); handleDeleteEvent(event.id); }}
                  className="py-2 px-3 border border-red-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={editingEvent ? handleEditEvent : handleCreateEvent}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6 border-b pb-2">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Info Section */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Event Information</h4>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Event Name</label>
                            <input
                              type="text"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={newEvent.event_name}
                              onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Event Type</label>
                            <select
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={newEvent.event_type}
                              onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as any })}
                            >
                              <option value="wedding">Wedding</option>
                              <option value="birthday">Birthday</option>
                              <option value="graduation">Graduation</option>
                              <option value="party">Party</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Event Date</label>
                            <input
                              type="date"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={newEvent.event_date}
                              onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Event Time</label>
                            <input
                              type="time"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={newEvent.event_time}
                              onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Location Name</label>
                            <input
                              type="text"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={newEvent.location_name}
                              onChange={(e) => setNewEvent({ ...newEvent, location_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Google Maps URL</label>
                            <input
                              type="url"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={newEvent.google_maps_url}
                              onChange={(e) => setNewEvent({ ...newEvent, google_maps_url: e.target.value })}
                            />
                          </div>

                          <div className="pt-4 border-t">
                            <label className="block text-sm font-bold text-gray-700 mb-3">🖼️ Foto Utama (Hero)</label>
                            {newEvent.hero_image ? (
                              <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-indigo-100 shadow-lg group">
                                <img src={newEvent.hero_image} className="w-full h-full object-cover" alt="Hero Preview" />
                                <button
                                  type="button"
                                  onClick={() => setNewEvent({ ...newEvent, hero_image: '' })}
                                  className="absolute inset-0 bg-red-500/90 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-8 h-8 mb-2" />
                                  <span className="text-sm font-bold">Hapus Foto</span>
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                                <div className="text-center p-6">
                                  <Upload className="w-10 h-10 text-gray-400 mx-auto group-hover:text-indigo-600 transition-colors mb-3" />
                                  <p className="text-sm text-gray-600 font-bold mb-1">Upload Foto Utama</p>
                                  <p className="text-[10px] text-gray-400">Foto ini akan muncul di bagian pembuka undangan</p>
                                  <p className="text-[10px] text-red-500 mt-1">Max 500KB untuk performa optimal</p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 500000) {
                                        alert('Ukuran foto terlalu besar! Maksimal 500KB. Silakan kompres foto terlebih dahulu.');
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setNewEvent({ ...newEvent, hero_image: reader.result as string });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            )}
                            <p className="text-[10px] text-gray-400 mt-2 italic">
                              Kosongkan untuk menggunakan foto default sesuai tema.
                            </p>
                          </div>

                          <div className="pt-4 border-t">
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-bold text-gray-700">📸 Momen Kebahagiaan</label>
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                {newEvent.gallery_images?.length || 0} Foto
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {newEvent.gallery_images?.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-indigo-50 shadow-sm group">
                                  <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                                  <button
                                    type="button"
                                    onClick={() => setNewEvent({ ...newEvent, gallery_images: newEvent.gallery_images?.filter((_, i) => i !== idx) })}
                                    className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                              ))}
                              <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                                <div className="text-center p-2">
                                  <Plus className="w-6 h-6 text-gray-400 mx-auto group-hover:text-indigo-600 transition-colors" />
                                  <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-tighter">Tambah</p>
                                </div>
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    const currentCount = newEvent.gallery_images?.length || 0;

                                    if (currentCount >= 10) {
                                      alert('Maksimal 10 foto untuk galeri. Hapus beberapa foto terlebih dahulu.');
                                      return;
                                    }

                                    const remainingSlots = 10 - currentCount;
                                    const filesToProcess = files.slice(0, remainingSlots);

                                    filesToProcess.forEach((file: File) => {
                                      if (file.size > 500000) {
                                        alert(`Foto "${file.name}" terlalu besar (${(file.size / 1000).toFixed(0)}KB). Maksimal 500KB per foto.`);
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setNewEvent(prev => ({
                                          ...prev,
                                          gallery_images: [...(prev.gallery_images || []), reader.result as string]
                                        }));
                                      };
                                      reader.readAsDataURL(file);
                                    });

                                    if (files.length > remainingSlots) {
                                      alert(`Hanya ${remainingSlots} foto yang ditambahkan. Maksimal total 10 foto.`);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-3 italic">
                              Foto-foto ini akan ditampilkan di bagian galeri undangan. Max 10 foto, 500KB per foto.
                            </p>
                          </div>
                        </div>

                        {/* Theme Section */}
                        <div className="flex flex-col">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Choose a Theme</h4>
                          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {THEMES.map((theme) => (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => setNewEvent({ ...newEvent, theme_slug: theme.id as any })}
                                className={`group relative flex flex-col items-center p-3 rounded-xl border-2 transition-all ${newEvent.theme_slug === theme.id
                                  ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                                  : 'border-gray-100 bg-white hover:border-indigo-300 hover:bg-gray-50'
                                  }`}
                              >
                                <div className={`w-full aspect-video rounded-lg ${theme.color} mb-3 flex items-center justify-center text-3xl shadow-inner`}>
                                  {theme.icon}
                                </div>
                                <div className="text-center">
                                  <p className={`text-sm font-bold ${newEvent.theme_slug === theme.id ? 'text-indigo-700' : 'text-gray-900'}`}>
                                    {theme.name}
                                  </p>
                                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{theme.desc}</p>
                                </div>
                                {newEvent.theme_slug === theme.id && (
                                  <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                                    <CheckCircle className="w-3 h-3" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {loading ? (editingEvent ? 'Updating...' : 'Creating...') : (editingEvent ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};