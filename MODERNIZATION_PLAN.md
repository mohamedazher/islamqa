# BetterIslam Q&A - Modernization Plan

## Executive Summary

**Current State**: 10-year-old Cordova app with jQuery, ~53MB of Q&A data in JS files, 10-20k active users, high compatibility issues

**Goal**: Modern, engaging Islamic Q&A app with gamification, improved discovery, and natural language search

**Approach**: Phased modernization using Cordova + Vue 3, keeping offline-first architecture, focusing on UX and engagement

**Timeline**: 4-6 months for core modernization (Phases 1-4), AI features later

---

## First Principles Analysis

### Core User Value Props (What We Must Preserve)
1. **Offline-first access** to 8000+ Islamic Q&As
2. **Organized discovery** through categories and topics
3. **Bookmark/organize** favorite questions
4. **Reliable, authentic** Islamic knowledge from IslamQA.com

### User Pain Points (What We Must Fix)
1. **Discovery friction** - Hard to find relevant questions (spelling variations, poor search)
2. **Passive consumption** - No engagement mechanisms beyond browsing
3. **Outdated UX** - Old interface, compatibility issues, bugs
4. **Limited exploration** - No mechanisms to discover related content

### Design Principles for Modernization
1. **Progressive Enhancement** - Build in phases, each phase ships working features
2. **Data Continuity** - Keep existing SQLite structure initially, migrate later
3. **Developer Experience** - Modern tooling for maintainability
4. **Performance** - Fast startup, smooth animations, efficient memory usage
5. **Engagement** - Gamification and discovery drive retention

---

## Phase 1: Foundation & Modern Architecture (Weeks 1-4)

**Goal**: Establish modern development environment and architecture without changing user experience

### 1.1 Technology Stack Setup

**Build System**
- Migrate from raw Cordova to **Vite + Cordova** hybrid
- Modern ES6+ with proper module bundling
- Hot reload for development
- TypeScript support (optional, recommended for new code)

**Frontend Framework**
- **Vue 3** (Composition API) with:
  - Vue Router for navigation
  - Pinia for state management
  - Vite for build tooling
  - TailwindCSS or UnoCSS for utility-first styling

**Dependencies to Add**
```json
{
  "vue": "^3.4.0",
  "vue-router": "^4.2.0",
  "pinia": "^2.1.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-vue": "^5.0.0",
  "vite-plugin-cordova": "^2.0.0",
  "tailwindcss": "^3.4.0",
  "fuse.js": "^7.0.0"
}
```

**Dependencies to Keep**
- cordova-sqlite-storage (for offline database)
- cordova-plugin-device, file, statusbar
- cordova-plugin-x-socialsharing (for share feature)

### 1.2 Project Structure Refactoring

```
src/                          # New Vue source
├── main.js                   # App entry point
├── App.vue                   # Root component
├── router/
│   └── index.js              # Vue Router config
├── stores/                   # Pinia stores
│   ├── questions.js          # Questions/answers state
│   ├── folders.js            # User folders/bookmarks
│   ├── quiz.js               # Quiz/gamification state
│   └── search.js             # Search state
├── services/                 # Business logic
│   ├── database.js           # SQLite wrapper (modern WebSqlAdapter)
│   ├── dataLoader.js         # Import Q&A data
│   ├── searchService.js      # Fuzzy search with Fuse.js
│   └── quizService.js        # Quiz logic
├── composables/              # Vue composables (reusable logic)
│   ├── useDatabase.js
│   ├── useSearch.js
│   └── useQuiz.js
├── components/               # Vue components
│   ├── common/               # Reusable UI components
│   │   ├── CategoryCard.vue
│   │   ├── QuestionCard.vue
│   │   ├── BottomSheet.vue
│   │   └── SearchBar.vue
│   ├── browse/               # Browse feature
│   │   ├── CategoryList.vue
│   │   ├── CategoryDetail.vue
│   │   └── QuestionList.vue
│   ├── quiz/                 # Quiz feature
│   │   ├── QuizCard.vue
│   │   ├── QuizResults.vue
│   │   └── QuizHome.vue
│   └── folders/              # Bookmarks/folders
│       ├── FolderList.vue
│       └── FolderDetail.vue
├── views/                    # Page-level components
│   ├── HomeView.vue          # Main dashboard
│   ├── BrowseView.vue        # Category browsing
│   ├── SearchView.vue        # Search results
│   ├── QuestionView.vue      # Question detail
│   ├── QuizView.vue          # Quiz interface
│   └── FoldersView.vue       # Saved questions
├── assets/                   # Static assets
│   ├── data/                 # Q&A data (initially JS, later JSON)
│   │   ├── questions-bundle.js
│   │   └── answers-bundle.js
│   └── styles/               # Global styles
└── utils/                    # Utility functions
    ├── quranFormatter.js     # Arabic text handling
    └── linkParser.js         # Parse Q&A cross-references

www/                          # Cordova web root (Vite builds here)
├── index.html                # Cordova entry (loads Vite bundle)
└── [built assets]            # Vite output

config.xml                    # Cordova config (update)
vite.config.js                # Vite configuration
```

