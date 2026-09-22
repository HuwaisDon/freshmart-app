// Powered by OnSpace.AI
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  unit: string;
  image: string;
  barcode: string;
  expiresAt?: string;
  isOffer: boolean;
  isStorage: boolean;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  memberId: string;
  rewardPoints: number;
  totalOrders: number;
  joinedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  rewardDiscount: number;
  total: number;
  /** Legacy fields are retained so previously stored demo orders still render. */
  paymentMethod: 'upi' | 'pickup' | 'online' | 'pay_on_pickup';
  paymentStatus: 'pending' | 'paid' | 'verified';
  qrCode?: string;
  createdAt: string;
  collectedAt?: string;
  fulfillmentMethod?: 'self_checkout' | 'pickup';
  pickupStatus?: 'not_required' | 'pending' | 'completed';
  pickupCode?: string;
  paymentConfirmedAt?: string;
  paymentConfirmedBy?: string;
  pickupCompletedAt?: string;
  pickupCompletedBy?: string;
  stockDeductedAt?: string;
  rewardsAppliedAt?: string;
  customerOrderCountedAt?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  barcode: string;
  delta: number;
  reason: 'stock_in' | 'order_deduction';
  performedBy: string;
  performedRole: 'admin' | 'staff' | 'system';
  createdAt: string;
  orderId?: string;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Organic Whole Milk',
    category: 'Dairy',
    price: 62,
    stock: 48,
    unit: '500ml',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    barcode: '8901234567890',
    expiresAt: '2026-09-25',
    isOffer: false,
    isStorage: true,
    description: 'Fresh organic whole milk, locally sourced',
  },
  {
    id: 'p2',
    name: 'Amul Butter',
    category: 'Dairy',
    price: 55,
    discountedPrice: 48,
    stock: 32,
    unit: '100g',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
    barcode: '8901056100086',
    expiresAt: '2026-10-15',
    isOffer: true,
    isStorage: true,
    description: 'Pasteurised butter, rich taste',
  },
  {
    id: 'p3',
    name: 'Basmati Rice Premium',
    category: 'Grains',
    price: 180,
    discountedPrice: 155,
    stock: 60,
    unit: '1kg',
    image: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9b8e8?w=400&q=80',
    barcode: '8908002361010',
    isOffer: true,
    isStorage: false,
    description: 'Extra long grain aged basmati rice',
  },
  {
    id: 'p4',
    name: 'Toor Dal',
    category: 'Pulses',
    price: 140,
    stock: 80,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
    barcode: '8906025400107',
    expiresAt: '2027-03-01',
    isOffer: false,
    isStorage: false,
    description: 'Skinned split pigeon peas',
  },
  {
    id: 'p5',
    name: 'Sunflower Oil',
    category: 'Oils',
    price: 220,
    discountedPrice: 195,
    stock: 25,
    unit: '1L',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    barcode: '8901234000055',
    expiresAt: '2027-01-10',
    isOffer: true,
    isStorage: false,
    description: 'Refined sunflower oil for cooking',
  },
  {
    id: 'p6',
    name: 'Fresh Apples',
    category: 'Fruits',
    price: 90,
    stock: 5,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80',
    barcode: '2000000001234',
    expiresAt: '2026-09-22',
    isOffer: false,
    isStorage: false,
    description: 'Fresh red apples, Himachal Pradesh',
  },
  {
    id: 'p7',
    name: 'Yogurt (Curd)',
    category: 'Dairy',
    price: 40,
    stock: 30,
    unit: '400g',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
    barcode: '8901030813834',
    expiresAt: '2026-09-20',
    isOffer: false,
    isStorage: true,
    description: 'Natural probiotic curd, set style',
  },
  {
    id: 'p8',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    price: 45,
    discountedPrice: 38,
    stock: 18,
    unit: '400g',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    barcode: '8901063140027',
    expiresAt: '2026-09-19',
    isOffer: true,
    isStorage: false,
    description: '100% whole wheat, no maida',
  },
  {
    id: 'p9',
    name: 'Green Tea',
    category: 'Beverages',
    price: 120,
    stock: 42,
    unit: '25 bags',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
    barcode: '8906023980015',
    expiresAt: '2027-06-01',
    isOffer: false,
    isStorage: false,
    description: 'Premium green tea, antioxidant rich',
  },
  {
    id: 'p10',
    name: 'Potato Chips',
    category: 'Snacks',
    price: 30,
    discountedPrice: 25,
    stock: 0,
    unit: '90g',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
    barcode: '8901396501329',
    expiresAt: '2026-12-01',
    isOffer: true,
    isStorage: false,
    description: 'Classic salted potato chips',
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Arjun Sharma',
    phone: '9876543210',
    memberId: 'MBR00001',
    rewardPoints: 350,
    totalOrders: 12,
    joinedAt: '2025-01-15',
  },
  {
    id: 'c2',
    name: 'Priya Nair',
    phone: '9123456789',
    memberId: 'MBR00002',
    rewardPoints: 820,
    totalOrders: 28,
    joinedAt: '2024-11-02',
  },
  {
    id: 'c3',
    name: 'Ravi Patel',
    phone: '8765432109',
    memberId: 'MBR00003',
    rewardPoints: 60,
    totalOrders: 3,
    joinedAt: '2026-07-10',
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2026-001',
    customerId: 'c1',
    customerName: 'Arjun Sharma',
    items: [
      { productId: 'p1', productName: 'Organic Whole Milk', quantity: 2, price: 62, total: 124 },
      { productId: 'p3', productName: 'Basmati Rice Premium', quantity: 1, price: 155, total: 155 },
    ],
    subtotal: 279,
    rewardDiscount: 50,
    total: 229,
    paymentMethod: 'upi',
    paymentStatus: 'verified',
    qrCode: 'ORD-2026-001:c1:229:verified',
    createdAt: '2026-09-15T10:30:00Z',
    collectedAt: '2026-09-15T10:45:00Z',
  },
  {
    id: 'ORD-2026-002',
    customerId: 'c1',
    customerName: 'Arjun Sharma',
    items: [
      { productId: 'p8', productName: 'Whole Wheat Bread', quantity: 1, price: 38, total: 38 },
      { productId: 'p7', productName: 'Yogurt (Curd)', quantity: 2, price: 40, total: 80 },
    ],
    subtotal: 118,
    rewardDiscount: 0,
    total: 118,
    paymentMethod: 'pickup',
    paymentStatus: 'paid',
    qrCode: 'ORD-2026-002:c1:118:paid',
    createdAt: '2026-09-17T08:20:00Z',
  },
];
