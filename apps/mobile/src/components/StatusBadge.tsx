import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

type Status = 'active' | 'paid' | 'overdue';

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-primary-100 border-primary-500';
      case 'paid':
        return 'bg-success-100 border-success-500';
      case 'overdue':
        return 'bg-danger-100 border-danger-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case 'active':
        return 'text-primary-700';
      case 'paid':
        return 'text-success-700';
      case 'overdue':
        return 'text-danger-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <View
      className={`rounded-full px-3 py-1 border ${getStatusColor()}`}
    >
      <Text
        className={`text-xs font-bold ${getStatusTextColor()}`}
      >
        {t(`components.statusBadge.${status}`)}
      </Text>
    </View>
  );
}