// Powered by OnSpace.AI
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { MemberCard } from '@/components/ui/MemberCard';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    showAlert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/auth/login');
        }
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>My Member Card</Text>

      <MemberCard user={user} />

      <View style={styles.pointsSection}>
        <Text style={styles.sectionTitle}>Reward Points</Text>
        <View style={styles.pointsGrid}>
          <View style={styles.pointCard}>
            <MaterialIcons name="stars" size={24} color={Colors.gold} />
            <Text style={styles.pointValue}>{user.rewardPoints ?? 0}</Text>
            <Text style={styles.pointLabel}>Available Points</Text>
          </View>
          <View style={styles.pointCard}>
            <MaterialIcons name="currency-rupee" size={24} color={Colors.primary} />
            <Text style={styles.pointValue}>₹{user.rewardPoints ?? 0}</Text>
            <Text style={styles.pointLabel}>Savings Value</Text>
          </View>
        </View>

        <View style={styles.howBox}>
          <Text style={styles.howTitle}>How Rewards Work</Text>
          <View style={styles.howItem}>
            <MaterialIcons name="add-circle" size={16} color={Colors.primary} />
            <Text style={styles.howText}>Earn 5 points for every ₹100 spent</Text>
          </View>
          <View style={styles.howItem}>
            <MaterialIcons name="remove-circle" size={16} color={Colors.danger} />
            <Text style={styles.howText}>1 point = ₹1 off at checkout</Text>
          </View>
          <View style={styles.howItem}>
            <MaterialIcons name="card-giftcard" size={16} color={Colors.gold} />
            <Text style={styles.howText}>Admin can add bonus points for you</Text>
          </View>
          <View style={styles.howItem}>
            <MaterialIcons name="percent" size={16} color={Colors.secondary} />
            <Text style={styles.howText}>Max 20% of order value redeemable</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoValue}>+91 {user.phone}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <MaterialIcons name="badge" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Member ID</Text>
            <Text style={styles.infoValue}>{user.memberId}</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md },
  title: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, color: Colors.text, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  pointsSection: { marginTop: Spacing.xl },
  pointsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  pointCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  pointValue: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.extrabold },
  pointLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  howBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    gap: 10,
  },
  howTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold, marginBottom: 2 },
  howItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  howText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  infoSection: { marginTop: Spacing.xl },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  infoLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.semibold },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    backgroundColor: Colors.dangerMuted,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.danger + '40',
  },
  logoutText: { fontSize: FontSize.md, color: Colors.danger, fontWeight: FontWeight.semibold },
});
