from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# ----------------- AUTH SCHEMAS -----------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None

# ----------------- PROFILE & ONBOARDING -----------------
class OnboardingRequest(BaseModel):
    age: int = Field(..., ge=13, le=100)
    gender: str = Field(..., description="male | female | other")
    height_cm: float = Field(..., ge=80, le=250)
    current_weight_kg: float = Field(..., ge=25, le=350)
    target_weight_kg: Optional[float] = None
    fitness_level: str = Field(default="beginner", description="beginner | intermediate | advanced")
    primary_goal: str = Field(default="muscle_gain", description="fat_loss | muscle_gain | maintenance | strength | general_fitness")
    activity_level: str = Field(default="moderately_active", description="sedentary | lightly_active | moderately_active | very_active | extra_active")
    training_days_per_week: int = Field(default=4, ge=1, le=7)
    workout_duration_minutes: int = Field(default=60, ge=15, le=180)
    workout_location: str = Field(default="gym", description="gym | home | outdoors")
    equipment_available: List[str] = Field(default_factory=lambda: ["barbell", "dumbbells", "cables", "bench"])
    preferred_split: str = Field(default="push_pull_legs")
    dietary_preference: str = Field(default="non_vegetarian")
    allergies_restrictions: List[str] = Field(default_factory=list)

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    age: int
    gender: str
    height_cm: float
    current_weight_kg: float
    target_weight_kg: Optional[float]
    fitness_level: str
    primary_goal: str
    activity_level: str
    training_days_per_week: int
    workout_duration_minutes: int
    workout_location: str
    equipment_available: List[str]
    preferred_split: str
    dietary_preference: str
    allergies_restrictions: List[str]
    daily_water_target_ml: int

class TargetsResponse(BaseModel):
    bmi: float
    bmi_category: str
    bmr: float
    tdee: float
    target_calories: float
    target_protein_grams: float
    target_carbs_grams: float
    target_fat_grams: float
    notes: Optional[str] = None

# ----------------- EXERCISE SCHEMAS -----------------
class ExerciseResponse(BaseModel):
    id: int
    name: str
    slug: str
    primary_muscle: str
    secondary_muscles: List[str]
    category: str
    equipment: str
    difficulty: str
    instructions: str
    safety_notes: Optional[str] = None
    tips: List[str] = []
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    is_custom: bool = False

# ----------------- WORKOUT SCHEMAS -----------------
class WorkoutExerciseResponse(BaseModel):
    id: int
    workout_day_id: int
    exercise_id: int
    exercise: ExerciseResponse
    order_in_day: int
    target_sets: int
    target_reps: str
    target_rpe: float
    rest_seconds: int
    notes: Optional[str] = None

class WorkoutDayResponse(BaseModel):
    id: int
    plan_id: int
    day_name: str
    day_order: int
    focus_area: str
    description: Optional[str] = None
    estimated_minutes: int
    is_rest_day: bool
    exercises: List[WorkoutExerciseResponse] = []

class WorkoutPlanResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    split_type: str
    difficulty: str
    days_per_week: int
    is_active: bool
    created_by_ai: bool
    created_at: datetime
    days: List[WorkoutDayResponse] = []

class StartSessionRequest(BaseModel):
    workout_day_id: Optional[int] = None
    title: str = "Active Workout"

class LogSetRequest(BaseModel):
    exercise_id: int
    set_number: int
    weight_kg: float = Field(..., ge=0)
    reps: int = Field(..., ge=0)
    rpe: Optional[float] = None
    is_completed: bool = True
    is_warmup: bool = False
    rest_seconds_taken: Optional[int] = None

class CompleteSessionRequest(BaseModel):
    duration_seconds: int
    user_feeling: Optional[str] = "good"
    notes: Optional[str] = None

class SetLogResponse(BaseModel):
    id: int
    set_number: int
    weight_kg: float
    reps: int
    rpe: Optional[float]
    is_completed: bool
    is_warmup: bool
    is_pr: bool
    rest_seconds_taken: Optional[int]

class ExerciseLogResponse(BaseModel):
    id: int
    exercise_id: int
    exercise: ExerciseResponse
    order_in_session: int
    notes: Optional[str]
    sets: List[SetLogResponse] = []

class WorkoutSessionResponse(BaseModel):
    id: int
    user_id: int
    workout_day_id: Optional[int]
    title: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: int
    total_volume_kg: float
    total_sets_completed: int
    total_reps_completed: int
    prs_hit: int
    user_feeling: Optional[str]
    notes: Optional[str]
    exercise_logs: List[ExerciseLogResponse] = []

