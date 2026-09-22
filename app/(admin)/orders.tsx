// Powered by OnSpace.AI
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  TextInput, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Order } from '@/constants/mockData';
import { getAllOrders, verifyOrder } from '@/services/orderService';
import { useAlert } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

const statusConfig = {
  pending: { label: 'Pending', color: Colors.secondary, bg: Colors.secondaryMuted },
  paid: { label: 'Paid', color: Colors.primary, bg: Colors.primaryMuted },
  verified: { label: 'Collected', color: Colors.info, bg: Colors.infoMuted },
};

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanInput, setScanInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'verified'>('all');
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleVerify = async (order: Order) => {
    if (order.paymentStatus === 'verified') {
      showAlert('Already Collected', `Order ${order.id} has already been collected.`);
      return;
    }
    if (order.paymentStatus === 'pending') {
      showAlert('Payment Pending', `Order ${order.id} has not been paid yet.`);
      return;
    }
    showAlert('Verify Order', `Mark order ${order.id} as collected?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Verify & Complete', onPress: async () => {
          await verifyOrder(order.id);
          load();
          showAlert('Order Verified', `Order ${order.id} marked as collected.`);
        }
      },
    ]);
  };

  const handleScan = () => {
    if (!scanInput.trim()) return;
    const orderId = scanInput.split('|')[0].trim();
    const found = orders.find(o => o.id === orderId || o.qrCode.includes(scanInput));
    if (found) {
      setScanInput('');
      handleVerify(found);
    } else {
      showAlert('Not Found', `No order found for: ${scanInput}`);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.paymentStatus === filter);

  const renderItem = ({ item }: { item: Order }) => {
    const cfg = statusConfig[item.paymentStatus];
    return (
      <View style={styles.orderCard}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.rightMeta}>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <Text style={styles.total}>₹{item.total}</Text>
            <Text style={styles.payMethod}>{item.paymentMethod === 'upi' ? '📱 UPI' : '🛒 Pickup'}</Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {item.items.slice(0, 2).map((i, idx) => (
            <Text key={idx} style={styles.itemText}>{i.productName} × {i.quantity}</Text>
          ))}
          {item.items.length > 2 ? (
            <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
          ) : null}
        </View>

        {item.paymentStatus !== 'verified' ? (
          <Pressable
            style={({ pressed }) => [
              styles.verifyBtn,
              item.paymentStatus === 'pending' && styles.verifyBtnDisabled,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => handleVerify(item)}
          >
            <MaterialIcons
              name={item.paymentStatus === 'paid' ? 'verified' : 'schedule'}
              size={16}
              color={item.paymentStatus === 'paid' ? Colors.background : Colors.secondary}
            />
            <Text style={[
              styles.verifyBtnText,
              item.paymentStatus === 'pending' && styles.verifyBtnTextDisabled
            ]}>
              {item.paymentStatus === 'paid' ? 'Mark as Collected' : 'Awaiting Payment'}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.collectedBadge}>
            <MaterialIcons name="check-circle" size={14} color={Colors.info} />
            <Text style={styles.collectedText}>
              Collected {item.collectedAt ? new Date(item.collectedAt).toLocaleString('en-IN') : ''}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Orders & Verification</Text>

      {/* QR Scan Input */}
      <View style={styles.scanBox}>
        <MaterialIcons name="qr-code-scanner" size={20} color={Colors.secondary} />
        <TextInput
          style={styles.scanInput}
          value={scanInput}
          onChangeText={setScanInput}
          placeholder="Scan or enter order QR / ID..."
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={handleScan}
          returnKeyType="search"
        />
        <Pressable style={styles.scanBtn} onPress={handleScan}>
          <Text style={styles.scanBtnText}>Verify</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'pending', 'paid', 'verified'] as const).map(f => (
          <Pressable
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.secondary} style={{ flex: 1 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  scanBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.secondary + '50',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: 8,
    overflow: 'hidden',
  },
  scanInput: { flex: 1, fontSize: FontSize.sm, color: Colors.text, paddingVertical: 12 },
  scanBtn: { backgroundColor: Colors.secondary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md, margin: 4 },
  scanBtnText: { fontSize: FontSize.sm, color: Colors.background, fontWeight: FontWeight.bold },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: 8, marginBottom: Spacing.sm },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  filterText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterTextActive: { color: Colors.background, fontWeight: FontWeight.bold },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  orderId: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.bold },
  customerName: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  date: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  rightMeta: { alignItems: 'flex-end', gap: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  total: { fontSize: FontSize.lg, color: Colors.text, fontWeight: FontWeight.bold },
  payMethod: { fontSize: FontSize.xs, color: Colors.textMuted },
  itemsList: { marginBottom: Spacing.sm },
  itemText: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  moreItems: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 10,
    gap: 6,
  },
  verifyBtnDisabled: { backgroundColor: Colors.secondaryMuted },
  verifyBtnText: { fontSize: FontSize.sm, color: Colors.background, fontWeight: FontWeight.bold },
  verifyBtnTextDisabled: { color: Colors.secondary },
  collectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingVertical: 8 },
  collectedText: { fontSize: FontSize.xs, color: Colors.info },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary },
});
