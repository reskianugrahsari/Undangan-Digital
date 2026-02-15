# Template System untuk Event Types

## 📋 Overview

Sistem template ini memungkinkan setiap jenis undangan (wedding, birthday, graduation, party) memiliki struktur dan konten yang berbeda sesuai dengan tema acara.

## 🎯 Event Types yang Didukung

### 1. **Wedding** (Pernikahan) - FULL FEATURED
**Sections:**
1. Cover Page
2. Hero Section (Bismillah)
3. Quote/Ayat Suci (QS. Ar-Rum: 21)
4. Bride & Groom Profile
5. Love Story
6. Event Details & Countdown
7. Gallery
8. RSVP
9. Buku Tamu
10. Amplop Digital
11. Footer

**Karakteristik:**
- Paling lengkap dengan semua fitur
- Ada Ayat Suci (Islamic)
- Ada profil mempelai dengan nama orang tua
- Ada cerita cinta (Love Story)
- Tone: Romantis, santun, spiritual

---

### 2. **Birthday** (Ulang Tahun) - SIMPLER & FUN
**Sections:**
1. Cover Page
2. Hero Section
3. Birthday Wish Quote
4. Event Details & Countdown
5. Gallery
6. RSVP
7. Birthday Wishes
8. Send Gift
9. Footer

**Karakteristik:**
- Lebih simple, tidak ada profil orang tua
- Quote birthday yang fun
- Tidak ada Love Story
- Tone: Fun, cheerful, celebratory

**Removed Sections:**
- ❌ Bride & Groom Profile
- ❌ Love Story

---

### 3. **Graduation** (Wisuda) - PROFESSIONAL
**Sections:**
1. Cover Page
2. Hero Section
3. Inspirational Quote
4. Event Details & Countdown
5. Gallery
6. RSVP
7. Congratulations Messages
8. Footer

**Karakteristik:**
- Professional dan formal
- Quote inspirasional
- Tidak ada gift section (opsional)
- Tone: Professional, inspirational, proud

**Removed Sections:**
- ❌ Bride & Groom Profile
- ❌ Love Story
- ❌ Gift Section (opsional)

---

### 4. **Party** (Pesta Umum) - CASUAL & MINIMAL
**Sections:**
1. Cover Page
2. Hero Section
3. Event Details & Countdown
4. Gallery
5. RSVP
6. Messages
7. Footer

**Karakteristik:**
- Paling minimal dan casual
- Tidak ada quote section
- Fokus pada info acara
- Tone: Casual, fun, relaxed

**Removed Sections:**
- ❌ Quote Section
- ❌ Bride & Groom Profile
- ❌ Love Story
- ❌ Gift Section (opsional)

---

## 🔧 Cara Menggunakan

### 1. Template Configuration (`config/eventTemplates.ts`)

```typescript
import { getTemplateByEventType, isSectionEnabled } from '../config/eventTemplates';

// Get template for current event
const template = getTemplateByEventType(event.event_type);

// Check if section should be shown
if (isSectionEnabled(template, 'bride-groom')) {
  // Render Bride & Groom section
}
```

### 2. Quote Content (`config/quoteContent.ts`)

```typescript
import { getQuoteByEventType } from '../config/quoteContent';

// Get quote for current event type
const quoteContent = getQuoteByEventType(event.event_type);

// Use in component
<p>{quoteContent.quote}</p>
<p>{quoteContent.translation}</p>
```

### 3. Conditional Rendering in PublicInvitation.tsx

```tsx
{/* Quote Section - Only for wedding, birthday, graduation */}
{isSectionEnabled(template, 'quote') && (
  <section>
    <h2>{quoteContent.title}</h2>
    <p>{quoteContent.quote}</p>
    {quoteContent.translation && <p>{quoteContent.translation}</p>}
  </section>
)}

{/* Bride & Groom - Only for wedding */}
{isSectionEnabled(template, 'bride-groom') && (
  <section>
    {/* Bride & Groom Profile */}
  </section>
)}

{/* Love Story - Only for wedding */}
{isSectionEnabled(template, 'love-story') && (
  <section>
    {/* Love Story Timeline */}
  </section>
)}
```

---

## 📝 Customization Content per Event Type

### Cover Page Title
- **Wedding**: "THE WEDDING OF"
- **Birthday**: "BIRTHDAY CELEBRATION"
- **Graduation**: "GRADUATION CEREMONY"
- **Party**: "YOU ARE INVITED"

### Hero Greeting
- **Wedding**: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم" (Bismillah)
- **Birthday**: "Join us to celebrate"
- **Graduation**: "You are cordially invited"
- **Party**: "Join the celebration"

### Countdown Label
- **Wedding**: "Menghitung Hari"
- **Birthday**: "Countdown to the Party"
- **Graduation**: "Days Until Graduation"
- **Party**: "Party Countdown"

### Event Details Title
- **Wedding**: "Waktu & Tempat Acara"
- **Birthday**: "Party Details"
- **Graduation**: "Ceremony Details"
- **Party**: "Event Details"

### Gift Section Title
- **Wedding**: "Amplop Digital"
- **Birthday**: "Send a Gift"
- **Graduation**: "Congratulatory Gift"
- **Party**: "Bring a Gift"

---

## 🎨 Quote Content per Event Type

### Wedding Quote
```
Arabic: وَمِنْ ءَايَٰتِهِۦٓ أَنْ خَلَقَ لَكُم...
Translation: "Dan di antara tanda-tanda (kebesaran)-Nya..."
Source: (QS. Ar-Rum: 21)
Icon: 💍
```

### Birthday Quote
```
Quote: "Age is merely the number of years the world has been enjoying you..."
Icon: 🎂
```

### Graduation Quote
```
Quote: "The future belongs to those who believe in the beauty of their dreams..."
Translation: "Masa depan milik mereka yang percaya..."
Source: - Eleanor Roosevelt
Icon: 🎓
```

### Party Quote
```
Quote: "Life is a party, dress like it!..."
Icon: 🎉
```

---

## 🚀 Next Steps

### Implementasi di PublicInvitation.tsx:

1. ✅ Import template system
2. ✅ Get template & quote based on event type
3. ⏳ Wrap sections dengan conditional rendering
4. ⏳ Update text content berdasarkan template.customContent
5. ⏳ Test dengan berbagai event types

### Testing:
- [ ] Test wedding template (full featured)
- [ ] Test birthday template (no bride/groom, no love story)
- [ ] Test graduation template (professional)
- [ ] Test party template (minimal)

---

## 💡 Benefits

1. **Flexibility**: Setiap event type punya struktur sendiri
2. **Maintainability**: Mudah update konten per event type
3. **Scalability**: Mudah tambah event type baru
4. **User Experience**: Konten relevan dengan jenis acara
5. **Code Organization**: Template config terpisah dari UI logic

---

## 📦 File Structure

```
config/
├── eventTemplates.ts    # Template configuration
└── quoteContent.ts      # Quote content per event type

pages/
└── PublicInvitation.tsx # Main invitation page (uses templates)
```

---

## ⚙️ Cara Menambah Event Type Baru

1. Tambahkan type di `types.ts`:
```typescript
event_type: 'wedding' | 'birthday' | 'graduation' | 'party' | 'aqiqah'
```

2. Buat template di `eventTemplates.ts`:
```typescript
export const AQIQAH_TEMPLATE: EventTemplate = {
  eventType: 'aqiqah',
  sections: [...],
  customContent: {...}
};
```

3. Buat quote di `quoteContent.ts`:
```typescript
export const AQIQAH_QUOTE: QuoteContent = {...};
```

4. Update selector functions untuk include type baru

5. Test!
