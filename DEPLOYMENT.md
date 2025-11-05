# GitHub Pages Deployment Guide

Your app is configured to deploy to GitHub Pages automatically. Once set up, your app will be available at:

**🌐 https://mohamedazher.github.io/islamqa/**

## 📋 One-Time Setup (Required)

You need to enable GitHub Pages in your repository settings:

### Step 1: Merge Your Branch
1. Go to your GitHub repository: https://github.com/mohamedazher/islamqa
2. Create a Pull Request from `claude/islamic-qa-app-planning-011CUq94UCWu8dK2eyhrkCNy` to `main`
3. Merge the Pull Request

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar under "Code and automation")
4. Under **Source**, select **GitHub Actions** (NOT "Deploy from a branch")
5. Click **Save**

### Step 3: Run the Workflow
After merging to main, the workflow will run automatically. You can also trigger it manually:

1. Go to **Actions** tab in your repository
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select branch: `main`
5. Click **Run workflow**

### Step 4: Wait for Deployment
- The workflow takes about 2-3 minutes to complete
- You'll see a green checkmark when it's done
- Visit https://mohamedazher.github.io/islamqa/ to see your app!

## 🔄 Automatic Deployment

Once set up, your app will automatically deploy to GitHub Pages whenever you:
- Push changes to the `main` branch
- Merge a Pull Request into `main`

## 🛠️ Manual Deployment (Alternative)

If you prefer to deploy manually from your local machine:

```bash
# Build and deploy
yarn deploy
```

This will build the app and push to the `gh-pages` branch.

## 📦 Build Commands

```bash
# Build for Cordova (mobile app)
yarn build

# Build for web deployment (GitHub Pages)
yarn build:web

# Run locally
yarn dev
```

## 🎨 What's Deployed

The GitHub Pages deployment includes:
- ✅ Full dark mode support
- ✅ Professional icon system
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Modern indigo/teal color scheme
- ✅ All core features (Browse, Search, Questions, Quiz)

## 🔍 Troubleshooting

### Workflow Fails
- Check the **Actions** tab for error details
- Ensure `yarn.lock` is committed to the repository
- Make sure all dependencies are in `package.json`

### 404 Error After Deployment
- Verify GitHub Pages is set to **GitHub Actions** (not "Deploy from a branch")
- Check that the workflow completed successfully (green checkmark)
- Wait a few minutes - GitHub Pages can take time to update

### Blank Page or Assets Not Loading
- Check browser console for errors
- The base path in `vite.config.web.js` should be `/islamqa/`
- Clear browser cache and try again

## 📝 Notes

- The web deployment is separate from Cordova mobile builds
- Cordova-specific code (cordova.js) is excluded from web builds
- The `.nojekyll` file prevents Jekyll processing on GitHub Pages
- Deployment uses the `dist/` directory (git-ignored, only on `gh-pages` branch)

## 🚀 Next Steps

After deploying, you can:
1. Share the public URL with users for testing
2. Test on different devices and browsers
3. Set up a custom domain (optional)
4. Continue development - changes will auto-deploy when merged to main

---

**Need help?** Check the GitHub Actions logs in the **Actions** tab of your repository.
