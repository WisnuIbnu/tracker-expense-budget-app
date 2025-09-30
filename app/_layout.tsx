import { AuthProvider } from '@/contexts/authContext';
import { registerBackgroundExpenseCheck } from '@/services/backgroundTaskService';
import { requestNotificationPermission } from '@/services/notificationService';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

const StackLayout = () => {
  return (
     <Stack screenOptions={{ headerShown: false }} >
      <Stack.Screen 
        name='(modals)/profileModal'
        options={{ 
          presentation: 'modal',
         }}
      />
      <Stack.Screen 
        name='(modals)/walletModal'
        options={{ 
          presentation: 'modal',
         }}
      />
      <Stack.Screen 
        name='(modals)/transactionModal'
        options={{ 
          presentation: 'modal',
         }}
      />
      <Stack.Screen 
        name='(modals)/searchModal'
        options={{ 
          presentation: 'modal',
         }}
      />
      <Stack.Screen 
        name='(modals)/setExpenseLimits'
        options={{ 
          presentation: 'modal',
         }}
      />
      <Stack.Screen 
        name='(modals)/privacyModal'
        options={{ 
          presentation: 'modal',
         }}
      />
      </Stack>
  )
}

export default function RootLayout() {

 useEffect(() => {
  requestNotificationPermission();
  registerBackgroundExpenseCheck();
 }, [])

  return (
    <AuthProvider>
     <StackLayout />
    </AuthProvider>
  );
}
