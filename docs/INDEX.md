# 📚 Documentation Index

Complete guide to all documentation in the BetterIslam Q&A project.

---

## 🚀 Getting Started

**New to the project?** Start here:

1. **[README.md](../README.md)** - Project overview and quick start
2. **[CLAUDE.md](../CLAUDE.md)** - Complete development guide for Claude Code
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design patterns
4. **[DATA_STRUCTURE.md](DATA_STRUCTURE.md)** - ⭐ Critical data model guide

---

## 🏗️ Core Documentation

### Architecture & Design
| Document | Purpose |
|----------|---------|
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Tech stack, design patterns, directory structure |
| **[DATA_STRUCTURE.md](DATA_STRUCTURE.md)** | Database schema, semantic IDs, query examples |
| **[TESTING.md](TESTING.md)** | Testing strategy and guidelines |
| **[CLAUDE.md](../CLAUDE.md)** | Development workflows, patterns, common tasks |

---

## 📱 Mobile Development

### Deployment & CI/CD
| Document | Purpose |
|----------|---------|
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Production deployment (Web/Android/iOS) |
| **[CI-CD-SETUP-GUIDE.md](CI-CD-SETUP-GUIDE.md)** | GitHub Actions automation |
| **[QUICK-START-CI-CD.md](QUICK-START-CI-CD.md)** | 5-minute CI/CD setup |
| **[FASTLANE-QUICK-START.md](FASTLANE-QUICK-START.md)** | Fastlane commands |
| **[FASTLANE-MIGRATION-GUIDE.md](FASTLANE-MIGRATION-GUIDE.md)** | Fastlane setup guide |

### Store Configuration
| Document | Purpose |
|----------|---------|
| **[GOOGLE-PLAY-API-SETUP.md](GOOGLE-PLAY-API-SETUP.md)** | Google Play Console API setup |
| **[APP-STORE-CONNECT-API-SETUP.md](APP-STORE-CONNECT-API-SETUP.md)** | App Store Connect API setup |

---

## 🎯 Features

### Prayer Times & Widgets
| Document | Purpose |
|----------|---------|
| **[WIDGETS.md](WIDGETS.md)** | ⭐ Complete prayer widget guide (Android & iOS) |

**Widget Guide Includes:**
- Installation and build requirements
- Android setup (automatic)
- iOS setup (Xcode configuration)
- Permissions and security
- Troubleshooting and debugging
- Production deployment checklist

### Firebase & Analytics
| Document | Purpose |
|----------|---------|
| **[FIREBASE.md](FIREBASE.md)** | Firebase initial setup guide |
| **[FIREBASE_README.md](FIREBASE_README.md)** | Firebase usage & API reference |
| **[ANALYTICS_QUICK_REFERENCE.md](ANALYTICS_QUICK_REFERENCE.md)** | Analytics tracking quick guide |
| **[LEADERBOARD_SETUP.md](LEADERBOARD_SETUP.md)** | Leaderboard configuration |

---

## 🛠️ Tools & Utilities

### Scripts & Automation
| Location | Purpose |
|----------|---------|
| **[../scripts/VERSION_MANAGEMENT.md](../scripts/VERSION_MANAGEMENT.md)** | Version incrementing guide |
| **[../scripts/validate-widget-build.sh](../scripts/validate-widget-build.sh)** | Widget build validation |

### Testing
| Location | Purpose |
|----------|---------|
| **[../tests/README.md](../tests/README.md)** | Test suite documentation |

### Data Tools
| Location | Purpose |
|----------|---------|
| **[../tools/data-extraction/README.md](../tools/data-extraction/README.md)** | Data extraction utilities |

### Quiz Generation
| Location | Purpose |
|----------|---------|
| **[../quiz-generation/README.md](../quiz-generation/README.md)** | Quiz system overview |
| **[../quiz-generation/GENERATION_PROMPT.md](../quiz-generation/GENERATION_PROMPT.md)** | AI quiz generation prompt |
| **[../quiz-generation/generate-quiz-prompt.md](../quiz-generation/generate-quiz-prompt.md)** | Detailed prompt guide |

---

## 📋 Planning & Roadmap

| Document | Purpose |
|----------|---------|
| **[FUTURE_FEATURES.md](FUTURE_FEATURES.md)** | Planned features and enhancements |

### Archived Documentation

Historical documentation moved to `ARCHIVED/`:

- **PROGRESS.md** - Project progress (superseded by current status)
- **QUIZ_SYSTEM_REDESIGN.md** - Quiz redesign plan (implemented)
- **ONBOARDING_DATA_IMPORT_FIXES.md** - Import fixes (resolved)
- **MODERNIZATION_PLAN.md** - Vue 3 migration (completed)
- **IMPLEMENTATION_SUMMARY.md** - Implementation summary
- **MIGRATION_COMPLETE.md** - Migration completion report
- **DATA_MIGRATION_PLAN.md** - Database migration plan

---

## 🗂️ Documentation Structure

