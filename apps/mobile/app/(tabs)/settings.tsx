import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { theme } from '../../src/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logout') + '?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => {
            useAuthStore.getState().logout();
            router.replace('/auth/phone');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('settings.title')}
      </Text>
      
      <View style={styles.settingsContainer}>
        {/* Profile Section */}
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => router.push('/auth/profile-setup')}
        >
          <Text style={styles.settingLabel}>
            {t('settings.profile')}
          </Text>
          <Text style={styles.settingValue}>
            {user?.name || 'N/A'}
          </Text>
        </TouchableOpacity>
        
        {/* Currency Section */}
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => {}}
        >
          <Text style={styles.settingLabel}>
            {t('settings.currency')}
          </Text>
          <Text style={styles.settingValue}>
            {user?.currency || 'XOF'}
          </Text>
        </TouchableOpacity>
        
        {/* Language Section */}
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => {}}
        >
          <Text style={styles.settingLabel}>
            {t('settings.language')}
          </Text>
          <Text style={styles.settingValue}>
            Français
          </Text>
        </TouchableOpacity>
        
        {/* Notifications Section */}
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => {}}
        >
          <Text style={styles.settingLabel}>
            {t('settings.notifications')}
          </Text>
          <Text style={styles.settingValue}>
            ✓
          </Text>
        </TouchableOpacity>
        
        {/* Security Section */}
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => {}}
        >
          <Text style={styles.settingLabel}>
            {t('settings.security')}
          </Text>
          <Text style={styles.settingValue}>
            ****
          </Text>
        </TouchableOpacity>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.settingRow, styles.logoutRow]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            {t('settings.logout')}
          </Text>
          <Text style={styles.logoutArrow}>
            →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xxl,
  },
  settingsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
    color: theme.colors.text,
  },
  settingValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  logoutRow: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
    color: theme.colors.error,
  },
  logoutArrow: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
  },
});