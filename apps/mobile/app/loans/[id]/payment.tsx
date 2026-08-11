import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import CurrencyInput from '@/src/components/CurrencyInput';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleRecordPayment = () => {
    if (!amount) {
      Alert.alert(t('common.error'), t('common.error'));
      return;
    }

    // In a real app, you would make an API call here
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        t('common.success'),
        t('loans.payment.title') + ' ' + t('common.success').toLowerCase(),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1000);
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      <Text className="text-2xl font-bold mb-6">
        {t('loans.payment.title')}
      </Text>
      
      <View className="bg-white rounded-lg p-4 shadow-sm">
        {/* Amount */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            {t('loans.payment.amount')}
          </Text>
          <CurrencyInput
            value={amount}
            onChange={setAmount}
          />
        </View>
        
        {/* Payment Method */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            {t('loans.payment.method')}
          </Text>
          <View className="flex-row flex-wrap">
            {['cash', 'mobile_money', 'bank_transfer', 'other'].map((m) => (
              <TouchableOpacity
                key={m}
                className={`border rounded-lg px-4 py-2 mr-2 mb-2 ${
                  method === m
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300'
                }`}
                onPress={() => setMethod(m)}
              >
                <Text
                  className={
                    method === m ? 'text-white' : 'text-gray-700'
                  }
                >
                  {m.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Note */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-medium">
            {t('loans.payment.note')}
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-4 h-24"
            placeholder={t('loans.payment.note')}
            multiline
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          className={`bg-primary-500 rounded-lg py-4 ${loading ? 'opacity-50' : ''}`}
          onPress={handleRecordPayment}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? t('common.loading') : t('loans.payment.submit')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}