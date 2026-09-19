from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.profile import FitnessProfile
from app.models.fitness_goal import FitnessGoal, FitnessCalculation
from app.models.progress import WeightLog
from app.schemas import OnboardingRequest, ProfileResponse, TargetsResponse
from app.services.auth_service import get_current_user
from app.services.fitness_engine import FitnessCalculationEngine
from datetime import date

router = APIRouter(prefix="/profile", tags=["Profile & Fitness Engine"])

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found. Complete onboarding first.")
    return profile

@router.post("/onboarding")
def complete_onboarding(
    req: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Update or create profile
    profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == current_user.id).first()
    if not profile:
        profile = FitnessProfile(user_id=current_user.id)
        db.add(profile)

    profile.age = req.age
    profile.gender = req.gender
    profile.height_cm = req.height_cm
    profile.current_weight_kg = req.current_weight_kg
    profile.target_weight_kg = req.target_weight_kg
    profile.fitness_level = req.fitness_level
    profile.primary_goal = req.primary_goal
    profile.activity_level = req.activity_level
    profile.training_days_per_week = req.training_days_per_week
    profile.workout_duration_minutes = req.workout_duration_minutes
    profile.workout_location = req.workout_location
    profile.equipment_available = req.equipment_available
    profile.preferred_split = req.preferred_split
    profile.dietary_preference = req.dietary_preference
    profile.allergies_restrictions = req.allergies_restrictions

    # 2. Deterministic Fitness Calculations
    calc_data = FitnessCalculationEngine.calculate_all_targets(
        weight_kg=req.current_weight_kg,
        height_cm=req.height_cm,
        age=req.age,
        gender=req.gender,
        fitness_goal=req.primary_goal,
        activity_level=req.activity_level
    )

    # Invalidate previous calculations
    db.query(FitnessCalculation).filter(FitnessCalculation.user_id == current_user.id).update({"is_current": False})

    new_calc = FitnessCalculation(
        user_id=current_user.id,
        bmi=calc_data["bmi"],
        bmi_category=calc_data["bmi_category"],
        bmr=calc_data["bmr"],
        tdee=calc_data["tdee"],
        target_calories=calc_data["target_calories"],
        target_protein_grams=calc_data["target_protein_grams"],
        target_carbs_grams=calc_data["target_carbs_grams"],
        target_fat_grams=calc_data["target_fat_grams"],
        calculation_notes=calc_data["notes"],
        is_current=True
    )
    db.add(new_calc)

    # 3. Create or update Goal
    goal = db.query(FitnessGoal).filter(FitnessGoal.user_id == current_user.id, FitnessGoal.is_active == True).first()
    if not goal:
        goal = FitnessGoal(user_id=current_user.id, goal_type=req.primary_goal, target_weight_kg=req.target_weight_kg)
        db.add(goal)
    else:
        goal.goal_type = req.primary_goal
        goal.target_weight_kg = req.target_weight_kg

    # 4. Log initial weight entry
    init_weight = db.query(WeightLog).filter(WeightLog.user_id == current_user.id, WeightLog.log_date == date.today()).first()
    if not init_weight:
        init_weight = WeightLog(
            user_id=current_user.id,
            weight_kg=req.current_weight_kg,
            notes="Initial onboarding weight"
        )
        db.add(init_weight)

    current_user.is_onboarded = True
    db.commit()
    db.refresh(profile)

    return {
        "status": "success",
        "message": "Onboarding completed successfully!",
        "profile": profile,
        "targets": calc_data
    }

@router.get("/targets", response_model=TargetsResponse)
def get_fitness_targets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    calc = db.query(FitnessCalculation).filter(
        FitnessCalculation.user_id == current_user.id,
        FitnessCalculation.is_current == True
    ).first()

    if not calc:
        # If no calculation found, compute from profile if available
        profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == current_user.id).first()
        if profile:
            calc_data = FitnessCalculationEngine.calculate_all_targets(
                weight_kg=profile.current_weight_kg,
                height_cm=profile.height_cm,
                age=profile.age,
                gender=profile.gender,
                fitness_goal=profile.primary_goal,
                activity_level=profile.activity_level
            )
            calc = FitnessCalculation(
                user_id=current_user.id,
                bmi=calc_data["bmi"],
                bmi_category=calc_data["bmi_category"],
                bmr=calc_data["bmr"],
                tdee=calc_data["tdee"],
                target_calories=calc_data["target_calories"],
                target_protein_grams=calc_data["target_protein_grams"],
                target_carbs_grams=calc_data["target_carbs_grams"],
                target_fat_grams=calc_data["target_fat_grams"],
                is_current=True
            )
            db.add(calc)
            db.commit()
            db.refresh(calc)
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Targets not found. Complete onboarding first.")

    return calc
