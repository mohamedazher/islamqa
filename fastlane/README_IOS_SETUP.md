# iOS TestFlight Deployment with Fastlane

This guide sets up Fastlane to deploy your iOS app to TestFlight locally from your Mac.

## Prerequisites

- macOS with Xcode installed (`xcode-select --install`)
- Fastlane installed (`sudo gem install fastlane`)
- Apple ID account
- App registered in App Store Connect
- iOS development team (you should have one)

## Step 1: Get Your Team IDs

You need two IDs from Apple:

### Find ITC Team ID (App Store Connect)

```bash
fastlane match noop
```

This will prompt you and show your ITC Team ID. Look for the numeric ID.

Alternatively, from **App Store Connect → Account → Membership & Roles**, copy the **Team ID**.

### Find Team ID (Developer Portal)

Go to **https://developer.apple.com/account** → **Membership details** → Copy **Team ID** (looks like `ABC123XYZ`)

## Step 2: Create App Store Connect API Key

This is the recommended way to authenticate with Apple's servers (instead of passwords).

### 2.1 Generate API Key

1. Go to **App Store Connect** (https://appstoreconnect.apple.com)
2. Click your profile icon → **Users and Access** → **Keys**
3. Click **Generate a Key**
4. Select role: **App Manager** (can deploy apps)
5. Name it: `Fastlane Local iOS`
6. Click **Generate**
7. **IMPORTANT**: Download the `.p8` file immediately (can't download again!)

### 2.2 Store the API Key

Create `.fastlane` directory and store the key:

```bash
# Create directory
mkdir -p ~/.fastlane

# Copy your downloaded key
cp ~/Downloads/AuthKey_*.p8 ~/.fastlane/api_key.p8

# Update path for this project
mkdir -p .fastlane
cp ~/.fastlane/api_key.p8 .fastlane/api_key.json

# Verify it's readable
ls -l .fastlane/api_key.json
```

## Step 3: Set Environment Variables

Add these to your shell profile (`~/.zshrc` or `~/.bash_profile`):

```bash
# iOS Fastlane Configuration
export FASTLANE_TEAM_ID="ABC123XYZ"                    # Your Dev Portal Team ID
export FASTLANE_ITC_TEAM_ID="123456789"                # Your App Store Connect Team ID (numeric)
export FASTLANE_API_KEY_ID="YOUR_KEY_ID"               # Key ID from App Store Connect
export FASTLANE_API_ISSUER_ID="YOUR_ISSUER_ID"         # Issuer ID from App Store Connect
export FASTLANE_API_KEY_PATH="~/.fastlane/api_key.p8"  # Path to API Key
```

### Where to Find API Key Details

In App Store Connect → Users & Access → Keys:
- **Key ID**: Column "ID" (e.g., `ABCDEFG123`)
- **Issuer ID**: Top of page, says "Issuer ID"

### Apply Environment Variables

```bash
# For current terminal session
source ~/.zshrc

# Or reload shell
exec zsh
```

## Step 4: Verify Setup

```bash
# Test API key is accessible
ls -l ~/.fastlane/api_key.p8

# Test environment variables are set
echo $FASTLANE_API_KEY_ID
echo $FASTLANE_API_ISSUER_ID
echo $FASTLANE_TEAM_ID
```

## Step 5: Deploy to TestFlight

Everything is ready! Run:

```bash
# From project root
cd /path/to/islamqa

# Deploy to TestFlight
fastlane ios beta

# Or specific command
bundle exec fastlane ios beta
```

What this does:
1. Runs `yarn version:patch` (increments version)
2. Runs tests and builds the app
3. Prepares iOS with Cordova
4. Archives and exports IPA with code signing
5. Uploads to TestFlight
6. Shows completion message

**Typical time**: 15-20 minutes first time, 10-15 minutes after

## Step 6: Monitor TestFlight Build

After upload completes:

1. Go to **App Store Connect** → **TestFlight**
2. Your new build appears in "Builds" section
3. After processing (5-10 min), you can add testers
4. Testers can install via TestFlight app on iPhone

## Commands

### Deploy to TestFlight (Beta)
```bash
fastlane ios beta
```

### Deploy to App Store (Production)
```bash
fastlane ios production
```
⚠️ This submits for App Review - use carefully!

### Build Only (No Upload)
```bash
fastlane ios build_release
```

### Debug Build
```bash
fastlane ios debug
```

## Troubleshooting

### Error: "API Key not found"

```
❌ API Key not found at ~/.fastlane/api_key.p8
```

**Fix**: Ensure key file exists and path is correct
```bash
ls -l ~/.fastlane/api_key.p8
echo $FASTLANE_API_KEY_PATH
```

### Error: "Certificate not found for signing"

```
xcode: error: Signing for "BetterIslam Q&A" requires a development team.
```

**Fix**: Team ID not set correctly
```bash
echo $FASTLANE_TEAM_ID
# Should show: ABC123XYZ (not empty)
```

If empty, re-run: `source ~/.zshrc`

### Error: "Invalid API Key Credentials"

```
errSecInternalComponent, -2070
```

**Causes**:
- Key expired (regenerate in App Store Connect)
- Wrong Key ID
- Wrong Issuer ID
- `.p8` file corrupted

**Fix**:
1. Generate new key in App Store Connect
2. Update `~/.fastlane/api_key.p8`
3. Update environment variables

### Build Hangs on Code Signing

Xcode might prompt for keychain password. Either:
1. Select "Always Allow"
2. Or unlock keychain: `security unlock-keychain`

### "Upload failed: App size too large"

Your IPA is probably over 4GB. Check:
```bash
ls -lh platforms/ios/build/BetterIslamQA.ipa
```

This is rare for normal apps.

## Security Notes

- ✅ **Safe**: App Store Connect API Key (limited to your app, can revoke)
- ❌ **Unsafe**: Apple ID password (gives full account access)
- ⚠️ **Store .p8 safely**: Don't commit to Git
- ⚠️ **Keep .p8 private**: Never share with untrusted sources

## What's Different from Android?

| Feature | Android | iOS |
|---------|---------|-----|
| Signing | Google Play API Key | App Store Connect API Key |
| Build Tool | Gradle + Cordova | Xcode + Cordova |
| Distribution | Play Store | App Store + TestFlight |
| Version Code | Integer (auto-increment) | String (manual control) |
| CI/CD | GitHub Actions | Local only (your choice) |

## Next Steps

1. ✅ Set up environment variables
2. ✅ Download API Key
3. ✅ Test: `fastlane ios beta`
4. ✅ Monitor in App Store Connect
5. ✅ Add TestFlight testers

## Reference

- [Fastlane iOS Documentation](https://docs.fastlane.tools/actions/upload_to_testflight/)
- [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi)
- [Xcode Code Signing](https://developer.apple.com/help/xcode/setting-up-code-signing/)

---

**Version**: 1.0
**Last Updated**: 2025-11-16
**Status**: Ready for local TestFlight deployment
