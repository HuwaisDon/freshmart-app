// Powered by OnSpace.AI
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Pressable, ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Product } from '@/constants/mockData';
import { getProducts, searchProducts, deleteProduct } from '@/services/productService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { StockBadge } from '@/components/ui/StockBadge';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) { setSearchResults([]); return; }
    const results = await searchProducts(text);
    setSearchResults(results);
  };

  const handleDelete = (product: Product) => {
    showAlert('Delete Product', `Remove "${product.name}" from inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteProduct(product.id);
          load();
        }
      },
    ]);
  };

  const displayed = query.trim() ? searchResults : products;
  const storageCount = products.filter(p => p.isStorage).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const renderItem = ({ item }: { item: Product }) => {
    const isExpiringSoon = item.expiresAt
      ? new Date(item.expiresAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
      : false;

    return (
      <View style={[styles.row, item.isStorage && styles.storageRow]}>
        <Image
          source={{ uri: item.image }}
          style={styles.thumb}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.rowInfo}>
          <View style={styles.rowTop}>
            <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
            {item.isStorage ? (
              <View style={styles.storagePill}>
                <MaterialIcons name="ac-unit" size={10} color={Colors.info} />
                <Text style={styles.storagePillText}> Cold</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.rowCategory}>{item.category} · {item.unit}</Text>
          <Text style={styles.rowBarcode}>📦 {item.barcode}</Text>
          {item.expiresAt ? (
            <Text style={[styles.rowExpiry, isExpiringSoon && styles.rowExpiryWarn]}>
              {isExpiringSoon ? '⚠️ ' : ''}Exp: {item.expiresAt}
            </Text>
          ) : null}
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowPrice}>₹{item.discountedPrice ?? item.price}</Text>
          <StockBadge stock={item.stock} unit={item.unit} />
          <Pressable
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
            hitSlop={8}
          >
            <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.role}>{user?.role?.toUpperCase()} PANEL</Text>
          <Text style={styles.title}>Inventory</Text>
        </View>
        <Text style={styles.total}>{products.length} products</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <MaterialIcons name="ac-unit" size={16} color={Colors.info} />
          <Text style={styles.statNum}>{storageCount}</Text>
          <Text style={styles.statLabel}>Chilled</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="warning" size={16} color={Colors.secondary} />
          <Text style={styles.statNum}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="remove-shopping-cart" size={16} color={Colors.danger} />
          <Text style={styles.statNum}>{outOfStockCount}</Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="local-offer" size={16} color={Colors.primary} />
          <Text style={styles.statNum}>{products.filter(p => p.isOffer).length}</Text>
          <Text style={styles.statLabel}>On Offer</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <MaterialIcons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder="Search by name, barcode, category..."
          placeholderTextColor={Colors.textMuted}
        />
        {query ? (
          <Pressable onPress={() => handleSearch('')}>
            <MaterialIcons name="close" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : (
          <MaterialIcons name="qr-code" size={18} color={Colors.textMuted} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.secondary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            query.trim() ? (
              <Text style={styles.resultCount}>{searchResults.length} results for "{query}"</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  role: { fontSize: FontSize.xs, color: Colors.secondary, fontWeight: FontWeight.bold, letterSpacing: 2 },
  title: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold },
  total: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 8,
    alignItems: 'center',
    gap: 3,
  },
  statNum: { fontSize: FontSize.lg, color: Colors.text, fontWeight: FontWeight.bold },
  statLabel: { fontSize: 9, color: Colors.textSecondary, textAlign: 'center' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  resultCount: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  row: {
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
  storageRow: { borderLeftWidth: 3, borderLeftColor: Colors.info },
  thumb: { width: 56, height: 56, borderRadius: Radius.md, backgroundColor: Colors.surface },
  rowInfo: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  rowName: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.semibold, flex: 1 },
  storagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoMuted,
    borderRadius: Radius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  storagePillText: { fontSize: 9, color: Colors.info, fontWeight: FontWeight.medium },
  rowCategory: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 1 },
  rowBarcode: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 1 },
  rowExpiry: { fontSize: FontSize.xs, color: Colors.textMuted },
  rowExpiryWarn: { color: Colors.danger, fontWeight: FontWeight.semibold },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  rowPrice: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.bold },
  deleteBtn: { padding: 4, marginTop: 4 },
});
