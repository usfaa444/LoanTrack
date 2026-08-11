import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PinPadProps {
  onPinEnter: (pin: string) => void;
  onBack?: () => void;
  loading?: boolean;
  length?: number;
}

export default function PinPad({
  onPinEnter,
  onBack,
  loading = false,
  length = 4,
}: PinPadProps) {
  const [pin, setPin] = useState('');
  const { t } = useTranslation();

  const handleNumberPress = (num: string) => {
    if (loading) return;
    
    if (pin.length < length) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === length) {
        setTimeout(() => onPinEnter(newPin), 300);
      }
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    if (loading) return;
    setPin('');
  };

  return (
    <View className="items-center">
      {/* PIN Dots */}
      <View className="flex-row justify-center mb-8">
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            className={`w-4 h-4 rounded-full mx-2 ${
              index < pin.length ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </View>
      
      {/* Number Pad */}
      <View className="w-64">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            className="items-center justify-center w-16 h-16 rounded-full mb-4 self-center"
            onPress={() => handleNumberPress(num.toString())}
            disabled={loading}
          >
            <Text className="text-2xl font-bold text-gray-800">
              {num}
            </Text>
          </TouchableOpacity>
        ))}
        
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="items-center justify-center w-16 h-16 rounded-full"
            onPress={handleClear}
            disabled={loading}
          >
            <Text className="text-lg font-bold text-gray-500">
              Clear
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="items-center justify-center w-16 h-16 rounded-full"
            onPress={() => handleNumberPress('0')}
            disabled={loading}
          >
            <Text className="text-2xl font-bold text-gray-800">
              0
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="items-center justify-center w-16 h-16 rounded-full"
            onPress={handleBackspace}
            disabled={loading}
          >
            <Text className="text-2xl font-bold text-gray-800">
              ←
            </Text>
          </TouchableOpacity>
        </View>
        
        {onBack && (
          <TouchableOpacity
            className="mt-4 items-center"
            onPress={onBack}
            disabled={loading}
          >
            <Text className="text-primary-500 font-medium">
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}