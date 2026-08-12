import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/lib/api';
import { useTranslation } from 'react-i18next';
import { theme } from '../../src/theme';
import { auth, PhoneAuthProvider } from '../../src/lib/firebase';

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const { setToken, setUser } = useAuthStore();
  const { t } = useTranslation();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const confirmationResultRef = useRef<any>(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if a digit is entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert(t('common.error'), t('auth.otp.placeholder'));
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would get the confirmationResult from the phone screen
      // For now, we'll simulate the Firebase flow
      
      // Get Firebase ID token (in a real app, this would come from confirming the OTP with Firebase)
      // This is a placeholder - in reality, you would call:
      // const userCredential = await confirmationResult.confirm(otpString);
      // const idToken = await userCredential.user.getIdToken();
      
      // For now, we'll just simulate getting an ID token
      const idToken = "placeholder_firebase_id_token";
      
      // Send ID token to backend to get internal JWT
      const response: any = await api.post('/auth/firebase/token', {
        idToken,
      });

      if (response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        
        // Check if user has set up PIN
        if (response.data.user.hasPinSet) {
          router.push('/(tabs)/dashboard');
        } else {
          router.push('/auth/pin-setup');
        }
      } else {
        Alert.alert(t('common.error'), response.message || t('common.error'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    try {
      // In a real implementation, you would resend the OTP via Firebase
      // For now, we'll just simulate it
      setResendCooldown(60); // 60 second cooldown
      // Clear OTP fields
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert(t('common.success'), t('auth.otp.resend'));
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.error'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {t('auth.otp.title')}
        </Text>
        <Text style={styles.instruction}>
          {t('auth.otp.instruction', { phone })}
        </Text>
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              editable={!loading}
              autoFocus={index === 0}
            />
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('common.loading') : t('auth.otp.verify')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.resendButton, resendCooldown > 0 && styles.resendButtonDisabled]}
          onPress={handleResendOTP}
          disabled={resendCooldown > 0 || loading}
        >
          <Text style={styles.resendButtonText}>
            {resendCooldown > 0 
              ? t('auth.otp.resendIn', { time: resendCooldown }) 
              : t('auth.otp.resend')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  instruction: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.massive,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: theme.spacing.massive,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...theme.shadow.lg,
    marginBottom: theme.spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: 'medium',
  },
});