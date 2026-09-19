class UserModel {
  final int id;
  final String email;
  final String fullName;
  final bool isOnboarded;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.isOnboarded,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? '',
      isOnboarded: json['is_onboarded'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'full_name': fullName,
      'is_onboarded': isOnboarded,
    };
  }
}
