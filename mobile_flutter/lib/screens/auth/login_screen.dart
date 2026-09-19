import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';
import '../main_navigation_screen.dart';
import '../onboarding/onboarding_screen.dart';
import 'register_screen.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController(text: "demo@gymbruhh.com");
  final _passCtrl = TextEditingController(text: "FitAI@2026");
  final _formKey = GlobalKey<FormState>();
  String? _errorMessage;

  void _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _errorMessage = null);

    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      await auth.login(_emailCtrl.text, _passCtrl.text);
      if (!mounted) return;

      if (auth.user?.isOnboarded == true) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const OnboardingScreen()),
        );
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll("Exception: ", ""));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                    ),
                    child: const Icon(Icons.fitness_center_rounded, size: 36, color: AppColors.accent),
                  ),
                ),
                const SizedBox(height: 28),
                const Text(
                  "Welcome Back 👋",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  "Sign in to access your workouts & nutrition.",
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                ),
                const SizedBox(height: 32),

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
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(color: AppColors.red, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                AppTextField(
                  label: "Email Address",
                  hintText: "athlete@example.com",
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: const Icon(Icons.email_outlined, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || !v.contains('@')) ? "Enter a valid email" : null,
                ),
                const SizedBox(height: 18),

                AppTextField(
                  label: "Password",
                  hintText: "••••••••",
                  controller: _passCtrl,
                  obscureText: true,
                  prefixIcon: const Icon(Icons.lock_outline, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.length < 6) ? "Password must be at least 6 characters" : null,
                ),
                const SizedBox(height: 12),

                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()),
                      );
                    },
                    child: const Text(
                      "Forgot password?",
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                AppButton(
                  text: "Sign In",
                  isLoading: auth.isLoading,
                  onPressed: _handleLogin,
                ),
                const SizedBox(height: 24),

                Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have an account? ",
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const RegisterScreen()),
                          );
                        },
                        child: const Text(
                          "Create Account",
                          style: TextStyle(
                            color: AppColors.accent,
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
