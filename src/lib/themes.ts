import { writable } from "svelte/store";
    
type ThemeAccent = {
    [key: string]: {
        quickEmoji: string;
    };
};

//theme colors and backgrounds
export const themes: ThemeAccent = {
    'Blue': {
        quickEmoji: '🥶',
    },
    'Ocean': {
        quickEmoji: '🐳',
    },
    'Cyberpunk': {
        quickEmoji: '👾',
    },
    'Geometry': {
        quickEmoji: '🔥',
    },
    'Blackboard': {
        quickEmoji: '👽',
    },
    'Forest': {
        quickEmoji: '🍃',
    }
};

export const DEFAULT_THEME = 'Ocean';
export const currentTheme = writable(DEFAULT_THEME);