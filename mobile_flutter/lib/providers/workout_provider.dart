import 'dart:async';
import 'package:flutter/foundation.dart';
import '../core/services/api_service.dart';
import '../models/workout_model.dart';
import '../models/exercise_model.dart';

class WorkoutProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  WorkoutPlanModel? _activePlan;
  WorkoutSessionModel? _activeSession;
  Map<String, dynamic>? _todayWorkout;
  List<ExerciseModel> _exercises = [];
  bool _isLoading = false;

  int _elapsedSeconds = 0;
  Timer? _sessionTimer;

  int _restTimerSeconds = 0;
  bool _isRestTimerActive = false;
  Timer? _restTimer;

  Map<String, dynamic>? _lastSummary;

  WorkoutPlanModel? get activePlan => _activePlan;
  WorkoutSessionModel? get activeSession => _activeSession;
  Map<String, dynamic>? get todayWorkout => _todayWorkout;
  List<ExerciseModel> get exercises => _exercises;
  bool get isLoading => _isLoading;
  int get elapsedSeconds => _elapsedSeconds;
  int get restTimerSeconds => _restTimerSeconds;
  bool get isRestTimerActive => _isRestTimerActive;
  Map<String, dynamic>? get lastSummary => _lastSummary;

  WorkoutProvider() {
    loadInitialData();
  }

  Future<void> loadInitialData() async {
    _isLoading = true;
    notifyListeners();
    try {
      await fetchActivePlan();
      await fetchTodayWorkout();
      await fetchActiveSession();
      await fetchExercises();
    } catch (e) {
      debugPrint("Workout init error: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchActivePlan() async {
    try {
      final data = await _api.get('/workouts/plans/active');
      if (data != null) {
        _activePlan = WorkoutPlanModel.fromJson(data);
      } else {
        _activePlan = null;
      }
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchTodayWorkout() async {
    try {
      final data = await _api.get('/workouts/today');
      _todayWorkout = data;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchExercises({String? search, String? muscle}) async {
    try {
      String query = '';
      if (search != null && search.isNotEmpty) query += '?search=$search';
      if (muscle != null && muscle.isNotEmpty) query += (query.isEmpty ? '?' : '&') + 'muscle=$muscle';
      final list = await _api.get('/exercises$query');
      if (list is List) {
        _exercises = list.map((e) => ExerciseModel.fromJson(e)).toList();
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> fetchActiveSession() async {
    try {
      final data = await _api.get('/workouts/sessions/active');
      if (data != null) {
        _activeSession = WorkoutSessionModel.fromJson(data);
        final startMs = _activeSession!.startedAt.millisecondsSinceEpoch;
        final nowMs = DateTime.now().millisecondsSinceEpoch;
        _elapsedSeconds = ((nowMs - startMs) / 1000).floor();
        if (_elapsedSeconds < 0) _elapsedSeconds = 0;
        _startSessionTimer();
      } else {
        _activeSession = null;
        _stopSessionTimer();
      }
      notifyListeners();
    } catch (_) {}
  }

  Future<void> startSession({int? workoutDayId, required String title}) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _api.post('/workouts/sessions/start', body: {
        'workout_day_id': workoutDayId,
        'title': title,
      });
      _activeSession = WorkoutSessionModel.fromJson(data);
      _elapsedSeconds = 0;
      _startSessionTimer();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _startSessionTimer() {
    _sessionTimer?.cancel();
    _sessionTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _elapsedSeconds++;
      notifyListeners();
    });
  }

  void _stopSessionTimer() {
    _sessionTimer?.cancel();
    _elapsedSeconds = 0;
  }

  void triggerRestTimer({int seconds = 90}) {
    _restTimer?.cancel();
    _restTimerSeconds = seconds;
    _isRestTimerActive = true;
    notifyListeners();

    _restTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_restTimerSeconds <= 1) {
        timer.cancel();
        _isRestTimerActive = false;
        _restTimerSeconds = 0;
        notifyListeners();
      } else {
        _restTimerSeconds--;
        notifyListeners();
      }
    });
  }

  void stopRestTimer() {
    _restTimer?.cancel();
    _isRestTimerActive = false;
    _restTimerSeconds = 0;
    notifyListeners();
  }

  void adjustRestTimer(int delta) {
    _restTimerSeconds = (_restTimerSeconds + delta).clamp(0, 600);
    notifyListeners();
  }

  Future<bool> logSet({
    required int exerciseId,
    required int setNumber,
    required double weightKg,
    required int reps,
    double? rpe,
  }) async {
    if (_activeSession == null) return false;
    try {
      final res = await _api.post('/workouts/sessions/${_activeSession!.id}/sets', body: {
        'exercise_id': exerciseId,
        'set_number': setNumber,
        'weight_kg': weightKg,
        'reps': reps,
        'rpe': rpe ?? 8.0,
        'is_completed': true,
      });

      triggerRestTimer(seconds: 90);
      await fetchActiveSession();
      return res['is_pr'] == true;
    } catch (e) {
      debugPrint("Error logging set: $e");
      return false;
    }
  }

  Future<Map<String, dynamic>?> completeSession({String? userFeeling, String? notes}) async {
    if (_activeSession == null) return null;
    try {
      final res = await _api.post('/workouts/sessions/${_activeSession!.id}/complete', body: {
        'duration_seconds': _elapsedSeconds,
        'user_feeling': userFeeling ?? 'good',
        'notes': notes,
      });
      _lastSummary = res;
      _activeSession = null;
      _stopSessionTimer();
      stopRestTimer();
      notifyListeners();
      return res;
    } catch (e) {
      debugPrint("Error completing workout: $e");
      return null;
    }
  }

  void clearLastSummary() {
    _lastSummary = null;
    notifyListeners();
  }
}
