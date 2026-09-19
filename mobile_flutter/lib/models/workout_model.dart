import 'exercise_model.dart';

class WorkoutExerciseModel {
  final int id;
  final int workoutDayId;
  final int exerciseId;
  final ExerciseModel exercise;
  final int orderInDay;
  final int targetSets;
  final String targetReps;
  final double targetRpe;
  final int restSeconds;
  final String? notes;

  WorkoutExerciseModel({
    required this.id,
    required this.workoutDayId,
    required this.exerciseId,
    required this.exercise,
    required this.orderInDay,
    required this.targetSets,
    required this.targetReps,
    required this.targetRpe,
    required this.restSeconds,
    this.notes,
  });

  factory WorkoutExerciseModel.fromJson(Map<String, dynamic> json) {
    return WorkoutExerciseModel(
      id: json['id'] ?? 0,
      workoutDayId: json['workout_day_id'] ?? 0,
      exerciseId: json['exercise_id'] ?? 0,
      exercise: ExerciseModel.fromJson(json['exercise'] ?? {}),
      orderInDay: json['order_in_day'] ?? 1,
      targetSets: json['target_sets'] ?? 3,
      targetReps: json['target_reps'] ?? '8-12',
      targetRpe: (json['target_rpe'] as num?)?.toDouble() ?? 8.0,
      restSeconds: json['rest_seconds'] ?? 90,
      notes: json['notes'],
    );
  }
}

class WorkoutDayModel {
  final int id;
  final int planId;
  final String dayName;
  final int dayOrder;
  final String focusArea;
  final String? description;
  final int estimatedMinutes;
  final bool isRestDay;
  final List<WorkoutExerciseModel> exercises;

  WorkoutDayModel({
    required this.id,
    required this.planId,
    required this.dayName,
    required this.dayOrder,
    required this.focusArea,
    this.description,
    required this.estimatedMinutes,
    required this.isRestDay,
    required this.exercises,
  });

  factory WorkoutDayModel.fromJson(Map<String, dynamic> json) {
    return WorkoutDayModel(
      id: json['id'] ?? 0,
      planId: json['plan_id'] ?? 0,
      dayName: json['day_name'] ?? 'Day',
      dayOrder: json['day_order'] ?? 1,
      focusArea: json['focus_area'] ?? 'Workout',
      description: json['description'],
      estimatedMinutes: json['estimated_minutes'] ?? 60,
      isRestDay: json['is_rest_day'] ?? false,
      exercises: (json['exercises'] as List? ?? [])
          .map((e) => WorkoutExerciseModel.fromJson(e))
          .toList(),
    );
  }
}

class WorkoutPlanModel {
  final int id;
  final int userId;
  final String title;
  final String? description;
  final String splitType;
  final String difficulty;
  final int daysPerWeek;
  final bool isActive;
  final bool createdByAi;
  final List<WorkoutDayModel> days;

  WorkoutPlanModel({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    required this.splitType,
    required this.difficulty,
    required this.daysPerWeek,
    required this.isActive,
    required this.createdByAi,
    required this.days,
  });

  factory WorkoutPlanModel.fromJson(Map<String, dynamic> json) {
    return WorkoutPlanModel(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      title: json['title'] ?? 'Custom Plan',
      description: json['description'],
      splitType: json['split_type'] ?? 'push_pull_legs',
      difficulty: json['difficulty'] ?? 'intermediate',
      daysPerWeek: json['days_per_week'] ?? 4,
      isActive: json['is_active'] ?? true,
      createdByAi: json['created_by_ai'] ?? false,
      days: (json['days'] as List? ?? [])
          .map((d) => WorkoutDayModel.fromJson(d))
          .toList(),
    );
  }
}

class SetLogModel {
  final int id;
  final int setNumber;
  final double weightKg;
  final int reps;
  final double? rpe;
  final bool isCompleted;
  final bool isWarmup;
  final bool isPr;
  final int? restSecondsTaken;

  SetLogModel({
    required this.id,
    required this.setNumber,
    required this.weightKg,
    required this.reps,
    this.rpe,
    required this.isCompleted,
    required this.isWarmup,
    required this.isPr,
    this.restSecondsTaken,
  });

  factory SetLogModel.fromJson(Map<String, dynamic> json) {
    return SetLogModel(
      id: json['id'] ?? 0,
      setNumber: json['set_number'] ?? 1,
      weightKg: (json['weight_kg'] as num?)?.toDouble() ?? 0.0,
      reps: json['reps'] ?? 0,
      rpe: (json['rpe'] as num?)?.toDouble(),
      isCompleted: json['is_completed'] ?? false,
      isWarmup: json['is_warmup'] ?? false,
      isPr: json['is_pr'] ?? false,
      restSecondsTaken: json['rest_seconds_taken'],
    );
  }
}

class ExerciseLogModel {
  final int id;
  final int exerciseId;
  final ExerciseModel exercise;
  final int orderInSession;
  final String? notes;
  final List<SetLogModel> sets;

  ExerciseLogModel({
    required this.id,
    required this.exerciseId,
    required this.exercise,
    required this.orderInSession,
    this.notes,
    required this.sets,
  });

  factory ExerciseLogModel.fromJson(Map<String, dynamic> json) {
    return ExerciseLogModel(
      id: json['id'] ?? 0,
      exerciseId: json['exercise_id'] ?? 0,
      exercise: ExerciseModel.fromJson(json['exercise'] ?? {}),
      orderInSession: json['order_in_session'] ?? 1,
      notes: json['notes'],
      sets: (json['sets'] as List? ?? [])
          .map((s) => SetLogModel.fromJson(s))
          .toList(),
    );
  }
}

class WorkoutSessionModel {
  final int id;
  final int userId;
  final int? workoutDayId;
  final String title;
  final String status;
  final DateTime startedAt;
  final DateTime? completedAt;
  final int durationSeconds;
  final double totalVolumeKg;
  final int totalSetsCompleted;
  final int totalRepsCompleted;
  final int prsHit;
  final String? userFeeling;
  final String? notes;
  final List<ExerciseLogModel> exerciseLogs;

  WorkoutSessionModel({
    required this.id,
    required this.userId,
    this.workoutDayId,
    required this.title,
    required this.status,
    required this.startedAt,
    this.completedAt,
    required this.durationSeconds,
    required this.totalVolumeKg,
    required this.totalSetsCompleted,
    required this.totalRepsCompleted,
    required this.prsHit,
    this.userFeeling,
    this.notes,
    required this.exerciseLogs,
  });

  factory WorkoutSessionModel.fromJson(Map<String, dynamic> json) {
    return WorkoutSessionModel(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      workoutDayId: json['workout_day_id'],
      title: json['title'] ?? 'Workout',
      status: json['status'] ?? 'in_progress',
      startedAt: DateTime.tryParse(json['started_at'] ?? '') ?? DateTime.now(),
      completedAt: json['completed_at'] != null ? DateTime.tryParse(json['completed_at']) : null,
      durationSeconds: json['duration_seconds'] ?? 0,
      totalVolumeKg: (json['total_volume_kg'] as num?)?.toDouble() ?? 0.0,
      totalSetsCompleted: json['total_sets_completed'] ?? 0,
      totalRepsCompleted: json['total_reps_completed'] ?? 0,
      prsHit: json['prs_hit'] ?? 0,
      userFeeling: json['user_feeling'],
      notes: json['notes'],
      exerciseLogs: (json['exercise_logs'] as List? ?? [])
          .map((e) => ExerciseLogModel.fromJson(e))
          .toList(),
    );
  }
}
