import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/services/api_service.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  final _api = ApiService();
  bool _isLoading = false;
  String? _message;

  void _handleReset() async {
    if (_emailCtrl.text.trim().isEmpty) return;
    setState(() {
      _isLoading = true;
      _message = null;
    });

    try {
      final res = await _api.post('/auth/forgot-password', body: {'email': _emailCtrl.text.trim()});
      setState(() {
        _message = res['message'] ?? "Reset instructions sent to your email!";
      });
    } catch (e) {
      setState(() => _message = "If that email exists, reset instructions have been generated.");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Reset Password 🔑",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "Enter your registered email and we'll send you recovery steps.",
                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 32),

              if (_message != null) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_outline, color: AppColors.accent, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _message!,
                          style: const TextStyle(color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              AppTextField(
                label: "Email Address",
                hintText: "athlete@example.com",
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                prefixIcon: const Icon(Icons.email_outlined, size: 18, color: AppColors.textMuted),
              ),
              const SizedBox(height: 24),

              AppButton(
                text: "Send Reset Link",
                isLoading: _isLoading,
                onPressed: _handleReset,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
