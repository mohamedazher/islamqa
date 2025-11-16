# Local Deployment Guide

Quick guide for building and deploying iOS and Android apps locally using Fastlane.

## Prerequisites

**Both Platforms:**
- Node.js 18+
- Yarn package manager
- Cordova CLI: `npm install -g cordova`
- Fastlane: Installed via `bundle install` in project root

**Android:**
- OpenJDK 17
- Android SDK
- Gradle

**iOS (macOS only):**
- Xcode 15+
- CocoaPods
- Apple Developer Account

---

## Android Deployment

### Setup (One-time)

1. **Configure Environment Variables** (add to `~/.zshrc` or `~/.bashrc`):
   ```bash
   export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
   export PATH="$JAVA_HOME/bin:$PATH"
   ```

2. **Set Up Google Play API Key**:
   - Place your `google-play-api-key.json` in project root
   - Or set environment variable: `export PLAY_STORE_JSON_KEY="path/to/key.json"`

3. **Configure Keystore** (for signing):
   - Update `build.json` with your keystore details
   - Or set via environment variables

### Deploy to Google Play Beta

```bash
source ~/.zshrc
cd /path/to/islamqa
bundle exec fastlane android beta
```

This will:
- Install dependencies
- Run tests
- Build web app
- Increment version
- Build signed APK and AAB
- Upload to Google Play Open Testing track

### Available Android Lanes

```bash
fastlane android build          # Build debug APK
fastlane android release        # Build signed APK + AAB
fastlane android beta           # Deploy to Google Play Beta
fastlane android production     # Deploy to Google Play Production
```

---

## iOS Deployment

### Setup (One-time)

1. **Configure Environment Variables** (add to `~/.zshrc`):
   ```bash
   export FASTLANE_TEAM_ID="YOUR_TEAM_ID"
   export FASTLANE_ITC_TEAM_ID="YOUR_TEAM_ID"
   export FASTLANE_API_KEY_ID="YOUR_KEY_ID"
   export FASTLANE_API_ISSUER_ID="YOUR_ISSUER_ID"
   export FASTLANE_API_KEY_PATH="$HOME/.fastlane/api_key.p8"
   ```

2. **Get App Store Connect API Key**:
   - Go to: https://appstoreconnect.apple.com/access/api
   - Create new key with "App Manager" role
   - Download `.p8` file and save to `~/.fastlane/api_key.p8`
   - Note the Key ID and Issuer ID

3. **Find Your Team ID**:
   ```bash
   bundle exec fastlane run app_store_connect_api_key \
     key_id:"YOUR_KEY_ID" \
     issuer_id:"YOUR_ISSUER_ID" \
     key_filepath:"~/.fastlane/api_key.p8"
   ```

### Deploy to TestFlight

```bash
source ~/.zshrc
cd /path/to/islamqa
bundle exec fastlane ios beta
```

This will:
- Install dependencies
- Run tests
- Build web app
- Increment version
- Build and archive iOS app
- Export signed IPA
- Upload to TestFlight

### Available iOS Lanes

```bash
fastlane ios build             # Build debug app
fastlane ios build_release     # Build release IPA
fastlane ios beta              # Deploy to TestFlight
fastlane ios production        # Deploy to App Store
fastlane ios upload_ipa        # Upload existing IPA (utility)
```

---

## Troubleshooting

### Android Issues

**Gradle build fails:**
```bash
cd platforms/android
./gradlew clean
cd ../..
```

**Java version mismatch:**
```bash
java -version  # Should show OpenJDK 17
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
```

### iOS Issues

**Code signing errors:**
- Ensure Xcode is up to date
- Check that API key has correct permissions
- Verify Team ID is correct

**Keychain locked:**
- Unlock keychain before building
- Or run: `security unlock-keychain`

**Platform missing:**
```bash
rm -rf platforms/ios
cordova platform add ios --save
```

---

## Quick Reference

### Version Management

Versions are automatically incremented when running `beta` lanes. To manually bump:

```bash
yarn version:patch  # Increments patch version
```

### Check Build Status

After deployment, check:
- **Android**: https://play.google.com/console
- **iOS**: https://appstoreconnect.apple.com

### Environment Variables

All environment variables should be set in your shell profile (`~/.zshrc` or `~/.bashrc`). Run `source ~/.zshrc` after updating.

---

## CI/CD vs Local

- **GitHub Actions**: Configured in `.github/workflows/` - runs on push to master
- **Local Deployment**: Use this guide for manual releases from your Mac
- Both use the same Fastfile configuration

For CI/CD setup, see: `docs/CI-CD-SETUP-GUIDE.md`
