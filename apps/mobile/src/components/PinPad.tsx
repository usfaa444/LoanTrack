import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme';

interface PinPadProps {
  onPinEnter: (pin: string) => void;
  onBack?: () => void;
  loading?: boolean;
  length?: number;
}

export default function PinPad({
  onPinEnter,
  onBack,
  loading = false,
  length = 4,
}: PinPadProps) {
  const [pin, setPin] = useState('');
  const { t } = useTranslation();

  const handleNumberPress = (num: string) => {
    if (loading) return;
    
    if (pin.length < length) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === length) {
        setTimeout(() => onPinEnter(newPin), 300);
      }
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    if (loading) return;
    setPin('');
  };

  return (
    <View style={styles.container}>
      {/* PIN Dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < pin.length 
                ? styles.filledDot 
                : styles.emptyDot
            ]}
          />
        ))}
      </View>
      
      {/* Number Pad */}
      <View style={styles.padContainer}>
        <View style={styles.numberGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => handleNumberPress(num.toString())}
              disabled={loading}
            >
              <Text style={styles.numberText}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClear}
            disabled={loading}
          >
            <Text style={styles.actionText}>
              Clear
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() => handleNumberPress('0')}
            disabled={loading}
          >
            <Text style={styles.numberText}>
              0
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBackspace}
            disabled={loading}
          >
            <Text style={styles.actionText}>
              ←
            </Text>
          </TouchableOpacity>
        </View>
        
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            disabled={loading}
          >
            <Text style={styles.backText}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.huge,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: theme.borderRadius.full,
    marginHorizontal: theme.spacing.sm,
  },
  filledDot: {
    backgroundColor: theme.colors.primary,
  },
  emptyDot: {
    backgroundColor: theme.colors.border,
  },
  padContainer: {
    width: 256,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  numberButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.lg,
  },
  numberText: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
  },
  actionText: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  backButton: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
  },
});