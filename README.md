# 🌙 IslamQA - Modern Islamic Q&A App

> **Modern, responsive Islamic Q&A application** with offline access to 8000+ authentic questions and answers from IslamQA.info

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://YOUR_USERNAME.github.io/islamqa-modern/)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**🌐 [View Live Demo](https://YOUR_USERNAME.github.io/islamqa-modern/)** | **📱 [Download APK](#)** | **📖 [Documentation](#documentation)**

---

## ✨ Features

### 🎨 Modern UI/UX
- **🌓 Dark Mode** - Seamless light/dark theme with system preference detection
- **📱 Fully Responsive** - Optimized for mobile, tablet, and desktop
- **⚡ Fast & Smooth** - Optimized bundles (~120KB gzipped)
- **🎯 Professional Design** - Modern indigo/teal color scheme

### 🔍 Core Functionality
- **📚 Browse Categories** - Hierarchical organization of Islamic topics
- **🔎 Fuzzy Search** - Find questions even with typos (e.g., "profet" finds "prophet")
- **📖 8000+ Q&As** - Offline access to authentic Islamic knowledge
- **🔖 Bookmarks** - Save questions to custom folders
- **🎯 Quiz System** - Test your knowledge with 4 quiz modes
- **🏆 Gamification** - Points, levels, achievements, and streaks

### 🛠️ Technical Features
- **📴 Offline First** - SQLite database for offline access
- **🚀 Progressive Web App** - Installable on any device
- **📱 Hybrid Mobile** - Apache Cordova for Android/iOS
- **🎨 TailwindCSS** - Utility-first CSS framework
- **⚙️ Modern Stack** - Vue 3, Vite, Pinia, Vue Router

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Yarn** (recommended) or npm
- **Cordova CLI** (for mobile builds): `npm install -g cordova`

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/islamqa-modern.git
cd islamqa-modern

# Install dependencies
yarn install

# Start development server
yarn dev
# Visit http://localhost:3000
```

### Build Commands

```bash
# Development
yarn dev              # Start dev server with hot reload

# Web Build (GitHub Pages)
yarn build:web        # Build for web deployment
yarn deploy           # Deploy to GitHub Pages

# Cordova Build (Mobile App)
yarn build            # Build for Cordova
yarn cordova:build:android    # Build Android APK
yarn cordova:build:ios        # Build iOS app (macOS only)
yarn cordova:run:android      # Run on Android device
```

---

## 📸 Screenshots

### Light Mode
<table>
  <tr>
    <td><img src="docs/screenshots/home-light.png" alt="Home Light" width="250"/></td>
    <td><img src="docs/screenshots/browse-light.png" alt="Browse Light" width="250"/></td>
    <td><img src="docs/screenshots/question-light.png" alt="Question Light" width="250"/></td>
  </tr>
  <tr>
    <td align="center"><b>Home Dashboard</b></td>
    <td align="center"><b>Browse Categories</b></td>
    <td align="center"><b>Question View</b></td>
  </tr>
</table>

### Dark Mode
<table>
  <tr>
    <td><img src="docs/screenshots/home-dark.png" alt="Home Dark" width="250"/></td>
    <td><img src="docs/screenshots/search-dark.png" alt="Search Dark" width="250"/></td>
    <td><img src="docs/screenshots/quiz-dark.png" alt="Quiz Dark" width="250"/></td>
  </tr>
  <tr>
    <td align="center"><b>Home (Dark)</b></td>
    <td align="center"><b>Search (Dark)</b></td>
    <td align="center"><b>Quiz (Dark)</b></td>
  </tr>
</table>

---

## 🏗️ Architecture

### Tech Stack

```
┌─────────────────────────────────────┐
│     UI Layer                        │
│  Vue 3 (Composition API)            │
│  TailwindCSS + Dark Mode            │
│  Responsive Components              │
├─────────────────────────────────────┤
│  State Management                   │
│  Pinia Stores (Data, Gamification)  │
│  Vue Router (Hash mode)             │
├─────────────────────────────────────┤
│  Business Logic                     │
│  Search (Fuse.js)                   │
│  Quiz Generator                     │
│  Gamification Engine                │
├─────────────────────────────────────┤
│  Data Layer                         │
│  SQLite (Cordova)                   │
│  LocalStorage (Web)                 │
│  JSON Data Files                    │
└─────────────────────────────────────┘
```

### Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Vue 3** | UI Framework | 3.4.21 |
| **Vite** | Build Tool | 5.1.6 |
| **Pinia** | State Management | 2.1.7 |
| **Vue Router** | Routing | 4.3.0 |
| **TailwindCSS** | Styling | 3.4.1 |
| **Fuse.js** | Fuzzy Search | 7.0.0 |
| **Cordova** | Mobile Wrapper | 11.x |

---

## 📁 Project Structure

```
islamqa-modern/
├── src/
│   ├── components/
│   │   ├── common/              # Reusable components
│   │   │   ├── Button.vue       # 5 variants + dark mode
│   │   │   ├── Card.vue         # Container component
│   │   │   ├── Icon.vue         # 30+ SVG icons
│   │   │   ├── PageHeader.vue   # Page header
│   │   │   └── ThemeToggle.vue  # Dark mode toggle
│   │   ├── layout/              # Layout components
│   │   │   ├── DesktopSidebar.vue
│   │   │   └── MobileBottomNav.vue
│   │   └── browse/              # Feature components
│   │       ├── CategoryCard.vue
│   │       └── QuestionListItem.vue
│   ├── views/                   # Page views
│   │   ├── HomeView.vue         # Dashboard (✅ Dark mode)
│   │   ├── BrowseView.vue       # Categories (✅ Dark mode)
│   │   ├── SearchView.vue       # Search (✅ Dark mode)
│   │   ├── QuestionView.vue     # Q&A Display (✅ Dark mode)
│   │   ├── CategoryView.vue     # Category detail (✅ Dark mode)
│   │   ├── QuizView.vue         # Quiz system
│   │   ├── FoldersView.vue      # Bookmarks
│   │   └── ImportView.vue       # Data import
│   ├── stores/                  # Pinia stores
│   │   ├── data.js              # Questions/categories
│   │   └── gamification.js      # Points/achievements
│   ├── services/                # Business logic
│   │   ├── searchService.js     # Fuzzy search
│   │   ├── quizService.js       # Quiz generation
│   │   └── databaseService.js   # SQLite (Cordova)
│   ├── composables/             # Vue composables
│   │   └── useTheme.js          # Dark mode management
│   ├── router/                  # Vue Router config
│   ├── assets/                  # Styles, fonts
│   └── data/                    # JSON data files
├── public/                      # Static assets
├── www/                         # Cordova build output
├── platforms/                   # Cordova platforms
├── .github/
│   └── workflows/
│       └── deploy.yml           # Auto-deployment
├── vite.config.js              # Cordova build config
├── vite.config.web.js          # Web build config
├── tailwind.config.js          # Design system
└── package.json                # Dependencies
```

---

## 🎨 Design System

### Color Palette

```css
/* Primary (Indigo) */
--primary-50:  #eef2ff;
--primary-500: #6366f1;  /* Main brand color */
--primary-900: #312e81;

