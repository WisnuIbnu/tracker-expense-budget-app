import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';

import { firestore } from '@/config/firebase';
import { TransactionType } from '@/types';
import { getCurrentUser } from './authService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }
  return true;
}

const EXPENSE_LIMIT_KEY = "@user_expense_limit";

export async function getExpenseLimit(): Promise<number> {
    try {
        const limit = await AsyncStorage.getItem(EXPENSE_LIMIT_KEY);
        return limit ? Number(limit) : 0;
    } catch (e) {
        console.error("Failed to fetch expense limit:", e);
        return 0;
    }
}

export async function setExpenseLimit(limit: number): Promise<void> {
    try {
        await AsyncStorage.setItem(EXPENSE_LIMIT_KEY, String(limit));
        await checkExpenseLimitAndNotify();
    } catch (e) {
        console.error("Failed to set expense limit:", e);
    }
}

async function triggerLimitNotification(currentExpense: number, limit: number) {
  
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const formattedExpense = formatter.format(currentExpense);
  const formattedLimit = formatter.format(limit);
  
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🚨 Peringatan Batas Pengeluaran Terlampaui!",
      body: `Pengeluaran bulan ini (${formattedExpense}) telah melebihi batas Anda (${formattedLimit}). Saatnya berhemat!`,
      data: { type: 'expense-limit', expense: currentExpense },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 86400,
      repeats: true,
    },
  });
}
export async function checkExpenseLimitAndNotify() {
  const user = getCurrentUser(); 
  if (!user || !user.uid) {
      console.warn('User not authenticated, skipping expense check.');
      return; 
  }

  const expenseLimit = await getExpenseLimit();
  if (expenseLimit <= 0) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return; 
  } 

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  try {
    const transactionQuery = query(
      collection(firestore, 'transactions'),
      where("uid", "==", user.uid), 
      where("type", "==", "expense"), 
      where("date", ">=", Timestamp.fromDate(startOfMonth)),
      where("date", "<=", Timestamp.fromDate(endOfMonth))
    );

    const querySnapshot = await getDocs(transactionQuery);

    const totalMonthlyExpense = querySnapshot.docs.reduce((sum, doc) => {
      const transaction = doc.data() as TransactionType;
      return sum + transaction.amount;
    }, 0);

    if (totalMonthlyExpense > expenseLimit) {
      await triggerLimitNotification(totalMonthlyExpense, expenseLimit);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

  } catch (error) {
    console.error("Error checking expense limit:", error);
  }
}