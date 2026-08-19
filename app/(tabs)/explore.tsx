import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { SimplePieChart } from "@/components/pie-chart";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts, Colors as ThemeColors } from "@/constants/theme";
import { useMeals } from "@/contexts/MealsContext";
import { AdBanner } from "@/components/ad-banner";

export default function TabTwoScreen() {
  const { meals, todayMeals } = useMeals();
  const [scope, setScope] = useState<"today" | "all">("today");
  const colorScheme = useColorScheme() ?? "light";
  const colors = ThemeColors[colorScheme];

  const activeMeals = scope === "today" ? todayMeals : meals;

  const totals = useMemo(() => {
    return activeMeals.reduce(
      (acc, m) => ({
        fat: acc.fat + (m.fat ?? 0),
        protein: acc.protein + (m.protein ?? 0),
        carbs: acc.carbs + (m.carbs ?? 0),
      }),
      { fat: 0, protein: 0, carbs: 0 }
    );
  }, [activeMeals]);

  const totalSum = totals.fat + totals.protein + totals.carbs;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E8F5E9", dark: "#121212" }}
      headerImage={
        <Image
          source={require("@/assets/images/images.jpg")}
          style={styles.headerImage}
          contentFit="cover"
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          Nutrition Totals
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.subtitle}>
        {scope === "today"
          ? "Total Macronutrients from Today's Meals"
          : "Total Macronutrients from All Recorded Meals"}
      </ThemedText>

      {/* Scope Selector: Today vs All-Time */}
      <View style={styles.scopeContainer}>
        <Pressable
          onPress={() => setScope("today")}
          style={[
            styles.scopeButton,
            scope === "today" && [
              styles.activeScopeButton,
              { backgroundColor: colors.tint },
            ],
          ]}
        >
          <Text
            style={[
              styles.scopeButtonText,
              { color: scope === "today" ? "#000" : colors.text },
            ]}
          >
            Today ({todayMeals.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setScope("all")}
          style={[
            styles.scopeButton,
            scope === "all" && [
              styles.activeScopeButton,
              { backgroundColor: colors.tint },
            ],
          ]}
        >
          <Text
            style={[
              styles.scopeButtonText,
              { color: scope === "all" ? "#000" : colors.text },
            ]}
          >
            All-Time ({meals.length})
          </Text>
        </Pressable>
      </View>

      <ThemedView style={styles.macroContainer}>
        <ThemedView style={styles.macroBox}>
          <ThemedText type="subtitle" style={styles.macroValue}>
            {totals.fat}g
          </ThemedText>
          <ThemedText style={styles.macroLabel}>Fat</ThemedText>
        </ThemedView>

        <ThemedView style={styles.macroBox}>
          <ThemedText type="subtitle" style={styles.macroValue}>
            {totals.protein}g
          </ThemedText>
          <ThemedText style={styles.macroLabel}>Protein</ThemedText>
        </ThemedView>

        <ThemedView style={styles.macroBox}>
          <ThemedText type="subtitle" style={styles.macroValue}>
            {totals.carbs}g
          </ThemedText>
          <ThemedText style={styles.macroLabel}>Carbs</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>
          Macronutrient Distribution
        </ThemedText>
        {totalSum > 0 ? (
          <SimplePieChart
            fat={totals.fat}
            protein={totals.protein}
            carbs={totals.carbs}
            size={250}
          />
        ) : (
          <ThemedText style={{ opacity: 0.7 }}>
            {scope === "today" ? "No meals logged today." : "No meals logged."}
          </ThemedText>
        )}
      </ThemedView>

      <AdBanner />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    opacity: 0.5,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  macroBox: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A1CEDC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  macroValue: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: "700",
  },
  macroLabel: {
    opacity: 0.7,
    fontSize: 12,
  },
  itemsContainer: {
    marginTop: 16,
  },
  itemsTitle: {
    marginBottom: 12,
  },
  chartContainer: {
    marginVertical: 24,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 12,
  },
  chartTitle: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A1CEDC",
    opacity: 0.8,
  },
  itemName: {
    fontWeight: "600",
  },
  itemMacros: {
    fontSize: 12,
    opacity: 0.7,
  },
  scopeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  scopeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  activeScopeButton: {
    borderColor: "transparent",
  },
  scopeButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
