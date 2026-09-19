import pytest
from app.services.fitness_engine import FitnessCalculationEngine

def test_bmi_calculation():
    # 70kg, 175cm -> 70 / (1.75^2) = 22.86 -> Normal
    result = FitnessCalculationEngine.calculate_bmi(70.0, 175.0)
    assert result["bmi"] == 22.9
    assert result["category"] == "Normal"

    # 100kg, 175cm -> Obese
    obese_res = FitnessCalculationEngine.calculate_bmi(100.0, 175.0)
    assert obese_res["category"] == "Obese"

def test_bmr_calculation_male():
    # Male, 80kg, 180cm, 25 years:
    # 10(80) + 6.25(180) - 5(25) + 5 = 800 + 1125 - 125 + 5 = 1805 kcal
    bmr = FitnessCalculationEngine.calculate_bmr(80.0, 180.0, 25, "male")
    assert bmr == 1805.0

def test_bmr_calculation_female():
    # Female, 60kg, 165cm, 25 years:
    # 10(60) + 6.25(165) - 5(25) - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345.2 kcal
    bmr = FitnessCalculationEngine.calculate_bmr(60.0, 165.0, 25, "female")
    assert bmr == 1345.2

def test_tdee_calculation():
    bmr = 1800.0
    tdee_mod = FitnessCalculationEngine.calculate_tdee(bmr, "moderately_active")
    assert tdee_mod == round(1800.0 * 1.55, 1)

def test_full_targets_muscle_gain():
    targets = FitnessCalculationEngine.calculate_all_targets(
        weight_kg=75.0,
        height_cm=180.0,
        age=24,
        gender="male",
        fitness_goal="muscle_gain",
        activity_level="moderately_active"
    )
    assert targets["bmi"] > 0
    assert targets["target_calories"] > targets["bmr"]
    assert targets["target_protein_grams"] == 75.0 * 2.0  # 150g protein
    assert targets["target_fat_grams"] > 0
    assert targets["target_carbs_grams"] > 0

def test_1rm_calculation():
    # 100kg x 10 reps -> Epley: 100 * (1 + 10/30) = 133.3kg
    rm = FitnessCalculationEngine.calculate_1rm(100.0, 10)
    assert 130.0 <= rm <= 140.0

    # 1 rep at 100kg should be exactly 100kg
    assert FitnessCalculationEngine.calculate_1rm(100.0, 1) == 100.0
