import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import 'storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static const Duration _timeoutDuration = Duration(seconds: 15);

  Future<Map<String, String>> _getHeaders() async {
    final token = await StorageService.getToken();
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<dynamic> get(String endpoint) async {
    try {
      final headers = await _getHeaders();
      final url = Uri.parse("${ApiConstants.baseUrl}$endpoint");
      final response = await http.get(url, headers: headers).timeout(_timeoutDuration);
      return _handleResponse(response);
    } on TimeoutException {
      throw Exception("Request timed out. Please check your network connection.");
    } catch (e) {
      if (e is Exception && !e.toString().contains("timed out")) {
        rethrow;
      }
      throw Exception("Network error: $e");
    }
  }

  Future<dynamic> post(String endpoint, {dynamic body}) async {
    try {
      final headers = await _getHeaders();
      final url = Uri.parse("${ApiConstants.baseUrl}$endpoint");
      final response = await http
          .post(
            url,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeoutDuration);
      return _handleResponse(response);
    } on TimeoutException {
      throw Exception("Request timed out. Please check your network connection.");
    } catch (e) {
      if (e is Exception && !e.toString().contains("timed out")) {
        rethrow;
      }
      throw Exception("Network error: $e");
    }
  }

  Future<dynamic> put(String endpoint, {dynamic body}) async {
    try {
      final headers = await _getHeaders();
      final url = Uri.parse("${ApiConstants.baseUrl}$endpoint");
      final response = await http
          .put(
            url,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeoutDuration);
      return _handleResponse(response);
    } on TimeoutException {
      throw Exception("Request timed out. Please check your network connection.");
    } catch (e) {
      if (e is Exception && !e.toString().contains("timed out")) {
        rethrow;
      }
      throw Exception("Network error: $e");
    }
  }

  Future<dynamic> delete(String endpoint) async {
    try {
      final headers = await _getHeaders();
      final url = Uri.parse("${ApiConstants.baseUrl}$endpoint");
      final response = await http.delete(url, headers: headers).timeout(_timeoutDuration);
      return _handleResponse(response);
    } on TimeoutException {
      throw Exception("Request timed out. Please check your network connection.");
    } catch (e) {
      if (e is Exception && !e.toString().contains("timed out")) {
        rethrow;
      }
      throw Exception("Network error: $e");
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else {
      String errorMessage = "An error occurred";
      try {
        final errJson = jsonDecode(response.body);
        errorMessage = errJson['detail'] ?? errJson['message'] ?? errorMessage;
      } catch (_) {
        errorMessage = response.reasonPhrase ?? errorMessage;
      }
      throw Exception(errorMessage);
    }
  }
}
