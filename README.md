# Undangan Digital Platform 💌

Platform undangan digital modern yang elegan, responsif, dan interaktif. Dibuat untuk membantu Anda mengelola tamu dan menyebarkan undangan secara profesional hanya dalam beberapa klik.

---

## ✨ Fitur Utama

- **9+ Tema Premium**: Berbagai pilihan desain mewah mulai dari *Modern Blue* hingga *Ethereal Palace*.
- **RSVP Interaktif**: Tamu dapat mengonfirmasi kehadiran secara langsung di halaman undangan.
- **Buku Tamu Digital**: Kumpulan doa dan ucapan manis dari tamu yang tersimpan rapi.
- **Fitur Gift (Kado Digital)**: Integrasi nomor rekening BRI dan ShopeePay untuk memudahkan tamu memberikan hadiah.
- **Manajemen Tamu (Guest List)**:
  - Input tamu satu per satu atau **Bulk Import** (copy-paste massal).
  - Ekspor daftar tamu ke format CSV.
  - Tracker status kehadiran (Hadir/Berhalangan/Pending).
- **Auto-Invitation**:
  - Kirim undangan otomatis via **WhatsApp**.
  - Kirim undangan otomatis via **Instagram DM** (Auto-copy message).

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React.js dengan TypeScript
- **Styling**: Tailwind CSS & Framer Motion (untuk animasi premium)
- **Icons**: Lucide React
- **API/Database**: Mock API System (menggunakan LocalStorage untuk kemudahan demo tanpa server)

---

## 🚀 Alur Penggunaan (User Journey)

### 1. Persiapan & Instalasi
```bash
# Clone repository
git clone https://github.com/reskianugrahsari/Undangan-Digital.git

# Masuk ke direktori
cd Undangan-Digital

# Install dependencies
npm install

# Jalankan secara lokal
npm run dev
```

### 2. Login & Dashboard
Masuk menggunakan kredensial Anda (sistem saat ini menggunakan Mock Auth) untuk mengakses Dashboard utama.

### 3. Membuat Event
- Klik **"New Event"**.
- Isi detail acara (Nama, Tanggal, Jam, Lokasi, Link Google Maps).
- Pilih tema yang paling sesuai dengan karakter acara Anda.
- Unggah foto Galeri (Maksimal 10 foto).

### 4. Mengelola Tamu
- Masuk ke menu **"Kelola Tamu"**.
- Tambahkan nama tamu atau gunakan fitur **Bulk Import** dengan format: `Nama, Nomor WA, Instagram`.
- Klik tombol **Share (Ikon WhatsApp/Kertas)** untuk mengirimkan link unik ke masing-masing tamu.

### 5. Pengaturan Gift (Manual)
Untuk mengubah nomor rekening BRI atau ShopeePay yang muncul di undangan, Anda dapat mengedit file:
`src/services/mockApi.ts` pada bagian `SISIPKAN DATA REKENING MANUAL`.

---

## 📸 Tampilan Penggunaan bagi Tamu

1. **Cover**: Tamu melihat nama mereka di amplop digital yang elegan.
2. **Isi Undangan**: Informasi detail acara, countdown, dan galeri foto.
3. **Konfirmasi**: Tamu menekan tombol Hadir/Berhalangan.
4. **Berikan Hadiah**: Jika tamu berhalangan (atau ingin memberi kado), mereka dapat menyalin nomor rekening yang tersedia.
5. **Ucapan**: Tamu menuliskan doa restu di bagian bawah undangan.

---

## 📄 Lisensi
Proyek ini dikembangkan oleh **Reski Anugrah Sari, S.Kom**. Bebas digunakan untuk keperluan pembelajaran atau pengembangan lebih lanjut.

---

<div align="center">
  Dibuat dengan sepenuh hati untuk momen spesial Anda.
</div>
