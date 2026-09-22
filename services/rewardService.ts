// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_CUSTOMERS, Customer } from '@/constants/mockData';

const CUSTOMERS_KEY = '@selfbill_customers';

export const initCustomers = async (): Promise<void> => {
  const existing = await AsyncStorage.getItem(CUSTOMERS_KEY);
  if (!existing) {
    await AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify(MOCK_CUSTOMERS));
  }
};

export const getCustomers = async (): Promise<Customer[]> => {
  await initCustomers();
  const data = await AsyncStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : MOCK_CUSTOMERS;
};

export const ensureCustomer = async (customer: Pick<Customer, 'id' | 'name' | 'phone' | 'memberId'>): Promise<Customer> => {
  const all = await getCustomers();
  const found = all.find(c => c.id === customer.id);
  if (found) return found;
  const created: Customer = { ...customer, rewardPoints: 0, totalOrders: 0, joinedAt: new Date().toISOString() };
  await AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify([...all, created]));
  return created;
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const all = await getCustomers();
  return all.find(c => c.id === id) ?? null;
};

export const getCustomerByPhone = async (phone: string): Promise<Customer | null> => {
  const all = await getCustomers();
  return all.find(c => c.phone === phone) ?? null;
};

export const addRewardPoints = async (customerId: string, points: number): Promise<Customer | null> => {
  const all = await getCustomers();
  const idx = all.findIndex(c => c.id === customerId);
  if (idx === -1) return null;
  all[idx].rewardPoints = (all[idx].rewardPoints ?? 0) + points;
  await AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify(all));
  return all[idx];
};

export const deductRewardPoints = async (customerId: string, points: number): Promise<Customer | null> => {
  const all = await getCustomers();
  const idx = all.findIndex(c => c.id === customerId);
  if (idx === -1) return null;
  all[idx].rewardPoints = Math.max(0, (all[idx].rewardPoints ?? 0) - points);
  await AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify(all));
  return all[idx];
};

export const updateCustomerOrders = async (customerId: string): Promise<void> => {
  const all = await getCustomers();
  const idx = all.findIndex(c => c.id === customerId);
  if (idx >= 0) {
    all[idx].totalOrders = (all[idx].totalOrders ?? 0) + 1;
    await AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify(all));
  }
};

// 1 reward point = ₹1 discount
export const POINTS_TO_RUPEE = 1;
export const EARN_RATE = 5; // 5 points per ₹100 spent
