// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, MOCK_PRODUCTS, StockMovement } from '@/constants/mockData';
import { AuthUser, isStaffUser } from './authService';

const PRODUCTS_KEY = '@selfbill_products';
const STOCK_MOVEMENTS_KEY = '@selfbill_stock_movements';

export const normalizeBarcode = (barcode: string) => barcode.trim().replace(/\s/g, '');

const validateProduct = (product: Product, existing: Product[]) => {
  if (!product.name.trim() || !product.category || !product.unit.trim()) throw new Error('Product name, category and unit are required.');
  if (!Number.isFinite(product.price) || product.price < 0) throw new Error('Price must be a non-negative number.');
  if (product.discountedPrice !== undefined && (!Number.isFinite(product.discountedPrice) || product.discountedPrice < 0 || product.discountedPrice >= product.price)) throw new Error('Offer price must be non-negative and lower than the regular price.');
  if (!Number.isInteger(product.stock) || product.stock < 0) throw new Error('Stock must be a non-negative integer.');
  const barcode = normalizeBarcode(product.barcode);
  if (!barcode) throw new Error('Barcode is required.');
  if (existing.some(p => p.id !== product.id && normalizeBarcode(p.barcode) === barcode)) throw new Error('A product already uses this barcode.');
};

export const initProducts = async (): Promise<void> => {
  const existing = await AsyncStorage.getItem(PRODUCTS_KEY);
  if (!existing) {
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(MOCK_PRODUCTS));
  }
};

export const getProducts = async (): Promise<Product[]> => {
  await initProducts();
  const data = await AsyncStorage.getItem(PRODUCTS_KEY);
  const products: Product[] = data ? JSON.parse(data) : MOCK_PRODUCTS;
  // Storage products at top
  return [...products.filter(p => p.isStorage), ...products.filter(p => !p.isStorage)];
};

export const getOfferProducts = async (): Promise<Product[]> => {
  const all = await getProducts();
  return all.filter(p => p.isOffer && p.discountedPrice !== undefined);
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const all = await getProducts();
  const q = query.toLowerCase();
  return all.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.category.toLowerCase().includes(q)
  );
};

export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  const normalized = normalizeBarcode(barcode);
  if (!normalized) return null;
  const products = await getProducts();
  return products.find(product => normalizeBarcode(product.barcode) === normalized) ?? null;
};

export const saveProduct = async (product: Product): Promise<void> => {
  const all = await getProducts();
  product = { ...product, barcode: normalizeBarcode(product.barcode) };
  validateProduct(product, all);
  const idx = all.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    all[idx] = product;
  } else {
    all.unshift(product);
  }
  await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(all));
};

export const deleteProduct = async (id: string): Promise<void> => {
  const all = await getProducts();
  const updated = all.filter(p => p.id !== id);
  await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
};

const recordMovement = async (movement: StockMovement) => {
  const data = await AsyncStorage.getItem(STOCK_MOVEMENTS_KEY);
  const existing: StockMovement[] = data ? JSON.parse(data) : [];
  await AsyncStorage.setItem(STOCK_MOVEMENTS_KEY, JSON.stringify([movement, ...existing]));
};

const applyStockDelta = async (id: string, delta: number, movement: Omit<StockMovement, 'id' | 'productId' | 'barcode' | 'delta' | 'createdAt'>): Promise<Product> => {
  const all = await getProducts();
  const idx = all.findIndex(p => p.id === id);
  if (idx < 0) throw new Error('Product not found.');
  const nextStock = all[idx].stock + delta;
  if (!Number.isInteger(delta) || nextStock < 0) throw new Error('Insufficient stock.');
  all[idx] = { ...all[idx], stock: nextStock };
  await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(all));
  await recordMovement({ id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, productId: id, barcode: all[idx].barcode, delta, createdAt: new Date().toISOString(), ...movement });
  return all[idx];
};

export const addStockByBarcode = async (
  barcode: string,
  quantity: number,
  actor: AuthUser
): Promise<Product> => {
  if (!isStaffUser(actor)) {
    throw new Error('Only staff can add inventory.');
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Stock quantity must be a positive whole number.');
  }

  const product = await getProductByBarcode(barcode);

  if (!product) {
    throw new Error('No product found for this barcode.');
  }

  return applyStockDelta(product.id, quantity, {
    reason: 'stock_in',
    performedBy: actor.id,
    performedRole: actor.role === 'admin' ? 'admin' : 'staff',
  });
};
export const deductStockForOrder = async (productId: string, quantity: number, orderId: string): Promise<Product> =>
  applyStockDelta(productId, -quantity, { reason: 'order_deduction', performedBy: 'system', performedRole: 'system', orderId });
