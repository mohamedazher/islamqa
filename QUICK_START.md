# 🚀 Quick Start: Migrate to New Repository

**This is your quick reference guide for moving to a new repository.**

For detailed instructions, see **[MIGRATION.md](MIGRATION.md)**.

---

## ⚡ Fast Track (5 Minutes)

### 1️⃣ Create New GitHub Repository

Go to: https://github.com/new

```
Name: islamqa-modern (or any name)
Description: Modern Islamic Q&A app with Vue 3 and dark mode
Visibility: Public ✅ (required for free GitHub Pages)
Initialize: NO ❌ (keep all unchecked)
```

Click **Create repository**

### 2️⃣ Push This Code to New Repo

```bash
# If you're in this directory already:
git remote add new-origin https://github.com/YOUR_USERNAME/islamqa-modern.git
git push new-origin claude/islamic-qa-app-planning-011CUq94UCWu8dK2eyhrkCNy:main
```

### 3️⃣ Update Base Path

Edit `vite.config.web.js` line 10:
```javascript
base: '/islamqa-modern/',  // Change to your repo name
```

Commit:
```bash
git add vite.config.web.js
git commit -m "Update base path for new repository"
git push new-origin main
```

### 4️⃣ Enable GitHub Pages

1. Go to: `https://github.com/YOUR_USERNAME/islamqa-modern/settings/pages`
2. Under **Source**, select: **GitHub Actions** ⚠️
3. Go to **Actions** tab - workflow runs automatically
4. Wait 2-3 minutes ⏱️
5. Visit: `https://YOUR_USERNAME.github.io/islamqa-modern/` 🎉

---

## ✅ Verification Checklist

After migration:

- [ ] New repo created on GitHub
- [ ] Code pushed to new repo's main branch
- [ ] `vite.config.web.js` updated with correct base path
- [ ] GitHub Pages enabled (Settings → Pages → GitHub Actions)
- [ ] Workflow completed (green checkmark in Actions tab)
- [ ] Live site accessible at `YOUR_USERNAME.github.io/islamqa-modern`

---

## 📚 What You Have

Your new repository includes:

**✅ Working Features:**
- Modern Vue 3 app with dark mode
- Browse 8000+ Islamic Q&As
- Fuzzy search
- Quiz system with gamification
- Bookmarks and folders
- Fully responsive (mobile, tablet, desktop)

**✅ Documentation:**
- `README.md` - Main documentation
- `PROGRESS.md` - What's been accomplished
- `DEPLOYMENT.md` - Deployment guide
- `MIGRATION.md` - Migration instructions
- `CLAUDE.md` - Development guidelines

**✅ Ready to Deploy:**
- GitHub Actions workflow configured
- Auto-deployment on push to main
- Web build configuration ready
- Cordova build for mobile ready

---

## 🎯 Next Steps

After successful deployment:

1. **Test the live site** - Click around, toggle dark mode, search, browse
2. **Share the URL** - Get feedback from users
3. **Continue development** - See roadmap in README.md
4. **Optional**: Add dark mode to remaining views (Quiz, Folders, Import)

---

## 🆘 Need Help?

**Build fails?**
```bash
yarn install  # Reinstall dependencies
yarn build:web  # Test build
```

**GitHub Pages shows 404?**
- Check Settings → Pages → Source is "GitHub Actions"
- Wait a few minutes after first deployment
- Check Actions tab for errors

**Assets not loading?**
- Verify `vite.config.web.js` has correct base path
- Should be: `base: '/repo-name/',` with slashes

---

## 📞 Support

See detailed troubleshooting in:
- **[MIGRATION.md](MIGRATION.md)** - Migration issues
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment issues

---

**Good luck! 🚀 Your modern Islamic Q&A app is ready to go live!**
