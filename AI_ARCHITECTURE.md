# AI & GEMINI ARCHITECTURE — GYMBruhh

## Security Rules
1. **Never Call Gemini Directly from Mobile**: All requests route through the FastAPI backend (`backend/app/services/gemini_service.py`).
2. **API Keys Stored Exclusively on Server**: `GEMINI_API_KEY` is loaded from server `.env`.
3. **Structured JSON Validation**: Pydantic schemas enforce rigid output structure.
4. **Resilient Heuristics Fallbacks**: If the API key is not present or rate-limited, built-in athletic algorithms provide high-quality structured plans and suggestions without application failure.

## Context Engine Architecture

```text
[Request] → [AI Context Engine] → [Scoped Context JSON] → [Gemini API] → [JSON Schema Validation] → [Database Persistence]
```

### Context Builders:
1. **Workout Generator**: Passes user goal, experience level, available equipment, preferred duration, and training days.
2. **Nutrition Assistant**: Passes exact remaining daily calories and macronutrient budget (protein, carbs, fat), dietary preference, and allergies.
3. **Progress Analyzer**: Passes real calculated workout sessions count, total volume (kg), weight delta, and PR list.
4. **Adaptive Overload Engine**: Analyzes completed sets to detect when a lifter completed all working sets at high reps, creating an in-app proposal for +2.5kg / +5kg.
