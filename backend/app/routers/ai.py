from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.workout import WorkoutPlan, WorkoutDay, WorkoutExercise
from app.models.exercise import Exercise
from app.models.ai import AIConversation, AIMessage, AIRecommendation
from app.schemas import (
    GenerateWorkoutRequest, SuggestMealRequest, ReplaceExerciseRequest,
    AIChatRequest, AIChatResponse, VisionFoodScanRequest,
    AIRecommendationResponse, AcceptRecommendationRequest
)
from app.services.auth_service import get_current_user
from app.services.ai_context_engine import AIContextEngine
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/ai", tags=["Gemini AI Features"])

@router.post("/workout/generate")
def generate_workout(
    req: GenerateWorkoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Build scoped context
    context = AIContextEngine.build_workout_generator_context(current_user, db, req.custom_notes)
    
    # 2. Call Gemini
    raw_plan = gemini_service.generate_workout_plan(context)
    
    # 3. Deactivate existing active plans
    db.query(WorkoutPlan).filter(WorkoutPlan.user_id == current_user.id).update({"is_active": False})

    # 4. Save new WorkoutPlan
    plan = WorkoutPlan(
        user_id=current_user.id,
        title=raw_plan.get("plan_name", "AI Custom Workout Split"),
        description=raw_plan.get("description", "Periodized training split"),
        split_type=raw_plan.get("split_type", "custom"),
        difficulty=raw_plan.get("difficulty", "intermediate"),
        days_per_week=raw_plan.get("days_per_week", len(raw_plan.get("days", []))),
        is_active=True,
        created_by_ai=True,
        raw_ai_response=raw_plan
    )
    db.add(plan)
    db.flush()

    # 5. Insert days and match exercises to database catalog
    for day_data in raw_plan.get("days", []):
        day = WorkoutDay(
            plan_id=plan.id,
            day_name=day_data.get("day_name", "Day"),
            day_order=day_data.get("day_order", 1),
            focus_area=day_data.get("focus_area", "General"),
            description=day_data.get("description", ""),
            estimated_minutes=day_data.get("estimated_minutes", 60),
            is_rest_day=day_data.get("is_rest_day", False)
        )
        db.add(day)
        db.flush()

        for idx, ex_data in enumerate(day_data.get("exercises", []), start=1):
            ex_name = ex_data.get("exercise_name")
            # Find in exercise catalog
            ex_obj = db.query(Exercise).filter(Exercise.name.ilike(f"%{ex_name}%")).first()
            if not ex_obj:
                # Create as custom/catalog exercise
                ex_obj = Exercise(
                    name=ex_name,
                    slug=ex_name.lower().replace(" ", "-"),
                    primary_muscle="chest" if "bench" in ex_name.lower() or "push" in ex_name.lower() else "back",
                    category="strength",
                    equipment="barbell" if "barbell" in ex_name.lower() else "dumbbell",
                    instructions=f"Execute {ex_name} with proper control and strict tempo."
                )
                db.add(ex_obj)
                db.flush()

            we = WorkoutExercise(
                workout_day_id=day.id,
                exercise_id=ex_obj.id,
                order_in_day=idx,
                target_sets=ex_data.get("target_sets", 3),
                target_reps=str(ex_data.get("target_reps", "8-12")),
                target_rpe=float(ex_data.get("target_rpe", 8.0)),
                rest_seconds=int(ex_data.get("rest_seconds", 90)),
                notes=ex_data.get("notes", "")
            )
            db.add(we)

    db.commit()
    db.refresh(plan)

    return {
        "status": "success",
        "message": "AI Workout Plan created and activated!",
        "plan_id": plan.id,
        "plan": raw_plan
    }

@router.post("/nutrition/suggest")
def suggest_nutrition_meal(
    req: SuggestMealRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    context = AIContextEngine.build_nutrition_assistant_context(
        current_user, db, req.meal_type, req.user_prompt
    )
    suggestion = gemini_service.suggest_meal(context)
    return suggestion

@router.post("/exercise/replace")
def replace_exercise_recommendation(
    req: ReplaceExerciseRequest,
    db: Session = Depends(get_db)
):
    ex = db.query(Exercise).filter(Exercise.id == req.exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")

    subs = gemini_service.replace_exercise(
        current_exercise={
            "name": ex.name,
            "primary_muscle": ex.primary_muscle,
            "equipment": ex.equipment,
            "difficulty": ex.difficulty
        },
        available_equipment=["barbell", "dumbbells", "cables", "machine", "bodyweight"]
    )
    return subs

@router.post("/progress/analyze")
def analyze_progress_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    context = AIContextEngine.build_progress_review_context(current_user, db)
    analysis = gemini_service.analyze_progress(context)
    return analysis

@router.post("/chat", response_model=AIChatResponse)
def chat_with_trainer(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find or create conversation
    conv = None
    if req.conversation_id:
        conv = db.query(AIConversation).filter(
            AIConversation.id == req.conversation_id,
            AIConversation.user_id == current_user.id
        ).first()

    if not conv:
        conv = AIConversation(
            user_id=current_user.id,
            title="Fitness Consultation",
            context_type="general"
        )
        db.add(conv)
        db.flush()

    # Save user message
    user_msg = AIMessage(
        conversation_id=conv.id,
        sender="user",
        content=req.message
    )
    db.add(user_msg)

    # Fetch recent history
    history_messages = db.query(AIMessage).filter(
        AIMessage.conversation_id == conv.id
    ).order_by(AIMessage.created_at.asc()).all()

    conv_history = [{"role": m.sender, "content": m.content} for m in history_messages]

    # Assemble scoped context
    user_context = AIContextEngine.build_workout_generator_context(current_user, db)

    # Call Gemini
    reply_text = gemini_service.chat_trainer(conv_history, req.message, user_context)

    # Save assistant message
    ai_msg = AIMessage(
        conversation_id=conv.id,
        sender="assistant",
        content=reply_text
    )
    db.add(ai_msg)
    db.commit()

    return {
        "conversation_id": conv.id,
        "reply": reply_text,
        "sender": "assistant",
        "created_at": ai_msg.created_at
    }

@router.get("/chat/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(AIConversation).filter(
        AIConversation.user_id == current_user.id
    ).order_by(AIConversation.updated_at.desc()).first()

    if not conv:
        return {"conversation_id": None, "messages": []}

    messages = db.query(AIMessage).filter(
        AIMessage.conversation_id == conv.id
    ).order_by(AIMessage.created_at.asc()).all()

    return {
        "conversation_id": conv.id,
        "messages": [
            {
                "id": m.id,
                "sender": m.sender,
                "content": m.content,
                "created_at": m.created_at
            } for m in messages
        ]
    }

@router.post("/vision/food")
def scan_food_image(
    req: VisionFoodScanRequest
):
    scan_result = gemini_service.analyze_food_image(req.image_base64)
    return scan_result

@router.get("/recommendations", response_model=List[AIRecommendationResponse])
def get_pending_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recs = db.query(AIRecommendation).filter(
        AIRecommendation.user_id == current_user.id,
        AIRecommendation.is_accepted.is_(None)
    ).order_by(AIRecommendation.created_at.desc()).all()
    return recs

@router.post("/recommendations/respond")
def respond_to_recommendation(
    req: AcceptRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(AIRecommendation).filter(
        AIRecommendation.id == req.recommendation_id,
        AIRecommendation.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.is_accepted = req.accept
    db.commit()

    return {
        "status": "success",
        "accepted": req.accept,
        "message": "Recommendation preference updated."
    }
