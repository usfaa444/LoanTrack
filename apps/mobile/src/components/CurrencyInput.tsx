import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  currency = 'XOF',
}: CurrencyInputProps) {
  const formatValue = (text: string) => {
    // Remove non-numeric characters except for the first decimal point
    const numeric = text.replace(/[^0-9.]/g, '');
    
    // Handle decimal point
    const parts = numeric.split('.');
    if (parts.length > 2) {
      // Only allow one decimal point
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numeric;
  };

  const handleChange = (text: string) => {
    const formatted = formatValue(text);
    onChange(formatted);
  };

  return (
    <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
      <Text className="text-gray-700 mr-2 font-medium">
        {currency}
      </Text>
      <TextInput
        className="flex-1 text-lg"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={value}
        onChangeText={handleChange}
      />
    </View>
  );
}