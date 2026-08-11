import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/lib/api';
import { useTranslation } from 'react-i18next';

export default function OTPScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const { setToken, setUser } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert(t('common.error'), t('auth.otp.placeholder'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        phone,
        otp,
      });

      if (response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        
        // Check if user has set up PIN
        if (response.data.hasPin) {
          router.push('/(tabs)/dashboard');
        } else {
          router.push('/auth/pin-setup');
        }
      } else {
        Alert.alert(t('common.error'), response.message || t('common.error'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    try {
      const response = await api.post('/auth/send-otp', { phone });
      if (response.data.success) {
        setResendCooldown(60); / 60 second cooldown
        Alert.alert(t('common.success'), t('auth.otp.resend'));
      } else {
        Alert.alert(t('common.error'), response.message || t('common.error'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.error'));
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-2xl font-bold text-center mb-2">
        {t('auth.otp.title')}
      </Text>
      <Text className="text-gray-600 text-center mb-8">
        {t('auth.otp.instruction', { phone })}
      </Text>
      
      <View className="mb-6">
        <TextInput
          className="border border-gray-300 rounded-lg p-4 text-lg text-center text-2xl tracking-widest"
          placeholder="------"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          editable={!loading}
        />
      </View>
      
      <TouchableOpacity
        className={`bg-primary-500 rounded-lg py-4 mb-4 ${loading ? 'opacity-50' : ''}`}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold text-lg">
          {loading ? t('common.loading') : t('auth.otp.verify')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className={`items-center ${resendCooldown > 0 ? 'opacity-50' : ''}`}
        onPress={handleResendOTP}
        disabled={resendCooldown > 0 || loading}
      >
        <Text className="text-primary-500 font-medium">
          {resendCooldown > 0 
            ? t('auth.otp.resendIn', { time: resendCooldown }) 
            : t('auth.otp.resend')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}