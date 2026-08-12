import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

// Create a compatible storage object
const storage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  currency: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  pinToken: string | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setPinToken: (pinToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      pinToken: null,
      setToken: (token) => set({ token, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      setPinToken: (pinToken) => set({ pinToken }),
      logout: () => set({ token: null, user: null, isAuthenticated: false, pinToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);