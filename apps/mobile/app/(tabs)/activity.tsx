import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import EmptyState from '../../src/components/EmptyState';
import { theme } from '../../src/theme';

export default function ActivityScreen() {
  const { t } = useTranslation();

  // Mock data - in a real app this would come from the API
  const recentPayments = [
    {
      id: '1',
      borrower: 'Mamadou Diallo',
      amount: 10000,
      date: '2023-12-01',
      method: 'Cash',
    },
    {
      id: '2',
      borrower: 'Aminata Konaté',
      amount: 25000,
      date: '2023-11-28',
      method: 'Mobile Money',
    },
  ];

  const reminders = [
    {
      id: '1',
      borrower: 'Issouf Ouédraogo',
      amount: 75000,
      dueDate: '2023-11-15',
      overdueDays: 15,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {t('activity.title')}
      </Text>
      
      {/* Recent Payments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('activity.payments')}
        </Text>
        
        {recentPayments.length > 0 ? (
          <View style={styles.timeline}>
            {recentPayments.map((payment, index) => (
              <View key={payment.id} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {index < recentPayments.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
                <View style={styles.timelineContent}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentBorrower}>{payment.borrower}</Text>
                    <Text style={styles.paymentDate}>{payment.date}</Text>
                  </View>
                  <Text style={styles.paymentAmount}>
                    {payment.amount.toLocaleString()} XOF
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title={t('components.emptyState.noData')}
            message={t('components.emptyState.tryAgain')}
          />
        )}
      </View>
      
      {/* Reminders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('activity.reminders')}
        </Text>
        
        {reminders.length > 0 ? (
          <View style={styles.timeline}>
            {reminders.map((reminder, index) => (
              <View key={reminder.id} style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotWarning]} />
                {index < reminders.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
                <View style={styles.timelineContent}>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderBorrower}>{reminder.borrower}</Text>
                    <Text style={styles.reminderDate}>
                      {t('dashboard.nextDue')}: {reminder.dueDate}
                    </Text>
                  </View>
                  <View style={styles.reminderAmountContainer}>
                    <Text style={styles.reminderAmount}>
                      {reminder.amount.toLocaleString()} XOF
                    </Text>
                    <Text style={styles.reminderOverdue}>
                      {reminder.overdueDays} days overdue
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title={t('components.emptyState.noData')}
            message={t('components.emptyState.tryAgain')}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xxl,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    ...theme.shadow.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  timeline: {
    gap: theme.spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    zIndex: 1,
    marginTop: theme.spacing.xs,
  },
  timelineDotWarning: {
    backgroundColor: theme.colors.error,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 12,
    width: 2,
    height: '100%',
    backgroundColor: theme.colors.border,
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentBorrower: {
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  paymentDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  paymentAmount: {
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
    color: theme.colors.text,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderBorrower: {
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  reminderDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  reminderAmountContainer: {
    alignItems: 'flex-end',
  },
  reminderAmount: {
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  reminderOverdue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
  },
});