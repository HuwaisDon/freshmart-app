// Powered by OnSpace.AI
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { verifyOTP } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUser } = useAuth();
  const { showAlert } = useAlert();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpStr = otp.join('');
    if (otpStr.length < 4) {
      showAlert('Incomplete OTP', 'Please enter all 4 digits.');
      return;
    }
    setLoading(true);
    const result = await verifyOTP(phone, otpStr);
    setLoading(false);
    if (result.success && result.user) {
      setUser(result.user);
      if (result.user.role === 'admin' || result.user.role === 'staff') {
        router.replace('/(admin)');
      } else {
        router.replace('/(customers)');
      }
    } else {
      showAlert('Verification Failed', result.message);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>

        <View style={styles.iconContainer}>
          <Text style={styles.phoneIcon}>📱</Text>
        </View>

        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit code sent to{'\n'}
          <Text style={styles.phoneHighlight}>+91 {phone}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              style={[styles.otpInput, digit ? styles.otpFilled : null]}
              value={digit}
              onChangeText={t => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.verifyBtn,
            pressed && styles.verifyBtnPressed,
            loading && styles.verifyBtnDisabled,
          ]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={styles.verifyText}>Verify & Login</Text>
          )}
        </Pressable>

        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.resendTimer}>Resend OTP in {countdown}s</Text>
          ) : (
            <Pressable onPress={() => setCountdown(30)}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.hintBox}>
          <Text style={styles.hintText}>Use OTP: <Text style={styles.hintOTP}>1234</Text> for demo</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: Spacing.xl, backgroundColor: Colors.background },
  back: { width: 44, height: 44, justifyContent: 'center' },
  iconContainer: { alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.md },
  phoneIcon: { fontSize: 64 },
  title: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xl },
  phoneHighlight: { color: Colors.primary, fontWeight: FontWeight.semibold },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: Spacing.xl },
  otpInput: {
    width: 60,
    height: 64,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    textAlign: 'center',
    fontSize: FontSize.xxl,
    color: Colors.text,
    fontWeight: FontWeight.bold,
  },
  otpFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  verifyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyBtnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  verifyBtnDisabled: { opacity: 0.6 },
  verifyText: { fontSize: FontSize.lg, color: Colors.background, fontWeight: FontWeight.bold },
  resendRow: { alignItems: 'center', marginTop: Spacing.md },
  resendTimer: { fontSize: FontSize.sm, color: Colors.textMuted },
  resendLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  hintBox: { marginTop: Spacing.xl, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  hintText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  hintOTP: { color: Colors.primary, fontWeight: FontWeight.bold, letterSpacing: 2 },
});
