from sqlalchemy.orm import Session
from app.models.exercise import Exercise
from app.models.nutrition import FoodItem
from app.models.user import User, UserSettings
from app.models.profile import FitnessProfile
from app.models.fitness_goal import FitnessGoal, FitnessCalculation
from app.models.workout import WorkoutPlan, WorkoutDay, WorkoutExercise
from app.services.auth_service import get_password_hash
from app.services.fitness_engine import FitnessCalculationEngine

EXERCISES_DATA = [
    # CHEST
    {
        "name": "Barbell Bench Press",
        "slug": "barbell-bench-press",
        "primary_muscle": "chest",
        "secondary_muscles": ["triceps", "front_delts"],
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "instructions": "Lie flat on bench with eyes under bar. Grip bar slightly wider than shoulder width. Retract scapula, lower bar to mid-chest under control, press up explosively while keeping feet planted.",
        "safety_notes": "Do not bounce the bar off your chest. Keep wrists straight.",
        "tips": ["Tuck elbows at ~45-70 degrees", "Engage leg drive"]
    },
    {
        "name": "Incline Dumbbell Press",
        "slug": "incline-dumbbell-press",
        "primary_muscle": "chest",
        "secondary_muscles": ["front_delts", "triceps"],
        "category": "hypertrophy",
        "equipment": "dumbbell",
        "difficulty": "intermediate",
        "instructions": "Set bench to 30-45 degrees. Press dumbbells overhead with neutral-to-pronated grip. Lower under control until dumbbells reach upper chest level, then press back up.",
        "safety_notes": "Avoid setting the incline too high (>45 deg shifts load excessively to front delts).",
        "tips": ["Squeeze upper chest at peak contraction"]
    },
    {
        "name": "Cable Chest Fly",
        "slug": "cable-chest-fly",
        "primary_muscle": "chest",
        "secondary_muscles": ["front_delts"],
        "category": "hypertrophy",
        "equipment": "cable",
        "difficulty": "beginner",
        "instructions": "Set pulleys to chest height. Take a step forward, maintain slight elbow bend, and bring hands together in a wide hugging motion.",
        "safety_notes": "Do not hyperextend shoulders on the eccentric stretch.",
        "tips": ["Focus on a deep chest stretch and peak squeeze"]
    },
    {
        "name": "Chest Dips",
        "slug": "chest-dips",
        "primary_muscle": "chest",
        "secondary_muscles": ["triceps", "front_delts"],
        "category": "strength",
        "equipment": "bodyweight",
        "difficulty": "intermediate",
        "instructions": "Grip parallel bars, lean torso forward ~30 degrees. Lower body until upper arms are parallel to floor, then press back up.",
        "safety_notes": "Avoid going too deep if you experience shoulder discomfort.",
        "tips": ["Flare elbows slightly to target lower chest"]
    },
    {
        "name": "Push-ups",
        "slug": "push-ups",
        "primary_muscle": "chest",
        "secondary_muscles": ["triceps", "front_delts", "core"],
        "category": "calisthenics",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "instructions": "Start in a high plank position with hands slightly wider than shoulders. Lower chest to floor with tight core, push up to start.",
        "safety_notes": "Avoid sagging hips; keep a rigid plank line.",
        "tips": ["Full range of motion beats high rep count"]
    },

    # BACK
    {
        "name": "Conventional Barbell Deadlift",
        "slug": "conventional-barbell-deadlift",
        "primary_muscle": "back",
        "secondary_muscles": ["hamstrings", "glutes", "traps", "forearms", "core"],
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "advanced",
        "instructions": "Stand with feet hip-width under bar (bar over mid-foot). Hinge at hips to grip bar. Brace lats and core, pull slack out of bar, drive floor away to stand tall.",
        "safety_notes": "Maintain neutral spine throughout. Never round your lower back under heavy load.",
        "tips": ["Drag bar up shins and thighs", "Lock out with glutes, not lower back hyperextension"]
    },
    {
        "name": "Pull-ups",
        "slug": "pull-ups",
        "primary_muscle": "back",
        "secondary_muscles": ["biceps", "rear_delts", "core"],
        "category": "calisthenics",
        "equipment": "bodyweight",
        "difficulty": "intermediate",
        "instructions": "Grip pull-up bar slightly wider than shoulder width with overhand grip. Pull chest toward bar by driving elbows down and back.",
        "safety_notes": "Control the descent to full dead-hang.",
        "tips": ["Depress scapula before initiating the pull"]
    },
    {
        "name": "Barbell Bent-Over Row",
        "slug": "barbell-bent-over-row",
        "primary_muscle": "back",
        "secondary_muscles": ["biceps", "rear_delts", "traps", "lower_back"],
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "instructions": "Hinge forward at ~45 degrees with flat back. Grip bar pronated or supinated. Pull bar toward belly button leading with elbows.",
        "safety_notes": "Do not jerk torso up to create momentum.",
        "tips": ["Keep knees slightly bent for lumbar stability"]
    },
    {
        "name": "Lat Pulldown",
        "slug": "lat-pulldown",
        "primary_muscle": "back",
        "secondary_muscles": ["biceps", "rear_delts"],
        "category": "hypertrophy",
        "equipment": "cable",
        "difficulty": "beginner",
        "instructions": "Sit securely with thighs under pads. Grip wide bar, lean back slightly (~10 deg), and pull bar to upper chest pulling elbows down.",
        "safety_notes": "Do not pull bar behind the neck.",
        "tips": ["Squeeze lats at bottom for 1 second"]
    },
    {
        "name": "Seated Cable Row",
        "slug": "seated-cable-row",
        "primary_muscle": "back",
        "secondary_muscles": ["biceps", "rhomboids", "rear_delts"],
        "category": "hypertrophy",
        "equipment": "cable",
        "difficulty": "beginner",
        "instructions": "Sit with feet on footplates, knees slightly bent. Pull V-bar attachment into abdomen while squeezing shoulder blades together.",
        "safety_notes": "Avoid excessive swinging back and forth.",
        "tips": ["Full stretch forward without rounding lumbar spine"]
    },
    {
        "name": "Single-Arm Dumbbell Row",
        "slug": "single-arm-dumbbell-row",
        "primary_muscle": "back",
        "secondary_muscles": ["biceps", "rear_delts", "core"],
        "category": "hypertrophy",
        "equipment": "dumbbell",
        "difficulty": "beginner",
        "instructions": "Place one knee and hand on flat bench. With free hand, pull dumbbell toward hip pocket in an arcing path.",
        "safety_notes": "Keep torso parallel to floor.",
        "tips": ["Think of your hand as a hook; pull with back"]
    },
    {
        "name": "Face Pulls",
        "slug": "face-pulls",
        "primary_muscle": "back",
        "secondary_muscles": ["rear_delts", "rotator_cuff", "traps"],
        "category": "hypertrophy",
        "equipment": "cable",
        "difficulty": "beginner",
        "instructions": "Attach rope to high pulley. Grip rope with thumbs pointing back. Pull rope toward bridge of nose while externally rotating shoulders.",
        "safety_notes": "Focus on high reps (15-20) and clean form rather than heavy weight.",
        "tips": ["Excellent for shoulder posture and joint health"]
    },

    # SHOULDERS
    {
        "name": "Overhead Barbell Press",
        "slug": "overhead-barbell-press",
        "primary_muscle": "shoulders",
        "secondary_muscles": ["triceps", "upper_chest", "core"],
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "instructions": "Stand tall with bar racked at clavicles. Brace glutes and abs. Press bar overhead in straight vertical line, moving head out of way.",
        "safety_notes": "Do not hyperextend lower back to assist the lift.",
        "tips": ["Lock out over mid-foot balance point"]
    },
    {
        "name": "Dumbbell Lateral Raise",
        "slug": "dumbbell-lateral-raise",
        "primary_muscle": "shoulders",
        "secondary_muscles": ["traps"],
        "category": "hypertrophy",
        "equipment": "dumbbell",
        "difficulty": "beginner",
        "instructions": "Stand with dumbbells at sides. Raise arms out to sides until parallel with floor, with slight forward angle (scapular plane).",
        "safety_notes": "Do not shrug traps excessively.",
        "tips": ["Lead with elbows, pour the pitcher mental cue"]
    },
    {
        "name": "Seated Dumbbell Shoulder Press",
        "slug": "seated-dumbbell-shoulder-press",
        "primary_muscle": "shoulders",
        "secondary_muscles": ["triceps", "front_delts"],
        "category": "hypertrophy",
        "equipment": "dumbbell",
        "difficulty": "intermediate",
        "instructions": "Sit on bench with vertical backrest. Press dumbbells overhead from ear level until arms are nearly locked out.",
        "safety_notes": "Keep core tight against backrest.",
        "tips": ["Control the descent for 2-3 seconds"]
    },
    {
        "name": "Reverse Pec Deck Fly",
        "slug": "reverse-pec-deck-fly",
        "primary_muscle": "shoulders",
        "secondary_muscles": ["rear_delts", "rhomboids"],
        "category": "hypertrophy",
        "equipment": "machine",
        "difficulty": "beginner",
        "instructions": "Sit facing the machine. Adjust seat so handles are shoulder level. Push handles back in wide arc focusing on rear delts.",
        "safety_notes": "Keep slight elbow bend.",
        "tips": ["Isolates rear deltoids safely"]
    },

    # LEGS (QUADS, HAMSTRINGS, GLUTES, CALVES)
    {
        "name": "Barbell Back Squat",
        "slug": "barbell-back-squat",
        "primary_muscle": "quads",
        "secondary_muscles": ["glutes", "hamstrings", "calves", "core"],
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "advanced",
        "instructions": "Place bar on upper traps. Unrack and take 2-3 steps back. Squat down by breaking at hips and knees simultaneously until thighs are parallel to floor or below. Drive up through midfoot.",
        "safety_notes": "Always use safety spotter arms or pins.",
        "tips": ["Keep chest proud and knees tracking in line with toes"]
    },
    {
        "name": "Leg Press",
        "slug": "leg-press",
        "primary_muscle": "quads",
        "secondary_muscles": ["glutes", "hamstrings"],
        "category": "hypertrophy",
        "equipment": "machine",
        "difficulty": "beginner",
        "instructions": "Sit in machine with back flat against pad. Place feet shoulder-width on sled. Lower sled until knees reach 90 degrees, then press back up without locking knees.",
        "safety_notes": "Never lock out your knees violently at top.",
        "tips": ["High foot placement targets glutes/hamstrings, low placement targets quads"]
    },
    {
        "name": "Bulgarian Split Squat",
        "slug": "bulgarian-split-squat",
        "primary_muscle": "quads",
        "secondary_muscles": ["glutes", "hamstrings", "core"],
        "category": "hypertrophy",
        "equipment": "dumbbell",
        "difficulty": "intermediate",
        "instructions": "Place one foot behind you elevated on a bench. Holding dumbbells, lower back knee toward floor while maintaining upright or slightly forward torso.",
        "safety_notes": "Ensure front foot is far enough forward for knee comfort.",
        "tips": ["Incredible unilateral leg strength and hypertrophy builder"]
    },
    {
        "name": "Romanian Deadlift (RDL)",
        "slug": "romanian-deadlift",
        "primary_muscle": "hamstrings",
        "secondary_muscles": ["glutes", "lower_back", "forearms"],
        "category": "hypertrophy",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "instructions": "Hold barbell with overhand grip at thighs. Hinge back at hips with soft knees, pushing hips toward wall behind you until deep hamstring stretch is felt. Drive hips forward to stand.",
        "safety_notes": "Keep spine neutral; do not round thoracic or lumbar spine.",
        "tips": ["Think of pushing your hips back rather than bending down"]
    },
    {
        "name": "Barbell Hip Thrust",
        "slug": "barbell-hip-thrust",
        "primary_muscle": "glutes",
        "secondary_muscles": ["hamstrings", "quads"],
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "instructions": "Sit on floor with upper back against bench and padded bar across hips. Plant feet flat, drive through heels to extend hips until thighs and torso form horizontal line.",
        "safety_notes": "Keep chin tucked and ribs down to avoid arching lumbar spine.",
        "tips": ["Squeeze glutes hard at the top for 2 seconds"]
    },
    {
        "name": "Lying Leg Curl",
        "slug": "lying-leg-curl",
        "primary_muscle": "hamstrings",
        "secondary_muscles": ["calves"],
        "category": "hypertrophy",
        "equipment": "machine",
        "difficulty": "beginner",
        "instructions": "Lie face down with pad resting above heels. Curl legs up toward glutes, pausing at peak contraction before lowering slowly.",
        "safety_notes": "Keep hips pinned to pad.",
        "tips": ["Control the 3-second eccentric phase"]
    },
    {
        "name": "Leg Extension",
        "slug": "leg-extension",
        "primary_muscle": "quads",
        "secondary_muscles": [],
        "category": "hypertrophy",
        "equipment": "machine",
        "difficulty": "beginner",
        "instructions": "Sit with knees aligned with machine pivot point and pad across lower shins. Extend legs until straight, squeezing quads at top.",
        "safety_notes": "Avoid kicking weight up using momentum.",
        "tips": ["Isolates rectus femoris and quad heads"]
    },
    {
        "name": "Standing Calf Raise",
        "slug": "standing-calf-raise",
        "primary_muscle": "calves",
        "secondary_muscles": [],
        "category": "hypertrophy",
        "equipment": "machine",
        "difficulty": "beginner",
        "instructions": "Place balls of feet on block, pads on shoulders. Lower heels for deep stretch, then push up onto toes to peak contraction.",
        "safety_notes": "Do not bounce.",
        "tips": ["Pause 2 seconds at the bottom stretch and 1 second at top"]
    },

    # ARMS (BICEPS, TRICEPS)
    {
        "name": "Barbell Bicep Curl",
        "slug": "barbell-bicep-curl",
        "primary_muscle": "biceps",
        "secondary_muscles": ["forearms"],
        "category": "hypertrophy",
        "equipment": "barbell",
        "difficulty": "beginner",
        "instructions": "Stand tall holding bar with underhand grip. Keep elbows pinned to sides, curl bar up toward shoulders, squeeze at top.",
        "safety_notes": "Do not swing your lower back.",
        "tips": ["Use EZ curl bar if straight bar causes wrist discomfort"]
    },
    {
        "name": "Incline Dumbbell Curl",
        "slug": "incline-dumbbell-curl",
        "primary_muscle": "biceps",
        "secondary_muscles": ["forearms"],
        "category": "hypertrophy",
        "equipment": "dumbbell",
        "difficulty": "intermediate",
        "instructions": "Sit on bench angled at 45-60 degrees with arms hanging down. Curl dumbbells up while keeping elbows back, providing maximum long-head stretch.",
        "safety_notes": "Start with lighter weight to protect biceps tendon.",
        "tips": ["One of the best long-head bicep builders"]
    },
    {
        "name": "Hammer Curl",
        "slug": "hammer-curl",
        "primary_muscle": "biceps",
        "secondary_muscles": ["forearms", "brachialis"],
        "category": "hypertrophy",
        "equipment": "dumbbell",
        "difficulty": "beginner",
        "instructions": "Hold dumbbells with neutral (palms facing each other) grip. Curl weights up without rotating wrists.",
        "safety_notes": "Keep core tight.",
        "tips": ["Builds brachialis thickness and forearm strength"]
    },
    {
        "name": "Tricep Rope Pushdown",
        "slug": "tricep-rope-pushdown",
        "primary_muscle": "triceps",
        "secondary_muscles": [],
        "category": "hypertrophy",
        "equipment": "cable",
        "difficulty": "beginner",
        "instructions": "Attach rope to high pulley. Keep elbows tucked at sides, push rope down and spread ends apart at bottom for peak triceps contraction.",
        "safety_notes": "Do not let elbows drift forward.",
        "tips": ["Squeeze the lateral head of triceps at full extension"]
    },
    {
        "name": "Skull Crushers (EZ Bar)",
        "slug": "skull-crushers-ez-bar",
        "primary_muscle": "triceps",
        "secondary_muscles": [],
        "category": "hypertrophy",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "instructions": "Lie flat on bench holding EZ bar with arms extended above chest. Keeping upper arms stationary, bend elbows to lower bar toward forehead or slightly behind head, then extend back up.",
        "safety_notes": "Lower bar with control; use a reliable grip.",
        "tips": ["Lowering slightly behind the head keeps constant tension on triceps long head"]
    },
    {
        "name": "Overhead Cable Tricep Extension",
        "slug": "overhead-cable-tricep-extension",
        "primary_muscle": "triceps",
        "secondary_muscles": [],
        "category": "hypertrophy",
        "equipment": "cable",
        "difficulty": "beginner",
        "instructions": "Face away from high/mid pulley holding rope behind head. Extend arms forward overhead, locking out triceps.",
        "safety_notes": "Keep ribcage locked down.",
        "tips": ["Maximizes the stretch on the long head of the triceps"]
    },

    # CORE & CARDIO
    {
        "name": "Hanging Leg Raise",
        "slug": "hanging-leg-raise",
        "primary_muscle": "abs",
        "secondary_muscles": ["hip_flexors", "forearms"],
        "category": "calisthenics",
        "equipment": "bodyweight",
        "difficulty": "intermediate",
        "instructions": "Hang from pull-up bar. Without swinging, raise legs up until parallel to floor or touching bar, curling pelvis toward ribs.",
        "safety_notes": "Avoid using swinging momentum.",
        "tips": ["Focus on curling the pelvis upward rather than just raising the legs"]
    },
    {
        "name": "Cable Woodchoppers",
        "slug": "cable-woodchoppers",
        "primary_muscle": "abs",
        "secondary_muscles": ["obliques", "shoulders"],
        "category": "strength",
        "equipment": "cable",
        "difficulty": "beginner",
        "instructions": "Set pulley to high or low position. Grip handle with both hands, rotate torso diagonally across body while pivoting back foot.",
        "safety_notes": "Rotate through core and hips, not just arms.",
        "tips": ["Terrific for rotational power and oblique development"]
    },
    {
        "name": "Treadmill Incline Walk",
        "slug": "treadmill-incline-walk",
        "primary_muscle": "cardio",
        "secondary_muscles": ["calves", "glutes", "heart"],
        "category": "endurance",
        "equipment": "machine",
        "difficulty": "beginner",
        "instructions": "Set treadmill incline to 10-15% and speed to 4.5-5.5 km/h. Walk at steady pace for 20-45 minutes.",
        "safety_notes": "Do not hold onto handrails; swing arms naturally.",
        "tips": ["Low-impact Zone 2 cardio that burns calories without taxing lifting recovery"]
    }
]

