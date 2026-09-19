import 'package:flutter/foundation.dart';
import '../core/services/api_service.dart';
import '../models/progress_model.dart';

class ProgressProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  ProgressDashboardModel? _dashboard;
  bool _isLoading = false;

  ProgressDashboardModel? get dashboard => _dashboard;
  bool get isLoading => _isLoading;

  ProgressProvider() {
    fetchDashboard();
  }

  Future<void> fetchDashboard() async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _api.get('/progress/dashboard');
      if (data != null) {
        _dashboard = ProgressDashboardModel.fromJson(data);
      }
    } catch (e) {
      debugPrint("Progress fetch error: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logWeight(double weightKg, {double? bodyFatPct, String? notes}) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _api.post('/progress/weight', body: {
        'weight_kg': weightKg,
        'body_fat_pct': bodyFatPct,
        'notes': notes,
      });
      await fetchDashboard();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logMeasurements({
    double? chestCm,
    double? waistCm,
    double? hipsCm,
    double? leftArmCm,
    double? rightArmCm,
    double? leftThighCm,
    double? rightThighCm,
    double? shouldersCm,
    double? calvesCm,
    String? notes,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _api.post('/progress/measurements', body: {
        'chest_cm': chestCm,
        'waist_cm': waistCm,
        'hips_cm': hipsCm,
        'left_arm_cm': leftArmCm,
        'right_arm_cm': rightArmCm,
        'left_thigh_cm': leftThighCm,
        'right_thigh_cm': rightThighCm,
        'shoulders_cm': shouldersCm,
        'calves_cm': calvesCm,
        'notes': notes,
      });
      await fetchDashboard();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
