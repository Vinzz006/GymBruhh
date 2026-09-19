import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../providers/workout_provider.dart';
import '../../providers/ai_provider.dart';
import '../../widgets/common/app_button.dart';
import '../workout/active_workout_screen.dart';

class WorkoutScreen extends StatefulWidget {
  const WorkoutScreen({super.key});

  @override
  State<WorkoutScreen> createState() => _WorkoutScreenState();
}

class _WorkoutScreenState extends State<WorkoutScreen> {
  String _selectedMuscle = 'all';

  void _showGenerateWorkoutDialog() {
    final ai = Provider.of<AIProvider>(context, listen: false);
    final workout = Provider.of<WorkoutProvider>(context, listen: false);
    final notesCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "AI Workout Generator 🤖",
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textMuted),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              "Gemini constructs a tailored split based on your profile, goals, equipment, and training volume.",
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: notesCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: "Optional custom notes (e.g. emphasize upper chest and arms)",
                hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                filled: true,
                fillColor: AppColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 20),
            Consumer<AIProvider>(
              builder: (_, aiProv, __) => AppButton(
                text: "Generate AI Workout Split",
                isLoading: aiProv.isGeneratingWorkout,
                onPressed: () async {
                  final plan = await aiProv.generateWorkout(customNotes: notesCtrl.text);
                  if (plan != null) {
                    await workout.fetchActivePlan();
                    await workout.fetchTodayWorkout();
                    if (ctx.mounted) Navigator.pop(ctx);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("New AI Workout Plan Generated! 🎉"),
                          backgroundColor: AppColors.accent,
                        ),
                      );
                    }
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final workout = Provider.of<WorkoutProvider>(context);
    final activePlan = workout.activePlan;
    final exercises = workout.exercises;

    final muscles = ['all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'abs'];

    final filteredExercises = _selectedMuscle == 'all'
        ? exercises
        : exercises.where((e) => e.primaryMuscle.toLowerCase().contains(_selectedMuscle)).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          "Workout Hub 🏋️",
          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome, color: AppColors.accent),
            onPressed: _showGenerateWorkoutDialog,
          ),
        ],
      ),
      body: DefaultTabController(
        length: 2,
        child: Column(
          children: [
            const TabBar(
              indicatorColor: AppColors.accent,
              labelColor: AppColors.accent,
              unselectedLabelColor: AppColors.textSecondary,
              labelStyle: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
              tabs: [
                Tab(text: "Active Routine"),
                Tab(text: "Exercise Library"),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  // TAB 1: ACTIVE ROUTINE
                  SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (activePlan != null) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  activePlan.title,
                                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.purple.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Text(
                                  "AI Generated",
                                  style: TextStyle(color: AppColors.purple, fontSize: 10, fontWeight: FontWeight.w800),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            activePlan.description ?? "Weekly periodized split",
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                          ),
                          const SizedBox(height: 20),

                          // Days List
                          ...activePlan.days.map((day) {
                            return Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              padding: const EdgeInsets.all(18),
                              decoration: BoxDecoration(
                                color: AppColors.card,
                                borderRadius: BorderRadius.circular(22),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        "${day.dayName.toUpperCase()} — ${day.focusArea}",
                                        style: const TextStyle(
                                          color: AppColors.accent,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                      Text(
                                        "${day.exercises.length} Exercises",
                                        style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  ...day.exercises.map((we) {
                                    return Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            we.exercise.name,
                                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                                          ),
                                          Text(
                                            "${we.targetSets} sets × ${we.targetReps}",
                                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                                          ),
                                        ],
                                      ),
                                    );
                                  }),
                                  const SizedBox(height: 14),
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.surface,
                                        foregroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                          side: const BorderSide(color: AppColors.border),
                                        ),
                                      ),
                                      onPressed: () async {
                                        await workout.startSession(
                                          workoutDayId: day.id,
                                          title: day.focusArea,
                                        );
                                        if (context.mounted) {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(builder: (_) => const ActiveWorkoutScreen()),
                                          );
                                        }
                                      },
                                      child: const Text("Start Session", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                        ] else ...[
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 60),
                              child: Column(
                                children: [
                                  const Icon(Icons.fitness_center_rounded, size: 48, color: AppColors.textMuted),
                                  const SizedBox(height: 16),
                                  const Text(
                                    "No Active Workout Routine",
                                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
                                  ),
                                  const SizedBox(height: 6),
                                  const Text(
                                    "Generate an AI-powered workout split to get started.",
                                    style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                                  ),
                                  const SizedBox(height: 20),
                                  AppButton(
                                    text: "Generate AI Workout",
                                    onPressed: _showGenerateWorkoutDialog,
                                    fullWidth: false,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  // TAB 2: EXERCISE LIBRARY
                  Column(
                    children: [
                      // Muscle filter chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        child: Row(
                          children: muscles.map((m) {
                            final isSelected = _selectedMuscle == m;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                label: Text(m.toUpperCase()),
                                selected: isSelected,
                                onSelected: (sel) {
                                  if (sel) setState(() => _selectedMuscle = m);
                                },
                                selectedColor: AppColors.accent,
                                backgroundColor: AppColors.card,
                                labelStyle: TextStyle(
                                  color: isSelected ? Colors.black : AppColors.textSecondary,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      // Exercise list
                      Expanded(
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          itemCount: filteredExercises.length,
                          itemBuilder: (ctx, idx) {
                            final ex = filteredExercises[idx];
                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.card,
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          ex.name,
                                          style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: AppColors.surface,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          ex.equipment.toUpperCase(),
                                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 9, fontWeight: FontWeight.w700),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    ex.instructions,
                                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.3),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
