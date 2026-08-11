import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import CurrencyInput from '../../src/components/CurrencyInput';

export default function NewLoanScreen() {
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleCreateLoan = () => {
    if (!borrowerPhone || !amount || !purpose || !dueDate) {
      Alert.alert(t('common.error'), t('common.error'));
      return;
    }

    // In a real app, you would make an API call here
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        t('common.success'),
        t('loans.form.submit') + ' ' + t('common.success').toLowerCase(),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1000);
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      <Text className="text-2xl font-bold mb-6">
        {t('loans.new')}
      </Text>
      
      <View className="bg-white rounded-lg p-4 shadow-sm">
        {/* Borrower Phone */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            {t('loans.form.borrower')}
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-4"
            placeholder="+226 XX XX XX XX"
            keyboardType="phone-pad"
            value={borrowerPhone}
            onChangeText={setBorrowerPhone}
          />
        </View>
        
        {/* Amount */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            {t('loans.form.amount')}
          </Text>
          <CurrencyInput
            value={amount}
            onChange={setAmount}
          />
        </View>
        
        {/* Purpose */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            {t('loans.form.purpose')}
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-4"
            placeholder={t('loans.form.purpose')}
            value={purpose}
            onChangeText={setPurpose}
          />
        </View>
        
        {/* Due Date */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-medium">
            {t('loans.form.dueDate')}
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-4"
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          className={`bg-primary-500 rounded-lg py-4 ${loading ? 'opacity-50' : ''}`}
          onPress={handleCreateLoan}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? t('common.loading') : t('loans.form.submit')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}