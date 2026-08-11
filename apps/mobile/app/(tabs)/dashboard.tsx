import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  // Mock data - in a real app this would come from the API
  const summaryData = {
    activeLoans: 3,
    totalOutstanding: 150000,
    totalPaid: 75000,
    nextDue: {
      amount: 25000,
      date: '2023-12-15',
      borrower: 'Mamadou Diallo'
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold mb-6">
          {t('dashboard.title')}
        </Text>
        
        {/* Summary Cards */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="bg-white rounded-lg p-4 w-[48%] mb-4 shadow-sm">
            <Text className="text-gray-600 text-sm">
              {t('dashboard.activeLoans')}
            </Text>
            <Text className="text-2xl font-bold mt-1">
              {summaryData.activeLoans}
            </Text>
          </View>
          
          <View className="bg-white rounded-lg p-4 w-[48%] mb-4 shadow-sm">
            <Text className="text-gray-600 text-sm">
              {t('dashboard.totalOutstanding')}
            </Text>
            <Text className="text-2xl font-bold mt-1">
              {summaryData.totalOutstanding.toLocaleString()} XOF
            </Text>
          </View>
          
          <View className="bg-white rounded-lg p-4 w-[48%] shadow-sm">
            <Text className="text-gray-600 text-sm">
              {t('dashboard.totalPaid')}
            </Text>
            <Text className="text-2xl font-bold mt-1">
              {summaryData.totalPaid.toLocaleString()} XOF
            </Text>
          </View>
          
          <View className="bg-white rounded-lg p-4 w-[48%] shadow-sm">
            <Text className="text-gray-600 text-sm">
              {t('dashboard.nextDue')}
            </Text>
            <Text className="text-xl font-bold mt-1">
              {summaryData.nextDue.amount.toLocaleString()} XOF
            </Text>
            <Text className="text-gray-500 text-sm">
              {summaryData.nextDue.date}
            </Text>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold mb-4">
            {t('dashboard.quickActions')}
          </Text>
          
          <TouchableOpacity 
            className="bg-primary-500 rounded-lg py-3 mb-3"
            onPress={() => router.push('/loans/new')}
          >
            <Text className="text-white text-center font-medium">
              {t('dashboard.addLoan')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}