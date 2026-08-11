import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0ea5e9',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Text style={{ color }} className="text-xl">📊</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: t('tabs.loans'),
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Text style={{ color }} className="text-xl">💰</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: t('tabs.activity'),
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Text style={{ color }} className="text-xl">📈</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Text style={{ color }} className="text-xl">⚙️</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}