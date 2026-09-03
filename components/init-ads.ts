import Constants, { ExecutionEnvironment } from "expo-constants";

export async function initializeAds(): Promise<void> {
  try {
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
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
}
