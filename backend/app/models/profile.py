from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class FitnessProfile(Base):
    __tablename__ = "fitness_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Biometric info
    age = Column(Integer, nullable=False, default=25)
    gender = Column(String(20), nullable=False, default="male") # male | female | other
    height_cm = Column(Float, nullable=False, default=175.0)
    current_weight_kg = Column(Float, nullable=False, default=70.0)
    target_weight_kg = Column(Float, nullable=True)
    
    # Fitness background & lifestyle
    fitness_level = Column(String(50), nullable=False, default="beginner") # beginner | intermediate | advanced
    primary_goal = Column(String(50), nullable=False, default="muscle_gain") # fat_loss | muscle_gain | maintenance | strength | general_fitness
    activity_level = Column(String(50), nullable=False, default="moderately_active") # sedentary | lightly_active | moderately_active | very_active | extra_active
    
    # Workout preferences
    training_days_per_week = Column(Integer, nullable=False, default=4)
    workout_duration_minutes = Column(Integer, nullable=False, default=60)
    workout_location = Column(String(50), default="gym") # gym | home | outdoors
    equipment_available = Column(JSON, default=lambda: ["barbell", "dumbbells", "cables", "bench", "pull_up_bar"])
    preferred_split = Column(String(50), default="push_pull_legs") # push_pull_legs | upper_lower | full_body | bro_split
    
    # Nutrition preferences
    dietary_preference = Column(String(50), default="non_vegetarian") # vegetarian | non_vegetarian | vegan | keto | pescatarian
    allergies_restrictions = Column(JSON, default=list) # e.g. ["dairy", "gluten", "nuts"]
    daily_water_target_ml = Column(Integer, default=3000)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")
