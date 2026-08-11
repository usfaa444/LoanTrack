import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { api } from '@/src/lib/api';
import { useTranslation } from 'react-i18next';

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('auth.profile.namePlaceholder'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/update-profile', {
        name: name.trim(),
        currency: 'XOF', // Default to XOF for Burkina Faso
      });

      if (response.data.user) {
        setUser(response.data.user);
        router.push('/(tabs)/dashboard');
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
        {t('auth.profile.title')}
      </Text>
      <Text className="text-gray-600 text-center mb-8">
        {t('auth.profile.namePlaceholder')}
      </Text>
      
      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-medium">
          {t('auth.profile.name')}
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-4 text-lg"
          placeholder={t('auth.profile.namePlaceholder')}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
      </View>
      
      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-medium">
          {t('auth.profile.currency')}
        </Text>
        <View className="border border-gray-300 rounded-lg p-4 bg-gray-100">
          <Text className="text-lg">XOF (Franc CFA)</Text>
        </View>
      </View>
      
      <TouchableOpacity
        className={`bg-primary-500 rounded-lg py-4 ${loading ? 'opacity-50' : ''}`}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold text-lg">
          {loading ? t('common.loading') : t('common.save')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}