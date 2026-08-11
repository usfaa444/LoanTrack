import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/lib/api';
import { useTranslation } from 'react-i18next';
import { theme } from '../../src/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('auth.profile.namePlaceholder'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/update-profile', {
        name: name.trim(),
        currency: 'XOF', // Default to XOF for Burkina Faso
      });

      if (response.data.user) {
        setUser(response.data.user);
        router.push('/(tabs)/dashboard');
      } else {
        Alert.alert(t('common.error'), response.message || t('common.error'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="account-circle" 
        size={80} 
        color={theme.colors.border} 
        style={styles.avatarIcon} 
      />
      <Text style={styles.title}>
        {t('auth.profile.title')}
      </Text>
      <Text style={styles.subtitle}>
        {t('auth.profile.namePlaceholder')}
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {t('auth.profile.name')}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t('auth.profile.namePlaceholder')}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {t('auth.profile.currency')}
        </Text>
        <View style={[styles.input, styles.disabledInput]}>
          <Text style={styles.currencyText}>XOF (Franc CFA)</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t('common.loading') : t('common.save')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    textAlign: 'center',
    marginBottom: theme.spacing.huge,
    color: theme.colors.textSecondary,
  },
  inputGroup: {
    width: '100%',
    marginBottom: theme.spacing.xxl,
  },
  label: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: 'medium',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
  },
  disabledInput: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  currencyText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
});