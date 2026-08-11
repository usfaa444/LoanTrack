import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  note?: string;
}

interface PaymentTimelineProps {
  payments: Payment[];
}

export default function PaymentTimeline({ payments }: PaymentTimelineProps) {
  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.timelineItem}>
      <View style={styles.timelineIndicator}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineLine} />
      </View>
      
      <View style={styles.paymentContent}>
        <View style={styles.paymentHeader}>
          <Text style={styles.amountText}>
            {item.amount.toLocaleString()} XOF
          </Text>
          <Text style={styles.dateText}>
            {item.date}
          </Text>
        </View>
        
        <Text style={styles.methodText}>
          {item.method}
        </Text>
        
        {item.note ? (
          <Text style={styles.noteText}>
            {item.note}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <FlatList
      data={payments}
      renderItem={renderPaymentItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={<View style={styles.footerDot} />}
    />
  );
}

const styles = StyleSheet.create({
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: theme.colors.border,
  },
  paymentContent: {
    flex: 1,
    paddingBottom: theme.spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  amountText: {
    fontWeight: 'bold',
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  dateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  methodText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  noteText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.md,
  },
  footerDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: theme.spacing.xs,
  },
});