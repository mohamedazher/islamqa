# Deployment Scripts

## Quick Deploy Script

The `deploy-all.sh` script automates version bumping and deployment to all platforms.

### Usage

**Deploy to all platforms (Android + iOS + Web):**
```bash
./scripts/deploy-all.sh
```

**Deploy to specific platforms:**
```bash
# Android only (Google Play Beta)
./scripts/deploy-all.sh --android-only

# iOS only (TestFlight)
./scripts/deploy-all.sh --ios-only

# Web only (GitHub Pages)
./scripts/deploy-all.sh --web-only
```

**Skip tests (faster, but not recommended):**
```bash
./scripts/deploy-all.sh --skip-tests
```

### What the script does

1. **Pre-flight checks:**
   - Verifies you're in the correct directory
   - Warns about uncommitted changes
   - Shows current branch and version

2. **Version bump:**
   - Automatically increments patch version (e.g., 2.0.58 → 2.0.59)
   - Updates both `package.json` and `config.xml`

3. **Run tests:**
   - Runs all tests via `yarn test:all`
   - Fails deployment if tests don't pass
   - Can be skipped with `--skip-tests`

4. **Commit changes:**
   - Commits version bump with `[beta]` tag
   - Auto-generates commit message with deployment info
   - Includes Claude Code attribution

5. **Deploy to platforms:**
   - **Android:** Pushes to GitHub → triggers Actions workflow
   - **iOS:** Runs Fastlane locally → uploads to TestFlight
   - **Web:** Builds and deploys to GitHub Pages

### Examples

**Most common use case (deploy everything):**
```bash
./scripts/deploy-all.sh
```

**Just update the Android app:**
```bash
./scripts/deploy-all.sh --android-only
```

**Quick web-only deployment:**
```bash
./scripts/deploy-all.sh --web-only --skip-tests
```

### Monitoring Deployments

**Android (GitHub Actions):**
- Monitor: https://github.com/mohamedazher/islamqa/actions
- Or run: `gh run list -L 1`

**iOS (TestFlight):**
- Monitor: https://appstoreconnect.apple.com

**Web (GitHub Pages):**
- Live at: https://mohamedazher.github.io/islamqa/

### Troubleshooting

**Script won't run:**
```bash
chmod +x scripts/deploy-all.sh
```

**iOS deployment fails:**
- Check that environment variables are set in `~/.zshrc`:
  - `FASTLANE_TEAM_ID`
  - `FASTLANE_API_KEY_ID`
  - `FASTLANE_API_ISSUER_ID`
  - `FASTLANE_API_KEY_PATH`

**Android deployment doesn't start:**
- Make sure commit message contains `[beta]` tag
- Check GitHub Actions logs

**Tests fail:**
- Fix the tests first, or use `--skip-tests` (not recommended for production)

### Tips

**Add aliases to your shell:**

Add to `~/.zshrc` or `~/.bashrc`:
```bash
# Quick deployment aliases
alias deploy-all='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh'
alias deploy-android='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh --android-only'
alias deploy-ios='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh --ios-only'
alias deploy-web='cd ~/Halsimplify/islamqa && ./scripts/deploy-all.sh --web-only'
```

Then you can just run:
```bash
deploy-all
# or
deploy-android
# or
deploy-ios
```

### Manual Deployment (Alternative)

If you prefer manual control:

**Android:**
```bash
yarn version:patch
yarn test:all
git add -A
git commit -m "Your message [beta]"
git push
```

**iOS:**
```bash
yarn version:patch
yarn test:all
source ~/.zshrc
bundle exec fastlane ios beta
```

**Web:**
```bash
yarn version:patch
yarn build:web
yarn deploy
```
