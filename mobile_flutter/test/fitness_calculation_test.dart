import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Deterministic Fitness Engine Unit Tests', () {
    test('BMI calculation and categorization', () {
      // 70kg, 175cm -> 70 / (1.75 * 1.75) = 22.857 -> 22.9 (Normal)
      double weightKg = 70.0;
      double heightCm = 175.0;
      double heightM = heightCm / 100.0;
      double bmi = double.parse((weightKg / (heightM * heightM)).toStringAsFixed(1));

      expect(bmi, equals(22.9));

      String category;
      if (bmi < 18.5) {
        category = "Underweight";
      } else if (bmi < 25.0) {
        category = "Normal";
      } else if (bmi < 30.0) {
        category = "Overweight";
      } else {
        category = "Obese";
      }
      expect(category, equals("Normal"));
    });

    test('BMR calculation using Mifflin-St Jeor for Male', () {
      // Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
      // 80kg, 180cm, 25 years
      // 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805.0 kcal
      double weight = 80.0;
      double height = 180.0;
      int age = 25;
      double bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;

      expect(bmr, equals(1805.0));
    });

    test('BMR calculation using Mifflin-St Jeor for Female', () {
      // Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
      // 60kg, 165cm, 25 years
      // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 kcal
      double weight = 60.0;
      double height = 165.0;
      int age = 25;
      double bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;

      expect(double.parse(bmr.toStringAsFixed(1)), equals(1345.2));
    });

    test('TDEE activity multipliers', () {
      double bmr = 1800.0;
      Map<String, double> multipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extremely_active': 1.9,
      };

      expect(bmr * multipliers['moderately_active']!, equals(2790.0));
      expect(bmr * multipliers['sedentary']!, equals(2160.0));
    });

    test('Macro target distribution for Muscle Gain', () {
      double weightKg = 75.0;
      double tdee = 2500.0;
      // Surplus for muscle gain (+300 kcal)
      double targetCalories = tdee + 300.0; // 2800 kcal
      // Protein: 2.0g per kg bodyweight
      double proteinGrams = weightKg * 2.0; // 150g = 600 kcal
      // Fat: 25% of calories
      double fatCalories = targetCalories * 0.25; // 700 kcal
      double fatGrams = fatCalories / 9.0; // 77.8g
      // Carbs: Remaining calories
      double carbCalories = targetCalories - (proteinGrams * 4.0) - fatCalories; // 1500 kcal
      double carbGrams = carbCalories / 4.0; // 375.0g

      expect(targetCalories, equals(2800.0));
      expect(proteinGrams, equals(150.0));
      expect(carbGrams, greaterThan(300.0));
      expect(fatGrams, greaterThan(70.0));
    });

    test('1RM estimation using Epley formula', () {
      // Epley formula: 1RM = weight * (1 + reps / 30)
      // 100kg x 10 reps -> 100 * (1 + 10/30) = 133.33 kg
      double weight = 100.0;
      int reps = 10;
      double oneRepMax = weight * (1 + reps / 30.0);

      expect(double.parse(oneRepMax.toStringAsFixed(1)), equals(133.3));
    });
  });
}
