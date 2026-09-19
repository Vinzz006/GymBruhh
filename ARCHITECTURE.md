# SYSTEM ARCHITECTURE — GYMBruhh

## High-Level Architecture

```mermaid
graph TD
    FlutterApp[Flutter Mobile App (Android / iOS)] -->|REST JSON + JWT| FastAPI[FastAPI Backend Engine]
    FastAPI -->|Deterministic Calculations| FitnessEngine[Fitness Calculation Engine]
    FastAPI -->|Context Scoping| AIContext[AI Context Engine]
    AIContext -->|Structured Prompt & Schema Validation| GeminiAPI[Google Gemini API]
    FastAPI -->|SQLAlchemy ORM| DB[(Relational Database: SQLite / PostgreSQL)]
    FlutterApp -->|SharedPreferences| LocalCache[Offline Storage & JWT Token]
```

## Layered Design

1. **Presentation Layer (Flutter + Dart)**:
   - State Management: `Provider` (AuthProvider, WorkoutProvider, NutritionProvider, ProgressProvider, AIProvider).
   - Theme: Athletic Dark Obsidian Palette (`#090B10`, `#121620`, Electric Lime `#22C55E`, Electric Cyan `#00F0FF`, Energy Orange `#FF6B00`, AI Purple `#8B5CF6`).
   - Clean UI separation: Screens and custom widgets do not hold raw database or business arithmetic.

2. **API & Security Layer (FastAPI)**:
   - Token-based JWT Authentication with password hashing.
   - CORS middleware and latency headers.
   - Centralized dependency injection (`get_db`, `get_current_user`).

3. **Deterministic Fitness Engine**:
   - Computes BMI, BMR, TDEE, Calorie targets, and Protein/Carb/Fat macro distribution using scientific formulas (Mifflin-St Jeor) in application logic without outsourcing arithmetic to LLMs.

4. **AI Mediation Layer**:
   - Scopes context payloads specifically for each AI task (workout generation, nutrition suggestion, exercise replacement, progressive overload proposal, progress analysis).
   - Validates JSON responses against schema with automatic fallback generators.
