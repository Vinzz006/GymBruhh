from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from app.database import get_db
from app.models.user import User
from app.models.workout import WorkoutPlan, WorkoutDay, WorkoutExercise, WorkoutSession, ExerciseLog, SetLog
from app.models.exercise import Exercise
from app.models.progress import PersonalRecord, StrengthLog
from app.schemas import (
    WorkoutPlanResponse, WorkoutSessionResponse, StartSessionRequest,
    LogSetRequest, CompleteSessionRequest
)
from app.services.auth_service import get_current_user
from app.services.fitness_engine import FitnessCalculationEngine
from app.services.adaptive_workout_engine import AdaptiveWorkoutEngine

router = APIRouter(prefix="/workouts", tags=["Workout Engine & Sessions"])

@router.get("/plans/active", response_model=Optional[WorkoutPlanResponse])
def get_active_plan(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.is_active == True
    ).first()
    return plan

@router.get("/plans", response_model=List[WorkoutPlanResponse])
def list_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(WorkoutPlan).filter(WorkoutPlan.user_id == current_user.id).order_by(WorkoutPlan.created_at.desc()).all()

@router.get("/today")
def get_today_workout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.is_active == True
    ).first()

    if not plan or not plan.days:
        return {"has_workout": False, "message": "No active workout plan found. Generate one with AI!"}

    # Determine day of week
    day_idx = datetime.now().weekday() # 0 = Monday, 6 = Sunday
    # Modulo map across available plan days
    matched_day = plan.days[day_idx % len(plan.days)]
    
    return {
        "has_workout": not matched_day.is_rest_day,
        "plan_title": plan.title,
        "day": matched_day
    }

@router.get("/sessions", response_model=List[WorkoutSessionResponse])
def get_workout_sessions(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id
    ).order_by(WorkoutSession.started_at.desc()).limit(limit).all()
    return sessions

@router.get("/sessions/active", response_model=Optional[WorkoutSessionResponse])
def get_current_active_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.status == "in_progress"
    ).order_by(WorkoutSession.started_at.desc()).first()
    return session

@router.post("/sessions/start", response_model=WorkoutSessionResponse)
def start_workout_session(
    req: StartSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if there is an in-progress session, return it if so
    active = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.status == "in_progress"
    ).first()
    if active:
        return active

    new_session = WorkoutSession(
        user_id=current_user.id,
        workout_day_id=req.workout_day_id,
        title=req.title,
        status="in_progress",
        started_at=datetime.utcnow()
    )
    db.add(new_session)
    db.flush()

    # Pre-populate exercise logs if day provided
    if req.workout_day_id:
        day = db.query(WorkoutDay).filter(WorkoutDay.id == req.workout_day_id).first()
        if day and day.exercises:
            for we in day.exercises:
                ex_log = ExerciseLog(
                    session_id=new_session.id,
                    exercise_id=we.exercise_id,
                    order_in_session=we.order_in_day,
                    notes=we.notes
                )
                db.add(ex_log)
                db.flush()

                # Add initial empty sets based on target_sets
                target_count = we.target_sets or 3
                for s_num in range(1, target_count + 1):
                    s_log = SetLog(
                        exercise_log_id=ex_log.id,
                        set_number=s_num,
                        weight_kg=0.0,
                        reps=0,
                        is_completed=False
                    )
                    db.add(s_log)

    db.commit()
    db.refresh(new_session)
    return new_session

