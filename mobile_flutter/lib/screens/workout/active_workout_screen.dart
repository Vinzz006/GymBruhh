import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../providers/workout_provider.dart';
import '../../providers/ai_provider.dart';
import '../../widgets/common/app_button.dart';

class ActiveWorkoutScreen extends StatefulWidget {
  const ActiveWorkoutScreen({super.key});

  @override
  State<ActiveWorkoutScreen> createState() => _ActiveWorkoutScreenState();
}

class _ActiveWorkoutScreenState extends State<ActiveWorkoutScreen> {
  void _showCompleteDialog(WorkoutProvider workout) {
    String feeling = 'good';
    final notesCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.card,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text(
            "Complete Workout 🎉",
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "How was today's training session?",
                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildFeelingChip("🔥 Great", feeling == 'great', () => setDialogState(() => feeling = 'great')),
                  _buildFeelingChip("👍 Good", feeling == 'good', () => setDialogState(() => feeling = 'good')),
                  _buildFeelingChip("😴 Tired", feeling == 'tired', () => setDialogState(() => feeling = 'tired')),
                ],
              ),
              const SizedBox(height: 14),
              TextField(
                controller: notesCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  hintText: "Optional session notes...",
                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                  filled: true,
                  fillColor: AppColors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.border),
                  ),
                ),
                maxLines: 2,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text("Keep Going", style: TextStyle(color: AppColors.textSecondary)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                final res = await workout.completeSession(userFeeling: feeling, notes: notesCtrl.text);
                if (mounted && res != null) {
                  _showSummarySheet(res);
                }
              },
              child: const Text("Finish & Save", style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }

  void _showSummarySheet(Map<String, dynamic> summary) {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.accent.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.emoji_events_rounded, color: AppColors.accent, size: 40),
            ),
            const SizedBox(height: 16),
            const Text(
              "WORKOUT COMPLETE! 🎉",
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 6),
            const Text(
              "Great effort! All training data and volume have been saved.",
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildSummaryStat("DURATION", "${summary['summary']?['duration_minutes'] ?? 45}m"),
                _buildSummaryStat("VOLUME", "${summary['summary']?['total_volume_kg'] ?? 0} kg"),
                _buildSummaryStat("SETS", "${summary['summary']?['total_sets'] ?? 0}"),
                _buildSummaryStat("PRs", "${summary['summary']?['prs_hit'] ?? 0}"),
              ],
            ),
            const SizedBox(height: 24),
            AppButton(
              text: "Done",
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryStat(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w700)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
      ],
    );
  }

  Widget _buildFeelingChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent.withOpacity(0.2) : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? AppColors.accent : AppColors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? AppColors.accent : AppColors.textSecondary,
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  String _formatTime(int totalSeconds) {
    final m = (totalSeconds / 60).floor().toString().padLeft(2, '0');
    final s = (totalSeconds % 60).toString().padLeft(2, '0');
    return "$m:$s";
  }

  @override
  Widget build(BuildContext context) {
    final workout = Provider.of<WorkoutProvider>(context);
    final session = workout.activeSession;

    if (session == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: const Center(
          child: Text("No active workout session.", style: TextStyle(color: Colors.white)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 28),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          children: [
            Text(
              session.title,
              style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 2),
            Text(
              _formatTime(workout.elapsedSeconds),
              style: const TextStyle(color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.w800, fontFamily: 'monospace'),
            ),
          ],
        ),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () => _showCompleteDialog(workout),
            child: const Text(
              "FINISH",
              style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.w900, fontSize: 13),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          ListView.builder(
            padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 120),
            itemCount: session.exerciseLogs.length,
            itemBuilder: (ctx, exIdx) {
              final exLog = session.exerciseLogs[exIdx];
              return Container(
                margin: const EdgeInsets.only(bottom: 20),
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
                        Expanded(
                          child: Text(
                            exLog.exercise.name,
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            exLog.exercise.equipment.toUpperCase(),
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 9, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Header row for sets table
                    Row(
                      children: const [
                        SizedBox(width: 40, child: Text("SET", style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w700))),
                        Expanded(child: Text("KG", style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w700))),
                        SizedBox(width: 12),
                        Expanded(child: Text("REPS", style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w700))),
                        SizedBox(width: 44, child: Center(child: Text("LOG", style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w700)))),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Sets rows
                    ...exLog.sets.map((s) {
                      final weightCtrl = TextEditingController(text: s.weightKg > 0 ? s.weightKg.toStringAsFixed(1) : "");
                      final repsCtrl = TextEditingController(text: s.reps > 0 ? s.reps.toString() : "");

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                        decoration: BoxDecoration(
                          color: s.isCompleted ? AppColors.accent.withOpacity(0.1) : AppColors.surface.withOpacity(0.4),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: s.isCompleted ? AppColors.accent.withOpacity(0.3) : AppColors.border.withOpacity(0.5),
                          ),
                        ),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 32,
                              child: Text(
                                "${s.setNumber}",
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
                              ),
                            ),
                            Expanded(
                              child: TextField(
                                controller: weightCtrl,
                                keyboardType: TextInputType.number,
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                                decoration: const InputDecoration(
                                  hintText: "0.0",
                                  hintStyle: TextStyle(color: AppColors.textMuted),
                                  isDense: true,
                                  border: InputBorder.none,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextField(
                                controller: repsCtrl,
                                keyboardType: TextInputType.number,
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                                decoration: const InputDecoration(
                                  hintText: "0",
                                  hintStyle: TextStyle(color: AppColors.textMuted),
                                  isDense: true,
                                  border: InputBorder.none,
                                ),
                              ),
                            ),
                            SizedBox(
                              width: 36,
                              height: 36,
                              child: IconButton(
                                padding: EdgeInsets.zero,
                                icon: Icon(
                                  s.isCompleted ? Icons.check_circle_rounded : Icons.check_circle_outline_rounded,
                                  color: s.isCompleted ? AppColors.accent : AppColors.textMuted,
                                  size: 26,
                                ),
                                onPressed: () async {
                                  final w = double.tryParse(weightCtrl.text) ?? 0.0;
                                  final r = int.tryParse(repsCtrl.text) ?? 0;
                                  final isPr = await workout.logSet(
                                    exerciseId: exLog.exerciseId,
                                    setNumber: s.setNumber,
                                    weightKg: w,
                                    reps: r,
                                  );
                                  if (isPr && mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text("🏆 NEW PERSONAL RECORD!"),
                                        backgroundColor: AppColors.gold,
                                      ),
                                    );
                                  }
                                },
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              );
            },
          ),

          // Floating Rest Timer Modal if active
          if (workout.isRestTimerActive)
            Positioned(
              left: 20,
              right: 20,
              bottom: 20,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.cyan.withOpacity(0.4)),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.cyan.withOpacity(0.2),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.timer_outlined, color: AppColors.cyan, size: 24),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text(
                              "REST TIMER",
                              style: TextStyle(color: AppColors.cyan, fontSize: 10, fontWeight: FontWeight.w800),
                            ),
                            Text(
                              "${workout.restTimerSeconds}s",
                              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Text("+30s", style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w700)),
                          onPressed: () => workout.adjustRestTimer(30),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.surface,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          ),
                          onPressed: workout.stopRestTimer,
                          child: const Text("Skip", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
