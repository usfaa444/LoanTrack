import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { theme } from '../../src/theme';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const { setToken, setUser } = useAuthStore();
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) { Alert.alert('Error', 'Enter 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/auth/phone/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        router.push(data.user?.hasPinSet ? '/(tabs)/dashboard' : '/auth/pin-setup');
      } else {
        Alert.alert('Error', data.error || 'Invalid code');
      }
    } catch { Alert.alert('Error', 'Network error'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await fetch(`${API_URL}/v1/auth/phone/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch { Alert.alert('Error', 'Failed to resend'); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.instruction}>Enter the 6-digit code sent to {phone}</Text>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={styles.otpInput}
              keyboardType="number-pad" maxLength={1}
              value={digit} onChangeText={t => handleOtpChange(t, index)}
              editable={!loading} autoFocus={index === 0}
            />
          ))}
        </View>
        <TouchableOpacity style={[styles.button, loading && { opacity: 0.5 }]} onPress={handleVerifyOTP} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '...' : 'Verify'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={resendCooldown > 0 ? { opacity: 0.5 } : {}} onPress={handleResend} disabled={resendCooldown > 0}>
          <Text style={styles.resendText}>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.xl },
  title: { fontSize: theme.fontSize.xxxl, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.md },
  instruction: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.massive },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginBottom: theme.spacing.massive },
  otpInput: { width: 50, height: 60, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, textAlign: 'center', fontSize: theme.fontSize.xxxl, fontWeight: 'bold', color: theme.colors.text, backgroundColor: theme.colors.surface },
  button: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, alignItems: 'center', width: '100%', marginBottom: theme.spacing.lg, ...theme.shadow.lg },
  buttonText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  resendText: { color: theme.colors.primary, fontSize: theme.fontSize.md, fontWeight: '500' },
});