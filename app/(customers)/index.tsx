// Powered by OnSpace.AI
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Pressable, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Product } from '@/constants/mockData';
import { getProducts, searchProducts } from '@/services/productService';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

const CATEGORIES = ['All', 'Dairy', 'Grains', 'Pulses', 'Oils', 'Fruits', 'Bakery', 'Beverages', 'Snacks'];

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToCart, updateQuantity, items } = useCart();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setFiltered(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const filter = async () => {
      let data = products;
      if (query.trim()) {
        data = await searchProducts(query);
      }
      if (category !== 'All') {
        data = data.filter(p => p.category === category);
      }
      setFiltered(data);
    };
    filter();
  }, [query, category, products]);

  const getCartQty = (productId: string) => {
    const item = items.find(i => i.product.id === productId);
    return item?.quantity ?? 0;
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={{ flex: 1, maxWidth: '50%' }}>
      <ProductCard
        product={item}
        onAdd={addToCart}
        cartQty={getCartQty(item.id)}
        onIncrease={addToCart}
        onDecrease={id => {
          const qty = getCartQty(id);
          updateQuantity(id, qty - 1);
        }}
        showStorageBadge
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.headerTitle}>What are you shopping today?</Text>
        </View>
        <View style={styles.pointsBadge}>
          <MaterialIcons name="stars" size={14} color="#FFD700" />
          <Text style={styles.pointsText}> {user?.rewardPoints ?? 0} pts</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search products..."
            placeholderTextColor={Colors.textMuted}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')}>
              <MaterialIcons name="close" size={18} color={Colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.catWrapper}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catContent}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.catChip, category === item && styles.catChipActive]}
              onPress={() => setCategory(item)}
            >
              <Text style={[styles.catText, category === item && styles.catTextActive]}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 0 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  headerTitle: { fontSize: FontSize.xl, color: Colors.text, fontWeight: FontWeight.bold, marginTop: 2 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  pointsText: { fontSize: FontSize.sm, color: '#FFD700', fontWeight: FontWeight.semibold },
  searchRow: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  catWrapper: { height: 52 },
  catContent: { paddingHorizontal: Spacing.md, alignItems: 'center', gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  catTextActive: { color: Colors.background, fontWeight: FontWeight.bold },
  list: { paddingHorizontal: Spacing.sm, paddingBottom: 90 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary },
});
