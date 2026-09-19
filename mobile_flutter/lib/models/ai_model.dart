class AIRecommendationModel {
  final int id;
  final String category;
  final String title;
  final String recommendationText;
  final String? reasoning;
  final String? actionType;
  final Map<String, dynamic>? actionData;
  final bool? isAccepted;
  final DateTime createdAt;

  AIRecommendationModel({
    required this.id,
    required this.category,
    required this.title,
    required this.recommendationText,
    this.reasoning,
    this.actionType,
    this.actionData,
    this.isAccepted,
    required this.createdAt,
  });

  factory AIRecommendationModel.fromJson(Map<String, dynamic> json) {
    return AIRecommendationModel(
      id: json['id'] ?? 0,
      category: json['category'] ?? 'general',
      title: json['title'] ?? 'Recommendation',
      recommendationText: json['recommendation_text'] ?? '',
      reasoning: json['reasoning'],
      actionType: json['action_type'],
      actionData: json['action_data'],
      isAccepted: json['is_accepted'],
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
    );
  }
}

class ChatMessageModel {
  final int? id;
  final String sender; // 'user' | 'assistant' | 'system'
  final String content;
  final DateTime? createdAt;

  ChatMessageModel({
    this.id,
    required this.sender,
    required this.content,
    this.createdAt,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'],
      sender: json['sender'] ?? 'assistant',
      content: json['content'] ?? '',
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }
}

class FoodScanResultModel {
  final String foodName;
  final double confidenceScore;
  final double estimatedCalories;
  final double estimatedProteinG;
  final double estimatedCarbsG;
  final double estimatedFatG;
  final double estimatedFiberG;
  final List<dynamic> detectedItems;
  final String disclaimer;

  FoodScanResultModel({
    required this.foodName,
    required this.confidenceScore,
    required this.estimatedCalories,
    required this.estimatedProteinG,
    required this.estimatedCarbsG,
    required this.estimatedFatG,
    required this.estimatedFiberG,
    required this.detectedItems,
    required this.disclaimer,
  });

  factory FoodScanResultModel.fromJson(Map<String, dynamic> json) {
    return FoodScanResultModel(
      foodName: json['food_name'] ?? 'Estimated Meal',
      confidenceScore: (json['confidence_score'] as num?)?.toDouble() ?? 0.9,
      estimatedCalories: (json['estimated_calories'] as num?)?.toDouble() ?? 500.0,
      estimatedProteinG: (json['estimated_protein_g'] as num?)?.toDouble() ?? 35.0,
      estimatedCarbsG: (json['estimated_carbs_g'] as num?)?.toDouble() ?? 45.0,
      estimatedFatG: (json['estimated_fat_g'] as num?)?.toDouble() ?? 15.0,
      estimatedFiberG: (json['estimated_fiber_g'] as num?)?.toDouble() ?? 5.0,
      detectedItems: json['detected_items'] ?? [],
      disclaimer: json['disclaimer'] ?? 'Estimated nutrition — please verify portions.',
    );
  }
}
