import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useTranslation } from 'react-i18next';
import { theme } from '../../src/theme';
import PinPad from '../../src/components/PinPad';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export default function PinSetupScreen() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handlePinEntered = (enteredPin: string) => {
    if (step === 'create') {
      setPin(enteredPin);
      setStep('confirm');
    } else {
      if (enteredPin === pin) {
        savePin(enteredPin);
      } else {
        Alert.alert('Error', 'PINs do not match');
        setPin('');
        setConfirmPin('');
        setStep('create');
      }
    }
  };

  const savePin = async (pinValue: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/auth/pin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({ pin: pinValue }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/auth/profile-setup');
      } else {
        Alert.alert('Error', data.error || 'Failed to set PIN');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="lock" size={64} color={theme.colors.primary} style={styles.icon} />
      <Text style={styles.title}>
        {step === 'create' ? 'Create PIN' : 'Confirm PIN'}
      </Text>
      <Text style={styles.subtitle}>
        {step === 'create' ? 'Enter a 4-digit PIN' : 'Re-enter your PIN'}
      </Text>
      <PinPad onPinEnter={handlePinEntered} loading={loading} length={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.xl, justifyContent: 'center', alignItems: 'center' },
  icon: { marginBottom: theme.spacing.xxl },
  title: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: theme.colors.text },
  subtitle: { fontSize: 17, textAlign: 'center', marginBottom: 40, color: theme.colors.textSecondary },
});