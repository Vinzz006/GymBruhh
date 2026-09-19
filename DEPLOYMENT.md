# Production Deployment & Environment Guide — GYMBruhh

This document outlines the deployment strategy for the **GYMBruhh** production platform.

---

## 🏛️ System Architecture

```
                      Client Layer
             ┌─────────────────────────┐
             │ Flutter Mobile App      │
             │ (Android APK/AAB & iOS) │
             └────────────┬────────────┘
                          │ HTTPS / JWT Bearer
                          ▼
                      API Layer
             ┌─────────────────────────┐
             │ FastAPI + Uvicorn       │
             │ - JWT Authentication    │
             │ - Deterministic Engine  │
             │ - Context Sanitization  │
             └────────────┬────────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
      Relational DB              Google Gemini API
      (PostgreSQL / SQLite)      (Structured JSON)
```

---

## 🔒 Security Principles

1. **AI API Key Isolation**:
   - The Gemini API Key (`GEMINI_API_KEY`) is **strictly stored in backend environment variables**.
   - The mobile application **never** receives or stores the API key.
   - All AI interactions pass through the backend with context scoping and schema validation.

2. **JWT Authentication**:
   - Access tokens are signed using `HS256` with strong secrets (`JWT_SECRET`).
   - Tokens are stored securely using `SharedPreferences` on mobile.

3. **Data Integrity**:
   - Deterministic calculations (BMI, BMR, TDEE, Calories, Macros, 1RM) are computed using scientific formulas on the server rather than estimated by LLMs.

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` in the backend directory:

```bash
cp backend/.env.example backend/.env
```

### Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini Model Identifier | `gemini-1.5-flash` |
| `DATABASE_URL` | SQLAlchemy Connection String | `postgresql://user:pass@host:5432/gymbruhh` |
| `JWT_SECRET` | 64-char Hex Secret Key | `2cbf138a...` |
| `JWT_ALGORITHM` | JWT Signing Algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token Lifetime | `10080` (7 days) |
| `CORS_ORIGINS` | Allowed CORS Origins | `*` |
| `ENVIRONMENT` | Runtime Environment | `production` |

---

## 🚀 Backend Deployment (Docker / VPS / Cloud)

### Run with Gunicorn / Uvicorn Workers
```bash
cd backend
python -m pip install -r requirements.txt
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Health Check Endpoint
```bash
curl -X GET http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "online",
  "service": "GYMBruhh AI Gym & Fitness Companion",
  "version": "1.0.0",
  "ai_engine": "Gemini API with Fallback Heuristics",
  "database": "Persistent Relational Engine"
}
```
