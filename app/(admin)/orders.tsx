// Powered by OnSpace.AI
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Order } from '@/constants/mockData';
import {
  getAllOrders,
  confirmPayOnPickup,
  completePickup,
} from '@/services/orderService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
} from '@/constants/theme';

const statusConfig = {
  pending: {
    label: 'Payment Pending',
    color: Colors.secondary,
    bg: Colors.secondaryMuted,
  },
  paid: {
    label: 'Paid',
    color: Colors.primary,
    bg: Colors.primaryMuted,
  },
  verified: {
    label: 'Paid',
    color: Colors.primary,
    bg: Colors.primaryMuted,
  },
};

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanInput, setScanInput] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'paid' | 'verified'
  >('all');
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );

  const { showAlert } = useAlert();
  const { user, isLoading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      showAlert(
        'Unable to Load Orders',
        error instanceof Error ? error.message : 'Unable to load orders.'
      );
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleVerify = async (order: Order) => {
    if (authLoading) {
      showAlert(
        'Authentication Loading',
        'Please wait for admin authentication to finish loading.'
      );
      return;
    }

    if (!user) {
      showAlert(
        'Access Denied',
        'Your admin session could not be loaded. Please return to login and sign in again.'
      );
      return;
    }

    if (user.role !== 'admin' && user.role !== 'staff') {
      showAlert(
        'Access Denied',
        'Only staff or admin can verify orders.'
      );
      return;
    }

    if (processingOrderId === order.id) {
      return;
    }

    setProcessingOrderId(order.id);

    try {
      // Pay on Pickup:
      // Payment must be confirmed before stock is deducted and rewards are applied.
      if (
        order.paymentMethod === 'pay_on_pickup' &&
        order.paymentStatus === 'pending'
      ) {
        showAlert(
          'Confirm Payment',
          `Has payment for order ${order.id} been received?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setProcessingOrderId(null),
            },
            {
              text: 'Confirm Payment',
              onPress: async () => {
                try {
                  if (!user) {
                    throw new Error('Admin session is no longer available.');
                  }

                  await confirmPayOnPickup(order.id, user);
                  await load();

                  showAlert(
                    'Payment Confirmed',
                    `Payment confirmed for ${order.id}.\n\nStock deducted and rewards applied.`
                  );
                } catch (error) {
                  showAlert(
                    'Unable to Confirm Payment',
                    error instanceof Error
                      ? error.message
                      : 'Unable to confirm payment.'
                  );
                } finally {
                  setProcessingOrderId(null);
                }
              },
            },
          ]
        );

        return;
      }

      // Pickup order that has already been paid:
      // Staff/admin can now complete the physical pickup.
      if (
        order.fulfillmentMethod === 'pickup' &&
        order.paymentStatus === 'paid' &&
        order.pickupStatus !== 'completed'
      ) {
        showAlert(
          'Complete Pickup',
          `Mark order ${order.id} as collected?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setProcessingOrderId(null),
            },
            {
              text: 'Complete Pickup',
              onPress: async () => {
                try {
                  if (!user) {
                    throw new Error('Admin session is no longer available.');
                  }

                  await completePickup(order.id, user);
                  await load();

                  showAlert(
                    'Pickup Completed',
                    `Order ${order.id} has been marked as completed.`
                  );
                } catch (error) {
                  showAlert(
                    'Unable to Complete Pickup',
                    error instanceof Error
                      ? error.message
                      : 'Unable to complete pickup.'
                  );
                } finally {
                  setProcessingOrderId(null);
                }
              },
            },
          ]
        );

        return;
      }

      if (order.pickupStatus === 'completed') {
        showAlert(
          'Already Completed',
          `Order ${order.id} has already been collected.`
        );
        setProcessingOrderId(null);
        return;
      }

      showAlert(
        'No Action Required',
        `Order ${order.id} is already paid and does not require pickup verification.`
      );
      setProcessingOrderId(null);
    } catch (error) {
      setProcessingOrderId(null);
      showAlert(
        'Verification Error',
        error instanceof Error
          ? error.message
          : 'Unable to process order.'
      );
    }
  };

  const handleScan = () => {
    const value = scanInput.trim();

    if (!value) {
      return;
    }

    const orderId = value.split('|')[0].trim();

    const found = orders.find(
      (o) =>
        o.id === orderId ||
        o.pickupCode === value ||
        o.qrCode?.includes(value)
    );

    if (found) {
      setScanInput('');
      handleVerify(found);
    } else {
      showAlert('Not Found', `No order found for: ${value}`);
    }
  };

  const filtered =
    filter === 'all'
      ? orders
      : orders.filter((o) => o.paymentStatus === filter);

  const renderItem = ({ item }: { item: Order }) => {
    const cfg = statusConfig[item.paymentStatus];
    const isProcessing = processingOrderId === item.id;
    const isPickup = item.fulfillmentMethod === 'pickup';
    const isCompleted = item.pickupStatus === 'completed';
    const isPaymentPending =
      item.paymentMethod === 'pay_on_pickup' &&
      item.paymentStatus === 'pending';

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardTop}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.rightMeta}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: cfg.bg },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: cfg.color },
                ]}
              >
                {isCompleted ? 'Completed' : cfg.label}
              </Text>
            </View>

            <Text style={styles.total}>₹{item.total}</Text>

            <Text style={styles.payMethod}>
              {item.paymentMethod === 'upi'
                ? '📱 UPI'
                : item.paymentMethod === 'pay_on_pickup'
                  ? '💵 Pay on Pickup'
                  : '🛒 Pickup'}
            </Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {item.items.slice(0, 2).map((i, idx) => (
            <Text key={idx} style={styles.itemText}>
              {i.productName} × {i.quantity}
            </Text>
          ))}

          {item.items.length > 2 ? (
            <Text style={styles.moreItems}>
              +{item.items.length - 2} more items
            </Text>
          ) : null}
        </View>

        {isPickup ? (
          isCompleted ? (
            <View style={styles.collectedBadge}>
              <MaterialIcons
                name="check-circle"
                size={14}
                color={Colors.info}
              />
              <Text style={styles.collectedText}>Completed</Text>
            </View>
          ) : (
            <Pressable
              disabled={isProcessing}
              style={({ pressed }) => [
                styles.verifyBtn,
                isProcessing && styles.verifyBtnDisabled,
                pressed && !isProcessing && { opacity: 0.8 },
              ]}
              onPress={() => handleVerify(item)}
            >
              {isProcessing ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.background}
                />
              ) : (
                <MaterialIcons
                  name={isPaymentPending ? 'payments' : 'check-circle'}
                  size={16}
                  color={Colors.background}
                />
              )}

              <Text
                style={[
                  styles.verifyBtnText,
                  isProcessing && styles.verifyBtnTextDisabled,
                ]}
              >
                {isProcessing
                  ? 'Processing...'
                  : isPaymentPending
                    ? 'Confirm Payment'
                    : 'Complete Pickup'}
              </Text>
            </Pressable>
          )
        ) : (
          <View style={styles.collectedBadge}>
            <MaterialIcons
              name="check-circle"
              size={14}
              color={Colors.info}
            />
            <Text style={styles.collectedText}>
              Paid / Self Checkout
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (authLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={Colors.secondary}
        />
        <Text style={styles.loadingText}>
          Loading admin session...
        </Text>
      </View>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <MaterialIcons
          name="lock"
          size={48}
          color={Colors.secondary}
        />
        <Text style={styles.accessTitle}>Access Denied</Text>
        <Text style={styles.accessText}>
          Only staff or admin can access order verification.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      <Text style={styles.title}>Orders & Verification</Text>

      <View style={styles.scanBox}>
        <MaterialIcons
          name="qr-code-scanner"
          size={20}
          color={Colors.secondary}
        />

        <TextInput
          style={styles.scanInput}
          value={scanInput}
          onChangeText={setScanInput}
          placeholder="Scan or enter order QR / ID..."
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={handleScan}
          returnKeyType="search"
        />

        <Pressable
          style={styles.scanBtn}
          onPress={handleScan}
        >
          <Text style={styles.scanBtnText}>Verify</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'pending', 'paid', 'verified'] as const).map(
          (f) => (
            <Pressable
              key={f}
              style={[
                styles.filterTab,
                filter === f && styles.filterTabActive,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          )
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.secondary}
          style={{ flex: 1 }}
        />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  title: {
    fontSize: FontSize.xxl,
    color: Colors.text,
    fontWeight: FontWeight.bold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },

  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },

  accessTitle: {
    fontSize: FontSize.xl,
    color: Colors.text,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.md,
  },

  accessText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

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

  scanInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
    paddingVertical: 12,
  },

  scanBtn: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    margin: 4,
  },

  scanBtnText: {
    fontSize: FontSize.sm,
    color: Colors.background,
    fontWeight: FontWeight.bold,
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },

  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  filterTabActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },

  filterText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },

  filterTextActive: {
    color: Colors.background,
    fontWeight: FontWeight.bold,
  },

  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },

  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },

  orderInfo: {
    flex: 1,
    paddingRight: Spacing.md,
  },

  orderId: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.bold,
  },

  customerName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  date: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },

  rightMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },

  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  total: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: FontWeight.bold,
  },

  payMethod: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  itemsList: {
    marginBottom: Spacing.sm,
  },

  itemText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  moreItems: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 10,
    gap: 6,
  },

  verifyBtnDisabled: {
    backgroundColor: Colors.secondaryMuted,
  },

  verifyBtnText: {
    fontSize: FontSize.sm,
    color: Colors.background,
    fontWeight: FontWeight.bold,
  },

  verifyBtnTextDisabled: {
    color: Colors.secondary,
  },

  collectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 8,
  },

  collectedText: {
    fontSize: FontSize.xs,
    color: Colors.info,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },

  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
});
