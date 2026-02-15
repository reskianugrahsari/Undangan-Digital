import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/mockApi';
import { Event, Guest, Wish, RSVPStatus } from '../types';
import { Users, Copy, Check, MessageCircle, MapPin, Calendar, ArrowLeft, Upload, Download, Share2, FileSpreadsheet, Trash2, Search, Plus, MoreVertical, Filter } from 'lucide-react';

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [addingGuest, setAddingGuest] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Bulk import states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkGuestText, setBulkGuestText] = useState('');
  const [importing, setImporting] = useState(false);


  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (eventId: string) => {
    try {
      const [eventData, guestData, wishData] = await Promise.all([
        api.events.getById(eventId),
        api.guests.listByEvent(eventId),
        api.wishes.listByEvent(eventId)
      ]);
      if (eventData) setEvent(eventData);
      setGuests(guestData);
      setWishes(wishData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newGuestName.trim()) return;
    setAddingGuest(true);
    try {
      await api.guests.create(id, newGuestName);
      setNewGuestName('');
      const updatedGuests = await api.guests.listByEvent(id);
      setGuests(updatedGuests);
    } finally {
      setAddingGuest(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/#/invitation/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const shareViaWhatsApp = (guest: Guest) => {
    const url = `${window.location.origin}/#/invitation/${guest.unique_slug}`;
    const message = `Halo ${guest.guest_name}! 🎉\n\nAnda diundang ke ${event?.event_name}!\n\nBuka undangan Anda di:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (!confirm(`Hapus tamu "${guestName}"?\n\nData RSVP dan ucapan dari tamu ini akan ikut terhapus.`)) return;

    setLoading(true);
    try {
      await api.guests.delete(guestId);
      if (id) {
        const updatedGuests = await api.guests.listByEvent(id);
        setGuests(updatedGuests);
        const updatedWishes = await api.wishes.listByEvent(id);
        setWishes(updatedWishes);
      }
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus tamu');
    } finally {
      setLoading(false);
    }
  };


  const handleBulkImport = async () => {
    if (!id || !bulkGuestText.trim()) return;
    setImporting(true);
    try {
      // Split by newline and filter empty lines
      const lines = bulkGuestText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const newGuests: Guest[] = [];

      // Parse each line: support "Name, Phone, Instagram" or just "Name"
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        const phone = parts[1] || '';
        const instagram = parts[2] || '';

        if (name) {
          const guest = await api.guests.create(id, name, phone, instagram);
          newGuests.push(guest);
        }
      }

      // Reload guests
      const updatedGuests = await api.guests.listByEvent(id);
      setGuests(updatedGuests);
      setBulkGuestText('');
      setShowBulkModal(false);

      // Auto-send invitations immediately (no confirmation)
      if (newGuests.length > 0) {
        const guestsWithPhone = newGuests.filter(g => g.phone_number && g.phone_number.trim());
        const guestsWithIG = newGuests.filter(g => g.instagram && g.instagram.trim());

        let message = `✅ ${newGuests.length} tamu berhasil ditambahkan!\n\n`;

        // Auto-send to WhatsApp
        if (guestsWithPhone.length > 0) {
          message += `📱 Mengirim ${guestsWithPhone.length} undangan via WhatsApp...\n`;
          autoSendWhatsApp(guestsWithPhone);
        }

        // Auto-send to Instagram
        if (guestsWithIG.length > 0) {
          message += `📸 Mengirim ${guestsWithIG.length} undangan via Instagram...\n`;
          autoSendInstagram(guestsWithIG);
        }

        if (guestsWithPhone.length === 0 && guestsWithIG.length === 0) {
          message += `💡 Tidak ada nomor WA/IG yang diinput.\nAnda bisa kirim manual dengan klik tombol Share.`;
        } else {
          message += `\n✨ Tab WhatsApp/Instagram akan terbuka otomatis.\nAnda tinggal klik "Send" di setiap chat!`;
        }

        alert(message);
      }
    } catch (error) {
      console.error(error);
      alert('Gagal mengimport tamu');
    } finally {
      setImporting(false);
    }
  };


  const autoSendWhatsApp = (guestList: Guest[]) => {
    let currentIndex = 0;

    const sendNext = () => {
      if (currentIndex >= guestList.length) {
        alert('✅ Semua undangan WhatsApp berhasil dikirim!');
        return;
      }

      const guest = guestList[currentIndex];
      const url = `${window.location.origin}/#/invitation/${guest.unique_slug}`;
      const message = `Halo ${guest.guest_name}! 🎉\n\nAnda diundang ke ${event?.event_name}!\n\nBuka undangan Anda di:\n${url}`;
      const phone = guest.phone_number!.replace(/\D/g, '');

      // Open WhatsApp
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');

      currentIndex++;

      // Ask to continue if there are more guests
      if (currentIndex < guestList.length) {
        setTimeout(() => {
          const continueNext = confirm(
            `📱 WhatsApp untuk ${guest.guest_name} sudah terbuka!\n\n` +
            `Kirim pesan, lalu klik OK untuk lanjut ke tamu berikutnya.\n\n` +
            `Progress: ${currentIndex}/${guestList.length}\n` +
            `Berikutnya: ${guestList[currentIndex].guest_name}`
          );

          if (continueNext) {
            sendNext();
          } else {
            alert(`⏸️ Pengiriman dihentikan.\n${guestList.length - currentIndex} tamu tersisa.`);
          }
        }, 1000);
      } else {
        alert('✅ Semua undangan WhatsApp berhasil dikirim!');
      }
    };

    // Start sending
    alert(
      `🚀 Mulai mengirim ${guestList.length} undangan via WhatsApp!\n\n` +
      `Cara kerja:\n` +
      `1. WhatsApp akan terbuka untuk setiap tamu\n` +
      `2. Klik "Send" di WhatsApp\n` +
      `3. Klik "OK" untuk lanjut ke tamu berikutnya\n\n` +
      `Klik OK untuk mulai!`
    );
    sendNext();
  };

  const autoSendInstagram = (guestList: Guest[]) => {
    let currentIndex = 0;
    let allMessages = '';

    // Prepare all messages
    guestList.forEach(guest => {
      const url = `${window.location.origin}/#/invitation/${guest.unique_slug}`;
      const message = `Halo ${guest.guest_name}! 🎉\n\nAnda diundang ke ${event?.event_name}!\n\nBuka undangan Anda di:\n${url}`;
      allMessages += `\n\n--- ${guest.guest_name} ---\n${message}`;
    });

    const sendNext = () => {
      if (currentIndex >= guestList.length) {
        alert('✅ Semua undangan Instagram berhasil dikirim!');
        return;
      }

      const guest = guestList[currentIndex];
      const username = guest.instagram!.replace('@', '');
      const url = `${window.location.origin}/#/invitation/${guest.unique_slug}`;
      const message = `Halo ${guest.guest_name}! 🎉\n\nAnda diundang ke ${event?.event_name}!\n\nBuka undangan Anda di:\n${url}`;

      // Copy message to clipboard
      navigator.clipboard.writeText(message);

      // Open Instagram DM
      window.open(`https://ig.me/m/${username}`, '_blank');

      currentIndex++;

      // Ask to continue if there are more guests
      if (currentIndex < guestList.length) {
        setTimeout(() => {
          const continueNext = confirm(
            `📸 Instagram DM untuk ${guest.guest_name} sudah terbuka!\n` +
            `Pesan sudah di-copy ke clipboard.\n\n` +
            `Paste (Ctrl+V) dan kirim, lalu klik OK untuk lanjut.\n\n` +
            `Progress: ${currentIndex}/${guestList.length}\n` +
            `Berikutnya: ${guestList[currentIndex].guest_name}`
          );

          if (continueNext) {
            sendNext();
          } else {
            alert(`⏸️ Pengiriman dihentikan.\n${guestList.length - currentIndex} tamu tersisa.`);
          }
        }, 1000);
      } else {
        alert('✅ Semua undangan Instagram berhasil dikirim!');
      }
    };

    // Start sending
    alert(
      `🚀 Mulai mengirim ${guestList.length} undangan via Instagram!\n\n` +
      `Cara kerja:\n` +
      `1. Instagram DM akan terbuka untuk setiap tamu\n` +
      `2. Pesan otomatis di-copy, paste (Ctrl+V) dan kirim\n` +
      `3. Klik "OK" untuk lanjut ke tamu berikutnya\n\n` +
      `Klik OK untuk mulai!`
    );
    sendNext();
  };

  const downloadTemplate = () => {
    const template = `Nama Tamu, Nomor Telepon (opsional), Instagram (opsional)
John Doe, 6281234567890, @johndoe
Jane Smith, 628765432109, @janesmith
Ahmad Rizki
Siti Nurhaliza`;
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-daftar-tamu.txt';
    a.click();
  };

  const exportGuestList = () => {
    const csv = `Nama,Status,Link Undangan\n${guests.map(g =>
      `${g.guest_name},${g.status_rsvp},${window.location.origin}/#/invitation/${g.unique_slug}`
    ).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daftar-tamu-${event?.event_name}.csv`;
    a.click();
  };

  if (loading || !event) {
    return <div className="p-12 text-center">Loading...</div>;
  }

  const rsvpStats = {
    [RSVPStatus.HADIR]: guests.filter(g => g.status_rsvp === RSVPStatus.HADIR).length,
    [RSVPStatus.TIDAK_HADIR]: guests.filter(g => g.status_rsvp === RSVPStatus.TIDAK_HADIR).length,
    [RSVPStatus.PENDING]: guests.filter(g => g.status_rsvp === RSVPStatus.PENDING).length,
  };

  return (
    <div className="space-y-8">
      <div>
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-gray-100 relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl -z-10 opacity-50"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-sm font-medium text-indigo-600 uppercase tracking-wider mb-1">Event Dashboard</p>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 leading-tight">{event.event_name}</h1>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-gray-600">
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                  <span className="text-sm font-medium">{new Date(event.event_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <MapPin className="w-4 h-4 mr-2 text-red-500" />
                  <a href={event.google_maps_url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-indigo-600 truncate max-w-[200px]">
                    {event.location_name}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions (e.g. Share Public Link) */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/#/invitation/${guests[0]?.unique_slug || 'preview'}`;
                  window.open(url, '_blank');
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
              <span className="block text-3xl font-bold text-green-600">{rsvpStats[RSVPStatus.HADIR]}</span>
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide mt-1">Hadir</span>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-center">
              <span className="block text-3xl font-bold text-red-600">{rsvpStats[RSVPStatus.TIDAK_HADIR]}</span>
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wide mt-1">Tidak Hadir</span>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-center">
              <span className="block text-3xl font-bold text-yellow-600">{rsvpStats[RSVPStatus.PENDING]}</span>
              <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mt-1">Pending</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Guest Management */}
        {/* Guest Management */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center text-gray-900">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              Guest List
              <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs py-1 px-2 rounded-full">{guests.length}</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {/* Actions */}
              <button onClick={downloadTemplate} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Template</span>
              </button>
              <button onClick={() => setShowBulkModal(true)} className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Bulk Import</span>
              </button>
              {guests.length > 0 && (
                <button onClick={exportGuestList} className="px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
                  <FileSpreadsheet className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Add Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Add */}
            <form onSubmit={handleAddGuest} className="flex gap-2 flex-1">
              <input
                type="text"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                placeholder="Add new guest name..."
                className="flex-1 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
              <button type="submit" disabled={addingGuest} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="overflow-y-auto max-h-[500px]">
            {/* Desktop Table View */}
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
              <thead className="bg-gray-50 sticky top-0 md:static">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guests.filter(g => g.guest_name.toLowerCase().includes(searchTerm.toLowerCase())).map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{guest.guest_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full 
                        ${guest.status_rsvp === RSVPStatus.HADIR ? 'bg-green-100 text-green-800' :
                          guest.status_rsvp === RSVPStatus.TIDAK_HADIR ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                        {guest.status_rsvp}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => shareViaWhatsApp(guest)}
                          className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          title="Share via WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyLink(guest.unique_slug)}
                          className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Copy link"
                        >
                          {copiedSlug === guest.unique_slug ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id, guest.guest_name)}
                          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Hapus tamu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {guests.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No guests found. Add one above!</td></tr>
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {guests.filter(g => g.guest_name.toLowerCase().includes(searchTerm.toLowerCase())).map((guest) => (
                <div key={guest.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center group active:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{guest.guest_name}</p>
                    <span className={`px-2 py-0.5 inline-flex text-[10px] uppercase font-bold rounded-full 
                        ${guest.status_rsvp === RSVPStatus.HADIR ? 'bg-green-100 text-green-700' :
                        guest.status_rsvp === RSVPStatus.TIDAK_HADIR ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700 checkbox-xs'}`}>
                      {guest.status_rsvp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => shareViaWhatsApp(guest)}
                      className="p-2 text-green-600 bg-white border border-gray-200 rounded-lg shadow-sm active:scale-95 transition-transform"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyLink(guest.unique_slug)}
                      className="p-2 text-indigo-600 bg-white border border-gray-200 rounded-lg shadow-sm active:scale-95 transition-transform"
                    >
                      {copiedSlug === guest.unique_slug ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteGuest(guest.id, guest.guest_name)}
                      className="p-2 text-red-600 bg-white border border-gray-200 rounded-lg shadow-sm active:scale-95 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {guests.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">No guests found. Add one above!</div>
              )}
            </div>
          </div>
        </div>

        {/* Wishes Feed */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center text-gray-900">
              <MessageCircle className="w-5 h-5 mr-2 text-indigo-600" />
              Wishes & Messages
              <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs py-1 px-2 rounded-full">{wishes.length}</span>
            </h2>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {wishes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No expectations or wishes received yet.</p>
              </div>
            ) : (
              wishes.map((wish) => (
                <div key={wish.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0 border border-indigo-50 shadow-inner">
                    {wish.guest_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{wish.guest_name}</h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(wish.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed break-words bg-gray-50 p-3 rounded-lg rounded-tl-none mt-1">
                      {wish.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowBulkModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-xl leading-6 font-bold text-gray-900 mb-4">🚀 Bulk Import & Auto-Send</h3>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800 font-semibold mb-3">📋 Format Spreadsheet:</p>
                      <div className="bg-white rounded p-3 mb-3 font-mono text-xs">
                        <div className="text-gray-500 mb-1">Nama, Nomor WA, Instagram</div>
                        <div>John Doe, 6281234567890, @johndoe</div>
                        <div>Jane Smith, 628765432109</div>
                        <div>Ahmad Rizki</div>
                      </div>
                      <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Buat 3 kolom di Google Sheets: <strong>Nama, Nomor WA, Instagram</strong></li>
                        <li>Isi data tamu (Nomor WA & IG opsional)</li>
                        <li>Copy semua data (tanpa header)</li>
                        <li>Paste di kotak bawah</li>
                        <li>Klik "Import" → Pilih "Ya" untuk <strong>auto-send via WhatsApp!</strong></li>
                      </ol>
                      <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded">
                        <p className="text-xs text-green-800">
                          💡 <strong>Auto-Send:</strong> Undangan otomatis dikirim ke semua tamu yang punya nomor WA!
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paste Data Tamu (Format: Nama, Nomor WA, Instagram)
                      </label>
                      <textarea
                        rows={10}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                        placeholder="John Doe, 6281234567890, @johndoe&#10;Jane Smith, 628765432109&#10;Ahmad Rizki&#10;Siti Nurhaliza, 6287654321098"
                        value={bulkGuestText}
                        onChange={(e) => setBulkGuestText(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {bulkGuestText.split('\n').filter(l => l.trim()).length} tamu akan diimport
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={importing || !bulkGuestText.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Import Tamu'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};