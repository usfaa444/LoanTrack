import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import StatusBadge from '../../src/components/StatusBadge';
import PaymentTimeline from '../../src/components/PaymentTimeline';

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  / Mock data - in a real app this would come from the API
  const loan = {
    id: id as string,
    borrower: 'Mamadou Diallo',
    amount: 50000,
    remaining: 25000,
    status: 'active',
    dueDate: '2023-12-15',
    progress: 50,
    purpose: 'Agricultural supplies',
  };

  const payments = [
    {
      id: '1',
      amount: 10000,
      date: '2023-11-15',
      method: 'Cash',
      note: 'First payment',
    },
    {
      id: '2',
      amount: 15000,
      date: '2023-12-01',
      method: 'Mobile Money',
      note: 'Second payment',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Loan Header */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-xl font-bold">
              {loan.borrower}
            </Text>
            <StatusBadge status={loan.status} />
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">
              {t('loans.detail.amount')}
            </Text>
            <Text className="font-bold">
              {loan.amount.toLocaleString()} XOF
            </Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">
              {t('loans.detail.remaining')}
            </Text>
            <Text className="font-bold">
              {loan.remaining.toLocaleString()} XOF
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">
              {t('loans.form.dueDate')}
            </Text>
            <Text className="font-bold">
              {loan.dueDate}
            </Text>
          </View>
        </View>
        
        {/* Purpose */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-gray-600 mb-2">
            {t('loans.form.purpose')}
          </Text>
          <Text className="font-medium">
            {loan.purpose}
          </Text>
        </View>
        
        {/* Payments Section */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">
              {t('loans.detail.payments')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/loans/${id}/payment`)}
              className="bg-primary-500 rounded-lg px-3 py-1"
            >
              <Text className="text-white text-sm">
                {t('loans.detail.addPayment')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {payments.length > 0 ? (
            <PaymentTimeline payments={payments} />
          ) : (
            <Text className="text-gray-500 text-center py-4">
              {t('components.emptyState.noData')}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}