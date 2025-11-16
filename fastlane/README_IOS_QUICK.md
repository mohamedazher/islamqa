# iOS TestFlight - Quick Start

## One-Time Setup (5 minutes)

1. **Create API Key in App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Users & Access → Keys → Generate Key
   - Select "App Manager" role
   - Download the `.p8` file (save it!)

2. **Find Your IDs**
   - Team ID: Developer Portal → Membership details
   - ITC Team ID: App Store Connect → Membership
   - Key ID: From App Store Connect → Keys
   - Issuer ID: From App Store Connect → Keys page top

3. **Set Environment Variables**
   ```bash
   # Edit ~/.zshrc (or ~/.bash_profile)
   export FASTLANE_TEAM_ID="YOUR_TEAM_ID"
   export FASTLANE_ITC_TEAM_ID="YOUR_ITC_TEAM"
   export FASTLANE_API_KEY_ID="YOUR_KEY_ID"
   export FASTLANE_API_ISSUER_ID="YOUR_ISSUER_ID"
   export FASTLANE_API_KEY_PATH="~/.fastlane/api_key.p8"

   # Reload
   source ~/.zshrc
   ```

4. **Place API Key**
   ```bash
   mkdir -p ~/.fastlane
   cp ~/Downloads/AuthKey_*.p8 ~/.fastlane/api_key.p8
   ```

## Deployment Commands

### Deploy to TestFlight (Beta)
```bash
cd /path/to/islamqa
fastlane ios beta
```

What happens:
- Auto-increments patch version (2.0.18 → 2.0.19)
- Runs tests
- Builds iOS app
- Signs with automatic code signing
- Uploads to TestFlight
- Done! ✅

**Time**: ~15 minutes first build, ~10-15 min after

### Deploy to App Store (Production)
```bash
fastlane ios production
```

⚠️ Submits for App Review - use when ready!

### Build Only (No Upload)
```bash
fastlane ios build_release
```

Creates IPA at: `platforms/ios/build/BetterIslamQA.ipa`

## Monitor Build

After running `fastlane ios beta`:

1. Go to https://appstoreconnect.apple.com/testflight
2. Your new build appears in 10-15 minutes
3. Add internal/external testers
4. They get TestFlight notification

## Troubleshooting

### Xcode asks for signing
- Click "Always Allow" when prompted
- Or unlock keychain: `security unlock-keychain`

### API Key not found error
```bash
# Check file exists
ls -l ~/.fastlane/api_key.p8

# Check env vars
echo $FASTLANE_API_KEY_ID
echo $FASTLANE_API_ISSUER_ID

# Reload if empty
source ~/.zshrc
```

### Certificate/Code Signing Issues
```bash
# Reset Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData/

# Or let Fastlane handle it
fastlane ios build_release
```

## Environment Variables

Store these in `~/.zshrc` or `~/.bash_profile`:

| Variable | Where to Find | Example |
|----------|---------------|---------|
| FASTLANE_TEAM_ID | Developer Portal → Membership | ABC123XYZ |
| FASTLANE_ITC_TEAM_ID | App Store Connect → Account | 123456789 |
| FASTLANE_API_KEY_ID | App Store Connect → Keys | ABCDE12345 |
| FASTLANE_API_ISSUER_ID | App Store Connect → Keys | 12345678-1234-1234-1234-123456789012 |
| FASTLANE_API_KEY_PATH | Where you saved .p8 | ~/.fastlane/api_key.p8 |

## Version Management

Fastlane **auto-increments patch version**:
- Before: `2.0.18`
- After `fastlane ios beta`: `2.0.19`

This applies to:
- `package.json`
- `config.xml`
- iOS build number

## Files Modified

- `fastlane/Fastfile` - iOS lanes optimized for local use
- `fastlane/Appfile` - Team IDs config
- `platforms/ios/ExportOptions.plist` - Xcode signing config
- `fastlane/README_IOS_SETUP.md` - Full setup guide

## Support

**Full guide**: See `fastlane/README_IOS_SETUP.md`

**Fastlane docs**: https://docs.fastlane.tools/

**Apple docs**: https://developer.apple.com/testflight/

---

**Status**: Ready to deploy! Run `fastlane ios beta` 🚀
