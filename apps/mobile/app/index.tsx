import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasPin = useAuthStore((state) => state.pinToken);

  if (!isAuthenticated) {
    return <Redirect href="/auth/phone" />;
  }

  if (!hasPin) {
    return <Redirect href="/auth/pin-setup" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}