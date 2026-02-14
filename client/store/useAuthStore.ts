import { create } from 'zustand';
import api from '@/lib/axios';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: string;
    onboardingCompleted: boolean;
    properties: any[];
    preferences: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('smartsolar_token') : null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password });
        const { user, token, refreshToken } = data.data;
        localStorage.setItem('smartsolar_token', token);
        localStorage.setItem('smartsolar_refresh_token', refreshToken);
        set({ user, token, isAuthenticated: true, isLoading: false });
    },

    register: async (formData) => {
        const { data } = await api.post('/api/auth/register', formData);
        const { user, token, refreshToken } = data.data;
        localStorage.setItem('smartsolar_token', token);
        localStorage.setItem('smartsolar_refresh_token', refreshToken);
        set({ user, token, isAuthenticated: true, isLoading: false });
    },

    logout: () => {
        localStorage.removeItem('smartsolar_token');
        localStorage.removeItem('smartsolar_refresh_token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },

    fetchUser: async () => {
        const token = localStorage.getItem('smartsolar_token');
        if (!token) {
            set({ isLoading: false });
            return;
        }
        try {
            const { data } = await api.get('/api/auth/me');
            set({ user: data.data.user, isAuthenticated: true, isLoading: false });
        } catch {
            localStorage.removeItem('smartsolar_token');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    updateProfile: async (profileData) => {
        const { data } = await api.put('/api/auth/profile', profileData);
        set({ user: data.data.user });
    },

    setUser: (user) => set({ user }),
}));
