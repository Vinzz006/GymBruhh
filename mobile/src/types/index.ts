export interface User {
  id: number;
  email: string;
  fullName: string;
  isOnboarded: boolean;
  role?: string;
  createdAt?: string;
}

export interface FitnessProfile {
  id: number;
  userId: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: 'fat_loss' | 'muscle_gain' | 'maintenance' | 'strength';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  trainingDaysPerWeek: number;
  workoutDurationMinutes: number;
  workoutLocation: string;
  equipmentAvailable: string[];
  preferredSplit: string;
  dietaryPreference: string;
  allergiesRestrictions: string[];
}

export interface FitnessTargets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  waterIntakeMl?: number;
}

export interface Exercise {
  id: number;
  name: string;
  slug?: string;
  primaryMuscle: string;
  secondaryMuscles?: string[];
  category: string;
  equipment: string;
  difficulty: string;
  instructions: string;
  safetyNotes?: string;
  tips?: string[];
}

export interface WorkoutPlanExercise {
  id: number;
  workoutDayId: number;
  exerciseId: number;
  orderIndex: number;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  notes?: string;
  exercise: Exercise;
}

export interface WorkoutDay {
  id: number;
  workoutPlanId: number;
  dayName: string;
  focusArea: string;
  orderIndex: number;
  estimatedMinutes: number;
  description?: string;
  exercises: WorkoutPlanExercise[];
}

export interface WorkoutPlan {
  id: number;
  userId: number;
  title: string;
  description?: string;
  splitType: string;
  isActive: boolean;
  generatedByAi: boolean;
  days: WorkoutDay[];
}

export interface WorkoutSet {
  id: number;
  workoutSessionId: number;
  exerciseId: number;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  isCompleted: boolean;
  isPr?: boolean;
}

export interface WorkoutSession {
  id: number;
  userId: number;
  workoutDayId?: number;
  title: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  totalVolumeKg?: number;
  userFeeling?: string;
  notes?: string;
  sets: WorkoutSet[];
}

export interface FoodItem {
  id: number;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  isCustom?: boolean;
}

export interface MealEntry {
  id: number;
  userId: number;
  foodItemId?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  servingQty: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  loggedAt: string;
}

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  waterIntakeMl: number;
  meals: MealEntry[];
}

export interface PersonalRecord {
  id: number;
  exerciseId: number;
  exerciseName: string;
  weightKg: number;
  reps: number;
  estimatedOneRepMax: number;
  achievedAt: string;
}

export interface WeightEntry {
  id: number;
  weightKg: number;
  bodyFatPct?: number;
  notes?: string;
  recordedAt: string;
}

export interface MeasurementEntry {
  id: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  leftArmCm?: number;
  rightArmCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  shouldersCm?: number;
  calvesCm?: number;
  notes?: string;
  recordedAt: string;
}

export interface ProgressDashboard {
  currentWeightKg: number;
  startWeightKg: number;
  targetWeightKg: number;
  totalWorkoutsCompleted: number;
  totalVolumeLiftedKg: number;
  activeStreakWeeks: number;
  recentWeights: WeightEntry[];
  recentMeasurements: MeasurementEntry[];
  personalRecords: PersonalRecord[];
}

export interface ChatMessage {
  id?: number | string;
  sender: 'user' | 'assistant';
  content: string;
  createdAt: string | Date;
}

export interface AIRecommendation {
  id: number;
  recommendationType: string;
  title: string;
  recommendationText: string;
  suggestedAction?: Record<string, any>;
  status: 'pending' | 'accepted' | 'rejected';
}
