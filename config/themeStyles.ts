
// Theme Style Configuration
// This file centralizes the visual styling for different event types

export interface ThemeStyle {
    // Fonts
    fontMain: string;     // The readable body font
    fontHeading: string;  // The decorative heading font

    // Colors - using Tailwind classes
    bgGradient: string;
    bgColor: string;
    textColor: string;
    accentColor: string;

    // Decorative Elements
    iconSet: 'floral' | 'party' | 'academic' | 'festive';

    // Animation Styles
    animationType: 'elegant' | 'bounce' | 'slide' | 'pop';

    // Specific Classes
    buttonClass: string;
    cardClass: string;
}

export const WEDDING_THEME: ThemeStyle = {
    fontMain: 'font-serif',       // Playfair Display
    fontHeading: 'font-script',   // Great Vibes
    bgGradient: 'from-pink-50 via-white to-blue-50',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    accentColor: 'text-pink-600',
    iconSet: 'floral',
    animationType: 'elegant',
    buttonClass: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg font-serif',
    cardClass: 'bg-white/90 backdrop-blur-sm border border-pink-100 shadow-xl rounded-3xl',
};

export const BIRTHDAY_THEME: ThemeStyle = {
    fontMain: 'font-nunito',      // Nunito
    fontHeading: 'font-fredoka',  // Fredoka One
    bgGradient: 'from-cyan-100 via-yellow-50 to-pink-100', // Colorful/Pastel
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    accentColor: 'text-blue-500',
    iconSet: 'party',             // Balloons, Cake
    animationType: 'bounce',
    buttonClass: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-xl font-fredoka uppercase tracking-wider',
    cardClass: 'bg-white/90 backdrop-blur-md border-4 border-yellow-200 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] rounded-3xl',
};

export const GRADUATION_THEME: ThemeStyle = {
    fontMain: 'font-lato',        // Lato
    fontHeading: 'font-cinzel',   // Cinzel
    bgGradient: 'from-blue-50 via-gray-50 to-slate-200', // Professional/Academic
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-800',
    accentColor: 'text-amber-600',
    iconSet: 'academic',          // Cap, Scroll
    animationType: 'slide',
    buttonClass: 'bg-slate-800 text-amber-500 border border-amber-500/50 shadow-lg font-cinzel font-bold tracking-widest uppercase',
    cardClass: 'bg-white shadow-2xl border-t-4 border-amber-500 rounded-xl',
};

export const PARTY_THEME: ThemeStyle = {
    fontMain: 'font-montserrat',  // Montserrat
    fontHeading: 'font-bebas',    // Bebas Neue
    bgGradient: 'from-purple-900 via-indigo-900 to-black', // Dark/Night mode
    bgColor: 'bg-gray-900',
    textColor: 'text-white',
    accentColor: 'text-fuchsia-400',
    iconSet: 'festive',           // Confetti, Drink
    animationType: 'pop',
    buttonClass: 'bg-fuchsia-600 text-white font-bebas text-xl tracking-widest hover:bg-fuchsia-500 shadow-[0_0_15px_rgba(255,0,255,0.5)] uppercase',
    cardClass: 'bg-gray-800/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl text-white',
};

export function getThemeStyle(eventType: string): ThemeStyle {
    switch (eventType) {
        case 'wedding': return WEDDING_THEME;
        case 'birthday': return BIRTHDAY_THEME;
        case 'graduation': return GRADUATION_THEME;
        case 'party': return PARTY_THEME;
        default: return WEDDING_THEME;
    }
}
