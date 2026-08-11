import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface PinState {
  pinToken: string | null;
  failedAttempts: number;
  lastAttempt: Date | null;
  setPinToken: (pinToken: string) => void;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  logout: () => void;
}

export const usePinStore = create<PinState>()(
  persist(
    (set) => ({
      pinToken: null,
      failedAttempts: 0,
      lastAttempt: null,
      setPinToken: (pinToken) => set({ pinToken }),
      incrementFailedAttempts: () => 
        set((state) => ({ 
          failedAttempts: state.failedAttempts + 1,
          lastAttempt: new Date()
        })),
      resetFailedAttempts: () => set({ failedAttempts: 0, lastAttempt: null }),
      logout: () => set({ pinToken: null }),
    }),
    {
      name: 'pin-storage',
      storage: createJSONStorage(() => SecureStore),
    }
  )
);