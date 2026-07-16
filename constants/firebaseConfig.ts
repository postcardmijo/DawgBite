import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
// @ts-expect-error - getReactNativePersistence is only exported in the React Native version of firebase/auth
import { initializeAuth, getReactNativePersistence, Auth, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase safely (prevent multiple initialization errors)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Initialize Firebase Auth safely with persistence (prevent hot-reloading errors)
let auth: Auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  const globalAuth = (global as any).firebase_auth;
  if (globalAuth) {
    auth = globalAuth;
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    (global as any).firebase_auth = auth;
  }
}

// Named export is important here
export { db, auth };


