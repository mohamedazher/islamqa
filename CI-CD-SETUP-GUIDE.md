# CI/CD Setup Guide for IslamQA Mobile Builds

This guide will help you set up automated builds for Android and iOS using GitHub Actions.

## 🚨 SECURITY WARNING

**IMPORTANT:** Your `build.json` file currently contains hardcoded passwords. These credentials should **NEVER** be committed to git.

### Immediate Actions Required:

1. **Remove build.json from git history** (if it was committed):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch build.json" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Verify build.json is in .gitignore** (already done ✓)

3. **Use build.example.json** for reference instead

---

## 📋 Prerequisites

### For Android Builds:
- ✅ Android signing key (`uploadkey.jks`) - You already have this!
- ✅ Keystore password: `Imations_#@$$^@`
- ✅ Key alias: `dawahdesk`
- ✅ Key password: `Imations_#@$$^@`

### For iOS Builds:
- ❌ Apple Developer Account (required)
- ❌ iOS Distribution Certificate (.p12 file)
- ❌ Provisioning Profile (.mobileprovision file)

---

## 🔐 Step 1: Set Up GitHub Secrets

You need to add sensitive information as GitHub Secrets. Go to:
**GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

### Android Secrets (Required Now):

1. **ANDROID_KEYSTORE_BASE64**
   ```bash
   # Convert your uploadkey.jks to base64
   base64 -i uploadkey.jks | pbcopy  # macOS
   # OR
   base64 -w 0 uploadkey.jks  # Linux (copy the output)
   ```
   - Secret Name: `ANDROID_KEYSTORE_BASE64`
   - Secret Value: Paste the base64 string

2. **ANDROID_KEYSTORE_PASSWORD**
   - Secret Name: `ANDROID_KEYSTORE_PASSWORD`
   - Secret Value: `Imations_#@$$^@`

3. **ANDROID_KEY_ALIAS**
   - Secret Name: `ANDROID_KEY_ALIAS`
   - Secret Value: `dawahdesk`

4. **ANDROID_KEY_PASSWORD**
   - Secret Name: `ANDROID_KEY_PASSWORD`
   - Secret Value: `Imations_#@$$^@`

### iOS Secrets (Required for iOS builds):

5. **IOS_CERTIFICATE_BASE64**
   ```bash
   # Export your iOS distribution certificate from Keychain Access as .p12
   # Then convert to base64
   base64 -i YourCertificate.p12 | pbcopy  # macOS
   ```
   - Secret Name: `IOS_CERTIFICATE_BASE64`
   - Secret Value: Paste the base64 string

6. **IOS_CERTIFICATE_PASSWORD**
   - Secret Name: `IOS_CERTIFICATE_PASSWORD`
   - Secret Value: The password you set when exporting the .p12 file

7. **IOS_PROVISIONING_PROFILE_BASE64**
   ```bash
   # Download provisioning profile from Apple Developer Portal
   # Convert to base64
   base64 -i YourProfile.mobileprovision | pbcopy  # macOS
   ```
   - Secret Name: `IOS_PROVISIONING_PROFILE_BASE64`
   - Secret Value: Paste the base64 string

8. **KEYCHAIN_PASSWORD**
   - Secret Name: `KEYCHAIN_PASSWORD`
   - Secret Value: Any secure password (e.g., a random string)

---

## 🎯 Step 2: How to Use the Workflows

### Android Build

The Android workflow (`android-build.yml`) runs automatically on:
- Push to `master` or `main` branch
- Pull requests to `master` or `main` branch
- Manual trigger via GitHub Actions UI

#### Manual Trigger:
1. Go to **Actions** tab in your GitHub repository
2. Click **Android Build and Release**
3. Click **Run workflow**
4. Select:
   - Branch: `master`
   - Release type: `debug` or `release`
5. Click **Run workflow**

#### Build Outputs:
- **Debug builds**: APK available as workflow artifact (30 days)
- **Release builds**: APK + AAB available as workflow artifact (90 days) + GitHub Release

