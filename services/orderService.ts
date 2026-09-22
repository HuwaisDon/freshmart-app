// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderItem } from '@/constants/mockData';

const ORDERS_KEY = '@selfbill_orders';

export const generateOrderId = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  return 'ORD-' + ts;
};

export const generateQRCode = (orderId: string, customerId: string, total: number): string => {
  return `${orderId}|${customerId}|${total}|${Date.now()}`;
};

export const createOrder = async (order: Order): Promise<Order> => {
  const existing = await getOrders();
  const updated = [order, ...existing];
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  return order;
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const data = await AsyncStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  const all = await getOrders();
  return all.filter(o => o.customerId === customerId);
};

export const verifyOrder = async (orderId: string): Promise<Order | null> => {
  const all = await getOrders();
  const idx = all.findIndex(o => o.id === orderId);
  if (idx === -1) return null;
  all[idx].paymentStatus = 'verified';
  all[idx].collectedAt = new Date().toISOString();
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(all));
  return all[idx];
};

export const getAllOrders = async (): Promise<Order[]> => {
  return getOrders();
};
