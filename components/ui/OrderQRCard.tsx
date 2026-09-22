// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Order } from '@/constants/mockData';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  order: Order;
}

const statusConfig = {
  pending: { label: 'Pending Payment', color: Colors.secondary, icon: 'schedule' as const },
  paid: { label: 'Paid – Ready to Collect', color: Colors.primary, icon: 'check-circle' as const },
  verified: { label: 'Collected & Verified', color: Colors.info, icon: 'verified' as const },
};

export function OrderQRCard({ order }: Props) {
  const cfg = statusConfig[order.paymentStatus];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.date}>{new Date(order.createdAt).toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + '22' }]}>
          <MaterialIcons name={cfg.icon} size={14} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}> {cfg.label}</Text>
        </View>
      </View>

      <View style={styles.qrContainer}>
        <QRCode
          value={order.qrCode}
          size={140}
          color={Colors.text}
          backgroundColor={Colors.card}
        />
        <Text style={styles.qrHint}>Show this QR to staff for collection</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.summary}>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.productName} × {item.quantity}</Text>
            <Text style={styles.itemTotal}>₹{item.total}</Text>
          </View>
        ))}
        {order.rewardDiscount > 0 ? (
          <View style={styles.itemRow}>
            <Text style={[styles.itemName, { color: Colors.gold }]}>Reward Points Discount</Text>
            <Text style={[styles.itemTotal, { color: Colors.gold }]}>-₹{order.rewardDiscount}</Text>
          </View>
        ) : null}
        <View style={[styles.itemRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalAmount}>₹{order.total}</Text>
        </View>
        <Text style={styles.payMethod}>
          Payment: {order.paymentMethod === 'upi' ? '📱 UPI' : '🛒 Pay on Pickup'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  orderId: { fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.bold },
  date: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  qrContainer: { alignItems: 'center', paddingVertical: Spacing.md },
  qrHint: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 10, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  summary: {},
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  itemTotal: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium },
  totalRow: { marginTop: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.bold },
  totalAmount: { fontSize: FontSize.lg, color: Colors.primary, fontWeight: FontWeight.extrabold },
  payMethod: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6 },
});
