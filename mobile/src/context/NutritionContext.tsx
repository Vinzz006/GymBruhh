import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { DailyNutrition, FoodItem } from '../types';

interface NutritionContextType {
  todayNutrition: DailyNutrition | null;
  searchResults: FoodItem[];
  isLoading: boolean;
  fetchTodayNutrition: () => Promise<void>;
  searchFoods: (query: string) => Promise<void>;
  logMeal: (params: {
    foodItemId?: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foodName: string;
    servingQty?: number;
    servingUnit?: string;
    calories: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    fiberG?: number;
  }) => Promise<void>;
  deleteMeal: (mealId: number) => Promise<void>;
  logWater: (amountMl?: number) => Promise<void>;
  logCustomFood: (food: Partial<FoodItem>) => Promise<any>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todayNutrition, setTodayNutrition] = useState<DailyNutrition | null>(null);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTodayNutrition = async () => {
    setIsLoading(true);
    try {
      const data = await api.get(API_ENDPOINTS.todayNutrition);
      if (data) {
        setTodayNutrition({
          date: data.date,
          totalCalories: data.total_calories || 0,
          totalProteinG: data.total_protein_g || 0,
          totalCarbsG: data.total_carbs_g || 0,
          totalFatG: data.total_fat_g || 0,
          totalFiberG: data.total_fiber_g || 0,
          waterIntakeMl: data.water_intake_ml || 0,
          meals: (data.meals || []).map((m: any) => ({
            id: m.id,
            userId: m.user_id,
            foodItemId: m.food_item_id,
            mealType: m.meal_type,
            foodName: m.food_name,
            servingQty: m.serving_qty,
            servingUnit: m.serving_unit,
            calories: m.calories,
            proteinG: m.protein_g,
            carbsG: m.carbs_g,
            fatG: m.fat_g,
            fiberG: m.fiber_g,
            loggedAt: m.logged_at,
          })),
        });
      }
    } catch (e) {
      console.warn('Could not fetch today nutrition:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayNutrition();
  }, []);

  const searchFoods = async (query: string) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    try {
      const list = await api.get(`${API_ENDPOINTS.searchFoods}?query=${encodeURIComponent(query.trim())}`);
      if (Array.isArray(list)) {
        setSearchResults(
          list.map((f: any) => ({
            id: f.id,
            name: f.name,
            brand: f.brand,
            servingSize: f.serving_size,
            servingUnit: f.serving_unit,
            calories: f.calories,
            proteinG: f.protein_g,
            carbsG: f.carbs_g,
            fatG: f.fat_g,
            fiberG: f.fiber_g,
            isCustom: f.is_custom,
          }))
        );
      }
    } catch (e) {
      console.warn('Could not search foods:', e);
    }
  };

  const logMeal = async (params: {
    foodItemId?: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foodName: string;
    servingQty?: number;
    servingUnit?: string;
    calories: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    fiberG?: number;
  }) => {
    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.logMeal, {
        food_item_id: params.foodItemId,
        meal_type: params.mealType,
        food_name: params.foodName,
        serving_qty: params.servingQty || 1.0,
        serving_unit: params.servingUnit || 'serving',
        calories: params.calories,
        protein_g: params.proteinG || 0.0,
        carbs_g: params.carbsG || 0.0,
        fat_g: params.fatG || 0.0,
        fiber_g: params.fiberG || 0.0,
      });
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      await fetchTodayNutrition();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMeal = async (mealId: number) => {
    try {
      await api.delete(API_ENDPOINTS.deleteMeal(mealId));
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
      await fetchTodayNutrition();
    } catch (e) {
      console.warn('Error deleting meal:', e);
    }
  };

  const logWater = async (amountMl: number = 250) => {
    try {
      await api.post(`${API_ENDPOINTS.logWater}?amount_ml=${amountMl}`);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (_) {}
      await fetchTodayNutrition();
    } catch (e) {
      console.warn('Error logging water:', e);
    }
  };

  const logCustomFood = async (food: Partial<FoodItem>) => {
    try {
      const res = await api.post(API_ENDPOINTS.customFood, {
        name: food.name,
        brand: food.brand || 'Custom',
        serving_size: food.servingSize || 100,
        serving_unit: food.servingUnit || 'g',
        calories: food.calories || 0,
        protein_g: food.proteinG || 0,
        carbs_g: food.carbsG || 0,
        fat_g: food.fatG || 0,
        fiber_g: food.fiberG || 0,
      });
      return res;
    } catch (e) {
      console.warn('Error creating custom food:', e);
      throw e;
    }
  };

  return (
    <NutritionContext.Provider
      value={{
        todayNutrition,
        searchResults,
        isLoading,
        fetchTodayNutrition,
        searchFoods,
        logMeal,
        deleteMeal,
        logWater,
        logCustomFood,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};

export default NutritionContext;
