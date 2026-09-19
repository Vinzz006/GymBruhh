from typing import Dict, Any

class FitnessCalculationEngine:
    """
    Deterministic Fitness Calculation Engine for BMI, BMR, TDEE, Calorie and Macro targets.
    Formulas used:
      - BMI: Standard WHO Formula
      - BMR: Mifflin-St Jeor Equation (clinical standard)
      - TDEE: Katch-McArdle / Mifflin Activity Multipliers
      - Macronutrient distribution: Evidence-based athletic guidelines (ISSN / ACSM)
    """

    ACTIVITY_MULTIPLIERS = {
        "sedentary": 1.2,           # Desk job, little to no exercise
        "lightly_active": 1.375,    # 1-3 days of exercise/week
        "moderately_active": 1.55,  # 3-5 days of exercise/week
        "very_active": 1.725,       # 6-7 days of heavy training
        "extra_active": 1.9         # 2x/day or physical labor job
    }

    GOAL_CALORIE_ADJUSTMENTS = {
        "fat_loss": -500,           # Standard ~0.5kg/week fat loss deficit
        "muscle_gain": 300,         # Lean bulk surplus
        "maintenance": 0,           # Energy balance
        "strength": 200,            # Slight surplus for neural/strength recovery
        "general_fitness": 0
    }

    @staticmethod
    def calculate_bmi(weight_kg: float, height_cm: float) -> Dict[str, Any]:
        if height_cm <= 0 or weight_kg <= 0:
            raise ValueError("Height and weight must be positive numbers")
        
        height_m = height_cm / 100.0
        bmi = round(weight_kg / (height_m ** 2), 1)

        if bmi < 18.5:
            category = "Underweight"
        elif bmi < 25.0:
            category = "Normal"
        elif bmi < 30.0:
            category = "Overweight"
        else:
            category = "Obese"

        return {
            "bmi": bmi,
            "category": category
        }

    @staticmethod
    def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
        """
        Mifflin-St Jeor Formula:
        Men: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
        Women: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
        """
        gender_lower = gender.lower()
        base = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age)
        
        if gender_lower in ["male", "m"]:
            bmr = base + 5.0
        elif gender_lower in ["female", "f"]:
            bmr = base - 161.0
        else:
            # Average baseline
            bmr = base - 78.0
            
        return round(max(bmr, 800.0), 1)

    @staticmethod
    def calculate_tdee(bmr: float, activity_level: str) -> float:
        multiplier = FitnessCalculationEngine.ACTIVITY_MULTIPLIERS.get(
            activity_level.lower(), 1.55
        )
        return round(bmr * multiplier, 1)

    @classmethod
    def calculate_all_targets(
        cls,
        weight_kg: float,
        height_cm: float,
        age: int,
        gender: str,
        fitness_goal: str,
        activity_level: str
    ) -> Dict[str, Any]:
        bmi_data = cls.calculate_bmi(weight_kg, height_cm)
        bmr = cls.calculate_bmr(weight_kg, height_cm, age, gender)
        tdee = cls.calculate_tdee(bmr, activity_level)

        goal_norm = fitness_goal.lower()
        cal_adj = cls.GOAL_CALORIE_ADJUSTMENTS.get(goal_norm, 0)
        target_calories = round(max(tdee + cal_adj, 1200.0), 0)

        # Protein target based on goal (grams per kg bodyweight)
        if goal_norm in ["muscle_gain", "strength"]:
            protein_factor = 2.0  # 2.0g/kg
        elif goal_norm == "fat_loss":
            protein_factor = 2.2  # 2.2g/kg (muscle preservation during deficit)
        else:
            protein_factor = 1.8  # 1.8g/kg general athletic baseline

        protein_g = round(weight_kg * protein_factor, 1)
        protein_kcal = protein_g * 4.0

        # Fat target: 25% of total calories (9 kcal per gram)
        fat_kcal = target_calories * 0.25
        fat_g = round(fat_kcal / 9.0, 1)

        # Carbohydrates: Remainder of calories (4 kcal per gram)
        remaining_kcal = target_calories - (protein_kcal + fat_kcal)
        carbs_g = round(max(remaining_kcal / 4.0, 50.0), 1)

        # Recalibrate target calories to match exact macro sum
        calibrated_calories = round((protein_g * 4.0) + (carbs_g * 4.0) + (fat_g * 9.0), 0)

        return {
            "bmi": bmi_data["bmi"],
            "bmi_category": bmi_data["category"],
            "bmr": bmr,
            "tdee": tdee,
            "target_calories": calibrated_calories,
            "target_protein_grams": protein_g,
            "target_carbs_grams": carbs_g,
            "target_fat_grams": fat_g,
            "notes": f"Calculated using Mifflin-St Jeor equation with {activity_level.replace('_', ' ')} multiplier and {fitness_goal.replace('_', ' ')} target."
        }

    @staticmethod
    def calculate_1rm(weight_kg: float, reps: int) -> float:
        """
        Calculates Estimated 1-Rep Max using combined Epley & Brzycki formulas.
        """
        if reps <= 0 or weight_kg <= 0:
            return 0.0
        if reps == 1:
            return float(weight_kg)
        
        # Epley Formula: 1RM = weight * (1 + reps/30)
        epley = weight_kg * (1.0 + reps / 30.0)
        # Brzycki Formula: 1RM = weight * (36 / (37 - reps)) if reps < 37
        if reps < 37:
            brzycki = weight_kg * (36.0 / (37.0 - reps))
            estimated = (epley + brzycki) / 2.0
        else:
            estimated = epley

        return round(estimated, 1)
