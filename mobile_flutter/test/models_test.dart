import 'package:flutter_test/flutter_test.dart';
import '../lib/models/user_model.dart';
import '../lib/models/profile_model.dart';
import '../lib/models/fitness_targets_model.dart';
import '../lib/models/exercise_model.dart';
import '../lib/models/workout_model.dart';
import '../lib/models/nutrition_model.dart';
import '../lib/models/progress_model.dart';
import '../lib/models/ai_model.dart';

void main() {
  group('Mobile Data Models JSON Deserialization Tests', () {
    test('UserModel fromJson & toJson', () {
      final json = {
        'id': 1,
        'email': 'athlete@gymbruhh.test',
        'full_name': 'Marcus Kane',
        'is_onboarded': true,
      };

      final user = UserModel.fromJson(json);
      expect(user.id, equals(1));
      expect(user.email, equals('athlete@gymbruhh.test'));
      expect(user.fullName, equals('Marcus Kane'));
      expect(user.isOnboarded, isTrue);

      final outJson = user.toJson();
      expect(outJson['email'], equals('athlete@gymbruhh.test'));
    });

    test('FitnessTargetsModel fromJson & toJson', () {
      final json = {
        'bmi': 23.5,
        'bmi_category': 'Normal',
        'bmr': 1750.0,
        'tdee': 2500.0,
        'target_calories': 2700.0,
        'target_protein_grams': 160.0,
        'target_carbs_grams': 300.0,
        'target_fat_grams': 75.0,
        'notes': 'Caloric surplus for hypertrophy',
      };

      final targets = FitnessTargetsModel.fromJson(json);
      expect(targets.bmi, equals(23.5));
      expect(targets.targetCalories, equals(2700.0));
      expect(targets.targetProteinGrams, equals(160.0));
    });

    test('ExerciseModel fromJson', () {
      final json = {
        'id': 101,
        'name': 'Barbell Bench Press',
        'primary_muscle': 'chest',
        'secondary_muscles': ['shoulders', 'triceps'],
        'equipment': 'barbell',
        'difficulty': 'intermediate',
        'instructions': 'Lie flat on bench, lower bar with control to mid-chest, drive up.',
      };

      final ex = ExerciseModel.fromJson(json);
      expect(ex.name, equals('Barbell Bench Press'));
      expect(ex.primaryMuscle, equals('chest'));
      expect(ex.equipment, equals('barbell'));
    });

    test('DailyNutritionModel fromJson', () {
      final json = {
        'date': '2026-08-30',
        'target_calories': 2500.0,
        'target_protein_g': 160.0,
        'target_carbs_g': 250.0,
        'target_fat_g': 70.0,
        'total_calories': 1850.0,
        'total_protein_g': 140.0,
        'total_carbs_g': 190.0,
        'total_fat_g': 55.0,
        'total_fiber_g': 28.0,
        'water_ml': 2250,
        'meals': [
          {
            'id': 1,
            'meal_type': 'breakfast',
            'food_name': 'Oats with Whey & Berries',
            'serving_qty': 1.0,
            'serving_unit': 'bowl',
            'calories': 520.0,
            'protein_g': 42.0,
            'carbs_g': 68.0,
            'fat_g': 8.0,
            'fiber_g': 9.0,
            'logged_at': '2026-08-30T08:30:00Z',
          }
        ]
      };

      final daily = DailyNutritionModel.fromJson(json);
      expect(daily.totalCalories, equals(1850.0));
      expect(daily.meals.length, equals(1));
      expect(daily.meals.first.foodName, equals('Oats with Whey & Berries'));
    });

    test('ProgressDashboardModel fromJson', () {
      final json = {
        'current_weight_kg': 80.5,
        'starting_weight_kg': 76.0,
        'target_weight_kg': 85.0,
        'weight_delta_kg': 4.5,
        'total_workouts_completed': 24,
        'total_volume_kg': 48500.0,
        'weekly_consistency_count': 4,
        'weight_history': [
          {'date': '2026-08-01', 'weight_kg': 76.0},
          {'date': '2026-08-15', 'weight_kg': 78.5},
          {'date': '2026-08-30', 'weight_kg': 80.5},
        ],
        'personal_records': [
          {'exercise_name': 'Barbell Bench Press', 'max_weight_kg': 105.0, 'max_reps': 5, 'estimated_1rm_kg': 118.1}
        ]
      };

      final progress = ProgressDashboardModel.fromJson(json);
      expect(progress.currentWeightKg, equals(80.5));
      expect(progress.totalWorkoutsCompleted, equals(24));
      expect(progress.weightHistory.length, equals(3));
      expect(progress.personalRecords.length, equals(1));
    });

    test('AIRecommendationModel fromJson', () {
      final json = {
        'id': 1,
        'recommendation_type': 'progressive_overload',
        'title': 'Increase Bench Press to 82.5kg',
        'recommendation_text': 'You hit all target reps on Bench Press across 4 consecutive sets. Progressive overload target: +2.5kg.',
        'exercise_id': 101,
        'suggested_weight_kg': 82.5,
        'is_accepted': false,
        'created_at': '2026-08-30T10:00:00Z',
      };

      final rec = AIRecommendationModel.fromJson(json);
      expect(rec.title, equals('Increase Bench Press to 82.5kg'));
      expect(rec.suggestedWeightKg, equals(82.5));
      expect(rec.isAccepted, isFalse);
    });
  });
}
