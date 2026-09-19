# GYMBruhh Mobile Setup Guide (React Native & Expo Go)

This guide walks you through setting up and running the native **GYMBruhh** mobile application on iOS, Android, and Web using the **Expo Go** framework.

---

## 🛠️ Prerequisites

1. **Node.js**:
   - Version: `>= 18.0.0`
   - Verify: `node -v`

2. **Expo Go App (for testing on physical phones)**:
   - **Android**: Install [Expo Go from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iOS**: Install [Expo Go from Apple App Store](https://apps.apple.com/app/expo-go/id982107779)

---

## 📱 Running the App Locally

### Step 1: Start the FastAPI Backend
Ensure your FastAPI backend server is running:

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### Step 2: Configure API Endpoint for Expo Go
- **Android Emulator**: Uses `http://10.0.2.2:8000/api` automatically.
- **iOS Simulator / Desktop Web**: Uses `http://127.0.0.1:8000/api` automatically.
- **Physical Phone with Expo Go**:
  1. Make sure your phone and computer are on the same Wi-Fi network.
  2. In the GYMBruhh mobile app, navigate to **Profile & Settings** (top-right avatar on Home).
  3. Under **Backend API Configuration (Expo Go)**, enter your computer's LAN IP:
     `http://192.168.1.XX:8000/api`
  4. Tap **Save API URL**.

---

### Step 3: Launch Expo Mobile App

```bash
cd mobile

# Install dependencies (if not already done)
npm install

# Start the Expo development server
npm start
```

Once the terminal displays the QR code:
- **Android**: Open the **Expo Go** app and scan the terminal QR code.
- **iOS**: Open the native Camera app, scan the QR code, and open with Expo Go.
- **Web**: Press `w` in the terminal to launch the app directly in your browser.
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal (macOS only).

---

## ⚡ Demo User Credentials
You can log in immediately using the pre-seeded demo user:
- **Email**: `demo@gymbruhh.com`
- **Password**: `FitAI@2026`

Or click the **"One-Tap Demo Login"** button on the Login screen!
