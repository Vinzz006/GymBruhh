from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    split_type = Column(String(50), nullable=False, default="push_pull_legs") # push_pull_legs | upper_lower | full_body | custom
    difficulty = Column(String(50), default="intermediate")
    days_per_week = Column(Integer, default=4)
    is_active = Column(Boolean, default=True)
    created_by_ai = Column(Boolean, default=False)
    raw_ai_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="workout_plans")
    days = relationship("WorkoutDay", back_populates="plan", cascade="all, delete-orphan", order_by="WorkoutDay.day_order")

class WorkoutDay(Base):
    __tablename__ = "workout_days"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False)
    day_name = Column(String(50), nullable=False) # Monday, Day 1, etc.
    day_order = Column(Integer, default=1)
    focus_area = Column(String(100), nullable=False) # Push, Pull, Legs, Upper, Lower, Rest
    description = Column(Text, nullable=True)
    estimated_minutes = Column(Integer, default=60)
    is_rest_day = Column(Boolean, default=False)

    plan = relationship("WorkoutPlan", back_populates="days")
    exercises = relationship("WorkoutExercise", back_populates="workout_day", cascade="all, delete-orphan", order_by="WorkoutExercise.order_in_day")
    sessions = relationship("WorkoutSession", back_populates="workout_day")

class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"

    id = Column(Integer, primary_key=True, index=True)
    workout_day_id = Column(Integer, ForeignKey("workout_days.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    order_in_day = Column(Integer, default=1)
    target_sets = Column(Integer, default=3)
    target_reps = Column(String(50), default="8-12") # e.g. "8-12", "5", "AMRAP"
    target_rpe = Column(Float, default=8.0)
    rest_seconds = Column(Integer, default=90)
    notes = Column(Text, nullable=True)

    workout_day = relationship("WorkoutDay", back_populates="exercises")
    exercise = relationship("Exercise", back_populates="workout_exercises")

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workout_day_id = Column(Integer, ForeignKey("workout_days.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(150), nullable=False)
    status = Column(String(50), default="in_progress") # in_progress | completed | abandoned
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    total_volume_kg = Column(Float, default=0.0)
    total_sets_completed = Column(Integer, default=0)
    total_reps_completed = Column(Integer, default=0)
    prs_hit = Column(Integer, default=0)
    user_feeling = Column(String(50), nullable=True) # great | good | exhausted | weak
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="workout_sessions")
    workout_day = relationship("WorkoutDay", back_populates="sessions")
    exercise_logs = relationship("ExerciseLog", back_populates="session", cascade="all, delete-orphan", order_by="ExerciseLog.order_in_session")

class ExerciseLog(Base):
    __tablename__ = "exercise_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("workout_sessions.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    order_in_session = Column(Integer, default=1)
    notes = Column(Text, nullable=True)

    session = relationship("WorkoutSession", back_populates="exercise_logs")
    exercise = relationship("Exercise", back_populates="exercise_logs")
    sets = relationship("SetLog", back_populates="exercise_log", cascade="all, delete-orphan", order_by="SetLog.set_number")

class SetLog(Base):
    __tablename__ = "set_logs"

    id = Column(Integer, primary_key=True, index=True)
    exercise_log_id = Column(Integer, ForeignKey("exercise_logs.id", ondelete="CASCADE"), nullable=False)
    set_number = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False, default=0.0)
    reps = Column(Integer, nullable=False, default=0)
    rpe = Column(Float, nullable=True)
    is_completed = Column(Boolean, default=True)
    is_warmup = Column(Boolean, default=False)
    is_pr = Column(Boolean, default=False)
    rest_seconds_taken = Column(Integer, nullable=True)

    exercise_log = relationship("ExerciseLog", back_populates="sets")
