import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import StatusBadge from '../../src/components/StatusBadge';
import PaymentTimeline from '../../src/components/PaymentTimeline';
import { theme } from '../../src/theme';

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  // Mock data - in a real app this would come from the API
  const loan = {
    id: id as string,
    borrower: 'Mamadou Diallo',
    amount: 50000,
    remaining: 25000,
    status: 'active',
    dueDate: '2023-12-15',
    progress: 50,
    purpose: 'Agricultural supplies',
  };

  const payments = [
    {
      id: '1',
      amount: 10000,
      date: '2023-11-15',
      method: 'Cash',
      note: 'First payment',
    },
    {
      id: '2',
      amount: 15000,
      date: '2023-12-01',
      method: 'Mobile Money',
      note: 'Second payment',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Loan Header */}
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.borrowerName}>
              {loan.borrower}
            </Text>
            <StatusBadge status={loan.status} />
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('loans.detail.amount')}
            </Text>
            <Text style={styles.infoValue}>
              {loan.amount.toLocaleString()} XOF
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('loans.detail.remaining')}
            </Text>
            <Text style={styles.infoValue}>
              {loan.remaining.toLocaleString()} XOF
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('loans.form.dueDate')}
            </Text>
            <Text style={styles.infoValue}>
              {loan.dueDate}
            </Text>
          </View>
        </View>
        
        {/* Purpose */}
        <View style={[styles.card, styles.purposeCard]}>
          <Text style={styles.infoLabel}>
            {t('loans.form.purpose')}
          </Text>
          <Text style={styles.purposeText}>
            {loan.purpose}
          </Text>
        </View>
        
        {/* Payments Section */}
        <View style={styles.card}>
          <View style={styles.paymentsHeader}>
            <Text style={styles.paymentsTitle}>
              {t('loans.detail.payments')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/loans/${id}/payment`)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>
                {t('loans.detail.addPayment')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {payments.length > 0 ? (
            <PaymentTimeline payments={payments} />
          ) : (
            <Text style={styles.emptyState}>
              {t('components.emptyState.noData')}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    ...theme.shadow.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  borrowerName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  infoValue: {
    fontWeight: 'bold',
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  purposeCard: {
    marginBottom: theme.spacing.xxl,
  },
  purposeText: {
    fontWeight: 'medium',
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  paymentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  paymentsTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  addButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.sm,
    fontWeight: 'medium',
  },
  emptyState: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
});