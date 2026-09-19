from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class FitnessGoal(Base):
    __tablename__ = "fitness_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_type = Column(String(50), nullable=False) # fat_loss | muscle_gain | maintenance | strength | endurance
    target_weight_kg = Column(Float, nullable=True)
    target_body_fat_pct = Column(Float, nullable=True)
    target_date = Column(DateTime, nullable=True)
    weekly_change_kg = Column(Float, default=0.5) # e.g. -0.5 kg/week or +0.25 kg/week
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="goals")

class FitnessCalculation(Base):
    __tablename__ = "fitness_calculations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    bmi = Column(Float, nullable=False)
    bmi_category = Column(String(50), nullable=False) # Underweight | Normal | Overweight | Obese
    bmr = Column(Float, nullable=False) # Mifflin-St Jeor basal metabolic rate in kcal
    tdee = Column(Float, nullable=False) # Total daily energy expenditure in kcal
    
    target_calories = Column(Float, nullable=False)
    target_protein_grams = Column(Float, nullable=False)
    target_carbs_grams = Column(Float, nullable=False)
    target_fat_grams = Column(Float, nullable=False)
    
    calculation_notes = Column(Text, nullable=True)
    is_current = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="calculations")
