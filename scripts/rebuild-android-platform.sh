#!/bin/bash

# Rebuild Android Platform Script
# Use this when you need to remove and re-add the Android platform
# This ensures all required files are properly restored

set -e  # Exit on error

echo "======================================"
echo "Rebuilding Android Platform"
echo "======================================"

# Step 1: Set Java 17 environment
echo ""
echo "[1/6] Setting Java 17..."
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"
java -version

# Step 2: Remove Android platform (if exists)
echo ""
echo "[2/6] Removing Android platform..."
cordova platform remove android 2>/dev/null || echo "Android platform not installed, skipping removal"

# Step 3: Add Android platform
echo ""
echo "[3/6] Adding Android platform..."
cordova platform add android@14.0.1

# Step 4: Copy Firebase config
echo ""
echo "[4/6] Copying google-services.json..."
if [ -f "google-services.json" ]; then
    cp google-services.json platforms/android/app/
    echo "✓ Firebase config copied"
else
    echo "⚠️  WARNING: google-services.json not found in project root!"
    echo "   Build may fail if Firebase Analytics plugin is installed"
fi

# Step 5: Run Cordova prepare
echo ""
echo "[5/6] Running cordova prepare..."
cordova prepare android

# Step 6: Test build
echo ""
echo "[6/6] Testing build..."
cordova build android --debug

echo ""
echo "======================================"
echo "✓ Android platform rebuilt successfully!"
echo "======================================"
echo ""
echo "APK location:"
echo "platforms/android/app/build/outputs/apk/debug/app-debug.apk"
