// Template Configuration for Different Event Types

export interface TemplateSection {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
}

export interface EventTemplate {
    eventType: 'wedding' | 'birthday' | 'graduation' | 'party';
    sections: TemplateSection[];
    customContent: {
        coverTitle?: string;
        heroGreeting?: string;
        quoteSection?: boolean;
        brideGroomSection?: boolean;
        loveStorySection?: boolean;
        countdownLabel?: string;
        eventDetailsTitle?: string;
        giftSectionTitle?: string;
    };
}

// Wedding Template (Current - Full Featured)
export const WEDDING_TEMPLATE: EventTemplate = {
    eventType: 'wedding',
    sections: [
        { id: 'cover', name: 'Cover Page', enabled: true, order: 1 },
        { id: 'hero', name: 'Hero Section', enabled: true, order: 2 },
        { id: 'quote', name: 'Quote/Ayat Suci', enabled: true, order: 3 },
        { id: 'bride-groom', name: 'Bride & Groom Profile', enabled: true, order: 4 },
        { id: 'love-story', name: 'Love Story', enabled: true, order: 5 },
        { id: 'event-details', name: 'Event Details & Countdown', enabled: true, order: 6 },
        { id: 'gallery', name: 'Gallery', enabled: true, order: 7 },
        { id: 'rsvp', name: 'RSVP', enabled: true, order: 8 },
        { id: 'wishes', name: 'Buku Tamu', enabled: true, order: 9 },
        { id: 'gift', name: 'Amplop Digital', enabled: true, order: 10 },
        { id: 'footer', name: 'Footer', enabled: true, order: 11 },
    ],
    customContent: {
        coverTitle: 'THE WEDDING OF',
        heroGreeting: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم',
        quoteSection: true,
        brideGroomSection: true,
        loveStorySection: true,
        countdownLabel: 'Menghitung Hari',
        eventDetailsTitle: 'Waktu & Tempat Acara',
        giftSectionTitle: 'Amplop Digital',
    },
};

// Birthday Template (Simpler, Fun)
export const BIRTHDAY_TEMPLATE: EventTemplate = {
    eventType: 'birthday',
    sections: [
        { id: 'cover', name: 'Cover Page', enabled: true, order: 1 },
        { id: 'hero', name: 'Hero Section', enabled: true, order: 2 },
        { id: 'quote', name: 'Birthday Wish', enabled: true, order: 3 }, // Different content
        { id: 'event-details', name: 'Event Details & Countdown', enabled: true, order: 4 },
        { id: 'gallery', name: 'Gallery', enabled: true, order: 5 },
        { id: 'rsvp', name: 'RSVP', enabled: true, order: 6 },
        { id: 'wishes', name: 'Birthday Wishes', enabled: true, order: 7 },
        { id: 'gift', name: 'Send Gift', enabled: true, order: 8 },
        { id: 'footer', name: 'Footer', enabled: true, order: 9 },
    ],
    customContent: {
        coverTitle: 'BIRTHDAY CELEBRATION',
        heroGreeting: 'Join us to celebrate',
        quoteSection: true, // But with birthday quote
        brideGroomSection: false, // No bride/groom for birthday
        loveStorySection: false, // No love story for birthday
        countdownLabel: 'Countdown to the Party',
        eventDetailsTitle: 'Party Details',
        giftSectionTitle: 'Send a Gift',
    },
};

// Graduation Template (Professional)
export const GRADUATION_TEMPLATE: EventTemplate = {
    eventType: 'graduation',
    sections: [
        { id: 'cover', name: 'Cover Page', enabled: true, order: 1 },
        { id: 'hero', name: 'Hero Section', enabled: true, order: 2 },
        { id: 'quote', name: 'Inspirational Quote', enabled: true, order: 3 },
        { id: 'event-details', name: 'Event Details & Countdown', enabled: true, order: 4 },
        { id: 'gallery', name: 'Gallery', enabled: true, order: 5 },
        { id: 'rsvp', name: 'RSVP', enabled: true, order: 6 },
        { id: 'wishes', name: 'Congratulations', enabled: true, order: 7 },
        { id: 'footer', name: 'Footer', enabled: true, order: 8 },
    ],
    customContent: {
        coverTitle: 'GRADUATION CEREMONY',
        heroGreeting: 'You are cordially invited',
        quoteSection: true, // Inspirational quote
        brideGroomSection: false,
        loveStorySection: false,
        countdownLabel: 'Days Until Graduation',
        eventDetailsTitle: 'Ceremony Details',
        giftSectionTitle: 'Congratulatory Gift',
    },
};

// Party Template (Casual, Fun)
export const PARTY_TEMPLATE: EventTemplate = {
    eventType: 'party',
    sections: [
        { id: 'cover', name: 'Cover Page', enabled: true, order: 1 },
        { id: 'hero', name: 'Hero Section', enabled: true, order: 2 },
        { id: 'event-details', name: 'Event Details & Countdown', enabled: true, order: 3 },
        { id: 'gallery', name: 'Gallery', enabled: true, order: 4 },
        { id: 'rsvp', name: 'RSVP', enabled: true, order: 5 },
        { id: 'wishes', name: 'Messages', enabled: true, order: 6 },
        { id: 'footer', name: 'Footer', enabled: true, order: 7 },
    ],
    customContent: {
        coverTitle: 'YOU ARE INVITED',
        heroGreeting: 'Join the celebration',
        quoteSection: false, // No quote for casual party
        brideGroomSection: false,
        loveStorySection: false,
        countdownLabel: 'Party Countdown',
        eventDetailsTitle: 'Event Details',
        giftSectionTitle: 'Bring a Gift',
    },
};

// Template Selector
export function getTemplateByEventType(eventType: 'wedding' | 'birthday' | 'graduation' | 'party'): EventTemplate {
    switch (eventType) {
        case 'wedding':
            return WEDDING_TEMPLATE;
        case 'birthday':
            return BIRTHDAY_TEMPLATE;
        case 'graduation':
            return GRADUATION_TEMPLATE;
        case 'party':
            return PARTY_TEMPLATE;
        default:
            return WEDDING_TEMPLATE;
    }
}

// Helper to check if section is enabled
export function isSectionEnabled(template: EventTemplate, sectionId: string): boolean {
    const section = template.sections.find(s => s.id === sectionId);
    return section ? section.enabled : false;
}
