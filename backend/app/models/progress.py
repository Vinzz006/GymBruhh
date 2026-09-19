from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base

class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    weight_kg = Column(Float, nullable=False)
    body_fat_pct = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)
    log_date = Column(Date, default=date.today, index=True)

    user = relationship("User", back_populates="weight_logs")

class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    chest_cm = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    hips_cm = Column(Float, nullable=True)
    left_arm_cm = Column(Float, nullable=True)
    right_arm_cm = Column(Float, nullable=True)
    left_thigh_cm = Column(Float, nullable=True)
    right_thigh_cm = Column(Float, nullable=True)
    shoulders_cm = Column(Float, nullable=True)
    neck_cm = Column(Float, nullable=True)
    calves_cm = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)
    log_date = Column(Date, default=date.today, index=True)

    user = relationship("User", back_populates="body_measurements")

class StrengthLog(Base):
    __tablename__ = "strength_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    weight_kg = Column(Float, nullable=False)
    reps = Column(Integer, nullable=False)
    estimated_1rm_kg = Column(Float, nullable=False)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="strength_logs")
    exercise = relationship("Exercise")

class PersonalRecord(Base):
    __tablename__ = "personal_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    record_type = Column(String(50), default="1rm") # 1rm | max_reps | max_volume
    weight_kg = Column(Float, nullable=False)
    reps = Column(Integer, nullable=False)
    estimated_1rm_kg = Column(Float, nullable=False)
    achieved_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="personal_records")
    exercise = relationship("Exercise", back_populates="personal_records")
