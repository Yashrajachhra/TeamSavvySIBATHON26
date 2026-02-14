import { create } from 'zustand';

interface ThemeState {
    theme: 'light' | 'dark' | 'system';
    isDark: boolean;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: 'dark',
    isDark: true,

    setTheme: (theme) => {
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (typeof window !== 'undefined') {
            localStorage.setItem('smartsolar_theme', theme);
            document.documentElement.classList.toggle('dark', isDark);
        }
        set({ theme, isDark });
    },

    toggleTheme: () => {
        const current = get().theme;
        const next = current === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
    },
}));
