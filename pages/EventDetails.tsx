import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/mockApi';
import { Event, Guest, Wish, RSVPStatus } from '../types';
import { Users, Copy, Check, MessageCircle, MapPin, Calendar, ArrowLeft, Upload, Download, Share2, FileSpreadsheet, Trash2 } from 'lucide-react';

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h1 className="text-3xl font-serif font-bold text-gray-900">{event.event_name}</h1>
          <div className="mt-4 flex flex-col sm:flex-row sm:space-x-6 text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {new Date(event.event_date).toLocaleString()}
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
              <MapPin className="w-5 h-5 mr-2" />
              <a href={event.google_maps_url} target="_blank" rel="noreferrer" className="hover:underline hover:text-indigo-600">
                {event.location_name}
              </a>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <span className="block text-2xl font-bold text-green-600">{rsvpStats[RSVPStatus.HADIR]}</span>
              <span className="text-sm text-gray-500">Attending</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-red-600">{rsvpStats[RSVPStatus.TIDAK_HADIR]}</span>
              <span className="text-sm text-gray-500">Declined</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-yellow-600">{rsvpStats[RSVPStatus.PENDING]}</span>
              <span className="text-sm text-gray-500">Pending</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Guest Management */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Users className="w-5 h-5 mr-2" /> Guest List ({guests.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={downloadTemplate}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Template
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Bulk Import
              </button>
              {guests.length > 0 && (
                <button
                  onClick={exportGuestList}
                  className="px-3 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleAddGuest} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              placeholder="Guest Name"
              className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={addingGuest}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
          </form>

          <div className="overflow-y-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guests.map((guest) => (
                  <tr key={guest.id}>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{guest.guest_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${guest.status_rsvp === RSVPStatus.HADIR ? 'bg-green-100 text-green-800' :
                          guest.status_rsvp === RSVPStatus.TIDAK_HADIR ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                        {guest.status_rsvp}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => shareViaWhatsApp(guest)}
                          className="text-green-600 hover:text-green-900"
                          title="Share via WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyLink(guest.unique_slug)}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          title="Copy link"
                        >
                          {copiedSlug === guest.unique_slug ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id, guest.guest_name)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus tamu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wishes Feed */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <MessageCircle className="w-5 h-5 mr-2" /> Wishes & Messages
          </h2>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {wishes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No wishes yet.</p>
            ) : (
              wishes.map((wish) => (
                <div key={wish.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-800 italic">"{wish.message}"</p>
                  <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                    <span className="font-semibold text-indigo-600">{wish.guest_name}</span>
                    <span>{new Date(wish.created_at).toLocaleDateString()}</span>
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