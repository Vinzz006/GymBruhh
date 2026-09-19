import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';
import '../main_navigation_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _currentStep = 1;
  final int _totalSteps = 7;

  // Personal Info
  int _age = 26;
  String _gender = 'male';
  double _heightCm = 180.0;
  double _weightKg = 75.0;
  double _targetWeightKg = 80.0;

  // Fitness background
  String _fitnessLevel = 'intermediate';
  String _primaryGoal = 'muscle_gain';
  String _activityLevel = 'moderately_active';

  // Workout preferences
  int _trainingDays = 4;
  int _durationMin = 60;
  String _location = 'gym';
  List<String> _equipment = ['barbell', 'dumbbells', 'cables', 'bench', 'pull_up_bar'];
  String _split = 'push_pull_legs';

  // Nutrition preferences
  String _dietary = 'non_vegetarian';
  List<String> _restrictions = [];

  bool _isSubmitting = false;

  void _nextStep() {
    if (_currentStep < _totalSteps) {
      setState(() => _currentStep++);
    } else {
      _completeOnboarding();
    }
  }

  void _prevStep() {
    if (_currentStep > 1) {
      setState(() => _currentStep--);
    }
  }

  void _completeOnboarding() async {
    setState(() => _isSubmitting = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);

    final payload = {
      'age': _age,
      'gender': _gender,
      'height_cm': _heightCm,
      'current_weight_kg': _weightKg,
      'target_weight_kg': _targetWeightKg,
      'fitness_level': _fitnessLevel,
      'primary_goal': _primaryGoal,
      'activity_level': _activityLevel,
      'training_days_per_week': _trainingDays,
      'workout_duration_minutes': _durationMin,
      'workout_location': _location,
      'equipment_available': _equipment,
      'preferred_split': _split,
      'dietary_preference': _dietary,
      'allergies_restrictions': _restrictions,
    };

    try {
      await auth.completeOnboarding(payload);
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Onboarding error: $e"), backgroundColor: AppColors.red),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final progress = _currentStep / _totalSteps;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: _currentStep > 1
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                onPressed: _prevStep,
              )
            : null,
        title: Text(
          "STEP $_currentStep OF $_totalSteps",
          style: const TextStyle(
            color: AppColors.accent,
            fontSize: 12,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.0,
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: AppColors.surface,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accent),
            minHeight: 4,
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: _buildStepContent(),
                ),
              ),
              const SizedBox(height: 16),
              AppButton(
                text: _currentStep == _totalSteps ? "Generate Fitness Profile & Start" : "Continue",
                isLoading: _isSubmitting,
                onPressed: _nextStep,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 1:
        return _buildPersonalDetailsStep();
      case 2:
        return _buildFitnessLevelStep();
      case 3:
        return _buildGoalStep();
      case 4:
        return _buildActivityStep();
      case 5:
        return _buildWorkoutPreferencesStep();
      case 6:
        return _buildNutritionPreferencesStep();
      case 7:
        return _buildSummaryCalculationsStep();
      default:
        return Container();
    }
  }

  // STEP 1: Personal Details
  Widget _buildPersonalDetailsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Personal Details 👤",
          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 6),
        const Text(
          "We use this to calculate your exact BMR, TDEE, and macro targets.",
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 24),

        // Gender Selection
        const Text("GENDER", style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildOptionTile("Male", _gender == 'male', () => setState(() => _gender = 'male'), icon: Icons.male),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildOptionTile("Female", _gender == 'female', () => setState(() => _gender = 'female'), icon: Icons.female),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Age, Height, Weight
        Row(
          children: [
            Expanded(
              child: AppTextField(
                label: "Age",
                hintText: "26",
                controller: TextEditingController(text: _age.toString()),
                keyboardType: TextInputType.number,
                onChanged: (v) => _age = int.tryParse(v) ?? _age,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppTextField(
                label: "Height (cm)",
                hintText: "180",
                controller: TextEditingController(text: _heightCm.toStringAsFixed(0)),
                keyboardType: TextInputType.number,
                onChanged: (v) => _heightCm = double.tryParse(v) ?? _heightCm,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        Row(
          children: [
            Expanded(
              child: AppTextField(
                label: "Current Weight (kg)",
                hintText: "75",
                controller: TextEditingController(text: _weightKg.toStringAsFixed(1)),
                keyboardType: TextInputType.number,
                onChanged: (v) => _weightKg = double.tryParse(v) ?? _weightKg,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppTextField(
                label: "Target Weight (kg)",
                hintText: "80",
                controller: TextEditingController(text: _targetWeightKg.toStringAsFixed(1)),
                keyboardType: TextInputType.number,
                onChanged: (v) => _targetWeightKg = double.tryParse(v) ?? _targetWeightKg,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // STEP 2: Fitness Level
  Widget _buildFitnessLevelStep() {
    final levels = [
      {'id': 'beginner', 'title': 'Beginner (< 1 year)', 'desc': 'New to structured lifting or returning after a long break.'},
      {'id': 'intermediate', 'title': 'Intermediate (1 - 3 years)', 'desc': 'Consistent lifter familiar with progressive overload and compounds.'},
      {'id': 'advanced', 'title': 'Advanced (3+ years)', 'desc': 'Experienced lifter aiming for refined hypertrophy and strength periodization.'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Experience Level 🏋️",
          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 6),
        const Text(
          "Helps calibrate starting volume, RPE, and exercise selection.",
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 24),
        ...levels.map((lvl) {
          final isSelected = _fitnessLevel == lvl['id'];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            child: _buildChoiceCard(
              lvl['title']!,
              lvl['desc']!,
              isSelected,
              () => setState(() => _fitnessLevel = lvl['id']!),
            ),
          );
        }),
      ],
    );
  }

  // STEP 3: Primary Goal
  Widget _buildGoalStep() {
    final goals = [
      {'id': 'muscle_gain', 'title': '💪 Build Muscle (Hypertrophy)', 'desc': 'Lean caloric surplus with high-volume hypertrophy training.'},
      {'id': 'fat_loss', 'title': '🔥 Lose Body Fat (Cut)', 'desc': 'Caloric deficit preserving lean mass with high protein.'},
      {'id': 'strength', 'title': '🏋️ Increase Strength & Power', 'desc': 'Focus on progressive overload across compound barbell lifts.'},
      {'id': 'maintenance', 'title': '⚖️ Maintain & Recomposition', 'desc': 'Maintain bodyweight while building muscle tone and athletic endurance.'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "What is your primary goal? 🎯",
          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 6),
        const Text(
          "We tailor your caloric targets, macro split, and rep ranges around this.",
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 24),
        ...goals.map((g) {
          final isSelected = _primaryGoal == g['id'];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            child: _buildChoiceCard(
              g['title']!,
              g['desc']!,
              isSelected,
              () => setState(() => _primaryGoal = g['id']!),
            ),
          );
        }),
      ],
    );
  }

  // STEP 4: Activity Level
  Widget _buildActivityStep() {
    final activities = [
      {'id': 'sedentary', 'title': 'Sedentary', 'desc': 'Desk job, little to no daily exercise (1.2x TDEE)'},
      {'id': 'lightly_active', 'title': 'Lightly Active', 'desc': 'Light exercise/walking 1-3 days per week (1.375x TDEE)'},
      {'id': 'moderately_active', 'title': 'Moderately Active', 'desc': 'Weight training 3-5 days per week (1.55x TDEE)'},
      {'id': 'very_active', 'title': 'Very Active', 'desc': 'Intense training 6-7 days per week or active physical job (1.725x TDEE)'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Daily Activity Level ⚡",
          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 6),
        const Text(
          "Used to accurately calculate Total Daily Energy Expenditure (TDEE).",
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 24),
        ...activities.map((act) {
          final isSelected = _activityLevel == act['id'];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            child: _buildChoiceCard(
              act['title']!,
              act['desc']!,
              isSelected,
              () => setState(() => _activityLevel = act['id']!),
            ),
          );
        }),
      ],
    );
  }

  // STEP 5: Workout Preferences
  Widget _buildWorkoutPreferencesStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Workout Preferences ⏱️",
          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 6),
        const Text(
          "How many days per week and how long can you train?",
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 24),

        const Text("TRAINING DAYS PER WEEK", style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [3, 4, 5, 6].map((days) {
            final isSelected = _trainingDays == days;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: _buildOptionTile("$days Days", isSelected, () => setState(() => _trainingDays = days)),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 20),

        const Text("PREFERRED SPLIT", style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        _buildChoiceCard("Push Pull Legs (PPL)", "Chest/Shoulders/Tris, Back/Biceps, Quads/Hamstrings", _split == 'push_pull_legs', () => setState(() => _split = 'push_pull_legs')),
        const SizedBox(height: 10),
        _buildChoiceCard("Upper / Lower Split", "Alternating upper body and lower body training days", _split == 'upper_lower', () => setState(() => _split = 'upper_lower')),
        const SizedBox(height: 10),
        _buildChoiceCard("Full Body 3x/Week", "Complete full body training sessions for efficient recovery", _split == 'full_body', () => setState(() => _split = 'full_body')),
      ],
    );
  }

  // STEP 6: Nutrition Preferences
  Widget _buildNutritionPreferencesStep() {
    final diets = [
      {'id': 'non_vegetarian', 'title': '🥩 Non-Vegetarian (Omnivore)', 'desc': 'Includes chicken, beef, fish, eggs, dairy, and plants.'},
      {'id': 'vegetarian', 'title': '🥗 Vegetarian', 'desc': 'Includes dairy, eggs, whey, legumes, grains, and vegetables.'},
      {'id': 'vegan', 'title': '🌱 Vegan (100% Plant-Based)', 'desc': 'Tofu, plant proteins, legumes, grains, seeds, and nuts.'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Nutrition & Dietary Profile 🥑",
          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 6),
        const Text(
          "Gemini uses this to suggest personalized high-protein meals.",
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 24),
        ...diets.map((d) {
          final isSelected = _dietary == d['id'];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            child: _buildChoiceCard(
              d['title']!,
              d['desc']!,
              isSelected,
              () => setState(() => _dietary = d['id']!),
            ),
          );
        }),
      ],
    );
  }

  // STEP 7: Summary & Calculated Targets Preview
  Widget _buildSummaryCalculationsStep() {
    // Client-side quick preview of deterministic formulas
    final heightM = _heightCm / 100.0;
    final bmi = (_weightKg / (heightM * heightM)).toStringAsFixed(1);
    final bmr = ((10 * _weightKg) + (6.25 * _heightCm) - (5 * _age) + (_gender == 'male' ? 5 : -161)).round();
    final tdee = (bmr * 1.55).round();
    final targetCal = _primaryGoal == 'fat_loss' ? tdee - 500 : (_primaryGoal == 'muscle_gain' ? tdee + 300 : tdee);
    final targetPro = (_weightKg * 2.0).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Calculated Targets Ready 🎯",
          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 6),
        const Text(
          "Calculated deterministically using Mifflin-St Jeor athletic formulas.",
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 24),

        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.accent.withOpacity(0.3)),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Body Mass Index (BMI)", style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  Text(bmi, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
                ],
              ),
              const Divider(color: AppColors.border, height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Basal Metabolic Rate (BMR)", style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  Text("$bmr kcal", style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
                ],
              ),
              const Divider(color: AppColors.border, height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Daily Energy (TDEE)", style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  Text("$tdee kcal", style: const TextStyle(color: AppColors.cyan, fontSize: 16, fontWeight: FontWeight.w800)),
                ],
              ),
              const Divider(color: AppColors.border, height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Daily Calorie Target", style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                  Text("$targetCal kcal", style: const TextStyle(color: AppColors.accent, fontSize: 20, fontWeight: FontWeight.w900)),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Daily Protein Target", style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  Text("${targetPro}g", style: const TextStyle(color: AppColors.accent, fontSize: 16, fontWeight: FontWeight.w800)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOptionTile(String label, bool isSelected, VoidCallback onTap, {IconData? icon}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent.withOpacity(0.15) : AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.accent : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon != null) ...[Icon(icon, size: 18, color: isSelected ? AppColors.accent : AppColors.textMuted), const SizedBox(width: 6)],
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppColors.accent : AppColors.textPrimary,
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChoiceCard(String title, String desc, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent.withOpacity(0.12) : AppColors.card,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isSelected ? AppColors.accent : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    desc,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.3),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isSelected ? AppColors.accent : Colors.transparent,
                border: Border.all(color: isSelected ? AppColors.accent : AppColors.textMuted, width: 2),
              ),
              child: isSelected ? const Icon(Icons.check, size: 14, color: Colors.black) : null,
            ),
          ],
        ),
      ),
    );
  }
}