/* Accent (Teal) */
--accent-50:  #f0fdfa;
--accent-500: #14b8a6;   /* Highlights */
--accent-900: #134e4a;

/* Neutral (Gray) */
--neutral-50:  #f9fafb;  /* Light mode background */
--neutral-950: #0a0a0a;  /* Dark mode background */
```

### Icons

30+ professional icons included:
- Navigation: `home`, `book`, `search`, `lightning`, `folder`
- Actions: `bookmark`, `download`, `upload`, `share`, `settings`
- Navigation: `chevronRight`, `chevronLeft`, `arrowLeft`, `arrowRight`
- Status: `check`, `xCircle`, `info`, `fire`, `star`
- And more...

---

## 🌐 Deployment

### GitHub Pages (Web)

Automatic deployment on push to `main`:

1. **Enable GitHub Pages**:
   - Settings → Pages → Source: **GitHub Actions**

2. **Push to main**:
   ```bash
   git push origin main
   ```

3. **Visit your app**:
   - https://YOUR_USERNAME.github.io/islamqa-modern/

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Mobile (Android/iOS)

```bash
# Android
cordova platform add android
yarn cordova:build:android
# APK: platforms/android/app/build/outputs/apk/

# iOS (macOS only)
cordova platform add ios
yarn cordova:build:ios
# Xcode project: platforms/ios/
```

---

## 📖 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Project overview & development guidelines
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions
- **[PROGRESS.md](PROGRESS.md)** - What's been accomplished
- **[MIGRATION.md](MIGRATION.md)** - Migration guide (for moving repos)
- **[MODERNIZATION_PLAN.md](MODERNIZATION_PLAN.md)** - Original modernization plan

---

## 🛣️ Roadmap

### ✅ Completed (v2.0)
- [x] Modern Vue 3 architecture
- [x] Dark mode implementation
- [x] Professional icon system
- [x] Responsive design
- [x] Core views updated
- [x] GitHub Pages deployment

### 🚧 In Progress
- [ ] Complete dark mode for all views (Quiz, Folders, Import)
- [ ] Add more icons
- [ ] Performance optimizations

### 🔮 Future
- [ ] PWA features (offline caching, install prompt)
- [ ] AI-powered search
- [ ] Question recommendations
- [ ] Multi-language support
- [ ] Unit tests (Vitest)
- [ ] E2E tests (Playwright)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly: `yarn dev` and `yarn build:web`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines
- Follow Vue 3 Composition API patterns
- Use TailwindCSS for styling (no custom CSS)
- Add dark mode support to new components
- Use Icon component for all icons (no emojis in UI)
- Test on mobile, tablet, and desktop
- Ensure accessibility (ARIA labels, keyboard navigation)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Content**: Islamic Q&A content from [IslamQA.info](https://islamqa.info)
- **Icons**: Heroicons-style SVG icons
- **Framework**: Built with Vue 3, Vite, and TailwindCSS
- **Inspiration**: Modern SaaS apps (Linear, Notion, Vercel)

---

## 📧 Contact

**Developer**: Mohamed Azher
**GitHub**: [@mohamedazher](https://github.com/mohamedazher)
**Email**: your.email@example.com

**Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/islamqa-modern/issues)
**Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/islamqa-modern/discussions)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/islamqa-modern&type=Date)](https://star-history.com/#YOUR_USERNAME/islamqa-modern&Date)

---

<div align="center">

**Made with ❤️ for the Muslim community**

[⬆ Back to Top](#-islamqa---modern-islamic-qa-app)

</div>
