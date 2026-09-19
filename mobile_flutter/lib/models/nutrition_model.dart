class FoodItemModel {
  final int id;
  final String name;
  final String? brand;
  final String category;
  final double servingSizeQty;
  final String servingSizeUnit;
  final double calories;
  final double proteinG;
  final double carbsG;
  final double fatG;
  final double fiberG;
  final bool isCustom;

  FoodItemModel({
    required this.id,
    required this.name,
    this.brand,
    required this.category,
    required this.servingSizeQty,
    required this.servingSizeUnit,
    required this.calories,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
    this.fiberG = 0.0,
    this.isCustom = false,
  });

  factory FoodItemModel.fromJson(Map<String, dynamic> json) {
    return FoodItemModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      brand: json['brand'],
      category: json['category'] ?? 'general',
      servingSizeQty: (json['serving_size_qty'] as num?)?.toDouble() ?? 100.0,
      servingSizeUnit: json['serving_size_unit'] ?? 'g',
      calories: (json['calories'] as num?)?.toDouble() ?? 0.0,
      proteinG: (json['protein_g'] as num?)?.toDouble() ?? 0.0,
      carbsG: (json['carbs_g'] as num?)?.toDouble() ?? 0.0,
      fatG: (json['fat_g'] as num?)?.toDouble() ?? 0.0,
      fiberG: (json['fiber_g'] as num?)?.toDouble() ?? 0.0,
      isCustom: json['is_custom'] ?? false,
    );
  }
}

class MealLogModel {
  final int id;
  final int userId;
  final int? foodItemId;
  final String mealType;
  final String foodName;
  final double servingQty;
  final String servingUnit;
  final double calories;
  final double proteinG;
  final double carbsG;
  final double fatG;
  final double fiberG;
  final DateTime loggedAt;

  MealLogModel({
    required this.id,
    required this.userId,
    this.foodItemId,
    required this.mealType,
    required this.foodName,
    required this.servingQty,
    required this.servingUnit,
    required this.calories,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
    this.fiberG = 0.0,
    required this.loggedAt,
  });

  factory MealLogModel.fromJson(Map<String, dynamic> json) {
    return MealLogModel(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      foodItemId: json['food_item_id'],
      mealType: json['meal_type'] ?? 'breakfast',
      foodName: json['food_name'] ?? '',
      servingQty: (json['serving_qty'] as num?)?.toDouble() ?? 1.0,
      servingUnit: json['serving_unit'] ?? 'serving',
      calories: (json['calories'] as num?)?.toDouble() ?? 0.0,
      proteinG: (json['protein_g'] as num?)?.toDouble() ?? 0.0,
      carbsG: (json['carbs_g'] as num?)?.toDouble() ?? 0.0,
      fatG: (json['fat_g'] as num?)?.toDouble() ?? 0.0,
      fiberG: (json['fiber_g'] as num?)?.toDouble() ?? 0.0,
      loggedAt: DateTime.tryParse(json['logged_at'] ?? '') ?? DateTime.now(),
    );
  }
}

class DailyNutritionModel {
  final String logDate;
  final double totalCalories;
  final double totalProteinG;
  final double totalCarbsG;
  final double totalFatG;
  final double targetCalories;
  final double targetProteinG;
  final double targetCarbsG;
  final double targetFatG;
  final double remainingCalories;
  final double remainingProteinG;
  final double remainingCarbsG;
  final double remainingFatG;
  final int waterMl;
  final List<MealLogModel> meals;

  DailyNutritionModel({
    required this.logDate,
    required this.totalCalories,
    required this.totalProteinG,
    required this.totalCarbsG,
    required this.totalFatG,
    required this.targetCalories,
    required this.targetProteinG,
    required this.targetCarbsG,
    required this.targetFatG,
    required this.remainingCalories,
    required this.remainingProteinG,
    required this.remainingCarbsG,
    required this.remainingFatG,
    required this.waterMl,
    required this.meals,
  });

  factory DailyNutritionModel.fromJson(Map<String, dynamic> json) {
    return DailyNutritionModel(
      logDate: json['log_date'] ?? '',
      totalCalories: (json['total_calories'] as num?)?.toDouble() ?? 0.0,
      totalProteinG: (json['total_protein_g'] as num?)?.toDouble() ?? 0.0,
      totalCarbsG: (json['total_carbs_g'] as num?)?.toDouble() ?? 0.0,
      totalFatG: (json['total_fat_g'] as num?)?.toDouble() ?? 0.0,
      targetCalories: (json['target_calories'] as num?)?.toDouble() ?? 2200.0,
      targetProteinG: (json['target_protein_g'] as num?)?.toDouble() ?? 150.0,
      targetCarbsG: (json['target_carbs_g'] as num?)?.toDouble() ?? 220.0,
      targetFatG: (json['target_fat_g'] as num?)?.toDouble() ?? 70.0,
      remainingCalories: (json['remaining_calories'] as num?)?.toDouble() ?? 0.0,
      remainingProteinG: (json['remaining_protein_g'] as num?)?.toDouble() ?? 0.0,
      remainingCarbsG: (json['remaining_carbs_g'] as num?)?.toDouble() ?? 0.0,
      remainingFatG: (json['remaining_fat_g'] as num?)?.toDouble() ?? 0.0,
      waterMl: json['water_ml'] ?? 0,
      meals: (json['meals'] as List? ?? [])
          .map((m) => MealLogModel.fromJson(m))
          .toList(),
    );
  }
}
