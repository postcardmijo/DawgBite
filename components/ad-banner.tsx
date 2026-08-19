import React, { useState } from 'react';
import { StyleSheet, View, Text, useColorScheme, Platform, Pressable } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Try to load the real mobile ads package
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
let isNativeAdsSupported = false;

// Check if we are running in Expo Go or standard client
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (Platform.OS !== 'web' && !isExpoGo) {
  try {
    const GoogleMobileAds = require('react-native-google-mobile-ads');
    BannerAd = GoogleMobileAds.BannerAd;
    BannerAdSize = GoogleMobileAds.BannerAdSize;
    TestIds = GoogleMobileAds.TestIds;
    isNativeAdsSupported = !!BannerAd;
  } catch (error) {
    console.warn('Google Mobile Ads could not be loaded dynamically:', error);
  }
}

// Banner Ad Unit IDs (use test IDs in development)
// The package TestIds.BANNER automatically maps to the correct iOS/Android test banner ID
const AD_UNIT_ID = __DEV__
  ? (TestIds?.BANNER || 'ca-app-pub-3940256099942544/6300978111')
  : Platform.select({
      ios: 'ca-app-pub-3940256099942544/2934735716', // Fallback to test ID if production ID is not provided
      android: 'ca-app-pub-3940256099942544/6300978111',
    });

export function AdBanner() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const [hasError, setHasError] = useState(false);

  // If native ads are supported and there is no loading error, render the Google BannerAd
  if (isNativeAdsSupported && !hasError && BannerAd && BannerAdSize) {
    return (
      <View style={styles.adContainer}>
        <BannerAd
          unitId={AD_UNIT_ID}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error: any) => {
            console.warn('Ad failed to load: ', error);
            setHasError(true);
          }}
        />
      </View>
    );
  }

  // Fallback / Premium Mock Ad UI when running in Expo Go or if Ad loading fails
  return (
    <View style={[styles.fallbackContainer, isDark ? styles.darkFallback : styles.lightFallback]}>
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>SPONSORED</Text>
      </View>
      <Pressable style={styles.mockContent} onPress={() => {}}>
        <Text style={[styles.mockTitle, isDark ? styles.darkText : styles.lightText]}>
          Fresh UGA Dining Meal Plans
        </Text>
        <Text style={[styles.mockSubtitle, isDark ? styles.darkSubtext : styles.lightSubtext]}>
          Get unlimited access to Snelling, O-House, & Bolton.
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  adContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
    minHeight: 50,
  },
  fallbackContainer: {
    marginVertical: 12,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
    position: 'relative',
    height: 70,
    justifyContent: 'center',
  },
  lightFallback: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
  },
  darkFallback: {
    backgroundColor: '#1E1B10',
    borderColor: '#3E351C',
  },
  badgeContainer: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: '#FFA000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  mockContent: {
    flex: 1,
    justifyContent: 'center',
  },
  mockTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  mockSubtitle: {
    fontSize: 11,
  },
  lightText: {
    color: '#5D4037',
  },
  darkText: {
    color: '#FFECB3',
  },
  lightSubtext: {
    color: '#795548',
  },
  darkSubtext: {
    color: '#FFE082',
    opacity: 0.8,
  },
});
