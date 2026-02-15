import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { Event } from '../types';
import { Plus, Calendar, MapPin, Loader2, CheckCircle, Upload, X, ImageIcon, Trash2, Edit, Sparkles, Users, Eye, Share2, Settings, Home, LogOut, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'events' | 'settings'>('home');

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
      alert('Gagal membuat event: ' + (error.message || 'Cek koneksi internet atau tabel database Anda.'));
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
        event_time: '',
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading && !events.length && !showCreateModal) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;
  }

  // Render Home Tab
  const renderHomeTab = () => (
    <div className="space-y-4 pb-24">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs opacity-80 mb-1">Selamat Datang</p>
            <h2 className="text-xl font-bold">{user?.email?.split('@')[0] || 'User'}</h2>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>{events.length} Undangan Aktif</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{events.length}</p>
          <p className="text-[10px] text-gray-500 font-medium mt-1">Total Acara</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-[10px] text-gray-500 font-medium mt-1">Tamu</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
            <Eye className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-[10px] text-gray-500 font-medium mt-1">Kunjungan</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Aksi Cepat
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border-2 border-indigo-100 hover:border-indigo-200 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-2">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-indigo-900">Buat Undangan</span>
          </button>

          <button className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-100 hover:border-pink-200 transition-all active:scale-95">
            <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-2">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-pink-900">Bagikan</span>
          </button>
        </div>
      </div>

      {/* Recent Events Preview */}
      {events.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Undangan Terbaru</h3>
            <button
              onClick={() => setActiveTab('events')}
              className="text-xs text-indigo-600 font-bold"
            >
              Lihat Semua
            </button>
          </div>
          <div className="space-y-3">
            {events.slice(0, 2).map((event) => {
              const currentTheme = THEMES.find(t => t.id === event.theme_slug);
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
                >
                  <div className={`w-12 h-12 ${currentTheme?.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                    {currentTheme?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{event.event_name}</p>
                    <p className="text-xs text-gray-500">{new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Render Events Tab
  const renderEventsTab = () => (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Semua Undangan</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2.5 bg-indigo-600 text-white rounded-xl active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada undangan</h3>
          <p className="text-sm text-gray-500 mb-6 px-4">Mulai buat undangan digital pertama Anda</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold active:scale-95 transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            Buat Sekarang
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const currentTheme = THEMES.find(t => t.id === event.theme_slug);
            return (
              <div
                key={event.id}
                className="bg-white overflow-hidden rounded-3xl border border-gray-100 shadow-sm"
              >
                <div className="h-32 relative overflow-hidden bg-gray-100">
                  {event.hero_image ? (
                    <img src={event.hero_image} className="w-full h-full object-cover" alt={event.event_name} />
                  ) : (
                    <div className={`w-full h-full ${currentTheme?.color} opacity-40 flex items-center justify-center text-4xl`}>
                      {currentTheme?.icon}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-white/90 border border-white/20 text-gray-800">
                      {currentTheme?.name}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 mb-1">{event.event_name}</h3>
                      <div className="flex items-center text-xs text-gray-500 gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-50">
                      {event.event_type === 'wedding' && '💍'}
                      {event.event_type === 'birthday' && '🎂'}
                      {event.event_type === 'graduation' && '🎓'}
                      {event.event_type === 'party' && '🎉'}
                      {!event.event_type && '💍'}
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-xl">
                    <MapPin className="w-3 h-3 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{event.location_name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to={`/events/${event.id}`}
                      className="col-span-2 flex items-center justify-center py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
                    >
                      Kelola Tamu
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); openEditModal(event); }}
                      className="flex items-center justify-center py-3 bg-gray-100 text-gray-600 rounded-xl active:scale-95 transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render Settings Tab
  const renderSettingsTab = () => (
    <div className="space-y-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Pengaturan</h2>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Email</p>
          <p className="text-sm font-bold text-gray-900">{user?.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-bold text-red-600">Keluar</span>
          </div>
        </button>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-6 border border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-900 mb-2">Platform Undangan Digital</h3>
        <p className="text-xs text-indigo-700">Versi 1.0.0</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-40">
        <div className="max-w-2xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-2 py-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'
                }`}
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">Beranda</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${activeTab === 'events' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'
                }`}
            >
              <Calendar className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">Undangan</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'
                }`}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">Pengaturan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] bg-white md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-0 md:border md:border-white/20"
            >
              {/* Modal Header */}
              <div className="px-4 md:px-8 py-4 md:py-6 border-b flex items-center justify-between bg-white sticky top-0 z-20">
                <div>
                  <h3 className="text-lg md:text-2xl font-serif font-bold text-gray-900 leading-tight">
                    {editingEvent ? 'Perbarui Acara' : 'Buat Acara Baru'}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 hidden md:block">Lengkapi detail acara Anda untuk hasil yang maksimal.</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 md:p-3 bg-gray-50 hover:bg-gray-100 rounded-xl md:rounded-2xl text-gray-400 hover:text-gray-600 transition-all active:scale-95"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <form onSubmit={editingEvent ? handleEditEvent : handleCreateEvent} id="event-form">
                  <div className="p-4 md:p-8 space-y-6">

                    {/* Basic Info */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Informasi Dasar</h4>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nama Acara</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Pernikahan Budi & Ani"
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-5 text-gray-900 transition-all outline-none"
                            value={newEvent.event_name}
                            onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
                          />
                        </div>

                        {/* Event Type Selector - NEW */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Jenis Acara</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Wedding */}
                            <button
                              type="button"
                              onClick={() => setNewEvent({ ...newEvent, event_type: 'wedding' })}
                              className={`p-4 rounded-2xl border-2 transition-all ${newEvent.event_type === 'wedding'
                                ? 'border-pink-500 bg-pink-50'
                                : 'border-gray-200 bg-white hover:border-pink-200'
                                }`}
                            >
                              <div className="text-3xl mb-2">💍</div>
                              <div className="text-xs font-bold text-gray-900">Pernikahan</div>
                              <div className="text-[10px] text-gray-500 mt-1">Wedding</div>
                            </button>

                            {/* Birthday */}
                            <button
                              type="button"
                              onClick={() => setNewEvent({ ...newEvent, event_type: 'birthday' })}
                              className={`p-4 rounded-2xl border-2 transition-all ${newEvent.event_type === 'birthday'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-blue-200'
                                }`}
                            >
                              <div className="text-3xl mb-2">🎂</div>
                              <div className="text-xs font-bold text-gray-900">Ulang Tahun</div>
                              <div className="text-[10px] text-gray-500 mt-1">Birthday</div>
                            </button>

                            {/* Graduation */}
                            <button
                              type="button"
                              onClick={() => setNewEvent({ ...newEvent, event_type: 'graduation' })}
                              className={`p-4 rounded-2xl border-2 transition-all ${newEvent.event_type === 'graduation'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-purple-200'
                                }`}
                            >
                              <div className="text-3xl mb-2">🎓</div>
                              <div className="text-xs font-bold text-gray-900">Wisuda</div>
                              <div className="text-[10px] text-gray-500 mt-1">Graduation</div>
                            </button>

                            {/* Party */}
                            <button
                              type="button"
                              onClick={() => setNewEvent({ ...newEvent, event_type: 'party' })}
                              className={`p-4 rounded-2xl border-2 transition-all ${newEvent.event_type === 'party'
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 bg-white hover:border-orange-200'
                                }`}
                            >
                              <div className="text-3xl mb-2">🎉</div>
                              <div className="text-xs font-bold text-gray-900">Pesta</div>
                              <div className="text-[10px] text-gray-500 mt-1">Party</div>
                            </button>
                          </div>

                          {/* Event Type Description */}
                          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-600">
                              {newEvent.event_type === 'wedding' && '💍 Undangan pernikahan dengan fitur lengkap: profil mempelai, cerita cinta, ayat suci, dll.'}
                              {newEvent.event_type === 'birthday' && '🎂 Undangan ulang tahun yang fun dan ceria dengan countdown party.'}
                              {newEvent.event_type === 'graduation' && '🎓 Undangan wisuda yang profesional dengan quote inspirasional.'}
                              {newEvent.event_type === 'party' && '🎉 Undangan pesta umum yang simple dan casual.'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Tanggal</label>
                            <input
                              type="date"
                              required
                              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-5 text-gray-900 transition-all outline-none"
                              value={newEvent.event_date}
                              onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Waktu</label>
                            <input
                              type="time"
                              required
                              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-5 text-gray-900 transition-all outline-none"
                              value={newEvent.event_time}
                              onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Lokasi</label>
                          <input
                            type="text"
                            required
                            placeholder="Gedung Serbaguna"
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-5 text-gray-900 transition-all outline-none"
                            value={newEvent.location_name}
                            onChange={(e) => setNewEvent({ ...newEvent, location_name: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Link Google Maps</label>
                          <input
                            type="url"
                            placeholder="https://maps.google.com/..."
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-5 text-gray-900 transition-all outline-none"
                            value={newEvent.google_maps_url}
                            onChange={(e) => setNewEvent({ ...newEvent, google_maps_url: e.target.value })}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Theme Selection */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pilih Tema</h4>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setNewEvent({ ...newEvent, theme_slug: theme.id as any })}
                            className={`flex flex-col p-3 rounded-2xl border-2 transition-all ${newEvent.theme_slug === theme.id
                              ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                              : 'border-gray-100 bg-white hover:border-indigo-200'
                              }`}
                          >
                            <div className={`w-full aspect-video rounded-xl ${theme.color} mb-2 flex items-center justify-center text-3xl`}>
                              {theme.icon}
                            </div>
                            <p className={`text-xs font-bold ${newEvent.theme_slug === theme.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                              {theme.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-4 md:px-8 py-6 bg-gray-50 border-t sticky bottom-0 z-20 flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (editingEvent ? 'Simpan Perubahan' : 'Buat Undangan')}
                      {!loading && <Sparkles className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-4 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};