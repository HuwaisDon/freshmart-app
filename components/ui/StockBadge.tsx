// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';

interface Props {
  stock: number;
  unit: string;
}

export function StockBadge({ stock, unit }: Props) {
  if (stock === 0) {
    return (
      <View style={[styles.badge, styles.outOfStock]}>
        <Text style={[styles.text, styles.outText]}>Out of Stock</Text>
      </View>
    );
  }
  if (stock <= 5) {
    return (
      <View style={[styles.badge, styles.lowStock]}>
        <Text style={[styles.text, styles.lowText]}>Only {stock} left</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.inStock]}>
      <Text style={[styles.text, styles.inText]}>{stock} {unit} in stock</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  outOfStock: { backgroundColor: Colors.dangerMuted },
  lowStock: { backgroundColor: Colors.secondaryMuted },
  inStock: { backgroundColor: Colors.primaryMuted },
  text: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  outText: { color: Colors.danger },
  lowText: { color: Colors.secondary },
  inText: { color: Colors.primary },
});
