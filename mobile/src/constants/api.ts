import { Platform } from 'react-native';

export const DEV_PC_IP = '10.231.192.29';

export const getDefaultBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    // Connects to your PC via Wi-Fi / Hotspot
    return `http://${DEV_PC_IP}:8000/api`;
  }
  // iOS simulator, macOS, or web
  return 'http://127.0.0.1:8000/api';
};

export const API_ENDPOINTS = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  forgotPassword: '/auth/forgot-password',

  // Profile & Targets
  profile: '/profile',
  onboarding: '/profile/onboarding',
  targets: '/profile/targets',

  // Workouts
  activePlan: '/workouts/plans/active',
  plans: '/workouts/plans',
  todayWorkout: '/workouts/today',
  sessions: '/workouts/sessions',
  activeSession: '/workouts/sessions/active',
  startSession: '/workouts/sessions/start',
  sessionSets: (sessionId: number) => `/workouts/sessions/${sessionId}/sets`,
  completeSession: (sessionId: number) => `/workouts/sessions/${sessionId}/complete`,

  // Exercises
  exercises: '/exercises',
  exerciseCategories: '/exercises/categories',
  exerciseSubstitutions: (id: number) => `/exercises/${id}/substitutions`,

  // Nutrition
  todayNutrition: '/nutrition/today',
  logMeal: '/nutrition/meals',
  deleteMeal: (mealId: number) => `/nutrition/meals/${mealId}`,
  searchFoods: '/nutrition/foods/search',
  customFood: '/nutrition/custom-food',
  logWater: '/nutrition/water',

  // Progress
  progressDashboard: '/progress/dashboard',
  logWeight: '/progress/weight',
  logMeasurements: '/progress/measurements',
  personalRecords: '/progress/prs',

  // AI Intelligence
  generateWorkout: '/ai/workout/generate',
  suggestMeal: '/ai/nutrition/suggest',
  replaceExercise: '/ai/exercise/replace',
  analyzeProgress: '/ai/progress/analyze',
  chatTrainer: '/ai/chat',
  chatHistory: '/ai/chat/history',
  scanFood: '/ai/vision/food',
  recommendations: '/ai/recommendations',
  respondRecommendation: '/ai/recommendations/respond',

  // Settings
  settings: '/settings',
};
