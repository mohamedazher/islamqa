# Quick Deployment Guide

## 🚀 One Command to Deploy Everything

```bash
./scripts/deploy-all.sh
```

This automatically:
- ✅ Bumps version (patch increment)
- ✅ Runs all tests
- ✅ Commits with `[beta]` tag
- ✅ Deploys to Android (Google Play)
- ✅ Deploys to iOS (TestFlight)
- ✅ Deploys to Web (GitHub Pages)

## 🎯 Common Use Cases

```bash
# Android only
./scripts/deploy-all.sh --android-only

# iOS only
./scripts/deploy-all.sh --ios-only

# Web only
./scripts/deploy-all.sh --web-only

# Skip tests (faster)
./scripts/deploy-all.sh --skip-tests
```

## 📱 What Gets Deployed

| Platform | Destination | Time | Trigger |
|----------|------------|------|---------|
| Android | Google Play Open Testing | ~5-10 min | Auto (GitHub Actions) |
| iOS | TestFlight | ~5-10 min | Auto (Fastlane) |
| Web | GitHub Pages | ~2-3 min | Auto (gh-pages) |

## 🔍 Monitor Deployments

**Android:**
```bash
gh run list -L 1
# Or: https://github.com/mohamedazher/islamqa/actions
```

**iOS:**
- https://appstoreconnect.apple.com

**Web:**
- https://mohamedazher.github.io/islamqa/

## ⚡ Quick Aliases (Optional)

Add to `~/.zshrc`:
```bash
alias deploy-all='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh'
alias deploy-android='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh --android-only'
alias deploy-ios='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh --ios-only'
alias deploy-web='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh --web-only'
```

Reload: `source ~/.zshrc`

Then just type: `deploy-all`

## 🛡️ Safety Features

The script prevents accidental commits of:
- `apk_analysis/` folders
- `.apk` files
- `.ipa` files
- `node_modules/`
- `platforms/`
- `plugins/`

## 📚 More Info

- Full documentation: `scripts/README.md`
- Quick start guide: `DEPLOYMENT_QUICK_START.md`
- Detailed setup: `docs/LOCAL_DEPLOYMENT.md`
