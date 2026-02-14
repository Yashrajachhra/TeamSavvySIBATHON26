import { create } from 'zustand';

interface LocationState {
    lat: string;
    lng: string;
    address?: string;
    city?: string;
    state?: string;
    setLocation: (lat: string, lng: string, address?: string, city?: string, state?: string) => void;
    initializeFromUser: (user: any) => void;
}

const loadFromStorage = () => {
    if (typeof window === 'undefined') return { lat: '28.6139', lng: '77.2090' };
    const stored = localStorage.getItem('smartsolar-location');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return { lat: '28.6139', lng: '77.2090' };
        }
    }
    return { lat: '28.6139', lng: '77.2090' };
};

const saveToStorage = (state: { lat: string; lng: string; address?: string; city?: string; state?: string }) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('smartsolar-location', JSON.stringify(state));
    }
};

export const useLocationStore = create<LocationState>((set) => {
    const initial = loadFromStorage();
    return {
        ...initial,
        setLocation: (lat, lng, address?, city?, state?) => {
            const newState = { lat, lng, address, city, state };
            set(newState);
            saveToStorage(newState);
        },
        initializeFromUser: (user) => {
            if (user?.properties?.[0]?.address?.coordinates) {
                const coords = user.properties[0].address.coordinates;
                const address = user.properties[0].address;
                const newState = {
                    lat: coords.lat.toString(),
                    lng: coords.lng.toString(),
                    address: address.street,
                    city: address.city,
                    state: address.state,
                };
                set(newState);
                saveToStorage(newState);
            }
        },
    };
});
