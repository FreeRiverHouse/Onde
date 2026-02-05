# Skin Studio - App Store Submission Guide

## 🍎 iOS (App Store)

### Status: ✅ Project Ready

The iOS Xcode project has been created with Capacitor.

### Prerequisites
- [x] Xcode 16.4 installed
- [x] Capacitor iOS configured
- [x] Static build exported

### Required Before Submission

1. **Apple Developer Account** ($99/year)
   - Sign in at https://developer.apple.com
   - Enroll in Apple Developer Program

2. **App Store Connect Setup**
   - Create app in App Store Connect
   - Bundle ID: `com.onde.skinstudio`
   - App Name: "Skin Studio"

3. **App Icons** (required sizes)
   - 1024x1024 (App Store)
   - 180x180 (iPhone @3x)
   - 120x120 (iPhone @2x)
   - 167x167 (iPad Pro @2x)
   - 152x152 (iPad @2x)
   - 76x76 (iPad @1x)
   - Location: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

4. **Launch Screen**
   - Configure in Xcode or create a LaunchScreen.storyboard

5. **Screenshots** (required for each device)
   - iPhone 6.9" (iPhone 16 Pro Max): 1320 x 2868
   - iPhone 6.7" (iPhone 16 Plus): 1290 x 2796
   - iPhone 6.5" (iPhone 15 Pro Max): 1284 x 2778
   - iPad 12.9" (iPad Pro 6th gen): 2048 x 2732

6. **App Description**
   - Short description (30 chars)
   - Full description (4000 chars)
   - Keywords (100 chars)
   - Privacy Policy URL

### Build & Submit Commands

```bash
# Open in Xcode
cd /Users/mattia/Projects/Onde/apps/skin-creator
npx cap open ios

# In Xcode:
# 1. Select team/signing certificate
# 2. Product > Archive
# 3. Distribute App > App Store Connect
```

---

## 🤖 Android (Google Play)

### Status: ⚠️ SDK Not Installed

Android SDK needs to be installed before creating the Android project.

### Prerequisites Needed
- [ ] Android Studio or Android SDK Command-line Tools
- [ ] Java JDK 17+

### Install Android SDK (Homebrew)

```bash
# Install Android Studio (includes SDK)
brew install --cask android-studio

# OR install just command-line tools
brew install --cask android-commandlinetools

# After installation, set ANDROID_HOME:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### After Android SDK is Installed

```bash
cd /Users/mattia/Projects/Onde/apps/skin-creator
npx cap add android
npx cap sync android
npx cap open android
```

### Google Play Requirements
- Google Play Developer Account ($25 one-time)
- Bundle ID: `com.onde.skinstudio`
- Signed APK or AAB
- Screenshots (phone + tablet)
- Privacy Policy

---

## 📱 Quick Commands

```bash
# Rebuild web assets
npm run build:mobile

# Sync to native projects
npx cap sync

# Open iOS
npx cap open ios

# Open Android (after SDK installed)
npx cap open android
```

---

## 🎨 Creating App Icons

Use a 1024x1024 source image and generate all sizes:

```bash
# Using Capacitor assets plugin
npm install @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#1a1a2e' --splashBackgroundColor '#1a1a2e'
```

Or use online tools:
- https://appicon.co
- https://makeappicon.com

---

*Created: 2026-02-05*
*App ID: com.onde.skinstudio*
*Developer: Onde*
