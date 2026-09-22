// Powered by OnSpace.AI
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Product } from '@/constants/mockData';
import { getOfferProducts } from '@/services/productService';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

export default function OffersScreen() {
  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, updateQuantity, items } = useCart();
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getOfferProducts();
    setOffers(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const getCartQty = (productId: string) => {
    return items.find(i => i.product.id === productId)?.quantity ?? 0;
  };

  const totalSavings = offers.reduce((acc, p) => {
    if (p.discountedPrice) return acc + (p.price - p.discountedPrice);
    return acc;
  }, 0);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={{ flex: 1, maxWidth: '50%' }}>
      <ProductCard
        product={item}
        onAdd={addToCart}
        cartQty={getCartQty(item.id)}
        onIncrease={addToCart}
        onDecrease={id => updateQuantity(id, getCartQty(id) - 1)}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Offers</Text>
        <Text style={styles.count}>{offers.length} deals</Text>
      </View>

      <LinearGradient
        colors={[Colors.secondary + '22', Colors.secondary + '08']}
        style={styles.banner}
      >
        <MaterialIcons name="local-fire-department" size={28} color={Colors.secondary} />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Save Big Today!</Text>
          <Text style={styles.bannerSub}>Up to ₹{totalSavings} in savings across {offers.length} products</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      ) : offers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎁</Text>
          <Text style={styles.emptyText}>No active offers right now</Text>
          <Text style={styles.emptySubtext}>Check back soon for deals!</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          numColumns={2}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold },
  count: { fontSize: FontSize.sm, color: Colors.secondary, fontWeight: FontWeight.semibold },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
    gap: Spacing.md,
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: FontSize.lg, color: Colors.secondary, fontWeight: FontWeight.bold },
  bannerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: Spacing.sm, paddingBottom: 90 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 56, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, color: Colors.text, fontWeight: FontWeight.semibold },
  emptySubtext: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 6 },
});
