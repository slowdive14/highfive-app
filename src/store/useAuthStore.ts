import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Id } from '../../convex/_generated/dataModel';

interface User {
    id: Id<'users'>;
    name: string;
    avatarUrl?: string;
    email?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const storage = {
    getItem: async (name: string) => {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(name);
            }
            return await AsyncStorage.getItem(name);
        } catch (e) {
            return null;
        }
    },
    setItem: async (name: string, value: string) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(name, value);
            } else {
                await AsyncStorage.setItem(name, value);
            }
        } catch (e) {
            // Ignore
        }
    },
    removeItem: async (name: string) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem(name);
            } else {
                await AsyncStorage.removeItem(name);
            }
        } catch (e) {
            // Ignore
        }
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'highfive-auth-storage',
            storage: createJSONStorage(() => storage),
        }
    )
);
