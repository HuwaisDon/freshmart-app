// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Product } from '@/constants/mockData';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { StockBadge } from './StockBadge';

interface Props {
  product: Product;
  onAdd?: (product: Product) => void;
  cartQty?: number;
  onIncrease?: (product: Product) => void;
  onDecrease?: (productId: string) => void;
  showStorageBadge?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  onAdd,
  cartQty = 0,
  onIncrease,
  onDecrease,
  showStorageBadge,
}: Props) {
  const displayPrice = product.discountedPrice ?? product.price;
  const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100)
    : 0;

  return (
    <View style={styles.card}>
      {showStorageBadge && product.isStorage ? (
        <View style={styles.storageTag}>
          <MaterialIcons name="ac-unit" size={10} color={Colors.info} />
          <Text style={styles.storageText}> Chilled</Text>
        </View>
      ) : null}
      {hasDiscount ? (
        <View style={styles.discountTag}>
          <Text style={styles.discountText}>{discountPct}% OFF</Text>
        </View>
      ) : null}

      <Image
        source={{ uri: product.image }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.body}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.unit}>{product.unit}</Text>

        <StockBadge stock={product.stock} unit={product.unit} />

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>₹{displayPrice}</Text>
            {hasDiscount ? (
              <Text style={styles.originalPrice}>₹{product.price}</Text>
            ) : null}
          </View>

          {product.stock > 0 ? (
            cartQty > 0 ? (
              <View style={styles.qtyControl}>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => onDecrease?.(product.id)}
                  hitSlop={8}
                >
                  <MaterialIcons name="remove" size={16} color={Colors.text} />
                </Pressable>
                <Text style={styles.qtyText}>{cartQty}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => onIncrease?.(product)}
                  hitSlop={8}
                >
                  <MaterialIcons name="add" size={16} color={Colors.text} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.addBtn}
                onPress={() => onAdd?.(product)}
              >
                <MaterialIcons name="add" size={18} color={Colors.background} />
              </Pressable>
            )
          ) : null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    flex: 1,
    margin: 4,
  },
  storageTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.infoMuted,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  storageText: { fontSize: FontSize.xs, color: Colors.info, fontWeight: FontWeight.medium },
  discountTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.secondary,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  discountText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.bold },
  image: { width: '100%', aspectRatio: 1, backgroundColor: Colors.surface },
  body: { padding: Spacing.sm },
  category: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium, marginBottom: 2 },
  name: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.semibold, lineHeight: 18, marginBottom: 2 },
  unit: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 6 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  price: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.bold },
  originalPrice: { fontSize: FontSize.xs, color: Colors.textMuted, textDecorationLine: 'line-through' },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.bold, minWidth: 20, textAlign: 'center' },
});
