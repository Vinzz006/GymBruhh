import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/constants/colors.dart';
import '../../providers/progress_provider.dart';
import '../../providers/ai_provider.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  void _showLogWeightDialog() {
    final progress = Provider.of<ProgressProvider>(context, listen: false);
    final weightCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(left: 24, right: 24, top: 24, bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Log Current Weight ⚖️", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
            const SizedBox(height: 16),
            AppTextField(
              label: "Weight (kg)",
              hintText: "78.5",
              controller: weightCtrl,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            AppTextField(
              label: "Notes (Optional)",
              hintText: "Morning fasted weigh-in",
              controller: notesCtrl,
            ),
            const SizedBox(height: 20),
            AppButton(
              text: "Save Weight Log",
              onPressed: () async {
                final w = double.tryParse(weightCtrl.text);
                if (w != null && w > 0) {
                  await progress.logWeight(w, notes: notesCtrl.text);
                  if (ctx.mounted) Navigator.pop(ctx);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAIProgressReview() {
    final ai = Provider.of<AIProvider>(context, listen: false);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("AI Weekly Progress Review 📈", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                  IconButton(icon: const Icon(Icons.close, color: AppColors.textMuted), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 6),
              const Text("Evidence-based review of your actual logged volume, PRs, and consistency.", style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              const SizedBox(height: 16),
              Consumer<AIProvider>(
                builder: (_, aiProv, __) {
                  if (aiProv.lastProgressReview != null) {
                    final rev = aiProv.lastProgressReview!;
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.purple.withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text("PROGRESS RATING", style: TextStyle(color: AppColors.purple, fontSize: 10, fontWeight: FontWeight.w800)),
                              Text(rev['weekly_rating'] ?? "Solid Progress", style: const TextStyle(color: AppColors.accent, fontSize: 13, fontWeight: FontWeight.w800)),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(rev['progressive_overload_insight'] ?? "", style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4)),
                        ],
                      ),
                    );
                  }
                  return Container();
                },
              ),
              const SizedBox(height: 16),
              Consumer<AIProvider>(
                builder: (_, aiProv, __) => AppButton(
                  text: "Run AI Progress Analysis",
                  isLoading: aiProv.isAnalyzingProgress,
                  onPressed: () async {
                    await aiProv.analyzeProgress();
                    setSheetState(() {});
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final progress = Provider.of<ProgressProvider>(context);
    final dash = progress.dashboard;

    final prs = dash?.personalRecords ?? [];
    final weights = dash?.weightHistory ?? [];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text("Progress Analytics 📊", style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
        actions: [
          IconButton(icon: const Icon(Icons.auto_awesome, color: AppColors.purple), onPressed: _showAIProgressReview),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Summary Cards
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("CURRENT WEIGHT", style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 4),
                        Text("${dash?.currentWeightKg ?? 75.0} kg", style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 4),
                        Text("${dash?.totalWeightChangeKg ?? 0.0 >= 0 ? '+' : ''}${dash?.totalWeightChangeKg ?? 0.0} kg total", style: const TextStyle(color: AppColors.accent, fontSize: 11, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("TOTAL WORKOUTS", style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 4),
                        Text("${dash?.totalWorkoutsCompleted ?? 0}", style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 4),
                        Text("${dash?.totalVolumeKg.round() ?? 0} kg volume", style: const TextStyle(color: AppColors.cyan, fontSize: 11, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Log Weight Button
            AppButton(
              text: "+ Log Today's Weight",
              variant: AppButtonVariant.ghost,
              onPressed: _showLogWeightDialog,
            ),
            const SizedBox(height: 24),

            // Interactive Weight Chart
            const Text("WEIGHT TRAJECTORY", style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
            const SizedBox(height: 12),

            Container(
              height: 200,
              padding: const EdgeInsets.only(left: 10, right: 20, top: 20, bottom: 10),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.border),
              ),
              child: weights.length < 2
                  ? Center(
                      child: Text("Log 2+ weight entries to render trajectory", style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                    )
                  : LineChart(
                      LineChartData(
                        gridData: const FlGridData(show: false),
                        titlesData: const FlTitlesData(
                          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        ),
                        borderData: FlBorderData(show: false),
                        lineBarsData: [
                          LineChartBarData(
                            spots: weights.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.weightKg)).toList(),
                            isCurved: true,
                            color: AppColors.accent,
                            barWidth: 3,
                            dotData: const FlDotData(show: true),
                            belowBarData: BarAreaData(
                              show: true,
                              color: AppColors.accent.withOpacity(0.15),
                            ),
                          ),
                        ],
                      ),
                    ),
            ),
            const SizedBox(height: 24),

            // Personal Records Section
            const Text("PERSONAL RECORDS 🏆", style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
            const SizedBox(height: 12),

            if (prs.isEmpty)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.border)),
                child: const Center(
                  child: Text("Complete workout sessions to unlock gold PR badges!", style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                ),
              )
            else
              ...prs.map((pr) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.gold.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.military_tech_rounded, color: AppColors.gold, size: 24),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(pr.exerciseName, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
                                Text("${pr.weightKg}kg × ${pr.reps} reps", style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text("${pr.estimated1rmKg.round()} kg", style: const TextStyle(color: AppColors.gold, fontSize: 16, fontWeight: FontWeight.w900)),
                            const Text("Est. 1RM", style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                          ],
                        ),
                      ],
                    ),
                  )),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}
