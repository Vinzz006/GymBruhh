import 'package:flutter/foundation.dart';
import '../core/services/api_service.dart';
import '../core/services/storage_service.dart';
import '../models/user_model.dart';
import '../models/profile_model.dart';
import '../models/fitness_targets_model.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  UserModel? _user;
  FitnessProfileModel? _profile;
  FitnessTargetsModel? _targets;
  bool _isLoading = true;
  String _unitSystem = "metric";

  UserModel? get user => _user;
  FitnessProfileModel? get profile => _profile;
  FitnessTargetsModel? get targets => _targets;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  String get unitSystem => _unitSystem;

  AuthProvider() {
    init();
  }

  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    try {
      _unitSystem = await StorageService.getUnit();
      final token = await StorageService.getToken();
      if (token != null && token.isNotEmpty) {
        final userData = await _api.get('/auth/me');
        if (userData != null) {
          _user = UserModel.fromJson(userData);
          if (_user!.isOnboarded) {
            await _fetchProfileAndTargets();
          }
        }
      }
    } catch (e) {
      debugPrint("Auth init error: $e");
      await StorageService.clearToken();
      _user = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshUserData() async {
    try {
      final token = await StorageService.getToken();
      if (token != null && token.isNotEmpty) {
        final userData = await _api.get('/auth/me');
        if (userData != null) {
          _user = UserModel.fromJson(userData);
        }
        if (_user?.isOnboarded == true) {
          await _fetchProfileAndTargets();
        }
      }
      notifyListeners();
    } catch (e) {
      debugPrint("Refresh user data error: $e");
    }
  }

  Future<void> _fetchProfileAndTargets() async {
    try {
      final pData = await _api.get('/profile');
      if (pData != null) _profile = FitnessProfileModel.fromJson(pData);
    } catch (_) {}

    try {
      final tData = await _api.get('/profile/targets');
      if (tData != null) _targets = FitnessTargetsModel.fromJson(tData);
    } catch (_) {}
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.post('/auth/login', body: {
        'email': email.trim(),
        'password': password,
      });
      final token = res['access_token'];
      await StorageService.saveToken(token);
      _user = UserModel.fromJson(res['user']);
      if (_user!.isOnboarded) {
        await _fetchProfileAndTargets();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(String fullName, String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.post('/auth/register', body: {
        'full_name': fullName.trim(),
        'email': email.trim(),
        'password': password,
      });
      final token = res['access_token'];
      await StorageService.saveToken(token);
      _user = UserModel.fromJson(res['user']);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> completeOnboarding(Map<String, dynamic> onboardingData) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.post('/profile/onboarding', body: onboardingData);
      if (res['profile'] != null) {
        _profile = FitnessProfileModel.fromJson(res['profile']);
      }
      if (res['targets'] != null) {
        _targets = FitnessTargetsModel.fromJson(res['targets']);
      }
      if (_user != null) {
        _user = UserModel(
          id: _user!.id,
          email: _user!.email,
          fullName: _user!.fullName,
          isOnboarded: true,
        );
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> setUnitSystem(String unit) async {
    _unitSystem = unit;
    await StorageService.saveUnit(unit);
    notifyListeners();
  }

  Future<void> logout() async {
    await StorageService.clearToken();
    _user = null;
    _profile = null;
    _targets = null;
    notifyListeners();
  }
}
