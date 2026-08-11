import React from 'react';
import { View, Text } from 'react-native';

interface TrustScoreBadgeProps {
  score: number; // 0-100
}

export default function TrustScoreBadge({ score }: TrustScoreBadgeProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'bg-success-500';
    if (score >= 60) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Poor';
  };

  return (
    <View className={`rounded-full px-3 py-1 ${getScoreColor()}`}>
      <Text className="text-white text-xs font-bold">
        {score} ({getScoreLabel()})
      </Text>
    </View>
  );
}