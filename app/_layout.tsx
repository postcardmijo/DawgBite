import { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { MealsProvider } from "@/contexts/MealsContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const initAds = async () => {
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
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
