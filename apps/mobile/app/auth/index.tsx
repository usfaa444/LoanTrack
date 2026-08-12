import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { theme } from '../../src/theme';

export default function AuthChoiceScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.mosqueIcon}>🕌</Text>
          <Text style={styles.appName}>LoanTrack</Text>
          <Text style={styles.tagline}>{t('common.welcome')}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.choice.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.choice.instruction')}</Text>

          {/* Sign in with Email */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/auth/email')}
          >
            <Text style={styles.buttonText}>{t('auth.choice.email')}</Text>
          </TouchableOpacity>

          {/* Sign in with Phone */}
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/auth/phone')}
          >
            <Text style={styles.buttonTextSecondary}>{t('auth.choice.phone')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  container: { flex: 1, paddingHorizontal: theme.spacing.xl },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: theme.spacing.xxxl },
  mosqueIcon: { fontSize: 48, marginBottom: theme.spacing.sm },
  appName: { fontSize: 28, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
  tagline: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginBottom: theme.spacing.xxl, textAlign: 'center' },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadow.md,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: { color: theme.colors.textInverse, fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  buttonTextSecondary: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});