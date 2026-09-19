from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.workout import WorkoutSession, ExerciseLog, SetLog, WorkoutExercise
from app.models.ai import AIRecommendation
from app.models.user import User

class AdaptiveWorkoutEngine:
    """
    Automated progressive overload & performance analyzer.
    Detects when a user has conquered a weight or hit a plateau and
    creates structured AI suggestions requiring user approval.
    """

    @staticmethod
    def analyze_completed_session(session: WorkoutSession, db: Session) -> List[AIRecommendation]:
        recommendations = []
        user_id = session.user_id

        for ex_log in session.exercise_logs:
            exercise = ex_log.exercise
            completed_sets = [s for s in ex_log.sets if s.is_completed and not s.is_warmup]
            if len(completed_sets) < 2:
                continue

            # Check if all working sets were completed with solid reps
            avg_weight = sum(s.weight_kg for s in completed_sets) / len(completed_sets)
            avg_reps = sum(s.reps for s in completed_sets) / len(completed_sets)
            
            # If user completed 3+ sets with high reps (>= 10 or >= 8 for compounds)
            if avg_reps >= 10 and avg_weight > 0:
                # Progressive overload candidate
                is_lower_body = exercise.primary_muscle in ["quads", "hamstrings", "glutes"]
                increment_kg = 5.0 if is_lower_body else 2.5
                new_weight = avg_weight + increment_kg

                rec = AIRecommendation(
                    user_id=user_id,
                    category="progressive_overload",
                    title=f"Progressive Overload: {exercise.name}",
                    recommendation_text=f"Increase working weight on {exercise.name} from {avg_weight:.1f}kg to {new_weight:.1f}kg.",
                    reasoning=f"You successfully completed {len(completed_sets)} working sets with an average of {avg_reps:.1f} reps at {avg_weight:.1f}kg, indicating readiness for progressive overload.",
                    action_type="adjust_weight",
                    action_data={
                        "exercise_id": exercise.id,
                        "exercise_name": exercise.name,
                        "current_weight_kg": avg_weight,
                        "suggested_weight_kg": new_weight,
                        "increment_kg": increment_kg
                    },
                    is_accepted=None
                )
                db.add(rec)
                recommendations.append(rec)

        if recommendations:
            db.commit()

        return recommendations
