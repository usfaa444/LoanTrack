import React from 'react';
import { View, Text, FlatList } from 'react-native';

interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  note?: string;
}

interface PaymentTimelineProps {
  payments: Payment[];
}

export default function PaymentTimeline({ payments }: PaymentTimelineProps) {
  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View className="flex-row py-3">
      <View className="items-center mr-3">
        <View className="w-3 h-3 rounded-full bg-primary-500 mb-1" />
        <View className="w-0.5 flex-1 bg-gray-300" />
      </View>
      
      <View className="flex-1 pb-3">
        <View className="flex-row justify-between">
          <Text className="font-bold">
            {item.amount.toLocaleString()} XOF
          </Text>
          <Text className="text-gray-500">
            {item.date}
          </Text>
        </View>
        
        <Text className="text-gray-600">
          {item.method}
        </Text>
        
        {item.note ? (
          <Text className="text-gray-500 mt-1">
            {item.note}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <FlatList
      data={payments}
      renderItem={renderPaymentItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        <View className="w-3 h-3 rounded-full bg-gray-300 self-center mt-1" />
      }
    />
  );
}