### 1.3 Database Modernization (Keep Structure, Modern API)

**Keep SQLite Schema** (don't break existing data):
```sql
-- Same tables as before
CATEGORIES (id, category_links, category_url, element, parent)
QUESTIONS (id, category_id, question, question_full, question_url, question_no)
ANSWERS (id, question_id, answers)
FOLDERS (id, folder_name)
FOLDER_QUESTIONS (id, question_id, folder_id)
LATEST_QUESTIONS (same structure)
```

**New Database Service** (`src/services/database.js`):
```javascript
// Modern promise-based SQLite wrapper
class DatabaseService {
  async query(sql, params = []) { ... }
  async batchQuery(queries) { ... }
  async getQuestion(id) { ... }
  async searchQuestions(term) { ... }
  async getCategories(parentId) { ... }
  async addToFolder(questionId, folderId) { ... }
}
```

### 1.4 Data Loading Strategy (Keep JS Files Initially)

**Phase 1 Approach**:
- Keep current 16 JS files (questions1-4, answers1-12)
- Bundle them with Vite as static assets
- Modern import: `import questions1 from '@/assets/data/questions1.js'`
- Same SQLite import flow, but cleaner code

**Future optimization** (Phase 5+):
- Convert to compressed JSON or SQLite file
- Ship pre-populated database
- Update mechanism via API

### 1.5 Success Criteria
- [ ] Vite build system working with Cordova
- [ ] Vue 3 + Router + Pinia configured
- [ ] Database service with modern API
- [ ] Data import working (same as before)
- [ ] App launches and shows category list
- [ ] Basic navigation working
- [ ] **No new features yet - just architecture migration**

**Deliverable**: Working app with modern stack, identical UX to old version

---

## Phase 2: Core Features Reimplementation (Weeks 5-8)

**Goal**: Rebuild browse, search, and bookmarks features with modern UX

### 2.1 Modern UI Design System

**Design Principles**:
- Clean, card-based layouts
- Smooth animations (Vue transitions)
- Material Design or iOS-inspired (platform-aware)
- Dark mode support
- Consistent spacing, typography, colors

**Component Library**:
```vue
<!-- CategoryCard.vue -->
<template>
  <div class="category-card" @click="navigate">
    <div class="icon">📚</div>
    <h3>{{ category.name }}</h3>
    <p>{{ questionCount }} questions</p>
  </div>
</template>

<!-- QuestionCard.vue -->
<template>
  <div class="question-card">
    <h4>{{ question.question }}</h4>
    <div class="meta">
      <span>{{ category }}</span>
      <button @click="bookmark">🔖</button>
    </div>
  </div>
</template>
```

### 2.2 Browse Experience (Categories → Questions)

**Home Screen** (`HomeView.vue`):
- Dashboard with cards:
  - Browse Categories
  - Search Questions
  - My Folders
  - Quiz Mode (new)
  - Daily Question (featured)
- Recent activity section
- Statistics (questions read, folders saved)

**Category Browsing** (`BrowseView.vue`):
- Hierarchical navigation (parent → child categories)
- Visual category cards with icons
- Question count per category
- Search within category
- Breadcrumb navigation
- Pull-to-refresh for future updates

**Question List** (`CategoryDetail.vue`):
- Paginated/virtualized list (performance)
- Preview text (first 100 chars)
- Bookmark status indicator
- Related category tags
- Sort options (newest, most bookmarked)

**Question Detail** (`QuestionView.vue`):
- Full question text
- Full answer with HTML formatting
- Cross-reference links (parse and link to other Q&As)
- Bookmark button
- Share button
- "Related Questions" section (from same category)
- Read progress tracking

### 2.3 Enhanced Search with Fuzzy Matching

**Technology**: Fuse.js for fuzzy search

**Implementation** (`src/services/searchService.js`):
```javascript
import Fuse from 'fuse.js'

class SearchService {
  constructor(database) {
    this.db = database
    this.fuseInstance = null
  }

  async initialize() {
    // Load all questions into memory for fuzzy search
    const questions = await this.db.getAllQuestions()

    this.fuseInstance = new Fuse(questions, {
      keys: ['question', 'question_full'],
      threshold: 0.4,  // Fuzzy matching tolerance
      ignoreLocation: true,
      minMatchCharLength: 3
    })
  }

  search(term) {
    // Handles typos like "profet" → "prophet", "salat" → "salah"
    return this.fuseInstance.search(term)
  }

  // Combined SQLite + Fuzzy search
  async hybridSearch(term) {
    // 1. Exact SQLite matches (fast)
    const exactMatches = await this.db.searchQuestions(term)

    // 2. Fuzzy matches for remaining
    const fuzzyMatches = this.search(term)

    // Merge and deduplicate
    return this.mergeResults(exactMatches, fuzzyMatches)
  }
}
```

**Search UI** (`SearchView.vue`):
- Instant search with debouncing
- Search history
- Popular searches
- Filter by category
- Highlight matched terms in results
- "Did you mean...?" suggestions

### 2.4 Bookmarks & Folders (Reimplemented)

**Features**:
- Create custom folders
- Drag-and-drop questions into folders
- Default "Favorites" folder
- Multi-select for bulk operations
- Export/share folder contents
- Folder statistics

**UI Improvements**:
- Visual folder cards with covers
- Folder color coding
- Quick actions (share, edit, delete)
- Empty state illustrations

### 2.5 Success Criteria
- [ ] Modern, attractive UI design
- [ ] Smooth navigation with Vue Router
- [ ] Browse categories → questions → answer detail
- [ ] Fuzzy search working (handles typos)
- [ ] Bookmarks/folders reimplemented
- [ ] Cross-reference links working
- [ ] Share functionality working
- [ ] Performance: <2s to load 1000 questions

**Deliverable**: Modern app with core features, better than original UX

---

## Phase 3: Gamification & Engagement (Weeks 9-12)

**Goal**: Add quiz modes, discovery features, and engagement mechanics

### 3.1 Quiz System Architecture

**Quiz Types**:
1. **Daily Quiz** - 5 random questions per day
2. **Category Quiz** - Quiz on specific topic
3. **Rapid Fire** - 20 questions, timed
4. **True/False** - Simplified mode
5. **Challenge Mode** - Increasing difficulty

**Quiz Generation Strategy**:
```javascript
// src/services/quizService.js
class QuizService {
  // Generate quiz from Q&A database
  generateQuiz(options) {
    const { categoryId, count, difficulty } = options

    // 1. Select questions from category
    const questions = this.selectQuestions(categoryId, count)

    // 2. Generate quiz items
    return questions.map(q => {
      return {
        id: q.id,
        question: q.question,
        correctAnswer: this.extractCorrectAnswer(q.answer),
        options: this.generateOptions(q),  // 4 multiple choice
        explanation: q.answer  // Show after answering
      }
    })
  }

  // Extract key facts from answer text for quiz
  extractCorrectAnswer(answerHtml) {
    // Parse HTML, extract key Islamic rulings
    // E.g., "Is music haram?" → extract "Yes/No" from answer
  }

  // Generate plausible wrong answers
  generateOptions(question) {
    // Mix of correct + wrong options from similar questions
  }
}
```

### 3.2 Quiz UI/UX

**Quiz Card Interface** (Tinder-like):
```vue
<!-- QuizCard.vue -->
<template>
  <div class="quiz-card" @swipe="handleSwipe">
    <div class="question">{{ currentQuestion }}</div>
    <div class="options">
      <button v-for="option in options"
              @click="answer(option)">
        {{ option }}
      </button>
    </div>
    <div class="progress">{{ currentIndex }}/{{ total }}</div>
  </div>
</template>
```

**Features**:
- Swipe gestures (left = skip, right = know, up = bookmark)
- Timer for rapid-fire mode
- Visual feedback (correct = green, wrong = red)
- Explanation modal after answering
- Progress bar
- Streak counter (daily quiz streaks)
- Leaderboard (local scores only)

### 3.3 Gamification Elements

**Points & Achievements**:
- Read questions: +10 points
- Complete quiz: +50 points
- Daily streak: +100 points
- Create folder: +20 points
- Share question: +5 points

**Achievements**:
- 🕌 Scholar: Read 100 questions
- 📚 Student: Complete 10 quizzes
- 🔥 Dedicated: 7-day streak
- 🎯 Master: 90%+ quiz accuracy
- 💾 Collector: 50 bookmarks

**Progress Tracking**:
```javascript
// src/stores/gamification.js
export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    points: 0,
    streak: 0,
    lastQuizDate: null,
    achievements: [],
    stats: {
      questionsRead: 0,
      quizzesCompleted: 0,
      accuracy: 0
    }
  }),
  actions: {
    awardPoints(points, reason) { ... },
    checkAchievements() { ... },
    updateStreak() { ... }
  }
})
```

**UI Integration**:
- Profile screen with stats
- Achievement notifications (toast)
- Progress rings on home screen
- Daily goal reminders

### 3.4 Discovery Features

**"Daily Question"**:
- Featured question each day
- Notification reminder
- Curated interesting topics

**"Related Questions"**:
- Parse answer text for question links
- Show related Q&As at bottom of answer
- Category-based recommendations

**"Explore" Feed**:
- Algorithmic feed of questions:
  - Unread questions from bookmarked categories
  - Popular questions
  - Random discovery
- Infinite scroll
- Mark as read

**Topic Collections**:
- Pre-curated topic bundles:
  - "Ramadan Essentials" (20 Q&As)
  - "New Muslim Guide" (50 Q&As)
  - "Prayer Rulings" (100 Q&As)
- Progress tracking per collection

### 3.5 Success Criteria
- [ ] 5 quiz modes implemented
- [ ] Quiz generation from Q&A content working
- [ ] Swipe/card interface smooth
- [ ] Points and achievements tracking
- [ ] Daily quest system
- [ ] Related questions working
- [ ] Discovery feed engaging
- [ ] User testing shows increased time-in-app

**Deliverable**: Engaging app with gamification, increased retention

---

## Phase 4: Polish & Performance (Weeks 13-16)

**Goal**: Optimize performance, fix bugs, refine UX, prepare for production

### 4.1 Performance Optimization

**App Startup**:
- Lazy load routes
- Pre-cache critical data
- Splash screen optimization
- Database index optimization

**Memory Management**:
- Virtual scrolling for long lists (vue-virtual-scroller)
- Pagination for large datasets
- Image lazy loading
- Cleanup listeners on unmount

**Bundle Size**:
- Code splitting by route
- Tree-shaking unused code
- Compress assets (gzip/brotli)
- Analyze bundle with vite-bundle-visualizer

**Database**:
- Add indexes: `CREATE INDEX idx_question_text ON QUESTIONS(question COLLATE NOCASE)`
- Query optimization
- Batch operations
- Connection pooling

### 4.2 Cross-Platform Polish

**Android Specifics**:
- Back button handling (Vue Router)
- Hardware acceleration
- Status bar color theming
- Share intent support
- Deep linking

**iOS Specifics**:
- Safe area handling (notch)
- Swipe-back gestures
- Native-like transitions
- Haptic feedback

**Accessibility**:
- Screen reader support (ARIA labels)
- Keyboard navigation
- High contrast mode
- Font scaling

### 4.3 Error Handling & Edge Cases

**Offline Handling**:
- Graceful degradation
- Sync queue for future updates
- Clear offline indicators

**Data Integrity**:
- Database migration system
- Backup/restore functionality
- Error recovery

**User Feedback**:
- Loading states everywhere
- Empty states with illustrations
- Error messages (helpful, not technical)
- Retry mechanisms

### 4.4 Testing

**Manual Testing**:
- Device matrix (old/new Android/iOS)
- Feature checklist
- User acceptance testing (10-20 beta users)

**Automated Testing** (optional):
- Vitest for unit tests
- Cypress for E2E tests
- Key paths: search, quiz, bookmarks

### 4.5 Success Criteria
- [ ] App starts in <3s
- [ ] Smooth 60fps animations
- [ ] No memory leaks
- [ ] Works on Android 6+, iOS 12+
- [ ] Bundle size <10MB
- [ ] All critical bugs fixed
- [ ] Beta testing feedback incorporated
- [ ] Accessible (WCAG 2.1 AA)

**Deliverable**: Production-ready app, submitted to app stores

---

## Phase 5: AI/RAG Chat Interface (Future, Weeks 17+)

**Goal**: Add conversational AI for natural language Q&A

**Note**: This phase starts AFTER phases 1-4 are complete and shipped

### 5.1 Architecture

**Technology Stack**:
- Claude API (Anthropic)
- RAG (Retrieval Augmented Generation)
- Vector database or semantic search

**Approach**:
```
User Question
    ↓
Semantic Search (find relevant Q&As)
    ↓
RAG Context (top 5 matching Q&As)
    ↓
Claude API (generate answer citing sources)
    ↓
Response with citations
```

### 5.2 Implementation Options

**Option A: Server-Side RAG** (Recommended)
- Build simple API server (Node.js/Express)
- Embed Q&A database with OpenAI embeddings
- Use Pinecone/Weaviate/PostgreSQL+pgvector
- Claude API calls from server
- App makes HTTP requests

**Option B: Hybrid (Offline + Online)**
- Basic keyword search offline (current SQLite)
- For better results, call API
- Cache responses locally

### 5.3 Features

**Chat Interface**:
- Conversational UI (message bubbles)
- Context-aware follow-ups
- Citation links to original Q&As
- Share conversation

**Smart Features**:
- Auto-suggest related questions
- Multi-turn conversations
- Arabic language support
- "Explain like I'm 5" mode

### 5.4 Cost & Infrastructure

**Challenges**:
- API costs (Claude API ~$0.01/request)
- Server hosting costs
- Rate limiting
- Abuse prevention

**Solutions**:
- Free tier: 10 questions/day
- Donation model for unlimited
- Cache common questions
- Anonymous rate limiting

### 5.5 Success Criteria (TBD)
- [ ] RAG system retrieving relevant Q&As
- [ ] Claude generating accurate answers
- [ ] Citations working
- [ ] Cost < $100/month for 10k users
- [ ] <5s response time
- [ ] User satisfaction > 4/5

**Deliverable**: AI chat feature for natural language Q&A

---

## Phase 6: Content Updates & Sync (Future)

**Goal**: System for updating Q&A database

### 6.1 Content Pipeline

**Current**: Static JS files bundled in app

**Future**:
1. **Pre-populated SQLite** - Ship database file, no import needed
2. **Delta Updates** - Download only new/changed Q&As
3. **API-based** - Fetch latest content from server

### 6.2 Update Mechanism

```javascript
// Check for updates on app launch
async function checkForUpdates() {
  const currentVersion = localStorage.getItem('db_version')
  const latestVersion = await fetch('https://api.betterislamqa.com/version')

  if (latestVersion > currentVersion) {
    // Download delta file
    const updates = await fetch(`https://api.betterislamqa.com/updates/${currentVersion}`)

    // Apply to SQLite
    await applyUpdates(updates)

    localStorage.setItem('db_version', latestVersion)
  }
}
```

### 6.3 Content Management

**Admin Dashboard** (separate project):
- Web interface for content updates
- Add/edit/delete Q&As
- Generate delta files
- Publish updates

---

## Migration Strategy & Risk Mitigation

### Phased Rollout

**Phase 1-2**: Internal testing only
**Phase 3**: Closed beta (100 users)
**Phase 4**: Open beta (1000 users)
**Phase 4**: Production release

### Data Migration

**User Data**:
- Export bookmarks from old version
- Import into new version on first launch
- Backward compatible database

### Rollback Plan

- Keep old version published during beta
- Feature flags for new features
- A/B testing for quiz features

### Known Risks

| Risk | Mitigation |
|------|------------|
| Performance worse than old app | Extensive profiling, virtual scrolling |
| Users dislike new UI | User testing, iterate on feedback |
| Database migration fails | Extensive testing, rollback mechanism |
| Quiz generation quality poor | Manual curation, user feedback loop |
| Development takes too long | Cut scope, ship MVP first |

---

## Technical Debt Cleanup

### Immediate (Phase 1)
- Remove jQuery dependency
- Remove Handlebars dependency
- Remove custom ViewNavigator
- Modernize build system
- Remove unused plugins

### Phase 2
- Rewrite all database queries with modern API
- Implement proper error handling
- Add logging/analytics

### Phase 3
- Add tests
- Document architecture
- Code review process

### Future
- Migrate from JS data files to better format
- Implement CI/CD pipeline
- Automated releases

---

## Success Metrics

### Technical Metrics
- **App size**: <20MB (current: unknown, likely >50MB)
- **Startup time**: <3s (current: likely >5s)
- **Crash rate**: <1% (current: unknown)
- **Performance**: 60fps scrolling

### User Metrics
- **Retention**: 40% D7 retention (current: unknown)
- **Engagement**: 5+ min session time
- **Quiz completion**: 50% of users try quiz
- **Bookmarks**: 2+ bookmarks per user
- **Ratings**: 4.5+ stars (current: unknown)

### Business Metrics
- **Installs**: Maintain or grow current base (10-20k)
- **Reviews**: Positive sentiment increase
- **Bug reports**: 50% reduction
- **Development velocity**: 2x faster features

---

## Resource Requirements

### Development Team
- **1 Full-stack developer** (you) - 20-30 hrs/week
- **Optional: 1 Designer** - UI/UX design (contract)
- **Optional: 1 QA tester** - Beta testing coordination

### Infrastructure
- **Development**: Local machine, Android/iOS emulators
- **Testing**: 2-3 physical devices (old + new Android/iOS)
- **Production**: Apple Developer ($99/year), Google Play ($25 one-time)
- **Future (AI)**: API server hosting ($20-50/month)

### Timeline
- **Phase 1**: 4 weeks
- **Phase 2**: 4 weeks
- **Phase 3**: 4 weeks
- **Phase 4**: 4 weeks
- **Total**: 16 weeks (4 months) for core modernization
- **Phase 5 (AI)**: 6-8 weeks additional

---

## Getting Started: Next Steps

### Week 1 Action Items
1. **Setup Development Environment**
   - Install Node 20+, Yarn
   - Setup Android Studio / Xcode
   - Clone repo to new branch

2. **Create Vite + Vue + Cordova Boilerplate**
   - Initialize Vite project
   - Configure vite-plugin-cordova
   - Test build pipeline

3. **Migrate Database Layer**
   - Create modern DatabaseService
   - Test SQLite operations
   - Verify data import works

4. **Create Basic Vue Components**
   - App shell
   - Category list (minimal)
   - Verify navigation

5. **Checkpoint**: Can you view category list in new Vue app?

### Decision Points
- [ ] Approve this plan or request changes
- [ ] Confirm technology choices (Vue 3, Vite, TailwindCSS)
- [ ] Agree on UI design approach (review examples)
- [ ] Decide on beta testing strategy
- [ ] Prioritize features (anything to cut/defer?)

---

## Questions for You

Before I start implementation:

1. **Timeline**: Is 4 months realistic for your availability? Should we go faster/slower?

2. **Design**: Do you have any design preferences or apps you want to emulate? (e.g., Duolingo for gamification, Notion for UI)

3. **Features**: Any features in the current app that are underused and can be cut?

4. **Beta Testing**: Can you recruit 10-20 users for beta testing in Phase 3?

5. **Content Updates**: How important is the ability to update Q&A content remotely? (affects priorities)

6. **Arabic Support**: How much Arabic text is in the answers? Do we need RTL layout support?

7. **Analytics**: Do you want usage analytics (privacy-respecting, optional)? Helps with product decisions.

---

## Appendix: Alternative Approaches Considered

### Why NOT React Native or Flutter?
- **Learning curve**: You're already familiar with web tech
- **Migration cost**: Complete rewrite vs. iterative modernization
- **Cordova mature**: Works well for this use case
- **Decision**: Stick with web tech, modernize incrementally

### Why NOT ship pre-populated SQLite?
- **Phase 1 priority**: Get architecture right first
- **Backward compatibility**: Existing users have data
- **Future optimization**: Do this in Phase 6
- **Decision**: Keep current data loading, optimize later

### Why Fuse.js vs. Full-Text Search?
- **FTS available**: SQLite has FTS5, could use that
- **Trade-off**: Fuse.js more flexible, works in-memory
- **Decision**: Start with Fuse.js, can add FTS later

---

## Conclusion

This modernization plan takes your 10-year-old app and transforms it into a modern, engaging Islamic Q&A platform while preserving the core offline-first value proposition.

The phased approach ensures:
- ✅ Continuous progress (ship working software every phase)
- ✅ Risk mitigation (can roll back at any phase)
- ✅ Learning loops (user feedback shapes next phases)
- ✅ Manageable scope (each phase is 4 weeks)

**The plan is ambitious but achievable.** Let's discuss any concerns and then get started!

---

**Next Step**: Review this plan, ask questions, then I'll start with Phase 1 setup.
