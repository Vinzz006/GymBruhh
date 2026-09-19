import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';

class MacroRingCard extends StatelessWidget {
  final double targetCalories;
  final double consumedCalories;
  final double proteinG;
  final double targetProteinG;
  final double carbsG;
  final double targetCarbsG;
  final double fatG;
  final double targetFatG;

  const MacroRingCard({
    super.key,
    required this.targetCalories,
    required this.consumedCalories,
    required this.proteinG,
    required this.targetProteinG,
    required this.carbsG,
    required this.targetCarbsG,
    required this.fatG,
    required this.targetFatG,
  });

  @override
  Widget build(BuildContext context) {
    final remainingCalories = (targetCalories - consumedCalories).clamp(0.0, 99999.0);
    final calProgress = (consumedCalories / (targetCalories > 0 ? targetCalories : 1)).clamp(0.0, 1.0);

    final proProgress = (proteinG / (targetProteinG > 0 ? targetProteinG : 1)).clamp(0.0, 1.0);
    final carbsProgress = (carbsG / (targetCarbsG > 0 ? targetCarbsG : 1)).clamp(0.0, 1.0);
    final fatProgress = (fatG / (targetFatG > 0 ? targetFatG : 1)).clamp(0.0, 1.0);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    "TODAY'S NUTRITION",
                    style: TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    "Daily Target",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    remainingCalories.round().toString(),
                    style: const TextStyle(
                      color: AppColors.accent,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const Text(
                    "kcal remaining",
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Progress bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Consumed: ${consumedCalories.round()} kcal",
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w600),
              ),
              Text(
                "Target: ${targetCalories.round()} kcal",
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: calProgress,
              minHeight: 10,
              backgroundColor: AppColors.surface,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accent),
            ),
          ),
          const SizedBox(height: 18),
          // 3 Macro Indicators
          Row(
            children: [
              Expanded(
                child: _buildMacroBox(
                  "Protein",
                  proteinG,
                  targetProteinG,
                  proProgress,
                  AppColors.accent,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMacroBox(
                  "Carbs",
                  carbsG,
                  targetCarbsG,
                  carbsProgress,
                  AppColors.cyan,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMacroBox(
                  "Fat",
                  fatG,
                  targetFatG,
                  fatProgress,
                  AppColors.orange,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMacroBox(
    String label,
    double current,
    double target,
    double progress,
    Color color,
  ) {
    final pct = (progress * 100).round();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surface.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: color,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                "$pct%",
                style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            "${current.round()} / ${target.round()}g",
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 4,
              backgroundColor: AppColors.dark,
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ],
      ),
    );
  }
}
