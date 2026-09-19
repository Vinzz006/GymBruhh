import 'dart:io';

class ApiConstants {
  // Use 10.0.2.2 for Android Emulator, localhost for iOS/Web, or custom LAN IP
  static String get baseUrl {
    try {
      if (Platform.isAndroid) {
        return "http://10.0.2.2:8000/api";
      }
    } catch (_) {}
    return "http://127.0.0.1:8000/api";
  }

  // Endpoints
  static const String login = "/auth/login";
  static const String register = "/auth/register";
  static const String me = "/auth/me";
  static const String forgotPassword = "/auth/forgot-password";

  static const String profile = "/profile";
  static const String onboarding = "/profile/onboarding";
  static const String targets = "/profile/targets";

  static const String activePlan = "/workouts/plans/active";
  static const String plans = "/workouts/plans";
  static const String todayWorkout = "/workouts/today";
  static const String sessions = "/workouts/sessions";
  static const String activeSession = "/workouts/sessions/active";
  static const String startSession = "/workouts/sessions/start";

  static const String exercises = "/exercises";
  static const String exerciseCategories = "/exercises/categories";

  static const String todayNutrition = "/nutrition/today";
  static const String logMeal = "/nutrition/meals";
  static const String searchFoods = "/nutrition/foods/search";
  static const String customFood = "/nutrition/custom-food";
  static const String logWater = "/nutrition/water";

  static const String progressDashboard = "/progress/dashboard";
  static const String logWeight = "/progress/weight";
  static const String logMeasurements = "/progress/measurements";
  static const String personalRecords = "/progress/prs";

  static const String generateWorkout = "/ai/workout/generate";
  static const String suggestMeal = "/ai/nutrition/suggest";
  static const String replaceExercise = "/ai/exercise/replace";
  static const String analyzeProgress = "/ai/progress/analyze";
  static const String chatTrainer = "/ai/chat";
  static const String chatHistory = "/ai/chat/history";
  static const String scanFood = "/ai/vision/food";
  static const String recommendations = "/ai/recommendations";
  static const String respondRecommendation = "/ai/recommendations/respond";

  static const String settings = "/settings";
}
