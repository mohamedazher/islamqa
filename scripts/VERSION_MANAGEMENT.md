# Version Management System

This document explains how the automatic version increment system works in the BetterIslam Q&A app.

## Overview

The app uses an automated version management system that keeps versions synchronized across:
- `package.json` - The main version source
- `config.xml` - Cordova configuration (includes Android versionCode)
- `src/views/SettingsView.vue` - Displays version to users

## How It Works

### Version Injection

The version from `package.json` is automatically injected into the app at build time using Vite's `define` feature. This is configured in:
- `vite.config.js` - For Cordova builds
- `vite.config.web.js` - For web deployments

The version is available in Vue components as `__APP_VERSION__`, which is replaced with the actual version string during the build process.

### Auto-Increment Script

The `scripts/increment-version.js` script handles version increments. It:

1. Reads the current version from `package.json`
2. Increments the version based on the type (patch/minor/major)
3. Updates all relevant files:
   - `package.json` - Sets the new version
   - `config.xml` - Updates both `version` and `android-versionCode` attributes
   - `src/views/SettingsView.vue` - Verified to use `__APP_VERSION__`

## Usage

### Manual Version Increment

You can manually increment the version using these commands:

```bash
# Increment patch version (1.6.3 → 1.6.4)
yarn version:patch

# Increment minor version (1.6.3 → 1.7.0)
yarn version:minor

# Increment major version (1.6.3 → 2.0.0)
yarn version:major
```

### Automatic Increment on Deploy

The version is **automatically incremented** when you:

1. **Build for Android**: `yarn cordova:build:android`
   - Increments patch version
   - Builds the app
   - Runs Cordova build for Android

2. **Build for iOS**: `yarn cordova:build:ios`
   - Increments patch version
   - Builds the app
   - Runs Cordova build for iOS

3. **Deploy to Web**: `yarn deploy`
   - Increments patch version via `predeploy` hook
   - Builds the web version
   - Deploys to GitHub Pages

### Development Builds

For development, these commands do **NOT** increment the version:
- `yarn dev` - Development server
- `yarn build` - Build without version increment
- `yarn cordova:run:android` - Run on device (no increment)
- `yarn cordova:emulate:android` - Emulator (no increment)

## Version Display

The version is displayed in the Settings page (`src/views/SettingsView.vue`) and is automatically updated because it uses the `__APP_VERSION__` constant that is injected by Vite from `package.json`.

## Important Notes

1. **Commit After Deploy**: After running a deploy command, the version files will be modified. You should commit these changes:
   ```bash
   git add package.json config.xml
   git commit -m "Bump version to X.Y.Z"
   ```

2. **Android Version Code**: The `android-versionCode` in `config.xml` is automatically incremented by 1 each time the version changes. This is required by Google Play Store for updates.

3. **Semantic Versioning**: The app follows semantic versioning (MAJOR.MINOR.PATCH):
   - **MAJOR**: Breaking changes or major new features
   - **MINOR**: New features, backward compatible
   - **PATCH**: Bug fixes and minor improvements (default for deploys)

## Troubleshooting

### Version not updating in app

If the version doesn't appear correctly in the app:
1. Make sure you've run `yarn build` after incrementing the version
2. Check that `vite.config.js` and `vite.config.web.js` have the `define` block
3. Verify that `SettingsView.vue` uses `__APP_VERSION__`

### Script not found

If you get "script not found" errors:
```bash
# Make sure the script is executable
chmod +x scripts/increment-version.js

# Run from project root
cd /path/to/islamqa
yarn version:patch
```

## Files Modified by Version Script

When you run the increment script, these files are automatically updated:

- ✅ `package.json` - version field
- ✅ `config.xml` - version and android-versionCode attributes
- ✅ App display - via `__APP_VERSION__` constant (no file changes needed)

## Example Workflow

```bash
# 1. Make your code changes
# ... edit files ...

# 2. Build and deploy for Android (auto-increments version)
yarn cordova:build:android

# 3. Commit the version changes
git add package.json config.xml
git commit -m "Bump version to 1.6.4 for Android release"

# 4. Tag the release (optional)
git tag -a v1.6.4 -m "Release version 1.6.4"

# 5. Push everything
git push origin main --tags
```
