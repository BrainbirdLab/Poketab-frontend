import { writable } from 'svelte/store';
import { DEFAULT_THEME } from './themesTypes';

export const currentTheme = writable(DEFAULT_THEME);