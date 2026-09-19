# GymBruhh

<div align="center">
  <h3>⚡ TRACK → ANALYZE → TRAIN → LEARN → ADAPT ⚡</h3>
  <p>Production-Grade AI-Powered Mobile Fitness Application built with <strong>React Native + Expo Go (Mobile)</strong>, <strong>FastAPI + Python (Backend)</strong>, and powered by the <strong>Google Gemini API</strong>.</p>
</div>

---

## 🛠️ Technology Stack

* **Mobile Frontend**: React Native + TypeScript + Expo (Expo Go Framework)
* **Backend API**: FastAPI + Python + SQLAlchemy
* **Database**: SQLite (Development) / PostgreSQL (Production)
* **AI Intelligence**: Google Gemini API (Server-mediated with schema validation & athletic heuristic fallbacks)

---

## 🌟 Key Features

1. **Deterministic Fitness Engine**:
   - Mifflin-St Jeor Basal Metabolic Rate (BMR)
   - Total Daily Energy Expenditure (TDEE) with activity multipliers
   - Goal-adjusted calorie & macronutrient targets (Protein, Carbs, Fat)
   - Combined Epley & Brzycki Estimated 1-Rep Max (1RM) calculations

2. **AI-Powered Features (Gemini API with Server Mediation)**:
   - **AI Workout Generator**: Periodized split generator returning structured JSON schemas
   - **AI Nutrition Assistant**: Real-time recipe and high-protein dinner suggestions tailored to exact remaining daily macros
   - **AI Exercise Substitution**: Biomechanically equivalent exercise replacements
   - **AI Progress Analyzer**: Weekly review analyzing volume, consistency, and strength progression
   - **Adaptive Progressive Overload Engine**: Proposes +2.5kg / +5kg load increases when target reps are hit
   - **AI Trainer Chat**: Interactive fitness & form coach with contextual memory
   - **AI Food Vision Scanner**: Macro estimation from meal photos with user confirmation

3. **Active Workout Tracking**:
   - Live elapsed timer and auto rest timer countdown with haptic feedback & skip/+30s buttons
   - Live set/rep/weight logging with ghost metrics from previous sessions
   - Real-time Personal Record (PR) detection and celebration

4. **Nutrition & Food Database**:
   - Searchable food database with calories, protein, carbs, fat, fiber
   - Meal logging across Breakfast, Lunch, Dinner, and Snacks
   - Water intake tracker (+250ml quick add)

5. **Progress & Analytics**:
   - Interactive weight projection line chart (SVG based)
   - Body measurements log (chest, waist, hips, arms, thighs, calves)
   - Personal Records (PR) gold trophy showcase

---

## 🏗️ Project Architecture

```text
GymBruhh/
│
├── mobile/                   # React Native + Expo Mobile Application (Expo Go)
│   ├── src/
│   │   ├── constants/        # API endpoints, colors, layout tokens
│   │   ├── types/            # TypeScript data models (User, Workout, Nutrition, etc.)
│   │   ├── services/         # HTTP API client, AsyncStorage wrapper
│   │   ├── context/          # React Context providers (Auth, Workout, Nutrition, Progress, AI)
│   │   ├── components/       # Reusable athletic UI components & modals
│   │   ├── screens/          # Splash, Auth, Onboarding (7 steps), Tabs, Active Workout, Settings
│   │   └── navigation/       # Root & Bottom Tab Navigators with active session resume banner
│   ├── App.tsx               # Main entrypoint with Context providers
│   ├── app.json              # Expo configuration
│   └── package.json          # React Native dependencies
│
├── mobile_flutter/           # Archived Flutter + Dart Mobile Application
│   │   ├── widgets/          # Custom reusable athletic UI widgets
│   │   └── main.dart         # Flutter app entrypoint & MultiProvider setup
│   ├── test/                 # Fitness calculation, models, and widget tests
│   ├── pubspec.yaml          # Flutter dependencies
│   └── analysis_options.yaml # Flutter lint rules
│
├── backend/                  # FastAPI + Python Backend
│   ├── app/
│   │   ├── config.py         # Pydantic Settings
│   │   ├── database.py       # SQLAlchemy Session & Engine
│   │   ├── models/           # 19 Relational Database Tables
│   │   ├── routers/          # Auth, Profile, Workouts, Nutrition, Progress, AI, Settings
│   │   ├── schemas/          # Pydantic v2 Request/Response Schemas
│   │   └── services/         # Deterministic Engine, Gemini AI, Context Engine
│   ├── tests/                # Pytest Test Suite
│   └── requirements.txt      # Python dependencies
│
├── docs/                     # Architecture & API documentation
├── .env.example              # Root environment template
├── ARCHITECTURE.md           # System architecture specification
├── API.md                    # REST API endpoints & schemas
├── DATABASE.md               # 19-table database schema & ER diagram
├── AI_ARCHITECTURE.md        # Gemini integration & security model
├── MOBILE_SETUP.md           # Mobile build and setup guide
└── SETUP.md                  # Development environment setup guide
```

---

## 🚀 Quick Start Guide

### 1. Backend Installation & Setup

```bash
cd backend

# 1. Create and activate virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 2. Configure environment
copy .env.example .env    # Windows
# cp .env.example .env    # Linux/macOS

# 3. Start the FastAPI Server
python -m uvicorn app.main:app --reload --port 8000
```

* **Interactive API Docs**: `http://127.0.0.1:8000/api/docs`
* **Health Check**: `http://127.0.0.1:8000/api/health`

### 2. Mobile App Setup (Flutter + Dart)

```bash
cd mobile

# 1. Fetch dependencies
flutter pub get

# 2. Run static analysis
flutter analyze

# 3. Run Flutter unit and widget tests
flutter test

# 4. Launch on Android Emulator, iOS Simulator, or connected device
flutter run
```

---

## ⚙️ Environment Variables

Configure backend secrets in `backend/.env`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key. If omitted, athletic heuristics are used. |
| `DATABASE_URL` | No | `sqlite:///./gym_bruhh.db` | Database connection string. |
| `JWT_SECRET` | Yes | `...` | Secret key for signing JWT tokens. |
| `JWT_ALGORITHM` | No | `HS256` | Token hashing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `10080` | Token validity in minutes (7 days). |
| `CORS_ORIGINS` | No | `*` | Allowed CORS origins. |

> [!NOTE]
> The `GEMINI_API_KEY` is **never** embedded in the mobile client. All AI calls route securely through the FastAPI backend.

---

## 📦 Mobile Build Commands

### Android Builds
```bash
cd mobile

# Debug / Release APK
flutter build apk --release
# Output: mobile/build/app/outputs/flutter-apk/app-release.apk

# Google Play App Bundle (AAB)
flutter build appbundle --release
# Output: mobile/build/app/outputs/bundle/release/app-release.aab
```

### iOS Builds
```bash
cd mobile
flutter build ipa --release
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
pytest
```

### Run Flutter Mobile Tests
```bash
cd mobile
flutter test
```
