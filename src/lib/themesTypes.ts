type ThemeAccent = {
    [key: string]: {
        quickEmoji: string;
        accentColor: string;
    };
};

//theme colors and backgrounds
export const themes: ThemeAccent = {
    'Piplup': {
        quickEmoji: '🫧',
        accentColor: 'hsl(198.75deg 88.89% 10.59%)',
    },
    'Ocean': {
        quickEmoji: '🐳',
        accentColor: 'hsl(198.57deg 87.5% 9.41%)',
    },
    'Gengar': {
        quickEmoji: '👾',
        accentColor: 'hsl(279.69deg 54.53% 19.09%)',
    },
    'Caterpie': {
        quickEmoji: '🐛',
        accentColor: 'hsl(150deg 7.38% 15.77%)',
    },
    'Dark': {
        quickEmoji: '🦇',
        accentColor: 'hsl(36.54deg 1.09% 9.95%)',
    },
    'River': {
        quickEmoji: '🍂',
        accentColor: 'hsl(168deg 45.62% 13.99%)',
    }
};

export const DEFAULT_THEME = 'Piplup';