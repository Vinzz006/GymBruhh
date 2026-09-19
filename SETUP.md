# SETUP & INSTALLATION GUIDE — GYMBruhh

## Prerequisites
- Python 3.10+
- Flutter 3.0+ & Dart 3.0+
- Android Studio / Android SDK (for Android APK & Emulator)
- Xcode (for iOS Simulator / iPhone on macOS)

---

## 1. Backend Setup

```bash
cd backend

# 1. Create and activate a virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 2. Configure environment
# Copy .env.example to .env and optionally set your GEMINI_API_KEY
copy .env.example .env    # Windows
# cp .env.example .env    # Linux/macOS

# 3. Start the FastAPI Server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at:
`http://127.0.0.1:8000/api/docs`

---

## 2. Mobile App Setup (Flutter + Dart)

```bash
cd mobile

# 1. Install dependencies
flutter pub get

# 2. Analyze code
flutter analyze

# 3. Run unit tests
flutter test

# 4. Run the application
# For Android Emulator or Connected Device:
flutter run

# For Release APK:
flutter build apk --release

# For Android App Bundle (Play Store):
flutter build appbundle --release
```
