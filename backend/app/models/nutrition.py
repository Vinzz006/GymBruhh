from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    brand = Column(String(100), nullable=True)
    category = Column(String(50), default="general") # protein | grains | vegetables | fruits | dairy | fats | snacks
    serving_size_qty = Column(Float, default=100.0)
    serving_size_unit = Column(String(20), default="g") # g | ml | piece | cup | scoop | oz
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False, default=0.0)
    carbs_g = Column(Float, nullable=False, default=0.0)
    fat_g = Column(Float, nullable=False, default=0.0)
    fiber_g = Column(Float, default=0.0)
    sugar_g = Column(Float, default=0.0)
    sodium_mg = Column(Float, default=0.0)
    is_custom = Column(Boolean, default=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meal_logs = relationship("MealLog", back_populates="food_item")

class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_item_id = Column(Integer, ForeignKey("food_items.id", ondelete="SET NULL"), nullable=True)
    meal_type = Column(String(50), nullable=False) # breakfast | lunch | dinner | snack
    food_name = Column(String(150), nullable=False)
    serving_qty = Column(Float, default=1.0)
    serving_unit = Column(String(20), default="serving")
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False, default=0.0)
    carbs_g = Column(Float, nullable=False, default=0.0)
    fat_g = Column(Float, nullable=False, default=0.0)
    fiber_g = Column(Float, default=0.0)
    logged_at = Column(DateTime, default=datetime.utcnow)
    log_date = Column(Date, default=date.today)

    user = relationship("User", back_populates="meal_logs")
    food_item = relationship("FoodItem", back_populates="meal_logs")

class DailyNutrition(Base):
    __tablename__ = "daily_nutritions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    log_date = Column(Date, nullable=False, default=date.today)
    
    total_calories = Column(Float, default=0.0)
    total_protein_g = Column(Float, default=0.0)
    total_carbs_g = Column(Float, default=0.0)
    total_fat_g = Column(Float, default=0.0)
    water_ml = Column(Integer, default=0)
    
    target_calories = Column(Float, default=2000.0)
    target_protein_g = Column(Float, default=150.0)
    target_carbs_g = Column(Float, default=200.0)
    target_fat_g = Column(Float, default=65.0)

    user = relationship("User", back_populates="daily_nutritions")
