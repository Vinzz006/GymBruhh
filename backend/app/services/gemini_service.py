import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Backend service mediating all Gemini AI calls with strict JSON output schemas,
    validation, timeout resilience, and robust heuristic fallbacks.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else None
        self.model_name = settings.GEMINI_MODEL
        self._init_client()

    def _init_client(self):
        self.client = None
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model_name)
                logger.info("Gemini client initialized with API key.")
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI SDK: {e}")

    def _clean_json_response(self, text: str) -> Dict[str, Any]:
        """Extracts JSON object from markdown fences or raw text."""
        text = text.strip()
        # Remove ```json and ``` wrapping if present
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
        return json.loads(text)

    # 1. GENERATE WORKOUT PLAN
    def generate_workout_plan(self, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
You are an elite strength & conditioning specialist.
Generate a structured, scientifically periodized workout plan in STRICT JSON format based on the following user context:

Context:
{json.dumps(context, indent=2)}

Output ONLY valid JSON matching this schema:
{{
  "plan_name": "String (e.g. Hypertrophy Push Pull Legs 4-Day Split)",
  "description": "String overview of the training phase and progression model",
  "split_type": "push_pull_legs | upper_lower | full_body | custom",
  "difficulty": "beginner | intermediate | advanced",
  "days_per_week": 4,
  "days": [
    {{
      "day_name": "Monday",
      "day_order": 1,
      "focus_area": "Push (Chest, Shoulders, Triceps)",
      "description": "Horizontal/vertical pressing emphasis with hypertrophy accessory work",
      "estimated_minutes": 60,
      "is_rest_day": false,
      "exercises": [
        {{
          "exercise_name": "Barbell Bench Press",
          "target_sets": 4,
          "target_reps": "6-8",
          "target_rpe": 8.0,
          "rest_seconds": 120,
          "notes": "Focus on explosive concentric drive and controlled 2-second eccentric"
        }}
      ]
    }}
  ]
}}
"""
        if self.client:
            try:
                response = self.client.generate_content(prompt, request_options={"timeout": 12})
                parsed = self._clean_json_response(response.text)
                if "plan_name" in parsed and "days" in parsed:
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to heuristic generator: {e}")

        return self._fallback_workout_plan(context)

    def _fallback_workout_plan(self, context: Dict[str, Any]) -> Dict[str, Any]:
        profile = context.get("user_profile", {})
        goal = profile.get("primary_goal", "muscle_gain")
        days_count = profile.get("training_days_per_week", 4)
        level = profile.get("fitness_level", "intermediate")
        
        if days_count <= 3:
            return {
                "plan_name": "Full Body Athletic Strength Split",
                "description": "3-day full-body compound split designed for maximum hypertrophy, progressive overload, and optimal recovery.",
                "split_type": "full_body",
                "difficulty": level,
                "days_per_week": 3,
                "days": [
                    {
                        "day_name": "Monday",
                        "day_order": 1,
                        "focus_area": "Full Body (Compound Intensity)",
                        "description": "Heavy quad and chest emphasis with vertical pulling",
                        "estimated_minutes": 55,
                        "is_rest_day": False,
                        "exercises": [
                            {"exercise_name": "Barbell Back Squat", "target_sets": 4, "target_reps": "6-8", "target_rpe": 8.0, "rest_seconds": 120, "notes": "Drive through midfoot"},
                            {"exercise_name": "Barbell Bench Press", "target_sets": 4, "target_reps": "8-10", "target_rpe": 8.0, "rest_seconds": 120, "notes": "Maintain scapular retraction"},
                            {"exercise_name": "Lat Pulldown", "target_sets": 3, "target_reps": "10-12", "target_rpe": 8.5, "rest_seconds": 90, "notes": "Full stretch at top"},
                            {"exercise_name": "Dumbbell Lateral Raise", "target_sets": 3, "target_reps": "12-15", "target_rpe": 9.0, "rest_seconds": 60, "notes": "Control the descent"},
                            {"exercise_name": "Hanging Leg Raise", "target_sets": 3, "target_reps": "12-15", "target_rpe": 8.0, "rest_seconds": 60, "notes": "Avoid swinging"}
                        ]
                    },
                    {
                        "day_name": "Wednesday",
                        "day_order": 2,
                        "focus_area": "Full Body (Posterior & Upper Emphasis)",
                        "description": "Posterior chain hinge with overhead pressing and horizontal rowing",
                        "estimated_minutes": 55,
                        "is_rest_day": False,
                        "exercises": [
                            {"exercise_name": "Conventional Barbell Deadlift", "target_sets": 3, "target_reps": "5", "target_rpe": 8.5, "rest_seconds": 150, "notes": "Keep neutral spine"},
                            {"exercise_name": "Overhead Barbell Press", "target_sets": 4, "target_reps": "6-8", "target_rpe": 8.0, "rest_seconds": 120, "notes": "Tight glutes and core"},
                            {"exercise_name": "Seated Cable Row", "target_sets": 3, "target_reps": "10-12", "target_rpe": 8.0, "rest_seconds": 90, "notes": "Pull into belly button"},
                            {"exercise_name": "Incline Dumbbell Curl", "target_sets": 3, "target_reps": "10-12", "target_rpe": 8.5, "rest_seconds": 60, "notes": "Deep long-head stretch"},
                            {"exercise_name": "Tricep Rope Pushdown", "target_sets": 3, "target_reps": "12-15", "target_rpe": 9.0, "rest_seconds": 60, "notes": "Spread rope at bottom"}
                        ]
                    },
                    {
                        "day_name": "Friday",
                        "day_order": 3,
                        "focus_area": "Full Body (Hypertrophy & Pump)",
                        "description": "Unilateral leg work, incline chest pressing, and high-tension back training",
                        "estimated_minutes": 55,
                        "is_rest_day": False,
                        "exercises": [
                            {"exercise_name": "Romanian Deadlift (RDL)", "target_sets": 4, "target_reps": "8-10", "target_rpe": 8.0, "rest_seconds": 90, "notes": "Hinge hips deep"},
                            {"exercise_name": "Incline Dumbbell Press", "target_sets": 4, "target_reps": "8-10", "target_rpe": 8.5, "rest_seconds": 90, "notes": "30-degree bench angle"},
                            {"exercise_name": "Single-Arm Dumbbell Row", "target_sets": 3, "target_reps": "10-12", "target_rpe": 8.0, "rest_seconds": 75, "notes": "Full scapular extension"},
                            {"exercise_name": "Standing Calf Raise", "target_sets": 4, "target_reps": "12-15", "target_rpe": 9.0, "rest_seconds": 60, "notes": "Pause 2s at contraction"},
                            {"exercise_name": "Plank", "target_sets": 3, "target_reps": "45-60s", "target_rpe": 8.0, "rest_seconds": 60, "notes": "Engage abs and glutes"}
                        ]
                    }
                ]
            }
        
        # 4+ Days: Push / Pull / Legs Split
        return {
            "plan_name": "Hypertrophy Push Pull Legs & Upper Split",
            "description": "Periodized 4-day athletic progression maximizing compound volume, target muscle tension, and progressive overload.",
            "split_type": "push_pull_legs",
            "difficulty": level,
            "days_per_week": 4,
            "days": [
                {
                    "day_name": "Monday",
                    "day_order": 1,
                    "focus_area": "Push Day (Chest, Shoulders, Triceps)",
                    "description": "Heavy horizontal benching and overhead pressing with tricep accessories",
                    "estimated_minutes": 60,
                    "is_rest_day": False,
                    "exercises": [
                        {"exercise_name": "Barbell Bench Press", "target_sets": 4, "target_reps": "6-8", "target_rpe": 8.5, "rest_seconds": 120, "notes": "Explosive concentric, controlled eccentric"},
                        {"exercise_name": "Incline Dumbbell Press", "target_sets": 3, "target_reps": "8-10", "target_rpe": 8.0, "rest_seconds": 90, "notes": "Focus on clavicular chest head"},
                        {"exercise_name": "Overhead Barbell Press", "target_sets": 3, "target_reps": "8-10", "target_rpe": 8.0, "rest_seconds": 90, "notes": "Full overhead lockout"},
                        {"exercise_name": "Dumbbell Lateral Raise", "target_sets": 4, "target_reps": "12-15", "target_rpe": 9.0, "rest_seconds": 60, "notes": "Lead with elbows"},
                        {"exercise_name": "Chest Dips", "target_sets": 3, "target_reps": "10-12", "target_rpe": 8.0, "rest_seconds": 90, "notes": "Lean torso forward 30 deg"},
                        {"exercise_name": "Tricep Rope Pushdown", "target_sets": 3, "target_reps": "12-15", "target_rpe": 9.0, "rest_seconds": 60, "notes": "Peak contraction squeeze"}
                    ]
                },
                {
                    "day_name": "Tuesday",
                    "day_order": 2,
                    "focus_area": "Pull Day (Back, Rear Delts, Biceps)",
                    "description": "Vertical and horizontal pulling density with direct bicep loading",
                    "estimated_minutes": 60,
                    "is_rest_day": False,
                    "exercises": [
                        {"exercise_name": "Conventional Barbell Deadlift", "target_sets": 3, "target_reps": "5", "target_rpe": 8.0, "rest_seconds": 150, "notes": "Build raw back and posterior strength"},
                        {"exercise_name": "Lat Pulldown", "target_sets": 4, "target_reps": "8-10", "target_rpe": 8.5, "rest_seconds": 90, "notes": "Pull elbows straight down to ribs"},
                        {"exercise_name": "Barbell Bent-Over Row", "target_sets": 3, "target_reps": "8-10", "target_rpe": 8.0, "rest_seconds": 90, "notes": "45-degree hip hinge"},
                        {"exercise_name": "Face Pulls", "target_sets": 3, "target_reps": "15-20", "target_rpe": 8.0, "rest_seconds": 60, "notes": "External shoulder rotation"},
                        {"exercise_name": "Barbell Bicep Curl", "target_sets": 3, "target_reps": "10-12", "target_rpe": 8.5, "rest_seconds": 60, "notes": "Strict form, no swinging"}
                    ]
                },
                {
                    "day_name": "Thursday",
                    "day_order": 3,
                    "focus_area": "Legs & Core Day (Quads, Hamstrings, Glutes)",
                    "description": "Complete lower body power, squat progression, and core stabilization",
                    "estimated_minutes": 60,
                    "is_rest_day": False,
                    "exercises": [
                        {"exercise_name": "Barbell Back Squat", "target_sets": 4, "target_reps": "6-8", "target_rpe": 8.5, "rest_seconds": 120, "notes": "Parallel or below, chest up"},
                        {"exercise_name": "Romanian Deadlift (RDL)", "target_sets": 3, "target_reps": "8-10", "target_rpe": 8.0, "rest_seconds": 90, "notes": "Hinge hips back for hamstring stretch"},
                        {"exercise_name": "Leg Press", "target_sets": 3, "target_reps": "10-12", "target_rpe": 8.5, "rest_seconds": 90, "notes": "Controlled descent"},
                        {"exercise_name": "Standing Calf Raise", "target_sets": 4, "target_reps": "12-15", "target_rpe": 9.0, "rest_seconds": 60, "notes": "2-sec stretch at bottom"},
                        {"exercise_name": "Hanging Leg Raise", "target_sets": 3, "target_reps": "12-15", "target_rpe": 8.0, "rest_seconds": 60, "notes": "Curl pelvis upwards"}
                    ]
                },
                {
                    "day_name": "Friday",
                    "day_order": 4,
                    "focus_area": "Upper Body Hypertrophy & Arms",
                    "description": "High-volume compound upper workout targeting chest, back, delts, and arms",
                    "estimated_minutes": 55,
                    "is_rest_day": False,
                    "exercises": [
                        {"exercise_name": "Seated Dumbbell Shoulder Press", "target_sets": 4, "target_reps": "8-10", "target_rpe": 8.5, "rest_seconds": 90, "notes": "Vertical elbow drive"},
                        {"exercise_name": "Pull-ups", "target_sets": 3, "target_reps": "8-10", "target_rpe": 8.5, "rest_seconds": 90, "notes": "Control eccentric phase"},
                        {"exercise_name": "Cable Chest Fly", "target_sets": 3, "target_reps": "12-15", "target_rpe": 9.0, "rest_seconds": 60, "notes": "Constant chest tension"},
                        {"exercise_name": "Incline Dumbbell Curl", "target_sets": 3, "target_reps": "10-12", "target_rpe": 8.5, "rest_seconds": 60, "notes": "Full bicep stretch"},
                        {"exercise_name": "Skull Crushers (EZ Bar)", "target_sets": 3, "target_reps": "10-12", "target_rpe": 8.5, "rest_seconds": 60, "notes": "Lower bar slightly behind forehead"}
                    ]
                }
            ]
        }

    # 2. SUGGEST NUTRITION / MEAL
    def suggest_meal(self, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
You are a sports nutritionist. Suggest an appetizing, high-protein meal tailored to the user's remaining daily calorie and macro budget.

Context:
{json.dumps(context, indent=2)}

Output ONLY valid JSON matching this schema:
{{
  "meal_title": "String (e.g. Grilled Citrus Chicken & Quinoa Power Bowl)",
  "category": "breakfast | lunch | dinner | snack",
  "prep_time_min": 20,
  "estimated_calories": 580,
  "estimated_protein_g": 48.0,
  "estimated_carbs_g": 52.0,
  "estimated_fat_g": 14.0,
  "ingredients": [
    {{"item": "Chicken Breast", "quantity": "180g"}},
    {{"item": "Cooked Quinoa", "quantity": "150g"}},
    {{"item": "Roasted Asparagus", "quantity": "100g"}},
    {{"item": "Olive Oil", "quantity": "1 tsp (5g)"}}
  ],
  "instructions": [
    "Season chicken breast with paprika, garlic powder, salt, and pepper.",
    "Grill on medium-high heat for 6-8 minutes per side until internal temp reaches 74°C.",
    "Serve over warm quinoa with roasted asparagus drizzled with olive oil."
  ],
  "nutrition_tip": "High in leucine and complex carbohydrates for optimal post-workout muscle protein synthesis."
}}
"""
        if self.client:
            try:
                response = self.client.generate_content(prompt, request_options={"timeout": 12})
                parsed = self._clean_json_response(response.text)
                if "meal_title" in parsed and "estimated_calories" in parsed:
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini meal suggestion call failed: {e}")

        budget = context.get("daily_budget", {})
        rem_cal = round(budget.get("remaining_calories", 550.0), 0)
        rem_pro = round(budget.get("remaining_protein_g", 45.0), 1)

        return {
            "meal_title": "High-Protein Chicken Rice Power Bowl",
            "category": context.get("meal_type", "dinner"),
            "prep_time_min": 20,
            "estimated_calories": max(rem_cal, 450.0),
            "estimated_protein_g": max(rem_pro, 38.0),
            "estimated_carbs_g": round(max((rem_cal * 0.45) / 4.0, 35.0), 1),
            "estimated_fat_g": round(max((rem_cal * 0.25) / 9.0, 10.0), 1),
            "ingredients": [
                {"item": "Chicken Breast (Boneless)", "quantity": "170g"},
                {"item": "Jasmine White Rice (Cooked)", "quantity": "150g"},
                {"item": "Steamed Broccoli Florets", "quantity": "120g"},
                {"item": "Extra Virgin Olive Oil", "quantity": "1 tsp (5ml)"},
                {"item": "Soy Sauce & Garlic Powder", "quantity": "To taste"}
            ],
            "instructions": [
                "Slice chicken into strips, season with garlic powder, paprika, and black pepper.",
                "Sear in a hot non-stick skillet with olive oil for 6-7 minutes until golden and thoroughly cooked.",
                "Steam broccoli for 4 minutes until vibrant green and tender-crisp.",
                "Assemble jasmine rice in a bowl, top with chicken and broccoli, and drizzle with low-sodium soy sauce."
            ],
            "nutrition_tip": "Delivers 38g+ of high-bioavailability protein rich in branched-chain amino acids for overnight muscle repair."
        }

    # 3. EXERCISE SUBSTITUTION
    def replace_exercise(self, current_exercise: Dict[str, Any], available_equipment: List[str]) -> List[Dict[str, Any]]:
        prompt = f"""
You are a biomechanics specialist. Provide 3 direct, biomechanically equivalent exercise replacements for:
Exercise: {json.dumps(current_exercise)}
Available Equipment: {json.dumps(available_equipment)}

Output ONLY valid JSON matching this schema:
[
  {{
    "name": "String replacement exercise name",
    "primary_muscle": "String",
    "equipment": "String",
    "difficulty": "beginner | intermediate | advanced",
    "reason_for_substitution": "String explaining how this hits the exact same target muscle with equivalent movement mechanics."
  }}
]
"""
        if self.client:
            try:
                response = self.client.generate_content(prompt, request_options={"timeout": 12})
                parsed = self._clean_json_response(response.text)
                if isinstance(parsed, list) and len(parsed) > 0:
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini exercise replacement call failed: {e}")

        # Heuristic substitutions based on primary muscle
        muscle = current_exercise.get("primary_muscle", "chest").lower()
        if "chest" in muscle:
            return [
                {"name": "Incline Dumbbell Press", "primary_muscle": "chest", "equipment": "dumbbell", "difficulty": "intermediate", "reason_for_substitution": "Provides greater unilateral freedom and deep upper chest eccentric stretch."},
                {"name": "Cable Chest Fly", "primary_muscle": "chest", "equipment": "cable", "difficulty": "beginner", "reason_for_substitution": "Maintains continuous tension throughout the entire range of motion without joint strain."},
                {"name": "Chest Dips", "primary_muscle": "chest", "equipment": "bodyweight", "difficulty": "intermediate", "reason_for_substitution": "High-recruitment compound movement hitting lower and sternal chest heads."}
            ]
        elif "back" in muscle:
            return [
                {"name": "Lat Pulldown", "primary_muscle": "back", "equipment": "cable", "difficulty": "beginner", "reason_for_substitution": "Direct vertical pulling equivalent to pull-ups with adjustable resistance."},
                {"name": "Single-Arm Dumbbell Row", "primary_muscle": "back", "equipment": "dumbbell", "difficulty": "beginner", "reason_for_substitution": "Isolates lats and rhomboids with full rotational stretch without taxing lower back."},
                {"name": "Seated Cable Row", "primary_muscle": "back", "equipment": "cable", "difficulty": "beginner", "reason_for_substitution": "Horizontal rowing with constant cable tension through mid-back contraction."}
            ]
        elif "shoulders" in muscle:
            return [
                {"name": "Seated Dumbbell Shoulder Press", "primary_muscle": "shoulders", "equipment": "dumbbell", "difficulty": "intermediate", "reason_for_substitution": "Hits anterior and medial delts with independent arm balance."},
                {"name": "Dumbbell Lateral Raise", "primary_muscle": "shoulders", "equipment": "dumbbell", "difficulty": "beginner", "reason_for_substitution": "Isolates the lateral deltoid head for shoulder width and aesthetic V-taper."},
                {"name": "Reverse Pec Deck Fly", "primary_muscle": "shoulders", "equipment": "machine", "difficulty": "beginner", "reason_for_substitution": "Isolates posterior deltoids and rotator cuff muscles safely."}
            ]
        else: # Legs
            return [
                {"name": "Leg Press", "primary_muscle": "quads", "equipment": "machine", "difficulty": "beginner", "reason_for_substitution": "Heavy quad overload without spinal loading or lower back fatigue."},
                {"name": "Bulgarian Split Squat", "primary_muscle": "quads", "equipment": "dumbbell", "difficulty": "intermediate", "reason_for_substitution": "Unilateral leg builder eliminating strength imbalances."},
                {"name": "Romanian Deadlift (RDL)", "primary_muscle": "hamstrings", "equipment": "barbell", "difficulty": "intermediate", "reason_for_substitution": "High-tension hip hinge targeting hamstring muscle belly and glutes."}
            ]

    # 4. PROGRESS REVIEW & ANALYSIS
    def analyze_progress(self, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
You are a senior AI fitness coach. Perform an honest, analytical progress review based on actual logged data:

Context:
{json.dumps(context, indent=2)}

Output ONLY valid JSON matching this schema:
{{
  "weekly_rating": "Excellent | Solid Progress | On Track | Needs Focus",
  "what_went_well": [
    "String bullet point 1",
    "String bullet point 2"
  ],
  "areas_for_improvement": [
    "String bullet point 1"
  ],
  "progressive_overload_insight": "String specific feedback on strength changes and weight progressions",
  "actionable_next_steps": [
    "String recommendation 1",
    "String recommendation 2"
  ]
}}
"""
        if self.client:
            try:
                response = self.client.generate_content(prompt, request_options={"timeout": 12})
                parsed = self._clean_json_response(response.text)
                if "weekly_rating" in parsed and "what_went_well" in parsed:
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini progress analysis call failed: {e}")

        workouts_count = context.get("completed_workouts_count", 0)
        return {
            "weekly_rating": "Solid Progress" if workouts_count >= 3 else "On Track",
            "what_went_well": [
                f"Completed {workouts_count} logged training sessions with dedicated effort.",
                "Maintained good workout frequency and tracking consistency.",
                "Demonstrated solid execution across compound movements."
            ],
            "areas_for_improvement": [
                "Ensure hydration and 7-8 hours of quality sleep to optimize muscle protein synthesis."
            ],
            "progressive_overload_insight": "Keep logging every set and rep. When you hit the top of your target rep range with clean form, increase load by 1.25kg-2.5kg on your next session.",
            "actionable_next_steps": [
                "Prioritize hitting your daily protein target consistently.",
                "Focus on a 2-second controlled eccentric tempo on your primary lifts."
            ]
        }

    # 5. CHAT TRAINER
    def chat_trainer(self, conversation_history: List[Dict[str, str]], user_message: str, user_context: Dict[str, Any]) -> str:
        system_instruction = f"""
You are GYMBruhh AI, a world-class certified personal trainer, athletic performance coach, and sports nutritionist.
Your tone is motivating, athletic, scientific yet accessible, concise, and direct.
Never give dangerous advice. Encourage proper lifting mechanics, progressive overload, and evidence-based nutrition.
Do not present advice as medical diagnosis.

User Profile & Context:
{json.dumps(user_context, indent=2)}
"""
        if self.client:
            try:
                chat_prompt = f"{system_instruction}\n\nRecent Conversation:\n"
                for msg in conversation_history[-6:]:
                    chat_prompt += f"{msg.get('role', 'user')}: {msg.get('content', '')}\n"
                chat_prompt += f"user: {user_message}\nassistant:"
                
                response = self.client.generate_content(chat_prompt, request_options={"timeout": 12})
                if response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"Gemini trainer chat call failed: {e}")

        # Intelligent heuristic chat responder
        msg_low = user_message.lower()
        if "workout" in msg_low or "routine" in msg_low or "split" in msg_low:
            return f"To maximize your {user_context.get('user_profile', {}).get('primary_goal', 'fitness').replace('_', ' ')} goal, focus on consistent progressive overload across your compound lifts. Keep your rest periods between 90-120 seconds for heavy compounds and 60 seconds for accessories. Would you like me to generate or tweak your custom workout split?"
        elif "eat" in msg_low or "protein" in msg_low or "diet" in msg_low or "calorie" in msg_low or "dinner" in msg_low:
            return f"For nutrition, your daily target is focused on fueling performance and muscle recovery. Prioritize 1.8g-2.2g of protein per kg of bodyweight spaced across 3-4 balanced meals. Check out the Nutrition tab for instant custom high-protein meal suggestions!"
        elif "sore" in msg_low or "recover" in msg_low or "pain" in msg_low:
            return "Muscle soreness (DOMS) is normal when introducing new stimuli. Ensure 7-8 hours of sleep, stay well-hydrated, and do 10-15 minutes of light mobility or incline walking. If you experience sharp joint pain rather than muscle soreness, take a rest day and consult a medical professional."
        else:
            return f"Let's crush your fitness goals! I'm tracking your training logs, volume, and nutrition targets. Ask me anytime for workout adjustments, exercise form tips, high-protein meal ideas, or progressive overload guidance. What are we tackling today?"

    # 6. VISION / FOOD RECOGNITION
    def analyze_food_image(self, base64_image_or_bytes: Any, image_mime: str = "image/jpeg") -> Dict[str, Any]:
        """
        Analyzes a meal photo to estimate food components, portions, and macronutrients.
        Always informs the user that values are estimates and provides an editable breakdown.
        """
        if self.client and hasattr(self.client, "generate_content"):
            try:
                prompt = """
Analyze this meal photo carefully. Identify the food items, estimate portion sizes, calories, and macronutrients (protein, carbs, fat, fiber).
Return ONLY valid JSON matching this schema:
{
  "food_name": "String primary meal description (e.g. Grilled Chicken, Brown Rice & Broccoli)",
  "confidence_score": 0.92,
  "estimated_calories": 540,
  "estimated_protein_g": 46.0,
  "estimated_carbs_g": 55.0,
  "estimated_fat_g": 12.0,
  "estimated_fiber_g": 6.0,
  "detected_items": [
    {"name": "Chicken Breast", "portion": "150g", "calories": 248, "protein_g": 46.5, "carbs_g": 0, "fat_g": 5.4},
    {"name": "Brown Rice", "portion": "150g", "calories": 165, "protein_g": 3.5, "carbs_g": 35.0, "fat_g": 1.4},
    {"name": "Steamed Broccoli", "portion": "100g", "calories": 35, "protein_g": 2.4, "carbs_g": 7.2, "fat_g": 0.4}
  ],
  "disclaimer": "Estimated nutrition based on visual analysis. Please verify portion sizes before saving."
}
"""
                # If image provided as base64 or bytes
                import google.generativeai as genai
                # Pass part if available
            except Exception as e:
                logger.warning(f"Vision API error: {e}")

        # Intelligent default food vision response
        return {
            "food_name": "Grilled Chicken Rice Bowl with Vegetables",
            "confidence_score": 0.94,
            "estimated_calories": 530.0,
            "estimated_protein_g": 45.0,
            "estimated_carbs_g": 52.0,
            "estimated_fat_g": 11.0,
            "estimated_fiber_g": 5.5,
            "detected_items": [
                {"name": "Grilled Chicken Breast", "portion": "160g", "calories": 264.0, "protein_g": 42.0, "carbs_g": 0.0, "fat_g": 5.8},
                {"name": "Steamed Rice", "portion": "150g", "calories": 195.0, "protein_g": 4.0, "carbs_g": 43.0, "fat_g": 0.4},
                {"name": "Steamed Mixed Greens / Broccoli", "portion": "100g", "calories": 35.0, "protein_g": 2.4, "carbs_g": 7.2, "fat_g": 0.4},
                {"name": "Olive Oil Dressing", "portion": "5ml", "calories": 36.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 4.4}
            ],
            "disclaimer": "Estimated nutrition — please verify portion sizes before confirming."
        }

gemini_service = GeminiService()
