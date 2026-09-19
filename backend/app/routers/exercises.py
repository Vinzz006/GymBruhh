from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.exercise import Exercise
from app.schemas import ExerciseResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/exercises", tags=["Exercise Catalog"])

@router.get("", response_model=List[ExerciseResponse])
def get_exercises(
    search: Optional[str] = None,
    muscle: Optional[str] = None,
    equipment: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Exercise)
    if search:
        query = query.filter(Exercise.name.ilike(f"%{search}%"))
    if muscle:
        query = query.filter(Exercise.primary_muscle.ilike(f"%{muscle}%"))
    if equipment:
        query = query.filter(Exercise.equipment.ilike(f"%{equipment}%"))
    if category:
        query = query.filter(Exercise.category.ilike(f"%{category}%"))
    
    return query.order_by(Exercise.name.asc()).all()

@router.get("/categories")
def get_exercise_categories(db: Session = Depends(get_db)):
    muscles = ["chest", "back", "shoulders", "biceps", "triceps", "quads", "hamstrings", "glutes", "calves", "abs", "cardio"]
    equipments = ["barbell", "dumbbell", "cable", "machine", "bodyweight", "smith_machine", "kettlebell"]
    categories = ["strength", "hypertrophy", "calisthenics", "endurance", "mobility"]
    return {
        "muscles": muscles,
        "equipments": equipments,
        "categories": categories
    }

@router.get("/{id}", response_model=ExerciseResponse)
def get_exercise(id: int, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter(Exercise.id == id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return ex

@router.get("/{id}/substitutions")
def get_exercise_substitutions(id: int, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter(Exercise.id == id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    substitutions = gemini_service.replace_exercise(
        current_exercise={
            "name": ex.name,
            "primary_muscle": ex.primary_muscle,
            "equipment": ex.equipment,
            "difficulty": ex.difficulty
        },
        available_equipment=["barbell", "dumbbells", "cables", "machine", "bodyweight"]
    )
    return substitutions
