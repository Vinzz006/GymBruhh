class WeightLogModel {
  final int id;
  final double weightKg;
  final double? bodyFatPct;
  final String? notes;
  final String logDate;

  WeightLogModel({
    required this.id,
    required this.weightKg,
    this.bodyFatPct,
    this.notes,
    required this.logDate,
  });

  factory WeightLogModel.fromJson(Map<String, dynamic> json) {
    return WeightLogModel(
      id: json['id'] ?? 0,
      weightKg: (json['weight_kg'] as num?)?.toDouble() ?? 0.0,
      bodyFatPct: (json['body_fat_pct'] as num?)?.toDouble(),
      notes: json['notes'],
      logDate: json['log_date'] ?? '',
    );
  }
}

class BodyMeasurementModel {
  final int id;
  final double? chestCm;
  final double? waistCm;
  final double? hipsCm;
  final double? leftArmCm;
  final double? rightArmCm;
  final double? leftThighCm;
  final double? rightThighCm;
  final double? shouldersCm;
  final double? calvesCm;
  final String? notes;
  final String logDate;

  BodyMeasurementModel({
    required this.id,
    this.chestCm,
    this.waistCm,
    this.hipsCm,
    this.leftArmCm,
    this.rightArmCm,
    this.leftThighCm,
    this.rightThighCm,
    this.shouldersCm,
    this.calvesCm,
    this.notes,
    required this.logDate,
  });

  factory BodyMeasurementModel.fromJson(Map<String, dynamic> json) {
    return BodyMeasurementModel(
      id: json['id'] ?? 0,
      chestCm: (json['chest_cm'] as num?)?.toDouble(),
      waistCm: (json['waist_cm'] as num?)?.toDouble(),
      hipsCm: (json['hips_cm'] as num?)?.toDouble(),
      leftArmCm: (json['left_arm_cm'] as num?)?.toDouble(),
      rightArmCm: (json['right_arm_cm'] as num?)?.toDouble(),
      leftThighCm: (json['left_thigh_cm'] as num?)?.toDouble(),
      rightThighCm: (json['right_thigh_cm'] as num?)?.toDouble(),
      shouldersCm: (json['shoulders_cm'] as num?)?.toDouble(),
      calvesCm: (json['calves_cm'] as num?)?.toDouble(),
      notes: json['notes'],
      logDate: json['log_date'] ?? '',
    );
  }
}

class PersonalRecordModel {
  final int id;
  final int exerciseId;
  final String exerciseName;
  final double weightKg;
  final int reps;
  final double estimated1rmKg;
  final DateTime achievedAt;

  PersonalRecordModel({
    required this.id,
    required this.exerciseId,
    required this.exerciseName,
    required this.weightKg,
    required this.reps,
    required this.estimated1rmKg,
    required this.achievedAt,
  });

  factory PersonalRecordModel.fromJson(Map<String, dynamic> json) {
    return PersonalRecordModel(
      id: json['id'] ?? 0,
      exerciseId: json['exercise_id'] ?? 0,
      exerciseName: json['exercise_name'] ?? 'Exercise',
      weightKg: (json['weight_kg'] as num?)?.toDouble() ?? 0.0,
      reps: json['reps'] ?? 0,
      estimated1rmKg: (json['estimated_1rm_kg'] as num?)?.toDouble() ?? 0.0,
      achievedAt: DateTime.tryParse(json['achieved_at'] ?? '') ?? DateTime.now(),
    );
  }
}

class ProgressDashboardModel {
  final double currentWeightKg;
  final double startingWeightKg;
  final double? targetWeightKg;
  final double totalWeightChangeKg;
  final int totalWorkoutsCompleted;
  final double weeklyFrequency;
  final double totalVolumeKg;
  final List<WeightLogModel> weightHistory;
  final List<BodyMeasurementModel> recentMeasurements;
  final List<PersonalRecordModel> personalRecords;

  ProgressDashboardModel({
    required this.currentWeightKg,
    required this.startingWeightKg,
    this.targetWeightKg,
    required this.totalWeightChangeKg,
    required this.totalWorkoutsCompleted,
    required this.weeklyFrequency,
    required this.totalVolumeKg,
    required this.weightHistory,
    required this.recentMeasurements,
    required this.personalRecords,
  });

  factory ProgressDashboardModel.fromJson(Map<String, dynamic> json) {
    return ProgressDashboardModel(
      currentWeightKg: (json['current_weight_kg'] as num?)?.toDouble() ?? 70.0,
      startingWeightKg: (json['starting_weight_kg'] as num?)?.toDouble() ?? 70.0,
      targetWeightKg: (json['target_weight_kg'] as num?)?.toDouble(),
      totalWeightChangeKg: (json['total_weight_change_kg'] as num?)?.toDouble() ?? 0.0,
      totalWorkoutsCompleted: json['total_workouts_completed'] ?? 0,
      weeklyFrequency: (json['weekly_frequency'] as num?)?.toDouble() ?? 0.0,
      totalVolumeKg: (json['total_volume_kg'] as num?)?.toDouble() ?? 0.0,
      weightHistory: (json['weight_history'] as List? ?? [])
          .map((w) => WeightLogModel.fromJson(w))
          .toList(),
      recentMeasurements: (json['recent_measurements'] as List? ?? [])
          .map((m) => BodyMeasurementModel.fromJson(m))
          .toList(),
      personalRecords: (json['personal_records'] as List? ?? [])
          .map((p) => PersonalRecordModel.fromJson(p))
          .toList(),
    );
  }
}
