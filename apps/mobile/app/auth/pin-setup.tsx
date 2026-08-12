import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import PinPad from '../../src/components/PinPad';
import { api } from '../../src/lib/api';
import { useTranslation } from 'react-i18next';
import { theme } from '../../src/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function PinSetupScreen() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handlePinEntered = async (enteredPin: string) => {
    if (step === 'create') {
      setPin(enteredPin);
      setStep('confirm');
    } else {
      if (enteredPin === pin) {
        // Save PIN
        await savePin(enteredPin);
      } else {
        Alert.alert(t('common.error'), t('auth.pin.setup.confirm'));
        setStep('create');
        setPin('');
        setConfirmPin('');
      }
    }
  };

  const savePin = async (pin: string) => {
    setLoading(true);
    try {
      const response: any = await api.post('/auth/set-pin', { pin });
      
      if (response.data.pinToken) {
        useAuthStore.getState().setPinToken(response.data.pinToken);
        router.push('/auth/profile-setup');
      } else {
        Alert.alert(t('common.error'), response.message || t('common.error'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('create');
      setPin('');
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="lock" 
        size={64} 
        color={theme.colors.primary} 
        style={styles.icon} 
      />
      <Text style={styles.title}>
        {step === 'create' 
          ? t('auth.pin.setup.title') 
          : t('auth.pin.setup.confirm')}
      </Text>
      <Text style={styles.subtitle}>
        {step === 'create' 
          ? t('auth.pin.setup.instruction') 
          : t('auth.pin.setup.confirm')}
      </Text>
      
      <PinPad
        onPinEnter={handlePinEntered}
        onBack={handleBack}
        loading={loading}
        length={4} // 4-digit PIN
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    textAlign: 'center',
    marginBottom: theme.spacing.huge,
    color: theme.colors.textSecondary,
  },
});