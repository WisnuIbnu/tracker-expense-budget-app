// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// db
export const firestore = getFirestore(app);
