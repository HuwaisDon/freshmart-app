// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendOTP } from '@/services/authService';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useAlert } from '@/template';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      showAlert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    const result = await sendOTP(phone);
    setLoading(false);
    if (result.success) {
      router.push({ pathname: '/auth/otp', params: { phone } });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroContainer, { paddingTop: insets.top + 40 }]}>
          <Text style={styles.heroEmoji}>🛒</Text>
          <Text style={styles.heroTagline}>Shop Smart, Earn Rewards</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome to FreshMart</Text>
          <Text style={styles.subtitle}>Enter your mobile number to continue</Text>

          <View style={styles.inputContainer}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              placeholder="Mobile Number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </Pressable>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Credentials</Text>
            <Text style={styles.demoLine}>Customer: any 10-digit number</Text>
            <Text style={styles.demoLine}>Admin: 0000000000 or 9999999999</Text>
            <Text style={styles.demoLine}>Staff: 8888888888</Text>
            <Text style={styles.demoLine}>OTP: 1234 (always)</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.background },
  heroContainer: { alignItems: 'center', backgroundColor: Colors.background },
  heroEmoji: { fontSize: 80, textAlign: 'center' },
  heroTagline: { fontSize: FontSize.lg, color: Colors.textSecondary, textAlign: 'center', marginTop: 12 },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.xl,
    marginTop: -20,
    flex: 1,
  },
  title: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold, marginBottom: 6 },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  prefixText: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.medium },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.5,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: FontSize.lg, color: Colors.background, fontWeight: FontWeight.bold },
  demoBox: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  demoTitle: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold, marginBottom: 6 },
  demoLine: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 20 },
});
