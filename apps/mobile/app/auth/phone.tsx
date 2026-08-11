import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/lib/api';
import { useTranslation } from 'react-i18next';
import { theme } from '../../src/theme';

export default function PhoneAuthScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const validatePhone = (phone: string) => {
    // Basic validation for Burkina Faso phone numbers
    const phoneRegex = /^(?:\+226|00226|226)?(?:\s)?[0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      Alert.alert(t('common.error'), t('auth.phone.validation'));
      return;
    }

    setLoading(true);
    try {
      // Format phone number for API (E.164)
      let formattedPhone = phone;
      if (!phone.startsWith('+')) {
        formattedPhone = `+226${phone.replace(/^(00226|226)/, '')}`;
      }

      const response = await api.post('/auth/send-otp', { phone: formattedPhone });
      
      if (response.data.success) {
        router.push({
          pathname: '/auth/otp',
          params: { phone: formattedPhone }
        });
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.mosqueEmoji}>🕌</Text>
          <Text style={styles.title}>LoanTrack</Text>
          <Text style={styles.subtitle}>Burkina Faso</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.description}>
            {t('auth.phone.placeholder')}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.prefix}>+226</Text>
            <TextInput
              style={styles.textInput}
              placeholder="XX XX XX XX"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!loading}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('common.loading') : t('auth.phone.continue')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.huge,
    marginBottom: theme.spacing.massive,
  },
  mosqueEmoji: {
    fontSize: theme.fontSize.xxxl,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textInverse,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    flex: 1,
  },
  description: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.massive,
  },
  inputContainer: {
    marginBottom: theme.spacing.massive,
  },
  prefix: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: theme.fontSize.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.lg,
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