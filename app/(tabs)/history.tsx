import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AdBanner } from "@/components/ad-banner";
import {
  getLocalDateString,
  Meal,
  useMeals,
} from "@/contexts/MealsContext";

const Colors = {
  light: {
    primary: "#4CAF50",
    primaryLight: "#E8F5E9",
    background: "#f8f9fa",
    card: "#ffffff",
    text: "#111827",
    textSecondary: "#6c757d",
    iconBg: "#E8F5E9",
    border: "#f0f0f0",
    activeChip: "#4CAF50",
    activeChipText: "#ffffff",
    inactiveChip: "#e9ecef",
    inactiveChipText: "#495057",
  },
  dark: {
    primary: "#66BB6A",
    primaryLight: "#1B3A22",
    background: "#000000",
    card: "#1E1E1E",
    text: "#ffffff",
    textSecondary: "#9BA1A6",
    iconBg: "#2C3E50",
    border: "#333333",
    activeChip: "#66BB6A",
    activeChipText: "#000000",
    inactiveChip: "#2C2C2E",
    inactiveChipText: "#D1D5DB",
  },
};

const MACRO_COLORS = {
  protein: "#4ECDC4",
  carbs: "#FFE66D",
  fat: "#FF6B6B",
};

// Formats YYYY-MM-DD into human-readable e.g. "Today", "Yesterday", "Tue, Aug 18"
function formatDayHeader(dateStr: string): { title: string; subtitle: string } {
  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);

  const fullFormatted = targetDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  if (dateStr === todayStr) {
    return { title: "Today", subtitle: fullFormatted };
  } else if (dateStr === yesterdayStr) {
    return { title: "Yesterday", subtitle: fullFormatted };
  } else {
    const weekday = targetDate.toLocaleDateString("en-US", { weekday: "long" });
    return { title: weekday, subtitle: fullFormatted };
  }
}

