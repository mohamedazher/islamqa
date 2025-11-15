# Fastlane Quick Start

## Quick Commands

### Local Development

```bash
# Install dependencies
bundle install --path vendor/bundle

# Test all
bundle exec fastlane test

# Build Android debug
bundle exec fastlane android debug

# Build iOS debug (macOS only)
bundle exec fastlane ios debug

# Deploy to beta tracks
bundle exec fastlane android beta
bundle exec fastlane ios beta
```

### GitHub Actions

```bash
# Trigger Android build
gh workflow run android-fastlane.yml --field deployment_target=build

# Deploy to Android beta
gh workflow run android-fastlane.yml --field deployment_target=beta

# Trigger iOS build
gh workflow run ios-fastlane.yml --field deployment_target=build

# Deploy to iOS beta
gh workflow run ios-fastlane.yml --field deployment_target=beta
```

## Setup Checklist

### Android Beta Track

- [ ] Follow `docs/GOOGLE-PLAY-API-SETUP.md`
- [ ] Create service account in Google Cloud
- [ ] Enable Google Play Developer API
- [ ] Grant access in Play Console
- [ ] Add `PLAY_STORE_JSON_KEY_DATA` to GitHub Secrets
- [ ] Test: `bundle exec fastlane android beta`

### iOS TestFlight

- [ ] Follow `docs/APP-STORE-CONNECT-API-SETUP.md`
- [ ] Create App Store Connect API Key
- [ ] Get Team IDs
- [ ] Add secrets to GitHub (APPLE_ID, API keys, etc.)
- [ ] Test: `bundle exec fastlane ios beta`

## File Structure

```
fastlane/
├── Fastfile           # Build and deployment lanes
├── Appfile            # App configuration
├── Pluginfile         # Cordova plugin
└── [.env.fastlane]    # Secrets (gitignored)

.github/workflows/
├── android-fastlane.yml   # Android CI/CD
└── ios-fastlane.yml       # iOS CI/CD

docs/
├── FASTLANE-MIGRATION-GUIDE.md          # Complete guide
├── GOOGLE-PLAY-API-SETUP.md             # Android setup
└── APP-STORE-CONNECT-API-SETUP.md       # iOS setup
```

## Need Help?

- Full guide: `docs/FASTLANE-MIGRATION-GUIDE.md`
- Android setup: `docs/GOOGLE-PLAY-API-SETUP.md`
- iOS setup: `docs/APP-STORE-CONNECT-API-SETUP.md`
- Fastlane docs: https://docs.fastlane.tools/

## Common Issues

**"Fastlane not found"**
```bash
bundle exec fastlane --version
```

**"Permission denied"**
```bash
bundle install --path vendor/bundle
```

**"Build failed"**
```bash
# Check logs
cat fastlane/report.xml

# Re-add platform
cordova platform rm android && cordova platform add android
```

**"Store upload failed"**
- Wait 5-10 minutes after granting API access
- Verify credentials are correct
- Check API is enabled
