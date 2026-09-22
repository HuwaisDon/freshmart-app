// Powered by OnSpace.AI
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Order } from '@/constants/mockData';
import { getCustomerOrders } from '@/services/orderService';
import { useAuth } from '@/hooks/useAuth';
import { OrderQRCard } from '@/components/ui/OrderQRCard';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        if (user) {
          const data = await getCustomerOrders(user.id);
          setOrders(data);
        }
        setLoading(false);
      };
      load();
    }, [user])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>My Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <OrderQRCard order={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, color: Colors.text, fontWeight: FontWeight.bold },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 6 },
});
