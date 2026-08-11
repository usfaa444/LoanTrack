import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logout') + '?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => {
            useAuthStore.getState().logout();
            router.replace('/auth/phone');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      <Text className="text-2xl font-bold mb-6">
        {t('settings.title')}
      </Text>
      
      <View className="bg-white rounded-lg shadow-sm">
        {/* Profile Section */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4 border-b border-gray-100"
          onPress={() => router.push('/auth/profile-setup')}
        >
          <Text className="font-medium">
            {t('settings.profile')}
          </Text>
          <Text className="text-gray-500">
            {user?.name || 'N/A'}
          </Text>
        </TouchableOpacity>
        
        {/* Currency Section */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4 border-b border-gray-100"
          onPress={() => {}}
        >
          <Text className="font-medium">
            {t('settings.currency')}
          </Text>
          <Text className="text-gray-500">
            {user?.currency || 'XOF'}
          </Text>
        </TouchableOpacity>
        
        {/* Language Section */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4 border-b border-gray-100"
          onPress={() => {}}
        >
          <Text className="font-medium">
            {t('settings.language')}
          </Text>
          <Text className="text-gray-500">
            Français
          </Text>
        </TouchableOpacity>
        
        {/* Notifications Section */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4 border-b border-gray-100"
          onPress={() => {}}
        >
          <Text className="font-medium">
            {t('settings.notifications')}
          </Text>
          <Text className="text-gray-500">
            ✓
          </Text>
        </TouchableOpacity>
        
        {/* Security Section */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4 border-b border-gray-100"
          onPress={() => {}}
        >
          <Text className="font-medium">
            {t('settings.security')}
          </Text>
          <Text className="text-gray-500">
            ****
          </Text>
        </TouchableOpacity>
        
        {/* Logout Button */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4"
          onPress={handleLogout}
        >
          <Text className="font-medium text-danger-500">
            {t('settings.logout')}
          </Text>
          <Text className="text-danger-500">
            →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}