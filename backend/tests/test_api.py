import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_auth_and_onboarding_flow():
    # 1. Register
    email = f"tester_{pytest.__name__}@gymbruhh.test"
    reg_resp = client.post("/api/auth/register", json={
        "email": "athletic_user@example.com",
        "password": "StrongPassword123!",
        "full_name": "Marcus Kane"
    })
    # Might be 200 or 400 if already exists
    if reg_resp.status_code == 200:
        token = reg_resp.json()["access_token"]
    else:
        # Login
        login_resp = client.post("/api/auth/login", json={
            "email": "athletic_user@example.com",
            "password": "StrongPassword123!"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Complete Onboarding
    onboard_resp = client.post("/api/profile/onboarding", headers=headers, json={
        "age": 28,
        "gender": "male",
        "height_cm": 182.0,
        "current_weight_kg": 80.0,
        "target_weight_kg": 85.0,
        "fitness_level": "intermediate",
        "primary_goal": "muscle_gain",
        "activity_level": "very_active",
        "training_days_per_week": 5,
        "workout_duration_minutes": 65,
        "workout_location": "gym",
        "equipment_available": ["barbell", "dumbbells", "cables", "bench"],
        "preferred_split": "push_pull_legs",
        "dietary_preference": "non_vegetarian",
        "allergies_restrictions": []
    })
    assert onboard_resp.status_code == 200
    onboard_data = onboard_resp.json()
    assert onboard_data["status"] == "success"
    assert onboard_data["targets"]["target_calories"] > 2000

    # 3. Generate AI Workout
    ai_gen_resp = client.post("/api/ai/workout/generate", headers=headers, json={"custom_notes": "Focus on chest"})
    assert ai_gen_resp.status_code == 200
    ai_plan = ai_gen_resp.json()
    assert "plan_id" in ai_plan

    # 4. Check Today's Workout
    today_resp = client.get("/api/workouts/today", headers=headers)
    assert today_resp.status_code == 200

    # 5. Log Meal
    meal_resp = client.post("/api/nutrition/meals", headers=headers, json={
        "meal_type": "breakfast",
        "food_name": "Oatmeal with Whey Protein & Banana",
        "serving_qty": 1.0,
        "serving_unit": "bowl",
        "calories": 480.0,
        "protein_g": 38.0,
        "carbs_g": 62.0,
        "fat_g": 8.0,
        "fiber_g": 7.0
    })
    assert meal_resp.status_code == 200

    # 6. Check Daily Nutrition
    nutri_resp = client.get("/api/nutrition/today", headers=headers)
    assert nutri_resp.status_code == 200
    nutri_data = nutri_resp.json()
    assert nutri_data["total_calories"] >= 480.0
    assert nutri_data["total_protein_g"] >= 38.0

    # 7. Ask AI Trainer in Chat
    chat_resp = client.post("/api/ai/chat", headers=headers, json={
        "message": "What is the best way to progressively overload my bench press?"
    })
    assert chat_resp.status_code == 200
    assert len(chat_resp.json()["reply"]) > 20

    # 8. Check Progress Dashboard
    prog_resp = client.get("/api/progress/dashboard", headers=headers)
    assert prog_resp.status_code == 200
    prog_data = prog_resp.json()
    assert prog_data["current_weight_kg"] == 80.0
