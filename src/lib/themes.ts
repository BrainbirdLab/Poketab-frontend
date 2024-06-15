import { writable } from "svelte/store";
    
type ThemeAccent = {
    [key: string]: {
        quickEmoji: string;
    };
};

//theme colors and backgrounds
export const themes: ThemeAccent = {
    'Piplup': {
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

export const DEFAULT_THEME = 'Piplup';
export const currentTheme = writable(DEFAULT_THEME);