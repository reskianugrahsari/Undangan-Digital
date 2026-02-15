// Quote Content for Different Event Types

export interface QuoteContent {
    title: string;
    quote: string;
    translation?: string;
    source?: string;
    icon: string;
}

// Wedding Quote (Islamic)
export const WEDDING_QUOTE: QuoteContent = {
    title: 'Ayat Suci',
    quote: 'وَمِنْ ءَايَٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْكُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    translation: '"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."',
    source: '(QS. Ar-Rum: 21)',
    icon: '💍',
};

// Birthday Quote
export const BIRTHDAY_QUOTE: QuoteContent = {
    title: 'Birthday Wish',
    quote: '"Age is merely the number of years the world has been enjoying you. Cheers to another year of making wonderful memories!"',
    translation: undefined,
    source: undefined,
    icon: '🎂',
};

// Graduation Quote
export const GRADUATION_QUOTE: QuoteContent = {
    title: 'Inspirational Words',
    quote: '"The future belongs to those who believe in the beauty of their dreams. Your hard work and dedication have brought you to this moment."',
    translation: '"Masa depan milik mereka yang percaya pada keindahan mimpi mereka. Kerja keras dan dedikasi Anda telah membawa Anda ke momen ini."',
    source: '- Eleanor Roosevelt',
    icon: '🎓',
};

// Party Quote (Optional - fun quote)
export const PARTY_QUOTE: QuoteContent = {
    title: 'Let\'s Celebrate',
    quote: '"Life is a party, dress like it! Let\'s make unforgettable memories together."',
    translation: undefined,
    source: undefined,
    icon: '🎉',
};

export function getQuoteByEventType(eventType: 'wedding' | 'birthday' | 'graduation' | 'party'): QuoteContent {
    switch (eventType) {
        case 'wedding':
            return WEDDING_QUOTE;
        case 'birthday':
            return BIRTHDAY_QUOTE;
        case 'graduation':
            return GRADUATION_QUOTE;
        case 'party':
            return PARTY_QUOTE;
        default:
            return WEDDING_QUOTE;
    }
}
