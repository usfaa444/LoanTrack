import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import LoanCard from '../../src/components/LoanCard';
import EmptyState from '../../src/components/EmptyState';
import { theme } from '../../src/theme';

export default function LoansScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  // Mock data - in a real app this would come from the API
  const loans = [
    {
      id: '1',
      borrower: 'Mamadou Diallo',
      amount: 50000,
      remaining: 25000,
      status: 'active',
      dueDate: '2023-12-15',
      progress: 50,
    },
    {
      id: '2',
      borrower: 'Aminata Konaté',
      amount: 100000,
      remaining: 0,
      status: 'paid',
      dueDate: '2023-11-30',
      progress: 100,
    },
    {
      id: '3',
      borrower: 'Issouf Ouédraogo',
      amount: 75000,
      remaining: 75000,
      status: 'overdue',
      dueDate: '2023-11-15',
      progress: 0,
    },
  ];

  const filteredLoans = activeTab === 'all' 
    ? loans 
    : loans.filter(loan => loan.status === activeTab);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>
          {t('loans.title')}
        </Text>
        
        {/* Status Tabs */}
        <View style={styles.tabsContainer}>
          {['all', 'active', 'paid', 'overdue'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab ? styles.activeTabText : styles.inactiveTabText
                ]}
              >
                {t(`loans.tabs.${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Loan List */}
        {filteredLoans.length > 0 ? (
          <View style={styles.loansList}>
            {filteredLoans.map((loan) => (
              <TouchableOpacity
                key={loan.id}
                onPress={() => router.push(`/loans/${loan.id}`)}
              >
                <LoanCard loan={loan} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            title={t('loans.empty')}
            message={t('components.emptyState.tryAgain')}
          />
        )}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/loans/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xxl,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.xxl,
    ...theme.shadow.md,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
  },
  activeTabText: {
    color: theme.colors.textInverse,
  },
  inactiveTabText: {
    color: theme.colors.textSecondary,
  },
  loansList: {
    gap: theme.spacing.lg,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xxl,
    right: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.lg,
  },
  fabText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
  },
});