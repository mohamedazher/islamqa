# Fastlane Beta Deployment Guide

This guide explains how to deploy the IslamQA app to Google Play Open Testing (Beta) and TestFlight using Fastlane.

## Overview

The project uses Fastlane for automated deployment to app stores:
- **Android**: Google Play Open Testing track
- **iOS**: TestFlight

## Prerequisites

### Android Requirements

1. **Google Play Console Setup**
   - App must be registered in Google Play Console
   - Service account with deployment permissions
   - Service account JSON key file

2. **GitHub Secrets** (required for CI/CD)
   - `ANDROID_KEYSTORE_BASE64` - Your Android keystore file (base64 encoded)
   - `ANDROID_KEYSTORE_PASSWORD` - Keystore password
   - `ANDROID_KEY_ALIAS` - Key alias from keystore
   - `ANDROID_KEY_PASSWORD` - Key password
   - `PLAY_STORE_JSON_KEY_DATA` - Google Play service account JSON key
   - `GOOGLE_SERVICES_JSON_BASE64` - Firebase google-services.json (base64 encoded)

### iOS Requirements

1. **App Store Connect Setup**
   - App must be registered in App Store Connect
   - App Store Connect API key

2. **GitHub Secrets** (required for CI/CD)
   - `APPLE_ID` - Your Apple ID email
   - `IOS_CERTIFICATE_BASE64` - Distribution certificate (base64 encoded)
   - `IOS_CERTIFICATE_PASSWORD` - Certificate password
   - `IOS_PROVISIONING_PROFILE_BASE64` - Provisioning profile (base64 encoded)
   - `APP_STORE_CONNECT_API_KEY_CONTENT` - API key (.p8 file content)
   - `APP_STORE_CONNECT_API_KEY_ID` - API key ID
   - `APP_STORE_CONNECT_API_ISSUER_ID` - API issuer ID
   - `KEYCHAIN_PASSWORD` - Temporary keychain password for CI
   - `ITC_TEAM_ID` - App Store Connect team ID
   - `TEAM_ID` - Developer portal team ID

---

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

The easiest way to deploy is through GitHub Actions using the workflow dispatch feature.

#### Android Beta Deployment

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **"Android Build & Deploy"** workflow
4. Click **"Run workflow"** button
5. Select branch: `claude/check-the-s-01SCEfuad8eNj8iSV4cGyjbo` (or your target branch)
6. Choose deployment target: **`beta`**
7. Click **"Run workflow"**

The workflow will:
- Install dependencies
- Run tests
- Build Vite app
- Build Android APK (release)
- Build Android App Bundle (AAB)
- Upload AAB to Google Play Open Testing track
- Automatically increment version number

#### iOS Beta Deployment

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **"iOS Fastlane CI/CD"** workflow
4. Click **"Run workflow"** button
5. Select branch and choose deployment target: **`beta`**
6. Click **"Run workflow"**

The workflow will:
- Install dependencies
- Build iOS release IPA
- Upload to TestFlight
- Automatically increment version number

### Method 2: Commit Message Tags

You can trigger deployments automatically by including tags in your commit messages:

```bash
# Deploy to Android beta
git commit -m "Add new feature [beta]"
git push

# Deploy to Android production
git commit -m "Release v2.0 [release]"
git push
```

**Supported tags:**
- `[beta]` - Deploy to Open Testing/TestFlight
- `[release]` or `[production]` - Deploy to Production/App Store

---

## Local Deployment (Advanced)

You can also deploy from your local machine if you have all credentials configured.

### Prerequisites

1. Install Ruby and Bundler:
   ```bash
   # Check Ruby version (3.2+ required)
   ruby --version

   # Install Bundler if not present
   gem install bundler
   ```

2. Install Fastlane dependencies:
   ```bash
   bundle install
   ```

3. Install Cordova:
   ```bash
   npm install -g cordova
   ```

### Android Local Deployment

1. **Set up environment variables:**
   ```bash
   export PLAY_STORE_JSON_KEY=/path/to/google-play-api-key.json
   ```

2. **Place your keystore file:**
   ```bash
   cp /path/to/your/keystore.jks ./uploadkey.jks
   ```

3. **Create build.json:**
   ```json
   {
     "android": {
       "release": {
         "keystore": "uploadkey.jks",
         "storePassword": "YOUR_KEYSTORE_PASSWORD",
         "alias": "YOUR_KEY_ALIAS",
         "password": "YOUR_KEY_PASSWORD",
         "keystoreType": ""
       }
     }
   }
   ```

