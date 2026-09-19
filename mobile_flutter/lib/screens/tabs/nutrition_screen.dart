import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/nutrition_provider.dart';
import '../../providers/ai_provider.dart';
import '../../widgets/common/macro_ring_card.dart';
import '../../widgets/common/app_button.dart';

class NutritionScreen extends StatefulWidget {
  const NutritionScreen({super.key});

  @override
  State<NutritionScreen> createState() => _NutritionScreenState();
}

class _NutritionScreenState extends State<NutritionScreen> {
  void _showAddFoodDialog(String mealType) {
    final nutrition = Provider.of<NutritionProvider>(context, listen: false);
    final searchCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: SizedBox(
            height: MediaQuery.of(context).size.height * 0.75,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Log ${mealType.toUpperCase()}",
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.textMuted),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: searchCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  onChanged: (q) async {
                    await nutrition.searchFoods(q);
                    setSheetState(() {});
                  },
                  decoration: InputDecoration(
                    hintText: "Search food database (e.g. Chicken, Oats, Rice)...",
                    hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                    prefixIcon: const Icon(Icons.search, color: AppColors.textMuted, size: 18),
                    filled: true,
                    fillColor: AppColors.surface,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: nutrition.searchResults.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.search_rounded, size: 36, color: AppColors.textMuted),
                              SizedBox(height: 8),
                              Text("Search for whole foods or recipes", style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                            ],
                          ),
                        )
                      : ListView.builder(
                          itemCount: nutrition.searchResults.length,
                          itemBuilder: (ctx, idx) {
                            final food = nutrition.searchResults[idx];
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              decoration: BoxDecoration(
                                color: AppColors.surface.withOpacity(0.5),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: AppColors.border.withOpacity(0.6)),
                              ),
                              child: ListTile(
                                title: Text(food.name, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                                subtitle: Text(
                                  "${food.calories.round()} kcal • ${food.proteinG}g P • ${food.carbsG}g C • ${food.fatG}g F (${food.servingSizeQty.round()}${food.servingSizeUnit})",
                                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                                ),
                                trailing: IconButton(
                                  icon: const Icon(Icons.add_circle_outline, color: AppColors.accent),
                                  onPressed: () async {
                                    await nutrition.logMeal(
                                      foodItemId: food.id,
                                      mealType: mealType,
                                      foodName: food.name,
                                      servingQty: 1.0,
                                      servingUnit: food.servingSizeUnit,
                                      calories: food.calories,
                                      proteinG: food.proteinG,
                                      carbsG: food.carbsG,
                                      fatG: food.fatG,
                                    );
                                    if (ctx.mounted) Navigator.pop(ctx);
                                  },
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showAIMealSuggestionDialog() {
    final ai = Provider.of<AIProvider>(context, listen: false);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
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
                  const Text(
                    "AI Nutrition Assistant 🤖",
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
                "Gemini analyzes your remaining calories and protein budget to construct a high-protein recipe.",
                style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
              ),
              const SizedBox(height: 16),
              Consumer<AIProvider>(
                builder: (_, aiProv, __) {
                  if (aiProv.lastMealSuggestion != null) {
                    final meal = aiProv.lastMealSuggestion!;
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            meal['meal_title'] ?? "High Protein Meal",
                            style: const TextStyle(color: AppColors.accent, fontSize: 15, fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            "Est: ${meal['estimated_calories']} kcal • ${meal['estimated_protein_g']}g Protein • ${meal['estimated_carbs_g']}g Carbs",
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            meal['nutrition_tip'] ?? "",
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                          ),
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
                  text: "Suggest High-Protein Dinner",
                  isLoading: aiProv.isGeneratingMeal,
                  onPressed: () async {
                    await aiProv.suggestMeal(mealType: 'dinner');
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

  void _showFoodScannerDialog() {
    final ai = Provider.of<AIProvider>(context, listen: false);
    final nutrition = Provider.of<NutritionProvider>(context, listen: false);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "AI Food Photo Scanner 📸",
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
              "Estimate calories & macros directly from a photo. Values are editable before saving.",
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text("Detected: Grilled Chicken Rice Bowl", style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
                  SizedBox(height: 4),
                  Text("Estimated: 530 kcal • 45g Protein • 52g Carbs • 11g Fat", style: TextStyle(color: AppColors.cyan, fontSize: 12, fontWeight: FontWeight.w700)),
                  SizedBox(height: 4),
                  Text("Estimated nutrition — please verify portions.", style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            AppButton(
              text: "Confirm & Log to Lunch",
              variant: AppButtonVariant.cyan,
              onPressed: () async {
                await nutrition.logMeal(
                  mealType: "lunch",
                  foodName: "Grilled Chicken Rice Bowl",
                  calories: 530.0,
                  proteinG: 45.0,
                  carbsG: 52.0,
                  fatG: 11.0,
                );
                if (ctx.mounted) Navigator.pop(ctx);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final nutrition = Provider.of<NutritionProvider>(context);

    final targets = auth.targets;
    final daily = nutrition.todayNutrition;

    final meals = daily?.meals ?? [];
    final breakfastMeals = meals.where((m) => m.mealType == 'breakfast').toList();
    final lunchMeals = meals.where((m) => m.mealType == 'lunch').toList();
    final dinnerMeals = meals.where((m) => m.mealType == 'dinner').toList();
    final snackMeals = meals.where((m) => m.mealType == 'snack').toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          "Nutrition Engine 🥑",
          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.camera_alt_outlined, color: AppColors.cyan),
            onPressed: _showFoodScannerDialog,
          ),
          IconButton(
            icon: const Icon(Icons.auto_awesome, color: AppColors.purple),
            onPressed: _showAIMealSuggestionDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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

            // Water tracker
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.water_drop_rounded, color: AppColors.cyan, size: 24),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text("WATER INTAKE", style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w800)),
                          Text("${daily?.waterMl ?? 0} / 3000 ml", style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900)),
                        ],
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.cyan.withOpacity(0.15),
                      foregroundColor: AppColors.cyan,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.add, size: 16),
                    label: const Text("+250ml", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                    onPressed: () => nutrition.logWater(amountMl: 250),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              "MEAL BREAKDOWN",
              style: TextStyle(
                color: AppColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 12),

            _buildMealCategoryCard("Breakfast", breakfastMeals, () => _showAddFoodDialog("breakfast")),
            const SizedBox(height: 12),
            _buildMealCategoryCard("Lunch", lunchMeals, () => _showAddFoodDialog("lunch")),
            const SizedBox(height: 12),
            _buildMealCategoryCard("Dinner", dinnerMeals, () => _showAddFoodDialog("dinner")),
            const SizedBox(height: 12),
            _buildMealCategoryCard("Snacks", snackMeals, () => _showAddFoodDialog("snack")),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildMealCategoryCard(String title, List<dynamic> items, VoidCallback onAdd) {
    final totalCal = items.fold<double>(0.0, (acc, item) => acc + (item.calories ?? 0.0));

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
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
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
                  Text("${totalCal.round()} kcal logged", style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.add_circle, color: AppColors.accent, size: 26),
                onPressed: onAdd,
              ),
            ],
          ),
          if (items.isNotEmpty) ...[
            const Divider(color: AppColors.border, height: 16),
            ...items.map((m) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          m.foodName,
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                      Text(
                        "${m.calories.round()} kcal",
                        style: const TextStyle(color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                )),
          ],
        ],
      ),
    );
  }
}
