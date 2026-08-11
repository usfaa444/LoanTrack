import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme';

type Status = 'active' | 'paid' | 'overdue';

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return {
          backgroundColor: theme.colors.primaryLight + '20',
          borderColor: theme.colors.primary,
          textColor: theme.colors.primaryDark,
        };
      case 'paid':
        return {
          backgroundColor: theme.colors.successLight,
          borderColor: theme.colors.success,
          textColor: theme.colors.success,
        };
      case 'overdue':
        return {
          backgroundColor: theme.colors.errorLight,
          borderColor: theme.colors.error,
          textColor: theme.colors.error,
        };
      default:
        return {
          backgroundColor: theme.colors.backgroundAlt,
          borderColor: theme.colors.border,
          textColor: theme.colors.textSecondary,
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusStyles.backgroundColor,
          borderColor: statusStyles.borderColor,
        }
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: statusStyles.textColor }
        ]}
      >
        {t(`components.statusBadge.${status}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
});