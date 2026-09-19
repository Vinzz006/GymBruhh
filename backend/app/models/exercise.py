from sqlalchemy import Column, Integer, String, Float, Text, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    slug = Column(String(150), unique=True, index=True, nullable=False)
    primary_muscle = Column(String(50), index=True, nullable=False) # chest | back | shoulders | biceps | triceps | quads | hamstrings | glutes | calves | abs | cardio
    secondary_muscles = Column(JSON, default=list) # e.g. ["triceps", "front_delts"]
    category = Column(String(50), index=True, nullable=False) # strength | hypertrophy | endurance | calisthenics | mobility
    equipment = Column(String(50), index=True, nullable=False) # barbell | dumbbell | cable | machine | bodyweight | kettlebell | smith_machine
    difficulty = Column(String(50), default="intermediate") # beginner | intermediate | advanced
    instructions = Column(Text, nullable=False)
    safety_notes = Column(Text, nullable=True)
    tips = Column(JSON, default=list)
    image_url = Column(String(255), nullable=True)
    video_url = Column(String(255), nullable=True)
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    workout_exercises = relationship("WorkoutExercise", back_populates="exercise")
    exercise_logs = relationship("ExerciseLog", back_populates="exercise")
    personal_records = relationship("PersonalRecord", back_populates="exercise")
