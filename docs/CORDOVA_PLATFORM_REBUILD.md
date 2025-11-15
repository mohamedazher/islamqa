# Cordova Platform Rebuild Guide

This guide explains how to properly rebuild Cordova platforms (Android/iOS) and avoid common issues.

## The Problem

When you remove and re-add a Cordova platform with:

```bash
cordova platform remove android
cordova platform add android
```

Several issues can occur:

1. **Java Version Reset**: Cordova uses the default system Java, not Java 17
2. **Missing Firebase Config**: The `google-services.json` file gets deleted
3. **Plugin Re-installation**: All plugins are reinstalled from source

## Why This Happens

### 1. Java Version Issue

Your system has multiple Java versions installed:
- Java 8 (default): `/Library/Java/JavaVirtualMachines/openjdk-8.jdk/`
- Java 17 (required): `/opt/homebrew/opt/openjdk@17/`

When you run `cordova build android`, it uses the default `$JAVA_HOME`, which points to Java 8.

**Error you'll see:**
```
Dependency requires at least JVM runtime version 11. This build uses a Java 8 JVM.
```

### 2. Firebase Config File

The Firebase Analytics plugin requires `google-services.json` in `platforms/android/app/`.

When you remove the Android platform, this file is deleted.

**Error you'll see:**
```
File google-services.json is missing. The Google Services Plugin cannot function without it.
```

### 3. Plugin Re-installation

When you add a platform, Cordova reinstalls all plugins from their source directories:
- `node_modules/cordova-plugin-*` (for npm plugins)
- `cordova-plugin-prayer-widget/` (for local plugins)

If you've manually fixed files in `platforms/android/`, those fixes are lost.

## Solutions

### Option 1: Use the Automated Script (Recommended)

Run the rebuild script:

```bash
yarn cordova:rebuild:android
```

Or directly:

```bash
./scripts/rebuild-android-platform.sh
```

This script automatically:
1. Sets Java 17
2. Removes old platform
3. Adds fresh platform
4. Copies Firebase config
5. Runs `cordova prepare`
6. Tests the build

### Option 2: Manual Steps

If you need to do it manually:

```bash
# 1. Set Java 17
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

# 2. Verify Java version
java -version  # Should show "17.0.15"

# 3. Remove platform (if needed)
cordova platform remove android

# 4. Add platform
cordova platform add android@14.0.1

# 5. Copy Firebase config
cp google-services.json platforms/android/app/

# 6. Prepare platform
cordova prepare android

# 7. Build
cordova build android --debug
```

### Option 3: Use Package.json Scripts

All Cordova scripts in `package.json` now automatically set Java 17:

```bash
# These all use Java 17 automatically:
yarn cordova:build:android
yarn cordova:run:android
yarn cordova:emulate:android
```

## How to Avoid Issues in the Future

### 1. Never Remove Platforms Unless Absolutely Necessary

Instead of removing the platform, try:

```bash
# Clean build (safer)
cordova clean android

# Or rebuild without removing
cordova build android --clean
```

### 2. Always Use the Package.json Scripts

Don't run `cordova` commands directly. Use the yarn scripts:

```bash
# ✅ GOOD
yarn cordova:build:android

# ❌ BAD (uses wrong Java version)
cordova build android
```

### 3. Set JAVA_HOME Permanently (Optional)

Add to your `~/.zshrc` or `~/.bash_profile`:

```bash
# Java 17 for Cordova builds
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"
```

Then reload:
```bash
source ~/.zshrc
```

**Note:** This makes Java 17 your system default, which may affect other projects.

### 4. Keep Firebase Config in Project Root

Always keep `google-services.json` in the project root. The build scripts will copy it when needed.

## When You MUST Remove the Platform

Sometimes you need to remove the platform:
- Upgrading Cordova Android version
- Fixing corrupted platform files
- Resolving plugin conflicts
- Following plugin installation instructions

In these cases, always use the automated script:

```bash
yarn cordova:rebuild:android
```

## Common Errors and Fixes

### Error: "Java 8 JVM"

**Fix:**
```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
cordova build android
```

### Error: "google-services.json is missing"

**Fix:**
```bash
cp google-services.json platforms/android/app/
cordova build android
```

### Error: "exception JSONException is never thrown"

This is a plugin source code issue. If you've fixed it before and it comes back after rebuilding:

**Fix:**
The rebuild script should handle this, but if not, the issue is in the plugin source files at:
- `cordova-plugin-prayer-widget/src/android/PrayerWidget.java`
- `cordova-plugin-prayer-widget/src/android/PrayerTimeWidgetProvider.java`

The code should already be fixed in these files. If you still see the error, the plugin may have been modified.

## Verification

After rebuilding, verify everything works:

1. **Check APK exists:**
   ```bash
   ls -lh platforms/android/app/build/outputs/apk/debug/app-debug.apk
   ```
   Should be ~34MB

2. **Check Java version used:**
   ```bash
   echo $JAVA_HOME
   ```
   Should show `/opt/homebrew/opt/openjdk@17`

3. **Check Firebase config:**
   ```bash
   ls -lh platforms/android/app/google-services.json
   ```
   Should exist (~682 bytes)

4. **Test build:**
   ```bash
   yarn cordova:build:android
   ```
   Should complete without errors

## Summary

**The Golden Rule:** Use `yarn cordova:rebuild:android` instead of manually removing/adding platforms.

This ensures:
- ✅ Java 17 is used
- ✅ Firebase config is copied
- ✅ All plugins are properly installed
- ✅ Build completes successfully

---

**Last Updated:** November 16, 2025
**Cordova Android Version:** 14.0.1
**Required Java Version:** 17.0.15
