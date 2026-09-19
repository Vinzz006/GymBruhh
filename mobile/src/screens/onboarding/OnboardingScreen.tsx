import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/common/AppButton';
import AppTextField from '../../components/common/AppTextField';

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { completeOnboarding, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Step 1: Personal Info
  const [age, setAge] = useState('26');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [heightCm, setHeightCm] = useState('180');
  const [currentWeightKg, setCurrentWeightKg] = useState('75.0');
  const [targetWeightKg, setTargetWeightKg] = useState('80.0');

  // Step 2: Fitness Level
  const [fitnessLevel, setFitnessLevel] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('intermediate');

  // Step 3: Primary Goal
  const [primaryGoal, setPrimaryGoal] = useState<
    'fat_loss' | 'muscle_gain' | 'maintenance' | 'strength'
  >('muscle_gain');

  // Step 4: Activity Level
  const [activityLevel, setActivityLevel] = useState<
    'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  >('moderately_active');

  // Step 5: Workout Preferences
  const [trainingDays, setTrainingDays] = useState(4);
  const [workoutDuration, setWorkoutDuration] = useState(60);
  const [workoutLocation, setWorkoutLocation] = useState<'gym' | 'home'>('gym');
  const [equipment, setEquipment] = useState<string[]>([
    'barbell',
    'dumbbells',
    'cables',
    'bench',
    'pull_up_bar',
  ]);
  const [preferredSplit, setPreferredSplit] = useState('push_pull_legs');

  // Step 6: Nutrition Preferences
  const [dietary, setDietary] = useState('non_vegetarian');
  const [restrictions, setRestrictions] = useState<string[]>([]);

  // Helpers for equipment checklist
  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const toggleRestriction = (item: string) => {
    if (restrictions.includes(item)) {
      setRestrictions(restrictions.filter((r) => r !== item));
    } else {
      setRestrictions([...restrictions, item]);
    }
  };

  // Deterministic calculations for Step 7 preview
  const parsedWeight = parseFloat(currentWeightKg) || 75.0;
  const parsedHeight = parseFloat(heightCm) || 180.0;
  const parsedAge = parseInt(age, 10) || 26;

  // Mifflin-St Jeor
  const bmr =
    gender === 'male'
      ? 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge + 5
      : 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge - 161;

  const activityMultiplierMap: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const tdee = bmr * (activityMultiplierMap[activityLevel] || 1.55);

  let targetCalories = tdee;
  if (primaryGoal === 'fat_loss') targetCalories -= 500;
  else if (primaryGoal === 'muscle_gain') targetCalories += 300;
  else if (primaryGoal === 'strength') targetCalories += 150;

  // Macros
  const targetProteinG = parsedWeight * 2.0; // 2.0g/kg
  const targetFatG = (targetCalories * 0.25) / 9; // 25% of calories
  const remainingCalForCarbs = Math.max(0, targetCalories - (targetProteinG * 4 + targetFatG * 9));
  const targetCarbsG = remainingCalForCarbs / 4;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      submitOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitOnboarding = async () => {
    const payload = {
      age: parsedAge,
      gender,
      height_cm: parsedHeight,
      current_weight_kg: parsedWeight,
      target_weight_kg: parseFloat(targetWeightKg) || parsedWeight,
      fitness_level: fitnessLevel,
      primary_goal: primaryGoal,
      activity_level: activityLevel,
      training_days_per_week: trainingDays,
      workout_duration_minutes: workoutDuration,
      workout_location: workoutLocation,
      equipment_available: equipment,
      preferred_split: preferredSplit,
      dietary_preference: dietary,
      allergies_restrictions: restrictions,
    };

    try {
      await completeOnboarding(payload);
      navigation.replace('MainTabs');
    } catch (e: any) {
      console.warn('Onboarding error:', e.message);
    }
  };

  const renderOptionTile = (
    title: string,
    isSelected: boolean,
    onSelect: () => void,
    subtitle?: string,
    icon?: any
  ) => {
    return (
      <TouchableOpacity
        style={[
          styles.optionTile,
          isSelected && styles.optionTileSelected,
        ]}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        <View style={styles.optionRow}>
          {icon ? (
            <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
              <Ionicons
                name={icon}
                size={20}
                color={isSelected ? AppColors.accent : AppColors.textSecondary}
              />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.optionTitle,
                isSelected && { color: AppColors.accent },
              ]}
            >
              {title}
            </Text>
            {subtitle ? <Text style={styles.optionSub}>{subtitle}</Text> : null}
          </View>
          <View
            style={[
              styles.radioCircle,
              isSelected && styles.radioCircleSelected,
            ]}
          >
            {isSelected ? <View style={styles.radioInner} /> : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Personal Details 👤</Text>
            <Text style={styles.stepDesc}>
              We use these metrics to calculate your precise BMR, TDEE, and macro targets.
            </Text>

            <Text style={styles.inputSectionLabel}>GENDER</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                onPress={() => setGender('male')}
              >
                <Ionicons
                  name="male"
                  size={24}
                  color={gender === 'male' ? AppColors.accent : AppColors.textSecondary}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === 'male' && { color: AppColors.accent },
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                onPress={() => setGender('female')}
              >
                <Ionicons
                  name="female"
                  size={24}
                  color={gender === 'female' ? AppColors.accent : AppColors.textSecondary}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === 'female' && { color: AppColors.accent },
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <AppTextField
                  label="Age"
                  placeholder="26"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <AppTextField
                  label="Height (cm)"
                  placeholder="180"
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <AppTextField
                  label="Current Weight (kg)"
                  placeholder="75.0"
                  value={currentWeightKg}
                  onChangeText={setCurrentWeightKg}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <AppTextField
                  label="Target Weight (kg)"
                  placeholder="80.0"
                  value={targetWeightKg}
                  onChangeText={setTargetWeightKg}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Fitness Experience 🎯</Text>
            <Text style={styles.stepDesc}>
              Select your current lifting level to calibrate training volume.
            </Text>
            {renderOptionTile(
              'Beginner',
              fitnessLevel === 'beginner',
              () => setFitnessLevel('beginner'),
              'Less than 1 year of structured resistance training',
              'leaf-outline'
            )}
            {renderOptionTile(
              'Intermediate',
              fitnessLevel === 'intermediate',
              () => setFitnessLevel('intermediate'),
              '1 to 3 years of consistent barbell & dumbbell training',
              'barbell-outline'
            )}
            {renderOptionTile(
              'Advanced',
              fitnessLevel === 'advanced',
              () => setFitnessLevel('advanced'),
              '3+ years with mastery of compound movements & periodization',
              'trophy-outline'
            )}
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Primary Goal 🏆</Text>
            <Text style={styles.stepDesc}>
              Your goal determines daily calorie surplus/deficit and macro distributions.
            </Text>
            {renderOptionTile(
              'Muscle Gain (Hypertrophy)',
              primaryGoal === 'muscle_gain',
              () => setPrimaryGoal('muscle_gain'),
              'Optimize lean muscle hypertrophy with slight caloric surplus',
              'flame-outline'
            )}
            {renderOptionTile(
              'Fat Loss (Cutting)',
              primaryGoal === 'fat_loss',
              () => setPrimaryGoal('fat_loss'),
              'Preserve lean mass with high protein and moderate deficit',
              'water-outline'
            )}
            {renderOptionTile(
              'Strength Building',
              primaryGoal === 'strength',
              () => setPrimaryGoal('strength'),
              'Focus on 1-5 rep maximums on compound lifts',
              'flash-outline'
            )}
            {renderOptionTile(
              'Maintenance & Health',
              primaryGoal === 'maintenance',
              () => setPrimaryGoal('maintenance'),
              'Sustain body composition while improving conditioning',
              'heart-outline'
            )}
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>Daily Activity Level ⚡</Text>
            <Text style={styles.stepDesc}>
              Non-exercise activity thermogenesis (NEAT) multiplier.
            </Text>
            {renderOptionTile(
              'Sedentary',
              activityLevel === 'sedentary',
              () => setActivityLevel('sedentary'),
              'Desk job, minimal daily movement (x1.2)'
            )}
            {renderOptionTile(
              'Lightly Active',
              activityLevel === 'lightly_active',
              () => setActivityLevel('lightly_active'),
              'Light exercise or walking 1-3 days/wk (x1.375)'
            )}
            {renderOptionTile(
              'Moderately Active',
              activityLevel === 'moderately_active',
              () => setActivityLevel('moderately_active'),
              'Moderate training or active on feet 3-5 days/wk (x1.55)'
            )}
            {renderOptionTile(
              'Very Active',
              activityLevel === 'very_active',
              () => setActivityLevel('very_active'),
              'Hard training 6-7 days/wk or physical labor job (x1.725)'
            )}
            {renderOptionTile(
              'Extra Active',
              activityLevel === 'extra_active',
              () => setActivityLevel('extra_active'),
              'Endurance athlete or dual training sessions daily (x1.9)'
            )}
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>Workout Preferences 🏋️</Text>
            <Text style={styles.stepDesc}>
              Customize schedule, equipment, and split architecture.
            </Text>

            <Text style={styles.inputSectionLabel}>TRAINING DAYS PER WEEK: {trainingDays}</Text>
            <View style={styles.chipRow}>
              {[2, 3, 4, 5, 6].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[styles.chip, trainingDays === days && styles.chipActive]}
                  onPress={() => setTrainingDays(days)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      trainingDays === days && styles.chipTextActive,
                    ]}
                  >
                    {days} Days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputSectionLabel, { marginTop: 16 }]}>LOCATION</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  workoutLocation === 'gym' && styles.genderBtnActive,
                ]}
                onPress={() => setWorkoutLocation('gym')}
              >
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={workoutLocation === 'gym' ? AppColors.accent : AppColors.textSecondary}
                />
                <Text
                  style={[
                    styles.genderText,
                    workoutLocation === 'gym' && { color: AppColors.accent },
                  ]}
                >
                  Commercial Gym
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  workoutLocation === 'home' && styles.genderBtnActive,
                ]}
                onPress={() => setWorkoutLocation('home')}
              >
                <Ionicons
                  name="home-outline"
                  size={20}
                  color={workoutLocation === 'home' ? AppColors.accent : AppColors.textSecondary}
                />
                <Text
                  style={[
                    styles.genderText,
                    workoutLocation === 'home' && { color: AppColors.accent },
                  ]}
                >
                  Home Setup
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputSectionLabel, { marginTop: 16 }]}>PREFERRED SPLIT</Text>
            {renderOptionTile(
              'Push / Pull / Legs (PPL)',
              preferredSplit === 'push_pull_legs',
              () => setPreferredSplit('push_pull_legs')
            )}
            {renderOptionTile(
              'Upper / Lower',
              preferredSplit === 'upper_lower',
              () => setPreferredSplit('upper_lower')
            )}
            {renderOptionTile(
              'Full Body',
              preferredSplit === 'full_body',
              () => setPreferredSplit('full_body')
            )}

            <Text style={[styles.inputSectionLabel, { marginTop: 16 }]}>AVAILABLE EQUIPMENT</Text>
            <View style={styles.checklist}>
              {['barbell', 'dumbbells', 'cables', 'bench', 'pull_up_bar', 'squat_rack', 'bands'].map((eq) => {
                const isChecked = equipment.includes(eq);
                return (
                  <TouchableOpacity
                    key={eq}
                    style={[styles.checkItem, isChecked && styles.checkItemActive]}
                    onPress={() => toggleEquipment(eq)}
                  >
                    <Ionicons
                      name={isChecked ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isChecked ? AppColors.accent : AppColors.textMuted}
                    />
                    <Text
                      style={[
                        styles.checkText,
                        isChecked && { color: AppColors.white },
                      ]}
                    >
                      {eq.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 6:
        return (
          <View>
            <Text style={styles.stepTitle}>Nutrition Preferences 🥗</Text>
            <Text style={styles.stepDesc}>
              Tailor recipe suggestions and dietary macronutrient constraints.
            </Text>

            <Text style={styles.inputSectionLabel}>DIETARY STYLE</Text>
            {renderOptionTile(
              'Standard Non-Vegetarian',
              dietary === 'non_vegetarian',
              () => setDietary('non_vegetarian')
            )}
            {renderOptionTile(
              'Vegetarian',
              dietary === 'vegetarian',
              () => setDietary('vegetarian')
            )}
            {renderOptionTile(
              'Vegan',
              dietary === 'vegan',
              () => setDietary('vegan')
            )}
            {renderOptionTile(
              'Ketogenic (Low Carb)',
              dietary === 'keto',
              () => setDietary('keto')
            )}

            <Text style={[styles.inputSectionLabel, { marginTop: 16 }]}>ALLERGIES / RESTRICTIONS</Text>
            <View style={styles.checklist}>
              {['gluten_free', 'dairy_free', 'nut_allergy', 'egg_free'].map((res) => {
                const isChecked = restrictions.includes(res);
                return (
                  <TouchableOpacity
                    key={res}
                    style={[styles.checkItem, isChecked && styles.checkItemActive]}
                    onPress={() => toggleRestriction(res)}
                  >
                    <Ionicons
                      name={isChecked ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isChecked ? AppColors.accent : AppColors.textMuted}
                    />
                    <Text
                      style={[
                        styles.checkText,
                        isChecked && { color: AppColors.white },
                      ]}
                    >
                      {res.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 7:
        return (
          <View>
            <Text style={styles.stepTitle}>Deterministic Calculations 🧬</Text>
            <Text style={styles.stepDesc}>
              Calculated using the Mifflin-St Jeor formula & athletic macronutrient distribution.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>BASAL METABOLIC RATE (BMR)</Text>
                <Text style={styles.summaryValue}>{Math.round(bmr)} kcal</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>TOTAL DAILY EXPENDITURE (TDEE)</Text>
                <Text style={styles.summaryValue}>{Math.round(tdee)} kcal</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>DAILY CALORIE TARGET</Text>
                <Text style={[styles.summaryValue, { color: AppColors.accent, fontSize: 24 }]}>
                  {Math.round(targetCalories)} kcal
                </Text>
              </View>
            </View>

            <Text style={[styles.inputSectionLabel, { marginTop: 20 }]}>MACRONUTRIENT TARGETS</Text>
            <View style={styles.macroGrid}>
              <View style={styles.macroBox}>
                <Text style={styles.macroBoxLabel}>PROTEIN</Text>
                <Text style={[styles.macroBoxVal, { color: AppColors.accent }]}>
                  {Math.round(targetProteinG)}g
                </Text>
                <Text style={styles.macroBoxSub}>{(parsedWeight * 2.0).toFixed(1)}g/kg</Text>
              </View>

              <View style={styles.macroBox}>
                <Text style={styles.macroBoxLabel}>CARBS</Text>
                <Text style={[styles.macroBoxVal, { color: AppColors.cyan }]}>
                  {Math.round(targetCarbsG)}g
                </Text>
                <Text style={styles.macroBoxSub}>Energy Balance</Text>
              </View>

              <View style={styles.macroBox}>
                <Text style={styles.macroBoxLabel}>FAT</Text>
                <Text style={[styles.macroBoxVal, { color: AppColors.orange }]}>
                  {Math.round(targetFatG)}g
                </Text>
                <Text style={styles.macroBoxSub}>Hormone Health</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Progress Bar & Header */}
        <View style={styles.navBar}>
          {currentStep > 1 ? (
            <TouchableOpacity onPress={prevStep} style={styles.navBack}>
              <Ionicons name="chevron-back" size={22} color={AppColors.white} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
          <Text style={styles.stepIndicator}>
            STEP {currentStep} OF {totalSteps}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(currentStep / totalSteps) * 100}%` },
            ]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        <View style={styles.bottomBar}>
          <AppButton
            text={
              currentStep === totalSteps
                ? 'GENERATE FITNESS PROFILE & START'
                : 'CONTINUE'
            }
            onPress={nextStep}
            isLoading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: AppColors.surface,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: AppColors.accent,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  stepTitle: {
    color: AppColors.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  stepDesc: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 24,
  },
  inputSectionLabel: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: AppColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    gap: 8,
  },
  genderBtnActive: {
    borderColor: AppColors.accent,
    backgroundColor: `${AppColors.accent}14`,
  },
  genderText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  optionTile: {
    backgroundColor: AppColors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 16,
    marginBottom: 10,
  },
  optionTileSelected: {
    borderColor: AppColors.accent,
    backgroundColor: `${AppColors.accent}12`,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIconSelected: {
    backgroundColor: `${AppColors.accent}22`,
  },
  optionTitle: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  optionSub: {
    color: AppColors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioCircleSelected: {
    borderColor: AppColors.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.accent,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: AppColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  chipActive: {
    borderColor: AppColors.accent,
    backgroundColor: AppColors.accent,
  },
  chipText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: AppColors.black,
    fontWeight: '800',
  },
  checklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 8,
  },
  checkItemActive: {
    borderColor: AppColors.accent,
    backgroundColor: `${AppColors.accent}14`,
  },
  checkText: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: AppColors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  summaryItem: {
    paddingVertical: 8,
  },
  summaryLabel: {
    color: AppColors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryValue: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 4,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  macroBox: {
    flex: 1,
    backgroundColor: AppColors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
  },
  macroBoxLabel: {
    color: AppColors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  macroBoxVal: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  macroBoxSub: {
    color: AppColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    backgroundColor: AppColors.background,
  },
});

export default OnboardingScreen;
