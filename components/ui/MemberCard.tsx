// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthUser } from '@/services/authService';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  user: AuthUser;
}

export function MemberCard({ user }: Props) {
  const memberQR = `MEMBER|${user.memberId}|${user.phone}`;

  return (
    <LinearGradient
      colors={['#1a3a1a', '#0d2010', '#0a1a0a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.storeName}>🌿 FreshMart</Text>
          <Text style={styles.memberLabel}>MEMBER CARD</Text>
        </View>
        <View style={styles.pointsBadge}>
          <MaterialIcons name="stars" size={16} color={Colors.gold} />
          <Text style={styles.pointsValue}> {user.rewardPoints ?? 0}</Text>
          <Text style={styles.pointsLabel}> pts</Text>
        </View>
      </View>

      <View style={styles.midRow}>
        <View>
          <Text style={styles.memberName}>{user.name}</Text>
          <Text style={styles.memberId}>{user.memberId}</Text>
          <Text style={styles.phone}>📞 +91 {user.phone}</Text>
        </View>
        <View style={styles.qrBox}>
          <QRCode
            value={memberQR}
            size={80}
            color={Colors.text}
            backgroundColor="transparent"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.pointsInfo}>
          <Text style={styles.footerLabel}>Available Points</Text>
          <Text style={styles.footerValue}>₹{user.rewardPoints ?? 0} value</Text>
        </View>
        <View style={styles.earnInfo}>
          <Text style={styles.footerLabel}>Earn Rate</Text>
          <Text style={styles.footerValue}>5 pts / ₹100</Text>
        </View>
      </View>

      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    overflow: 'hidden',
    position: 'relative',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  storeName: { fontSize: FontSize.xl, color: Colors.text, fontWeight: FontWeight.bold },
  memberLabel: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium, letterSpacing: 2 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  pointsValue: { fontSize: FontSize.lg, color: Colors.gold, fontWeight: FontWeight.bold },
  pointsLabel: { fontSize: FontSize.sm, color: Colors.gold },
  midRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  memberName: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold, marginBottom: 4 },
  memberId: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold, letterSpacing: 1, marginBottom: 4 },
  phone: { fontSize: FontSize.sm, color: Colors.textSecondary },
  qrBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  pointsInfo: {},
  earnInfo: { alignItems: 'flex-end' },
  footerLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  footerValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.semibold },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(76,175,80,0.05)',
    top: -80,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76,175,80,0.06)',
    bottom: -40,
    left: -20,
  },
});
