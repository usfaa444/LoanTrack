import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import CurrencyInput from '../../../src/components/CurrencyInput';
import { theme } from '../../../src/theme';

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

  const paymentMethods = [
    { key: 'cash', label: 'Cash' },
    { key: 'mobile_money', label: 'Mobile Money' },
    { key: 'bank_transfer', label: 'Bank Transfer' },
    { key: 'other', label: 'Other' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('loans.payment.title')}
      </Text>
      
      <View style={styles.card}>
        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('loans.payment.amount')}
          </Text>
          <CurrencyInput
            value={amount}
            onChange={setAmount}
          />
        </View>
        
        {/* Payment Method */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('loans.payment.method')}
          </Text>
          <View style={styles.methodContainer}>
            {paymentMethods.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[
                  styles.methodButton,
                  method === m.key && styles.selectedMethodButton,
                ]}
                onPress={() => setMethod(m.key)}
              >
                <Text
                  style={[
                    styles.methodText,
                    method === m.key && styles.selectedMethodText,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Note */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('loans.payment.note')}
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('loans.payment.note')}
            multiline
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRecordPayment}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('common.loading') : t('loans.payment.submit')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xxl,
    color: theme.colors.text,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.xxl,
  },
  label: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: 'medium',
  },
  methodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  methodButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  selectedMethodButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  methodText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  selectedMethodText: {
    color: theme.colors.textInverse,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    height: 96,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
});