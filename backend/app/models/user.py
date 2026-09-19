from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    is_active = Column(Boolean, default=True)
    is_onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("FitnessProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    goals = relationship("FitnessGoal", back_populates="user", cascade="all, delete-orphan")
    calculations = relationship("FitnessCalculation", back_populates="user", cascade="all, delete-orphan")
    workout_plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    workout_sessions = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")
    meal_logs = relationship("MealLog", back_populates="user", cascade="all, delete-orphan")
    daily_nutritions = relationship("DailyNutrition", back_populates="user", cascade="all, delete-orphan")
    weight_logs = relationship("WeightLog", back_populates="user", cascade="all, delete-orphan")
    body_measurements = relationship("BodyMeasurement", back_populates="user", cascade="all, delete-orphan")
    strength_logs = relationship("StrengthLog", back_populates="user", cascade="all, delete-orphan")
    personal_records = relationship("PersonalRecord", back_populates="user", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="user", cascade="all, delete-orphan")
    ai_recommendations = relationship("AIRecommendation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    unit_system = Column(String(20), default="metric")  # metric | imperial
    theme_mode = Column(String(20), default="dark")     # dark | light | system
    notifications_enabled = Column(Boolean, default=True)
    workout_reminders = Column(Boolean, default=True)
    meal_reminders = Column(Boolean, default=True)
    ai_insights_enabled = Column(Boolean, default=True)
    rest_timer_sound = Column(Boolean, default=True)
    default_rest_seconds = Column(Integer, default=90)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="settings")