4. **Run the beta deployment:**
   ```bash
   # Build and deploy in one command
   ./bin/fastlane android release
   ./bin/fastlane android beta

   # Or deploy only (if AAB already exists)
   ./bin/fastlane android beta
   ```

### iOS Local Deployment

1. **Set up environment:**
   ```bash
   export APPLE_ID=your.apple.id@email.com
   export ITC_TEAM_ID=your_team_id
   export TEAM_ID=your_developer_team_id
   ```

2. **Run the beta deployment:**
   ```bash
   ./bin/fastlane ios beta
   ```

---

## Available Fastlane Lanes

### Android Lanes

| Lane | Description |
|------|-------------|
| `android build` | Build and test Android app (debug or release) |
| `android build_debug` | Build debug APK for testing |
| `android release` | Build release APK and AAB, increment version |
| `android beta` | Deploy to Google Play Open Testing track |
| `android production` | Deploy to Google Play Production |
| `android promote_to_production` | Promote beta build to production |

### iOS Lanes

| Lane | Description |
|------|-------------|
| `ios build` | Build and test iOS app |
| `ios build_debug` | Build debug version for simulator |
| `ios release` | Build release IPA for App Store |
| `ios beta` | Deploy to TestFlight |
| `ios production` | Deploy to App Store |

### Shared Lanes

| Lane | Description |
|------|-------------|
| `test` | Run all tests |
| `bump_version` | Increment version number (patch) |

---

## Troubleshooting

### Android Issues

#### "AAB file not found"
- **Cause**: The app hasn't been built yet
- **Solution**: Run `./bin/fastlane android release` first, then `./bin/fastlane android beta`

#### "Authentication failed"
- **Cause**: Invalid or missing Google Play API key
- **Solution**: Verify `PLAY_STORE_JSON_KEY` environment variable points to valid JSON key file

#### "Keystore error"
- **Cause**: Invalid keystore credentials in build.json
- **Solution**: Verify keystore file exists and credentials are correct

### iOS Issues

#### "Code signing failed"
- **Cause**: Invalid or missing certificates/provisioning profiles
- **Solution**: Ensure certificates are properly installed in keychain (CI) or Xcode (local)

#### "App Store Connect authentication failed"
- **Cause**: Invalid API key or credentials
- **Solution**: Verify API key file exists and environment variables are set correctly

### General Issues

#### "Fastlane command not found"
- **Cause**: Fastlane not installed or not in PATH
- **Solution**: Run `bundle install` and use `bundle exec fastlane` or `./bin/fastlane`

#### "Build failed"
- **Cause**: Various - check error message
- **Solution**:
  1. Ensure all dependencies are installed: `yarn install`
  2. Run tests: `yarn test:all`
  3. Build web app: `yarn build`
  4. Check Cordova setup: `cordova requirements`

---

## Version Management

Fastlane automatically increments the version number when deploying to beta or production:

- **Android**: `android-versionCode` in `config.xml`
- **iOS**: Build number in `config.xml`

The version is incremented using `yarn version:patch` script.

---

## Security Best Practices

1. **Never commit sensitive files:**
   - `*.jks` (keystore files)
   - `*.p12` (certificates)
   - `*.mobileprovision` (provisioning profiles)
   - `google-play-api-key.json`
   - `build.json`
   - `.env` files with secrets

2. **Use GitHub Secrets** for CI/CD credentials

3. **Rotate API keys** regularly

4. **Limit permissions** on service accounts to deployment only

---

## Monitoring Deployments

### GitHub Actions

1. Go to **Actions** tab in your repository
2. Select the workflow run
3. View logs for each step
4. Check for errors or warnings

### Google Play Console

1. Navigate to your app in Google Play Console
2. Go to **Testing > Open testing**
3. View release status and rollout progress
4. Check for any errors or rejections

### App Store Connect

1. Navigate to your app in App Store Connect
2. Go to **TestFlight** tab
3. View build processing status
4. Check for any compliance issues

---

## Next Steps

After successful beta deployment:

1. **Test the beta build** on real devices
2. **Gather feedback** from beta testers
3. **Fix any issues** and deploy again to beta
4. When ready, **promote to production**:
   - Android: Use `android promote_to_production` lane or manual promotion in Play Console
   - iOS: Manually submit for review in App Store Connect

---

## Support

For issues or questions:
- Check GitHub Actions logs for error details
- Review Fastlane documentation: https://docs.fastlane.tools
- Check project issues: https://github.com/mohamedazher/islamqa/issues
