import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface TrustScoreBadgeProps {
  score: number; // 0-100
}

export default function TrustScoreBadge({ score }: TrustScoreBadgeProps) {
  const getScoreColor = () => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.secondary;
    return theme.colors.error;
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Poor';
  };

  return (
    <View style={[styles.badge, { backgroundColor: getScoreColor() }]}>
      <Text style={styles.text}>
        {score} ({getScoreLabel()})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  text: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
});