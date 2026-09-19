import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useNutrition } from '../../context/NutritionContext';
import { useAI } from '../../context/AIContext';
import MacroRingCard from '../../components/common/MacroRingCard';
import AppButton from '../../components/common/AppButton';

export const NutritionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { targets } = useAuth();
  const {
    todayNutrition,
    searchResults,
    searchFoods,
    logMeal,
    deleteMeal,
    logWater,
  } = useNutrition();
  const { suggestMeal, isGeneratingMeal, lastMealSuggestion } = useAI();

  const [addFoodModalVisible, setAddFoodModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack'
  >('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMealModalVisible, setAiMealModalVisible] = useState(false);

  // Custom food form inside add modal
  const [customFoodMode, setCustomFoodMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const mealCategories: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  const handleOpenAddFood = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setSelectedMealType(type);
    setSearchQuery('');
    setCustomFoodMode(false);
    setAddFoodModalVisible(true);
  };

  const handleSelectFood = async (food: any) => {
    await logMeal({
      foodItemId: food.id,
      mealType: selectedMealType,
      foodName: food.name,
      servingQty: 1,
      servingUnit: food.servingUnit || 'serving',
      calories: food.calories || 200,
      proteinG: food.proteinG || 15,
      carbsG: food.carbsG || 20,
      fatG: food.fatG || 5,
      fiberG: food.fiberG || 2,
    });
    setAddFoodModalVisible(false);
  };

  const handleLogCustom = async () => {
    if (!customName.trim()) return;
    await logMeal({
      mealType: selectedMealType,
      foodName: customName.trim(),
      calories: parseFloat(customCalories) || 0,
      proteinG: parseFloat(customProtein) || 0,
      carbsG: parseFloat(customCarbs) || 0,
      fatG: parseFloat(customFat) || 0,
    });
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setAddFoodModalVisible(false);
  };

  const handleGenerateAIMeal = async () => {
    await suggestMeal('dinner');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Nutrition & Fuel 🥗</Text>
        <TouchableOpacity
          style={styles.aiNutriBtn}
          onPress={() => setAiMealModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={16} color={AppColors.cyan} />
          <Text style={styles.aiNutriText}>AI Meal Suggest</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Macro Ring Overview */}
        <MacroRingCard
          targetCalories={targets?.targetCalories || 2400}
          consumedCalories={todayNutrition?.totalCalories || 0}
          proteinG={todayNutrition?.totalProteinG || 0}
          targetProteinG={targets?.targetProteinGrams || 160}
          carbsG={todayNutrition?.totalCarbsG || 0}
          targetCarbsG={targets?.targetCarbsGrams || 220}
          fatG={todayNutrition?.totalFatG || 0}
          targetFatG={targets?.targetFatGrams || 70}
        />

        {/* Water Intake Tracker */}
        <View style={styles.waterCard}>
          <View style={styles.waterLeft}>
            <View style={styles.waterIcon}>
              <Ionicons name="water" size={24} color={AppColors.cyan} />
            </View>
            <View>
              <Text style={styles.waterTitle}>HYDRATION</Text>
              <Text style={styles.waterValue}>
                {todayNutrition?.waterIntakeMl || 0}{' '}
                <Text style={styles.waterTarget}>/ 3000 ml</Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.waterAddBtn}
            onPress={() => logWater(250)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={AppColors.black} />
            <Text style={styles.waterAddText}>+250 ml</Text>
          </TouchableOpacity>
        </View>

        {/* Meals by Type */}
        <Text style={styles.sectionLabel}>DAILY MEALS</Text>
        {mealCategories.map((type) => {
          const meals = (todayNutrition?.meals || []).filter((m) => m.mealType === type);
          const typeCalories = Math.round(
            meals.reduce((acc, m) => acc + (m.calories || 0), 0)
          );

          return (
            <View key={type} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View>
                  <Text style={styles.mealTypeTitle}>{type.toUpperCase()}</Text>
                  <Text style={styles.mealTypeCalories}>{typeCalories} kcal</Text>
                </View>
                <TouchableOpacity
                  style={styles.addFoodBtn}
                  onPress={() => handleOpenAddFood(type)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color={AppColors.accent} />
                  <Text style={styles.addFoodBtnText}>Add</Text>
                </TouchableOpacity>
              </View>

              {meals.length > 0 ? (
                <View style={styles.mealItemsList}>
                  {meals.map((item) => (
                    <View key={item.id} style={styles.mealItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mealItemName}>{item.foodName}</Text>
                        <Text style={styles.mealItemMacros}>
                          {Math.round(item.calories)} kcal • P: {Math.round(item.proteinG)}g
                          • C: {Math.round(item.carbsG)}g • F: {Math.round(item.fatG)}g
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteMeal(item.id)}
                        style={styles.deleteBtn}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={AppColors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noMealText}>No food logged for {type} yet.</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Add Food Modal */}
      <Modal visible={addFoodModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Log {selectedMealType.toUpperCase()}
                </Text>
                <Text style={styles.modalSub}>
                  Search whole foods or input custom nutrition.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAddFoodModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppColors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Switch search vs custom */}
            <View style={styles.switchRow}>
              <TouchableOpacity
                style={[styles.switchTab, !customFoodMode && styles.switchTabActive]}
                onPress={() => setCustomFoodMode(false)}
              >
                <Text
                  style={[
                    styles.switchText,
                    !customFoodMode && styles.switchTextActive,
                  ]}
                >
                  Search Catalog
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.switchTab, customFoodMode && styles.switchTabActive]}
                onPress={() => setCustomFoodMode(true)}
              >
                <Text
                  style={[
                    styles.switchText,
                    customFoodMode && styles.switchTextActive,
                  ]}
                >
                  Quick Custom Log
                </Text>
              </TouchableOpacity>
            </View>

            {!customFoodMode ? (
              <View style={{ flex: 1 }}>
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={18} color={AppColors.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search chicken breast, oats, eggs, rice..."
                    placeholderTextColor={AppColors.textMuted}
                    value={searchQuery}
                    onChangeText={(q) => {
                      setSearchQuery(q);
                      searchFoods(q);
                    }}
                  />
                </View>

                <ScrollView style={{ flex: 1 }}>
                  {searchResults.map((food) => (
                    <TouchableOpacity
                      key={food.id}
                      style={styles.searchItem}
                      onPress={() => handleSelectFood(food)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.searchFoodName}>{food.name}</Text>
                        <Text style={styles.searchFoodMacros}>
                          {Math.round(food.calories)} kcal • P: {Math.round(food.proteinG)}g
                          • C: {Math.round(food.carbsG)}g • F: {Math.round(food.fatG)}g
                        </Text>
                      </View>
                      <Ionicons name="add-circle" size={24} color={AppColors.accent} />
                    </TouchableOpacity>
                  ))}
                  {searchResults.length === 0 ? (
                    <View style={styles.emptySearch}>
                      <Text style={styles.emptySearchText}>
                        Type to search foods or switch to custom log.
                      </Text>
                    </View>
                  ) : null}
                </ScrollView>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Food Name (e.g. Protein Smoothie)"
                  placeholderTextColor={AppColors.textMuted}
                  value={customName}
                  onChangeText={setCustomName}
                />
                <TextInput
                  style={styles.customInput}
                  placeholder="Calories (kcal)"
                  placeholderTextColor={AppColors.textMuted}
                  keyboardType="numeric"
                  value={customCalories}
                  onChangeText={setCustomCalories}
                />
                <TextInput
                  style={styles.customInput}
                  placeholder="Protein (g)"
                  placeholderTextColor={AppColors.textMuted}
                  keyboardType="numeric"
                  value={customProtein}
                  onChangeText={setCustomProtein}
                />
                <TextInput
                  style={styles.customInput}
                  placeholder="Carbohydrates (g)"
                  placeholderTextColor={AppColors.textMuted}
                  keyboardType="numeric"
                  value={customCarbs}
                  onChangeText={setCustomCarbs}
                />
                <TextInput
                  style={styles.customInput}
                  placeholder="Fat (g)"
                  placeholderTextColor={AppColors.textMuted}
                  keyboardType="numeric"
                  value={customFat}
                  onChangeText={setCustomFat}
                />
                <AppButton
                  text="SAVE TO MEAL"
                  onPress={handleLogCustom}
                  style={{ marginTop: 12 }}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* AI Meal Suggestion Modal */}
      <Modal visible={aiMealModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>AI Nutrition Assistant 🍽️</Text>
                <Text style={styles.modalSub}>
                  Tailored high-protein dinner suggestions for your remaining daily macros.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAiMealModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppColors.textMuted} />
              </TouchableOpacity>
            </View>

            {lastMealSuggestion ? (
              <View style={styles.aiSuggestionBox}>
                <Text style={styles.aiMealName}>
                  {lastMealSuggestion.meal_name || lastMealSuggestion.title || 'High-Protein Bowl'}
                </Text>
                <Text style={styles.aiMealDesc}>
                  {lastMealSuggestion.description ||
                    'Grilled chicken breast with quinoa and avocado, seasoned with herbs.'}
                </Text>
                <View style={styles.aiMacroPill}>
                  <Text style={styles.aiMacroPillText}>
                    {lastMealSuggestion.calories || 520} kcal • Protein:{' '}
                    {lastMealSuggestion.protein_g || 48}g
                  </Text>
                </View>
              </View>
            ) : null}

            <AppButton
              text="SUGGEST HIGH-PROTEIN MEAL"
              onPress={handleGenerateAIMeal}
              isLoading={isGeneratingMeal}
              variant="secondary"
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  aiNutriBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.cyan}1A`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${AppColors.cyan}44`,
    gap: 6,
  },
  aiNutriText: {
    color: AppColors.cyan,
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 90,
  },
  waterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginVertical: 18,
  },
  waterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waterIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${AppColors.cyan}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterTitle: {
    color: AppColors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  waterValue: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  waterTarget: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  waterAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cyan,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  waterAddText: {
    color: AppColors.black,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionLabel: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: AppColors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 14,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTypeTitle: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  mealTypeCalories: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  addFoodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.accent}1A`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  addFoodBtnText: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  mealItemsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 8,
  },
  mealItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  mealItemName: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  mealItemMacros: {
    color: AppColors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  noMealText: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: AppColors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 1,
    borderColor: AppColors.border,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  modalSub: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  switchTabActive: {
    backgroundColor: AppColors.card,
  },
  switchText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  switchTextActive: {
    color: AppColors.accent,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: AppColors.white,
    fontSize: 13,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 8,
  },
  searchFoodName: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  searchFoodMacros: {
    color: AppColors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  emptySearch: {
    padding: 24,
    alignItems: 'center',
  },
  emptySearchText: {
    color: AppColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  customInput: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 12,
    color: AppColors.white,
    fontSize: 13,
    marginBottom: 10,
  },
  aiSuggestionBox: {
    backgroundColor: AppColors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: `${AppColors.cyan}33`,
    marginTop: 10,
  },
  aiMealName: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  aiMealDesc: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  aiMacroPill: {
    backgroundColor: `${AppColors.cyan}20`,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiMacroPillText: {
    color: AppColors.cyan,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default NutritionScreen;
