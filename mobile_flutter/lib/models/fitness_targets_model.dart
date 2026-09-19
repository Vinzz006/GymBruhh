class FitnessTargetsModel {
  final double bmi;
  final String bmiCategory;
  final double bmr;
  final double tdee;
  final double targetCalories;
  final double targetProteinGrams;
  final double targetCarbsGrams;
  final double targetFatGrams;
  final String? notes;

  FitnessTargetsModel({
    required this.bmi,
    required this.bmiCategory,
    required this.bmr,
    required this.tdee,
    required this.targetCalories,
    required this.targetProteinGrams,
    required this.targetCarbsGrams,
    required this.targetFatGrams,
    this.notes,
  });

  factory FitnessTargetsModel.fromJson(Map<String, dynamic> json) {
    return FitnessTargetsModel(
      bmi: (json['bmi'] as num?)?.toDouble() ?? 22.0,
      bmiCategory: json['bmi_category'] ?? 'Normal',
      bmr: (json['bmr'] as num?)?.toDouble() ?? 1700.0,
      tdee: (json['tdee'] as num?)?.toDouble() ?? 2400.0,
      targetCalories: (json['target_calories'] as num?)?.toDouble() ?? 2400.0,
      targetProteinGrams: (json['target_protein_grams'] as num?)?.toDouble() ?? 160.0,
      targetCarbsGrams: (json['target_carbs_grams'] as num?)?.toDouble() ?? 220.0,
      targetFatGrams: (json['target_fat_grams'] as num?)?.toDouble() ?? 70.0,
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bmi': bmi,
      'bmi_category': bmiCategory,
      'bmr': bmr,
      'tdee': tdee,
      'target_calories': targetCalories,
      'target_protein_grams': targetProteinGrams,
      'target_carbs_grams': targetCarbsGrams,
      'target_fat_grams': targetFatGrams,
      'notes': notes,
    };
  }
}
