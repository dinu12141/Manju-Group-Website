# 📱 Manju Group — Official Android Mobile App & Google Play Store Guide

This project is now fully configured with **Capacitor Android Native Framework**. You can build native Android APKs, test on real devices, and generate signed Android App Bundles (`.aab`) for Google Play Store publishing.

---

## 🚀 1. Quick Commands

| Command | Description |
| :--- | :--- |
| `npm run cap:open` / `pnpm run cap:open` | Opens the native Android project in **Android Studio** |
| `npm run cap:build` / `pnpm run cap:build` | Re-builds web assets and syncs with the Android app |
| `npm run cap:sync` / `pnpm run cap:sync` | Syncs plugins and web assets to Android |

---

## 🛠️ 2. How to Test the App on Your Android Phone

1. **Open the project in Android Studio**:
   ```bash
   npm run cap:open
   ```
2. Enable **Developer Options** and **USB Debugging** on your Android phone:
   - Go to *Settings > About Phone > Tap 'Build Number' 7 times*.
   - In *Developer Options*, toggle on **USB Debugging**.
3. Connect your phone to your computer with a USB cable.
4. In Android Studio, select your phone from the device dropdown at the top toolbar.
5. Click the green **▶ Run** button. The app will install and open immediately on your phone!

---

## 📦 3. How to Generate a Test APK (To share via WhatsApp/Drive)

In Android Studio:
1. Click **Build** menu at the top.
2. Select **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Once completed, click the **locate** popup link.
4. Your installable `app-debug.apk` is located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`
5. You can send this `.apk` directly to any Android phone to install!

---

## 🏪 4. How to Generate Signed Release Bundle (`.aab`) for Google Play Store

1. In Android Studio, click **Build** > **Generate Signed Bundle / APK...**
2. Choose **Android App Bundle (.aab)** and click **Next**.
3. Create or choose a **Keystore (Signing Key)**:
   - Click **Create new...**
   - Choose a key path on your PC (e.g. `manju-release-key.jks`)
   - Enter a password and fill in your details (Organization: Manju Group).
   - *⚠️ IMPORTANT: Store this `.jks` file safely — you will need it for future app updates.*
4. Select **release** build variant and check **V1/V2** signing.
5. Click **Finish**.
6. Your production `.aab` file will be generated at:
   `android/app/release/app-release.aab`

---

## 📋 5. Google Play Store Console Submission Checklist

When uploading to the [Google Play Console](https://play.google.com/console):

1. **App Title**: `Manju Group — Official Store`
2. **Short Description**: `Shop electric bikes, 4K Smart TVs, inverter ACs, and RO water filters.`
3. **Full Description**: Comprehensive description detailing the 4 core brands, easy monthly installment plans, warranties, and island-wide delivery.
4. **App Assets**:
   - **App Icon**: `512 x 512 px` 32-bit PNG (with no transparency).
   - **Feature Graphic**: `1024 x 500 px` JPG or PNG banner.
   - **Phone Screenshots**: Minimum 4 high-res screenshots (taken from your phone or emulator).
5. **App Category**: `Shopping`
6. **Privacy Policy URL**: `https://manjugroup.lk/privacy`
7. **Contact Email**: `info@manjugroup.lk`

---

## ⚙️ 6. App Configuration Details

- **Package Name / App ID**: `lk.manjugroup.app`
- **App Name**: `Manju Group`
- **Brand Colors**: Royal Blue `#003875`
- **Native Plugins**:
  - `@capacitor/app` (Hardware back button & app lifecycle)
  - `@capacitor/status-bar` (Royal Blue status bar)
  - `@capacitor/splash-screen` (Manju Group branded splash screen)
  - `@capacitor/keyboard` (Smart keyboard layout resize)
