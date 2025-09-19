import { AuthProvider } from '@/contexts/authContext';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({})