```
docs/
├── INDEX.md (this file)
│
├── Core
│   ├── ARCHITECTURE.md
│   ├── DATA_STRUCTURE.md
│   ├── TESTING.md
│   └── DEPLOYMENT.md
│
├── Features
│   ├── WIDGETS.md ⭐ NEW
│   ├── FIREBASE.md
│   ├── FIREBASE_README.md
│   ├── ANALYTICS_QUICK_REFERENCE.md
│   └── LEADERBOARD_SETUP.md
│
├── CI/CD
│   ├── CI-CD-SETUP-GUIDE.md
│   ├── QUICK-START-CI-CD.md
│   ├── FASTLANE-QUICK-START.md
│   └── FASTLANE-MIGRATION-GUIDE.md
│
├── Store Setup
│   ├── GOOGLE-PLAY-API-SETUP.md
│   └── APP-STORE-CONNECT-API-SETUP.md
│
├── FUTURE_FEATURES.md
│
└── ARCHIVED/
    ├── PROGRESS.md
    ├── QUIZ_SYSTEM_REDESIGN.md
    ├── ONBOARDING_DATA_IMPORT_FIXES.md
    ├── MODERNIZATION_PLAN.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── MIGRATION_COMPLETE.md
    └── DATA_MIGRATION_PLAN.md
```

---

## 🎯 Quick Links by Task

### I want to...

**...understand the codebase**
→ [CLAUDE.md](../CLAUDE.md) → [ARCHITECTURE.md](ARCHITECTURE.md) → [DATA_STRUCTURE.md](DATA_STRUCTURE.md)

**...add a new feature**
→ [ARCHITECTURE.md](ARCHITECTURE.md) (patterns) → [DATA_STRUCTURE.md](DATA_STRUCTURE.md) (data access) → [CLAUDE.md](../CLAUDE.md) (workflows)

**...deploy the app**
→ [DEPLOYMENT.md](DEPLOYMENT.md) → [CI-CD-SETUP-GUIDE.md](CI-CD-SETUP-GUIDE.md) (automation)

**...add prayer time widgets**
→ [WIDGETS.md](WIDGETS.md) (complete guide for Android & iOS)

**...integrate Firebase**
→ [FIREBASE.md](FIREBASE.md) (setup) → [FIREBASE_README.md](FIREBASE_README.md) (usage) → [ANALYTICS_QUICK_REFERENCE.md](ANALYTICS_QUICK_REFERENCE.md) (tracking)

**...set up CI/CD**
→ [QUICK-START-CI-CD.md](QUICK-START-CI-CD.md) (quick) → [CI-CD-SETUP-GUIDE.md](CI-CD-SETUP-GUIDE.md) (full guide)

**...configure app stores**
→ [GOOGLE-PLAY-API-SETUP.md](GOOGLE-PLAY-API-SETUP.md) & [APP-STORE-CONNECT-API-SETUP.md](APP-STORE-CONNECT-API-SETUP.md)

**...write tests**
→ [TESTING.md](TESTING.md) → [../tests/README.md](../tests/README.md)

**...update app version**
→ [../scripts/VERSION_MANAGEMENT.md](../scripts/VERSION_MANAGEMENT.md) or run `yarn version:patch`

---

## 📊 Documentation Status

| Category | Status | Notes |
|----------|--------|-------|
| Core Docs | ✅ Complete | Architecture, data model, testing |
| Widget Guide | ✅ Complete | New comprehensive guide |
| Firebase | ✅ Complete | Setup & usage documented |
| CI/CD | ✅ Complete | GitHub Actions & Fastlane |
| Store Setup | ✅ Complete | Both platforms covered |
| Archived | 📚 Reference | Historical docs preserved |

---

## 🆕 Recent Updates

**November 15, 2025:**
- ✨ **NEW:** [WIDGETS.md](WIDGETS.md) - Complete prayer widget guide
- 🧹 **Cleanup:** Moved outdated docs to ARCHIVED/
- 🧹 **Cleanup:** Consolidated widget docs into single file
- 🧹 **Cleanup:** Moved CI/CD docs to docs/ folder
- 📝 **Updated:** INDEX.md with new structure

**Previous:**
- **FUTURE_FEATURES.md** - Feature expansion roadmap
- **LEADERBOARD_SETUP.md** - Firebase leaderboard guide
- **DATA_STRUCTURE.md** - Comprehensive data model guide

---

## 📝 Documentation Guidelines

### Creating New Documentation

1. **Choose the right location:**
   - Core architecture/design → `docs/`
   - Feature-specific guides → `docs/`
   - Tool/script documentation → Same directory as tool
   - Historical/completed → `docs/ARCHIVED/`

2. **Follow the format:**
   - Clear hierarchical headings
   - Code examples with syntax highlighting
   - Troubleshooting sections
   - Cross-reference related docs
   - Include "last updated" date

3. **Maintain regularly:**
   - Update when features change
   - Archive (don't delete) outdated docs
   - Update INDEX.md with new files
   - Keep cross-references current

---

## 🤝 Contributing

When updating documentation:

- ✅ Keep it **current** - Update modification dates
- ✅ Add **cross-references** - Link to related docs
- ✅ Be **concise** - Clear, actionable information
- ✅ Include **examples** - Code snippets and commands
- ✅ Update **this index** - Keep navigation current

---

**Lost?** Start with [README.md](../README.md) → Choose your task above → Follow the guide

**Still stuck?** Check [CLAUDE.md](../CLAUDE.md) for development guidelines

**Need help?** Open an issue on GitHub

---

**Last Updated:** November 15, 2025
**App Version:** 2.0.14+
**Status:** Active Development
