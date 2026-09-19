import 'package:flutter/foundation.dart';
import '../core/services/api_service.dart';
import '../models/ai_model.dart';

class AIProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  List<ChatMessageModel> _chatMessages = [];
  List<AIRecommendationModel> _recommendations = [];
  Map<String, dynamic>? _lastProgressReview;
  Map<String, dynamic>? _lastMealSuggestion;
  bool _isGeneratingWorkout = false;
  bool _isGeneratingMeal = false;
  bool _isAnalyzingProgress = false;
  bool _isChatLoading = false;

  List<ChatMessageModel> get chatMessages => _chatMessages;
  List<AIRecommendationModel> get recommendations => _recommendations;
  Map<String, dynamic>? get lastProgressReview => _lastProgressReview;
  Map<String, dynamic>? get lastMealSuggestion => _lastMealSuggestion;
  bool get isGeneratingWorkout => _isGeneratingWorkout;
  bool get isGeneratingMeal => _isGeneratingMeal;
  bool get isAnalyzingProgress => _isAnalyzingProgress;
  bool get isChatLoading => _isChatLoading;

  AIProvider() {
    fetchRecommendations();
    fetchChatHistory();
  }

  Future<void> fetchRecommendations() async {
    try {
      final list = await _api.get('/ai/recommendations');
      if (list is List) {
        _recommendations = list.map((r) => AIRecommendationModel.fromJson(r)).toList();
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> respondRecommendation(int recommendationId, bool accept) async {
    try {
      await _api.post('/ai/recommendations/respond', body: {
        'recommendation_id': recommendationId,
        'accept': accept,
      });
      await fetchRecommendations();
    } catch (e) {
      debugPrint("Error responding to recommendation: $e");
    }
  }

  Future<void> fetchChatHistory() async {
    try {
      final data = await _api.get('/ai/chat/history');
      if (data != null && data['messages'] is List) {
        _chatMessages = (data['messages'] as List)
            .map((m) => ChatMessageModel.fromJson(m))
            .toList();
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    // Append local user message immediately
    _chatMessages.add(ChatMessageModel(
      sender: 'user',
      content: text,
      createdAt: DateTime.now(),
    ));
    _isChatLoading = true;
    notifyListeners();

    try {
      final res = await _api.post('/ai/chat', body: {'message': text});
      if (res != null) {
        _chatMessages.add(ChatMessageModel(
          id: res['conversation_id'],
          sender: 'assistant',
          content: res['reply'] ?? '',
          createdAt: DateTime.now(),
        ));
      }
    } catch (e) {
      _chatMessages.add(ChatMessageModel(
        sender: 'assistant',
        content: "I am ready to help! Ask me anything about progressive overload, meal planning, or workout modifications.",
        createdAt: DateTime.now(),
      ));
    } finally {
      _isChatLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>?> generateWorkout({String? customNotes}) async {
    _isGeneratingWorkout = true;
    notifyListeners();
    try {
      final res = await _api.post('/ai/workout/generate', body: {
        'custom_notes': customNotes,
      });
      return res;
    } finally {
      _isGeneratingWorkout = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>?> suggestMeal({String mealType = 'dinner', String? prompt}) async {
    _isGeneratingMeal = true;
    notifyListeners();
    try {
      final res = await _api.post('/ai/nutrition/suggest', body: {
        'meal_type': mealType,
        'user_prompt': prompt,
      });
      _lastMealSuggestion = res;
      return res;
    } finally {
      _isGeneratingMeal = false;
      notifyListeners();
    }
  }

  Future<List<dynamic>> replaceExercise(int exerciseId) async {
    try {
      final res = await _api.post('/ai/exercise/replace', body: {
        'exercise_id': exerciseId,
      });
      if (res is List) return res;
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> analyzeProgress() async {
    _isAnalyzingProgress = true;
    notifyListeners();
    try {
      final res = await _api.post('/ai/progress/analyze');
      _lastProgressReview = res;
      return res;
    } finally {
      _isAnalyzingProgress = false;
      notifyListeners();
    }
  }

  Future<FoodScanResultModel?> scanFoodImage({String? imageBase64}) async {
    try {
      final res = await _api.post('/ai/vision/food', body: {
        'image_base64': imageBase64,
      });
      if (res != null) {
        return FoodScanResultModel.fromJson(res);
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