@router.post("/sessions/{session_id}/sets")
def log_workout_set(
    session_id: int,
    req: LogSetRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(WorkoutSession).filter(
        WorkoutSession.id == session_id,
        WorkoutSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Workout session not found")

    # Find or create exercise log
    ex_log = db.query(ExerciseLog).filter(
        ExerciseLog.session_id == session.id,
        ExerciseLog.exercise_id == req.exercise_id
    ).first()
    if not ex_log:
        order = db.query(ExerciseLog).filter(ExerciseLog.session_id == session.id).count() + 1
        ex_log = ExerciseLog(
            session_id=session.id,
            exercise_id=req.exercise_id,
            order_in_session=order
        )
        db.add(ex_log)
        db.flush()

    # Find or create set
    set_log = db.query(SetLog).filter(
        SetLog.exercise_log_id == ex_log.id,
        SetLog.set_number == req.set_number
    ).first()
    if not set_log:
        set_log = SetLog(
            exercise_log_id=ex_log.id,
            set_number=req.set_number
        )
        db.add(set_log)

    set_log.weight_kg = req.weight_kg
    set_log.reps = req.reps
    set_log.rpe = req.rpe
    set_log.is_completed = req.is_completed
    set_log.is_warmup = req.is_warmup
    set_log.rest_seconds_taken = req.rest_seconds_taken

    # PR Detection
    is_pr = False
    if req.is_completed and not req.is_warmup and req.weight_kg > 0 and req.reps > 0:
        est_1rm = FitnessCalculationEngine.calculate_1rm(req.weight_kg, req.reps)
        existing_pr = db.query(PersonalRecord).filter(
            PersonalRecord.user_id == current_user.id,
            PersonalRecord.exercise_id == req.exercise_id
        ).first()

        if not existing_pr or est_1rm > existing_pr.estimated_1rm_kg:
            is_pr = True
            if not existing_pr:
                existing_pr = PersonalRecord(
                    user_id=current_user.id,
                    exercise_id=req.exercise_id,
                    weight_kg=req.weight_kg,
                    reps=req.reps,
                    estimated_1rm_kg=est_1rm,
                    achieved_at=datetime.utcnow()
                )
                db.add(existing_pr)
            else:
                existing_pr.weight_kg = req.weight_kg
                existing_pr.reps = req.reps
                existing_pr.estimated_1rm_kg = est_1rm
                existing_pr.achieved_at = datetime.utcnow()

            # Record strength log
            st_log = StrengthLog(
                user_id=current_user.id,
                exercise_id=req.exercise_id,
                weight_kg=req.weight_kg,
                reps=req.reps,
                estimated_1rm_kg=est_1rm
            )
            db.add(st_log)

    set_log.is_pr = is_pr
    db.commit()
    db.refresh(session)
    return {"status": "success", "is_pr": is_pr, "set": set_log}

@router.post("/sessions/{session_id}/complete")
def complete_workout_session(
    session_id: int,
    req: CompleteSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(WorkoutSession).filter(
        WorkoutSession.id == session_id,
        WorkoutSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Workout session not found")

    session.status = "completed"
    session.completed_at = datetime.utcnow()
    session.duration_seconds = req.duration_seconds
    session.user_feeling = req.user_feeling
    session.notes = req.notes

    # Aggregate stats
    total_volume = 0.0
    total_sets = 0
    total_reps = 0
    prs_hit = 0

    for ex_log in session.exercise_logs:
        for s in ex_log.sets:
            if s.is_completed and not s.is_warmup:
                total_sets += 1
                total_reps += s.reps
                total_volume += (s.weight_kg * s.reps)
                if s.is_pr:
                    prs_hit += 1

    session.total_volume_kg = round(total_volume, 1)
    session.total_sets_completed = total_sets
    session.total_reps_completed = total_reps
    session.prs_hit = prs_hit

    # Trigger Adaptive Workout Engine for Progressive Overload Insights
    recommendations = AdaptiveWorkoutEngine.analyze_completed_session(session, db)

    db.commit()
    db.refresh(session)

    return {
        "status": "completed",
        "session": session,
        "summary": {
            "duration_minutes": round(req.duration_seconds / 60, 1),
            "total_volume_kg": session.total_volume_kg,
            "total_sets": total_sets,
            "total_reps": total_reps,
            "prs_hit": prs_hit,
            "adaptive_recommendations_count": len(recommendations)
        }
    }
