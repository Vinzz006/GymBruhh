export 'fitness_targets_model.dart';

class FitnessProfileModel {
  final int id;
  final int userId;
  final int age;
  final String gender;
  final double heightCm;
  final double currentWeightKg;
  final double? targetWeightKg;
  final String fitnessLevel;
  final String primaryGoal;
  final String activityLevel;
  final int trainingDaysPerWeek;
  final int workoutDurationMinutes;
  final String workoutLocation;
  final List<String> equipmentAvailable;
  final String preferredSplit;
  final String dietaryPreference;
  final List<String> allergiesRestrictions;

  FitnessProfileModel({
    required this.id,
    required this.userId,
    required this.age,
    required this.gender,
    required this.heightCm,
    required this.currentWeightKg,
    this.targetWeightKg,
    required this.fitnessLevel,
    required this.primaryGoal,
    required this.activityLevel,
    required this.trainingDaysPerWeek,
    required this.workoutDurationMinutes,
    required this.workoutLocation,
    required this.equipmentAvailable,
    required this.preferredSplit,
    required this.dietaryPreference,
    required this.allergiesRestrictions,
  });

  factory FitnessProfileModel.fromJson(Map<String, dynamic> json) {
    return FitnessProfileModel(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      age: json['age'] ?? 25,
      gender: json['gender'] ?? 'male',
      heightCm: (json['height_cm'] as num?)?.toDouble() ?? 175.0,
      currentWeightKg: (json['current_weight_kg'] as num?)?.toDouble() ?? 70.0,
      targetWeightKg: (json['target_weight_kg'] as num?)?.toDouble(),
      fitnessLevel: json['fitness_level'] ?? 'beginner',
      primaryGoal: json['primary_goal'] ?? 'muscle_gain',
      activityLevel: json['activity_level'] ?? 'moderately_active',
      trainingDaysPerWeek: json['training_days_per_week'] ?? 4,
      workoutDurationMinutes: json['workout_duration_minutes'] ?? 60,
      workoutLocation: json['workout_location'] ?? 'gym',
      equipmentAvailable: List<String>.from(json['equipment_available'] ?? []),
      preferredSplit: json['preferred_split'] ?? 'push_pull_legs',
      dietaryPreference: json['dietary_preference'] ?? 'non_vegetarian',
      allergiesRestrictions: List<String>.from(json['allergies_restrictions'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'age': age,
      'gender': gender,
      'height_cm': heightCm,
      'current_weight_kg': currentWeightKg,
      'target_weight_kg': targetWeightKg,
      'fitness_level': fitnessLevel,
      'primary_goal': primaryGoal,
      'activity_level': activityLevel,
      'training_days_per_week': trainingDaysPerWeek,
      'workout_duration_minutes': workoutDurationMinutes,
      'workout_location': workoutLocation,
      'equipment_available': equipmentAvailable,
      'preferred_split': preferredSplit,
      'dietary_preference': dietaryPreference,
      'allergies_restrictions': allergiesRestrictions,
    };
  }
}
