import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final profile = auth.profile;
    final targets = auth.targets;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text("Profile & Settings ⚙️", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: const BoxDecoration(
                      color: AppColors.surface,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.person, color: AppColors.accent, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.fullName ?? "Athlete", style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 2),
                        Text(user?.email ?? "", style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Profile info
            const Text("FITNESS TARGETS & STATS", style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  _buildSettingRow("Current Weight", "${profile?.currentWeightKg ?? 75.0} kg"),
                  const Divider(color: AppColors.border, height: 20),
                  _buildSettingRow("Primary Goal", (profile?.primaryGoal ?? "Muscle Gain").replaceAll('_', ' ').toUpperCase()),
                  const Divider(color: AppColors.border, height: 20),
                  _buildSettingRow("Daily Target Calories", "${targets?.targetCalories.round() ?? 2400} kcal"),
                  const Divider(color: AppColors.border, height: 20),
                  _buildSettingRow("Protein Target", "${targets?.targetProteinGrams.round() ?? 160}g"),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Preferences
            const Text("APP PREFERENCES", style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Unit System", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                      Row(
                        children: [
                          ChoiceChip(
                            label: const Text("KG / CM"),
                            selected: auth.unitSystem == 'metric',
                            onSelected: (_) => auth.setUnitSystem('metric'),
                            selectedColor: AppColors.accent,
                            backgroundColor: AppColors.surface,
                            labelStyle: TextStyle(
                              color: auth.unitSystem == 'metric' ? Colors.black : AppColors.textSecondary,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(width: 6),
                          ChoiceChip(
                            label: const Text("LBS / IN"),
                            selected: auth.unitSystem == 'imperial',
                            onSelected: (_) => auth.setUnitSystem('imperial'),
                            selectedColor: AppColors.accent,
                            backgroundColor: AppColors.surface,
                            labelStyle: TextStyle(
                              color: auth.unitSystem == 'imperial' ? Colors.black : AppColors.textSecondary,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Divider(color: AppColors.border, height: 20),
                  _buildSwitchRow("Workout Reminders", true, (_) {}),
                  const Divider(color: AppColors.border, height: 20),
                  _buildSwitchRow("Rest Timer Beep Sound", true, (_) {}),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Logout Button
            SizedBox(
              width: double.infinity,
              height: 46,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.red,
                  side: const BorderSide(color: AppColors.red),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.logout_rounded, size: 18),
                label: const Text("Log Out", style: TextStyle(fontWeight: FontWeight.w800)),
                onPressed: () async {
                  await auth.logout();
                  if (context.mounted) {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                    );
                  }
                },
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
      ],
    );
  }

  Widget _buildSwitchRow(String label, bool value, void Function(bool) onChanged) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
        Switch(
          value: value,
          activeColor: AppColors.accent,
          onChanged: onChanged,
        ),
      ],
    );
  }
}
