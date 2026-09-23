// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_CUSTOMERS, Customer } from '@/constants/mockData';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin' | 'staff';
  memberId?: string;
  rewardPoints?: number;
}

const ADMIN_PHONES = ['0000000000', '9999999999'];
const STAFF_PHONES = ['8888888888'];
const DEMO_STAFF_ACCOUNTS = [
  {
    id: 'admin_demo',
    name: 'FreshMart Admin',
    phone: '0000000000',
    email: 'admin@freshmart.demo',
    password: 'FreshMartAdmin123',
    role: 'admin' as const,
  },
  {
    id: 'admin_demo_2',
    name: 'FreshMart Admin',
    phone: '9999999999',
    email: 'admin2@freshmart.demo',
    password: 'FreshMartAdmin123',
    role: 'admin' as const,
  },
  {
    id: 'staff_demo',
    name: 'FreshMart Staff',
    phone: '8888888888',
    email: 'staff@freshmart.demo',
    password: 'FreshMartStaff123',
    role: 'staff' as const,
  },
];
const AUTH_KEY = '@selfbill_auth';

// Simulated OTP (always 1234 in mock)
export const sendOTP = async (phone: string): Promise<{ success: boolean; message: string }> => {
  await new Promise(r => setTimeout(r, 1200));
  return { success: true, message: 'OTP sent to ' + phone };
};

export const verifyOTP = async (
  phone: string,
  otp: string
): Promise<{ success: boolean; user?: AuthUser; message: string }> => {
  await new Promise(r => setTimeout(r, 1000));

  if (otp !== '1234') {
    return { success: false, message: 'Invalid OTP. Use 1234 for demo.' };
  }

  const existing = MOCK_CUSTOMERS.find(c => c.phone === phone);
  const user: AuthUser = {
    id: existing?.id ?? 'c_' + phone,
    name: existing?.name ?? 'Customer ' + phone.slice(-4),
    phone,
    role: 'customer',
    memberId: existing?.memberId ?? 'MBR' + phone.slice(-5),
    rewardPoints: existing?.rewardPoints ?? 0,
  };

  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return { success: true, user, message: 'Login successful' };
};

/** Local prototype only: credentials are intentionally not production security. */
export const signInStaff = async (identifier: string, password: string): Promise<{ success: boolean; user?: AuthUser; message: string }> => {
  await new Promise(r => setTimeout(r, 500));
  const normalized = identifier.trim().toLowerCase();
  const account = DEMO_STAFF_ACCOUNTS.find(a =>
    (a.email === normalized || a.phone === identifier.trim()) && a.password === password
  );
  if (!account) return { success: false, message: 'Invalid demo staff credentials.' };
  const user: AuthUser = { id: account.id, name: account.name, phone: account.phone, role: account.role };
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return { success: true, user, message: 'Staff login successful' };
};

export const isStaffUser = (user: AuthUser | null | undefined): boolean =>
  user?.role === 'admin' || user?.role === 'staff';

export const getStoredAuth = async (): Promise<AuthUser | null> => {
  try {
    const data = await AsyncStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_KEY);
};

export const updateStoredRewardPoints = async (points: number): Promise<void> => {
  const data = await AsyncStorage.getItem(AUTH_KEY);
  if (data) {
    const user = JSON.parse(data);
    user.rewardPoints = points;
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
};
