# GYMBruhh Mobile Application (Flutter & Dart)

A true native mobile application built with **Flutter & Dart**, targeting **Android** and **iOS**.

---

## 📱 Features

1. **Authentication & Security**:
   - Splash screen with automatic JWT token validation
   - Login, Registration, and Forgot Password
   - Secure token storage via `SharedPreferences`

2. **Deterministic Onboarding (7-Step Flow)**:
   - Personal stats (age, gender, height, current & target weight)
   - Fitness experience & primary athletic goal
   - Activity level & weekly training days
   - Equipment availability & preferred training split
   - Dietary preferences & allergies
   - Instant calculation of BMI, BMR, TDEE, Calorie target, and Macronutrient distribution

3. **Athletic Home Dashboard**:
   - Live macro progress ring (Calories, Protein, Carbs, Fat vs daily target)
   - Today's scheduled workout split card with 1-tap start
   - Dynamic workout streak & consistency metric
   - AI Coach Insight banner

4. **Periodized Workout Engine**:
   - Active split overview with day-by-day exercise lineups
   - Comprehensive exercise library with muscle category filter chips
   - AI Workout Generator modal for custom splits

5. **Live Workout Session & Rest Timer**:
   - Live session timer & set tracking (weight, reps, RPE, completed)
   - PR trophy celebrations
   - Configurable live rest timer (+30s, skip, pause)
   - Exercise replacement flow (AI recommendations & biomechanical alternatives)
   - Session summary sheet (volume, total sets, duration, PRs)

6. **Nutrition & Macro Tracking**:
   - Whole food search catalog and custom food logging
   - Categorized meal tracking (Breakfast, Lunch, Dinner, Snacks)
   - Water tracker (+250ml quick-log)
   - AI Recipe generator for remaining calories and macros
   - Vision meal photo macro estimation

7. **Progress Analytics & Charts**:
   - Weight trajectory, measurements (chest, waist, arms, thighs), and 1RM tracking
   - Native charts with `fl_chart`
   - AI Weekly Progress Review generator

8. **AI Trainer (Gemini API Backend)**:
   - Dedicated interactive AI fitness coach
   - Suggestion prompt pills
   - Progressive overload proposals with Accept/Dismiss actions

---

## 🚀 Running the Mobile App

### Prerequisites
- Flutter SDK (>= 3.0.0)
- Android Studio / Android SDK (for Android APK/Emulator)
- Xcode (for iOS Simulator/Device on macOS)

### Commands

```bash
# 1. Navigate to the mobile directory
cd mobile

# 2. Get dependencies
flutter pub get

# 3. Analyze code
flutter analyze

# 4. Run tests
flutter test

# 5. Run on connected device or emulator
flutter run
```

### Build Release Artifacts

```bash
# Android APK
flutter build apk --release

# Android App Bundle (AAB for Google Play)
flutter build appbundle --release

# iOS Bundle
flutter build ipa --release
```

---

## 🏗️ Project Structure

```text
mobile/
├── android/            # Native Android configuration & MainActivity
├── ios/                # Native iOS configuration, Info.plist & Podfile
├── lib/
│   ├── core/
│   │   ├── constants/  # API endpoints, Obsidian dark theme palette
│   │   └── services/   # ApiService (timeouts, headers, error handling), StorageService
│   ├── models/         # Strongly-typed data models (User, Profile, Workout, Nutrition, etc.)
│   ├── providers/      # Riverpod / Provider State Management
│   ├── screens/        # Auth, Onboarding, Main Tabs, Workout Sessions, Settings
│   ├── widgets/        # Reusable Athletic UI components (MacroRingCard, MetricCard, AppButton)
│   └── main.dart       # App entrypoint & MultiProvider setup
├── test/               # Unit, widget, and model tests
└── pubspec.yaml        # Flutter dependencies and assets
```
