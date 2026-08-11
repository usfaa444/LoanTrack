import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, Modal, FlatList, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useCountryStore } from '../../src/stores/countryStore';
import { countries } from '../../src/data/countries';
import { theme } from '../../src/theme';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const { selected, setCountry } = useCountryStore();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSendOtp = async () => {
    const fullPhone = selected.phonePrefix + phone.replace(/\s/g, '');
    if (phone.length < 8) {
      Alert.alert('Invalid', 'Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (data.success) {
        router.push({ pathname: '/auth/otp', params: { phone: fullPhone } });
      } else {
        Alert.alert('Error', data.error || 'Failed to send OTP. Check your Supabase configuration.');
      }
    } catch {
      Alert.alert('Network Error', 'Could not reach server. Check your connection and API URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.mosqueIcon}>🕌</Text>
            <Text style={styles.appName}>LoanTrack</Text>
            <Text style={styles.tagline}>{t('common.welcome')}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{t('auth.phone.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.phone.instruction')}</Text>

            {/* Country Selector */}
            <TouchableOpacity style={styles.countryPicker} onPress={() => setShowPicker(true)}>
              <Text style={styles.flag}>{selected.flag}</Text>
              <Text style={styles.countryCode}>{selected.phonePrefix}</Text>
              <Text style={styles.countryName}>{selected.name}</Text>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            {/* Phone Input */}
            <View style={styles.phoneRow}>
              <View style={styles.prefixBadge}>
                <Text style={styles.prefixText}>{selected.phonePrefix}</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="70 00 00 00"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={10}
                editable={!loading}
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? t('common.loading') : t('auth.phone.sendCode')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Country Picker Modal */}
          <Modal visible={showPicker} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('auth.phone.selectCountry')}</Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={countries}
                  keyExtractor={(c) => c.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.countryItem, selected.code === item.code && styles.countryItemSelected]}
                      onPress={() => { setCountry(item); setShowPicker(false); }}
                    >
                      <Text style={styles.flag}>{item.flag}</Text>
                      <Text style={styles.countryItemName}>{item.name}</Text>
                      <Text style={styles.countryItemPrefix}>{item.phonePrefix}</Text>
                      {selected.code === item.code && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: theme.spacing.xl },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: theme.spacing.xxxl },
  mosqueIcon: { fontSize: 48, marginBottom: theme.spacing.sm },
  appName: { fontSize: 28, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
  tagline: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  content: { flex: 1 },
  title: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.sm },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginBottom: theme.spacing.xxl },
  countryPicker: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md, padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  flag: { fontSize: 22, marginRight: theme.spacing.md },
  countryCode: { fontSize: theme.fontSize.md, fontWeight: 'bold', color: theme.colors.text, marginRight: theme.spacing.sm },
  countryName: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },
  chevron: { fontSize: 12, color: theme.colors.textSecondary },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xxl },
  prefixBadge: {
    backgroundColor: theme.colors.backgroundAlt, paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, marginRight: theme.spacing.sm,
  },
  prefixText: { fontSize: theme.fontSize.md, fontWeight: 'bold', color: theme.colors.text },
  phoneInput: {
    flex: 1, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md, padding: theme.spacing.lg,
    fontSize: theme.fontSize.lg, color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg, alignItems: 'center', ...theme.shadow.md,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: theme.colors.textInverse, fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modalTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  modalClose: { fontSize: 20, color: theme.colors.textSecondary, padding: theme.spacing.sm },
  countryItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, paddingHorizontal: theme.spacing.xl },
  countryItemSelected: { backgroundColor: theme.colors.goldLight },
  countryItemName: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },
  countryItemPrefix: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  checkmark: { fontSize: 18, color: theme.colors.primary, fontWeight: 'bold' },
});