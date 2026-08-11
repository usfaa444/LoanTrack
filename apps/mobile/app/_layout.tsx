import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/src/stores/authStore';
import '../global.css';
import '@/src/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  useEffect(() => {
    // Initialize any required services here
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        storage: AsyncStorage,
      }}
    >
      <Slot />
    </PersistQueryClientProvider>
  );
}