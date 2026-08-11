import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useCountryStore } from '../../src/stores/countryStore';
import { api } from '../../src/lib/api';
import { useTranslation } from 'react-i18next';
import { theme } from '../../src/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const setAuthenticated = useAuthStore((s: any) => s.setAuthenticated);
  const { selected: country } = useCountryStore();

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Required', t('auth.profile.nameRequired'));
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/v1/auth/profile', {
        displayName: name,
        defaultCurrency: country.currency,
      });
      if (response.success) {
        setAuthenticated(true);
        router.replace('/(tabs)/dashboard');
      }
    } catch {
      setAuthenticated(true);
      router.replace('/(tabs)/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View theme.colors.surface, paddingHorizontal: theme.spacing.xl, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialIcons name="account-circle" size={80} color={theme.colors.border} style={{ marginBottom: theme.spacing.xxl }} />
      <Text style={styles.title}>{t('auth.profile.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.profile.namePlaceholder')}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('auth.profile.name')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('auth.profile.namePlaceholder')}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('auth.profile.currency')} — {country.flag} {country.name}</Text>
        <View style={[styles.input, { backgroundColor: theme.colors.backgroundAlt, flexDirection: 'row', alignItems: 'center' }]}>
          <Text style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.primary, marginRight: 8 }}>{country.currency}</Text>
          <Text style={{ fontSize: theme.fontSize.md, color: theme.colors.textSecondary }}>
            {country.currency === 'XOF' ? 'Franc CFA' : country.currency}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.5 }]}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? t('common.loading') : t('common.save')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: theme.colors.text },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, color: theme.colors.textSecondary },
  inputGroup: { width: '100%', marginBottom: 24 },
  label: { color: theme.colors.text, marginBottom: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, padding: 16, fontSize: 17, color: theme.colors.text },
  button: { backgroundColor: theme.colors.primary, borderRadius: 10, paddingVertical: 16, width: '100%', alignItems: 'center', ...theme.shadow.md },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});