import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { theme } from '../../src/theme';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export default function EmailScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!email || !password) { Alert.alert('Error', 'Email and password required'); return; }
    setLoading(true);
    try {
      const endpoint = isLogin ? '/v1/auth/email/login' : '/v1/auth/email/register';
      const body: any = { email, password };
      if (!isLogin) body.displayName = displayName;
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) { Alert.alert('Error', data.error); return; }
      router.push({ pathname: '/auth/pin-setup', params: { token: data.token } });
    } catch { Alert.alert('Network Error', 'Could not reach server'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{ flex:1 }}>
        <View style={styles.container}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>{isLogin ? 'Welcome back' : 'Join LoanTrack'}</Text>
          
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          {!isLogin && <TextInput style={styles.input} placeholder="Display Name" value={displayName} onChangeText={setDisplayName} />}
          
          <TouchableOpacity style={[styles.button, loading&&{opacity:.5}]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? '...' : isLogin ? 'Sign In' : 'Register'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 20 }}>
            <Text style={{ color: theme.colors.primary }}>{isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, paddingHorizontal:24, justifyContent:'center',alignItems:'center' },
  icon: { fontSize:48, marginBottom:16 },
  title: { fontSize:28, fontWeight:'bold', color:theme.colors.text, marginBottom:4 },
  subtitle: { fontSize:16, color:theme.colors.textSecondary, marginBottom:32 },
  input: { width:'100%', borderWidth:1, borderColor:theme.colors.border, borderRadius:10, padding:16, fontSize:16, marginBottom:16, color:theme.colors.text },
  button: { width:'100%', backgroundColor:theme.colors.primary, borderRadius:10, paddingVertical:16, alignItems:'center', ...theme.shadow.md },
  buttonText: { color:'#fff', fontSize:17, fontWeight:'bold' },
});