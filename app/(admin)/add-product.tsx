// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, Switch, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { saveProduct } from '@/services/productService';
import { Product } from '@/constants/mockData';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

const CATEGORIES = ['Dairy', 'Grains', 'Pulses', 'Oils', 'Fruits', 'Vegetables', 'Bakery', 'Beverages', 'Snacks', 'Other'];

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
  icon,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  placeholder: string;
  keyboardType?: any;
  icon?: string;
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>

    <View style={styles.inputRow}>
      {icon ? (
        <MaterialIcons
          name={icon as any}
          size={18}
          color={Colors.textMuted}
          style={styles.inputIcon}
        />
      ) : null}

      <TextInput
        style={[styles.input, icon ? styles.inputWithIcon : null]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);


export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('');
  const [barcode, setBarcode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80');
  const [description, setDescription] = useState('');
  const [isOffer, setIsOffer] = useState(false);
  const [isStorage, setIsStorage] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const validate = () => {
    if (!name.trim()) return 'Product name is required';
    if (!category) return 'Category is required';
    if (!price || isNaN(Number(price))) return 'Valid price is required';
    if (!stock || isNaN(Number(stock))) return 'Valid stock quantity is required';
    if (!unit.trim()) return 'Unit is required (e.g. kg, 500ml)';
    if (!barcode.trim()) return 'Barcode is required';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) { showAlert('Validation Error', error); return; }

    setSaving(true);
    const product: Product = {
      id: 'p_' + Date.now(),
      name: name.trim(),
      category,
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
      stock: Number(stock),
      unit: unit.trim(),
      barcode: barcode.trim(),
      expiresAt: expiresAt.trim() || undefined,
      image,
      isOffer,
      isStorage,
      description: description.trim(),
    };

    await saveProduct(product);
    setSaving(false);
    showAlert('Product Added', `"${product.name}" has been added to inventory.`);
    // Reset form
    setName(''); setCategory(''); setPrice(''); setDiscountedPrice('');
    setStock(''); setUnit(''); setBarcode(''); setExpiresAt('');
    setDescription(''); setIsOffer(false); setIsStorage(false);
  };

  

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Add Product</Text>

        <InputField label="Product Name *" value={name} onChange={setName} placeholder="e.g. Organic Whole Milk" icon="label" />

        {/* Category Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                style={[styles.catChip, category === cat && styles.catChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Price (₹) *</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Offer Price (₹)</Text>
            <TextInput style={styles.input} value={discountedPrice} onChangeText={setDiscountedPrice} placeholder="Optional" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Stock *</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Unit *</Text>
            <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="e.g. kg, 500ml" placeholderTextColor={Colors.textMuted} />
          </View>
        </View>

        <InputField label="Barcode *" value={barcode} onChange={setBarcode} placeholder="Scan or enter barcode" icon="qr-code" keyboardType="numeric" />
        <InputField label="Expiry Date" value={expiresAt} onChange={setExpiresAt} placeholder="YYYY-MM-DD" icon="event" />
        <InputField label="Image URL" value={image} onChange={setImage} placeholder="https://..." icon="image" />
        <InputField label="Description" value={description} onChange={setDescription} placeholder="Product description..." />

        {/* Toggles */}
        <View style={styles.togglesCard}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Mark as Offer/Discounted</Text>
              <Text style={styles.toggleSub}>Shows in Offers section</Text>
            </View>
            <Switch
              value={isOffer}
              onValueChange={setIsOffer}
              trackColor={{ false: Colors.border, true: Colors.secondary }}
              thumbColor={Colors.text}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Chilled/Storage Product</Text>
              <Text style={styles.toggleSub}>Listed at top, shown with cold indicator</Text>
            </View>
            <Switch
              value={isStorage}
              onValueChange={setIsStorage}
              trackColor={{ false: Colors.border, true: Colors.info }}
              thumbColor={Colors.text}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <>
              <MaterialIcons name="check" size={22} color={Colors.background} />
              <Text style={styles.saveBtnText}>Save Product</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.md },
  title: { fontSize: FontSize.xxl, color: Colors.text, fontWeight: FontWeight.bold, marginBottom: Spacing.lg },
  field: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium, marginBottom: 6 },
  inputRow: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, top: 12, zIndex: 1 },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  inputWithIcon: { paddingLeft: 40 },
  row: { flexDirection: 'row', gap: Spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  catTextActive: { color: Colors.background, fontWeight: FontWeight.bold },
  togglesCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.medium },
  toggleSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnText: { fontSize: FontSize.lg, color: Colors.background, fontWeight: FontWeight.bold },
});
