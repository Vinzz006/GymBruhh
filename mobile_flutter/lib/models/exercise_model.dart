class ExerciseModel {
  final int id;
  final String name;
  final String slug;
  final String primaryMuscle;
  final List<String> secondaryMuscles;
  final String category;
  final String equipment;
  final String difficulty;
  final String instructions;
  final String? safetyNotes;
  final List<String> tips;
  final String? imageUrl;
  final bool isCustom;

  ExerciseModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.primaryMuscle,
    required this.secondaryMuscles,
    required this.category,
    required this.equipment,
    required this.difficulty,
    required this.instructions,
    this.safetyNotes,
    required this.tips,
    this.imageUrl,
    this.isCustom = false,
  });

  factory ExerciseModel.fromJson(Map<String, dynamic> json) {
    return ExerciseModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      primaryMuscle: json['primary_muscle'] ?? 'chest',
      secondaryMuscles: List<String>.from(json['secondary_muscles'] ?? []),
      category: json['category'] ?? 'strength',
      equipment: json['equipment'] ?? 'barbell',
      difficulty: json['difficulty'] ?? 'intermediate',
      instructions: json['instructions'] ?? '',
      safetyNotes: json['safety_notes'],
      tips: List<String>.from(json['tips'] ?? []),
      imageUrl: json['image_url'],
      isCustom: json['is_custom'] ?? false,
    );
  }
}
