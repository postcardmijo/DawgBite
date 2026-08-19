import React from 'react';
import { StyleSheet, View, Text, useColorScheme, Pressable } from 'react-native';

export function AdBanner() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

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
