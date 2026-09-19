from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.user import User
from app.models.nutrition import FoodItem, MealLog, DailyNutrition
from app.models.fitness_goal import FitnessCalculation
from app.schemas import (
    FoodItemResponse, LogMealRequest, MealLogResponse,
    DailyNutritionResponse, CustomFoodRequest
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/nutrition", tags=["Nutrition Engine & Food Logging"])

def _get_or_create_daily_nutrition(user_id: int, target_date: date, db: Session) -> DailyNutrition:
    daily = db.query(DailyNutrition).filter(
        DailyNutrition.user_id == user_id,
        DailyNutrition.log_date == target_date
    ).first()
    
    if not daily:
        # Fetch user's active targets
        calc = db.query(FitnessCalculation).filter(
            FitnessCalculation.user_id == user_id,
            FitnessCalculation.is_current == True
        ).first()

        target_cal = calc.target_calories if calc else 2200.0
        target_pro = calc.target_protein_grams if calc else 150.0
        target_carbs = calc.target_carbs_grams if calc else 220.0
        target_fat = calc.target_fat_grams if calc else 70.0

        daily = DailyNutrition(
            user_id=user_id,
            log_date=target_date,
            total_calories=0.0,
            total_protein_g=0.0,
            total_carbs_g=0.0,
            total_fat_g=0.0,
            target_calories=target_cal,
            target_protein_g=target_pro,
            target_carbs_g=target_carbs,
            target_fat_g=target_fat,
            water_ml=0
        )
        db.add(daily)
        db.commit()
        db.refresh(daily)

    return daily

def _recalculate_daily_nutrition(user_id: int, target_date: date, db: Session):
    daily = _get_or_create_daily_nutrition(user_id, target_date, db)
    meals = db.query(MealLog).filter(
        MealLog.user_id == user_id,
        MealLog.log_date == target_date
    ).all()

    tot_cal = sum(m.calories for m in meals)
    tot_pro = sum(m.protein_g for m in meals)
    tot_carbs = sum(m.carbs_g for m in meals)
    tot_fat = sum(m.fat_g for m in meals)

    daily.total_calories = round(tot_cal, 1)
    daily.total_protein_g = round(tot_pro, 1)
    daily.total_carbs_g = round(tot_carbs, 1)
    daily.total_fat_g = round(tot_fat, 1)

    db.commit()
    db.refresh(daily)
    return daily

@router.get("/today", response_model=DailyNutritionResponse)
def get_today_nutrition(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    daily = _recalculate_daily_nutrition(current_user.id, today, db)
    meals = db.query(MealLog).filter(
        MealLog.user_id == current_user.id,
        MealLog.log_date == today
    ).order_by(MealLog.logged_at.asc()).all()

    return {
        "log_date": daily.log_date,
        "total_calories": daily.total_calories,
        "total_protein_g": daily.total_protein_g,
        "total_carbs_g": daily.total_carbs_g,
        "total_fat_g": daily.total_fat_g,
        "target_calories": daily.target_calories,
        "target_protein_g": daily.target_protein_g,
        "target_carbs_g": daily.target_carbs_g,
        "target_fat_g": daily.target_fat_g,
        "remaining_calories": max(0.0, daily.target_calories - daily.total_calories),
        "remaining_protein_g": max(0.0, daily.target_protein_g - daily.total_protein_g),
        "remaining_carbs_g": max(0.0, daily.target_carbs_g - daily.total_carbs_g),
        "remaining_fat_g": max(0.0, daily.target_fat_g - daily.total_fat_g),
        "water_ml": daily.water_ml,
        "meals": meals
    }

@router.post("/meals", response_model=MealLogResponse)
def log_meal(
    req: LogMealRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log_date = req.log_date or date.today()
    
    # If food_item_id is provided, calculate scaled nutrition deterministically
    calories = req.calories
    protein_g = req.protein_g
    carbs_g = req.carbs_g
    fat_g = req.fat_g
    fiber_g = req.fiber_g

    if req.food_item_id:
        food = db.query(FoodItem).filter(FoodItem.id == req.food_item_id).first()
        if food:
            multiplier = req.serving_qty
            calories = round(food.calories * multiplier, 1)
            protein_g = round(food.protein_g * multiplier, 1)
            carbs_g = round(food.carbs_g * multiplier, 1)
            fat_g = round(food.fat_g * multiplier, 1)
            fiber_g = round((food.fiber_g or 0.0) * multiplier, 1)

    meal = MealLog(
        user_id=current_user.id,
        food_item_id=req.food_item_id,
        meal_type=req.meal_type.lower(),
        food_name=req.food_name,
        serving_qty=req.serving_qty,
        serving_unit=req.serving_unit,
        calories=calories,
        protein_g=protein_g,
        carbs_g=carbs_g,
        fat_g=fat_g,
        fiber_g=fiber_g,
        log_date=log_date,
        logged_at=datetime.utcnow()
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)

    # Recalculate daily totals
    _recalculate_daily_nutrition(current_user.id, log_date, db)

    return meal

@router.delete("/meals/{meal_id}")
def delete_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = db.query(MealLog).filter(
        MealLog.id == meal_id,
        MealLog.user_id == current_user.id
    ).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal entry not found")

    target_date = meal.log_date
    db.delete(meal)
    db.commit()

    _recalculate_daily_nutrition(current_user.id, target_date, db)
    return {"status": "success", "message": "Meal entry deleted"}

@router.get("/foods/search", response_model=List[FoodItemResponse])
def search_foods(
    query: str = Query(..., min_length=1),
    limit: int = 30,
    db: Session = Depends(get_db)
):
    foods = db.query(FoodItem).filter(
        FoodItem.name.ilike(f"%{query}%")
    ).limit(limit).all()
    return foods

@router.post("/custom-food", response_model=FoodItemResponse)
def create_custom_food(
    req: CustomFoodRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    food = FoodItem(
        name=req.name,
        brand=req.brand,
        category=req.category,
        serving_size_qty=req.serving_size_qty,
        serving_size_unit=req.serving_size_unit,
        calories=req.calories,
        protein_g=req.protein_g,
        carbs_g=req.carbs_g,
        fat_g=req.fat_g,
        fiber_g=req.fiber_g,
        is_custom=True,
        created_by_user_id=current_user.id
    )
    db.add(food)
    db.commit()
    db.refresh(food)
    return food

@router.post("/water")
def log_water(
    amount_ml: int = 250,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    daily = _get_or_create_daily_nutrition(current_user.id, today, db)
    daily.water_ml = max(0, (daily.water_ml or 0) + amount_ml)
    db.commit()
    db.refresh(daily)
    return {"status": "success", "water_ml": daily.water_ml}
