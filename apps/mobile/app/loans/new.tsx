import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import CurrencyInput from '../../src/components/CurrencyInput';
import { theme } from '../../src/theme';

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
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('loans.new')}
      </Text>
      
      <View style={styles.card}>
        {/* Borrower Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('loans.form.borrower')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="+226 XX XX XX XX"
            keyboardType="phone-pad"
            value={borrowerPhone}
            onChangeText={setBorrowerPhone}
          />
        </View>
        
        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('loans.form.amount')}
          </Text>
          <CurrencyInput
            value={amount}
            onChange={setAmount}
          />
        </View>
        
        {/* Purpose */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('loans.form.purpose')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('loans.form.purpose')}
            value={purpose}
            onChangeText={setPurpose}
          />
        </View>
        
        {/* Due Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('loans.form.dueDate')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateLoan}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('common.loading') : t('loans.form.submit')}
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
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
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