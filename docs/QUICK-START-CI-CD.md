# Quick Start: CI/CD Setup

🚀 **Get your Android/iOS builds automated in 5 minutes!**

## Step 1: Prepare Your Secrets (2 minutes)

Run the helper script:

```bash
./scripts/prepare-secrets.sh
```

This will:
- Convert your `uploadkey.jks` to base64
- Generate all the values you need
- Save them to text files for easy copying

## Step 2: Add Secrets to GitHub (2 minutes)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets one by one:

### For Android (Required):
- `ANDROID_KEYSTORE_BASE64` (from android-keystore-base64.txt)
- `ANDROID_KEYSTORE_PASSWORD` = `Imations_#@$$^@`
- `ANDROID_KEY_ALIAS` = `dawahdesk`
- `ANDROID_KEY_PASSWORD` = `Imations_#@$$^@`

### For iOS (Optional - when ready):
- `IOS_CERTIFICATE_BASE64` (from ios-certificate-base64.txt)
- `IOS_CERTIFICATE_PASSWORD` (your certificate password)
- `IOS_PROVISIONING_PROFILE_BASE64` (from ios-provisioning-profile-base64.txt)
- `KEYCHAIN_PASSWORD` (from script output)

## Step 3: Push and Build (1 minute)

```bash
# Commit the workflow files
git add .github/workflows/
git commit -m "Add CI/CD workflows for Android and iOS"
git push origin master

# Go to GitHub Actions tab and watch your build! 🎉
```

## Step 4: Download Your Build

1. Go to **Actions** tab on GitHub
2. Click on the completed workflow
3. Scroll to **Artifacts**
4. Download your APK/IPA!

---

## Manual Build Trigger

Don't want to push? Run a manual build:

1. Go to **Actions** tab
2. Click **Android Build and Release** or **iOS Build and Release**
3. Click **Run workflow**
4. Select:
   - Branch: `master`
   - Release type: `debug` or `release`
5. Click **Run workflow**

---

## 🆘 Troubleshooting

### "Secret not found" error
- Double-check secret names (they're case-sensitive!)
- Make sure all required secrets are added

### "Keystore error" or "Wrong password"
- Verify the passwords in your secrets
- Test locally first: `yarn cordova:build:android`

### Need more help?
Read the detailed guide: [CI-CD-SETUP-GUIDE.md](CI-CD-SETUP-GUIDE.md)

---

## What Gets Built?

### Android:
- **Debug**: Unsigned APK for testing
- **Release**: Signed APK + AAB (for Google Play Store)

### iOS:
- **Debug**: .app bundle for simulator
- **Release**: Signed IPA (for App Store/TestFlight)

---

## 🎯 Next Steps

- [ ] Set up Android secrets
- [ ] Test Android build
- [ ] Set up iOS secrets (when ready)
- [ ] Test iOS build
- [ ] Publish to Play Store
- [ ] Publish to App Store

---

**Full Documentation**: [CI-CD-SETUP-GUIDE.md](CI-CD-SETUP-GUIDE.md)
