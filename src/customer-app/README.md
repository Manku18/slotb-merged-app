# SlotB Premium Mobile App

Professional Expo React Native project setup for Android development and production.

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Locally**
   ```bash
   npx expo start
   ```

## 📦 Building for Android

This project is pre-configured with **EAS (Expo Application Services)** for cloud builds.

### 1. Build APK (for Testing)
To get an installable APK file for your phone:
```bash
npx eas build -p android --profile preview
```
*After the build finishes, you will get a link to download the APK.*

### 2. Build AAB (for Play Store)
To get the production bundle for Google Play Store:
```bash
npx eas build -p android --profile production
```
*This will generate a `.aab` file.*

## 🛠 Project Structure

- `/src/components`: Reusable UI components
- `/src/screens`: App screens/pages
- `/src/constants`: Theme colors, Layout constants
- `/src/hooks`: Custom React hooks
- `/src/navigation`: Navigation configuration

## 🔧 Setup Details
- **Package Name**: `com.kumar.slotbapp` (Update in `app.json` if needed)
- **Theme**: Premium Dark Mode with Indigo/Emerald accents.
- **Icons**: Lucide React Native included.
