import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  // Mock data - in a real app this would come from the API
  const summaryData = {
    activeLoans: 3,
    totalOutstanding: 150000,
    totalPaid: 75000,
    nextDue: {
      amount: 25000,
      date: '2023-12-15',
      borrower: 'Mamadou Diallo'
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {t('dashboard.title')}
        </Text>
        
        {/* Summary Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('dashboard.activeLoans')}
            </Text>
            <Text style={styles.cardValueLarge}>
              {summaryData.activeLoans}
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('dashboard.totalOutstanding')}
            </Text>
            <Text style={styles.cardValueLarge}>
              {summaryData.totalOutstanding.toLocaleString()} XOF
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('dashboard.totalPaid')}
            </Text>
            <Text style={styles.cardValueLarge}>
              {summaryData.totalPaid.toLocaleString()} XOF
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('dashboard.nextDue')}
            </Text>
            <Text style={styles.cardValueMedium}>
              {summaryData.nextDue.amount.toLocaleString()} XOF
            </Text>
            <Text style={styles.cardDate}>
              {summaryData.nextDue.date}
            </Text>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.quickActions')}
          </Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/loans/new')}
          >
            <Text style={styles.actionButtonText}>
              {t('dashboard.addLoan')}
            </Text>
          </TouchableOpacity>
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
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xxl,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xxl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '48%',
    marginBottom: theme.spacing.lg,
    ...theme.shadow.md,
  },
  cardTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  cardValueLarge: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cardValueMedium: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cardDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  actionsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
  },
});