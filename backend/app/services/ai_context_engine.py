from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.profile import FitnessProfile
from app.models.fitness_goal import FitnessCalculation
from app.models.workout import WorkoutSession, WorkoutPlan
from app.models.nutrition import DailyNutrition, MealLog
from app.models.progress import WeightLog, PersonalRecord
from datetime import date, timedelta

class AIContextEngine:
    """
    Constructs scoped, relevant user context packages for different Gemini AI endpoints.
    Prevents leaking unnecessary sensitive data and optimizes token usage.
    """

    @staticmethod
    def build_workout_generator_context(user: User, db: Session, custom_notes: Optional[str] = None) -> Dict[str, Any]:
        profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == user.id).first()
        calc = db.query(FitnessCalculation).filter(
            FitnessCalculation.user_id == user.id,
            FitnessCalculation.is_current == True
        ).first()

        recent_prs = db.query(PersonalRecord).filter(PersonalRecord.user_id == user.id).limit(5).all()
        pr_list = [{"exercise": pr.exercise.name if pr.exercise else "Exercise", "weight_kg": pr.weight_kg, "reps": pr.reps} for pr in recent_prs]

        return {
            "user_profile": {
                "age": profile.age if profile else 25,
                "gender": profile.gender if profile else "male",
                "fitness_level": profile.fitness_level if profile else "intermediate",
                "primary_goal": profile.primary_goal if profile else "muscle_gain",
                "training_days_per_week": profile.training_days_per_week if profile else 4,
                "preferred_duration_min": profile.workout_duration_minutes if profile else 60,
                "preferred_split": profile.preferred_split if profile else "push_pull_legs",
                "equipment_available": profile.equipment_available if profile else ["barbell", "dumbbells", "cables", "bench"],
                "workout_location": profile.workout_location if profile else "gym"
            },
            "targets": {
                "calories": calc.target_calories if calc else 2400,
                "protein_g": calc.target_protein_grams if calc else 160
            },
            "recent_records": pr_list,
            "custom_preferences": custom_notes or ""
        }

    @staticmethod
    def build_nutrition_assistant_context(
        user: User,
        db: Session,
        meal_type: Optional[str] = "dinner",
        user_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == user.id).first()
        calc = db.query(FitnessCalculation).filter(
            FitnessCalculation.user_id == user.id,
            FitnessCalculation.is_current == True
        ).first()

        today = date.today()
        daily = db.query(DailyNutrition).filter(
            DailyNutrition.user_id == user.id,
            DailyNutrition.log_date == today
        ).first()

        target_cal = calc.target_calories if calc else (daily.target_calories if daily else 2200.0)
        target_pro = calc.target_protein_grams if calc else (daily.target_protein_g if daily else 150.0)
        target_carbs = calc.target_carbs_grams if calc else (daily.target_carbs_g if daily else 220.0)
        target_fat = calc.target_fat_grams if calc else (daily.target_fat_g if daily else 70.0)

        consumed_cal = daily.total_calories if daily else 0.0
        consumed_pro = daily.total_protein_g if daily else 0.0
        consumed_carbs = daily.total_carbs_g if daily else 0.0
        consumed_fat = daily.total_fat_g if daily else 0.0

        rem_cal = max(0.0, target_cal - consumed_cal)
        rem_pro = max(0.0, target_pro - consumed_pro)
        rem_carbs = max(0.0, target_carbs - consumed_carbs)
        rem_fat = max(0.0, target_fat - consumed_fat)

        return {
            "dietary_preference": profile.dietary_preference if profile else "non_vegetarian",
            "allergies_restrictions": profile.allergies_restrictions if profile else [],
            "primary_goal": profile.primary_goal if profile else "muscle_gain",
            "meal_type": meal_type,
            "daily_budget": {
                "target_calories": target_cal,
                "consumed_calories": consumed_cal,
                "remaining_calories": rem_cal,
                "remaining_protein_g": rem_pro,
                "remaining_carbs_g": rem_carbs,
                "remaining_fat_g": rem_fat
            },
            "user_request": user_prompt or ""
        }

    @staticmethod
    def build_progress_review_context(user: User, db: Session) -> Dict[str, Any]:
        profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == user.id).first()
        
        # Last 14 days weights
        weights = db.query(WeightLog).filter(
            WeightLog.user_id == user.id
        ).order_by(WeightLog.log_date.desc()).limit(14).all()

        # Last 10 completed workouts
        sessions = db.query(WorkoutSession).filter(
            WorkoutSession.user_id == user.id,
            WorkoutSession.status == "completed"
        ).order_by(WorkoutSession.completed_at.desc()).limit(10).all()

        session_summaries = []
        for s in sessions:
            session_summaries.append({
                "title": s.title,
                "duration_min": round(s.duration_seconds / 60, 1),
                "volume_kg": s.total_volume_kg,
                "prs_hit": s.prs_hit,
                "date": s.completed_at.strftime("%Y-%m-%d") if s.completed_at else ""
            })

        prs = db.query(PersonalRecord).filter(PersonalRecord.user_id == user.id).limit(6).all()
        pr_summaries = [{"exercise": pr.exercise.name if pr.exercise else "Lift", "weight_kg": pr.weight_kg, "reps": pr.reps} for pr in prs]

        return {
            "goal": profile.primary_goal if profile else "muscle_gain",
            "current_weight": weights[0].weight_kg if weights else (profile.current_weight_kg if profile else 75.0),
            "target_weight": profile.target_weight_kg if profile else None,
            "recent_weight_entries": [{"date": str(w.log_date), "weight_kg": w.weight_kg} for w in reversed(weights)],
            "completed_workouts_count": len(sessions),
            "recent_workouts": session_summaries,
            "personal_records": pr_summaries
        }
