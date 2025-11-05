# 🔄 Migration Guide: Moving to a New Repository

This guide will help you move this branch to a new repository where you have full control.

---

## 🎯 Why Migrate?

Since you can't merge to `main` in the current repository, creating a new repository allows you to:
- ✅ Have full control over the main branch
- ✅ Deploy to GitHub Pages immediately
- ✅ Continue development without restrictions
- ✅ Start fresh with clean commit history (optional)

---

## 📋 Migration Steps

### Option 1: Quick Migration (Recommended)

This creates a new repo with the current state of this branch.

#### Step 1: Create New GitHub Repository
1. Go to https://github.com/new
2. Repository name: `islamqa-modern` (or any name you prefer)
3. Description: `Modern Islamic Q&A app with Vue 3, dark mode, and responsive design`
4. Make it **Public** (required for free GitHub Pages)
5. **Do NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

#### Step 2: Get Your Local Code
If you're working locally, navigate to this directory. If not:

```bash
# Clone the current repo (if not already)
git clone https://github.com/mohamedazher/islamqa.git
cd islamqa

# Checkout this branch
git checkout claude/islamic-qa-app-planning-011CUq94UCWu8dK2eyhrkCNy
```

#### Step 3: Push to New Repository

```bash
# Add new repository as remote
git remote add new-origin https://github.com/YOUR_USERNAME/islamqa-modern.git

# Push this branch as main in new repo
git push new-origin claude/islamic-qa-app-planning-011CUq94UCWu8dK2eyhrkCNy:main

# Set the new remote as default (optional but recommended)
git remote remove origin
git remote rename new-origin origin
```

#### Step 4: Update Repository-Specific Configurations

**Update GitHub Pages Base Path:**

1. Edit `vite.config.web.js`:
```javascript
// Change line 10 from:
base: '/islamqa/',

// To (use your new repo name):
base: '/islamqa-modern/',
```

2. Commit and push:
```bash
git add vite.config.web.js
git commit -m "Update base path for new repository"
git push origin main
```

#### Step 5: Enable GitHub Pages

1. Go to your new repo: `https://github.com/YOUR_USERNAME/islamqa-modern`
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **GitHub Actions**
4. The workflow will run automatically (check **Actions** tab)
5. After 2-3 minutes, visit: `https://YOUR_USERNAME.github.io/islamqa-modern/`

**🎉 Done! Your app is now live on a new repository!**

---

### Option 2: Fresh Start with Clean History

If you want a clean commit history (only final state, not all development commits):

#### Step 1: Create New Repository (Same as Option 1)

#### Step 2: Create Fresh Repository Locally

```bash
# Create new directory
mkdir islamqa-modern
cd islamqa-modern

# Initialize git
git init

# Copy files from old repo (adjust path as needed)
# Copy everything EXCEPT .git directory
cp -r /path/to/old/islamqa/* .
cp -r /path/to/old/islamqa/.github .
cp /path/to/old/islamqa/.gitignore .

# Or if you're IN the old repo directory:
cd ..
cp -r islamqa islamqa-modern
cd islamqa-modern
rm -rf .git
git init
```

#### Step 3: Update Configuration

1. Edit `vite.config.web.js`:
```javascript
base: '/islamqa-modern/',  // Your new repo name
```

2. Update `.github/workflows/deploy.yml` if needed (should work as-is)

#### Step 4: Initial Commit

```bash
git add .
git commit -m "Initial commit: Modern Islamic Q&A app

- Vue 3 + Vite + Pinia architecture
- Full dark mode support
- Professional icon system
- Responsive design (mobile, tablet, desktop)
- GitHub Pages deployment configured
- Core views complete with modern UI"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/islamqa-modern.git
git branch -M main
git push -u origin main
```

#### Step 5: Enable GitHub Pages (Same as Option 1, Step 5)

---

## 📝 Post-Migration Checklist

After migrating, update these files in your new repository:

### 1. Update README.md (Create/Replace)

Create a proper README for your new repo:

```bash
# I'll create this in the next step
```

### 2. Update DEPLOYMENT.md

