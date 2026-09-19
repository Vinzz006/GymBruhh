from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.user import User
from app.models.profile import FitnessProfile
from app.models.progress import WeightLog, BodyMeasurement, PersonalRecord, StrengthLog
from app.models.workout import WorkoutSession
from app.models.fitness_goal import FitnessCalculation
from app.schemas import (
    LogWeightRequest, WeightLogResponse, LogBodyMeasurementRequest,
    BodyMeasurementResponse, PersonalRecordResponse, ProgressDashboardResponse
)
from app.services.auth_service import get_current_user
from app.services.fitness_engine import FitnessCalculationEngine

router = APIRouter(prefix="/progress", tags=["Progress & Analytics Engine"])

@router.get("/dashboard", response_model=ProgressDashboardResponse)
def get_progress_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == current_user.id).first()

    # Weight records ordered chronologically
    weight_logs = db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id
    ).order_by(WeightLog.log_date.asc()).all()

    first_weight = weight_logs[0].weight_kg if weight_logs else (profile.current_weight_kg if profile else 70.0)
    current_weight = weight_logs[-1].weight_kg if weight_logs else first_weight
    target_weight = profile.target_weight_kg if profile else None
    weight_change = round(current_weight - first_weight, 1)

    # Workout stats
    completed_sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.status == "completed"
    ).all()

    total_workouts = len(completed_sessions)
    total_volume = sum(s.total_volume_kg for s in completed_sessions)
    weekly_frequency = round(total_workouts / 4.0, 1) if total_workouts > 0 else 0.0

    # Measurements
    measurements = db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id
    ).order_by(BodyMeasurement.log_date.desc()).limit(10).all()

    # PRs
    prs = db.query(PersonalRecord).filter(
        PersonalRecord.user_id == current_user.id
    ).order_by(PersonalRecord.estimated_1rm_kg.desc()).all()

    pr_out = [
        PersonalRecordResponse(
            id=p.id,
            exercise_id=p.exercise_id,
            exercise_name=p.exercise.name if p.exercise else "Exercise",
            weight_kg=p.weight_kg,
            reps=p.reps,
            estimated_1rm_kg=p.estimated_1rm_kg,
            achieved_at=p.achieved_at
        ) for p in prs
    ]

    return {
        "current_weight_kg": current_weight,
        "starting_weight_kg": first_weight,
        "target_weight_kg": target_weight,
        "total_weight_change_kg": weight_change,
        "total_workouts_completed": total_workouts,
        "weekly_frequency": weekly_frequency,
        "total_volume_kg": round(total_volume, 1),
        "weight_history": weight_logs,
        "recent_measurements": measurements,
        "personal_records": pr_out
    }

@router.post("/weight", response_model=WeightLogResponse)
def log_weight(
    req: LogWeightRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = req.log_date or date.today()
    log = db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id,
        WeightLog.log_date == target_date
    ).first()

    if not log:
        log = WeightLog(
            user_id=current_user.id,
            weight_kg=req.weight_kg,
            body_fat_pct=req.body_fat_pct,
            notes=req.notes,
            log_date=target_date,
            logged_at=datetime.utcnow()
        )
        db.add(log)
    else:
        log.weight_kg = req.weight_kg
        log.body_fat_pct = req.body_fat_pct
        log.notes = req.notes

    # Update profile current weight and re-evaluate calculations
    profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == current_user.id).first()
    if profile:
        profile.current_weight_kg = req.weight_kg
        # Recalculate targets
        new_targets = FitnessCalculationEngine.calculate_all_targets(
            weight_kg=req.weight_kg,
            height_cm=profile.height_cm,
            age=profile.age,
            gender=profile.gender,
            fitness_goal=profile.primary_goal,
            activity_level=profile.activity_level
        )
        calc = db.query(FitnessCalculation).filter(
            FitnessCalculation.user_id == current_user.id,
            FitnessCalculation.is_current == True
        ).first()
        if calc:
            calc.bmi = new_targets["bmi"]
            calc.bmi_category = new_targets["bmi_category"]
            calc.bmr = new_targets["bmr"]
            calc.tdee = new_targets["tdee"]
            calc.target_calories = new_targets["target_calories"]
            calc.target_protein_grams = new_targets["target_protein_grams"]
            calc.target_carbs_grams = new_targets["target_carbs_grams"]
            calc.target_fat_grams = new_targets["target_fat_grams"]

    db.commit()
    db.refresh(log)
    return log

@router.post("/measurements", response_model=BodyMeasurementResponse)
def log_measurements(
    req: LogBodyMeasurementRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = req.log_date or date.today()
    meas = db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id,
        BodyMeasurement.log_date == target_date
    ).first()

    if not meas:
        meas = BodyMeasurement(
            user_id=current_user.id,
            chest_cm=req.chest_cm,
            waist_cm=req.waist_cm,
            hips_cm=req.hips_cm,
            left_arm_cm=req.left_arm_cm,
            right_arm_cm=req.right_arm_cm,
            left_thigh_cm=req.left_thigh_cm,
            right_thigh_cm=req.right_thigh_cm,
            shoulders_cm=req.shoulders_cm,
            neck_cm=req.neck_cm,
            calves_cm=req.calves_cm,
            notes=req.notes,
            log_date=target_date,
            logged_at=datetime.utcnow()
        )
        db.add(meas)
    else:
        for field, val in req.dict(exclude_unset=True).items():
            setattr(meas, field, val)

    db.commit()
    db.refresh(meas)
    return meas

@router.get("/prs", response_model=List[PersonalRecordResponse])
def get_prs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prs = db.query(PersonalRecord).filter(
        PersonalRecord.user_id == current_user.id
    ).order_by(PersonalRecord.estimated_1rm_kg.desc()).all()

    return [
        PersonalRecordResponse(
            id=p.id,
            exercise_id=p.exercise_id,
            exercise_name=p.exercise.name if p.exercise else "Exercise",
            weight_kg=p.weight_kg,
            reps=p.reps,
            estimated_1rm_kg=p.estimated_1rm_kg,
            achieved_at=p.achieved_at
        ) for p in prs
    ]
