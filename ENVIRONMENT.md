# ENVIRONMENT VARIABLES — GYMBruhh

All sensitive credentials must be set in `backend/.env`. Never expose secrets in client-side repositories.

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key. When omitted, robust athletic heuristics are used. |
| `DATABASE_URL` | No | `sqlite:///./gym_bruhh.db` | SQLAlchemy database connection string (SQLite or PostgreSQL). |
| `JWT_SECRET` | Yes | `gym_bruhh_super_secure_jwt_secret_key_2026_fitness_ai_token` | Secret key used for signing JWT authentication tokens. |
| `JWT_ALGORITHM` | No | `HS256` | Algorithm for token hashing. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `10080` (7 days) | Token validity duration in minutes. |
| `CORS_ORIGINS` | No | `*` | Allowed CORS origins. |
| `PROJECT_NAME` | No | `GYMBruhh AI Gym & Fitness Companion` | Name of the project. |
| `ENVIRONMENT` | No | `development` | Environment mode (`development` / `production`). |
