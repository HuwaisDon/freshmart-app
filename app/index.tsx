// Powered by OnSpace.AI
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

export default function Entry() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>🌿 FreshMart</Text>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!user) return <Redirect href="/auth/login" />;

  if (user.role === 'admin' || user.role === 'staff') {
    return <Redirect href="/(admin)" />;
  }

  return <Redirect href="/(customers)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: FontSize.xxxl,
    color: Colors.text,
    fontWeight: FontWeight.extrabold,
  },
});
