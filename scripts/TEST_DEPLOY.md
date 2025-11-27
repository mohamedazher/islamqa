# Testing the Deploy Script

## Quick Test (Recommended First)

Test the script without actually deploying:

```bash
# Dry run - see what would happen
./scripts/deploy-all.sh --help
```

## Test Web Deployment Only (Safe)

This is the safest way to test the full flow:

```bash
./scripts/deploy-all.sh --web-only --skip-tests
```

**What it does:**
1. ✅ Bumps version (2.0.60 → 2.0.61)
2. ⏭️  Skips tests (faster)
3. ✅ Commits changes
4. ✅ Pushes to GitHub
5. ✅ Builds and deploys to GitHub Pages
6. ❌ Does NOT deploy to Android
7. ❌ Does NOT deploy to iOS

**Expected output:**
```
============================================
Pre-flight Checks
============================================

ℹ️  Current branch: master
ℹ️  Current version: 2.0.60
✅ Pre-flight checks complete

============================================
Version Bump
============================================

ℹ️  Incrementing patch version...
✅ Version bumped: 2.0.60 → 2.0.61 (versionCode: 155 → 156)

============================================
Running Tests
============================================

⚠️  Skipping tests (--skip-tests flag)

============================================
Committing Changes
============================================

ℹ️  Committing changes...
✅ Changes committed

============================================
Deploying to Web
============================================

ℹ️  Building web app...
ℹ️  Deploying to GitHub Pages...
✅ Web deployment complete
ℹ️  Live at: https://mohamedazher.github.io/islamqa/

============================================
Deployment Summary
============================================

Version: 2.0.61

Deployment Status:
  ✓ Web (GitHub Pages) - Complete
    Live: https://mohamedazher.github.io/islamqa/

✅ All deployments initiated successfully! 🎉
```

## Test Android Only (More Involved)

```bash
./scripts/deploy-all.sh --android-only --skip-tests
```

This will:
1. Bump version
2. Commit with `[beta]` tag
3. Push to GitHub
4. Trigger GitHub Actions workflow

Monitor: https://github.com/mohamedazher/islamqa/actions

## Test iOS Only (Requires Fastlane Setup)

```bash
./scripts/deploy-all.sh --ios-only --skip-tests
```

**Prerequisites:**
- Fastlane environment variables in `~/.zshrc`
- App Store Connect API key
- Takes 5-10 minutes

## Test Full Deployment (All Platforms)

```bash
./scripts/deploy-all.sh
```

This runs **everything**:
- Tests (can take a few minutes)
- Android deployment via GitHub Actions
- iOS deployment via Fastlane (5-10 min)
- Web deployment via gh-pages

## Troubleshooting

### "vi editor opens up"
This was fixed! The script now uses `npm version patch --no-git-tag-version` which doesn't open an editor.

If you still see vi, update the script:
```bash
git pull
```

### "Tests fail"
Use `--skip-tests` flag:
```bash
./scripts/deploy-all.sh --skip-tests
```

### "Script errors about uncommitted files"
The script found files that shouldn't be committed. Check:
```bash
git status
```

If you see `apk_analysis/`, `.apk`, or `node_modules/`, add them to `.gitignore`

### "Permission denied"
Make script executable:
```bash
chmod +x scripts/deploy-all.sh
```

## Recommended Test Order

1. **First time:** `./scripts/deploy-all.sh --help`
2. **Second:** `./scripts/deploy-all.sh --web-only --skip-tests`
3. **Third:** `./scripts/deploy-all.sh --android-only`
4. **Finally:** `./scripts/deploy-all.sh` (full deployment)

## What Changed from Original Issue

**Before:**
- `yarn version:patch` opened vi editor
- User had to manually type `:wq` to continue
- Annoying and error-prone

**After:**
- Uses `npm version patch --no-git-tag-version`
- No editor opens
- Fully automated
- Silent output

## Verify Fix

Run this to verify the script won't open vi:
```bash
grep -n "npm version patch" scripts/deploy-all.sh
```

You should see:
```
161:npm version patch --no-git-tag-version > /dev/null 2>&1
```

If you see `yarn version:patch`, pull the latest:
```bash
git pull origin master
```