### iOS Build

The iOS workflow (`ios-build.yml`) runs on the same triggers as Android.

#### Manual Trigger:
1. Go to **Actions** tab
2. Click **iOS Build and Release**
3. Click **Run workflow**
4. Select:
   - Branch: `master`
   - Release type: `debug` or `release`
5. Click **Run workflow**

#### Build Outputs:
- **Debug builds**: .app bundle as workflow artifact (30 days)
- **Release builds**: IPA file as workflow artifact (90 days) + GitHub Release

---

## 📱 Step 3: iOS Certificate Setup (Detailed)

Since iOS builds require certificates, here's a detailed guide:

### Option A: Using Xcode (Easiest)

1. Open Xcode
2. Go to **Xcode → Preferences → Accounts**
3. Add your Apple Developer account
4. Select your team
5. Click **Manage Certificates**
6. Click **+** and create **iOS Distribution** certificate
7. Export certificate:
   - Right-click certificate → Export
   - Save as `.p12` file with a password
   - Convert to base64 (see Step 1)

### Option B: Using Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create an **iOS Distribution Certificate**
4. Download and install in Keychain Access
5. Export from Keychain as `.p12` (see Step 1)

### Creating Provisioning Profile:

1. In Apple Developer Portal, go to **Profiles**
2. Create new **App Store Distribution** profile
3. Select your App ID: `com.dkurve.betterislamqa`
4. Select your distribution certificate
5. Download the `.mobileprovision` file
6. Convert to base64 (see Step 1)

---

## 🔄 Step 4: Testing the Workflows

### Test Android Build:

```bash
# Commit the workflow files
git add .github/workflows/android-build.yml
git commit -m "Add Android CI/CD workflow"
git push origin master

# Watch the build in GitHub Actions tab
```

### Test iOS Build:

```bash
# After setting up iOS secrets
git add .github/workflows/ios-build.yml
git commit -m "Add iOS CI/CD workflow"
git push origin master

# Watch the build in GitHub Actions tab
```

---

## 📦 Step 5: Downloading Build Artifacts

### From Workflow Runs:

1. Go to **Actions** tab
2. Click on the completed workflow run
3. Scroll to **Artifacts** section
4. Download:
   - `android-debug-apk` or `android-release-apk`
   - `android-release-aab` (for Play Store)
   - `ios-debug-build` or `ios-release-ipa`

### From GitHub Releases:

For release builds on master branch, a GitHub Release is automatically created with:
- Version tag: `v{run_number}-android` or `v{run_number}-ios`
- Attached APK/AAB (Android) or IPA (iOS) files

---

## 🚀 Step 6: Publishing to App Stores

### Google Play Store (Android):

