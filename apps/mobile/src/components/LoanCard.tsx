import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';
import { theme } from '../theme';

interface Loan {
  id: string;
  borrower: string;
  amount: number;
  remaining: number;
  status: 'active' | 'paid' | 'overdue';
  dueDate: string;
  progress: number;
}

interface LoanCardProps {
  loan: Loan;
}

export default function LoanCard({ loan }: LoanCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.borrowerName} numberOfLines={1}>
          {loan.borrower}
        </Text>
        <StatusBadge status={loan.status} />
      </View>
      
      <View style={styles.amountRow}>
        <Text style={styles.totalAmount}>
          {loan.amount.toLocaleString()} XOF
        </Text>
        <Text style={styles.remainingAmount}>
          {loan.remaining.toLocaleString()} XOF
        </Text>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.dueDate}>
          Due: {loan.dueDate}
        </Text>
        <Text style={styles.progressText}>
          {loan.progress}%
        </Text>
      </View>
      
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBar,
            loan.status === 'paid' 
              ? styles.paidProgress 
              : loan.status === 'overdue' 
              ? styles.overdueProgress 
              : styles.activeProgress,
            { width: `${loan.progress}%` }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  borrowerName: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  totalAmount: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  remainingAmount: {
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
    color: theme.colors.text,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  dueDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: theme.borderRadius.full,
  },
  activeProgress: {
    backgroundColor: theme.colors.primary,
  },
  paidProgress: {
    backgroundColor: theme.colors.success,
  },
  overdueProgress: {
    backgroundColor: theme.colors.error,
  },
});