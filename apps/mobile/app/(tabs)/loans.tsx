import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import LoanCard from '../../src/components/LoanCard';
import EmptyState from '../../src/components/EmptyState';

export default function LoansScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  // Mock data - in a real app this would come from the API
  const loans = [
    {
      id: '1',
      borrower: 'Mamadou Diallo',
      amount: 50000,
      remaining: 25000,
      status: 'active',
      dueDate: '2023-12-15',
      progress: 50,
    },
    {
      id: '2',
      borrower: 'Aminata Konaté',
      amount: 100000,
      remaining: 0,
      status: 'paid',
      dueDate: '2023-11-30',
      progress: 100,
    },
    {
      id: '3',
      borrower: 'Issouf Ouédraogo',
      amount: 75000,
      remaining: 75000,
      status: 'overdue',
      dueDate: '2023-11-15',
      progress: 0,
    },
  ];

  const filteredLoans = activeTab === 'all' 
    ? loans 
    : loans.filter(loan => loan.status === activeTab);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-bold mb-6">
          {t('loans.title')}
        </Text>
        
        {/* Status Tabs */}
        <View className="flex-row bg-white rounded-lg p-1 mb-6">
          {['all', 'active', 'paid', 'overdue'].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-md ${
                activeTab === tab ? 'bg-primary-500' : ''
              }`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === tab ? 'text-white' : 'text-gray-600'
                }`}
              >
                {t(`loans.tabs.${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Loan List */}
        {filteredLoans.length > 0 ? (
          <View className="space-y-4">
            {filteredLoans.map((loan) => (
              <TouchableOpacity
                key={loan.id}
                onPress={() => router.push(`/loans/${loan.id}`)}
              >
                <LoanCard loan={loan} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            title={t('loans.empty')}
            message={t('components.emptyState.tryAgain')}
          />
        )}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/loans/new')}
      >
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}