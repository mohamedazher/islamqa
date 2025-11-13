#!/bin/bash

# Helper script to prepare GitHub Secrets for CI/CD
# This script helps you convert your keystore and certificates to base64

set -e

echo "=========================================="
echo "  GitHub Secrets Preparation Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if base64 is available
if ! command -v base64 &> /dev/null; then
    print_error "base64 command not found. Please install it first."
    exit 1
fi

echo "This script will help you prepare the following secrets:"
echo "  1. ANDROID_KEYSTORE_BASE64"
echo "  2. IOS_CERTIFICATE_BASE64 (optional)"
echo "  3. IOS_PROVISIONING_PROFILE_BASE64 (optional)"
echo ""

# Android Keystore
echo "=========================================="
echo "  1. Android Keystore"
echo "=========================================="
echo ""

read -p "Enter the path to your Android keystore (uploadkey.jks): " KEYSTORE_PATH

if [ -z "$KEYSTORE_PATH" ]; then
    KEYSTORE_PATH="uploadkey.jks"
fi

if [ -f "$KEYSTORE_PATH" ]; then
    print_success "Found keystore: $KEYSTORE_PATH"

    # Convert to base64
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        KEYSTORE_BASE64=$(base64 -i "$KEYSTORE_PATH")
    else
        # Linux
        KEYSTORE_BASE64=$(base64 -w 0 "$KEYSTORE_PATH")
    fi

    echo ""
    print_success "ANDROID_KEYSTORE_BASE64 generated!"
    echo ""
    echo "Copy the value below and add it as a GitHub Secret:"
    echo "Secret Name: ANDROID_KEYSTORE_BASE64"
    echo "------- BEGIN BASE64 -------"
    echo "$KEYSTORE_BASE64"
    echo "-------- END BASE64 --------"
    echo ""

    # Save to file
    echo "$KEYSTORE_BASE64" > android-keystore-base64.txt
    print_success "Saved to: android-keystore-base64.txt"
    echo ""
else
    print_error "Keystore not found: $KEYSTORE_PATH"
    echo ""
fi

# Android Credentials
echo "=========================================="
echo "  2. Android Credentials"
echo "=========================================="
echo ""
echo "Add these as GitHub Secrets (from your build.json):"
echo ""
echo "Secret Name: ANDROID_KEYSTORE_PASSWORD"
echo "Secret Value: Imations_#@\$\$^@"
echo ""
echo "Secret Name: ANDROID_KEY_ALIAS"
echo "Secret Value: dawahdesk"
echo ""
echo "Secret Name: ANDROID_KEY_PASSWORD"
echo "Secret Value: Imations_#@\$\$^@"
echo ""

# iOS Certificate
echo "=========================================="
echo "  3. iOS Certificate (Optional)"
echo "=========================================="
echo ""

read -p "Do you have an iOS certificate (.p12 file)? (y/n): " HAS_IOS_CERT

if [[ "$HAS_IOS_CERT" == "y" || "$HAS_IOS_CERT" == "Y" ]]; then
    read -p "Enter the path to your iOS certificate (.p12): " CERT_PATH

    if [ -f "$CERT_PATH" ]; then
        print_success "Found certificate: $CERT_PATH"

        # Convert to base64
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            CERT_BASE64=$(base64 -i "$CERT_PATH")
        else
            # Linux
            CERT_BASE64=$(base64 -w 0 "$CERT_PATH")
        fi

        echo ""
        print_success "IOS_CERTIFICATE_BASE64 generated!"
        echo ""
        echo "Copy the value below and add it as a GitHub Secret:"
        echo "Secret Name: IOS_CERTIFICATE_BASE64"
        echo "------- BEGIN BASE64 -------"
        echo "$CERT_BASE64"
        echo "-------- END BASE64 --------"
        echo ""

        # Save to file
        echo "$CERT_BASE64" > ios-certificate-base64.txt
        print_success "Saved to: ios-certificate-base64.txt"
        echo ""

        read -p "Enter the password for this certificate: " CERT_PASSWORD
        echo ""
        echo "Secret Name: IOS_CERTIFICATE_PASSWORD"
        echo "Secret Value: $CERT_PASSWORD"
        echo ""
    else
        print_error "Certificate not found: $CERT_PATH"
        echo ""
    fi
else
    print_warning "Skipping iOS certificate"
    echo ""
fi

# iOS Provisioning Profile
echo "=========================================="
echo "  4. iOS Provisioning Profile (Optional)"
echo "=========================================="
echo ""

read -p "Do you have an iOS provisioning profile (.mobileprovision)? (y/n): " HAS_IOS_PROFILE

if [[ "$HAS_IOS_PROFILE" == "y" || "$HAS_IOS_PROFILE" == "Y" ]]; then
    read -p "Enter the path to your provisioning profile (.mobileprovision): " PROFILE_PATH

    if [ -f "$PROFILE_PATH" ]; then
        print_success "Found provisioning profile: $PROFILE_PATH"

        # Convert to base64
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            PROFILE_BASE64=$(base64 -i "$PROFILE_PATH")
        else
            # Linux
            PROFILE_BASE64=$(base64 -w 0 "$PROFILE_PATH")
        fi

        echo ""
        print_success "IOS_PROVISIONING_PROFILE_BASE64 generated!"
        echo ""
        echo "Copy the value below and add it as a GitHub Secret:"
        echo "Secret Name: IOS_PROVISIONING_PROFILE_BASE64"
        echo "------- BEGIN BASE64 -------"
        echo "$PROFILE_BASE64"
        echo "-------- END BASE64 --------"
        echo ""

        # Save to file
        echo "$PROFILE_BASE64" > ios-provisioning-profile-base64.txt
        print_success "Saved to: ios-provisioning-profile-base64.txt"
        echo ""
    else
        print_error "Provisioning profile not found: $PROFILE_PATH"
        echo ""
    fi
else
    print_warning "Skipping iOS provisioning profile"
    echo ""
fi

# Keychain Password for iOS
if [[ "$HAS_IOS_CERT" == "y" || "$HAS_IOS_CERT" == "Y" ]]; then
    echo "=========================================="
    echo "  5. iOS Keychain Password"
    echo "=========================================="
    echo ""
    echo "Generate a random keychain password for CI/CD:"
    KEYCHAIN_PASSWORD=$(openssl rand -base64 32)
    echo ""
    echo "Secret Name: KEYCHAIN_PASSWORD"
    echo "Secret Value: $KEYCHAIN_PASSWORD"
    echo ""
fi

# Summary
echo "=========================================="
echo "  Summary"
echo "=========================================="
echo ""
print_success "Setup complete!"
echo ""
echo "Generated files (DO NOT COMMIT THESE):"
if [ -f "android-keystore-base64.txt" ]; then
    echo "  - android-keystore-base64.txt"
fi
if [ -f "ios-certificate-base64.txt" ]; then
    echo "  - ios-certificate-base64.txt"
fi
if [ -f "ios-provisioning-profile-base64.txt" ]; then
    echo "  - ios-provisioning-profile-base64.txt"
fi
echo ""
echo "Next steps:"
echo "  1. Go to GitHub repository → Settings → Secrets → Actions"
echo "  2. Add each secret with the name and value shown above"
echo "  3. Run the GitHub Actions workflows"
echo ""
print_warning "Remember to delete the generated .txt files after adding secrets!"
echo ""
