# Fastlane CI/CD Migration Guide

This document outlines the Fastlane setup for BetterIslam Q&A app and provides next steps for completing the migration.

## What's Been Set Up

### ✅ Completed

1. **Fastlane Installation**
   - Fastlane 2.228.0 installed via Bundler
   - `fastlane-plugin-cordova` installed for Cordova integration
   - Gems installed locally in `vendor/bundle`

2. **Fastlane Configuration**
   - `fastlane/Fastfile` - Build and deployment lanes for Android and iOS
   - `fastlane/Appfile` - App configuration
   - `fastlane/Pluginfile` - Plugin dependencies
   - `.env.fastlane.example` - Environment variables template

3. **GitHub Actions Workflows**
   - `.github/workflows/android-fastlane.yml` - Android CI/CD with Fastlane
   - `.github/workflows/ios-fastlane.yml` - iOS CI/CD with Fastlane
   - Support for build, beta, and production deployments

4. **Documentation**
   - `docs/GOOGLE-PLAY-API-SETUP.md` - Google Play Console API setup
   - `docs/APP-STORE-CONNECT-API-SETUP.md` - App Store Connect API setup

5. **Security**
   - Updated `.gitignore` for Fastlane files
   - Environment variable templates created
   - Sensitive files excluded from version control

## Available Fastlane Lanes

### Android

```bash
# Build debug APK
bundle exec fastlane android debug

# Build release APK + AAB
bundle exec fastlane android release

# Deploy to Google Play Internal Testing
bundle exec fastlane android beta

# Promote from internal to beta track
bundle exec fastlane android promote_to_beta

# Deploy to Production
bundle exec fastlane android production
```

### iOS

```bash
# Build debug version
bundle exec fastlane ios debug

# Build release IPA
bundle exec fastlane ios release

# Deploy to TestFlight
bundle exec fastlane ios beta

# Deploy to App Store
bundle exec fastlane ios production
```

### Shared

```bash
# Run tests only
bundle exec fastlane test

# Increment version (patch)
bundle exec fastlane bump_version
```

## Next Steps

### Step 1: Set Up Google Play Console API (Required for Android Beta)

Follow the guide: `docs/GOOGLE-PLAY-API-SETUP.md`

**Quick checklist:**

1. ☐ Enable Google Play Developer API in Google Cloud Console
2. ☐ Create service account with JSON key
3. ☐ Grant service account access in Play Console
4. ☐ Save JSON key securely
5. ☐ Add `PLAY_STORE_JSON_KEY_DATA` to GitHub Secrets

```bash
# Test locally
cat /path/to/service-account-key.json > google-play-api-key.json

# Add to .env.fastlane (gitignored)
echo "PLAY_STORE_JSON_KEY=$(pwd)/google-play-api-key.json" >> .env.fastlane

# Test Fastlane access
bundle exec fastlane android beta
```

### Step 2: Set Up App Store Connect API (Required for iOS Beta)

Follow the guide: `docs/APP-STORE-CONNECT-API-SETUP.md`

**Quick checklist:**

1. ☐ Create App Store Connect API Key (.p8 file)
2. ☐ Note Key ID and Issuer ID
3. ☐ Get Team IDs (App Store Connect + Developer Portal)
4. ☐ Save credentials securely
5. ☐ Add secrets to GitHub:
   - `APPLE_ID`
   - `APP_STORE_CONNECT_API_KEY_ID`
   - `APP_STORE_CONNECT_API_ISSUER_ID`
   - `APP_STORE_CONNECT_API_KEY_CONTENT`
   - `ITC_TEAM_ID`
   - `TEAM_ID`

```bash
# Create .env.fastlane
cp .env.fastlane.example .env.fastlane

# Edit and fill in your values
nano .env.fastlane

# Test Fastlane access
bundle exec fastlane ios beta
```

### Step 3: Test Local Builds

Before pushing to CI/CD, test locally:

```bash
# Test Android debug build
bundle exec fastlane android debug

# Test iOS debug build (macOS only)
bundle exec fastlane ios debug

# Verify builds complete without errors
ls -la platforms/android/app/build/outputs/apk/debug/
ls -la platforms/ios/build/device/
```

### Step 4: Add GitHub Secrets

Add all required secrets to GitHub:

```bash
# For Android (already set up)
gh secret set ANDROID_KEYSTORE_BASE64
gh secret set ANDROID_KEYSTORE_PASSWORD
gh secret set ANDROID_KEY_ALIAS
gh secret set ANDROID_KEY_PASSWORD

# For Android beta deployment (NEW - required)
gh secret set PLAY_STORE_JSON_KEY_DATA

# For iOS (already set up)
gh secret set IOS_CERTIFICATE_BASE64
gh secret set IOS_CERTIFICATE_PASSWORD
gh secret set IOS_PROVISIONING_PROFILE_BASE64
gh secret set KEYCHAIN_PASSWORD

# For iOS beta deployment (NEW - required)
gh secret set APPLE_ID
gh secret set APP_STORE_CONNECT_API_KEY_ID
gh secret set APP_STORE_CONNECT_API_ISSUER_ID
gh secret set APP_STORE_CONNECT_API_KEY_CONTENT
gh secret set ITC_TEAM_ID
gh secret set TEAM_ID
```