# ----------------- NUTRITION SCHEMAS -----------------
class FoodItemResponse(BaseModel):
    id: int
    name: str
    brand: Optional[str] = None
    category: str
    serving_size_qty: float
    serving_size_unit: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: Optional[float] = 0.0
    sugar_g: Optional[float] = 0.0
    is_custom: bool = False

class LogMealRequest(BaseModel):
    food_item_id: Optional[int] = None
    meal_type: str = Field(..., description="breakfast | lunch | dinner | snack")
    food_name: str
    serving_qty: float = Field(default=1.0, gt=0)
    serving_unit: str = "serving"
    calories: float = Field(..., ge=0)
    protein_g: float = Field(default=0.0, ge=0)
    carbs_g: float = Field(default=0.0, ge=0)
    fat_g: float = Field(default=0.0, ge=0)
    fiber_g: float = Field(default=0.0, ge=0)
    log_date: Optional[date] = None

class CustomFoodRequest(BaseModel):
    name: str
    brand: Optional[str] = None
    category: str = "general"
    serving_size_qty: float = 100.0
    serving_size_unit: str = "g"
    calories: float = Field(..., ge=0)
    protein_g: float = Field(..., ge=0)
    carbs_g: float = Field(..., ge=0)
    fat_g: float = Field(..., ge=0)
    fiber_g: float = 0.0

class MealLogResponse(BaseModel):
    id: int
    user_id: int
    food_item_id: Optional[int]
    meal_type: str
    food_name: str
    serving_qty: float
    serving_unit: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    logged_at: datetime
    log_date: date

class DailyNutritionResponse(BaseModel):
    log_date: date
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    target_calories: float
    target_protein_g: float
    target_carbs_g: float
    target_fat_g: float
    remaining_calories: float
    remaining_protein_g: float
    remaining_carbs_g: float
    remaining_fat_g: float
    water_ml: int
    meals: List[MealLogResponse] = []

# ----------------- PROGRESS SCHEMAS -----------------
class LogWeightRequest(BaseModel):
    weight_kg: float = Field(..., ge=20, le=400)
    body_fat_pct: Optional[float] = None
    notes: Optional[str] = None
    log_date: Optional[date] = None

class WeightLogResponse(BaseModel):
    id: int
    weight_kg: float
    body_fat_pct: Optional[float]
    notes: Optional[str]
    logged_at: datetime
    log_date: date

class LogBodyMeasurementRequest(BaseModel):
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hips_cm: Optional[float] = None
    left_arm_cm: Optional[float] = None
    right_arm_cm: Optional[float] = None
    left_thigh_cm: Optional[float] = None
    right_thigh_cm: Optional[float] = None
    shoulders_cm: Optional[float] = None
    neck_cm: Optional[float] = None
    calves_cm: Optional[float] = None
    notes: Optional[str] = None
    log_date: Optional[date] = None

class BodyMeasurementResponse(BaseModel):
    id: int
    chest_cm: Optional[float]
    waist_cm: Optional[float]
    hips_cm: Optional[float]
    left_arm_cm: Optional[float]
    right_arm_cm: Optional[float]
    left_thigh_cm: Optional[float]
    right_thigh_cm: Optional[float]
    shoulders_cm: Optional[float]
    calves_cm: Optional[float]
    notes: Optional[str]
    log_date: date

class PersonalRecordResponse(BaseModel):
    id: int
    exercise_id: int
    exercise_name: str
    weight_kg: float
    reps: int
    estimated_1rm_kg: float
    achieved_at: datetime

class ProgressDashboardResponse(BaseModel):
    current_weight_kg: float
    starting_weight_kg: float
    target_weight_kg: Optional[float]
    total_weight_change_kg: float
    total_workouts_completed: int
    weekly_frequency: float
    total_volume_kg: float
    weight_history: List[WeightLogResponse]
    recent_measurements: List[BodyMeasurementResponse]
    personal_records: List[PersonalRecordResponse]

# ----------------- AI SCHEMAS -----------------
class GenerateWorkoutRequest(BaseModel):
    custom_notes: Optional[str] = None

class SuggestMealRequest(BaseModel):
    meal_type: str = "dinner"
    user_prompt: Optional[str] = None

class ReplaceExerciseRequest(BaseModel):
    exercise_id: int

class AIChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

class AIChatResponse(BaseModel):
    conversation_id: int
    reply: str
    sender: str = "assistant"
    created_at: datetime

class VisionFoodScanRequest(BaseModel):
    image_base64: Optional[str] = None

class AIRecommendationResponse(BaseModel):
    id: int
    category: str
    title: str
    recommendation_text: str
    reasoning: Optional[str]
    action_type: Optional[str]
    action_data: Optional[Dict[str, Any]]
    is_accepted: Optional[bool]
    created_at: datetime

class AcceptRecommendationRequest(BaseModel):
    recommendation_id: int
    accept: bool
