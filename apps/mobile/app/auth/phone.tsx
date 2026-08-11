import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/lib/api';
import { useTranslation } from 'react-i18next';

export default function PhoneAuthScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const validatePhone = (phone: string) => {
    // Basic validation for Burkina Faso phone numbers
    const phoneRegex = /^(?:\+226|00226|226)?(?:\s)?[0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      Alert.alert(t('common.error'), t('auth.phone.validation'));
      return;
    }

    setLoading(true);
    try {
      // Format phone number for API (E.164)
      let formattedPhone = phone;
      if (!phone.startsWith('+')) {
        formattedPhone = `+226${phone.replace(/^(00226|226)/, '')}`;
      }

      const response = await api.post('/auth/send-otp', { phone: formattedPhone });
      
      if (response.data.success) {
        router.push({
          pathname: '/auth/otp',
          params: { phone: formattedPhone }
        });
      } else {
        Alert.alert(t('common.error'), response.message || t('common.error'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-2xl font-bold text-center mb-2">
        {t('auth.phone.title')}
      </Text>
      <Text className="text-gray-600 text-center mb-8">
        {t('auth.phone.placeholder')}
      </Text>
      
      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-medium">
          +226
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-4 text-lg"
          placeholder="XX XX XX XX"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          editable={!loading}
        />
      </View>
      
      <TouchableOpacity
        className={`bg-primary-500 rounded-lg py-4 ${loading ? 'opacity-50' : ''}`}
        onPress={handleSendOTP}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold text-lg">
          {loading ? t('common.loading') : t('auth.phone.continue')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}