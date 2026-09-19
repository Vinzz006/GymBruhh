import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/workout_provider.dart';
import '../../providers/nutrition_provider.dart';
import '../../providers/progress_provider.dart';
import '../../providers/ai_provider.dart';
import '../../widgets/common/macro_ring_card.dart';
import '../workout/active_workout_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final workout = Provider.of<WorkoutProvider>(context);
    final nutrition = Provider.of<NutritionProvider>(context);
    final progress = Provider.of<ProgressProvider>(context);
    final ai = Provider.of<AIProvider>(context);

    final targets = auth.targets;
    final daily = nutrition.todayNutrition;
    final todayWorkout = workout.todayWorkout;
    final dash = progress.dashboard;

    final userName = auth.user?.fullName.split(' ').first ?? 'Athlete';

    // Dynamic streak calculation from completed workouts count
    final workoutsCount = dash?.totalWorkoutsCompleted ?? 0;
    final streakText = workoutsCount > 0
        ? "$workoutsCount Workouts Logged 🔥 Active Consistency"
        : "Ready for Day 1 🚀 Start your fitness journey";

    // Dynamic AI insight
    String aiInsight = "Consistent progressive overload and hitting your daily protein target are key to achieving your fitness goals.";
    if (ai.recommendations.isNotEmpty) {
      aiInsight = "${ai.recommendations.first.title}: ${ai.recommendations.first.recommendationText}";
    } else if (ai.lastProgressReview != null && ai.lastProgressReview?['summary'] != null) {
      aiInsight = ai.lastProgressReview!['summary'].toString();
    } else if (targets != null) {
      aiInsight = "Your daily target is ${targets.targetCalories.round()} kcal with ${targets.targetProteinGrams.round()}g protein for ${(auth.profile?.primaryGoal ?? 'muscle gain').replaceAll('_', ' ')}.";
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.accent,
          backgroundColor: AppColors.card,
          onRefresh: () async {
            await auth.refreshUserData();
            await workout.fetchTodayWorkout();
            await workout.fetchActivePlan();
            await nutrition.fetchTodayNutrition();
            await progress.fetchDashboard();
            await ai.fetchRecommendations();
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header with greeting & profile avatar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Good Day, $userName 👋",
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          "Ready to crush today's training?",
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const SettingsScreen()),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const Icon(Icons.person_outline, size: 20, color: AppColors.textPrimary),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Streak & Consistency Pill (Dynamic)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.accent.withOpacity(0.25)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.local_fire_department_rounded, color: AppColors.orange, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          streakText,
                          style: const TextStyle(color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Macro & Calorie Ring Card
                MacroRingCard(
                  targetCalories: targets?.targetCalories ?? 2400.0,
                  consumedCalories: daily?.totalCalories ?? 0.0,
                  proteinG: daily?.totalProteinG ?? 0.0,
                  targetProteinG: targets?.targetProteinGrams ?? 160.0,
                  carbsG: daily?.totalCarbsG ?? 0.0,
                  targetCarbsG: targets?.targetCarbsGrams ?? 220.0,
                  fatG: daily?.totalFatG ?? 0.0,
                  targetFatG: targets?.targetFatGrams ?? 70.0,
                ),
                const SizedBox(height: 20),

                // Today's Scheduled Workout Card
                const Text(
                  "TODAY'S TRAINING",
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 10),

                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.accent.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              (todayWorkout?['has_workout'] == true)
                                  ? (todayWorkout?['day']?['focus_area'] ?? "PUSH DAY").toUpperCase()
                                  : "REST DAY",
                              style: const TextStyle(
                                color: AppColors.accent,
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                          Text(
                            "${todayWorkout?['day']?['estimated_minutes'] ?? 60} MIN",
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        todayWorkout?['day']?['focus_area'] ?? "Scheduled Training Session",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        todayWorkout?['day']?['description'] ??
                            "Follow your periodized split and track every set with precise weight & reps.",
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      ),
                      const SizedBox(height: 16),

                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accent,
                          foregroundColor: Colors.black,
                          minimumSize: const Size(double.infinity, 44),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        onPressed: () async {
                          final dayId = todayWorkout?['day']?['id'];
                          final title = todayWorkout?['day']?['focus_area'] ?? "Today's Workout";
                          await workout.startSession(workoutDayId: dayId, title: title);
                          if (context.mounted) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const ActiveWorkoutScreen()),
                            );
                          }
                        },
                        child: const Text(
                          "START WORKOUT",
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // AI Insight Card (Dynamic)
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.purple.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.purple.withOpacity(0.3)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.purple.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.auto_awesome, color: AppColors.purple, size: 20),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "GEMINI AI COACH INSIGHT",
                              style: TextStyle(
                                color: AppColors.purple,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              aiInsight,
                              style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
