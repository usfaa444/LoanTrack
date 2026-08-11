import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import PinPad from '@/src/components/PinPad';
import { api } from '@/src/lib/api';
import { useTranslation } from 'react-i18next';

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
      const response = await api.post('/auth/set-pin', { pin });
      
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
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-2xl font-bold text-center mb-2">
        {step === 'create' 
          ? t('auth.pin.setup.title') 
          : t('auth.pin.setup.confirm')}
      </Text>
      <Text className="text-gray-600 text-center mb-8">
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