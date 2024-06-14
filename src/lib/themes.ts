import { writable } from "svelte/store";
    
type ThemeAccent = {
    [key: string]: {
        quickEmoji: string;
    };
};

//theme colors and backgrounds
export const themes: ThemeAccent = {
    'Sea': {
        quickEmoji: '🫧',
    },
    'Ocean': {
        quickEmoji: '🐳',
    },
    'Gengar': {
        quickEmoji: '👾',
    },
    'Caterpie': {
        quickEmoji: '🐛',
    },
    'Dark': {
        quickEmoji: '👽',
    },
    'River': {
        quickEmoji: '🍂',
    }
};

export const DEFAULT_THEME = 'Ocean';
export const currentTheme = writable(DEFAULT_THEME);