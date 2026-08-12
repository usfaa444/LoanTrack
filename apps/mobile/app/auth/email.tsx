import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { theme } from '../../src/theme';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../../src/lib/firebase';
import { useAuthStore } from '../../src/stores/authStore';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export default function EmailScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.email.required'));
      return;
    }

    if (!isLogin && !displayName) {
      Alert.alert(t('common.error'), t('auth.email.displayNameRequired'));
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Login with existing account
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get Firebase ID token
        const idToken = await user.getIdToken();
        
        // Send ID token to backend to get internal JWT
        const res = await fetch(`${API_URL}/v1/auth/firebase/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        
        const data = await res.json();
        if (data.token) {
          // Store token and user data
          useAuthStore.getState().setToken(data.token);
          useAuthStore.getState().setUser(data.user);
          
          // Navigate to appropriate screen
          if (data.user.hasPinSet) {
            router.push('/(tabs)/dashboard');
          } else {
            router.push('/auth/pin-setup');
          }
        } else {
          Alert.alert(t('common.error'), data.error || t('auth.email.loginFailed'));
        }
      } else {
        // Register new account
        const res = await fetch(`${API_URL}/v1/auth/email/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, displayName }),
        });
        
        const data = await res.json();
        if (data.success) {
          // After registration, login the user
          setIsLogin(true);
          Alert.alert(t('common.success'), t('auth.email.registerSuccess'));
        } else {
          Alert.alert(t('common.error'), data.error || t('auth.email.registerFailed'));
        }
      }
    } catch (error: any) {
      console.error('Email auth error:', error);
      Alert.alert(t('common.error'), error.message || t('auth.email.authFailed'));
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
            <Text style={styles.tagline}>{isLogin ? t('auth.email.loginTitle') : t('auth.email.registerTitle')}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{isLogin ? t('auth.email.login') : t('auth.email.register')}</Text>
            
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder={t('auth.email.displayName')}
                value={displayName}
                onChangeText={setDisplayName}
                editable={!loading}
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder={t('auth.email.email')}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder={t('auth.email.password')}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            {/* Auth Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? t('common.loading') : (isLogin ? t('auth.email.login') : t('auth.email.register'))}
              </Text>
            </TouchableOpacity>
            
            {/* Toggle Login/Register */}
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              <Text style={styles.toggleText}>
                {isLogin 
                  ? t('auth.email.noAccount') 
                  : t('auth.email.hasAccount')}
              </Text>
            </TouchableOpacity>
          </View>
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
  title: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.xxl },
  input: {
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md, padding: theme.spacing.lg,
    fontSize: theme.fontSize.md, color: theme.colors.text,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  button: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg, alignItems: 'center', marginTop: theme.spacing.lg,
    ...theme.shadow.md,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: theme.colors.textInverse, fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  toggleButton: { alignItems: 'center', marginTop: theme.spacing.lg },
  toggleText: { color: theme.colors.primary, fontSize: theme.fontSize.md, fontWeight: 'medium' },
});