1. Download the `app-release.aab` file from artifacts
2. Go to [Google Play Console](https://play.google.com/console)
3. Select your app
4. Go to **Production** → **Create new release**
5. Upload the AAB file
6. Complete the release notes
7. Submit for review

### Apple App Store (iOS):

1. Download the `BetterIslamQA.ipa` file
2. Use **Transporter** app (macOS) or **Xcode**
3. Upload the IPA to App Store Connect
4. Go to [App Store Connect](https://appstoreconnect.apple.com)
5. Complete app information
6. Submit for review

---

## 🔧 Workflow Configuration Details

### What Each Workflow Does:

#### Android Build (`android-build.yml`):
1. ✅ Checks out code
2. ✅ Sets up Node.js 20 with Yarn cache
3. ✅ Sets up Java 17 (required for Cordova)
4. ✅ Installs dependencies
5. ✅ Runs all tests (`yarn test:all`)
6. ✅ Builds Vite app
7. ✅ Installs Cordova globally
8. ✅ Adds Android platform
9. ✅ Decodes keystore from base64
10. ✅ Creates build.json from secrets
11. ✅ Builds APK (debug or release)
12. ✅ Builds AAB (release only, for Play Store)
13. ✅ Uploads artifacts
14. ✅ Creates GitHub Release (release builds on master)
15. ✅ Cleans up sensitive files

#### iOS Build (`ios-build.yml`):
1. ✅ Checks out code
2. ✅ Sets up Node.js 20 with Yarn cache
3. ✅ Installs dependencies
4. ✅ Runs all tests
5. ✅ Builds Vite app
6. ✅ Installs Cordova globally
7. ✅ Adds iOS platform
8. ✅ Installs CocoaPods dependencies
9. ✅ Creates temporary keychain (release only)
10. ✅ Imports certificate and provisioning profile (release only)
11. ✅ Builds .app (debug) or IPA (release)
12. ✅ Uploads artifacts
13. ✅ Creates GitHub Release (release builds on master)
14. ✅ Cleans up keychain

---

## 🛠️ Troubleshooting

### Common Issues:

#### Android Build Fails: "Keystore not found"
- Ensure `ANDROID_KEYSTORE_BASE64` secret is set correctly
- Verify the base64 encoding: `echo $ANDROID_KEYSTORE_BASE64 | base64 -d > test.jks`

#### Android Build Fails: "Wrong password"
- Double-check `ANDROID_KEYSTORE_PASSWORD` and `ANDROID_KEY_PASSWORD` secrets
- Verify the credentials work locally first

#### iOS Build Fails: "Code signing error"
- Ensure all iOS secrets are set correctly
- Verify certificate and provisioning profile match your App ID
- Check that provisioning profile hasn't expired

#### iOS Build Fails: "No provisioning profile found"
- Download the latest provisioning profile from Apple Developer Portal
- Re-convert to base64 and update the secret

#### Tests Fail
- The workflow runs `yarn test:all` before building
- Fix any failing tests or temporarily remove this step

---

## 📝 Next Steps

### Immediate (Android):
1. ✅ Add Android secrets to GitHub (Step 1)
2. ✅ Push the workflows to your repository
3. ✅ Trigger a manual Android debug build
4. ✅ Verify the APK is generated

### When Ready (iOS):
1. ❌ Set up Apple Developer account (if not already)
2. ❌ Create iOS distribution certificate
3. ❌ Create provisioning profile
4. ❌ Add iOS secrets to GitHub (Step 1)
5. ❌ Trigger a manual iOS debug build
6. ❌ Verify the IPA is generated

### Optional Enhancements:
- Set up automatic deployment to Google Play (using `fastlane` or Play Store API)
- Set up automatic deployment to TestFlight/App Store (using `fastlane`)
- Add Slack/Discord notifications on build completion
- Add version auto-increment
- Add changelog generation

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cordova Android Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/android/)
- [Cordova iOS Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/)
- [Google Play Console](https://play.google.com/console)
- [Apple Developer Portal](https://developer.apple.com/account/)
- [App Store Connect](https://appstoreconnect.apple.com)

---

## 🆘 Getting Help

If you encounter issues:

1. Check the workflow logs in GitHub Actions
2. Look for error messages in the "Build Android/iOS" steps
3. Verify all secrets are set correctly
4. Test the build locally first: `yarn cordova:build:android` or `yarn cordova:build:ios`
5. Create an issue in the repository with:
   - Full error logs
   - Steps to reproduce
   - Environment details

---

## ✅ Checklist

Before running your first build:

### Android:
- [ ] uploadkey.jks file available
- [ ] Keystore password known
- [ ] Key alias known
- [ ] Key password known
- [ ] All Android secrets added to GitHub
- [ ] Workflow file committed to repository
- [ ] build.json removed from git history (if committed)

### iOS:
- [ ] Apple Developer account active
- [ ] iOS distribution certificate created
- [ ] Certificate exported as .p12 with password
- [ ] Provisioning profile downloaded
- [ ] All iOS secrets added to GitHub
- [ ] Workflow file committed to repository

---

**Last Updated:** November 13, 2025
**Maintained by:** IslamQA Development Team
