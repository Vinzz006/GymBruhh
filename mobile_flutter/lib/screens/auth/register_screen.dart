import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';
import '../onboarding/onboarding_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String? _errorMessage;

  void _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    if (_passCtrl.text != _confirmPassCtrl.text) {
      setState(() => _errorMessage = "Passwords do not match");
      return;
    }

    setState(() => _errorMessage = null);
    final auth = Provider.of<AuthProvider>(context, listen: false);

    try {
      await auth.register(_nameCtrl.text, _emailCtrl.text, _passCtrl.text);
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const OnboardingScreen()),
      );
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll("Exception: ", ""));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

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
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Create Account 🚀",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  "Start your AI-powered fitness journey today.",
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                ),
                const SizedBox(height: 28),

                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.red.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.red.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, size: 18, color: AppColors.red),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(_errorMessage!, style: const TextStyle(color: AppColors.red, fontSize: 12)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                AppTextField(
                  label: "Full Name",
                  hintText: "Alex Mercer",
                  controller: _nameCtrl,
                  prefixIcon: const Icon(Icons.person_outline, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? "Enter your name" : null,
                ),
                const SizedBox(height: 16),

                AppTextField(
                  label: "Email Address",
                  hintText: "alex@example.com",
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: const Icon(Icons.email_outlined, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || !v.contains('@')) ? "Enter a valid email" : null,
                ),
                const SizedBox(height: 16),

                AppTextField(
                  label: "Password",
                  hintText: "••••••••",
                  controller: _passCtrl,
                  obscureText: true,
                  prefixIcon: const Icon(Icons.lock_outline, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.length < 6) ? "Minimum 6 characters" : null,
                ),
                const SizedBox(height: 16),

                AppTextField(
                  label: "Confirm Password",
                  hintText: "••••••••",
                  controller: _confirmPassCtrl,
                  obscureText: true,
                  prefixIcon: const Icon(Icons.lock_clock_outlined, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.isEmpty) ? "Confirm your password" : null,
                ),
                const SizedBox(height: 28),

                AppButton(
                  text: "Register & Start Onboarding",
                  isLoading: auth.isLoading,
                  onPressed: _handleRegister,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
