import { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "react-native-reanimated";

import { MealsProvider } from "@/contexts/MealsContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/constants/firebaseConfig";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function AuthProtected() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      console.log("[AuthProtected] onAuthStateChanged fired. User:", usr ? usr.email : "null");
      setUser(usr);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log("[AuthProtected] Routing effect triggered:", {
      initializing,
      navigationStateKey: navigationState?.key,
      user: user ? user.email : "null",
      segments,
    });

    if (initializing || !navigationState?.key) {
      console.log("[AuthProtected] Returning early: initializing or navigationState not ready.");
      return;
    }

    const inLoginScreen = segments[0] === "login";
    console.log("[AuthProtected] Evaluation:", { inLoginScreen, userExists: !!user });

    if (!user && !inLoginScreen) {
      console.log("[AuthProtected] Redirecting to /login");
      router.replace("/login");
    } else if (user && inLoginScreen) {
      console.log("[AuthProtected] Redirecting to /");
      router.replace("/");
    } else {
      console.log("[AuthProtected] No redirect needed.");
    }
  }, [user, segments, initializing, router, navigationState?.key]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const initAds = async () => {
      if (Platform.OS === "web") return;
      try {
        const Constants = (await import("expo-constants")).default;
        const { ExecutionEnvironment } = await import("expo-constants");
        const isExpoGo =
          Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

        if (!isExpoGo) {
          const mobileAds = require("react-native-google-mobile-ads").default;
          if (mobileAds) {
            await mobileAds().initialize();
            console.log("Google Mobile Ads initialized successfully.");
          }
        }
      } catch (error) {
        console.warn("Failed to initialize Google Mobile Ads:", error);
      }
    };
    initAds();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <MealsProvider>
        <AuthProtected />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </MealsProvider>
    </ThemeProvider>
  );
}
