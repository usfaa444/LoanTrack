import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import EmptyState from '../../src/components/EmptyState';

export default function ActivityScreen() {
  const { t } = useTranslation();

  // Mock data - in a real app this would come from the API
  const recentPayments = [
    {
      id: '1',
      borrower: 'Mamadou Diallo',
      amount: 10000,
      date: '2023-12-01',
      method: 'Cash',
    },
    {
      id: '2',
      borrower: 'Aminata Konaté',
      amount: 25000,
      date: '2023-11-28',
      method: 'Mobile Money',
    },
  ];

  const reminders = [
    {
      id: '1',
      borrower: 'Issouf Ouédraogo',
      amount: 75000,
      dueDate: '2023-11-15',
      overdueDays: 15,
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <Text className="text-2xl font-bold mb-6">
        {t('activity.title')}
      </Text>
      
      {/* Recent Payments */}
      <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <Text className="text-lg font-bold mb-4">
          {t('activity.payments')}
        </Text>
        
        {recentPayments.length > 0 ? (
          <View className="space-y-3">
            {recentPayments.map((payment) => (
              <View key={payment.id} className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <View>
                  <Text className="font-medium">{payment.borrower}</Text>
                  <Text className="text-gray-500 text-sm">{payment.date}</Text>
                </View>
                <Text className="font-medium">
                  {payment.amount.toLocaleString()} XOF
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title={t('components.emptyState.noData')}
            message={t('components.emptyState.tryAgain')}
          />
        )}
      </View>
      
      {/* Reminders */}
      <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <Text className="text-lg font-bold mb-4">
          {t('activity.reminders')}
        </Text>
        
        {reminders.length > 0 ? (
          <View className="space-y-3">
            {reminders.map((reminder) => (
              <View key={reminder.id} className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <View>
                  <Text className="font-medium">{reminder.borrower}</Text>
                  <Text className="text-gray-500 text-sm">
                    {t('dashboard.nextDue')}: {reminder.dueDate}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-medium text-danger-500">
                    {reminder.amount.toLocaleString()} XOF
                  </Text>
                  <Text className="text-danger-500 text-sm">
                    {reminder.overdueDays} days overdue
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title={t('components.emptyState.noData')}
            message={t('components.emptyState.tryAgain')}
          />
        )}
      </View>
    </ScrollView>
  );
}