FOODS_DATA = [
    # PROTEINS
    {"name": "Chicken Breast (Cooked, Skinless)", "category": "protein", "serving_size_qty": 100, "serving_size_unit": "g", "calories": 165, "protein_g": 31.0, "carbs_g": 0.0, "fat_g": 3.6, "fiber_g": 0.0},
    {"name": "Whey Protein Isolate", "category": "protein", "brand": "Standard", "serving_size_qty": 30, "serving_size_unit": "g (1 scoop)", "calories": 120, "protein_g": 25.0, "carbs_g": 2.0, "fat_g": 1.0, "fiber_g": 0.0},
    {"name": "Eggs (Whole, Large)", "category": "protein", "serving_size_qty": 50, "serving_size_unit": "g (1 egg)", "calories": 72, "protein_g": 6.3, "carbs_g": 0.4, "fat_g": 4.8, "fiber_g": 0.0},
    {"name": "Egg Whites", "category": "protein", "serving_size_qty": 100, "serving_size_unit": "g (~3 whites)", "calories": 52, "protein_g": 11.0, "carbs_g": 0.7, "fat_g": 0.2, "fiber_g": 0.0},
    {"name": "Salmon Fillet (Raw)", "category": "protein", "serving_size_qty": 100, "serving_size_unit": "g", "calories": 208, "protein_g": 20.4, "carbs_g": 0.0, "fat_g": 13.4, "fiber_g": 0.0},
    {"name": "Lean Ground Beef (93/7)", "category": "protein", "serving_size_qty": 100, "serving_size_unit": "g", "calories": 152, "protein_g": 21.4, "carbs_g": 0.0, "fat_g": 7.3, "fiber_g": 0.0},
    {"name": "Canned Tuna in Water", "category": "protein", "serving_size_qty": 100, "serving_size_unit": "g", "calories": 116, "protein_g": 26.0, "carbs_g": 0.0, "fat_g": 0.8, "fiber_g": 0.0},
    {"name": "Greek Yogurt (Non-Fat, Plain)", "category": "dairy", "serving_size_qty": 170, "serving_size_unit": "g (3/4 cup)", "calories": 100, "protein_g": 18.0, "carbs_g": 6.0, "fat_g": 0.7, "fiber_g": 0.0},
    {"name": "Cottage Cheese (Low-Fat 2%)", "category": "dairy", "serving_size_qty": 113, "serving_size_unit": "g (1/2 cup)", "calories": 90, "protein_g": 13.0, "carbs_g": 5.0, "fat_g": 2.5, "fiber_g": 0.0},
    {"name": "Tofu (Firm)", "category": "protein", "serving_size_qty": 100, "serving_size_unit": "g", "calories": 83, "protein_g": 10.0, "carbs_g": 1.9, "fat_g": 5.3, "fiber_g": 0.9},

    # CARBOHYDRATES & GRAINS
    {"name": "Rolled Oats (Dry)", "category": "grains", "serving_size_qty": 50, "serving_size_unit": "g (1/2 cup)", "calories": 190, "protein_g": 6.5, "carbs_g": 33.0, "fat_g": 3.0, "fiber_g": 5.0},
    {"name": "Jasmine White Rice (Cooked)", "category": "grains", "serving_size_qty": 150, "serving_size_unit": "g (1 cup)", "calories": 195, "protein_g": 4.0, "carbs_g": 43.0, "fat_g": 0.4, "fiber_g": 0.6},
    {"name": "Brown Rice (Cooked)", "category": "grains", "serving_size_qty": 150, "serving_size_unit": "g (1 cup)", "calories": 165, "protein_g": 3.5, "carbs_g": 35.0, "fat_g": 1.4, "fiber_g": 2.5},
    {"name": "Sweet Potato (Baked)", "category": "vegetables", "serving_size_qty": 150, "serving_size_unit": "g (1 medium)", "calories": 135, "protein_g": 3.0, "carbs_g": 31.0, "fat_g": 0.2, "fiber_g": 4.5},
    {"name": "White Potato (Baked)", "category": "vegetables", "serving_size_qty": 150, "serving_size_unit": "g (1 medium)", "calories": 140, "protein_g": 3.5, "carbs_g": 32.0, "fat_g": 0.2, "fiber_g": 3.0},
    {"name": "Whole Wheat Bread", "category": "grains", "serving_size_qty": 40, "serving_size_unit": "g (1 slice)", "calories": 95, "protein_g": 4.5, "carbs_g": 16.0, "fat_g": 1.5, "fiber_g": 2.5},
    {"name": "Banana (Fresh)", "category": "fruits", "serving_size_qty": 118, "serving_size_unit": "g (1 medium)", "calories": 105, "protein_g": 1.3, "carbs_g": 27.0, "fat_g": 0.3, "fiber_g": 3.1},
    {"name": "Blueberries (Fresh)", "category": "fruits", "serving_size_qty": 100, "serving_size_unit": "g (1 cup)", "calories": 57, "protein_g": 0.7, "carbs_g": 14.5, "fat_g": 0.3, "fiber_g": 2.4},
    {"name": "Apple (Fresh)", "category": "fruits", "serving_size_qty": 182, "serving_size_unit": "g (1 medium)", "calories": 95, "protein_g": 0.5, "carbs_g": 25.0, "fat_g": 0.3, "fiber_g": 4.4},
    {"name": "Quinoa (Cooked)", "category": "grains", "serving_size_qty": 100, "serving_size_unit": "g", "calories": 120, "protein_g": 4.4, "carbs_g": 21.3, "fat_g": 1.9, "fiber_g": 2.8},

    # HEALTHY FATS & OILS
    {"name": "Peanut Butter (Natural)", "category": "fats", "serving_size_qty": 32, "serving_size_unit": "g (2 tbsp)", "calories": 190, "protein_g": 8.0, "carbs_g": 7.0, "fat_g": 16.0, "fiber_g": 2.0},
    {"name": "Avocado (Fresh)", "category": "fats", "serving_size_qty": 100, "serving_size_unit": "g (1/2 avocado)", "calories": 160, "protein_g": 2.0, "carbs_g": 8.5, "fat_g": 14.7, "fiber_g": 6.7},
    {"name": "Extra Virgin Olive Oil", "category": "fats", "serving_size_qty": 14, "serving_size_unit": "ml (1 tbsp)", "calories": 120, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 14.0, "fiber_g": 0.0},
    {"name": "Almonds (Raw)", "category": "fats", "serving_size_qty": 28, "serving_size_unit": "g (1 handful / 23 nuts)", "calories": 164, "protein_g": 6.0, "carbs_g": 6.1, "fat_g": 14.2, "fiber_g": 3.5},
    {"name": "Walnuts (Raw)", "category": "fats", "serving_size_qty": 28, "serving_size_unit": "g", "calories": 185, "protein_g": 4.3, "carbs_g": 3.9, "fat_g": 18.5, "fiber_g": 1.9},

    # VEGETABLES & FIBER
    {"name": "Broccoli (Steamed)", "category": "vegetables", "serving_size_qty": 100, "serving_size_unit": "g", "calories": 35, "protein_g": 2.4, "carbs_g": 7.2, "fat_g": 0.4, "fiber_g": 3.3},
    {"name": "Baby Spinach (Raw)", "category": "vegetables", "serving_size_qty": 100, "serving_size_unit": "g", "calories": 23, "protein_g": 2.9, "carbs_g": 3.6, "fat_g": 0.4, "fiber_g": 2.2},
    {"name": "Bell Peppers (Mixed)", "category": "vegetables", "serving_size_qty": 100, "serving_size_unit": "g", "calories": 26, "protein_g": 1.0, "carbs_g": 6.0, "fat_g": 0.2, "fiber_g": 2.1},
    {"name": "Asparagus (Grilled)", "category": "vegetables", "serving_size_qty": 100, "serving_size_unit": "g", "calories": 22, "protein_g": 2.4, "carbs_g": 4.0, "fat_g": 0.2, "fiber_g": 2.0}
]

