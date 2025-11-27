# Deployment Quick Start Guide

## One-Command Deployment

I've created a script that handles **everything** for deploying to all platforms with a single command.

### 🚀 Deploy to ALL platforms (Android + iOS + Web)

```bash
./scripts/deploy-all.sh
```

That's it! This one command will:
- ✅ Bump version automatically
- ✅ Run all tests
- ✅ Commit changes with `[beta]` tag
- ✅ Push to GitHub (triggers Android deployment)
- ✅ Deploy to iOS TestFlight
- ✅ Deploy to GitHub Pages

### 🎯 Deploy to specific platforms

```bash
# Android only
./scripts/deploy-all.sh --android-only

# iOS only
./scripts/deploy-all.sh --ios-only

# Web only
./scripts/deploy-all.sh --web-only
```

### ⚡ Skip tests (faster, use for quick iterations)

```bash
./scripts/deploy-all.sh --skip-tests
```

## 🔧 Optional: Add Shell Aliases

For even faster deployment, add these to your `~/.zshrc`:

```bash
# Quick deployment aliases for BetterIslam Q&A
alias deploy-all='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh'
alias deploy-android='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh --android-only'
alias deploy-ios='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh --ios-only'
alias deploy-web='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh --web-only'
```

After adding, reload your shell:
```bash
source ~/.zshrc
```

Then deploy from anywhere:
```bash
deploy-all
```

## 📊 Monitor Deployments

**Android (GitHub Actions):**
```bash
gh run list -L 1
# Or visit: https://github.com/mohamedazher/islamqa/actions
```

**iOS (TestFlight):**
- Visit: https://appstoreconnect.apple.com

**Web (GitHub Pages):**
- Live at: https://mohamedazher.github.io/islamqa/

## 🛠 What Happens Under the Hood

### Version Bumping
- Runs `yarn version:patch`
- Updates `package.json`: `2.0.58` → `2.0.59`
- Updates `config.xml` android-versionCode: `153` → `154`

### Testing
- Runs `yarn test:all` (all Vitest tests)
- Fails deployment if tests don't pass
- Can be skipped with `--skip-tests` flag

### Git Commit
- Commits with message: `"Bump version to X.X.X [beta]"`
- The `[beta]` tag is what triggers Android deployment via GitHub Actions
- Includes deployment targets in commit message

### Platform Deployments

**Android:**
1. Push to GitHub triggers `.github/workflows/deploy-android.yml`
2. GitHub Actions builds signed APK + AAB
3. Uploads to Google Play Open Testing track
4. Takes ~5-10 minutes

**iOS:**
1. Runs `bundle exec fastlane ios beta` locally
2. Builds and archives iOS app
3. Uploads to TestFlight
4. Takes ~5-10 minutes

**Web:**
1. Builds with `yarn build:web`
2. Deploys to `gh-pages` branch via `gh-pages` package
3. GitHub Pages auto-publishes
4. Takes ~2-3 minutes

## ❓ Troubleshooting

### Script won't execute
```bash
chmod +x scripts/deploy-all.sh
```

### iOS fails with environment variable errors
Check `~/.zshrc` has these set:
```bash
export FASTLANE_TEAM_ID="YOUR_TEAM_ID"
export FASTLANE_API_KEY_ID="YOUR_KEY_ID"
export FASTLANE_API_ISSUER_ID="YOUR_ISSUER_ID"
export FASTLANE_API_KEY_PATH="$HOME/.fastlane/api_key.p8"
```

### Android deployment doesn't trigger
- Check commit message has `[beta]` tag
- Verify GitHub Actions is enabled
- Check workflow logs: https://github.com/mohamedazher/islamqa/actions

### Tests fail
Fix the failing tests, or use `--skip-tests` (not recommended for production)

## 📝 Examples

**Most common: Deploy everything**
```bash
./scripts/deploy-all.sh
```

**Quick Android update**
```bash
./scripts/deploy-all.sh --android-only
```

**Fast web deployment (skip tests)**
```bash
./scripts/deploy-all.sh --web-only --skip-tests
```

**iOS only with manual version control**
```bash
# Manually edit version first, then:
./scripts/deploy-all.sh --ios-only --skip-tests
```

## 🎨 Script Output

The script provides colored, emoji-enhanced output:
- 🔵 Blue headers for each stage
- ✅ Green checkmarks for success
- ❌ Red X for errors
- ⚠️  Yellow warnings
- ℹ️  Blue info messages

Example output:
```
============================================
Version Bump
============================================

ℹ️  Incrementing patch version...
✅ Version bumped: 2.0.58 → 2.0.59

============================================
Running Tests
============================================

ℹ️  Running all tests...
✅ All tests passed

============================================
Deploying to Android
============================================

ℹ️  Pushing to master (triggers GitHub Actions)...
✅ Pushed to remote - Android build triggered
ℹ️  Monitor at: https://github.com/mohamedazher/islamqa/actions
```

## 📚 Additional Documentation

- Full script documentation: `scripts/README.md`
- Local deployment guide: `docs/LOCAL_DEPLOYMENT.md`
- GitHub Actions workflow: `.github/workflows/deploy-android.yml`
- Fastfile: `fastlane/Fastfile`

---

**Questions?** Check the docs or ask Claude Code!
