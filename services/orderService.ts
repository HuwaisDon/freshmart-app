// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '@/constants/mockData';
import { deductStockForOrder, getProductByBarcode, getProducts } from './productService';
import {
  addRewardPoints,
  ensureCustomer,
  getCustomerById,
  updateCustomerOrders,
} from './rewardService';
import { AuthUser } from './authService';

const ORDERS_KEY = '@selfbill_orders';

export type CreateOrderResult = {
  order: Order;
  rewardPointsEarned: number;
};

const createPickupCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';

  // Use Web Crypto when available.
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.getRandomValues) {
    const values = new Uint32Array(8);
    cryptoApi.getRandomValues(values);

    for (let i = 0; i < values.length; i++) {
      result += chars[values[i] % chars.length];
    }

    return result;
  }

  // Demo fallback for native environments without Web Crypto.
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
};

export const generateOrderId = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${ts}-${random}`;
};

/**
 * Pickup QR payload intentionally contains only the pickup identifier.
 * It does not contain customer data, payment information or credentials.
 */
export const generateQRCode = (pickupCode: string): string => {
  return `FRESHMART:${pickupCode}`;
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const data = await AsyncStorage.getItem(ORDERS_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeOrder);
  } catch {
    return [];
  }
};

const normalizeOrder = (raw: Order): Order => {
  const isPickup =
    raw.fulfillmentMethod === 'pickup' ||
    raw.paymentMethod === 'pickup' ||
    raw.paymentMethod === 'pay_on_pickup';

  const paymentMethod =
    raw.paymentMethod === 'pickup'
      ? 'pay_on_pickup'
      : raw.paymentMethod;

  let paymentStatus = raw.paymentStatus;

  // Legacy "verified" means payment was already confirmed.
  if (paymentStatus === 'verified') {
    paymentStatus = 'paid';
  }

  return {
    ...raw,
    paymentMethod,
    fulfillmentMethod:
      raw.fulfillmentMethod ?? (isPickup ? 'pickup' : 'self_checkout'),
    pickupStatus:
      raw.pickupStatus ??
      (isPickup
        ? raw.collectedAt
          ? 'completed'
          : 'pending'
        : 'not_required'),
    pickupCode:
      raw.pickupCode ??
      (isPickup ? createPickupCode() : undefined),
    paymentConfirmedAt:
      raw.paymentConfirmedAt ??
      (paymentStatus === 'paid' ? raw.collectedAt : undefined),
  };
};

const saveOrders = async (orders: Order[]): Promise<void> => {
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const getCustomerOrders = async (
  customerId: string
): Promise<Order[]> => {
  const all = await getOrders();
  return all.filter(order => order.customerId === customerId);
};

export const getAllOrders = async (): Promise<Order[]> => {
  return getOrders();
};

/**
 * Calculates rewards according to the existing project rule:
 * 5 points per ₹100 spent.
 */
const calculateEarnedPoints = (total: number): number => {
  return Math.floor((total / 100) * 5);
};

const validateOrderStock = async (order: Order): Promise<void> => {
  const products = await getProducts();

  for (const item of order.items) {
    const product = products.find(p => p.id === item.productId);

    if (!product) {
      throw new Error(`Product not found: ${item.productName}`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Invalid quantity for ${item.productName}.`);
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${item.productName}. Available: ${product.stock}, requested: ${item.quantity}.`
      );
    }
  }
};

const deductOrderStock = async (order: Order): Promise<void> => {
  for (const item of order.items) {
    await deductStockForOrder(
      item.productId,
      item.quantity,
      order.id
    );
  }
};

const applyRewardsOnce = async (order: Order): Promise<Order> => {
  if (order.rewardsAppliedAt) {
    return order;
  }

  const points = calculateEarnedPoints(order.total);

  await ensureCustomer({
    id: order.customerId,
    name: order.customerName,
    phone: '',
    memberId: `MBR-${order.customerId}`,
  });

  if (points > 0) {
    await addRewardPoints(order.customerId, points);
  }

  if (!order.customerOrderCountedAt) {
    await updateCustomerOrders(order.customerId);
  }

  return {
    ...order,
    rewardsAppliedAt: new Date().toISOString(),
    customerOrderCountedAt:
      order.customerOrderCountedAt ?? new Date().toISOString(),
  };
};

/**
 * Creates an order and performs the appropriate stock/payment/reward
 * transitions for the selected checkout flow.
 */
export const createOrder = async (
  input: Order
): Promise<CreateOrderResult> => {
  const existing = await getOrders();

  if (existing.some(order => order.id === input.id)) {
    throw new Error(`Order ${input.id} already exists.`);
  }

  const isPickup = input.fulfillmentMethod === 'pickup';
  const isPayOnPickup = input.paymentMethod === 'pay_on_pickup';

  const order: Order = {
    ...input,
    fulfillmentMethod:
      input.fulfillmentMethod ??
      (isPickup ? 'pickup' : 'self_checkout'),
    pickupStatus:
      isPickup ? 'pending' : 'not_required',
    pickupCode: isPickup ? createPickupCode() : undefined,
    qrCode: undefined,
    paymentStatus:
      isPayOnPickup ? 'pending' : 'paid',
  };

  // Keep QR and pickup code identical.
  if (isPickup) {
    const pickupCode = order.pickupCode!;
    order.qrCode = generateQRCode(pickupCode);
  }

  /*
   * Self checkout and online payment deduct stock immediately.
   *
   * Pay on Pickup intentionally does NOT deduct stock here.
   * Stock is rechecked and deducted when staff confirms payment.
   */
  if (!isPayOnPickup) {
    await validateOrderStock(order);
    await deductOrderStock(order);

    order.stockDeductedAt = new Date().toISOString();
  }

  let finalOrder = order;
  let rewardPointsEarned = 0;

  /*
   * Self checkout / online payment is considered paid in this
   * local prototype, so rewards are applied immediately.
   */
  if (!isPayOnPickup) {
    finalOrder = await applyRewardsOnce(order);
    rewardPointsEarned = calculateEarnedPoints(order.total);
  }

  await saveOrders([finalOrder, ...existing]);

  return {
    order: finalOrder,
    rewardPointsEarned,
  };
};

export const findOrderByPickupCode = async (
  value: string
): Promise<Order | null> => {
  const input = value.trim();

  if (!input) {
    return null;
  }

  const orders = await getOrders();

  return (
    orders.find(order => {
      if (order.id === input) return true;
      if (order.pickupCode === input) return true;
      if (order.qrCode === input) return true;

      if (order.qrCode?.startsWith('FRESHMART:')) {
        return order.qrCode.slice('FRESHMART:'.length) === input;
      }

      return false;
    }) ?? null
  );
};

/**
 * Staff confirms payment for a Pay-on-Pickup order.
 *
 * Important:
 * - Payment must still be pending.
 * - Stock is checked again at this point.
 * - Stock is deducted only once.
 * - Rewards are applied only once.
 */
export const confirmPayOnPickup = async (
  orderId: string,
  staff: AuthUser
): Promise<Order> => {
  if (staff.role !== 'admin' && staff.role !== 'staff') {
    throw new Error('Only staff or admin can confirm payment.');
  }

  const orders = await getOrders();
  const index = orders.findIndex(order => order.id === orderId);

  if (index === -1) {
    throw new Error('Order not found.');
  }

  const current = orders[index];

  if (current.paymentMethod !== 'pay_on_pickup') {
    throw new Error('This order is not a Pay on Pickup order.');
  }

  if (current.paymentStatus === 'paid') {
    return current;
  }

  if (current.paymentStatus !== 'pending') {
    throw new Error('Order is not awaiting payment.');
  }

  if (current.stockDeductedAt) {
    throw new Error('Order stock has already been deducted.');
  }

  // Re-check current inventory.
  await validateOrderStock(current);

  // Deduct exactly once.
  await deductOrderStock(current);

  let updated: Order = {
    ...current,
    paymentStatus: 'paid',
    paymentConfirmedAt: new Date().toISOString(),
    paymentConfirmedBy: staff.id,
    stockDeductedAt: new Date().toISOString(),
  };

  updated = await applyRewardsOnce(updated);

  orders[index] = updated;
  await saveOrders(orders);

  return updated;
};

/**
 * Completes pickup after the order has been paid.
 */
export const completePickup = async (
  orderId: string,
  staff: AuthUser
): Promise<Order> => {
  if (staff.role !== 'admin' && staff.role !== 'staff') {
    throw new Error('Only staff or admin can complete pickup.');
  }

  const orders = await getOrders();
  const index = orders.findIndex(order => order.id === orderId);

  if (index === -1) {
    throw new Error('Order not found.');
  }

  const current = orders[index];

  if (current.pickupStatus === 'completed') {
    return current;
  }

  if (current.fulfillmentMethod !== 'pickup') {
    throw new Error('This order does not require pickup.');
  }

  if (current.paymentStatus !== 'paid') {
    throw new Error('Payment must be confirmed before pickup.');
  }

  const updated: Order = {
    ...current,
    pickupStatus: 'completed',
    pickupCompletedAt: new Date().toISOString(),
    pickupCompletedBy: staff.id,
    collectedAt: new Date().toISOString(),
  };

  orders[index] = updated;
  await saveOrders(orders);

  return updated;
};

/**
 * Compatibility wrapper for old UI code.
 */
export const verifyOrder = async (
  orderId: string,
  staff?: AuthUser
): Promise<Order | null> => {
  if (!staff) {
    const fallback: AuthUser = {
      id: 'system',
      name: 'System',
      phone: '',
      role: 'staff',
    };

    staff = fallback;
  }

  const found = await findOrderByPickupCode(orderId);

  if (!found) {
    return null;
  }

  if (found.paymentMethod === 'pay_on_pickup' && found.paymentStatus === 'pending') {
    return confirmPayOnPickup(found.id, staff);
  }

  if (
    found.fulfillmentMethod === 'pickup' &&
    found.paymentStatus === 'paid'
  ) {
    return completePickup(found.id, staff);
  }

  return found;
};