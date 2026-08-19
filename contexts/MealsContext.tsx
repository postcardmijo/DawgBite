import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Meal = {
  id: number | string;
  title: string;
  protein: number;
  carbs: number;
  fat: number;
  date?: string; // YYYY-MM-DD local format
  time?: string; // e.g. "12:30 PM"
  createdAt?: string; // ISO string
};

export type DailyProgress = {
  date: string; // YYYY-MM-DD format
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCalories: number;
};

// Local date format YYYY-MM-DD helper to prevent timezone shift issues
export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Local time format helper (e.g. "1:45 PM")
export const getLocalTimeString = (d: Date = new Date()): string => {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

type MealsContextType = {
  meals: Meal[];
  todayMeals: Meal[];
  addMeal: (meal: Meal) => void;
  deleteMeal: (id: Meal["id"]) => void;
  relogMeal: (meal: Meal) => void;
  getMealsForDate: (dateStr: string) => Meal[];
  getDatesWithMeals: () => string[];
  getDailyProgress: () => DailyProgress[];
  getProgressData: (days?: number) => Array<{ date: string; value: number }>;
};

const MealsContext = createContext<MealsContextType | undefined>(undefined);

const STORAGE_KEY = "@meals_storage";

export const MealsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load meals from storage on mount
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const storedMeals = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMeals) {
          const parsed: Meal[] = JSON.parse(storedMeals);
          setMeals(parsed);
        }
      } catch (error) {
        console.error("Failed to load meals from storage:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadMeals();
  }, []);

  // Save meals to storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      const saveMeals = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
        } catch (error) {
          console.error("Failed to save meals to storage:", error);
        }
      };
      saveMeals();
    }
  }, [meals, isLoaded]);

  const addMeal = (meal: Meal) => {
    const now = new Date();
    const dateStr = getLocalDateString(now);
    const timeStr = getLocalTimeString(now);

    const fullMeal: Meal = {
      ...meal,
      id: meal.id || Date.now(),
      date: meal.date || dateStr,
      time: meal.time || timeStr,
      createdAt: meal.createdAt || now.toISOString(),
    };

    setMeals((prev) => [fullMeal, ...prev]);
  };

  const relogMeal = (meal: Meal) => {
    const now = new Date();
    const dateStr = getLocalDateString(now);
    const timeStr = getLocalTimeString(now);

    const clonedMeal: Meal = {
      ...meal,
      id: Date.now(),
      date: dateStr,
      time: timeStr,
      createdAt: now.toISOString(),
    };

    setMeals((prev) => [clonedMeal, ...prev]);
  };

  const deleteMeal = (id: Meal["id"]) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const todayStr = getLocalDateString();

  // Filtered list of meals for today only
  const todayMeals = useMemo(() => {
    return meals.filter((meal) => {
      // If meal has no date, treat as today or check
      const mealDate = meal.date || todayStr;
      return mealDate === todayStr;
    });
  }, [meals, todayStr]);

  const getMealsForDate = (dateStr: string): Meal[] => {
    return meals.filter((meal) => (meal.date || todayStr) === dateStr);
  };

  const getDatesWithMeals = (): string[] => {
    const dateSet = new Set<string>();
    meals.forEach((m) => {
      if (m.date) dateSet.add(m.date);
    });
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  };

  const getDailyProgress = (): DailyProgress[] => {
    const dailyMap = new Map<string, DailyProgress>();

    meals.forEach((meal) => {
      const date = meal.date || todayStr;
      const existing = dailyMap.get(date) || {
        date,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalCalories: 0,
      };

      const caloriesFromMeal = meal.protein * 4 + meal.carbs * 4 + meal.fat * 9;

      dailyMap.set(date, {
        ...existing,
        totalProtein: existing.totalProtein + meal.protein,
        totalCarbs: existing.totalCarbs + meal.carbs,
        totalFat: existing.totalFat + meal.fat,
        totalCalories: existing.totalCalories + caloriesFromMeal,
      });
    });

    return Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const getProgressData = (days: number = 30) => {
    const dailyProgress = getDailyProgress();
    const today = new Date();
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

    // Create an array of dates with progress data
    const dataMap = new Map<string, number>();
    dailyProgress.forEach((progress) => {
      const progressDate = new Date(progress.date);
      if (progressDate >= startDate && progressDate <= today) {
        dataMap.set(progress.date, progress.totalCalories);
      }
    });

    // Fill in missing dates with 0
    const result: Array<{ date: string; value: number }> = [];
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = getLocalDateString(currentDate);
      const value = dataMap.get(dateStr) ?? 0;
      result.push({ date: dateStr, value });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  };

  return (
    <MealsContext.Provider
      value={{
        meals,
        todayMeals,
        addMeal,
        relogMeal,
        deleteMeal,
        getMealsForDate,
        getDatesWithMeals,
        getDailyProgress,
        getProgressData,
      }}
    >
      {children}
    </MealsContext.Provider>
  );
};

export const useMeals = (): MealsContextType => {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error("useMeals must be used within MealsProvider");
  return ctx;
};

export default MealsContext;
