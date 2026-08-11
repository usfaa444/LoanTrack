import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
}

export default function EmptyState({
  title,
  message,
  icon = '📋',
}: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-5xl mb-4">
        {icon}
      </Text>
      <Text className="text-xl font-bold text-center mb-2">
        {title}
      </Text>
      <Text className="text-gray-600 text-center">
        {message}
      </Text>
    </View>
  );
}