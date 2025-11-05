# 🚀 Migrate to New Repository - AUTOMATED!

**Choose your preferred method below:**

---

## ✨ Method 1: Automated with GitHub CLI (Recommended)

**Requires**: GitHub CLI (`gh`)

This script does EVERYTHING for you:
- ✅ Creates the GitHub repository
- ✅ Updates configuration files
- ✅ Pushes code to new repo
- ✅ Opens settings for you

### Installation (if not installed)

```bash
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows
# Download from: https://cli.github.com/
```

### Run the Script

```bash
# Make sure you're in the project directory
cd /home/user/islamqa

# Run the automated script
./migrate.sh

# Follow the prompts:
# 1. Enter repository name (or press Enter for "islamqa-modern")
# 2. Script creates repo and pushes code
# 3. Enable GitHub Pages in the settings page that opens
```

That's it! The script handles everything else.

---

## 🔧 Method 2: Simple Git Script (No GitHub CLI)

**Requires**: Just git (already installed)

This script helps you migrate step-by-step:

### Step 1: Create Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `islamqa-modern` (or any name)
3. Make it **Public** ✅
4. **DO NOT** initialize with README, .gitignore, or license
5. Click **Create repository**

### Step 2: Run the Script

```bash
# Make sure you're in the project directory
cd /home/user/islamqa

# Run the simple migration script
./migrate-simple.sh

# Follow the prompts:
# 1. Enter your GitHub username
# 2. Enter repository name (must match what you created)
# 3. Press Enter after you've created the repo on GitHub
# 4. Script updates config and pushes code
```

### Step 3: Enable GitHub Pages

1. Go to: `https://github.com/YOUR_USERNAME/REPO_NAME/settings/pages`
2. Under **Source**, select: **GitHub Actions**
3. Click **Save**

---

## 📋 Manual Method (If Scripts Don't Work)

If you prefer to do it manually or scripts fail:

### 1. Create Repository

Go to https://github.com/new and create a **public** repository

### 2. Update Configuration

Edit `vite.config.web.js` line 10:
```javascript
base: '/YOUR_REPO_NAME/',  // Change this
```

### 3. Commit Changes

```bash
git add vite.config.web.js
git commit -m "Update base path for new repository"
```

### 4. Add Remote & Push

```bash
# Add remote
git remote add new-origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push current branch as main
git push new-origin claude/islamic-qa-app-planning-011CUq94UCWu8dK2eyhrkCNy:main
```

### 5. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: **GitHub Actions**
3. Save

---

## ✅ Verification Checklist

After migration, check:

- [ ] New repository created on GitHub
- [ ] Code pushed successfully (check GitHub)
- [ ] `vite.config.web.js` has correct base path
- [ ] GitHub Pages enabled (Settings → Pages → GitHub Actions)
- [ ] Workflow running (Actions tab shows activity)
- [ ] Green checkmark appears (wait 2-3 minutes)
- [ ] Live site accessible at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

## 🆘 Troubleshooting

### Script says "Permission denied"

```bash
chmod +x migrate.sh
chmod +x migrate-simple.sh
```

### GitHub CLI authentication fails

```bash
gh auth login
# Follow the prompts to authenticate
```

### Push fails with 403 error

- Check you created the repository first
- Verify repository is public
- Check GitHub username is correct
- Try SSH instead: `git@github.com:USERNAME/REPO.git`

### GitHub Pages shows 404

- Wait 2-3 minutes after first deployment
- Check Actions tab for errors
- Verify Source is set to "GitHub Actions" (NOT "Deploy from a branch")
- Clear browser cache

### Base path wrong in deployed site

- Edit `vite.config.web.js` and fix base path
- Commit: `git commit -am "Fix base path"`
- Push: `git push new-origin main`
- Wait for rebuild

---

## 🎯 What Happens Next?

After successful migration:

1. **GitHub Actions workflow runs automatically**
   - Builds your app with `yarn build:web`
   - Deploys to GitHub Pages
   - Takes 2-3 minutes

2. **Your app goes live!**
   - Visit: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
   - Share with users for testing
   - Dark mode works!
   - Fully responsive!

3. **Future updates are automatic**
   - Push to main: `git push origin main`
   - Workflow runs automatically
   - Site updates in 2-3 minutes

---

## 📞 Need Help?

**Scripts not working?**
- Check you're in the correct directory: `/home/user/islamqa`
- Make sure scripts are executable: `ls -l migrate*.sh`
- Read error messages carefully

**Still stuck?**
- See detailed instructions: `MIGRATION.md`
- Check deployment guide: `DEPLOYMENT.md`
- Review quick start: `QUICK_START.md`

---

## 🎉 Ready? Let's Go!

**Recommended**: Try Method 1 (automated with `gh`) if you have it installed.

**No GitHub CLI?** Use Method 2 (simple script).

**Prefer manual?** Follow the manual steps.

**Your modern Islamic Q&A app is minutes away from being live!** 🚀
