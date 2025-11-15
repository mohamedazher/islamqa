#!/bin/bash

# Prayer Widget Build Validation Script
# Validates that all requirements are met before building with the widget plugin

set -e

echo "================================================"
echo "  Prayer Widget Build Validation"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        success "Node.js version: $(node --version)"
    else
        error "Node.js version too old: $(node --version). Need 18.x or higher"
    fi
else
    error "Node.js not found"
fi

# Check Cordova
echo "Checking Cordova..."
if command -v cordova &> /dev/null; then
    success "Cordova installed: $(cordova --version)"
else
    warning "Cordova not found globally. Using npx or project-local version may work."
fi

# Check if plugin exists
echo ""
echo "Checking plugin files..."
if [ -d "cordova-plugin-prayer-widget" ]; then
    success "Plugin directory exists"

    # Check plugin.xml
    if [ -f "cordova-plugin-prayer-widget/plugin.xml" ]; then
        success "plugin.xml found"
    else
        error "plugin.xml not found"
    fi

    # Check JavaScript interface
    if [ -f "cordova-plugin-prayer-widget/www/PrayerWidget.js" ]; then
        success "JavaScript interface found"
    else
        error "PrayerWidget.js not found"
    fi

    # Check Android files
    if [ -f "cordova-plugin-prayer-widget/src/android/PrayerWidget.java" ]; then
        success "Android plugin class found"
    else
        error "Android PrayerWidget.java not found"
    fi

    if [ -f "cordova-plugin-prayer-widget/src/android/PrayerTimeWidgetProvider.java" ]; then
        success "Android widget provider found"
    else
        error "Android PrayerTimeWidgetProvider.java not found"
    fi

    # Check Android resources
    if [ -f "cordova-plugin-prayer-widget/src/android/res/layout/widget_prayer_time.xml" ]; then
        success "Android widget layout found"
    else
        error "Android widget layout not found"
    fi

    # Check iOS files
    if [ -f "cordova-plugin-prayer-widget/src/ios/PrayerWidget.swift" ]; then
        success "iOS plugin class found"
    else
        error "iOS PrayerWidget.swift not found"
    fi

    if [ -f "cordova-plugin-prayer-widget/src/ios/PrayerTimeWidget.swift" ]; then
        success "iOS widget implementation found"
    else
        error "iOS PrayerTimeWidget.swift not found"
    fi
else
    error "Plugin directory not found: cordova-plugin-prayer-widget"
fi

# Check if plugin is installed
echo ""
echo "Checking plugin installation..."
if [ -f "package.json" ]; then
    if cordova plugin ls 2>/dev/null | grep -q "cordova-plugin-prayer-widget"; then
        success "Plugin is installed in project"
    else
        warning "Plugin not installed. Run: cordova plugin add ./cordova-plugin-prayer-widget"
    fi
else
    warning "package.json not found in current directory"
fi

# Check platforms
echo ""
echo "Checking Cordova platforms..."
if [ -d "platforms" ]; then
    if [ -d "platforms/android" ]; then
        success "Android platform installed"

        # Check if widget files are in Android platform
        if [ -f "platforms/android/app/src/main/res/layout/widget_prayer_time.xml" ]; then
            success "Widget resources copied to Android platform"
        else
            warning "Widget resources not found in Android platform. Run: cordova prepare android"
        fi
    else
        warning "Android platform not installed. Run: cordova platform add android"
    fi

    if [ -d "platforms/ios" ]; then
        success "iOS platform installed"
    else
        warning "iOS platform not installed. Run: cordova platform add ios"
    fi
else
    warning "No platforms directory found. Run: cordova platform add android ios"
fi

# Check config.xml
echo ""
echo "Checking config.xml..."
if [ -f "config.xml" ]; then
    success "config.xml found"

    # Check if location permissions are configured
    if grep -q "ACCESS_FINE_LOCATION" config.xml; then
        success "Location permissions configured"
    else
        warning "Location permissions not found in config.xml"
    fi

    # Check target SDK version
    if grep -q "android-targetSdkVersion" config.xml; then
        TARGET_SDK=$(grep "android-targetSdkVersion" config.xml | sed 's/.*value="\([0-9]*\)".*/\1/')
        if [ "$TARGET_SDK" -ge 33 ]; then
            success "Target SDK version: $TARGET_SDK (OK for widgets)"
        else
            warning "Target SDK version: $TARGET_SDK (recommend 33+)"
        fi
    fi
else
    error "config.xml not found"
fi

# Check prayer times service integration
echo ""
echo "Checking prayer times service integration..."
if [ -f "src/services/prayerTimesService.js" ]; then
    if grep -q "updateWidget" src/services/prayerTimesService.js; then
        success "updateWidget() method found in prayerTimesService"
    else
        error "updateWidget() method not found. Widget updates won't work!"
    fi
else
    warning "prayerTimesService.js not found"
fi

# Check view components
echo ""
echo "Checking view integration..."
FILES_TO_CHECK=(
    "src/components/home/PrayerTimesCard.vue"
    "src/views/PrayerTimesView.vue"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "updateWidget" "$file"; then
            success "Widget updates integrated in $file"
        else
            warning "Widget updates not found in $file"
        fi
    else
        warning "$file not found"
    fi
done

# Platform-specific checks
echo ""
echo "Platform-specific requirements..."

# Android
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java --version 2>&1 | head -n 1 | cut -d' ' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -ge 17 ]; then
        success "Java version: $(java --version 2>&1 | head -n 1)"
    else
        warning "Java version: $(java --version 2>&1 | head -n 1). Recommend JDK 17+"
    fi
else
    warning "Java not found. Required for Android builds."
fi

# iOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcodebuild &> /dev/null; then
        success "Xcode installed: $(xcodebuild -version | head -n 1)"
    else
        warning "Xcode not found. Required for iOS builds."
    fi

    if command -v pod &> /dev/null; then
        success "CocoaPods installed: $(pod --version)"
    else
        warning "CocoaPods not found. May be required for iOS dependencies."
    fi
else
    warning "Not running on macOS. iOS builds not possible on this system."
fi

# Summary
echo ""
echo "================================================"
echo "  Validation Summary"
echo "================================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready to build.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found. Build may succeed but check warnings.${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found. Please fix errors before building.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) also found.${NC}"
    fi
    exit 1
fi
