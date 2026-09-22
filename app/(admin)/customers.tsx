// Powered by OnSpace.AI
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  TextInput, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Customer } from '@/constants/mockData';
import { getCustomers, addRewardPoints } from '@/services/rewardService';
import { useAlert } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [pointsInput, setPointsInput] = useState<{ [id: string]: string }>({});
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getCustomers();
    setCustomers(data);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAddPoints = async (customer: Customer) => {
    const pts = parseInt(pointsInput[customer.id] ?? '0', 10);
    if (!pts || pts <= 0) {
      showAlert('Invalid Points', 'Enter a positive number of points to add.');
      return;
    }
    showAlert(
      'Add Reward Points',
      `Add ${pts} points to ${customer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Points', onPress: async () => {
            await addRewardPoints(customer.id, pts);
            setPointsInput(prev => ({ ...prev, [customer.id]: '' }));
            load();
            showAlert('Points Added', `${pts} reward points added to ${customer.name}.`);
          }
        },
      ]
    );
  };

  const filtered = customers.filter(c =>
    !query.trim() ||
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query) ||
    c.memberId.toLowerCase().includes(query.toLowerCase())
  );

  const renderItem = ({ item }: { item: Customer }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerPhone}>📞 +91 {item.phone}</Text>
          <Text style={styles.memberId}>{item.memberId}</Text>
        </View>
        <View style={styles.statsRight}>
          <View style={styles.pointsBadge}>
            <MaterialIcons name="stars" size={12} color={Colors.gold} />
            <Text style={styles.pointsNum}> {item.rewardPoints}</Text>
          </View>
          <Text style={styles.ordersCount}>{item.totalOrders} orders</Text>
          <Text style={styles.joinDate}>Since {item.joinedAt.slice(0, 7)}</Text>
        </View>
      </View>

      {/* Add Points */}
      <View style={styles.addPointsRow}>
        <TextInput
          style={styles.pointsInput}
          value={pointsInput[item.id] ?? ''}
          onChangeText={v => setPointsInput(prev => ({ ...prev, [item.id]: v.replace(/\D/g, '') }))}
          placeholder="Points to add..."
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
        />
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
          onPress={() => handleAddPoints(item)}
        >
          <MaterialIcons name="add" size={16} color={Colors.background} />
          <Text style={styles.addBtnText}>Add Points</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.count}>{customers.length} members</Text>
      </View>

      <View style={styles.searchRow}>
        <MaterialIcons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, phone, member ID..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.secondary} style={{ flex: 1 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>No customers found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  title: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold },
  count: { fontSize: FontSize.sm, color: Colors.textSecondary },
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
    marginBottom: Spacing.md,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarText: { fontSize: FontSize.xl, color: Colors.primary, fontWeight: FontWeight.bold },
  customerInfo: { flex: 1 },
  customerName: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.bold },
  customerPhone: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  memberId: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium, marginTop: 2 },
  statsRight: { alignItems: 'flex-end', gap: 3 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pointsNum: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.bold },
  ordersCount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  joinDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  addPointsRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  pointsInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 4,
  },
  addBtnText: { fontSize: FontSize.sm, color: Colors.background, fontWeight: FontWeight.bold },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary },
});