Search and replace in `DEPLOYMENT.md`:
- Old: `https://mohamedazher.github.io/islamqa/`
- New: `https://YOUR_USERNAME.github.io/islamqa-modern/`

### 3. Verify package.json

Make sure `package.json` has correct info:
```json
{
  "name": "islamqa-modern",
  "version": "2.0.0",
  "displayName": "IslamQA - Modern"
}
```

### 4. Test the Build

```bash
# Install dependencies
yarn install

# Test Cordova build
yarn build

# Test web build
yarn build:web

# Verify builds succeed
```

### 5. Test Locally

```bash
# Start dev server
yarn dev

# Visit http://localhost:3000
# Test dark mode toggle
# Test navigation
```

---

## 🔧 What to Update in New Repo

### Required Changes:
1. ✅ `vite.config.web.js` - Update `base` path
2. ✅ Enable GitHub Pages in settings

### Optional Updates:
3. 📝 Update `package.json` name/version
4. 📝 Create/update README.md
5. 📝 Update DEPLOYMENT.md URLs
6. 📝 Add LICENSE file (MIT recommended)
7. 📝 Update `config.xml` for Cordova (if deploying mobile)

---

## 🌐 Your New URLs

After migration:

**GitHub Repository:**
- https://github.com/YOUR_USERNAME/islamqa-modern

**Live App (GitHub Pages):**
- https://YOUR_USERNAME.github.io/islamqa-modern/

**Repository Settings:**
- https://github.com/YOUR_USERNAME/islamqa-modern/settings

**GitHub Actions (Deployment):**
- https://github.com/YOUR_USERNAME/islamqa-modern/actions

---

## 🚀 Continuing Development

In your new repository:

### Starting Development
```bash
# Clone your new repo
git clone https://github.com/YOUR_USERNAME/islamqa-modern.git
cd islamqa-modern

# Install dependencies
yarn install

# Start dev server
yarn dev
```

### Making Changes
```bash
# Create feature branch (optional)
git checkout -b feature/add-dark-mode-to-quiz

# Make your changes...
# Test locally with: yarn dev

# Commit and push
git add .
git commit -m "Add dark mode to Quiz view"
git push origin feature/add-dark-mode-to-quiz

# Merge to main (or create PR)
git checkout main
git merge feature/add-dark-mode-to-quiz
git push origin main

# Automatic deployment triggers! 🎉
```

### Building for Production
```bash
# Web deployment
yarn build:web
# Check dist/ directory

# Cordova mobile build
yarn build
# Check www/ directory

yarn cordova:build:android
# Creates APK
```

---

## 🆘 Troubleshooting

### Can't Push to New Repo
- Make sure you created the repo on GitHub first
- Check you're using the correct username in the URL
- Verify you have permissions (use your own account)

### GitHub Pages Shows 404
- Verify **Settings → Pages → Source** is set to "GitHub Actions"
- Check **Actions** tab - workflow should have green checkmark
- Wait a few minutes after first deployment
- Clear browser cache

### Assets Not Loading on GitHub Pages
- Check `vite.config.web.js` has correct `base` path
- Should be: `base: '/repo-name/',` (with slashes)
- Rebuild and redeploy: `git push origin main`

### Build Fails
- Check Node version: `node -v` (should be 18+)
- Delete node_modules and reinstall: `rm -rf node_modules && yarn install`
- Check `yarn.lock` exists in repo

---

## 📚 Documentation in New Repo

Your new repository will have:

- ✅ **CLAUDE.md** - Project overview and development guidelines
- ✅ **DEPLOYMENT.md** - GitHub Pages deployment guide
- ✅ **PROGRESS.md** - What's been accomplished
- ✅ **MIGRATION.md** - This guide (can remove after migration)
- ✅ **MODERNIZATION_PLAN.md** - Original modernization plan
- 📝 **README.md** - Main repo documentation (create this next)

---

## ✅ Migration Complete!

After following these steps, you'll have:
- ✅ Full control over your repository
- ✅ Live demo on GitHub Pages
- ✅ Automatic deployments on push
- ✅ Clean project structure
- ✅ All documentation
- ✅ Modern, professional Islamic Q&A app

**Next**: Create a comprehensive README.md for your new repository!
