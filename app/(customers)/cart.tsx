// Powered by OnSpace.AI

import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { useEffect, useState } from 'react';
import { createOrder, generateOrderId } from '@/services/orderService';
import { EARN_RATE } from '@/services/rewardService';
import { Order } from '@/constants/mockData';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const { user, updateRewardPoints } = useAuth();
  const { showAlert } = useAlert();
  const [paymentMethod, setPaymentMethod] =
  useState<'upi' | 'pay_on_pickup'>('upi');
  const [usePoints, setUsePoints] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const availablePoints = user?.rewardPoints ?? 0;
  const pointsDiscount = usePoints ? Math.min(availablePoints, Math.floor(subtotal * 0.2)) : 0;
  const total = subtotal - pointsDiscount;
  const earnablePoints = Math.floor((total / 100) * EARN_RATE);
  useEffect(() => {
    if (paymentMethod === 'pay_on_pickup') {
      setUsePoints(false);
    }
  }, [paymentMethod]);
  const handleCheckout = async () => {
    if (items.length === 0 || !user) return;

    setLoading(true);

    try {
      const orderId = generateOrderId();

      const isPayOnPickup = paymentMethod === 'pay_on_pickup';

      const order: Order = {
        id: orderId,
        customerId: user.id,
        customerName: user.name,

        items: items.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          price: i.product.discountedPrice ?? i.product.price,
          total:
            (i.product.discountedPrice ?? i.product.price) *
            i.quantity,
        })),

        subtotal,
        rewardDiscount: pointsDiscount,
        total,

        paymentMethod,

        /*
        * Pay on Pickup stays pending.
        * UPI is considered paid immediately in this prototype.
        */
        paymentStatus: isPayOnPickup ? 'pending' : 'paid',

        fulfillmentMethod: isPayOnPickup
          ? 'pickup'
          : 'self_checkout',

        pickupStatus: isPayOnPickup
          ? 'pending'
          : 'not_required',

        createdAt: new Date().toISOString(),
      };

      const result = await createOrder(order);

      /*
      * IMPORTANT:
      * Pay-on-Pickup rewards are NOT awarded here.
      * Stock is also NOT deducted here.
      *
      * createOrder() handles stock/reward transitions for
      * immediately-paid orders.
      */

      if (!isPayOnPickup && pointsDiscount > 0) {
        /*
        * Reward redemption is intentionally handled locally here
        * for already-paid orders.
        *
        * The prototype's reward service remains the source of
        * customer reward balance.
        */
        const newPoints = Math.max(
          0,
          availablePoints - pointsDiscount
        );

        updateRewardPoints(
          newPoints + result.rewardPointsEarned
        );
      } else if (!isPayOnPickup) {
        updateRewardPoints(
          availablePoints + result.rewardPointsEarned
        );
      }

      clearCart();

      showAlert(
        isPayOnPickup ? 'Pickup Order Created!' : 'Order Placed!',
        isPayOnPickup
          ? `Order ${orderId} is ready for pickup.\n\nPay at the store when collecting your order.`
          : `Order ${orderId} placed.\n+${result.rewardPointsEarned} reward points earned!`,
        [
          {
            text: 'View Orders',
            onPress: () => router.push('/(customers)/orders'),
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to place order.';

      showAlert('Unable to Place Order', message);
    } finally {
      setLoading(false);
    }
  };

  //   await createOrder(order);

  //   if (usePoints && pointsDiscount > 0) {
  //     await deductRewardPoints(user!.id, pointsDiscount);
  //     const newPts = availablePoints - pointsDiscount + earnablePoints;
  //     await updateStoredRewardPoints(newPts);
  //     updateRewardPoints(newPts);
  //   } else {
  //     const newPts = availablePoints + earnablePoints;
  //     await updateStoredRewardPoints(newPts);
  //     updateRewardPoints(newPts);
  //   }

  //   clearCart();
  //   setLoading(false);

  //   showAlert(
  //     'Order Placed!',
  //     `Order ${orderId} placed.\n+${earnablePoints} reward points earned!\n\nView your QR in Orders tab.`,
  //     [{ text: 'View Orders', onPress: () => router.push('/(customers)/orders') }]
  //   );
  // };

  if (items.length === 0) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add products from the store</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Your Cart ({totalItems})</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Cart Items */}
          {items.map(item => {
            const price = item.product.discountedPrice ?? item.product.price;
            return (
              <View key={item.product.id} style={styles.cartItem}>
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.itemImage}
                  contentFit="cover"
                  transition={150}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                  <Text style={styles.itemUnit}>{item.product.unit}</Text>
                  <Text style={styles.itemPrice}>₹{price} each</Text>
                </View>
                <View style={styles.itemActions}>
                  <View style={styles.qtyRow}>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.product.id, item.quantity - 1)} hitSlop={8}>
                      <MaterialIcons name={item.quantity === 1 ? 'delete-outline' : 'remove'} size={18} color={item.quantity === 1 ? Colors.danger : Colors.text} />
                    </Pressable>
                    <Text style={styles.qtyNum}>{item.quantity}</Text>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.product.id, item.quantity + 1)} hitSlop={8}>
                      <MaterialIcons name="add" size={18} color={Colors.text} />
                    </Pressable>
                  </View>
                  <Text style={styles.itemSubtotal}>₹{price * item.quantity}</Text>
                </View>
              </View>
            );
          })}

          {/* Reward Points */}
          {availablePoints > 0 && paymentMethod !== 'pay_on_pickup' ? (
            <View style={styles.rewardBox}>
              <View style={styles.rewardLeft}>
                <MaterialIcons name="stars" size={20} color={Colors.gold} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.rewardTitle}>Use Reward Points</Text>
                  <Text style={styles.rewardSub}>You have {availablePoints} pts (saves ₹{Math.min(availablePoints, Math.floor(subtotal * 0.2))})</Text>
                </View>
              </View>
              <Pressable
                style={[styles.toggle, usePoints && styles.toggleOn]}
                onPress={() => setUsePoints(!usePoints)}
              >
                <View style={[styles.toggleThumb, usePoints && styles.toggleThumbOn]} />
              </Pressable>
            </View>
          ) : null}

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentOptions}>
              <Pressable
                style={[styles.payOption, paymentMethod === 'upi' && styles.payOptionActive]}
                onPress={() => setPaymentMethod('upi')}
              >
                <Text style={styles.payIcon}>📱</Text>
                <Text style={[styles.payLabel, paymentMethod === 'upi' && styles.payLabelActive]}>Pay via UPI</Text>
              </Pressable>
              <Pressable
                style={[styles.payOption, paymentMethod === 'pay_on_pickup' && styles.payOptionActive]}
                onPress={() => setPaymentMethod('pay_on_pickup')}
              >
                <Text style={styles.payIcon}>🛒</Text>
                <Text style={[styles.payLabel, paymentMethod === 'pay_on_pickup' && styles.payLabelActive]}>Pay on Pickup</Text>
              </Pressable>
            </View>
          </View>

          {/* Price Summary */}
          <View style={styles.summary}>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Subtotal</Text>
              <Text style={styles.sumValue}>₹{subtotal}</Text>
            </View>
            {pointsDiscount > 0 ? (
              <View style={styles.sumRow}>
                <Text style={[styles.sumLabel, { color: Colors.gold }]}>Reward Points Discount</Text>
                <Text style={[styles.sumValue, { color: Colors.gold }]}>-₹{pointsDiscount}</Text>
              </View>
            ) : null}
            <View style={[styles.sumRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
            <Text style={styles.earnNote}>+{earnablePoints} reward points on this order</Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={[styles.checkoutBar, { paddingBottom: insets.bottom + 12 }]}>
          <View>
            <Text style={styles.checkoutTotal}>₹{total}</Text>
            <Text style={styles.checkoutItems}>{totalItems} items</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.checkoutBtn, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}
            onPress={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <>
                <Text style={styles.checkoutBtnText}>Place Order</Text>
                <MaterialIcons name="arrow-forward" size={20} color={Colors.background} />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  itemImage: { width: 64, height: 64, borderRadius: Radius.md, backgroundColor: Colors.surface },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.semibold, lineHeight: 18 },
  itemUnit: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  itemActions: { alignItems: 'flex-end' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: 4 },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyNum: { minWidth: 22, textAlign: 'center', fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.bold },
  itemSubtotal: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.bold, marginTop: 6 },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  rewardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rewardTitle: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.semibold },
  rewardSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: Colors.primary },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: 'flex-start' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  section: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
  paymentOptions: { flexDirection: 'row', gap: Spacing.sm },
  payOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 8,
  },
  payOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  payIcon: { fontSize: 20 },
  payLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  payLabelActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  summary: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sumValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium },
  totalRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.bold },
  totalValue: { fontSize: FontSize.xl, color: Colors.primary, fontWeight: FontWeight.extrabold },
  earnNote: { fontSize: FontSize.xs, color: Colors.gold, textAlign: 'right', marginTop: 4 },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  checkoutTotal: { fontSize: FontSize.xl, color: Colors.text, fontWeight: FontWeight.extrabold },
  checkoutItems: { fontSize: FontSize.xs, color: Colors.textSecondary },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    gap: 8,
  },
  checkoutBtnText: { fontSize: FontSize.md, color: Colors.background, fontWeight: FontWeight.bold },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  emptyIcon: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, color: Colors.text, fontWeight: FontWeight.bold },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 6 },
});
