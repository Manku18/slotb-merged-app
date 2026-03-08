---
description: How to build production APK for SlotB Partner App
---

# 📱 Building Production APK for SlotB Partner App

Your app is now configured and ready to build! Here are three methods to generate a production-ready APK:

---

## ✅ **Method 1: EAS Build (Cloud) - RECOMMENDED**

This is the easiest and most reliable method. It builds your APK in the cloud.

### Prerequisites:
- Free Expo account (sign up at https://expo.dev)

### Steps:

// turbo-all
1. **Login to Expo**
   ```powershell
   npx eas-cli@latest login
   ```

2. **Configure the project** (if prompted)
   ```powershell
   npx eas-cli@latest build:configure
   ```

3. **Build the APK**
   ```powershell
   npx eas-cli@latest build --platform android --profile production
   ```

4. **Wait for build** (takes 10-20 minutes)
   - You'll get a link to track progress
   - Once complete, download the APK from the provided URL

5. **Download your APK**
   - The APK will be available in your Expo dashboard
   - Or download directly from the terminal link

### APK Location:
- Downloaded from Expo dashboard at: https://expo.dev/accounts/[your-account]/projects/slotb-partner-demo/builds

---

## 🔧 **Method 2: Local Build with Android Studio**

If you prefer building locally without Expo account:

### Prerequisites:
- Java JDK 17 installed
- Android Studio installed
- Android SDK configured

### Steps:

1. **Generate keystore** (for signing the APK)
   ```powershell
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore slotb-partner.keystore -alias slotb-partner-key -keyalg RSA -keysize 2048 -validity 10000
   ```
   
   When prompted, enter:
   - Password: (choose a strong password, remember it!)
   - Name, Organization, etc.: SlotB / SlotB Inc / etc.

2. **Configure gradle for signing**
   
   Create `android/gradle.properties` and add:
   ```
   MYAPP_UPLOAD_STORE_FILE=slotb-partner.keystore
   MYAPP_UPLOAD_KEY_ALIAS=slotb-partner-key
   MYAPP_UPLOAD_STORE_PASSWORD=your_password_here
   MYAPP_UPLOAD_KEY_PASSWORD=your_password_here
   ```

3. **Update build.gradle**
   
   Edit `android/app/build.gradle` and add signing config:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                   storeFile file(MYAPP_UPLOAD_STORE_FILE)
                   storePassword MYAPP_UPLOAD_STORE_PASSWORD
                   keyAlias MYAPP_UPLOAD_KEY_ALIAS
                   keyPassword MYAPP_UPLOAD_KEY_PASSWORD
               }
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               ...
           }
       }
   }
   ```

4. **Build the APK**
   ```powershell
   cd android
   .\gradlew assembleRelease
   ```

5. **Find your APK**
   - Location: `android/app/build/outputs/apk/release/app-release.apk`

### APK Size Optimization:
The built APK will already be optimized with ProGuard and will be approximately **50-80 MB** in size.

---

## 🚀 **Method 3: Quick Test Build (Debug APK)**

For quick testing (not for Play Store):

### Steps:

1. **Build debug APK**
   ```powershell
   cd android
   .\gradlew assembleDebug
   ```

2. **Find APK**
   - Location: `android/app/build/outputs/apk/debug/app-debug.apk`

⚠️ **Note**: Debug APKs are larger and not optimized for production.

---

## 📦 **After Building**

### Before Distribution:

1. **Test the APK**
   - Install on a physical Android device
   - Test all features:
     - Login/Registration
     - Dashboard metrics
     - Booking management
     - Notifications
     - Token system
     - Profile settings
     - Location permissions

2. **Verify App Size**
   - Should be under 100 MB
   - Current estimated size: ~60-80 MB

3. **Check Permissions**
   - Location access working
   - Internet connectivity
   - Image picker working

### For Play Store Release:

1. **App Bundle** (recommended for Play Store):
   ```powershell
   npx eas-cli@latest build --platform android --profile production
   ```
   *Or locally:*
   ```powershell
   cd android
   .\gradlew bundleRelease
   ```

2. **Prepare Store Listing**:
   - App name: SlotB Partner
   - Package name: com.slotb.partner
   - Version: 1.0.0
   - Screenshots (capture from app)
   - App description
   - Privacy policy URL

3. **Upload to Play Console**:
   - Go to https://play.google.com/console
   - Create new app
   - Upload AAB or APK
   - Fill in store listing
   - Submit for review

---

## 🎯 **Current Configuration**

- **App Name**: SlotB-Partner-demo
- **Package Name**: com.slotb.partner
- **Version**: 1.0.0 (Version Code: 1)
- **API Base URL**: https://slotb.in/
- **Target Android**: Android 13+ (API 33)
- **Permissions**: Location, Internet, Network State

---

## 🐛 **Troubleshooting**

### "Gradle build failed"
- Ensure Java JDK 17 is installed
- Run: `java -version` to verify
- Clear gradle cache: `cd android && .\gradlew clean`

### "Keystore not found"
- Generate keystore first (see Method 2, step 1)
- Ensure path in gradle.properties is correct

### "APK too large"
- Enable ProGuard (already configured)
- Remove unused resources
- Use App Bundle instead of APK

### "App crashes on install"
- Check Android version (minimum 5.0)
- Verify permissions in AndroidManifest.xml
- Test on different devices

---

## 📊 **File Structure After Build**

```
android/
├── app/
│   ├── build/
│   │   └── outputs/
│   │       ├── apk/
│   │       │   ├── debug/
│   │       │   │   └── app-debug.apk
│   │       │   └── release/
│   │       │       └── app-release.apk
│   │       └── bundle/
│   │           └── release/
│   │               └── app-release.aab
│   └── slotb-partner.keystore  (your signing key - KEEP SAFE!)
```

---

## 🔐 **Important Security Notes**

1. **NEVER commit keystore files to git**
2. **NEVER share your keystore password**
3. **Backup your keystore** - you need it for all future updates
4. **Store keystore securely** - losing it means you can't update your app

---

## ✨ **What's Next?**

After building your APK:

1. ✅ Test thoroughly on multiple devices
2. ✅ Gather beta tester feedback
3. ✅ Prepare Play Store assets (screenshots, description)
4. ✅ Submit to Play Store for review
5. ✅ Monitor crash reports and user feedback

---

**Need help?** Refer to:
- Expo docs: https://docs.expo.dev/build/setup/
- Android docs: https://developer.android.com/studio/build