def seed_database_if_empty(db: Session):
    """Populates exercise catalog and food database if tables are empty."""
    # 1. Seed Exercises
    exercise_count = db.query(Exercise).count()
    if exercise_count == 0:
        for ex_data in EXERCISES_DATA:
            ex = Exercise(**ex_data)
            db.add(ex)
        db.commit()

    # 2. Seed Foods
    food_count = db.query(FoodItem).count()
    if food_count == 0:
        for food_data in FOODS_DATA:
            food = FoodItem(**food_data)
            db.add(food)
        db.commit()

    # 3. Seed Demo / Test User if no user exists
    user_count = db.query(User).count()
    if user_count == 0:
        demo_user = User(
            email="demo@gymbruhh.com",
            hashed_password=get_password_hash("FitAI@2026"),
            full_name="Alex Mercer",
            is_active=True,
            is_onboarded=True
        )
        db.add(demo_user)
        db.flush()

        settings = UserSettings(user_id=demo_user.id)
        db.add(settings)

        profile = FitnessProfile(
            user_id=demo_user.id,
            age=26,
            gender="male",
            height_cm=180.0,
            current_weight_kg=78.0,
            target_weight_kg=82.0,
            fitness_level="intermediate",
            primary_goal="muscle_gain",
            activity_level="moderately_active",
            training_days_per_week=4,
            workout_duration_minutes=60,
            workout_location="gym",
            equipment_available=["barbell", "dumbbells", "cables", "bench", "pull_up_bar"],
            preferred_split="push_pull_legs",
            dietary_preference="non_vegetarian"
        )
        db.add(profile)

        # Deterministic targets calculation
        targets = FitnessCalculationEngine.calculate_all_targets(
            weight_kg=78.0,
            height_cm=180.0,
            age=26,
            gender="male",
            fitness_goal="muscle_gain",
            activity_level="moderately_active"
        )

        calc = FitnessCalculation(
            user_id=demo_user.id,
            bmi=targets["bmi"],
            bmi_category=targets["bmi_category"],
            bmr=targets["bmr"],
            tdee=targets["tdee"],
            target_calories=targets["target_calories"],
            target_protein_grams=targets["target_protein_grams"],
            target_carbs_grams=targets["target_carbs_grams"],
            target_fat_grams=targets["target_fat_grams"],
            calculation_notes=targets["notes"],
            is_current=True
        )
        db.add(calc)

        goal = FitnessGoal(
            user_id=demo_user.id,
            goal_type="muscle_gain",
            target_weight_kg=82.0,
            is_active=True
        )
        db.add(goal)

        db.commit()
