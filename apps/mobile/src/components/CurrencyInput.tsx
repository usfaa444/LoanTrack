import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../theme';

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
    <View style={styles.container}>
      <Text style={styles.currencyText}>
        {currency}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={value}
        onChangeText={handleChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  currencyText: {
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
    fontWeight: 'medium',
    fontSize: theme.fontSize.md,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
  },
});