### Step 5: Test GitHub Actions

#### Android Build Test

```bash
# Trigger workflow manually
gh workflow run android-fastlane.yml --field deployment_target=build

# Check status
gh run watch

# Or view in browser
gh run list --workflow=android-fastlane.yml
```

#### Android Beta Deployment Test

```bash
# After setting up Play Console API
gh workflow run android-fastlane.yml --field deployment_target=beta

# This will:
# 1. Build release APK + AAB
# 2. Upload to Google Play Internal Testing
# 3. Make available to internal testers
```

#### iOS Build Test

```bash
# Trigger workflow manually
gh workflow run ios-fastlane.yml --field deployment_target=build

# Check status
gh run watch
```

#### iOS Beta Deployment Test

```bash
# After setting up App Store Connect API
gh workflow run ios-fastlane.yml --field deployment_target=beta

# This will:
# 1. Build release IPA
# 2. Upload to TestFlight
# 3. Make available to internal testers
```

### Step 6: Set Up Internal Testers

#### Google Play Internal Testing

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your app
3. Go to **Testing** > **Internal testing**
4. Create **Internal testers** list
5. Add email addresses
6. Once build is uploaded, invite testers

#### TestFlight

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app
3. Go to **TestFlight** tab
4. Add **Internal Testers** (automatic for App Store Connect users)
5. Add **External Testers** (requires App Review)
6. Once build is uploaded, invite testers

## Migration Benefits

### Before (Pure GitHub Actions)

- Manual Cordova commands
- Complex workflow files
- Hard to test locally
- Manual store uploads
- Error-prone signing setup

### After (Fastlane)

- ✅ Simple lane commands (`fastlane android beta`)
- ✅ Clean, readable workflows
- ✅ Easy local testing
- ✅ Automated store uploads
- ✅ Simplified signing with Match
- ✅ Better error messages
- ✅ Reusable lanes across projects

## Troubleshooting

### Fastlane Not Found

```bash
# Install bundler if needed
gem install bundler

# Install dependencies
bundle install --path vendor/bundle

# Use bundle exec
bundle exec fastlane --version
```

### Permission Errors

```bash
# Ensure gems are installed locally
bundle install --path vendor/bundle

# Don't use sudo with bundle
```

### Android Build Fails

```bash
# Check Cordova platform
cordova platform list

# Re-add platform if needed
cordova platform rm android
cordova platform add android

# Check keystore exists
ls -la uploadkey.jks

# Check build.json is created
cat build.json
```

### iOS Build Fails

```bash
# Check certificates in Keychain Access
security find-identity -v -p codesigning

# Check provisioning profiles
ls -la ~/Library/MobileDevice/Provisioning\ Profiles/

# Check CocoaPods
cd platforms/ios && pod install
```

### Store Upload Fails

**Android:**
- Verify service account has correct permissions
- Wait 5-10 minutes after granting access
- Check API is enabled in Google Cloud Console

**iOS:**
- Verify API Key is valid (not revoked)
- Check Team IDs are correct
- Ensure bundle identifier matches

## Cleanup Old Workflows

Once Fastlane workflows are tested and working:

```bash
# Disable old workflows
mv .github/workflows/android-build.yml .github/workflows/android-build.yml.old
mv .github/workflows/ios-build.yml .github/workflows/ios-build.yml.old

# Or delete them
rm .github/workflows/android-build.yml
rm .github/workflows/ios-build.yml

# Commit changes
git add .github/workflows/
git commit -m "Migrate to Fastlane CI/CD"
git push
```

## Resources

- [Fastlane Documentation](https://docs.fastlane.tools/)
- [Fastlane Cordova Plugin](https://github.com/bamlab/fastlane-plugin-cordova)
- [Google Play Console](https://play.google.com/console/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Developer API](https://developers.google.com/android-publisher)
- [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the setup guides in `docs/`
3. Check Fastlane logs for detailed error messages
4. Search for error messages in Fastlane GitHub issues
5. Ask in Fastlane community forums

## Summary

The Fastlane setup is complete and ready for testing. The main remaining tasks are:

1. **Set up Google Play Console API** (for Android beta deployments)
2. **Set up App Store Connect API** (for iOS beta deployments)
3. **Test local builds** to verify everything works
4. **Add GitHub Secrets** for CI/CD
5. **Test automated deployments** in GitHub Actions

Once these are complete, you'll have a production-grade CI/CD pipeline that can:

- ✅ Automatically build and test on every push
- ✅ Deploy to beta tracks with a button click
- ✅ Promote to production with confidence
- ✅ Manage code signing automatically
- ✅ Work consistently locally and in CI

Happy deploying! 🚀
