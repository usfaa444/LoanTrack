import React from 'react';
import { View, Text } from 'react-native';
import StatusBadge from './StatusBadge';

interface Loan {
  id: string;
  borrower: string;
  amount: number;
  remaining: number;
  status: 'active' | 'paid' | 'overdue';
  dueDate: string;
  progress: number;
}

interface LoanCardProps {
  loan: Loan;
}

export default function LoanCard({ loan }: LoanCardProps) {
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-bold text-lg" numberOfLines={1}>
          {loan.borrower}
        </Text>
        <StatusBadge status={loan.status} />
      </View>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">
          {loan.amount.toLocaleString()} XOF
        </Text>
        <Text className="font-medium">
          {loan.remaining.toLocaleString()} XOF
        </Text>
      </View>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-500 text-sm">
          Due: {loan.dueDate}
        </Text>
        <Text className="text-gray-500 text-sm">
          {loan.progress}%
        </Text>
      </View>
      
      <View className="h-2 bg-gray-200 rounded-full mt-2">
        <View
          className={`h-2 rounded-full ${
            loan.status === 'paid'
              ? 'bg-success-500'
              : loan.status === 'overdue'
              ? 'bg-danger-500'
              : 'bg-primary-500'
          }`}
          style={{ width: `${loan.progress}%` }}
        />
      </View>
    </View>
  );
}