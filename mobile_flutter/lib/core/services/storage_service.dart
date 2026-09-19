import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _tokenKey = "gym_bruhh_token";
  static const String _unitKey = "gym_bruhh_unit";

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  static Future<void> saveUnit(String unit) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_unitKey, unit);
  }

  static Future<String> getUnit() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_unitKey) ?? "metric";
  }
}