export default function HistoryScreen() {
  const router = useRouter();
  const { meals, todayMeals, deleteMeal, relogMeal, getMealsForDate, getDatesWithMeals } =
    useMeals();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const todayStr = getLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Available dates that have recorded meals plus today and last 7 days
  const dateList = useMemo(() => {
    const datesWithMeals = getDatesWithMeals();
    const set = new Set<string>(datesWithMeals);
    // Ensure the last 7 calendar days are always in the date selector strip
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      set.add(getLocalDateString(d));
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [meals, getDatesWithMeals]);

  // Meals for the currently selected date
  const selectedDateMeals = useMemo(() => {
    return getMealsForDate(selectedDate);
  }, [selectedDate, meals, getMealsForDate]);

  // Summary nutrition for the selected date
  const selectedDateTotals = useMemo(() => {
    return selectedDateMeals.reduce(
      (acc, m) => {
        const p = m.protein ?? 0;
        const c = m.carbs ?? 0;
        const f = m.fat ?? 0;
        const cal = p * 4 + c * 4 + f * 9;
        return {
          protein: acc.protein + p,
          carbs: acc.carbs + c,
          fat: acc.fat + f,
          calories: acc.calories + cal,
        };
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0 }
    );
  }, [selectedDateMeals]);

  // Filtered search results across all past meals
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return meals.filter((m) => m.title.toLowerCase().includes(q));
  }, [searchQuery, meals]);

  // Stepper functions (Previous day / Next day)
  const handleShiftDate = (direction: -1 | 1) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + direction);
    const newDateStr = getLocalDateString(dateObj);
    setSelectedDate(newDateStr);
  };

  const handleRelog = (meal: Meal) => {
    relogMeal(meal);
    setCopiedToast(`Added "${meal.title}" to Today!`);
    setTimeout(() => {
      setCopiedToast(null);
    }, 2500);
  };

  const isToday = selectedDate === todayStr;
  const headerInfo = formatDayHeader(selectedDate);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
        {/* Title Header */}
        <ThemedView style={styles.titleContainer}>
          <View>
            <ThemedText type="subtitle" style={{ color: theme.textSecondary }}>
              Past Logs & Archives
            </ThemedText>
            <ThemedText type="title" style={styles.mainHeader}>
              Meal History
            </ThemedText>
          </View>

          {/* Quick jump to Today if viewing past date */}
          {!isToday && (
            <TouchableOpacity
              onPress={() => setSelectedDate(todayStr)}
              style={[
                styles.todayButton,
                { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name="today-outline" size={16} color={theme.primary} />
              <Text style={[styles.todayButtonText, { color: theme.primary }]}>
                Today
              </Text>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.textSecondary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search past meals (e.g., chicken, pasta)..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Toast Notification for Re-logging */}
        {copiedToast && (
          <View
            style={[
              styles.toastNotification,
              { backgroundColor: theme.primary },
            ]}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.toastText}>{copiedToast}</Text>
          </View>
        )}

        {/* Search Results Mode */}
        {searchQuery.trim().length > 0 ? (
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: theme.textSecondary }]}
            >
              Search Results ({searchResults.length})
            </ThemedText>

            {searchResults.length === 0 ? (
              <View style={[styles.emptyStateCard, { backgroundColor: theme.card }]}>
                <Ionicons
                  name="search"
                  size={40}
                  color={theme.textSecondary}
                  style={{ opacity: 0.5 }}
                />
                <ThemedText
                  style={{ color: theme.textSecondary, marginTop: 8 }}
                >
                  No previous meals match "{searchQuery}"
                </ThemedText>
              </View>
            ) : (
              searchResults.map((item) => (
                <HistoryMealCard
                  key={`search-${item.id}`}
                  item={item}
                  theme={theme}
                  onDelete={() => deleteMeal(item.id)}
                  onRelog={() => handleRelog(item)}
                  showDate
                />
              ))
            )}
          </View>
        ) : (
          <>
            {/* Date Navigator Header with Stepper */}
            <View
              style={[
                styles.dateNavigatorCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleShiftDate(-1)}
                style={[styles.stepperButton, { backgroundColor: theme.inactiveChip }]}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={20} color={theme.text} />
              </TouchableOpacity>

              <View style={styles.dateTitleWrapper}>
                <ThemedText style={styles.dayHeading}>
                  {headerInfo.title}
                </ThemedText>
                <ThemedText style={[styles.daySubheading, { color: theme.textSecondary }]}>
                  {headerInfo.subtitle}
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={() => handleShiftDate(1)}
                style={[
                  styles.stepperButton,
                  { backgroundColor: theme.inactiveChip },
                  isToday && { opacity: 0.3 },
                ]}
                disabled={isToday}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Horizontal Date Selector Strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateStripContainer}
            >
              {dateList.slice(0, 14).map((dStr) => {
                const [y, m, d] = dStr.split("-").map(Number);
                const dateObj = new Date(y, m - 1, d);
                const dayShort = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const dayNum = dateObj.getDate();
                const isSelected = dStr === selectedDate;
                const isTodayChip = dStr === todayStr;

                return (
                  <TouchableOpacity
                    key={dStr}
                    onPress={() => setSelectedDate(dStr)}
                    style={[
                      styles.dateChip,
                      {
                        backgroundColor: isSelected
                          ? theme.activeChip
                          : theme.inactiveChip,
                        borderColor: isSelected ? theme.activeChip : theme.border,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dateChipDay,
                        {
                          color: isSelected
                            ? theme.activeChipText
                            : theme.inactiveChipText,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {isTodayChip ? "Today" : dayShort}
                    </Text>
                    <Text
                      style={[
                        styles.dateChipNum,
                        {
                          color: isSelected
                            ? theme.activeChipText
                            : theme.inactiveChipText,
                        },
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Daily Nutrition Totals Summary Card */}
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={styles.summaryTop}>
                <View>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    TOTAL INTAKE
                  </Text>
                  <Text style={[styles.summaryCalories, { color: theme.primary }]}>
                    {Math.round(selectedDateTotals.calories)}{" "}
                    <Text style={styles.calorieUnit}>kcal</Text>
                  </Text>
                </View>

                <View style={styles.mealCountBadge}>
                  <Ionicons name="restaurant-outline" size={14} color={theme.textSecondary} />
                  <Text style={[styles.mealCountText, { color: theme.textSecondary }]}>
                    {selectedDateMeals.length} {selectedDateMeals.length === 1 ? "meal" : "meals"}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.summaryMacros}>
                <MacroSummaryItem
                  label="Protein"
                  value={`${selectedDateTotals.protein}g`}
                  color={MACRO_COLORS.protein}
                  textColor={theme.textSecondary}
                />
                <MacroSummaryItem
                  label="Carbs"
                  value={`${selectedDateTotals.carbs}g`}
                  color={MACRO_COLORS.carbs}
                  textColor={theme.textSecondary}
                />
                <MacroSummaryItem
                  label="Fat"
                  value={`${selectedDateTotals.fat}g`}
                  color={MACRO_COLORS.fat}
                  textColor={theme.textSecondary}
                />
              </View>
            </View>

            {/* Meals for Selected Date */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText
                  style={[styles.sectionTitle, { color: theme.textSecondary }]}
                >
                  {isToday ? "Today's Logged Meals" : `Meals on ${headerInfo.title}`}
                </ThemedText>

                {isToday && (
                  <TouchableOpacity
                    onPress={() => router.push("modal" as any)}
                    style={styles.addInlineButton}
                  >
                    <Ionicons name="add-circle" size={18} color={theme.primary} />
                    <Text style={[styles.addInlineText, { color: theme.primary }]}>
                      Add Meal
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {selectedDateMeals.length === 0 ? (
                <View style={[styles.emptyStateCard, { backgroundColor: theme.card }]}>
                  <Ionicons
                    name="nutrition-outline"
                    size={48}
                    color={theme.textSecondary}
                    style={{ opacity: 0.4 }}
                  />
                  <ThemedText
                    style={{ color: theme.textSecondary, marginTop: 10, fontSize: 15 }}
                  >
                    No meals logged on this date.
                  </ThemedText>
                  {isToday ? (
                    <TouchableOpacity
                      onPress={() => router.push("modal" as any)}
                      style={[styles.logMealBtn, { backgroundColor: theme.primary }]}
                    >
                      <Ionicons name="add" size={18} color="#fff" />
                      <Text style={styles.logMealBtnText}>Log a Meal Today</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setSelectedDate(todayStr)}
                      style={[
                        styles.logMealBtn,
                        { backgroundColor: theme.primaryLight, borderWidth: 1, borderColor: theme.primary },
                      ]}
                    >
                      <Text style={[styles.logMealBtnText, { color: theme.primary }]}>
                        Go to Today's Meals
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.mealsList}>
                  {selectedDateMeals.map((item) => (
                    <HistoryMealCard
                      key={item.id}
                      item={item}
                      theme={theme}
                      onDelete={() => deleteMeal(item.id)}
                      onRelog={() => handleRelog(item)}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Previous Days Archives Overview */}
            {dateList.filter((d) => d !== selectedDate && d !== todayStr).length > 0 && (
              <View style={[styles.section, { marginTop: 24 }]}>
                <ThemedText
                  style={[styles.sectionTitle, { color: theme.textSecondary }]}
                >
                  Other Past Days
                </ThemedText>

                <View style={styles.archiveList}>
                  {dateList
                    .filter((d) => d !== selectedDate && d !== todayStr)
                    .slice(0, 5)
                    .map((otherDate) => {
                      const dayMeals = getMealsForDate(otherDate);
                      const dayCals = dayMeals.reduce((sum, m) => {
                        return (
                          sum +
                          (m.protein ?? 0) * 4 +
                          (m.carbs ?? 0) * 4 +
                          (m.fat ?? 0) * 9
                        );
                      }, 0);
                      const otherHeader = formatDayHeader(otherDate);

                      return (
                        <TouchableOpacity
                          key={otherDate}
                          onPress={() => setSelectedDate(otherDate)}
                          style={[
                            styles.archiveItem,
                            { backgroundColor: theme.card, borderColor: theme.border },
                          ]}
                          activeOpacity={0.7}
                        >
                          <View style={styles.archiveItemLeft}>
                            <View
                              style={[
                                styles.archiveIconWrap,
                                { backgroundColor: theme.iconBg },
                              ]}
                            >
                              <Ionicons
                                name="calendar-outline"
                                size={18}
                                color={theme.primary}
                              />
                            </View>
                            <View>
                              <ThemedText style={styles.archiveItemTitle}>
                                {otherHeader.title}
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.archiveItemSubtitle,
                                  { color: theme.textSecondary },
                                ]}
                              >
                                {otherHeader.subtitle}
                              </ThemedText>
                            </View>
                          </View>

                          <View style={styles.archiveItemRight}>
                            <Text
                              style={[
                                styles.archiveItemCalories,
                                { color: theme.primary },
                              ]}
                            >
                              {Math.round(dayCals)} kcal
                            </Text>
                            <Text
                              style={[
                                styles.archiveItemCount,
                                { color: theme.textSecondary },
                              ]}
                            >
                              {dayMeals.length} {dayMeals.length === 1 ? "meal" : "meals"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </View>
            )}
          </>
        )}

        <AdBanner />
        <View style={{ height: 40 }} />
      </ParallaxScrollView>
    </GestureHandlerRootView>
  );
}

// --- HISTORY MEAL CARD COMPONENT WITH LOG AGAIN & SWIPE DELETE ---
function HistoryMealCard({
  item,
  theme,
  onDelete,
  onRelog,
  showDate = false,
}: {
  item: Meal;
  theme: any;
  onDelete: () => void;
  onRelog: () => void;
  showDate?: boolean;
}) {
  const calories =
    (item.protein ?? 0) * 4 + (item.carbs ?? 0) * 4 + (item.fat ?? 0) * 9;

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.deleteActionContainer}>
        <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
          <Ionicons name="trash-outline" size={26} color="white" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        if (direction === "right") {
          onDelete();
        }
      }}
      friction={2}
      rightThreshold={80}
    >
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
            <Ionicons name="restaurant" size={18} color={theme.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              {item.title}
            </ThemedText>
            <View style={styles.metaRow}>
              {item.time && (
                <View style={styles.timeTag}>
                  <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    {item.time}
                  </Text>
                </View>
              )}
              {showDate && item.date && (
                <View style={styles.timeTag}>
                  <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    {item.date}
                  </Text>
                </View>
              )}
              <Text style={[styles.calorieTag, { color: theme.primary }]}>
                {Math.round(calories)} kcal
              </Text>
            </View>
          </View>

          {/* Quick "Log Again" action button */}
          <TouchableOpacity
            onPress={onRelog}
            style={[styles.relogButton, { backgroundColor: theme.primaryLight }]}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={14} color={theme.primary} />
            <Text style={[styles.relogText, { color: theme.primary }]}>
              Log Again
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.macrosContainer}>
          <MacroPill
            label="Protein"
            value={item.protein ?? 0}
            color={MACRO_COLORS.protein}
            textColor={theme.textSecondary}
          />
          <MacroPill
            label="Carbs"
            value={item.carbs ?? 0}
            color={MACRO_COLORS.carbs}
            textColor={theme.textSecondary}
          />
          <MacroPill
            label="Fat"
            value={item.fat ?? 0}
            color={MACRO_COLORS.fat}
            textColor={theme.textSecondary}
          />
        </View>
      </View>
    </Swipeable>
  );
}

function MacroPill({
  label,
  value,
  color,
  textColor,
}: {
  label: string;
  value: number;
  color: string;
  textColor: string;
}) {
  return (
    <View style={styles.macroPill}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText style={styles.macroValue}>{value}g</ThemedText>
      <ThemedText style={[styles.macroLabel, { color: textColor }]}>
        {label}
      </ThemedText>
    </View>
  );
}

function MacroSummaryItem({
  label,
  value,
  color,
  textColor,
}: {
  label: string;
  value: string;
  color: string;
  textColor: string;
}) {
  return (
    <View style={styles.summaryMacroItem}>
      <View style={styles.summaryDotRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.summaryMacroLabel, { color: textColor }]}>
          {label}
        </Text>
      </View>
      <ThemedText style={styles.summaryMacroValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
    opacity: 0.45,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  mainHeader: {
    fontSize: 28,
    fontWeight: "bold",
  },
  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  toastNotification: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  dateNavigatorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dateTitleWrapper: {
    alignItems: "center",
  },
  dayHeading: {
    fontSize: 17,
    fontWeight: "700",
  },
  daySubheading: {
    fontSize: 12,
    marginTop: 2,
  },
  dateStripContainer: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 14,
  },
  dateChip: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 54,
  },
  dateChipDay: {
    fontSize: 11,
    textTransform: "uppercase",
  },
  dateChipNum: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  summaryCalories: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
  },
  calorieUnit: {
    fontSize: 14,
    fontWeight: "500",
  },
  mealCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(128,128,128,0.1)",
  },
  mealCountText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  summaryMacros: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryMacroItem: {
    alignItems: "center",
  },
  summaryDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  summaryMacroLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  summaryMacroValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  addInlineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addInlineText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyStateCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  logMealBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logMealBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  mealsList: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 3,
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
  },
  calorieTag: {
    fontSize: 12,
    fontWeight: "700",
  },
  relogButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  relogText: {
    fontSize: 11,
    fontWeight: "700",
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  macroPill: {
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  macroValue: {
    fontWeight: "700",
    fontSize: 14,
  },
  macroLabel: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: "500",
  },
  deleteActionContainer: {
    flex: 1,
    backgroundColor: "#FF5252",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 12,
    borderRadius: 16,
    paddingRight: 28,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 4,
  },
  archiveList: {
    gap: 10,
  },
  archiveItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  archiveItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  archiveIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  archiveItemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  archiveItemSubtitle: {
    fontSize: 11,
  },
  archiveItemRight: {
    alignItems: "flex-end",
  },
  archiveItemCalories: {
    fontSize: 14,
    fontWeight: "700",
  },
  archiveItemCount: {
    fontSize: 11,
    marginTop: 1,
  },
});
