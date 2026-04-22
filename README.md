# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

//////////////// START OF OUR README ////////////////

===== SOFT NEUROKIT APP - STARTUP GUIDE =====

Follow these steps every time you want to run the app.

STEP 1 — Open Android Emulator

1. Open Android Studio
2. Click "More Actions"
3. Click "Virtual Device Manager"
4. Click the Play button on your Pixel device
5. Wait until the phone fully boots

STEP 2 — Open Command Prompt

Open Command Prompt (not PowerShell)

STEP 3 — Navigate to Project Folder

Type:

cd C:\SoftNeuroKit\soft-neurokit-app

STEP 4 — Start Expo Server

Type:

npx expo start

Wait until it loads and shows options (QR code, etc.)

STEP 5 — Run App on Emulator

Make sure emulator is already open.

Then press:

a

inside the terminal

STEP 6 — Use the App

- App should open on emulator
- Edit code in VS Code
- Save file → app auto reloads

STEP 7 — If App Freezes or Bugs

Press:

r

to reload app

or

Ctrl + C

then restart with:

npx expo start

===== DONE =====

=============================================================================================================================

# 📱 Running the App on Android (Development & Demo Guide)

This guide explains how to:

1. Run the app while connected to your computer (development mode)
2. Install and run the app standalone on your phone (demo mode)

---

# 🔹 SECTION 1 — Run App While Plugged In (Development Mode)

Use this when:

- You are actively coding
- You want live updates
- You are testing BLE features

---

## Step 1 — Connect Phone

- Plug your Android phone into your PC
- Make sure **USB Debugging is enabled**
- Allow the prompt: _"Allow USB debugging"_

---

## Step 2 — Start the App

Open Command Prompt and run:

cd C:\SoftNeuroKit\soft-neurokit-app
npx expo run:android

---

## What Happens

- App installs onto your phone
- App launches automatically
- Connected to your computer for live updates

---

## Notes

- You must keep your phone plugged in
- Code changes require re-running or reloading
- This is required for **Bluetooth (BLE) testing**

---

# 🔹 SECTION 2 — Run App Without Computer (Standalone Demo Mode)

Use this when:

- Showing the app to a sponsor
- You want the app to run independently
- No cables or PC connection available

---

## Step 1 — Build Standalone APK

cd C:\SoftNeuroKit\soft-neurokit-app\android
gradlew assembleRelease

---

## Step 2 — Locate APK

Go to:

C:\SoftNeuroKit\soft-neurokit-app\android\app\build\outputs\apk\release\

File:
app-release.apk

---

## Step 3 — Install APK on Phone

Go to platform-tools:

cd C:\Users\harsh\AppData\Local\Android\Sdk\platform-tools

Then install:

adb install -r C:\SoftNeuroKit\soft-neurokit-app\android\app\build\outputs\apk\release\app-release.apk

---

## Step 4 — Run the App

- Unplug your phone
- Open the app from your app drawer

---

## What Happens

- App runs completely independently
- No computer needed
- No USB required
- Perfect for demos

---

## Notes

- This version does NOT support live coding updates
- You must rebuild APK after code changes
- Recommended for presentations only

---

# 🔁 Updating the App (Standalone Mode)

Whenever you make changes:

1. Rebuild:
   gradlew assembleRelease

2. Reinstall:
   adb install -r (same APK path)

---

# ⚠️ Important Differences

| Feature        | Plugged In  | Standalone |
| -------------- | ----------- | ---------- |
| Live Reload    | ✅ Yes      | ❌ No      |
| BLE Testing    | ✅ Yes      | ⚠️ Limited |
| Needs Computer | ✅ Yes      | ❌ No      |
| Best Use       | Development | Demo       |

---

# ✅ Recommended Workflow

Development:
→ Use plugged-in mode

Demo:
→ Use standalone APK

---

# 🚀 Summary

- Use **plugged-in mode** for coding and Bluetooth testing
- Use **standalone APK** for presentations and demos
- Always rebuild APK after making changes

---
