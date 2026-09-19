import 'package:flutter/foundation.dart';
import '../core/services/api_service.dart';
import '../models/nutrition_model.dart';

class NutritionProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  DailyNutritionModel? _todayNutrition;
  List<FoodItemModel> _searchResults = [];
  bool _isLoading = false;

  DailyNutritionModel? get todayNutrition => _todayNutrition;
  List<FoodItemModel> get searchResults => _searchResults;
  bool get isLoading => _isLoading;

  NutritionProvider() {
    fetchTodayNutrition();
  }

  Future<void> fetchTodayNutrition() async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _api.get('/nutrition/today');
      if (data != null) {
        _todayNutrition = DailyNutritionModel.fromJson(data);
      }
    } catch (e) {
      debugPrint("Nutrition fetch error: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> searchFoods(String query) async {
    if (query.isEmpty) {
      _searchResults = [];
      notifyListeners();
      return;
    }
    try {
      final list = await _api.get('/nutrition/foods/search?query=${Uri.encodeComponent(query)}');
      if (list is List) {
        _searchResults = list.map((f) => FoodItemModel.fromJson(f)).toList();
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> logMeal({
    int? foodItemId,
    required String mealType,
    required String foodName,
    double servingQty = 1.0,
    String servingUnit = 'serving',
    required double calories,
    double proteinG = 0.0,
    double carbsG = 0.0,
    double fatG = 0.0,
    double fiberG = 0.0,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _api.post('/nutrition/meals', body: {
        'food_item_id': foodItemId,
        'meal_type': mealType,
        'food_name': foodName,
        'serving_qty': servingQty,
        'serving_unit': servingUnit,
        'calories': calories,
        'protein_g': proteinG,
        'carbs_g': carbsG,
        'fat_g': fatG,
        'fiber_g': fiberG,
      });
      await fetchTodayNutrition();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteMeal(int mealId) async {
    try {
      await _api.delete('/nutrition/meals/$mealId');
      await fetchTodayNutrition();
    } catch (e) {
      debugPrint("Error deleting meal: $e");
    }
  }

  Future<void> logWater({int amountMl = 250}) async {
    try {
      await _api.post('/nutrition/water?amount_ml=$amountMl');
      await fetchTodayNutrition();
    } catch (e) {
      debugPrint("Error logging water: $e");
    }
  }
}
